import express from "express";
import jwt from "jsonwebtoken";
import {
  createReview,
  getDoctorReviews,
  getPatientReviews,
  deleteReview,
} from "../controllers/reviewController.js";

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "dentalcare_secret_key_change_in_production";

// Middleware to extract patient from JWT token
const authenticatePatient = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      console.log("❌ Review auth: No authorization header");
      return res.status(401).json({ message: "Authentication required" });
    }

    if (!authHeader.startsWith("Bearer ")) {
      console.log("❌ Review auth: Invalid authorization header format");
      return res.status(401).json({ message: "Invalid authorization header format" });
    }

    const token = authHeader.split(" ")[1]; // Use same method as appointmentController
    if (!token) {
      console.log("❌ Review auth: No token found in Authorization header");
      return res.status(401).json({ message: "Token is required" });
    }
    
    console.log("🔍 Review auth - Verifying token...");
    console.log("   Token length:", token.length);
    console.log("   Token preview:", token.substring(0, 30) + "...");
    
    const decoded = jwt.verify(token, JWT_SECRET);
    
    console.log("✅ Review auth - Token verified successfully");
    console.log("   Decoded:", {
      id: decoded.id,
      role: decoded.role,
      exp: decoded.exp ? new Date(decoded.exp * 1000).toISOString() : 'no expiry',
    });
    
    // Check role - if role exists and is not "patient", reject
    if (decoded.role && decoded.role !== "patient") {
      console.log("❌ Review auth: Role is not patient:", decoded.role);
      return res.status(403).json({ message: "Patient access required" });
    }

    // Set user in request (id or _id)
    req.user = {
      id: decoded.id || decoded._id,
      _id: decoded.id || decoded._id,
      role: decoded.role || "patient",
    };
    
    next();
  } catch (error) {
    console.error("❌ Review auth error:", error.name, error.message);
    
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ 
        message: "Token has expired. Please login again.",
        error: "TokenExpiredError"
      });
    }
    
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ 
        message: "Invalid token. Please login again.",
        error: "JsonWebTokenError"
      });
    }
    
    return res.status(401).json({ 
      message: "Invalid or expired token",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

// Create a review (patient only)
router.post("/", authenticatePatient, createReview);

// Get reviews for a doctor (public)
router.get("/doctor/:doctorId", getDoctorReviews);

// Get patient's reviews (patient only)
router.get("/patient", authenticatePatient, getPatientReviews);

// Delete a review (patient only)
router.delete("/:reviewId", authenticatePatient, deleteReview);

export default router;

