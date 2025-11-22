import Doctor from "../models/doctorModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// 🔹 Register Doctor
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
      services, // Services/categories doctor offers
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
      services: services || [], // Services/categories doctor offers
    });

    res.status(201).json({
      message: "Doctor registered successfully",
      doctor,
    });
  } catch (error) {
    console.error("❌ Error registering doctor:", error);
    res.status(500).json({ message: "Error registering doctor", error });
  }
};

// 🔹 Login Doctor
export const loginDoctor = async (req, res) => {
  try {
    const { email, password } = req.body;
    const doctor = await Doctor.findOne({ email });

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    const isMatch = await bcrypt.compare(password, doctor.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: doctor._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
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

    res.json({ token, doctor: doctorData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔹 Get Doctor Profile
export const getDoctorProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).select("-password");
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    res.status(200).json(doctor);
  } catch (error) {
    console.error("❌ Error fetching doctor profile:", error);
    res.status(500).json({ message: "Error fetching profile", error });
  }
};

// 🔹 Get All Doctors (Admin only)
export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find().select("-password").sort({ createdAt: -1 });
    res.status(200).json(doctors);
  } catch (error) {
    console.error("❌ Error fetching doctors:", error);
    res.status(500).json({ message: "Error fetching doctors", error });
  }
};

// 🔹 Change Password
export const changePassword = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current password and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    // Find doctor
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, doctor.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    doctor.password = hashedPassword;
    await doctor.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("❌ Error changing password:", error);
    res.status(500).json({ message: "Error changing password", error });
  }
};

// 🔹 Update Doctor Profile
export const updateDoctorProfile = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { fullName, phone, specialization, qualifications, hospital, experience } = req.body;

    const doctor = await Doctor.findByIdAndUpdate(
      doctorId,
      { fullName, phone, specialization, qualifications, hospital, experience },
      { new: true, runValidators: true }
    ).select("-password");

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    res.status(200).json({ message: "Profile updated successfully", doctor });
  } catch (error) {
    console.error("❌ Error updating profile:", error);
    res.status(500).json({ message: "Error updating profile", error });
  }
};