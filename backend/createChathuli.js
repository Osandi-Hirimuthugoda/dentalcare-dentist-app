import dotenv from "dotenv";
import mongoose from "mongoose";
import Patient from "./src/models/Patient.js";
import bcrypt from "bcryptjs";

dotenv.config();

const MONGO_URI = "mongodb://localhost:27017/dentalcare";

async function createSpecificPatient() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected.");

    const email = "chathuli@gmail.com";
    const password = "Chathuli@2003";

    const existingPatient = await Patient.findOne({ email: email.toLowerCase() });
    if (existingPatient) {
      console.log(`Patient already exists: ${email}`);
      process.exit(0);
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await Patient.create({
      name: "Chathuli",
      email: email.toLowerCase(),
      passwordHash,
      phone: "0712345678",
      age: 21,
      gender: "female",
    });

    console.log(`✅ Successfully created patient: ${email}`);
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

createSpecificPatient();
