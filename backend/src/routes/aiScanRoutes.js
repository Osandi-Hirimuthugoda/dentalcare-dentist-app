import express from "express";
import multer from "multer";
import { getAiScanHealth, processTeethScan, upload } from "../controllers/aiScanController.js";

const router = express.Router();

/** GET /api/ai-scan/health - Check AI service and model status (no auth required) */
router.get("/health", getAiScanHealth);

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
  console.error("🔴 Multer error handler triggered:", err);
  if (err instanceof multer.MulterError) {
    console.error("   Multer error code:", err.code);
    console.error("   Multer error message:", err.message);
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        message: 'File too large. Maximum size is 5MB.',
        error: err.message 
      });
    }
    return res.status(400).json({ 
      message: 'File upload error: ' + err.message,
      error: err.message 
    });
  }
  if (err) {
    console.error("   File upload error:", err.message);
    return res.status(400).json({ 
      message: err.message || 'File upload failed',
      error: err.message 
    });
  }
  next();
};

/**
 * @route   POST /api/ai-scan/teeth-scan
 * @desc    Upload and analyze teeth scan image using AI model
 * @access  Private (Patient only) - Optional when ALLOW_DB_FAILURE=true
 */
router.post("/teeth-scan", upload.single("image"), handleMulterError, processTeethScan);

export default router;

