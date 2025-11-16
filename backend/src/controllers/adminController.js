import Admin from "../models/Admin.js";
import Doctor from "../models/doctorModel.js";
import Patient from "../models/Patient.js";
import Appointment from "../models/Appointment.js";
import bcrypt from "bcryptjs";

// 🔐 Admin Login
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if admin exists
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.status(200).json({
      message: "Login successful",
      admin: {
        _id: admin._id,
        email: admin.email,
        role: "admin",
      },
    });
  } catch (err) {
    console.error("❌ Error in admin login:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 📊 Get Admin Dashboard Statistics
export const getDashboardStats = async (req, res) => {
  try {
    // Get total doctors
    const totalDoctors = await Doctor.countDocuments();

    // Get total appointments
    const totalAppointments = await Appointment.countDocuments();

    // Get total patients
    const totalPatients = await Patient.countDocuments();

    // Get new registrations (doctors registered this month)
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const newRegistrations = await Doctor.countDocuments({
      createdAt: { $gte: startOfMonth },
    });

    // Get recent doctors (last 5)
    const recentDoctors = await Doctor.find()
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(5);

    // Get appointments today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const appointmentsToday = await Appointment.countDocuments({
      startTime: { $gte: today, $lt: tomorrow },
    });

    // Get pending appointments
    const pendingAppointments = await Appointment.countDocuments({
      status: "pending",
    });

    // Get completed appointments this month
    const completedThisMonth = await Appointment.countDocuments({
      status: "completed",
      startTime: { $gte: startOfMonth },
    });

    res.status(200).json({
      stats: {
        totalDoctors,
        totalAppointments,
        totalPatients,
        newRegistrations,
        appointmentsToday,
        pendingAppointments,
        completedThisMonth,
      },
      recentDoctors,
    });
  } catch (error) {
    console.error("❌ Error fetching dashboard stats:", error);
    res.status(500).json({ message: "Error fetching dashboard statistics", error: error.message });
  }
};

// 📋 Get All Doctors (for admin)
export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find()
      .select("-password")
      .sort({ createdAt: -1 });
    res.status(200).json(doctors);
  } catch (error) {
    console.error("❌ Error fetching doctors:", error);
    res.status(500).json({ message: "Error fetching doctors", error: error.message });
  }
};

// ➕ Register Doctor (Admin only)
export const registerDoctor = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      password,
      licenseNumber,
      specialization,
      qualifications,
      hospital,
      experience,
    } = req.body;

    // Check existing doctor
    const doctorExists = await Doctor.findOne({ email });
    if (doctorExists) {
      return res.status(400).json({ message: "Doctor already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create doctor
    const doctor = await Doctor.create({
      fullName,
      email,
      phone,
      password: hashedPassword,
      licenseNumber,
      specialization,
      qualifications,
      hospital,
      experience,
    });

    // Return doctor without password
    const doctorData = {
      _id: doctor._id,
      fullName: doctor.fullName,
      email: doctor.email,
      phone: doctor.phone,
      licenseNumber: doctor.licenseNumber,
      specialization: doctor.specialization,
      qualifications: doctor.qualifications,
      hospital: doctor.hospital,
      experience: doctor.experience,
      createdAt: doctor.createdAt,
    };

    res.status(201).json({
      message: "Doctor registered successfully",
      doctor: doctorData,
    });
  } catch (error) {
    console.error("❌ Error registering doctor:", error);
    res.status(500).json({ message: "Error registering doctor", error: error.message });
  }
};

// 🗑️ Delete Doctor (Admin only)
export const deleteDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;

    // Check if doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    // Delete all appointments associated with this doctor
    await Appointment.deleteMany({ doctor: doctorId });

    // Update patients who selected this doctor (remove the selection)
    await Patient.updateMany(
      { selectedDoctor: doctorId },
      { $unset: { selectedDoctor: "" } }
    );

    // Delete the doctor
    await Doctor.findByIdAndDelete(doctorId);

    res.status(200).json({ message: "Doctor deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting doctor:", error);
    res.status(500).json({ message: "Error deleting doctor", error: error.message });
  }
};

// ✏️ Update Doctor (Admin only)
export const updateDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const {
      fullName,
      email,
      phone,
      licenseNumber,
      specialization,
      qualifications,
      hospital,
      experience,
    } = req.body;

    const doctor = await Doctor.findByIdAndUpdate(
      doctorId,
      {
        fullName,
        email,
        phone,
        licenseNumber,
        specialization,
        qualifications,
        hospital,
        experience,
      },
      { new: true, runValidators: true }
    ).select("-password");

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    res.status(200).json({ message: "Doctor updated successfully", doctor });
  } catch (error) {
    console.error("❌ Error updating doctor:", error);
    res.status(500).json({ message: "Error updating doctor", error: error.message });
  }
};

// 📊 Get System Activity
export const getSystemActivity = async (req, res) => {
  try {
    // Get recent doctor registrations (last 10)
    const recentRegistrations = await Doctor.find()
      .select("fullName email specialization createdAt")
      .sort({ createdAt: -1 })
      .limit(10);

    // Get total counts
    const totalDoctors = await Doctor.countDocuments();
    const totalAppointments = await Appointment.countDocuments();
    const totalPatients = await Patient.countDocuments();

    // Get active appointments today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const activeToday = await Appointment.countDocuments({
      startTime: { $gte: today, $lt: tomorrow },
      status: { $in: ["pending", "confirmed"] },
    });

    // Get appointments by status
    const appointmentsByStatus = await Appointment.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Get doctors by specialization
    const doctorsBySpecialization = await Doctor.aggregate([
      {
        $group: {
          _id: "$specialization",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.status(200).json({
      recentRegistrations,
      systemStats: {
        totalDoctors,
        totalAppointments,
        totalPatients,
        activeToday,
        systemUptime: "99.9%", // This could be calculated from actual uptime data
      },
      appointmentsByStatus,
      doctorsBySpecialization,
    });
  } catch (error) {
    console.error("❌ Error fetching system activity:", error);
    res.status(500).json({ message: "Error fetching system activity", error: error.message });
  }
};

// 📋 Get All Patients (Admin)
export const getAllPatients = async (req, res) => {
  try {
    const patients = await Patient.find()
      .populate("selectedDoctor", "fullName specialization email phone")
      .sort({ createdAt: -1 });
    res.status(200).json(patients);
  } catch (error) {
    console.error("❌ Error fetching patients:", error);
    res.status(500).json({ message: "Error fetching patients", error: error.message });
  }
};

// 📋 Get All Appointments (Admin)
export const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate("patient", "name email phone age gender")
      .populate("doctor", "fullName specialization email phone")
      .sort({ createdAt: -1 });
    res.status(200).json(appointments);
  } catch (error) {
    console.error("❌ Error fetching appointments:", error);
    res.status(500).json({ message: "Error fetching appointments", error: error.message });
  }
};

