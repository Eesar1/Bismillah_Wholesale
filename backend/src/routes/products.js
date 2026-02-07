import { Router } from "express";
import { getAvailabilityMap } from "../services/inventory-store.js";
import { createReview, createReviewId, getRatingSummary, listReviews } from "../services/review-store.js";

const router = Router();

router.get("/availability", async (_req, res) => {
  try {
    const availability = await getAvailabilityMap();
    return res.json({ availability });
  } catch (error) {
    console.error("Products availability error:", error);
    return res.status(500).json({ message: "Failed to fetch product availability." });
  }
});

router.get("/:productId/reviews", async (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = await listReviews(productId);
    const summary = await getRatingSummary(productId);
    return res.json({ reviews, summary });
  } catch (error) {
    console.error("Product reviews error:", error);
    return res.status(500).json({ message: "Failed to fetch product reviews." });
  }
});

router.post("/:productId/reviews", async (req, res) => {
  try {
    const { productId } = req.params;
    const { name, email, rating, comment } = req.body || {};

    if (!name || !comment) {
      return res.status(400).json({ message: "Name and comment are required." });
    }

    const numericRating = Number(rating);
    if (!numericRating || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5." });
    }

    const review = {
      id: createReviewId(),
      productId,
      name: String(name).trim(),
      email: email ? String(email).trim() : undefined,
      rating: numericRating,
      comment: String(comment).trim(),
      createdAt: new Date().toISOString(),
    };

    await createReview(review);
    const summary = await getRatingSummary(productId);
    return res.status(201).json({ review, summary });
  } catch (error) {
    console.error("Create review error:", error);
    return res.status(500).json({ message: "Failed to submit review." });
  }
});

export default router;
