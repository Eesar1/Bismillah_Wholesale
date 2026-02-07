import { Router } from "express";
import { createOrderId, saveOrder, listOrders, updateOrder } from "../services/order-store.js";
import { queueOrderEmails } from "../services/mailer.js";
import { reserveInventoryForOrder } from "../services/inventory-store.js";
import { requireAdminAuth } from "../middleware/admin-auth.js";

const router = Router();

const validPaymentMethods = ["cod", "jazzcash", "easypaisa", "card"];
const validStatuses = [
  "pending",
  "awaiting_payment",
  "paid",
  "processing",
  "shipping",
  "shipped",
  "completed",
  "cancelled",
];

const calcTotal = (items) => {
  return items.reduce((sum, item) => {
    const price = Number(item?.product?.price || 0);
    const qty = Number(item?.quantity || 0);
    return sum + price * qty;
  }, 0);
};

router.get("/", requireAdminAuth, async (req, res) => {
  try {
    const { status, paymentMethod, limit } = req.query;

    const orders = await listOrders({
      status: typeof status === "string" ? status : undefined,
      paymentMethod: typeof paymentMethod === "string" ? paymentMethod : undefined,
      limit: limit ? Number(limit) : 100,
    });

    return res.json({ orders });
  } catch (error) {
    console.error("List orders error:", error);
    return res.status(500).json({ message: "Failed to fetch orders." });
  }
});

router.patch("/:orderId/status", requireAdminAuth, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid order status." });
    }

    const updated = await updateOrder(orderId, { status });

    if (!updated) {
      return res.status(404).json({ message: "Order not found." });
    }

    if (status !== "pending") {
      await queueOrderEmails(updated, status.replace("_", " ").toUpperCase());
    }

    return res.json({ order: updated });
  } catch (error) {
    console.error("Update order status error:", error);
    return res.status(500).json({ message: "Failed to update order status." });
  }
});

router.post("/offline", async (req, res) => {
  try {
    const { items, customer, paymentMethod } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Order items are required." });
    }

    if (!customer?.fullName || !customer?.email || !customer?.phone || !customer?.address || !customer?.zipCode) {
      return res.status(400).json({ message: "Customer details are incomplete." });
    }

    if (!validPaymentMethods.includes(paymentMethod) || paymentMethod === "card") {
      return res.status(400).json({ message: "Invalid payment method." });
    }

    await reserveInventoryForOrder(items);

    const order = {
      id: createOrderId(),
      paymentMethod,
      customer,
      items,
      total: calcTotal(items),
      createdAt: new Date().toISOString(),
      status: "pending",
    };

    await saveOrder(order);

    await queueOrderEmails(order);

    return res.status(201).json({ orderId: order.id });
  } catch (error) {
    console.error("Offline order error:", error);

    if (error instanceof Error && error.message.toLowerCase().includes("sold out")) {
      return res.status(409).json({ message: error.message });
    }

    return res.status(500).json({ message: error.message || "Failed to process order." });
  }
});

export default router;
