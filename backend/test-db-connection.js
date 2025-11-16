import mongoose from "mongoose";
import dotenv from "dotenv";
import Patient from "./src/models/Patient.js";

dotenv.config();

const testConnection = async () => {
  try {
    console.log("🔌 Testing MongoDB connection...");
    console.log("MongoDB URI:", process.env.MONGO_URI ? "✅ Set" : "❌ Not set");
    
    if (!process.env.MONGO_URI) {
      console.error("❌ MONGO_URI is not set in .env file");
      process.exit(1);
    }

    const conn = await mongoose.connect(process.env.MONGO_URI);
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    
    // Test Patient model
    const patientCount = await Patient.countDocuments();
    console.log(`👥 Total patients in database: ${patientCount}`);
    
    // List recent patients
    const recentPatients = await Patient.find().limit(5).sort({ createdAt: -1 }).select('name email createdAt');
    console.log("\n📋 Recent patients:");
    if (recentPatients.length === 0) {
      console.log("  (No patients found)");
    } else {
      recentPatients.forEach((p, i) => {
        console.log(`  ${i + 1}. ${p.name} (${p.email}) - Created: ${p.createdAt || 'N/A'}`);
      });
    }
    
    await mongoose.connection.close();
    console.log("\n✅ Database connection test completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error(`❌ MongoDB connection failed: ${error.message}`);
    console.error("Error details:", error);
    process.exit(1);
  }
};

testConnection();

