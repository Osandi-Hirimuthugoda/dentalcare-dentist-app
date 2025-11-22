import Doctor from "../models/doctorModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dentalcare_secret_key_change_in_production";

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

    // Validate required fields
    if (!fullName || !email || !phone || !password || !licenseNumber) {
      return res.status(400).json({ 
        message: "Please provide all required fields: fullName, email, phone, password, licenseNumber" 
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ 
        message: "Password must be at least 6 characters long" 
      });
    }

    // Check existing doctor (normalize email to lowercase)
    const normalizedEmail = email.toLowerCase().trim();
    const doctorExists = await Doctor.findOne({ email: normalizedEmail });
    if (doctorExists) {
      return res.status(400).json({ message: "Doctor already exists with this email" });
    }

    // Create doctor (password will be hashed automatically by the model's pre-save hook)
    const doctor = await Doctor.create({
      fullName: fullName.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      password: password, // Will be hashed by pre-save hook
      licenseNumber: licenseNumber.trim(),
      specialization: specialization?.trim(),
      qualifications: qualifications?.trim(),
      hospital: hospital?.trim(),
      experience: experience ? parseInt(experience) : undefined,
      services: services || [], // Services/categories doctor offers
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
      services: doctor.services || [],
      createdAt: doctor.createdAt,
    };

    console.log(`✅ Doctor registered successfully: ${doctor.email}`);

    res.status(201).json({
      message: "Doctor registered successfully",
      doctor: doctorData,
    });
  } catch (error) {
    console.error("❌ Error registering doctor:", error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({ 
        message: "An account with this email already exists" 
      });
    }
    
    // Handle validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(", ") });
    }
    
    res.status(500).json({ 
      message: "Error registering doctor", 
      error: process.env.NODE_ENV === "development" ? error.message : undefined 
    });
  }
};

// 🔹 Login Doctor
export const loginDoctor = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ 
        message: "Please provide email and password" 
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const trimmedPassword = password.trim(); // Trim password to avoid whitespace issues
    
    console.log(`🔍 Login attempt for: ${normalizedEmail}`);
    console.log(`   Password length: ${trimmedPassword.length} characters`);
    
    const doctor = await Doctor.findOne({ email: normalizedEmail });

    if (!doctor) {
      console.log(`❌ Doctor not found: ${normalizedEmail}`);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check if password exists (for backward compatibility)
    if (!doctor.password) {
      console.log(`❌ Doctor has no password: ${normalizedEmail}`);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check if password in DB is properly hashed
    const isPasswordHashed = doctor.password.startsWith('$2');
    console.log(`   Password in DB is hashed: ${isPasswordHashed ? 'Yes ✅' : 'No ❌'}`);
    console.log(`   Password hash starts with: ${doctor.password.substring(0, 7)}...`);

    // Compare passwords
    const isMatch = await bcrypt.compare(trimmedPassword, doctor.password);
    
    if (!isMatch) {
      console.log(`❌ Password mismatch for doctor: ${normalizedEmail}`);
      console.log(`   Attempted password: "${trimmedPassword}" (length: ${trimmedPassword.length})`);
      console.log(`   💡 Tip: Make sure you're using the correct password.`);
      console.log(`   💡 For existing doctors, try: password123`);
      return res.status(401).json({ 
        message: "Invalid email or password. Please check your credentials and try again." 
      });
    }
    
    console.log(`✅ Password matches for: ${normalizedEmail}`);

    console.log(`✅ Doctor logged in successfully: ${doctor.email}`);

    // Generate JWT token with role
    const token = jwt.sign(
      { id: doctor._id, role: "doctor" }, 
      JWT_SECRET, 
      { expiresIn: "30d" }
    );

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
      services: doctor.services || [],
      createdAt: doctor.createdAt,
    };

    console.log(`✅ Doctor logged in: ${doctor.email}`);

    res.status(200).json({ 
      message: "Login successful",
      token, 
      doctor: doctorData 
    });
  } catch (error) {
    console.error("❌ Doctor login error:", error);
    res.status(500).json({ message: error.message || "Login failed. Please try again later." });
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

// 🔹 Reset Password (Admin/self reset without current password)
export const resetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const { newPassword, adminToken } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ 
        message: "Email and new password are required" 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        message: "New password must be at least 6 characters" 
      });
    }

    // Find doctor by email
    const doctor = await Doctor.findOne({ email: email.toLowerCase().trim() });
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    // Reset password (will be hashed by pre-save hook)
    doctor.password = newPassword;
    await doctor.save();

    console.log(`✅ Password reset successfully for: ${doctor.email}`);

    res.status(200).json({ 
      message: "Password reset successfully. Please login with your new password." 
    });
  } catch (error) {
    console.error("❌ Error resetting password:", error);
    res.status(500).json({ 
      message: "Error resetting password", 
      error: process.env.NODE_ENV === "development" ? error.message : undefined 
    });
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