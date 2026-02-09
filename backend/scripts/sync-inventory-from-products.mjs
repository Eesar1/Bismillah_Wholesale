import "dotenv/config";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getMongoDb, isMongoEnabled } from "../src/services/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const productsFilePath = path.resolve(__dirname, "../../frontend/src/data/products.ts");

const stripLineComments = (source) =>
  source
    .split("\n")
    .filter((line) => !line.trimStart().startsWith("//"))
    .join("\n");

const extractProductsArrayContent = (source) => {
  const match = source.match(/export const products:[\s\S]*?=\s*\[([\s\S]*?)\];/);
  if (!match) {
    throw new Error("Could not find `products` array in frontend/src/data/products.ts");
  }
  return match[1];
};

const extractObjectBlocks = (source) => {
  const blocks = [];
  let depth = 0;
  let startIndex = -1;
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let escaped = false;

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];

    if (inSingleQuote || inDoubleQuote) {
      if (escaped) {
        escaped = false;
        continue;
      }

      if (char === "\\") {
        escaped = true;
        continue;
      }

      if (inSingleQuote && char === "'") {
        inSingleQuote = false;
      } else if (inDoubleQuote && char === '"') {
        inDoubleQuote = false;
      }
      continue;
    }

    if (char === "'") {
      inSingleQuote = true;
      continue;
    }
    if (char === '"') {
      inDoubleQuote = true;
      continue;
    }

    if (char === "{") {
      if (depth === 0) {
        startIndex = index;
      }
      depth += 1;
      continue;
    }

    if (char === "}") {
      depth -= 1;
      if (depth === 0 && startIndex >= 0) {
        blocks.push(source.slice(startIndex, index + 1));
        startIndex = -1;
      }
    }
  }

  return blocks;
};

const parseCatalogProducts = (source) => {
  const sanitized = stripLineComments(source);
  const arrayContent = extractProductsArrayContent(sanitized);
  const objectBlocks = extractObjectBlocks(arrayContent);

  return objectBlocks
    .map((block) => {
      const idMatch = block.match(/\bid:\s*'([^']+)'/);
      const nameMatch = block.match(/\bname:\s*'([^']+)'/);
      const stockQuantityMatch = block.match(/\bstockQuantity:\s*(\d+)/);
      const inStockMatch = block.match(/\binStock:\s*(true|false)/);

      if (!idMatch || !nameMatch) {
        return null;
      }

      const stockQuantity = Number(stockQuantityMatch?.[1] ?? 0);
      const inStock = inStockMatch ? inStockMatch[1] === "true" : stockQuantity > 0;

      return {
        id: idMatch[1],
        name: nameMatch[1],
        stockQuantity: Math.max(0, stockQuantity),
        inStock: stockQuantity > 0 ? true : inStock,
      };
    })
    .filter(Boolean);
};

const syncInventory = async () => {
  if (!isMongoEnabled()) {
    throw new Error("MONGODB_URI is not set. Cannot run strict-sync without MongoDB.");
  }

  const source = await readFile(productsFilePath, "utf8");
  const catalogProducts = parseCatalogProducts(source);

  if (catalogProducts.length === 0) {
    throw new Error("No products were parsed from frontend/src/data/products.ts");
  }

  const db = await getMongoDb();
  const collection = db.collection("inventory");
  const now = new Date().toISOString();

  const existingDocs = await collection.find({}).toArray();
  const existingById = new Map(existingDocs.map((doc) => [doc.id, doc]));

  let insertedCount = 0;
  let updatedCount = 0;

  for (const product of catalogProducts) {
    const existing = existingById.get(product.id);

    if (!existing) {
      await collection.insertOne({
        id: product.id,
        name: product.name,
        stockQuantity: product.stockQuantity,
        inStock: product.stockQuantity > 0 ? true : product.inStock,
        updatedAt: now,
      });
      insertedCount += 1;
      continue;
    }

    const nextName = product.name;
    const nextStock = Math.max(0, Number(existing.stockQuantity ?? 0));
    const nextInStock = nextStock > 0;
    const nameChanged = existing.name !== nextName;

    if (nameChanged || existing.inStock !== nextInStock || existing.stockQuantity !== nextStock) {
      await collection.updateOne(
        { id: product.id },
        {
          $set: {
            name: nextName,
            stockQuantity: nextStock,
            inStock: nextInStock,
            updatedAt: now,
          },
        }
      );
      updatedCount += 1;
    }
  }

  const catalogIds = catalogProducts.map((product) => product.id);
  const deleteResult = await collection.deleteMany({ id: { $nin: catalogIds } });

  console.log("Inventory strict-sync completed.");
  console.log(`Catalog products parsed: ${catalogProducts.length}`);
  console.log(`Inserted: ${insertedCount}`);
  console.log(`Updated: ${updatedCount}`);
  console.log(`Deleted: ${deleteResult.deletedCount}`);
};

try {
  await syncInventory();
  process.exit(0);
} catch (error) {
  console.error("Inventory strict-sync failed:", error.message);
  process.exit(1);
}
