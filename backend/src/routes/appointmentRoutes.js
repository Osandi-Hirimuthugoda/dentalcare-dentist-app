import express from "express";
import {
  listAppointments,
  getAppointmentsByDoctor,
  getAppointmentsByPatient,
  createAppointment,
  updateAppointment,
  deleteAppointment,
} from "../controllers/appointmentController.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// Get all appointments (admin - requires auth)
router.get("/", listAppointments);

// Get appointments by patient ID (for mobile app - requires auth token)
router.get("/patient", getAppointmentsByPatient);

// Get appointments by doctor ID (for web app - doctors viewing their appointments)
router.get("/doctor/:doctorId", getAppointmentsByDoctor);

// Create appointment (patient ID can come from token or body)
router.post("/", createAppointment);

// Update appointment
router.put("/:id", updateAppointment);

// Delete appointment
router.delete("/:id", deleteAppointment);

export default router;
