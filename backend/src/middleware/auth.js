import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";

const JWT_SECRET = process.env.JWT_SECRET || "dentalcare_secret_key_change_in_production";

export const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "Missing token" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// Allow only admin access
export const requireAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Admin access only" });
  }
  next();
};

// Protect admin routes - checks for admin authentication
export const protectAdmin = async (req, res, next) => {
  try {
    // Check for authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ message: "Not authorized, no token provided" });
    }

    // Try to get token from header
    const token = authHeader.split(" ")[1];
    
    if (!token) {
      // If no token, check if admin email is in headers (for session-based auth)
      const adminEmail = req.headers["x-admin-email"];
      if (adminEmail) {
        const admin = await Admin.findOne({ email: adminEmail });
        if (admin) {
          req.admin = admin;
          return next();
        }
      }
      return res.status(401).json({ message: "Not authorized, invalid token" });
    }

    // Verify JWT token
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Check if it's an admin token
      if (decoded.role === "admin" || decoded.email) {
        const admin = await Admin.findById(decoded.id || decoded._id);
        if (admin) {
          req.admin = admin;
          return next();
        }
      }
      
      return res.status(403).json({ message: "Admin access required" });
    } catch (error) {
      // If token verification fails, try to find admin by email in token payload
      // This is a fallback for custom token formats
      return res.status(401).json({ message: "Not authorized, token verification failed" });
    }
  } catch (error) {
    console.error("Error in protectAdmin middleware:", error);
    return res.status(500).json({ message: "Server error in authentication" });
  }
};
