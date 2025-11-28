import express from "express";
import { processTeethScan, upload } from "../controllers/aiScanController.js";

const router = express.Router();

// Process teeth scan with AI/CNN model
// POST /api/ai-scan/teeth-scan
router.post("/teeth-scan", upload.single('image'), processTeethScan);

export default router;



