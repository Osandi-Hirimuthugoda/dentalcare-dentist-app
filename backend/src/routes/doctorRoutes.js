import express from "express";
import {
  registerDoctor,
  loginDoctor, 
  getDoctorProfile,
  getAllDoctors,
  getAvailableDoctorsNow,
  changePassword,
  updateDoctorProfile,
  updateDoctorServices,
  resetPassword,
  getNearbyDoctors,
} from "../controllers/doctorController.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Doctors
 *   description: Doctor management and discovery
 */

/**
 * @swagger
 * /api/doctors/all:
 *   get:
 *     summary: Get all doctors
 *     tags: [Doctors]
 *     responses:
 *       200:
 *         description: List of all doctors
 */
router.get("/all", getAllDoctors);

/**
 * @swagger
 * /api/doctors/available-now:
 *   get:
 *     summary: Get doctors available right now
 *     tags: [Doctors]
 *     responses:
 *       200:
 *         description: List of available doctors
 */
router.get("/available-now", getAvailableDoctorsNow);

/**
 * @swagger
 * /api/doctors/profile/{id}:
 *   get:
 *     summary: Get doctor profile by ID
 *     tags: [Doctors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The doctor ID
 *     responses:
 *       200:
 *         description: Doctor profile data
 *       404:
 *         description: Doctor not found
 */
router.get("/profile/:id", getDoctorProfile);

router.post("/register", registerDoctor);
router.post("/login", loginDoctor);
router.get("/nearby", getNearbyDoctors); 
router.put("/:doctorId/profile", updateDoctorProfile);
router.put("/:doctorId/services", updateDoctorServices);
router.put("/:doctorId/change-password", changePassword);
router.post("/reset-password", resetPassword);

export default router;