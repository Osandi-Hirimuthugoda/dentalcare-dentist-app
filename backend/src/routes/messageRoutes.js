import express from "express";
import jwt from "jsonwebtoken";
import {
  getDoctorMessages,
  getPatientMessages,
  sendMessage,
  markAsRead,
  getConversation,
  getPatientAnnouncements,
  getAllDoctors
} from "../controllers/messageController.js";

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "dentalcare_secret_key_change_in_production";

// Middleware: block admin from accessing private messages
const blockAdmin = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.split(" ")[1];
      if (token) {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.role === "admin") {
          return res.status(403).json({ 
            message: "Access denied. Admin cannot view private messages between doctors and patients." 
          });
        }
      }
    }
    next();
  } catch {
    next(); // If token invalid, let controller handle auth
  }
};

// Get messages for a doctor (can filter by type: ?type=patients or ?type=doctors)
router.get("/doctor/:doctorId", blockAdmin, getDoctorMessages);

// Get messages for a patient (uses JWT token)
router.get("/patient/messages", blockAdmin, getPatientMessages);

// Get announcements for a patient (uses JWT token)
router.get("/patient/announcements", blockAdmin, getPatientAnnouncements);

// Get conversation between doctor and patient
router.get("/conversation/:doctorId/:patientId", blockAdmin, getConversation);

// Get conversation between two doctors
router.get("/conversation/doctors/:doctorId/:otherDoctorId", blockAdmin, getConversation);

// Get all doctors (for doctor-to-doctor messaging)
router.get("/doctors", blockAdmin, getAllDoctors);

// Send a message - admin cannot send messages on behalf of others
router.post("/", blockAdmin, sendMessage);

// Mark message as read
router.put("/:messageId/read", blockAdmin, markAsRead);

export default router;




