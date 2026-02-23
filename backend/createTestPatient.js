/**
 * Create test patients for mobile app login.
 * Run: node createTestPatient.js
 * Or with Docker: docker exec -it dentalcare-backend node createTestPatient.js
 */

import dotenv from "dotenv";
import mongoose from "mongoose";
import Patient from "./src/models/Patient.js";
import bcrypt from "bcryptjs";

dotenv.config();

// Use Docker MongoDB
const MONGO_URI = "mongodb://localhost:27017/dentalcare";

const TEST_PATIENTS = [
  {
    name: "Kavindu Gamage",
    email: "kavindu@patient.com",
    password: "password123",
    phone: "0771234567",
    age: 25,
    gender: "male",
    bloodGroup: "O+",
  },
  {
    name: "Nuwan Silva",
    email: "nuwan@patient.com",
    password: "password123",
    phone: "0772345678",
    age: 30,
    gender: "male",
    bloodGroup: "A+",
  },
  {
    name: "Anoma Perera",
    email: "anoma@patient.com",
    password: "password123",
    phone: "0773456789",
    age: 28,
    gender: "female",
    bloodGroup: "B+",
  },
];

async function createTestPatients() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected.\n");

    let created = 0;
    let existing = 0;

    for (const patientData of TEST_PATIENTS) {
      const existingPatient = await Patient.findOne({ email: patientData.email });
      
      if (existingPatient) {
        console.log(`⏭️  Patient already exists: ${patientData.email}`);
        existing++;
        continue;
      }

      // Hash password
      const passwordHash = await bcrypt.hash(patientData.password, 10);

      // Create patient
      await Patient.create({
        ...patientData,
        passwordHash,
        password: undefined, // Remove plain password
      });

      console.log(`✅ Created patient: ${patientData.email}`);
      created++;
    }

    console.log(`\n📊 Summary:`);
    console.log(`   Created: ${created}`);
    console.log(`   Already existed: ${existing}`);
    console.log(`   Total: ${TEST_PATIENTS.length}`);

    console.log(`\n🔐 Login credentials for mobile app:`);
    console.log(`   Email: kavindu@patient.com`);
    console.log(`   Password: password123`);
    console.log(`\n   Email: nuwan@patient.com`);
    console.log(`   Password: password123`);
    console.log(`\n   Email: anoma@patient.com`);
    console.log(`   Password: password123\n`);

  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

createTestPatients();
