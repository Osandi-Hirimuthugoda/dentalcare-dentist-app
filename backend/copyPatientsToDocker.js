/**
 * Copy patients from cloud MongoDB to Docker MongoDB
 */
import mongoose from "mongoose";
import Patient from "./src/models/Patient.js";
import dotenv from "dotenv";

dotenv.config();

const CLOUD_MONGO_URI = process.env.MONGO_URI;
const DOCKER_MONGO_URI = "mongodb://localhost:27017/dentalcare";

async function copyPatients() {
  try {
    // Connect to cloud MongoDB
    console.log("📡 Connecting to cloud MongoDB...");
    await mongoose.connect(CLOUD_MONGO_URI);
    console.log("✅ Connected to cloud MongoDB\n");

    // Get all patients from cloud
    const cloudPatients = await Patient.find();
    console.log(`📋 Found ${cloudPatients.length} patients in cloud MongoDB:\n`);
    
    cloudPatients.forEach((patient, i) => {
      console.log(`${i + 1}. ${patient.name} (${patient.email})`);
    });

    // Disconnect from cloud
    await mongoose.disconnect();
    console.log("\n✅ Disconnected from cloud MongoDB");

    // Connect to Docker MongoDB
    console.log("🐳 Connecting to Docker MongoDB...");
    await mongoose.connect(DOCKER_MONGO_URI);
    console.log("✅ Connected to Docker MongoDB\n");

    // Copy patients to Docker MongoDB
    let added = 0;
    let skipped = 0;

    for (const cloudPatient of cloudPatients) {
      const exists = await Patient.findOne({ email: cloudPatient.email });
      
      if (exists) {
        console.log(`⏭️  Skipped: ${cloudPatient.email} (already exists)`);
        skipped++;
        continue;
      }

      // Create new patient with same data
      const newPatient = new Patient({
        name: cloudPatient.name,
        email: cloudPatient.email,
        phone: cloudPatient.phone,
        passwordHash: cloudPatient.passwordHash, // Already hashed
        age: cloudPatient.age,
        gender: cloudPatient.gender,
        bloodGroup: cloudPatient.bloodGroup,
        address: cloudPatient.address,
        status: cloudPatient.status,
        isEmailVerified: cloudPatient.isEmailVerified,
      });

      await newPatient.save();
      console.log(`✅ Added: ${cloudPatient.email}`);
      added++;
    }

    console.log(`\n📊 Summary:`);
    console.log(`   Added: ${added}`);
    console.log(`   Skipped: ${skipped}`);
    console.log(`   Total: ${cloudPatients.length}`);

    console.log(`\n⚠️  Note: Passwords from cloud database were copied.`);
    console.log(`   If you don't know the passwords, you'll need to reset them.`);
    console.log(`   Or use the test patients created earlier:\n`);
    console.log(`   - kavindu@patient.com / password123`);
    console.log(`   - nuwan@patient.com / password123`);
    console.log(`   - anoma@patient.com / password123\n`);

    await mongoose.disconnect();
    console.log("✅ Done!");
    process.exit(0);

  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

copyPatients();
