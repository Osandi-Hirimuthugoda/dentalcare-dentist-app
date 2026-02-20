import express from "express";
import {
  createScanQA,
  getPendingScansForDentist,
  getScanQAForDentist,
  getScanQAForPatient,
  addQuestion,
  addAnswer,
  completeQA,
  markResultsShown
} from "../controllers/scanQAController.js";

const router = express.Router();

// Patient routes
router.post("/create", createScanQA);
router.get("/patient/:scanId", getScanQAForPatient);
router.post("/:scanId/answer/:questionId", addAnswer);
router.post("/:scanId/mark-shown", markResultsShown);

// Dentist routes
router.get("/pending", getPendingScansForDentist);
router.get("/dentist/:scanId", getScanQAForDentist);
router.post("/:scanId/question", addQuestion);
router.post("/:scanId/complete", completeQA);

export default router;
