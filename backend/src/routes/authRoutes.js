import express from "express";
import {
  loginAdmin,
  registerDoctor,
  registerPatient,
  loginPatient,
  forgotPassword,
  verifyEmail,
} from "../controllers/authController.js";

const router = express.Router();

// Admin routes
router.post("/admin/login", loginAdmin);
router.post("/admin/register-doctor", registerDoctor);

// Patient routes (for mobile app)
router.post("/register", registerPatient);
router.post("/login", loginPatient);
router.post("/forgot-password", forgotPassword);
router.post("/verify-email", verifyEmail);

export default router;
