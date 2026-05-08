import express from "express";
import {
  registerPatient,
  loginPatient,
  forgotPassword,
  verifyEmail,
  getCurrentPatient,
  updatePatientProfile,
  changePassword,
} from "../controllers/authController.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Patient authentication and profile management
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new patient
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Patient registered successfully
 *       400:
 *         description: Invalid input
 */
router.post("/register", registerPatient);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login as a patient
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post("/login", loginPatient);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current logged-in patient details
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Patient details retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/me", getCurrentPatient);

/**
 * @swagger
 * /api/auth/me:
 *   put:
 *     summary: Update patient profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated
 */
router.put("/me", updatePatientProfile);

router.put("/change-password", changePassword);
router.post("/forgot-password", forgotPassword);
router.post("/verify-email", verifyEmail);

export default router;

