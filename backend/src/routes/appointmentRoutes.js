import express from "express";
import {
  listAppointments,
  getAppointmentsByDoctor,
  createAppointment,
  updateAppointment,
  deleteAppointment,
} from "../controllers/appointmentController.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// Get all appointments (admin - requires auth)
router.get("/", listAppointments);

// Get appointments by doctor ID (for web app - doctors viewing their appointments)
router.get("/doctor/:doctorId", getAppointmentsByDoctor);

// Create appointment
router.post("/", createAppointment);

// Update appointment
router.put("/:id", updateAppointment);

// Delete appointment
router.delete("/:id", deleteAppointment);

export default router;
