import { Router } from "express";
import jwt from "jsonwebtoken";

const router = Router();

router.post("/login", (req, res) => {
  const { email, password } = req.body || {};
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const secret = process.env.ADMIN_JWT_SECRET;

  if (!adminEmail || !adminPassword || !secret) {
    return res.status(500).json({ message: "Admin authentication is not configured." });
  }

  if (email !== adminEmail || password !== adminPassword) {
    return res.status(401).json({ message: "Invalid credentials." });
  }

  const token = jwt.sign({ role: "admin", email: adminEmail }, secret, { expiresIn: "7d" });
  return res.json({ token });
});

export default router;
