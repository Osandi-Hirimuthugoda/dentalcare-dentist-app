import express from "express";
import {
  adminLogin,
  getDashboardStats,
  getAllDoctors,
  registerDoctor,
  deleteDoctor,
  updateDoctor,
  getSystemActivity,
  getAllPatients,
  getAllAppointments,
} from "../controllers/adminController.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin portal management
 */

/**
 * @swagger
 * /api/admins/login:
 *   post:
 *     summary: Admin login
 *     tags: [Admin]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:    { type: string, example: admin@dentalcare.com }
 *               password: { type: string, example: admin123 }
 *     responses:
 *       200:
 *         description: Login successful, returns token
 *       401:
 *         description: Invalid credentials
 */
router.post("/login", (req, res, next) => {
  console.log("📥 Admin login route hit");
  console.log("   Body:", req.body);
  console.log("   Headers:", req.headers);
  next();
}, adminLogin);

/**
 * @swagger
 * /api/admins/dashboard/stats:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Stats including totalDoctors, totalPatients, totalAppointments
 */
router.get("/dashboard/stats", getDashboardStats);

/**
 * @swagger
 * /api/admins/doctors:
 *   get:
 *     summary: Get all doctors
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: List of all doctors
 */
router.get("/doctors", getAllDoctors);

/**
 * @swagger
 * /api/admins/doctors/register:
 *   post:
 *     summary: Register a new doctor
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fullName, email, phone, password, licenseNumber]
 *             properties:
 *               fullName:       { type: string }
 *               email:          { type: string }
 *               phone:          { type: string }
 *               password:       { type: string }
 *               licenseNumber:  { type: string }
 *               specialization: { type: string }
 *               hospital:       { type: string }
 *               experience:     { type: integer }
 *     responses:
 *       201:
 *         description: Doctor registered successfully
 */
router.post("/doctors/register", registerDoctor);

/**
 * @swagger
 * /api/admins/doctors/{doctorId}:
 *   put:
 *     summary: Update doctor details
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: doctorId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Doctor'
 *     responses:
 *       200:
 *         description: Doctor updated
 *   delete:
 *     summary: Delete a doctor
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: doctorId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Doctor deleted
 */
router.delete("/doctors/:doctorId", deleteDoctor);
router.put("/doctors/:doctorId", updateDoctor);

/**
 * @swagger
 * /api/admins/activity:
 *   get:
 *     summary: Get system activity log
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Recent registrations and system stats
 */
router.get("/activity", getSystemActivity);

/**
 * @swagger
 * /api/admins/patients:
 *   get:
 *     summary: Get all patients
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: List of all patients
 */
router.get("/patients", getAllPatients);

/**
 * @swagger
 * /api/admins/appointments:
 *   get:
 *     summary: Get all appointments
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: List of all appointments with patient and doctor details
 */
router.get("/appointments", getAllAppointments);

export default router;
