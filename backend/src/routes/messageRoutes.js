import express from "express";
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

// Get messages for a doctor (can filter by type: ?type=patients or ?type=doctors)
router.get("/doctor/:doctorId", getDoctorMessages);

// Get messages for a patient (uses JWT token)
router.get("/patient/messages", getPatientMessages);

// Get announcements for a patient (uses JWT token)
router.get("/patient/announcements", getPatientAnnouncements);

// Get conversation between doctor and patient
router.get("/conversation/:doctorId/:patientId", getConversation);

// Get conversation between two doctors
router.get("/conversation/doctors/:doctorId/:otherDoctorId", getConversation);

// Get all doctors (for doctor-to-doctor messaging)
router.get("/doctors", getAllDoctors);

// Send a message
router.post("/", sendMessage);

// Mark message as read
router.put("/:messageId/read", markAsRead);

export default router;




