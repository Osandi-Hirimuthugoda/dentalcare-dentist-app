import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import {
  createScanQA,
  getPendingScansForDentist,
  getScanQAForDentist,
  getScanQAForPatient,
  addQuestion,
  addAnswer,
  completeQA,
  markResultsShown,
  sendScanReport,
  sendReportToPatient,
  getReportsSentToPatient
} from "../controllers/scanQAController.js";

const router = express.Router();

// Multer for PDF report uploads
const reportUpload = multer({
  dest: "uploads/scan-reports/",
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") cb(null, true);
    else cb(new Error("Only PDF files allowed"), false);
  },
});

// Patient routes
router.post("/create", createScanQA);
router.get("/patient/:scanId", getScanQAForPatient);
router.get("/patient/sent-reports", getReportsSentToPatient);
router.post("/:scanId/answer/:questionId", addAnswer);
router.post("/:scanId/mark-shown", markResultsShown);
router.post("/send-report", reportUpload.single("report"), sendScanReport);

// Dentist routes
router.get("/pending", getPendingScansForDentist);
router.get("/dentist/:scanId", getScanQAForDentist);
router.post("/:scanId/question", addQuestion);
router.post("/:scanId/complete", completeQA);
router.post("/:scanId/send-to-patient", sendReportToPatient);

// Serve PDF report file
router.get("/report-file/:scanId", (req, res) => {
  try {
    const { scanId } = req.params;
    // scanId is used as filename lookup via ScanQA model — serve the file directly
    // The imageUrl field stores the file path for pdf_report type
    import("../models/ScanQA.js").then(({ default: ScanQA }) => {
      ScanQA.findOne({ scanId }).then((scan) => {
        if (!scan) return res.status(404).json({ message: "Report not found" });
        const filePath = path.resolve(scan.imageUrl);
        if (!fs.existsSync(filePath)) return res.status(404).json({ message: "File not found" });
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `inline; filename="report_${scanId}.pdf"`);
        fs.createReadStream(filePath).pipe(res);
      }).catch(() => res.status(500).json({ message: "Server error" }));
    });
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
