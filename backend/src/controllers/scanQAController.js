import ScanQA from "../models/ScanQA.js";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

const JWT_SECRET = process.env.JWT_SECRET || "dentalcare_secret_key_change_in_production";

// Helper function to extract user from token
const getUserFromToken = (req) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return null;
    
    const token = authHeader.split(" ")[1];
    if (!token) return null;
    
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (err) {
    return null;
  }
};

// Get all pending scans for dentist
export const getPendingScansForDentist = async (req, res) => {
  try {
    const user = getUserFromToken(req);
    
    if (!user || user.role !== "doctor") {
      return res.status(401).json({ message: "Unauthorized. Doctor authentication required." });
    }

    // Get all scans with status "pending_qa" or assigned to this doctor
    const scans = await ScanQA.find({
      $or: [
        { status: "pending_qa" },
        { doctorId: user.id, status: { $ne: "results_shown" } }
      ]
    })
      .populate("patientId", "name email phone")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      scans: scans.map(scan => ({
        id: scan._id,
        scanId: scan.scanId,
        patient: scan.patientId,
        imageUrl: scan.imageUrl,
        analysisResults: scan.analysisResults,
        questions: scan.questions,
        status: scan.status,
        createdAt: scan.createdAt,
        updatedAt: scan.updatedAt
      }))
    });
  } catch (error) {
    console.error("Error getting pending scans:", error);
    res.status(500).json({ message: error.message });
  }
};

