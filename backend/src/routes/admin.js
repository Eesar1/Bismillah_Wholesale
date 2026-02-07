import { Router } from "express";
import jwt from "jsonwebtoken";

const router = Router();

router.post("/login", (req, res) => {
  const { username, email, password } = req.body || {};
  const adminUsername = process.env.ADMIN_USERNAME || process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const secret = process.env.ADMIN_JWT_SECRET;

  if (!adminUsername || !adminPassword || !secret) {
    return res.status(500).json({ message: "Admin authentication is not configured." });
  }

  const loginId = (typeof username === "string" && username.trim()) || email;

  if (loginId !== adminUsername || password !== adminPassword) {
    return res.status(401).json({ message: "Invalid credentials." });
  }

  const token = jwt.sign({ role: "admin", username: adminUsername }, secret, { expiresIn: "7d" });
  return res.json({ token });
});

export default router;
