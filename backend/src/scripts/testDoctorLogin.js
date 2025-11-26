import mongoose from "mongoose";
import Doctor from "../models/doctorModel.js";
import connectDB from "../config/db.js";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

dotenv.config();

// Test doctor login credentials
const testDoctorLogin = async (email, password) => {
  try {
    await connectDB();
    console.log(`\n🔍 Testing login for: ${email}\n`);
    
    const doctor = await Doctor.findOne({ email: email.toLowerCase().trim() });
    
    if (!doctor) {
      console.log(`Doctor not found: ${email}`);
      process.exit(1);
    }
    
    console.log(`Doctor found: ${doctor.fullName}`);
    console.log(`   Email: ${doctor.email}`);
    console.log(`   Password in DB starts with: ${doctor.password.substring(0, 20)}...`);
    console.log(`   Password is hashed: ${doctor.password.startsWith('$2') ? 'Yes ' : 'No '}`);
    
    // Test password comparison
    const isMatch = await bcrypt.compare(password, doctor.password);
    
    console.log(`\n Testing password: "${password}"`);
    console.log(`   Password matches: ${isMatch ? 'Yes ' : 'No '}`);
    
    if (!isMatch) {
      console.log(`\n Suggestions:`);
      console.log(`   1. Reset password using: node resetDoctorPassword.js ${email} password123`);
      console.log(`   2. Make sure you're using the correct password`);
    } else {
      console.log(`\n Login should work with these credentials!`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error(`Error:`, error);
    process.exit(1);
  }
};

// Get command line arguments
const email = process.argv[2];
const password = process.argv[3] || 'password123';

if (!email) {
  console.log("Usage: node testDoctorLogin.js <email> [password]");
  console.log("Example: node testDoctorLogin.js ravindu1998@gmail.com password123");
  process.exit(1);
}

testDoctorLogin(email, password);
