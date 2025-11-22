import mongoose from "mongoose";
import Doctor from "../models/doctorModel.js";
import connectDB from "../config/db.js";
import dotenv from "dotenv";

dotenv.config();

// Reset password for a doctor
const resetDoctorPassword = async (email, newPassword) => {
  try {
    await connectDB();
    console.log(`\n🔧 Resetting password for: ${email}...`);
    
    const doctor = await Doctor.findOne({ email: email.toLowerCase() });
    
    if (!doctor) {
      console.log(`❌ Doctor not found: ${email}`);
      return;
    }
    
    // Set new password (will be hashed by pre-save hook)
    doctor.password = newPassword;
    await doctor.save();
    
    console.log(`✅ Password reset successfully for: ${email}`);
    console.log(`   New password: ${newPassword}`);
    
    process.exit(0);
  } catch (error) {
    console.error(`❌ Error resetting password:`, error);
    process.exit(1);
  }
};

// Get command line arguments
const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.log("Usage: node resetDoctorPassword.js <email> <new_password>");
  console.log("Example: node resetDoctorPassword.js doctor@example.com newpassword123");
  process.exit(1);
}

resetDoctorPassword(email, password);

