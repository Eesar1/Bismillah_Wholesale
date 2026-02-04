import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { getMongoDb, isMongoEnabled } from "./db.js";

const dataDir = path.resolve(process.cwd(), "data");
const inventoryFile = path.join(dataDir, "inventory.json");

const defaultInventory = [
  { id: "j1", name: "Diamond Teardrop Necklace", stockQuantity: 50, inStock: true },
  { id: "j2", name: "Golden Infinity Bracelet", stockQuantity: 75, inStock: true },
  { id: "j3", name: "Emerald & Sapphire Earrings", stockQuantity: 40, inStock: true },
  { id: "j4", name: "Diamond Halo Ring", stockQuantity: 30, inStock: true },
  { id: "j5", name: "Charm Anklet Collection", stockQuantity: 100, inStock: true },
  { id: "j6", name: "Pearl & Gemstone Brooch", stockQuantity: 60, inStock: true },
  { id: "j7", name: "Cuban Link Chain", stockQuantity: 25, inStock: true },
  { id: "c1", name: "Gold Embroidered Evening Gown", stockQuantity: 35, inStock: true },
  { id: "c2", name: "Gold Button Blazer", stockQuantity: 80, inStock: true },
  { id: "c3", name: "Gold Embroidered Silk Blouse", stockQuantity: 100, inStock: true },
  { id: "c4", name: "Gold & Black Evening Clutch", stockQuantity: 120, inStock: true },
];

const nowIso = () => new Date().toISOString();

const parseJson = (raw) => {
  const clean = raw.replace(/^\uFEFF/, "").trim();
  return JSON.parse(clean || "[]");
};

const normalizeInventory = (inventory) => {
  return inventory.map((item) => {
    const stockQuantity = Math.max(0, Number(item?.stockQuantity || 0));
    return {
      ...item,
      stockQuantity,
      inStock: stockQuantity > 0,
    };
  });
};

const ensureFileStore = async () => {
  await mkdir(dataDir, { recursive: true });

  try {
    await readFile(inventoryFile, "utf8");
  } catch {
    const seeded = defaultInventory.map((item) => ({
      ...item,
      updatedAt: nowIso(),
    }));
    await writeFile(inventoryFile, JSON.stringify(seeded, null, 2), "utf8");
  }
};

const writeFileInventory = async (inventory) => {
  await writeFile(inventoryFile, JSON.stringify(inventory, null, 2), "utf8");
};

const readFileInventory = async () => {
  await ensureFileStore();
  const raw = await readFile(inventoryFile, "utf8");
  const parsed = parseJson(raw);
  const normalized = normalizeInventory(parsed);

  if (JSON.stringify(parsed) !== JSON.stringify(normalized)) {
    await writeFileInventory(normalized);
  }

  return normalized;
};

const mapMongoInventory = (item) => {
  if (!item) return null;
  const { _id, ...rest } = item;
  return rest;
};

const getInventoryCollection = async () => {
  const db = await getMongoDb();
  if (!db) return null;
  return db.collection("inventory");
};

const ensureMongoStore = async (collection) => {
  const count = await collection.countDocuments();

  if (count > 0) {
    return;
  }

  const seeded = defaultInventory.map((item) => ({
    ...item,
    updatedAt: nowIso(),
  }));

  await collection.insertMany(seeded);
};

const readMongoInventory = async () => {
  const collection = await getInventoryCollection();
  await ensureMongoStore(collection);

  const docs = await collection.find({}).toArray();
  const mapped = docs.map(mapMongoInventory);
  const normalized = normalizeInventory(mapped);

  const bulkOps = normalized.map((item) => ({
    updateOne: {
      filter: { id: item.id },
      update: { $set: { stockQuantity: item.stockQuantity, inStock: item.inStock } },
    },
  }));

  if (bulkOps.length > 0) {
    await collection.bulkWrite(bulkOps, { ordered: false });
  }

  return normalized;
};

const readInventory = async () => {
  if (isMongoEnabled()) {
    return readMongoInventory();
  }

  return readFileInventory();
};

const writeInventory = async (inventory) => {
  if (isMongoEnabled()) {
    const collection = await getInventoryCollection();
    const bulkOps = inventory.map((item) => ({
      updateOne: {
        filter: { id: item.id },
        update: { $set: item },
        upsert: true,
      },
    }));

    if (bulkOps.length > 0) {
      await collection.bulkWrite(bulkOps, { ordered: false });
    }

    return;
  }

  await writeFileInventory(inventory);
};

const getIncomingProductSeed = (item) => {
  const id = item?.product?.id;
  if (!id) {
    return null;
  }

  const requestedStock = Number(item?.product?.stockQuantity || 0);

  return {
    id,
    name: item?.product?.name || id,
    stockQuantity: Math.max(0, requestedStock),
    inStock: requestedStock > 0,
    updatedAt: nowIso(),
  };
};

export const listInventory = async () => {
  return readInventory();
};

export const getInventoryById = async (id) => {
  const inventory = await readInventory();
  return inventory.find((item) => item.id === id) || null;
};

export const getAvailabilityMap = async () => {
  const inventory = await readInventory();

  return inventory.reduce((acc, item) => {
    const stockQuantity = Math.max(0, Number(item.stockQuantity || 0));
    acc[item.id] = {
      inStock: stockQuantity > 0,
      stockQuantity,
    };
    return acc;
  }, {});
};

export const reserveInventoryForOrder = async (items) => {
  const inventory = await readInventory();
  const inventoryMap = new Map(inventory.map((item) => [item.id, item]));
  const requested = [];
  const unavailable = [];

  for (const item of items) {
    const productId = item?.product?.id;
    const quantity = Number(item?.quantity || 0);

    if (!productId || quantity <= 0) {
      continue;
    }

    let productInventory = inventoryMap.get(productId);

    if (!productInventory) {
      const seeded = getIncomingProductSeed(item);
      if (seeded) {
        inventory.push(seeded);
        inventoryMap.set(seeded.id, seeded);
        productInventory = seeded;
      }
    }

    const availableStock = Math.max(0, Number(productInventory?.stockQuantity || 0));
    const isAvailable = availableStock >= quantity;

    if (!isAvailable) {
      unavailable.push(item?.product?.name || productId);
      continue;
    }

    requested.push({
      productId,
      quantity,
    });
  }

  if (unavailable.length > 0) {
    throw new Error(`Some items are sold out: ${unavailable.join(", ")}`);
  }

  for (const entry of requested) {
    const productInventory = inventoryMap.get(entry.productId);
    const nextStock = Math.max(0, Number(productInventory.stockQuantity || 0) - entry.quantity);

    productInventory.stockQuantity = nextStock;
    productInventory.inStock = nextStock > 0;
    productInventory.updatedAt = nowIso();
  }

  await writeInventory(inventory);

  return getAvailabilityMap();
};
