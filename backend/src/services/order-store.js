import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { getMongoDb, isMongoEnabled } from "./db.js";

const dataDir = path.resolve(process.cwd(), "data");
const ordersFile = path.join(dataDir, "orders.json");

const ensureStore = async () => {
  await mkdir(dataDir, { recursive: true });

  try {
    await readFile(ordersFile, "utf8");
  } catch {
    await writeFile(ordersFile, "[]", "utf8");
  }
};

const readOrders = async () => {
  await ensureStore();
  const raw = await readFile(ordersFile, "utf8");
  const clean = raw.replace(/^\uFEFF/, "").trim();
  return JSON.parse(clean || "[]");
};

const writeOrders = async (orders) => {
  await writeFile(ordersFile, JSON.stringify(orders, null, 2), "utf8");
};

const mapMongoOrder = (order) => {
  if (!order) return null;
  const { _id, ...rest } = order;
  return rest;
};

const getOrdersCollection = async () => {
  const db = await getMongoDb();
  if (!db) return null;
  return db.collection("orders");
};

export const saveOrder = async (order) => {
  const collection = await getOrdersCollection();

  if (collection && isMongoEnabled()) {
    await collection.insertOne(order);
    return order;
  }

  const orders = await readOrders();
  orders.unshift(order);
  await writeOrders(orders);
  return order;
};

export const listOrders = async ({ status, paymentMethod, limit = 100 } = {}) => {
  const collection = await getOrdersCollection();

  if (collection && isMongoEnabled()) {
    const query = {};
    if (status) query.status = status;
    if (paymentMethod) query.paymentMethod = paymentMethod;

    const docs = await collection
      .find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .toArray();

    return docs.map(mapMongoOrder);
  }

  const orders = await readOrders();

  return orders
    .filter((order) => {
      if (status && order.status !== status) {
        return false;
      }
      if (paymentMethod && order.paymentMethod !== paymentMethod) {
        return false;
      }
      return true;
    })
    .slice(0, Number(limit));
};

export const findOrderById = async (orderId) => {
  const collection = await getOrdersCollection();

  if (collection && isMongoEnabled()) {
    const doc = await collection.findOne({ id: orderId });
    return mapMongoOrder(doc);
  }

  const orders = await readOrders();
  return orders.find((order) => order.id === orderId) || null;
};

export const updateOrder = async (orderId, patch) => {
  const collection = await getOrdersCollection();

  if (collection && isMongoEnabled()) {
    const updatedOrder = {
      ...patch,
      updatedAt: new Date().toISOString(),
    };

    const result = await collection.findOneAndUpdate(
      { id: orderId },
      { $set: updatedOrder },
      { returnDocument: "after" }
    );

    return mapMongoOrder(result.value);
  }

  const orders = await readOrders();
  const index = orders.findIndex((order) => order.id === orderId);

  if (index === -1) {
    return null;
  }

  const updated = {
    ...orders[index],
    ...patch,
    updatedAt: new Date().toISOString(),
  };

  orders[index] = updated;
  await writeOrders(orders);
  return updated;
};

export const createOrderId = () => {
  return `ORD-${Date.now()}-${Math.floor(Math.random() * 9000 + 1000)}`;
};