// Create scan Q&A session after image processing
export const createScanQA = async (req, res) => {
  console.log("Creating scan Q&A session...");
  try {
    const user = getUserFromToken(req);
    const allowWithoutAuth = process.env.ALLOW_DB_FAILURE === 'true';
    
    if (!allowWithoutAuth && (!user || user.role !== "patient")) {
      return res.status(401).json({ message: "Unauthorized. Patient authentication required." });
    }

    const { imageUrl, analysisResults } = req.body;

    console.log("Received imageUrl:", imageUrl);
    if (!imageUrl || !analysisResults) {
      return res.status(400).json({ message: "Image URL and analysis results are required" });
    }

    // Generate unique scan ID
    const scanId = uuidv4();
    const patientId = user?.id || req.body.patientId;

    // Create scan Q&A session
    const scanQA = new ScanQA({
      scanId,
      patientId,
      doctorId: null, // Will be assigned when dentist starts Q&A
      imageUrl,
      analysisResults,
      status: "pending_qa",
      questions: []
    });

    await scanQA.save();

    res.status(200).json({
      success: true,
      message: "Scan Q&A session created",
      scanId,
      scanQA: {
        id: scanQA._id,
        scanId: scanQA.scanId,
        status: scanQA.status,
        imageUrl: scanQA.imageUrl
      }
    });
    console.log("Scan Q&A session finished with ID:", scanId);
  } catch (error) {
    console.error("Error creating scan Q&A:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get scan Q&A session for dentist
export const getScanQAForDentist = async (req, res) => {
  try {
    const user = getUserFromToken(req);
    
    if (!user || user.role !== "doctor") {
      return res.status(401).json({ message: "Unauthorized. Doctor authentication required." });
    }

    const { scanId } = req.params;

    const scanQA = await ScanQA.findOne({ scanId })
      .populate("patientId", "name email phone")
      .populate("doctorId", "fullName email");

    if (!scanQA) {
      return res.status(404).json({ message: "Scan Q&A session not found" });
    }

    // Assign doctor if not assigned
    if (!scanQA.doctorId) {
      scanQA.doctorId = user.id;
      await scanQA.save();
    }

    res.status(200).json({
      success: true,
      scanQA: {
        id: scanQA._id,
        scanId: scanQA.scanId,
        patient: scanQA.patientId,
        doctor: scanQA.doctorId,
        imageUrl: scanQA.imageUrl,
        analysisResults: scanQA.analysisResults,
        questions: scanQA.questions,
        status: scanQA.status,
        createdAt: scanQA.createdAt,
        updatedAt: scanQA.updatedAt
      }
    });
  } catch (error) {
    console.error("Error getting scan Q&A:", error);
    res.status(500).json({ message: error.message });
  }
};

// Add question from dentist
export const addQuestion = async (req, res) => {
  try {
    const user = getUserFromToken(req);
    
    if (!user || user.role !== "doctor") {
      return res.status(401).json({ message: "Unauthorized. Doctor authentication required." });
    }

    const { scanId } = req.params;
    const { question } = req.body;

    if (!question || question.trim() === "") {
      return res.status(400).json({ message: "Question is required" });
    }

    const scanQA = await ScanQA.findOne({ scanId });

    if (!scanQA) {
      return res.status(404).json({ message: "Scan Q&A session not found" });
    }

    // Add question
    scanQA.questions.push({
      question: question.trim(),
      askedAt: new Date()
    });

    await scanQA.save();

    res.status(200).json({
      success: true,
      message: "Question added successfully",
      question: scanQA.questions[scanQA.questions.length - 1]
    });
  } catch (error) {
    console.error("Error adding question:", error);
    res.status(500).json({ message: error.message });
  }
};

// Add answer from patient
export const addAnswer = async (req, res) => {
  try {
    const user = getUserFromToken(req);
    const allowWithoutAuth = process.env.ALLOW_DB_FAILURE === 'true';
    
    if (!allowWithoutAuth && (!user || user.role !== "patient")) {
      return res.status(401).json({ message: "Unauthorized. Patient authentication required." });
    }

    const { scanId, questionId } = req.params;
    const { answer } = req.body;

    if (!answer || answer.trim() === "") {
      return res.status(400).json({ message: "Answer is required" });
    }

    const scanQA = await ScanQA.findOne({ scanId });

    if (!scanQA) {
      return res.status(404).json({ message: "Scan Q&A session not found" });
    }

    // Find and update the question
    const question = scanQA.questions.id(questionId);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    question.answer = answer.trim();
    question.answeredAt = new Date();

    await scanQA.save();

    res.status(200).json({
      success: true,
      message: "Answer added successfully",
      question: question
    });
  } catch (error) {
    console.error("Error adding answer:", error);
    res.status(500).json({ message: error.message });
  }
};

// Complete Q&A session (dentist marks as complete)
export const completeQA = async (req, res) => {
  try {
    const user = getUserFromToken(req);
    
    if (!user || user.role !== "doctor") {
      return res.status(401).json({ message: "Unauthorized. Doctor authentication required." });
    }

    const { scanId } = req.params;

    const scanQA = await ScanQA.findOne({ scanId });

    if (!scanQA) {
      return res.status(404).json({ message: "Scan Q&A session not found" });
    }

    scanQA.status = "qa_completed";
    scanQA.completedAt = new Date();

    await scanQA.save();

    res.status(200).json({
      success: true,
      message: "Q&A session completed",
      scanQA: {
        id: scanQA._id,
        scanId: scanQA.scanId,
        status: scanQA.status,
        completedAt: scanQA.completedAt
      }
    });
  } catch (error) {
    console.error("Error completing Q&A:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get scan Q&A for patient
export const getScanQAForPatient = async (req, res) => {
  try {
    const user = getUserFromToken(req);
    const allowWithoutAuth = process.env.ALLOW_DB_FAILURE === 'true';
    
    if (!allowWithoutAuth && (!user || user.role !== "patient")) {
      return res.status(401).json({ message: "Unauthorized. Patient authentication required." });
    }

    const { scanId } = req.params;

    const scanQA = await ScanQA.findOne({ scanId })
      .populate("doctorId", "fullName email");

    if (!scanQA) {
      return res.status(404).json({ message: "Scan Q&A session not found" });
    }

    res.status(200).json({
      success: true,
      scanQA: {
        id: scanQA._id,
        scanId: scanQA.scanId,
        doctor: scanQA.doctorId,
        imageUrl: scanQA.imageUrl,
        analysisResults: scanQA.analysisResults,
        questions: scanQA.questions,
        status: scanQA.status,
        createdAt: scanQA.createdAt,
        updatedAt: scanQA.updatedAt
      }
    });
    console.log("Successfully retrieved scan Q&A for patient:", scanId);
  } catch (error) {
    console.log("Error getting scan Q&A for patient:", error);
    res.status(500).json({ message: error.message });
  }
};

// Mark results as shown to patient
export const markResultsShown = async (req, res) => {
  try {
    const user = getUserFromToken(req);
    const allowWithoutAuth = process.env.ALLOW_DB_FAILURE === 'true';
    
    if (!allowWithoutAuth && (!user || user.role !== "patient")) {
      return res.status(401).json({ message: "Unauthorized. Patient authentication required." });
    }

    const { scanId } = req.params;

    const scanQA = await ScanQA.findOne({ scanId });

    if (!scanQA) {
      return res.status(404).json({ message: "Scan Q&A session not found" });
    }

    if (scanQA.status !== "qa_completed") {
      return res.status(400).json({ message: "Q&A session must be completed first" });
    }

    scanQA.status = "results_shown";

    await scanQA.save();

    res.status(200).json({
      success: true,
      message: "Results marked as shown",
      scanQA: {
        id: scanQA._id,
        scanId: scanQA.scanId,
        status: scanQA.status
      }
    });
  } catch (error) {
    console.error("Error marking results as shown:", error);
    res.status(500).json({ message: error.message });
  }
};
