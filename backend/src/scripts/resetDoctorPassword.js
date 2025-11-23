import mongoose from "mongoose";
import Doctor from "../models/doctorModel.js";
import connectDB from "../config/db.js";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

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
    
    // Hash the password directly using bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update password directly in database (bypassing pre-save hook to avoid double hashing)
    doctor.password = hashedPassword;
    await doctor.save();
    
    // Verify the password was saved correctly
    const savedDoctor = await Doctor.findOne({ email: email.toLowerCase() });
    if (savedDoctor && savedDoctor.password.startsWith('$2')) {
      console.log(`   ✅ Password successfully hashed and saved`);
      
      // Test password match
      const testMatch = await bcrypt.compare(newPassword, savedDoctor.password);
      console.log(`   ✅ Password verification test: ${testMatch ? 'PASSED ✅' : 'FAILED ❌'}`);
    } else {
      console.log(`   ⚠️  Warning: Password may not be hashed correctly`);
    }
    
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

