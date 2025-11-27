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

// Patient routes for mobile app
router.post("/register", registerPatient);
router.post("/login", loginPatient);
router.get("/me", getCurrentPatient); // Get current logged in patient
router.put("/me", updatePatientProfile); // Update current patient profile
router.put("/change-password", changePassword); // Change password
router.post("/forgot-password", forgotPassword);
router.post("/verify-email", verifyEmail);

export default router;
