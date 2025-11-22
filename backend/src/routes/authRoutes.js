import express from "express";
import {
  registerPatient,
  loginPatient,
  forgotPassword,
  verifyEmail,
} from "../controllers/authController.js";

const router = express.Router();

// Patient routes for mobile app
router.post("/register", registerPatient);
router.post("/login", loginPatient);
router.post("/forgot-password", forgotPassword);
router.post("/verify-email", verifyEmail);

export default router;
