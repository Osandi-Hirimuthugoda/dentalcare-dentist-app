import Appointment from "../models/Appointment.js";
import Patient from "../models/Patient.js";
import Doctor from "../models/doctorModel.js";
import { createNotification } from "./notificationController.js";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dentalcare_secret_key_change_in_production";

// Helper function to extract user from token
const getUserFromToken = (req) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      console.log(" No Authorization header in request");
      return null;
    }
    
    const token = authHeader.split(" ")[1];
    if (!token) {
      console.log(" No token found in Authorization header");
      return null;
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log(` Token decoded successfully - ID: ${decoded.id}, Role: ${decoded.role || 'undefined'}`);
    return decoded;
  } catch (err) {
    console.error(` Token verification failed: ${err.message}`);
    if (err.name === 'JsonWebTokenError') {
      console.error("   Token is invalid or malformed");
    } else if (err.name === 'TokenExpiredError') {
      console.error("   Token has expired");
    }
    return null;
  }
};

//  Get all appointments (admin)
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

//  Get appointments by patient ID (for mobile app)
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

// 🩺 Get patient treatments (for My Treatments page)
export const getPatientTreatments = async (req, res) => {
  try {
    const user = getUserFromToken(req);
    if (!user || user.role !== "patient") {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const appointments = await Appointment.find({ patient: user.id })
      .populate("patient", "name email phone age gender")
      .populate("doctor", "fullName specialization email phone hospital")
      .sort({ startTime: -1 });
    
    // Convert appointments to treatments format
    const treatments = appointments.map((appt) => {
      // Extract service name from notes (format: "Service Name: notes" or just "Service Name")
      let serviceName = 'Dental Checkup'; // Default
      if (appt.notes) {
        const parts = appt.notes.split(':');
        if (parts.length > 0) {
          serviceName = parts[0].trim();
        }
      }
      
      // Map appointment status to treatment status
      let treatmentStatus = 'Upcoming';
      if (appt.status === 'completed') {
        treatmentStatus = 'Completed';
      } else if (appt.status === 'confirmed' || appt.status === 'pending') {
        const now = new Date();
        const startTime = new Date(appt.startTime);
        if (startTime < now) {
          treatmentStatus = 'Ongoing';
        } else {
          treatmentStatus = 'Upcoming';
        }
      } else if (appt.status === 'cancelled') {
        treatmentStatus = 'Cancelled';
      }
      
      // Determine treatment type from service name or doctor specialization
      let treatmentType = 'General';
      const serviceLower = serviceName.toLowerCase();
      if (serviceLower.includes('cleaning') || serviceLower.includes('scaling')) {
        treatmentType = 'Hygiene';
      } else if (serviceLower.includes('filling') || serviceLower.includes('cavity')) {
        treatmentType = 'Restorative';
      } else if (serviceLower.includes('root canal') || serviceLower.includes('rct')) {
        treatmentType = 'Endodontic';
      } else if (serviceLower.includes('braces') || serviceLower.includes('orthodont')) {
        treatmentType = 'Orthodontic';
      } else if (serviceLower.includes('whitening') || serviceLower.includes('cosmetic')) {
        treatmentType = 'Cosmetic';
      } else if (serviceLower.includes('crown') || serviceLower.includes('bridge') || serviceLower.includes('implant') || serviceLower.includes('denture')) {
        treatmentType = 'Restorative';
      } else if (serviceLower.includes('extraction') || serviceLower.includes('surgery')) {
        treatmentType = 'Surgical';
      } else if (serviceLower.includes('emergency')) {
        treatmentType = 'Emergency';
      }
      
      // Format date
      const appointmentDate = new Date(appt.startTime);
      const formattedDate = appointmentDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
      
      // Default cost (can be added to appointment model later)
      const defaultCosts = {
        'Dental Checkups & Consultations': 2500,
        'Teeth Cleaning (Scaling & Polishing)': 3000,
        'Cavity Filling': 4500,
        'Tooth Extraction': 5000,
        'Root Canal Treatment (RCT)': 12000,
        'Braces & Teeth Alignment (Orthodontics)': 5000,
        'Teeth Whitening': 8000,
        'Dental Crowns & Bridges': 15000,
        'Dental Implants & Dentures': 50000,
        'Emergency Dental Care': 4000,
      };
      
      let cost = 0;
      for (const [key, value] of Object.entries(defaultCosts)) {
        if (serviceName.toLowerCase().includes(key.toLowerCase().split(' ')[0])) {
          cost = value;
          break;
        }
      }
      if (cost === 0) {
        cost = 3000; // Default cost
      }
      
      return {
        _id: appt._id,
        id: appt._id.toString(),
        title: serviceName,
        doctor: appt.doctor ? appt.doctor.fullName : 'Unknown Doctor',
        date: formattedDate,
        status: treatmentStatus,
        cost: `LKR ${cost.toLocaleString()}`,
        type: treatmentType,
        appointmentStatus: appt.status,
        startTime: appt.startTime,
        notes: appt.notes || '',
        doctorId: appt.doctor ? appt.doctor._id.toString() : null,
      };
    });
    
    res.status(200).json(treatments);
  } catch (err) {
    console.error("❌ Error fetching patient treatments:", err);
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

// 📊 Get recent activities for health screen (for mobile app)
export const getRecentActivities = async (req, res) => {
  try {
    const user = getUserFromToken(req);
    if (!user || user.role !== "patient") {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    // Get recent appointments (last 10, sorted by date descending)
    const appointments = await Appointment.find({ patient: user.id })
      .populate("doctor", "fullName specialization")
      .sort({ startTime: -1 })
      .limit(10);
    
    // Format activities from appointments
    const activities = appointments.map((appt) => {
      const appointmentDate = new Date(appt.startTime);
      const formattedDate = appointmentDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
      
      // Determine activity type and title from appointment notes or status
      let activityTitle = 'Dental Checkup';
      let activityType = 'checkup';
      
      if (appt.notes) {
        const notesLower = appt.notes.toLowerCase();
        if (notesLower.includes('cleaning') || notesLower.includes('scaling')) {
          activityTitle = 'Teeth Cleaning';
          activityType = 'cleaning';
        } else if (notesLower.includes('x-ray') || notesLower.includes('xray')) {
          activityTitle = 'X-Ray Scan';
          activityType = 'scan';
        } else if (notesLower.includes('filling')) {
          activityTitle = 'Cavity Filling';
          activityType = 'treatment';
        } else if (notesLower.includes('extraction')) {
          activityTitle = 'Tooth Extraction';
          activityType = 'treatment';
        } else if (notesLower.includes('root canal') || notesLower.includes('rct')) {
          activityTitle = 'Root Canal Treatment';
          activityType = 'treatment';
        } else {
          // Extract service name from notes if it's in format "Service Name: description"
          const parts = appt.notes.split(':');
          if (parts.length > 0 && parts[0].trim().length > 0) {
            activityTitle = parts[0].trim();
          }
        }
      }
      
      // Get doctor name or default
      const doctorName = appt.doctor ? appt.doctor.fullName : 'Dental Care Center';
      
      return {
        id: appt._id.toString(),
        title: activityTitle,
        date: formattedDate,
        description: doctorName,
        type: activityType,
        status: appt.status,
        startTime: appt.startTime,
        doctor: appt.doctor ? {
          name: appt.doctor.fullName,
          specialization: appt.doctor.specialization
        } : null
      };
    });
    
    res.status(200).json(activities);
  } catch (err) {
    console.error("❌ Error fetching recent activities:", err);
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
      console.log(` Patient ID extracted from token: ${patientId}`);
    } else if (user) {
      console.log(` Token found but user role is: ${user.role || 'undefined'}, expected 'patient'`);
    } else {
      console.log(` No valid token found in request. Headers:`, req.headers.authorization ? "Present but invalid" : "Missing");
    }
    
    // Validate required fields
    if (!patientId) {
      console.error(" Patient ID missing - Token user:", user ? `Present (role: ${user.role || 'undefined'}, id: ${user.id || 'undefined'})` : "Missing", "- Body patient:", req.body.patient || "Missing");
      return res.status(400).json({ 
        message: "Patient ID is required. Please ensure you are logged in as a patient. If you just logged in, please try again." 
      });
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
    
    // Create notification when appointment is created
    try {
      const doctorName = appt.doctor?.fullName || "Your doctor";
      const appointmentDate = new Date(appt.startTime);
      const formattedDate = appointmentDate.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
      const formattedTime = appointmentDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Colombo'
      });
      
      let notificationTitle = "Appointment Booked";
      let notificationMessage = `Your appointment with ${doctorName} has been booked for ${formattedDate} at ${formattedTime}.`;
      
      if (appt.status === "confirmed") {
        notificationTitle = "Appointment Confirmed";
        notificationMessage = `Your appointment with ${doctorName} has been confirmed for ${formattedDate} at ${formattedTime}.`;
      } else if (appt.status === "pending") {
        notificationTitle = "Appointment Pending";
        notificationMessage = `Your appointment with ${doctorName} is pending confirmation for ${formattedDate} at ${formattedTime}. You will be notified once it's confirmed.`;
      }
      
      await createNotification({
        patient: appt.patient._id,
        doctor: appt.doctor?._id,
        appointment: appt._id,
        title: notificationTitle,
        message: notificationMessage,
        type: "appointment"
      });
      
      console.log(`✅ Notification created for appointment booking: ${appt._id}`);
    } catch (notifError) {
      // Don't fail the appointment creation if notification creation fails
      console.error("❌ Error creating notification:", notifError);
    }
    
    res.status(201).json(appt);
  } catch (err) {
    console.error("Error creating appointment:", err);
    res.status(400).json({ message: err.message });
  }
};

//  Update appointment
export const updateAppointment = async (req, res) => {
  try {
    // Get the old appointment to check if status changed
    const oldAppt = await Appointment.findById(req.params.id);
    
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
    
    // Create notifications for status changes
    if (oldAppt && oldAppt.status !== req.body.status) {
      try {
        const doctorName = appt.doctor?.fullName || "Your doctor";
        const appointmentDate = new Date(appt.startTime);
        const formattedDate = appointmentDate.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        });
        const formattedTime = appointmentDate.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'Asia/Colombo'
        });
        
        let notificationTitle = "";
        let notificationMessage = "";
        let notificationType = "appointment";
        
        if (req.body.status === "confirmed" && oldAppt.status !== "confirmed") {
          notificationTitle = "Appointment Confirmed";
          notificationMessage = `Your appointment with ${doctorName} has been confirmed for ${formattedDate} at ${formattedTime}.`;
        } else if (req.body.status === "cancelled" && oldAppt.status !== "cancelled") {
          notificationTitle = "Appointment Cancelled";
          notificationMessage = `Your appointment with ${doctorName} scheduled for ${formattedDate} at ${formattedTime} has been cancelled.`;
        } else if (req.body.status === "rescheduled" && oldAppt.status !== "rescheduled") {
          notificationTitle = "Appointment Rescheduled";
          notificationMessage = `Your appointment with ${doctorName} has been rescheduled to ${formattedDate} at ${formattedTime}.`;
        } else if (req.body.status === "completed" && oldAppt.status !== "completed") {
          notificationTitle = "Appointment Completed";
          notificationMessage = `Your appointment with ${doctorName} on ${formattedDate} has been completed. Thank you for visiting!`;
        }
        
        if (notificationTitle) {
          await createNotification({
            patient: appt.patient._id,
            doctor: appt.doctor?._id,
            appointment: appt._id,
            title: notificationTitle,
            message: notificationMessage,
            type: notificationType
          });
          
          console.log(`✅ Notification created for appointment status change: ${appt._id} - ${req.body.status}`);
        }
      } catch (notifError) {
        // Don't fail the appointment update if notification creation fails
        console.error("❌ Error creating notification:", notifError);
      }
    }
    
    res.json(appt);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

//  Delete appointment
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
