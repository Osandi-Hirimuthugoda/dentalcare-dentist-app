/**
 * Reset password for all patients to a default password
 * Useful after copying from cloud to Docker
 */
import mongoose from "mongoose";
import Patient from "./src/models/Patient.js";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = "mongodb://localhost:27017/dentalcare";
const DEFAULT_PASSWORD = "password123";

async function resetAllPasswords() {
  try {
    console.log("🐳 Connecting to Docker MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected!\n");

    const patients = await Patient.find();
    console.log(`📋 Found ${patients.length} patients\n`);

    const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);
    let updated = 0;

    for (const patient of patients) {
      patient.passwordHash = passwordHash;
      await patient.save();
      console.log(`✅ Reset password for: ${patient.email}`);
      updated++;
    }

    console.log(`\n📊 Summary:`);
    console.log(`   Updated: ${updated}`);
    console.log(`   Total: ${patients.length}`);
    console.log(`\n🔐 All patients can now login with:`);
    console.log(`   Password: ${DEFAULT_PASSWORD}\n`);

    await mongoose.disconnect();
    console.log("✅ Done!");
    process.exit(0);

  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

resetAllPasswords();
