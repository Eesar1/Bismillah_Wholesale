import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { getMongoDb, isMongoEnabled } from "./db.js";

const dataDir = path.resolve(process.cwd(), "data");
const reviewsFile = path.join(dataDir, "reviews.json");

const ensureStore = async () => {
  await mkdir(dataDir, { recursive: true });

  try {
    await readFile(reviewsFile, "utf8");
  } catch {
    await writeFile(reviewsFile, "[]", "utf8");
  }
};

const readReviews = async () => {
  await ensureStore();
  const raw = await readFile(reviewsFile, "utf8");
  const clean = raw.replace(/^\uFEFF/, "").trim();
  return JSON.parse(clean || "[]");
};

const writeReviews = async (reviews) => {
  await writeFile(reviewsFile, JSON.stringify(reviews, null, 2), "utf8");
};

const mapMongoReview = (review) => {
  if (!review) return null;
  const { _id, ...rest } = review;
  return rest;
};

const getReviewsCollection = async () => {
  const db = await getMongoDb();
  if (!db) return null;
  return db.collection("reviews");
};

export const listReviews = async (productId, limit = 50) => {
  const collection = await getReviewsCollection();

  if (collection && isMongoEnabled()) {
    const docs = await collection
      .find({ productId })
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .toArray();

    return docs.map(mapMongoReview);
  }

  const reviews = await readReviews();
  return reviews
    .filter((review) => review.productId === productId)
    .sort((a, b) => new Date(b.createdAt).valueOf() - new Date(a.createdAt).valueOf())
    .slice(0, Number(limit));
};

export const getRatingSummary = async (productId) => {
  const collection = await getReviewsCollection();

  if (collection && isMongoEnabled()) {
    const [summary] = await collection
      .aggregate([
        { $match: { productId } },
        { $group: { _id: "$productId", average: { $avg: "$rating" }, count: { $sum: 1 } } },
      ])
      .toArray();

    return summary
      ? { average: Number(summary.average || 0), count: Number(summary.count || 0) }
      : { average: 0, count: 0 };
  }

  const reviews = await readReviews();
  const filtered = reviews.filter((review) => review.productId === productId);
  if (filtered.length === 0) {
    return { average: 0, count: 0 };
  }

  const total = filtered.reduce((sum, review) => sum + Number(review.rating || 0), 0);
  return { average: total / filtered.length, count: filtered.length };
};

export const createReview = async (review) => {
  const collection = await getReviewsCollection();

  if (collection && isMongoEnabled()) {
    await collection.insertOne(review);
    return review;
  }

  const reviews = await readReviews();
  reviews.unshift(review);
  await writeReviews(reviews);
  return review;
};

export const createReviewId = () => {
  return `REV-${Date.now()}-${Math.floor(Math.random() * 9000 + 1000)}`;
};
