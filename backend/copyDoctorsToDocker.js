/**
 * Copy doctors from cloud MongoDB to Docker MongoDB
 */
import mongoose from "mongoose";
import Doctor from "./src/models/doctorModel.js";
import dotenv from "dotenv";

dotenv.config();

const CLOUD_MONGO_URI = process.env.MONGO_URI;
const DOCKER_MONGO_URI = "mongodb://localhost:27017/dentalcare";

async function copyDoctors() {
  try {
    // Connect to cloud MongoDB
    console.log("📡 Connecting to cloud MongoDB...");
    await mongoose.connect(CLOUD_MONGO_URI);
    console.log("✅ Connected to cloud MongoDB\n");

    // Get all doctors from cloud
    const cloudDoctors = await Doctor.find();
    console.log(`📋 Found ${cloudDoctors.length} doctors in cloud MongoDB:\n`);
    
    cloudDoctors.forEach((doc, i) => {
      console.log(`${i + 1}. ${doc.fullName} (${doc.email})`);
    });

    // Disconnect from cloud
    await mongoose.disconnect();
    console.log("\n✅ Disconnected from cloud MongoDB");

    // Connect to Docker MongoDB
    console.log("🐳 Connecting to Docker MongoDB...");
    await mongoose.connect(DOCKER_MONGO_URI);
    console.log("✅ Connected to Docker MongoDB\n");

    // Copy doctors to Docker MongoDB
    let added = 0;
    let skipped = 0;

    for (const cloudDoc of cloudDoctors) {
      const exists = await Doctor.findOne({ email: cloudDoc.email });
      
      if (exists) {
        console.log(`⏭️  Skipped: ${cloudDoc.email} (already exists)`);
        skipped++;
        continue;
      }

      // Create new doctor with same data
      const newDoctor = new Doctor({
        fullName: cloudDoc.fullName,
        email: cloudDoc.email,
        phone: cloudDoc.phone,
        password: cloudDoc.password, // Already hashed
        licenseNumber: cloudDoc.licenseNumber,
        specialization: cloudDoc.specialization,
        qualifications: cloudDoc.qualifications,
        hospital: cloudDoc.hospital,
        experience: cloudDoc.experience,
        services: cloudDoc.services,
        averageRating: cloudDoc.averageRating,
        totalReviews: cloudDoc.totalReviews,
        location: cloudDoc.location,
        address: cloudDoc.address,
        city: cloudDoc.city,
      });

      // Save without triggering password hashing
      await newDoctor.save();
      console.log(`✅ Added: ${cloudDoc.email}`);
      added++;
    }

    console.log(`\n📊 Summary:`);
    console.log(`   Added: ${added}`);
    console.log(`   Skipped: ${skipped}`);
    console.log(`   Total: ${cloudDoctors.length}`);

    await mongoose.disconnect();
    console.log("\n✅ Done!");
    process.exit(0);

  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

copyDoctors();
