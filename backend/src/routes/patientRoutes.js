import express from "express";
import {
  getPatients,
  getPatientsByDoctor,
  addPatient,
  selectDoctor,
  getPatientById,
  updatePatient,
  deletePatient,
} from "../controllers/patientController.js";

const router = express.Router();

// Get all patients (admin only)
router.get("/", getPatients);

// Get patients by doctor ID (for web app - doctors viewing their patients)
router.get("/doctor/:doctorId", getPatientsByDoctor);

// Get patient by ID
router.get("/:id", getPatientById);

// Add new patient (from mobile app)
router.post("/", addPatient);

// User selects a doctor (from mobile app)
router.post("/select-doctor", selectDoctor);

// Update patient information (doctor can add notes, diagnosis, etc.)
router.put("/:id", updatePatient);

// Delete patient (Admin only)
router.delete("/:id", deletePatient);

export default router;
