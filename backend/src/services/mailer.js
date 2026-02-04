import { access } from "node:fs/promises";
import path from "node:path";
import nodemailer from "nodemailer";

const resolvePublicDir = () => {
  const frontendPublic = path.resolve(process.cwd(), "..", "frontend", "public");
  const appPublic = path.resolve(process.cwd(), "..", "app", "public");
  return { frontendPublic, appPublic };
};

const buildTransport = () => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    connectionTimeout: 5000,
    greetingTimeout: 5000,
    socketTimeout: 10000,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
};

const getFrontendUrl = () => (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");

const toAbsoluteUrl = (value) => {
  if (!value) {
    return "";
  }

  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  const normalizedPath = value.startsWith("/") ? value : `/${value}`;
  return `${getFrontendUrl()}${normalizedPath}`;
};

const escapeHtml = (value) => {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
};

const formatPkr = (amount) => `PKR ${Number(amount || 0).toLocaleString("en-PK")}`;

const normalizeLocalPath = (value) => {
  if (!value) {
    return [];
  }

  if (value.startsWith("http://") || value.startsWith("https://")) {
    return [];
  }

  const trimmed = value.replace(/^\/+/, "");
  const { frontendPublic, appPublic } = resolvePublicDir();

  return [
    path.resolve(frontendPublic, trimmed),
    path.resolve(appPublic, trimmed),
  ];
};

const resolveImageSrc = async (value, attachments, cidMap, cidPrefix) => {
  if (!value) {
    return "";
  }

  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  const localPaths = normalizeLocalPath(value);

  for (const candidatePath of localPaths) {
    try {
      await access(candidatePath);

      if (cidMap.has(candidatePath)) {
        return `cid:${cidMap.get(candidatePath)}`;
      }

      const cid = `${cidPrefix}-${cidMap.size + 1}@bismillah`;
      cidMap.set(candidatePath, cid);

      attachments.push({
        filename: path.basename(candidatePath),
        path: candidatePath,
        cid,
        contentDisposition: "inline",
      });

      return `cid:${cid}`;
    } catch {
      // try next candidate
    }
  }

  return toAbsoluteUrl(value);
};

const serializeItemsText = (items) => {
  return items
    .map((item) => {
      const lineTotal = Number(item.product.price || 0) * Number(item.quantity || 0);
      return `${item.product.name} x ${item.quantity} = ${formatPkr(lineTotal)}`;
    })
    .join("\n");
};

const buildItemsTableHtml = async (items, attachments, cidMap) => {
  const rows = await Promise.all(
    items.map(async (item) => {
      const quantity = Number(item.quantity || 0);
      const price = Number(item.product.price || 0);
      const lineTotal = price * quantity;
      const imageSrc = await resolveImageSrc(item.product.image || item.product.images?.[0], attachments, cidMap, "product");

      return `
        <tr>
          <td style="padding:10px 8px;border-bottom:1px solid #2c2c2c;vertical-align:top;">
            ${
              imageSrc
                ? `<img src="${escapeHtml(imageSrc)}" alt="${escapeHtml(item.product.name)}" width="64" height="64" style="display:block;border:1px solid #d4af37;border-radius:4px;object-fit:cover;" />`
                : `<div style="width:64px;height:64px;border:1px solid #d4af37;border-radius:4px;background:#111;color:#999;font-size:11px;display:flex;align-items:center;justify-content:center;">No Image</div>`
            }
          </td>
          <td style="padding:10px 8px;border-bottom:1px solid #2c2c2c;vertical-align:top;color:#f3f3f3;font-size:14px;line-height:1.4;">
            <div style="font-weight:600;">${escapeHtml(item.product.name)}</div>
            <div style="color:#bdbdbd;">Qty: ${quantity}</div>
            <div style="color:#bdbdbd;">Unit: ${escapeHtml(formatPkr(price))}</div>
          </td>
          <td style="padding:10px 8px;border-bottom:1px solid #2c2c2c;vertical-align:top;text-align:right;color:#d4af37;font-weight:700;font-size:14px;white-space:nowrap;">
            ${escapeHtml(formatPkr(lineTotal))}
          </td>
        </tr>
      `;
    })
  );

  return rows.join("");
};

const getBrandHeaderHtml = async (attachments, cidMap) => {
  const configuredLogo = process.env.BRAND_LOGO_URL;
  const logoSrc = configuredLogo ? await resolveImageSrc(configuredLogo, attachments, cidMap, "logo") : "";

  if (logoSrc) {
    return `
      <div style="text-align:center;margin-bottom:18px;">
        <img src="${escapeHtml(logoSrc)}" alt="Bismillah Wholesale" width="120" height="120" style="max-width:120px;height:auto;display:inline-block;" />
      </div>
    `;
  }

  return `
    <div style="text-align:center;margin-bottom:18px;">
      <div style="font-family:Georgia,serif;font-weight:700;letter-spacing:1px;font-size:24px;color:#d4af37;">BISMILLAH</div>
      <div style="font-size:11px;letter-spacing:4px;color:#b8b8b8;">WHOLESALE</div>
    </div>
  `;
};

const wrapTemplate = ({ title, subtitle, bodyHtml, brandHeaderHtml }) => {
  return `
    <div style="background:#0b0b0b;padding:24px 12px;font-family:Arial,sans-serif;">
      <div style="max-width:680px;margin:0 auto;background:#121212;border:1px solid #d4af37;border-radius:8px;padding:24px 18px;">
        ${brandHeaderHtml}
        <h2 style="margin:0 0 8px;color:#f7f7f7;font-size:24px;text-align:center;">${escapeHtml(title)}</h2>
        <p style="margin:0 0 18px;color:#c7c7c7;font-size:14px;text-align:center;line-height:1.6;">${escapeHtml(subtitle)}</p>
        ${bodyHtml}
      </div>
    </div>
  `;
};

const getCustomerStatusCopy = (status) => {
  if (status === "completed") {
    return {
      title: "Order Delivered",
      subtitle: "Your order has been marked as completed. Thank you for shopping with us.",
      subject: "Your order has been completed",
    };
  }

  if (status === "paid") {
    return {
      title: "Payment Confirmed",
      subtitle: "Your payment has been received and your order is now being prepared.",
      subject: "Payment received for your order",
    };
  }

  return {
    title: "Order Received",
    subtitle: "Thanks for shopping with Bismillah Wholesale. We received your order and will contact you shortly.",
    subject: "Thanks for your order",
  };
};

const isTransientMailError = (error) => {
  const code = String(error?.code || "");
  return code === "ECONNRESET" || code === "ETIMEDOUT" || code === "ESOCKET";
};

const sendWithRetry = async (transporter, mailOptions, retries = 1) => {
  let attempt = 0;
  let lastError;

  while (attempt <= retries) {
    try {
      return await transporter.sendMail(mailOptions);
    } catch (error) {
      lastError = error;
      if (!isTransientMailError(error) || attempt === retries) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, 800));
    }
    attempt += 1;
  }

  throw lastError;
};

