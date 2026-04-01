const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Validates admin credentials from env and returns a signed JWT for protected admin APIs.
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body || {};
    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;
    const jwtSecret = process.env.JWT_SECRET;

    if (!adminUsername || !adminPasswordHash || !jwtSecret) {
      return res.status(500).json({
        message:
          "Admin auth is not configured. Set ADMIN_USERNAME, ADMIN_PASSWORD_HASH, and JWT_SECRET.",
      });
    }

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "username and password are required" });
    }

    if (String(username).trim() !== adminUsername) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const passwordOk = await bcrypt.compare(
      String(password),
      adminPasswordHash,
    );

    if (!passwordOk) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const token = jwt.sign(
      { role: "admin", username: adminUsername },
      jwtSecret,
      { expiresIn: "8h" },
    );

    return res.json({
      token,
      tokenType: "Bearer",
      expiresIn: "8h",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || "Failed to login" });
  }
};