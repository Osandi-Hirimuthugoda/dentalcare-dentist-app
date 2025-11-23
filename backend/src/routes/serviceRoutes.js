import express from "express";
import {
  getAllServices,
  getServicesByCategory,
  createService,
  updateService,
  deleteService,
} from "../controllers/serviceController.js";

const router = express.Router();

// Get all services (for mobile app)
router.get("/", getAllServices);

// Get services grouped by category
router.get("/categories", getServicesByCategory);

// Create service (admin/doctor can create)
router.post("/", createService);

// Update a service
router.put("/:id", updateService);

// Delete a service (soft delete)
router.delete("/:id", deleteService);

export default router;

