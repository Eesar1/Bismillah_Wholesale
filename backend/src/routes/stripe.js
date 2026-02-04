import { Router } from "express";
import Stripe from "stripe";
import { createOrderId, saveOrder, updateOrder, findOrderById } from "../services/order-store.js";
import { queueOrderEmails } from "../services/mailer.js";
import { reserveInventoryForOrder } from "../services/inventory-store.js";

const router = Router();

const getStripe = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is missing.");
  }

  return new Stripe(secretKey);
};

const normalizeImageUrl = (image) => {
  if (!image) {
    return undefined;
  }

  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }

  const frontendBase = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");
  const normalizedPath = image.startsWith("/") ? image : `/${image}`;

  return `${frontendBase}${normalizedPath}`;
};

const calculateTotal = (items) => {
  return items.reduce((sum, item) => sum + Number(item.product.price || 0) * Number(item.quantity || 0), 0);
};

const getFrontendUrl = () => (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");

router.post("/create-checkout-session", async (req, res) => {
  try {
    const { items, customer } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Order items are required." });
    }

    if (!customer?.fullName || !customer?.email || !customer?.phone || !customer?.address || !customer?.zipCode) {
      return res.status(400).json({ message: "Customer details are incomplete." });
    }

    const stripe = getStripe();
    const orderId = createOrderId();

    const order = {
      id: orderId,
      paymentMethod: "card",
      customer,
      items,
      total: calculateTotal(items),
      createdAt: new Date().toISOString(),
      status: "awaiting_payment",
    };

    await saveOrder(order);

    const lineItems = items.map((item) => {
      const imageUrl = normalizeImageUrl(item.product.image);

      return {
        quantity: Number(item.quantity || 1),
        price_data: {
          currency: process.env.STRIPE_CURRENCY || "pkr",
          unit_amount: Math.round(Number(item.product.price || 0) * 100),
          product_data: {
            name: item.product.name,
            ...(imageUrl ? { images: [imageUrl] } : {}),
          },
        },
      };
    });

    const frontendUrl = getFrontendUrl();

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: customer.email,
      line_items: lineItems,
      success_url: process.env.STRIPE_SUCCESS_URL || `${frontendUrl}/?checkout=success&orderId=${orderId}`,
      cancel_url: process.env.STRIPE_CANCEL_URL || `${frontendUrl}/?checkout=cancelled&orderId=${orderId}`,
      metadata: {
        orderId,
      },
    });

    await updateOrder(orderId, {
      stripeSessionId: session.id,
      stripePaymentStatus: session.payment_status,
    });

    return res.status(201).json({ url: session.url, orderId });
  } catch (error) {
    console.error("Stripe checkout session error:", error);
    return res.status(500).json({ message: error.message || "Failed to create Stripe checkout session." });
  }
});

router.post("/webhook", async (req, res) => {
  try {
    const stripe = getStripe();
    const signature = req.headers["stripe-signature"];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret || !signature) {
      return res.status(400).send("Webhook secret/signature missing.");
    }

    const event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const orderId = session.metadata?.orderId;

      if (orderId) {
        const existingOrder = await findOrderById(orderId);

        try {
          if (existingOrder) {
            await reserveInventoryForOrder(existingOrder.items);
          }
        } catch (error) {
          await updateOrder(orderId, {
            status: "cancelled",
            stripePaymentStatus: session.payment_status,
            cancelReason: error?.message || "Inventory unavailable",
          });
          return res.json({ received: true });
        }

        const updated = await updateOrder(orderId, {
          status: "paid",
          stripeSessionId: session.id,
          stripePaymentIntentId: session.payment_intent,
          stripePaymentStatus: session.payment_status,
          paidAt: new Date().toISOString(),
        });

        if (updated) {
          queueOrderEmails(updated, "Paid");
        }
      }
    }

    if (event.type === "checkout.session.expired") {
      const session = event.data.object;
      const orderId = session.metadata?.orderId;

      if (orderId) {
        await updateOrder(orderId, {
          status: "cancelled",
          stripePaymentStatus: session.payment_status,
        });
      }
    }

    return res.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook error:", error);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }
});

router.get("/session/:sessionId", async (req, res) => {
  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);
    const orderId = session.metadata?.orderId;

    const order = orderId ? await findOrderById(orderId) : null;

    return res.json({
      sessionId: session.id,
      paymentStatus: session.payment_status,
      order,
    });
  } catch (error) {
    console.error("Get Stripe session error:", error);
    return res.status(500).json({ message: "Failed to fetch Stripe session." });
  }
});

export default router;
