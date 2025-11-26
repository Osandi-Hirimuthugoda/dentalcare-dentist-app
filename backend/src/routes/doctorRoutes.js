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
} from "../controllers/doctorController.js";

const router = express.Router();

router.post("/register", registerDoctor);

// You added these later:
router.post("/login", loginDoctor); // <--- This is the route we're looking for!
router.get("/profile/:id", getDoctorProfile);
router.get("/all", getAllDoctors); // Get all doctors (for admin)
router.get("/available-now", getAvailableDoctorsNow); // Get available doctors at current time

// Update doctor profile
router.put("/:doctorId/profile", updateDoctorProfile);

// Update doctor services
router.put("/:doctorId/services", updateDoctorServices);

// Change password
router.put("/:doctorId/change-password", changePassword);

// Reset password (for fixing password issues)
router.post("/reset-password", resetPassword);

export default router;