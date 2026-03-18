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

// Debug middleware for login route
router.post("/login", (req, res, next) => {
  console.log("📥 Admin login route hit");
  console.log("   Body:", req.body);
  console.log("   Headers:", req.headers);
  next();
}, adminLogin);

// 📊 Admin Dashboard Statistics
router.get("/dashboard/stats", getDashboardStats);

// 📋 Get All Doctors
router.get("/doctors", getAllDoctors);

// ➕ Register Doctor (Admin only)
router.post("/doctors/register", registerDoctor);

// 🗑️ Delete Doctor
router.delete("/doctors/:doctorId", deleteDoctor);

// ✏️ Update Doctor
router.put("/doctors/:doctorId", updateDoctor);

// 📊 Get System Activity
router.get("/activity", getSystemActivity);

// 📋 Get All Patients (Admin)
router.get("/patients", getAllPatients);

// 📋 Get All Appointments (Admin)
router.get("/appointments", getAllAppointments);

export default router;
