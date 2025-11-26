import mongoose from "mongoose";
import Doctor from "../models/doctorModel.js";
import connectDB from "../config/db.js";
import dotenv from "dotenv";

dotenv.config();

// List all doctors with their emails
const listDoctors = async () => {
  try {
    await connectDB();
    console.log(`\n Listing all doctors...\n`);
    
    const doctors = await Doctor.find().select("fullName email specialization phone createdAt").sort({ createdAt: -1 });
    
    if (doctors.length === 0) {
      console.log(" No doctors found in the database.");
      process.exit(0);
    }
    
    console.log(` Found ${doctors.length} doctor(s):\n`);
    console.log("=".repeat(80));
    console.log(`${"Name".padEnd(30)} ${"Email".padEnd(35)} ${"Specialization".padEnd(20)}`);
    console.log("=".repeat(80));
    
    doctors.forEach((doctor, index) => {
      const name = (doctor.fullName || "N/A").padEnd(30);
      const email = (doctor.email || "N/A").padEnd(35);
      const spec = (doctor.specialization || "N/A").padEnd(20);
      console.log(`${name} ${email} ${spec}`);
    });
    
    console.log("=".repeat(80));
    console.log(`\n To reset a doctor's password, use:`);
    console.log(`   node resetDoctorPassword.js <email> <new_password>`);
    console.log(`   Example: node resetDoctorPassword.js ${doctors[0].email} password123\n`);
    
    process.exit(0);
  } catch (error) {
    console.error(` Error listing doctors:`, error);
    process.exit(1);
  }
};

listDoctors();

