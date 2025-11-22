import express from "express";
import {
  getDoctorMessages,
  getPatientMessages,
  sendMessage,
  markAsRead,
  getConversation
} from "../controllers/messageController.js";

const router = express.Router();

// Get messages for a doctor
router.get("/doctor/:doctorId", getDoctorMessages);

// Get messages for a patient (uses JWT token)
router.get("/patient/messages", getPatientMessages);

// Get conversation between doctor and patient
router.get("/conversation/:doctorId/:patientId", getConversation);

// Send a message
router.post("/", sendMessage);

// Mark message as read
router.put("/:messageId/read", markAsRead);

export default router;




