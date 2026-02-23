/**
 * List all patients from MongoDB
 */
import mongoose from "mongoose";
import Patient from "./src/models/Patient.js";
import dotenv from "dotenv";

dotenv.config();

// Use Docker MongoDB
const MONGO_URI = "mongodb://localhost:27017/dentalcare";

async function listPatients() {
  try {
    console.log("📡 Connecting to cloud MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected!\n");

    const patients = await Patient.find()
      .select("name email phone age gender bloodGroup createdAt")
      .sort({ createdAt: -1 });

    if (patients.length === 0) {
      console.log("❌ No patients found in database.");
      process.exit(0);
    }

    console.log(`📋 Found ${patients.length} patient(s):\n`);
    console.log("=".repeat(100));
    console.log(`${"Name".padEnd(25)} ${"Email".padEnd(35)} ${"Phone".padEnd(15)} ${"Age".padEnd(5)} ${"Gender".padEnd(10)}`);
    console.log("=".repeat(100));

    patients.forEach((patient) => {
      const name = (patient.name || "N/A").padEnd(25);
      const email = (patient.email || "N/A").padEnd(35);
      const phone = (patient.phone || "N/A").padEnd(15);
      const age = (patient.age?.toString() || "N/A").padEnd(5);
      const gender = (patient.gender || "N/A").padEnd(10);
      console.log(`${name} ${email} ${phone} ${age} ${gender}`);
    });

    console.log("=".repeat(100));
    console.log(`\nTotal: ${patients.length} patients\n`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

listPatients();
