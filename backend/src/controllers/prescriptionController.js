import Prescription from "../models/Prescription.js";
import Appointment from "../models/Appointment.js";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dentalcare_secret_key_change_in_production";

const getUserFromToken = (req) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return null;
    const token = authHeader.split(" ")[1];
    if (!token) return null;
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
};

// Create a new prescription
export const createPrescription = async (req, res) => {
  try {
    const user = getUserFromToken(req);
    if (!user || user.role !== "doctor") {
      return res.status(401).json({ message: "Unauthorized. Doctor access required." });
    }

    const { patientId, appointmentId, medications, diagnosis, notes } = req.body;

    if (!patientId || !medications || !diagnosis) {
      return res.status(400).json({ message: "Patient ID, medications, and diagnosis are required." });
    }

    const prescription = new Prescription({
      patient: patientId,
      doctor: user.id,
      appointment: appointmentId,
      medications,
      diagnosis,
      notes
    });

    await prescription.save();

    // If appointmentId is provided, update appointment status or add reference if needed
    if (appointmentId) {
      await Appointment.findByIdAndUpdate(appointmentId, { status: "completed" });
    }

    res.status(201).json({
      success: true,
      message: "Prescription created successfully",
      prescription
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get prescriptions for a patient
export const getPatientPrescriptions = async (req, res) => {
  try {
    const user = getUserFromToken(req);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const patientId = user.role === "patient" ? user.id : req.params.patientId;

    const prescriptions = await Prescription.find({ patient: patientId })
      .populate("doctor", "fullName specialization email phone")
      .populate("appointment", "startTime")
      .sort({ createdAt: -1 });

    res.status(200).json(prescriptions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get prescription details by ID
export const getPrescriptionById = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate("patient", "name email phone age gender")
      .populate("doctor", "fullName specialization email phone")
      .populate("appointment", "startTime");

    if (!prescription) {
      return res.status(404).json({ message: "Prescription not found" });
    }

    res.status(200).json(prescription);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
