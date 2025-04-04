const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;  // secret for verification

exports.getUserFromEvent = (event) => {
  try {
    const authHeader = event.headers?.Authorization || event.headers?.authorization;
    if (!authHeader?.startsWith("Bearer ")) return null;

    const token = authHeader.split(" ")[1]; // Extract token
    if (!token) return null;

    const decoded = jwt.verify(token, JWT_SECRET); // Verify token integrity
    return decoded || null;
  } catch (error) {
    return null;
  }
};
