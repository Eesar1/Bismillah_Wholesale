import "dotenv/config";
import express from "express";
import cors from "cors";
import ordersRouter from "./routes/orders.js";
import stripeRouter from "./routes/stripe.js";
import productsRouter from "./routes/products.js";

const app = express();
const port = Number(process.env.PORT || 5000);

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
].filter(Boolean);

const isLocalhostOrigin = (origin) => {
  try {
    const parsed = new URL(origin);
    return parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1";
  } catch {
    return false;
  }
};

const isVercelPreviewOrigin = (origin) => {
  try {
    const parsed = new URL(origin);
    return parsed.hostname.endsWith(".vercel.app");
  } catch {
    return false;
  }
};

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || isLocalhostOrigin(origin) || isVercelPreviewOrigin(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error("CORS blocked for origin: " + origin));
    },
  })
);

app.use("/api/stripe/webhook", express.raw({ type: "application/json" }));
app.use(express.json({ limit: "2mb" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/orders", ordersRouter);
app.use("/api/stripe", stripeRouter);
app.use("/api/products", productsRouter);

app.use((err, _req, res, _next) => {
  console.error("API error:", err.message);
  res.status(500).json({ message: err.message || "Internal server error" });
});

if (process.env.VERCEL !== "1") {
  app.listen(port, () => {
    console.log(`API running on http://localhost:${port}`);
  });
}

export default app;
