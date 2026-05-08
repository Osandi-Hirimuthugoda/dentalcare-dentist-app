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

/**
 * @swagger
 * tags:
 *   name: Bills
 *   description: Billing and payment management
 */

/**
 * @swagger
 * /api/bills/patient/bills:
 *   get:
 *     summary: Get all bills for logged-in patient
 *     tags: [Bills]
 *     responses:
 *       200:
 *         description: List of patient bills
 */
router.get("/patient/bills", getPatientBills);

/**
 * @swagger
 * /api/bills/patient/payments:
 *   get:
 *     summary: Get payment history for logged-in patient
 *     tags: [Bills]
 *     responses:
 *       200:
 *         description: Payment history
 */
router.get("/patient/payments", getPatientPayments);

/**
 * @swagger
 * /api/bills/from-appointment:
 *   post:
 *     summary: Create a bill from an appointment
 *     tags: [Bills]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [appointmentId]
 *             properties:
 *               appointmentId: { type: string }
 *     responses:
 *       201:
 *         description: Bill created
 */
router.post("/from-appointment", createBillFromAppointment);

/**
 * @swagger
 * /api/bills/generate:
 *   post:
 *     summary: Auto-generate bills for completed appointments
 *     tags: [Bills]
 *     responses:
 *       200:
 *         description: Bills generated
 */
router.post("/generate", generateBillsForCompletedAppointments);

/**
 * @swagger
 * /api/bills/doctor/bills:
 *   get:
 *     summary: Get all bills for logged-in doctor
 *     tags: [Bills]
 *     responses:
 *       200:
 *         description: Doctor's bills
 */
router.get("/doctor/bills", getDoctorBills);
router.get("/doctor/payments", getDoctorPayments);

/**
 * @swagger
 * /api/bills/doctor/stats:
 *   get:
 *     summary: Get payment statistics for logged-in doctor
 *     tags: [Bills]
 *     responses:
 *       200:
 *         description: Revenue stats including totalBills, paidBills, totalAmount
 */
router.get("/doctor/stats", getDoctorPaymentStats);

/**
 * @swagger
 * /api/bills/{id}:
 *   get:
 *     summary: Get a single bill by ID
 *     tags: [Bills]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Bill details
 */
router.get("/:id", getBillById);

/**
 * @swagger
 * /api/bills/{id}/pay:
 *   post:
 *     summary: Process payment for a bill
 *     tags: [Bills]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               paymentMethod: { type: string, enum: [wallet, card, cash] }
 *     responses:
 *       200:
 *         description: Payment processed
 */
router.post("/:id/pay", processPayment);

export default router;

