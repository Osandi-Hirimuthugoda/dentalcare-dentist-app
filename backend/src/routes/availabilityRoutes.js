import express from "express";
import {
  getDoctorAvailability,
  updateDoctorAvailability,
} from "../controllers/availabilityController.js";

const router = express.Router();

// Get doctor availability (for mobile app - to show available slots)
router.get("/doctor/:doctorId", getDoctorAvailability);

// Update doctor availability (for web app - doctors setting their schedule)
router.put("/doctor/:doctorId", updateDoctorAvailability);
router.post("/doctor/:doctorId", updateDoctorAvailability); // Allow POST as well

export default router;

