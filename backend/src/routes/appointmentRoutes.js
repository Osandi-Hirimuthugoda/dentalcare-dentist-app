import express from "express";
import {
  listAppointments,
  getAppointmentsByDoctor,
  getAppointmentsByPatient,
  getPatientTreatments,
  getRecentActivities,
  createAppointment,
  updateAppointment,
  deleteAppointment,
} from "../controllers/appointmentController.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Appointments
 *   description: Appointment booking and management
 */

/**
 * @swagger
 * /api/appointments:
 *   get:
 *     summary: Get all appointments (admin)
 *     tags: [Appointments]
 *     responses:
 *       200:
 *         description: List of all appointments
 *   post:
 *     summary: Create a new appointment
 *     tags: [Appointments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [patient, doctor, startTime]
 *             properties:
 *               patient:   { type: string, description: Patient ID }
 *               doctor:    { type: string, description: Doctor ID }
 *               startTime: { type: string, format: date-time }
 *               notes:     { type: string }
 *               service:   { type: string }
 *     responses:
 *       201:
 *         description: Appointment created
 */
router.get("/", listAppointments);
router.post("/", createAppointment);

/**
 * @swagger
 * /api/appointments/patient:
 *   get:
 *     summary: Get appointments for logged-in patient
 *     tags: [Appointments]
 *     responses:
 *       200:
 *         description: Patient's appointments
 */
router.get("/patient", getAppointmentsByPatient);

/**
 * @swagger
 * /api/appointments/patient/treatments:
 *   get:
 *     summary: Get patient treatment history
 *     tags: [Appointments]
 *     responses:
 *       200:
 *         description: List of completed treatments
 */
router.get("/patient/treatments", getPatientTreatments);

/**
 * @swagger
 * /api/appointments/patient/recent-activities:
 *   get:
 *     summary: Get recent patient activities
 *     tags: [Appointments]
 *     responses:
 *       200:
 *         description: Recent activities for health screen
 */
router.get("/patient/recent-activities", getRecentActivities);

/**
 * @swagger
 * /api/appointments/doctor/{doctorId}:
 *   get:
 *     summary: Get appointments for a specific doctor
 *     tags: [Appointments]
 *     parameters:
 *       - in: path
 *         name: doctorId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Doctor's appointments
 */
router.get("/doctor/:doctorId", getAppointmentsByDoctor);

/**
 * @swagger
 * /api/appointments/{id}:
 *   put:
 *     summary: Update appointment status or details
 *     tags: [Appointments]
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
 *               status: { type: string, enum: [pending, confirmed, completed, cancelled, rescheduled] }
 *               notes:  { type: string }
 *     responses:
 *       200:
 *         description: Appointment updated
 *   delete:
 *     summary: Delete an appointment
 *     tags: [Appointments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Appointment deleted
 */
router.put("/:id", updateAppointment);
router.delete("/:id", deleteAppointment);

export default router;
