/**
 * Create a test doctor for login.
 * Run: node createTestDoctor.js  (from backend folder)
 * Or with Docker: docker exec -it dentalcare-backend node createTestDoctor.js
 *
 * Then login at http://localhost:3000/doctor-login with:
 *   Email: doctor@test.com
 *   Password: Test123!
 */

import dotenv from "dotenv";
import mongoose from "mongoose";
import Doctor from "./src/models/doctorModel.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/dentalcare";

const TEST_DOCTOR = {
  fullName: "Test Doctor",
  email: "doctor@test.com",
  phone: "0712345678",
  password: "Test123!",
  licenseNumber: "LIC001",
  specialization: "General Dentistry",
};

async function createTestDoctor() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected.\n");

    const existing = await Doctor.findOne({ email: TEST_DOCTOR.email });
    if (existing) {
      console.log("Test doctor already exists:", TEST_DOCTOR.email);
      console.log("You can login with:");
      console.log("  Email:    doctor@test.com");
      console.log("  Password: Test123!\n");
      process.exit(0);
      return;
    }

    await Doctor.create(TEST_DOCTOR);
    console.log("Test doctor created successfully!\n");
    console.log("Login at http://localhost:3000/doctor-login with:");
    console.log("  Email:    doctor@test.com");
    console.log("  Password: Test123!\n");
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

createTestDoctor();
