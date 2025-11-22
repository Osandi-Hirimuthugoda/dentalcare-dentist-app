import Patient from "../models/Patient.js";
import Appointment from "../models/Appointment.js";
import Doctor from "../models/doctorModel.js";

// 📋 Get all patients
export const getPatients = async (req, res) => {
  try {
    const patients = await Patient.find().populate("selectedDoctor", "fullName specialization email phone");
    res.status(200).json(patients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 📋 Get patients by doctor ID (for web app - doctors viewing their patients)
export const getPatientsByDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;
    
    // Find all appointments for this doctor to get unique patients
    const appointments = await Appointment.find({ doctor: doctorId })
      .populate("patient", "name email phone age gender createdAt")
      .sort({ createdAt: -1 });
    
    // Get unique patients from appointments
    const uniquePatientsMap = new Map();
    appointments.forEach(apt => {
      if (apt.patient && apt.patient._id) {
        if (!uniquePatientsMap.has(apt.patient._id.toString())) {
          uniquePatientsMap.set(apt.patient._id.toString(), apt.patient);
        }
      }
    });
    
    const patients = Array.from(uniquePatientsMap.values());
    
    res.status(200).json(patients);
  } catch (error) {
    console.error("❌ Error fetching patients by doctor:", error);
    res.status(500).json({ message: error.message });
  }
};

// ➕ Add a new patient (from mobile app)
export const addPatient = async (req, res) => {
  try {
    const { name, email, phone, age, gender } = req.body;
    
    // Check if patient already exists
    const existingPatient = await Patient.findOne({ email });
    if (existingPatient) {
      return res.status(400).json({ message: "Patient with this email already exists" });
    }
    
    const patient = new Patient({
      name,
      email,
      phone,
      age,
      gender,
    });
    
    await patient.save();
    res.status(201).json(patient);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// 🔗 User selects a doctor (from mobile app)
export const selectDoctor = async (req, res) => {
  try {
    const { patientId, doctorId } = req.body;
    
    // Validate patient exists
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }
    
    // Validate doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }
    
    // Update patient with selected doctor
    patient.selectedDoctor = doctorId;
    await patient.save();
    
    // Create an appointment automatically
    const appointment = new Appointment({
      patient: patientId,
      doctor: doctorId,
      startTime: new Date(),
      status: "pending",
    });
    await appointment.save();
    
    // Return patient with doctor details
    const updatedPatient = await Patient.findById(patientId)
      .populate("selectedDoctor", "fullName specialization email phone hospital");
    
    res.status(200).json({
      message: "Doctor selected successfully",
      patient: updatedPatient,
      appointment,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 📄 Get patient details by ID
export const getPatientById = async (req, res) => {
  try {
    const { id } = req.params;
    const patient = await Patient.findById(id)
      .populate("selectedDoctor", "fullName specialization email phone hospital");
    
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }
    
    res.status(200).json(patient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✏️ Update patient information (doctor can add notes, diagnosis, etc.)
export const updatePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const { diagnosis, doctorNotes, history, images } = req.body;
    
    const patient = await Patient.findByIdAndUpdate(
      id,
      { diagnosis, doctorNotes, history, images },
      { new: true, runValidators: true }
    ).populate("selectedDoctor", "fullName specialization");
    
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }
    
    res.status(200).json(patient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🗑️ Delete patient (Admin only)
export const deletePatient = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if patient exists
    const patient = await Patient.findById(id);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    // Delete all appointments associated with this patient
    await Appointment.deleteMany({ patient: id });

    // Delete the patient
    await Patient.findByIdAndDelete(id);

    res.status(200).json({ message: "Patient deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting patient:", error);
    res.status(500).json({ message: "Error deleting patient", error: error.message });
  }
};
