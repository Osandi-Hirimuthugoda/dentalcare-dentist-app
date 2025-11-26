import express from "express";
import {
  getHealthData,
  getHealthTips,
} from "../controllers/healthController.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// Get health data (tips, score, recent activities)
// Optional auth - works with or without authentication
router.get("/data", getHealthData);

// Get health tips only
router.get("/tips", getHealthTips);

export default router;


