import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Patient from "../models/Patient.js";

const JWT_SECRET = process.env.JWT_SECRET || "dentalcare_secret_key_change_in_production";

// Register new patient (for mobile app)
export const registerPatient = async (req, res) => {
  try {
    const { name, email, password, phone, age, gender } = req.body;

    // Validate required fields
    if (!name || !email || !password || !phone) {
      return res.status(400).json({ 
        message: "Please provide name, email, password, and phone number" 
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ 
        message: "Password must be at least 6 characters long" 
      });
    }

    // Check if patient already exists
    const existingPatient = await Patient.findOne({ email: email.toLowerCase() });
    if (existingPatient) {
      return res.status(409).json({ 
        message: "An account with this email already exists" 
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create new patient
    const patient = new Patient({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      phone: phone.trim(),
      age: age ? parseInt(age) : undefined,
      gender: gender ? gender.toLowerCase() : undefined,
    });

    // Save patient to database
    await patient.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: patient._id, role: "patient" }, 
      JWT_SECRET, 
      { expiresIn: "7d" }
    );

    // Format response for mobile app
    const patientResponse = {
      id: patient._id.toString(),
      name: patient.name,
      email: patient.email,
      phone: patient.phone,
      age: patient.age,
      gender: patient.gender,
      bloodGroup: patient.bloodGroup,
      address: patient.address,
      status: patient.status,
      isEmailVerified: patient.isEmailVerified,
      createdAt: patient.createdAt,
      updatedAt: patient.updatedAt,
    };

    console.log(`New patient registered: ${patient.email}`);

    res.status(201).json({
      message: "Registration successful",
      user: patientResponse,
      token,
    });

  } catch (error) {
    console.error("Registration error:", error.message);
    
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
      message: "Registration failed. Please try again later." 
    });
  }
};

// Login patient (for mobile app)
export const loginPatient = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ 
        message: "Please provide email and password" 
      });
    }

    // Find patient by email
    const patient = await Patient.findOne({ email: email.toLowerCase() });
    if (!patient) {
      return res.status(401).json({ 
        message: "Invalid email or password" 
      });
    }

    // Check if account is active
    if (patient.status === "inactive") {
      return res.status(403).json({ 
        message: "Your account has been deactivated. Please contact support." 
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, patient.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        message: "Invalid email or password" 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: patient._id, role: "patient" }, 
      JWT_SECRET, 
      { expiresIn: "7d" }
    );

    // Format response for mobile app
    const patientResponse = {
      id: patient._id.toString(),
      name: patient.name,
      email: patient.email,
      phone: patient.phone,
      age: patient.age,
      gender: patient.gender,
      bloodGroup: patient.bloodGroup,
      address: patient.address,
      status: patient.status,
      isEmailVerified: patient.isEmailVerified,
      createdAt: patient.createdAt,
      updatedAt: patient.updatedAt,
    };

    console.log(`Patient logged in: ${patient.email}`);

    res.json({
      message: "Login successful",
      user: patientResponse,
      token,
    });

  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ 
      message: "Login failed. Please try again later." 
    });
  }
};

// 👤 Get current patient profile (for mobile app)
export const getCurrentPatient = async (req, res) => {
  try {
    // Extract user from token
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "No authorization header" });
    }
    
    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }
    
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
    
    if (decoded.role !== "patient") {
      return res.status(403).json({ message: "Access denied. Patient account required." });
    }
    
    // Find patient by ID
    const patient = await Patient.findById(decoded.id);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }
    
    // Format response for mobile app
    const patientResponse = {
      id: patient._id.toString(),
      name: patient.name,
      email: patient.email,
      phone: patient.phone,
      age: patient.age,
      gender: patient.gender,
      bloodGroup: patient.bloodGroup,
      address: patient.address,
      status: patient.status,
      isEmailVerified: patient.isEmailVerified,
      createdAt: patient.createdAt,
      updatedAt: patient.updatedAt,
    };
    
    res.json({
      message: "Patient profile retrieved successfully",
      user: patientResponse,
    });
  } catch (error) {
    console.error("Error getting patient profile:", error.message);
    res.status(500).json({ 
      message: "Failed to retrieve profile. Please try again later." 
    });
  }
};

// Update patient profile (for mobile app)
export const updatePatientProfile = async (req, res) => {
  try {
    // Extract user from token
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "No authorization header" });
    }
    
    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }
    
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
    
    if (decoded.role !== "patient") {
      return res.status(403).json({ message: "Access denied. Patient account required." });
    }
    
    // Find patient by ID
    const patient = await Patient.findById(decoded.id);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }
    
    // Update allowed fields
    const { name, phone, age, gender, bloodGroup, address } = req.body;
    
    if (name !== undefined) patient.name = name.trim();
    if (phone !== undefined) patient.phone = phone.trim();
    if (age !== undefined) patient.age = age ? parseInt(age) : undefined;
    if (gender !== undefined) patient.gender = gender ? gender.toLowerCase() : undefined;
    if (bloodGroup !== undefined) patient.bloodGroup = bloodGroup;
    if (address !== undefined) patient.address = address.trim();
    
    await patient.save();
    
    // Format response for mobile app
    const patientResponse = {
      id: patient._id.toString(),
      name: patient.name,
      email: patient.email,
      phone: patient.phone,
      age: patient.age,
      gender: patient.gender,
      bloodGroup: patient.bloodGroup,
      address: patient.address,
      status: patient.status,
      isEmailVerified: patient.isEmailVerified,
      createdAt: patient.createdAt,
      updatedAt: patient.updatedAt,
    };
    
    res.json({
      message: "Profile updated successfully",
      user: patientResponse,
    });
  } catch (error) {
    console.error("Error updating patient profile:", error.message);
    res.status(500).json({ 
      message: "Failed to update profile. Please try again later." 
    });
  }
};

// Forgot password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Please provide an email address" });
    }

    const patient = await Patient.findOne({ email: email.toLowerCase() });
    
    // For security, don't reveal if email exists
    // Always return success message
    res.json({ 
      message: "If an account exists with this email, password reset instructions will be sent" 
    });

    // TODO: Implement email sending logic here
    // if (patient) {
    //   // Generate reset token
    //   // Send email with reset link
    // }

  } catch (error) {
    console.error("Forgot password error:", error.message);
    res.status(500).json({ 
      message: "Unable to process request. Please try again later." 
    });
  }
};

// Verify email
export const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ 
        message: "Please provide email and OTP" 
      });
    }

    const patient = await Patient.findOne({ email: email.toLowerCase() });
    if (!patient) {
      return res.status(404).json({ message: "Account not found" });
    }

    if (patient.emailVerificationOTP === otp) {
      patient.isEmailVerified = true;
      patient.emailVerificationOTP = undefined;
      await patient.save();
      
      res.json({ message: "Email verified successfully" });
    } else {
      res.status(400).json({ message: "Invalid OTP" });
    }

  } catch (error) {
    console.error("Email verification error:", error.message);
    res.status(500).json({ 
      message: "Email verification failed. Please try again later." 
    });
  }
};
