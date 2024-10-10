const jwt = require("jsonwebtoken");
require('dotenv').config();

const secretkey = process.env.secretkey;

// Token verify middleware
const verifytoken = (req, res, next) => {
  const authHeader = req.headers['authorization']; // safer access
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer <token>" → <token>

  if (!token) {
    return res.status(401).json({ message: "Access Denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, secretkey);
    req.user = decoded; // decoded contains user info, e.g., role, id
    next();
  } catch (err) {
    return res.status(400).json({ message: "Invalid token." });
  }
};

// Role verification middleware
const verifyrole = (role) => {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ message: "Access Denied. Unauthorized role." });
    }
    next();
  };
};

module.exports = { verifytoken, verifyrole };
