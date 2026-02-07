import jwt from "jsonwebtoken";

export const requireAdminAuth = (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const secret = process.env.ADMIN_JWT_SECRET;

  if (!token || !secret) {
    return res.status(401).json({ message: "Unauthorized." });
  }

  try {
    req.admin = jwt.verify(token, secret);
    return next();
  } catch {
    return res.status(401).json({ message: "Unauthorized." });
  }
};
