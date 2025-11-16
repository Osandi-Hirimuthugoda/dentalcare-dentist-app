import Appointment from "../models/Appointment.js";
import Patient from "../models/Patient.js";

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
    const appt = new Appointment(req.body);
    await appt.save();
    
    // Populate before sending
    await appt.populate("patient", "name email phone");
    await appt.populate("doctor", "fullName specialization");
    
    res.status(201).json(appt);
  } catch (err) {
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
