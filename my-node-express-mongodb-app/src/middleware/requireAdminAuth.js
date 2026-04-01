const jwt = require("jsonwebtoken");

// Verifies Bearer tokens for admin-only endpoints.
function requireAdminAuth(req, res, next) {
  const authHeader = req.headers.authorization || "";

  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing admin token" });
  }

  const token = authHeader.slice(7).trim();
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    return res.status(500).json({
      message: "JWT_SECRET is missing. Configure server auth settings.",
    });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    if (!decoded || decoded.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    req.admin = decoded;
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired admin token" });
  }
}

module.exports = requireAdminAuth;