export const sendOrderEmails = async (order, subjectPrefix = "New") => {
  const transporter = buildTransport();
  const adminEmail = process.env.ORDER_NOTIFY_EMAIL;

  if (!transporter || !adminEmail) {
    return;
  }

  try {
    const attachments = [];
    const cidMap = new Map();

    const linesText = serializeItemsText(order.items);
    const itemsTableHtml = await buildItemsTableHtml(order.items, attachments, cidMap);
    const brandHeaderHtml = await getBrandHeaderHtml(attachments, cidMap);
    const total = formatPkr(order.total);
    const placedAt = new Date(order.createdAt || Date.now()).toLocaleString();
    const customerState = getCustomerStatusCopy(order.status);

    const orderMetaHtml = `
      <table width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin-bottom:16px;background:#0f0f0f;border:1px solid #2c2c2c;">
        <tr>
          <td style="padding:10px 12px;color:#bdbdbd;font-size:13px;">Order ID</td>
          <td style="padding:10px 12px;color:#f3f3f3;font-size:13px;font-weight:600;text-align:right;">${escapeHtml(order.id)}</td>
        </tr>
        <tr>
          <td style="padding:10px 12px;color:#bdbdbd;font-size:13px;">Placed At</td>
          <td style="padding:10px 12px;color:#f3f3f3;font-size:13px;text-align:right;">${escapeHtml(placedAt)}</td>
        </tr>
        <tr>
          <td style="padding:10px 12px;color:#bdbdbd;font-size:13px;">Payment</td>
          <td style="padding:10px 12px;color:#f3f3f3;font-size:13px;text-align:right;">${escapeHtml(order.paymentMethod.toUpperCase())}</td>
        </tr>
        <tr>
          <td style="padding:10px 12px;color:#bdbdbd;font-size:13px;">Status</td>
          <td style="padding:10px 12px;color:#f3f3f3;font-size:13px;text-align:right;">${escapeHtml(order.status)}</td>
        </tr>
      </table>
    `;

    const customerDetailsHtml = `
      <div style="margin-bottom:16px;padding:12px;background:#0f0f0f;border:1px solid #2c2c2c;">
        <div style="color:#d4af37;font-size:13px;font-weight:700;margin-bottom:8px;">Shipping Details</div>
        <div style="color:#d7d7d7;font-size:13px;line-height:1.6;">
          ${escapeHtml(order.customer.fullName)}<br/>
          ${escapeHtml(order.customer.phone)}<br/>
          ${escapeHtml(order.customer.email)}<br/>
          ${escapeHtml(order.customer.address)}<br/>
          ZIP: ${escapeHtml(order.customer.zipCode)}
        </div>
      </div>
    `;

    const itemsHtml = `
      <div style="margin-bottom:16px;">
        <div style="color:#d4af37;font-size:13px;font-weight:700;margin-bottom:8px;">Order Items</div>
        <table width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;background:#0f0f0f;border:1px solid #2c2c2c;">
          ${itemsTableHtml}
          <tr>
            <td colspan="2" style="padding:12px 8px;text-align:right;color:#f3f3f3;font-weight:700;border-top:1px solid #2c2c2c;">Total</td>
            <td style="padding:12px 8px;text-align:right;color:#d4af37;font-weight:700;border-top:1px solid #2c2c2c;white-space:nowrap;">${escapeHtml(total)}</td>
          </tr>
        </table>
      </div>
    `;

    const adminHtml = wrapTemplate({
      title: "New Order Request",
      subtitle: "A customer placed an order. Full details are below.",
      brandHeaderHtml,
      bodyHtml: `
        ${orderMetaHtml}
        <div style="margin-bottom:16px;padding:12px;background:#0f0f0f;border:1px solid #2c2c2c;">
          <div style="color:#d4af37;font-size:13px;font-weight:700;margin-bottom:8px;">Customer Details</div>
          <div style="color:#d7d7d7;font-size:13px;line-height:1.6;">
            ${escapeHtml(order.customer.fullName)}<br/>
            ${escapeHtml(order.customer.phone)}<br/>
            ${escapeHtml(order.customer.email)}<br/>
            ${escapeHtml(order.customer.address)}<br/>
            ZIP: ${escapeHtml(order.customer.zipCode)}
          </div>
        </div>
        ${itemsHtml}
      `,
    });

    const customerHtml = wrapTemplate({
      title: customerState.title,
      subtitle: customerState.subtitle,
      brandHeaderHtml,
      bodyHtml: `${orderMetaHtml}${customerDetailsHtml}${itemsHtml}`,
    });

    await sendWithRetry(transporter, {
      from: process.env.SMTP_USER,
      to: adminEmail,
      subject: `[${subjectPrefix} ${order.paymentMethod.toUpperCase()} Order] ${order.id}`,
      text: `New order request received.\n\nOrder ID: ${order.id}\nPlaced At: ${placedAt}\nPayment: ${order.paymentMethod.toUpperCase()}\nStatus: ${order.status}\n\nCustomer Details\nName: ${order.customer.fullName}\nEmail: ${order.customer.email}\nPhone: ${order.customer.phone}\nAddress: ${order.customer.address}\nZIP: ${order.customer.zipCode}\n\nOrder Items\n${linesText}\n\nTotal: ${total}`,
      html: adminHtml,
      attachments,
    });

    if (order.customer.email) {
      await sendWithRetry(transporter, {
        from: process.env.SMTP_USER,
        to: order.customer.email,
        subject: `${customerState.subject} - ${order.id}`,
        text: `Hi ${order.customer.fullName},\n\n${customerState.subtitle}\n\nOrder ID: ${order.id}\nPlaced At: ${placedAt}\nPayment Method: ${order.paymentMethod.toUpperCase()}\nStatus: ${order.status}\n\nShipping Details\nName: ${order.customer.fullName}\nPhone: ${order.customer.phone}\nAddress: ${order.customer.address}\nZIP: ${order.customer.zipCode}\n\nOrder Items\n${linesText}\n\nOrder Total: ${total}\n\nRegards,\nBismillah Wholesale`,
        html: customerHtml,
        attachments,
      });
    }
  } catch (error) {
    console.error("Email delivery failed:", error?.message || error);
  }
};

export const queueOrderEmails = async (order, subjectPrefix = "New") => {
  // Serverless runtimes may stop immediately after response, so send inline on Vercel.
  if (process.env.VERCEL === "1") {
    await sendOrderEmails(order, subjectPrefix);
    return;
  }

  setImmediate(() => {
    void sendOrderEmails(order, subjectPrefix);
  });
};

