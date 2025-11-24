import express from "express";
import {
  getAllHospitals,
  searchHospitals,
  getHospitalById,
  createHospital,
  updateHospital,
  deleteHospital,
  getHospitalsByDistrict,
  getDistrictsWithCounts,
} from "../controllers/hospitalController.js";
import { protectAdmin } from "../middleware/auth.js";

const router = express.Router();

// 🔍 Public routes (for users to search)
router.get("/search", searchHospitals);
router.get("/districts", getDistrictsWithCounts);
router.get("/district/:district", getHospitalsByDistrict);
router.get("/:id", getHospitalById);

// 🔐 Admin routes (protected)
router.get("/", protectAdmin, getAllHospitals);
router.post("/", protectAdmin, createHospital);
router.put("/:id", protectAdmin, updateHospital);
router.delete("/:id", protectAdmin, deleteHospital);

export default router;

