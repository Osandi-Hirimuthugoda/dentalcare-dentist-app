import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import Doctor from "../models/doctorModel.js";
import Patient from "../models/Patient.js";

const JWT_SECRET = process.env.JWT_SECRET || "secretkey";

// 🧑‍⚕️ Admin login
export const loginAdmin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const isValid = await bcrypt.compare(password, admin.passwordHash);
    if (!isValid) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: admin._id, role: "admin" }, JWT_SECRET, { expiresIn: "1d" });
    res.json({ token, admin });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ➕ Register new doctor (admin only)
export const registerDoctor = async (req, res) => {
  const { fullName, email, password, phone, licenseNumber, specialization, qualifications, hospital, experience } = req.body;
  try {
    // doctorModel.js has a pre-save hook that hashes the password automatically
    const doctor = new Doctor({ 
      fullName: fullName || req.body.name || 'Doctor', // Support both name and fullName
      email, 
      password, // Will be hashed by pre-save hook
      phone: phone || '0000000000',
      licenseNumber: licenseNumber || 'N/A',
      specialization,
      qualifications,
      hospital,
      experience,
    });
    await doctor.save();
    // Remove password from response
    const doctorResponse = doctor.toObject();
    delete doctorResponse.password;
    res.status(201).json({ message: "Doctor registered successfully", doctor: doctorResponse });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// 👤 Patient registration
export const registerPatient = async (req, res) => {
  const { name, email, password, phone, age, gender } = req.body;
  
  console.log("📝 Registration request received:", { name, email, phone, age, gender });
  
  try {
    // Check if patient already exists
    const existingPatient = await Patient.findOne({ email });
    if (existingPatient) {
      console.log("❌ Email already exists:", email);
      return res.status(409).json({ message: "Patient with this email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const patient = new Patient({
      name,
      email,
      passwordHash,
      phone,
      age,
      gender,
    });
    
    console.log("💾 Saving patient to database...");
    await patient.save();
    console.log("✅ Patient saved successfully with ID:", patient._id);

    // Generate token
    const token = jwt.sign({ id: patient._id, role: "patient" }, JWT_SECRET, { expiresIn: "7d" });

    // Remove password from response and format for mobile app
    const patientResponse = patient.toObject();
    delete patientResponse.passwordHash;
    
    // Convert _id to id for mobile app compatibility
    patientResponse.id = patientResponse._id.toString();
    delete patientResponse._id;

    console.log("✅ Registration successful, sending response");
    res.status(201).json({
      message: "Patient registered successfully",
      user: patientResponse,
      token,
    });
  } catch (err) {
    console.error("❌ Registration error:", err.message);
    console.error("Error stack:", err.stack);
    res.status(400).json({ message: err.message });
  }
};

// 👤 Patient login
export const loginPatient = async (req, res) => {
  const { email, password } = req.body;
  try {
    const patient = await Patient.findOne({ email });
    if (!patient) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isValid = await bcrypt.compare(password, patient.passwordHash);
    if (!isValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: patient._id, role: "patient" }, JWT_SECRET, { expiresIn: "7d" });

    // Remove password from response and format for mobile app
    const patientResponse = patient.toObject();
    delete patientResponse.passwordHash;
    
    // Convert _id to id for mobile app compatibility
    patientResponse.id = patientResponse._id.toString();
    delete patientResponse._id;

    res.json({
      message: "Login successful",
      user: patientResponse,
      token,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🔐 Forgot password
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const patient = await Patient.findOne({ email });
    if (!patient) {
      // Don't reveal if email exists for security
      return res.status(200).json({ message: "If email exists, password reset link will be sent" });
    }

    // TODO: Implement email sending logic here
    // For now, just return success
    res.status(200).json({ message: "Password reset instructions sent to email" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Verify email
export const verifyEmail = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const patient = await Patient.findOne({ email });
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    if (patient.emailVerificationOTP === otp) {
      patient.isEmailVerified = true;
      patient.emailVerificationOTP = undefined;
      await patient.save();
      res.status(200).json({ message: "Email verified successfully" });
    } else {
      res.status(400).json({ message: "Invalid OTP" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
