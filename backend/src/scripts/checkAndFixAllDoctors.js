import Doctor from "../models/doctorModel.js";
import connectDB from "../config/db.js";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

// Check and fix all doctors' passwords
const checkAndFixAllDoctors = async () => {
  try {
    await connectDB();
    console.log(`\n🔍 Checking all doctors' passwords...\n`);
    
    // Get all doctors
    const doctors = await Doctor.find();
    console.log(`Found ${doctors.length} doctors\n`);
    
    if (doctors.length === 0) {
      console.log("No doctors found in database");
      process.exit(0);
    }
    
    const defaultPassword = "password123";
    let resetCount = 0;
    let skipCount = 0;
    
    console.log("Resetting ALL doctors' passwords to ensure they can login...\n");
    
    for (const doctor of doctors) {
      try {
        console.log(`Processing: ${doctor.email} (${doctor.fullName})...`);
        
        // Directly hash and update password using updateOne to bypass pre-save hook
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);
        
        await Doctor.updateOne(
          { _id: doctor._id },
          { $set: { password: hashedPassword } }
        );
        
        console.log(`Password reset for: ${doctor.email}`);
        resetCount++;
      } catch (error) {
        console.error(`Error for ${doctor.email}:`, error.message);
      }
    }
    
    console.log(`\nSummary:`);
    console.log(`Successfully reset: ${resetCount} doctors`);
    console.log(`Skipped: ${skipCount} doctors`);
    console.log(`\n ALL passwords have been reset to: ${defaultPassword}`);
    console.log(`Please ask all doctors to login with password: ${defaultPassword}`);
    console.log(`They should change their passwords after login!`);
    
    process.exit(0);
  } catch (error) {
    console.error(`Error:`, error);
    process.exit(1);
  }
};

checkAndFixAllDoctors();

