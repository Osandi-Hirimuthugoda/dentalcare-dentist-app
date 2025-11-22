import express from "express";
import {
  getPatientBills,
  getBillById,
  createBillFromAppointment,
  processPayment,
  getPatientPayments,
  generateBillsForCompletedAppointments,
  getDoctorBills,
  getDoctorPaymentStats,
  getDoctorPayments
} from "../controllers/billController.js";

const router = express.Router();

// Patient routes (mobile app) - Specific routes must come before parameterized routes
router.get("/patient/bills", getPatientBills); // Get all bills for logged-in patient
router.get("/patient/payments", getPatientPayments); // Get payment history
router.post("/from-appointment", createBillFromAppointment); // Create bill from appointment
router.post("/generate", generateBillsForCompletedAppointments); // Auto-generate bills

// Doctor routes (web app) - Specific routes must come before parameterized routes
router.get("/doctor/bills", getDoctorBills); // Get all bills for logged-in doctor
router.get("/doctor/payments", getDoctorPayments); // Get payments for doctor's bills
router.get("/doctor/stats", getDoctorPaymentStats); // Get payment statistics for doctor

// Parameterized routes - Must come after specific routes
router.get("/:id", getBillById); // Get single bill by ID
router.post("/:id/pay", processPayment); // Process payment for a bill

export default router;

