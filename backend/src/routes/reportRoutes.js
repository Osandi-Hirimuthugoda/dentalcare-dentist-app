import express from "express";
import {
  getRevenueAnalytics,
  getPatientAnalytics,
  getAppointmentTrends
} from "../controllers/reportController.js";

const router = express.Router();

router.get("/revenue", getRevenueAnalytics);
router.get("/patients", getPatientAnalytics);
router.get("/appointments", getAppointmentTrends);

export default router;
