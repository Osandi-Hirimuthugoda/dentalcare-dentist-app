import express from "express";
import {
  createPrescription,
  getPatientPrescriptions,
  getPrescriptionById
} from "../controllers/prescriptionController.js";

const router = express.Router();

router.post("/create", createPrescription);
router.get("/patient", getPatientPrescriptions); // For logged-in patient
router.get("/patient/:patientId", getPatientPrescriptions); // For doctor viewing patient history
router.get("/:id", getPrescriptionById);

export default router;
