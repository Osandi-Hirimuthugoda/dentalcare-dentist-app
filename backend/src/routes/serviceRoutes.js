import express from "express";
import {
  getAllServices,
  createService,
} from "../controllers/serviceController.js";

const router = express.Router();

// Get all services (for mobile app)
router.get("/", getAllServices);

// Create service (admin only - for future use)
router.post("/", createService);

export default router;

