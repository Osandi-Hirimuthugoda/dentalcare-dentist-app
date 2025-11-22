import Appointment from "../models/Appointment.js";
import Patient from "../models/Patient.js";
import Doctor from "../models/doctorModel.js";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "secretkey";

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

// 📋 Get all appointments (admin)
export const listAppointments = async (req, res) => {
  try {
    const items = await Appointment.find()
      .populate("patient", "name email phone age gender")
      .populate("doctor", "fullName specialization email phone")
      .sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 📋 Get appointments by patient ID (for mobile app)
export const getAppointmentsByPatient = async (req, res) => {
  try {
    const user = getUserFromToken(req);
    if (!user || user.role !== "patient") {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const appointments = await Appointment.find({ patient: user.id })
      .populate("patient", "name email phone age gender")
      .populate("doctor", "fullName specialization email phone hospital")
      .sort({ startTime: -1 });
    
    res.status(200).json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 📋 Get appointments by doctor ID (for web app)
export const getAppointmentsByDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const appointments = await Appointment.find({ doctor: doctorId })
      .populate("patient", "name email phone age gender history images diagnosis doctorNotes")
      .populate("doctor", "fullName specialization email phone hospital")
      .sort({ createdAt: -1 });
    
    res.status(200).json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ➕ Create appointment
export const createAppointment = async (req, res) => {
  try {
    // Extract patient ID from token if available, otherwise use from body
    const user = getUserFromToken(req);
    let patientId = req.body.patient;
    
    // If token exists and user is a patient, use token's patient ID
    if (user && user.role === "patient") {
      patientId = user.id;
    }
    
    // Validate required fields
    if (!patientId) {
      return res.status(400).json({ message: "Patient ID is required" });
    }
    
    if (!req.body.startTime) {
      return res.status(400).json({ message: "Start time is required" });
    }
    
    if (!req.body.doctor) {
      return res.status(400).json({ message: "Doctor ID is required" });
    }
    
    // Verify patient exists
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }
    
    // Verify doctor exists
    const doctor = await Doctor.findById(req.body.doctor);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }
    
    // Create appointment
    const appointmentData = {
      patient: patientId,
      doctor: req.body.doctor, // Doctor ID is now required
      startTime: new Date(req.body.startTime),
      endTime: req.body.endTime ? new Date(req.body.endTime) : null,
      status: req.body.status || "pending",
      notes: req.body.notes || "",
      teleconsult: req.body.teleconsult || false,
    };
    
    const appt = new Appointment(appointmentData);
    await appt.save();
    
    // Populate before sending
    await appt.populate("patient", "name email phone age gender");
    await appt.populate("doctor", "fullName specialization email phone hospital");
    
    res.status(201).json(appt);
  } catch (err) {
    console.error("Error creating appointment:", err);
    res.status(400).json({ message: err.message });
  }
};

// ✏️ Update appointment
export const updateAppointment = async (req, res) => {
  try {
    const appt = await Appointment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate("patient", "name email phone age gender")
      .populate("doctor", "fullName specialization");
    
    if (!appt) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    
    res.json(appt);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// 🗑️ Delete appointment
export const deleteAppointment = async (req, res) => {
  try {
    const appt = await Appointment.findByIdAndDelete(req.params.id);
    if (!appt) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    res.status(200).json({ message: "Appointment deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
