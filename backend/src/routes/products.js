import { Router } from "express";
import { getAvailabilityMap } from "../services/inventory-store.js";

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

export default router;
