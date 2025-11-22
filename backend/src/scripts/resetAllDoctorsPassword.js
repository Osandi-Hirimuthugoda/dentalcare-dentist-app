import Doctor from "../models/doctorModel.js";
import connectDB from "../config/db.js";
import dotenv from "dotenv";

dotenv.config();

// Reset passwords for all doctors or specific doctors
const resetDoctorsPasswords = async () => {
  try {
    await connectDB();
    console.log(`\n🔧 Resetting passwords for doctors...\n`);
    
    // Get all doctors
    const doctors = await Doctor.find();
    console.log(`📋 Found ${doctors.length} doctors\n`);
    
    if (doctors.length === 0) {
      console.log("❌ No doctors found in database");
      process.exit(0);
    }
    
    // Default temporary password for all doctors
    const defaultPassword = "password123"; // Change this to a secure password
    
    console.log("⚠️  WARNING: This will reset ALL doctor passwords!");
    console.log(`   Default password will be: ${defaultPassword}`);
    console.log("\n   Doctors affected:");
    doctors.forEach((doc, index) => {
      console.log(`   ${index + 1}. ${doc.email} - ${doc.fullName}`);
    });
    
    // Reset passwords
    let successCount = 0;
    let errorCount = 0;
    
    for (const doctor of doctors) {
      try {
        // Set new password (will be hashed by pre-save hook)
        doctor.password = defaultPassword;
        await doctor.save();
        
        console.log(`✅ Password reset for: ${doctor.email}`);
        successCount++;
      } catch (error) {
        console.error(`❌ Error resetting password for ${doctor.email}:`, error.message);
        errorCount++;
      }
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Successfully reset: ${successCount} doctors`);
    console.log(`   ❌ Failed: ${errorCount} doctors`);
    console.log(`\n🔐 All passwords have been reset to: ${defaultPassword}`);
    console.log(`   ⚠️  Please ask doctors to change their passwords after login!`);
    
    process.exit(0);
  } catch (error) {
    console.error(`❌ Error:`, error);
    process.exit(1);
  }
};

// Reset specific doctors by email
const resetSpecificDoctors = async (emails, newPassword) => {
  try {
    await connectDB();
    console.log(`\n🔧 Resetting passwords for specific doctors...\n`);
    
    if (!emails || emails.length === 0) {
      console.log("❌ No emails provided");
      process.exit(1);
    }
    
    let successCount = 0;
    let errorCount = 0;
    const notFound = [];
    
    for (const email of emails) {
      try {
        const doctor = await Doctor.findOne({ email: email.toLowerCase().trim() });
        
        if (!doctor) {
          console.log(`⚠️  Doctor not found: ${email}`);
          notFound.push(email);
          continue;
        }
        
        // Set new password (will be hashed by pre-save hook)
        doctor.password = newPassword;
        await doctor.save();
        
        console.log(`✅ Password reset for: ${doctor.email} (${doctor.fullName})`);
        successCount++;
      } catch (error) {
        console.error(`❌ Error resetting password for ${email}:`, error.message);
        errorCount++;
      }
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Successfully reset: ${successCount} doctors`);
    console.log(`   ❌ Failed: ${errorCount} doctors`);
    if (notFound.length > 0) {
      console.log(`   ⚠️  Not found: ${notFound.join(", ")}`);
    }
    console.log(`\n🔐 New password: ${newPassword}`);
    
    process.exit(0);
  } catch (error) {
    console.error(`❌ Error:`, error);
    process.exit(1);
  }
};

// Get command line arguments
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log("Usage:");
  console.log("  Reset ALL doctors:");
  console.log("    node resetAllDoctorsPassword.js --all");
  console.log("\n  Reset SPECIFIC doctors:");
  console.log("    node resetAllDoctorsPassword.js --specific <email1> <email2> ... <password>");
  console.log("\n  Examples:");
  console.log("    node resetAllDoctorsPassword.js --all");
  console.log("    node resetAllDoctorsPassword.js --specific ravinduhirimuthugoda@gmail.com kamal@gmail.com newpassword123");
  process.exit(1);
}

if (args[0] === "--all") {
  resetDoctorsPasswords();
} else if (args[0] === "--specific") {
  if (args.length < 3) {
    console.log("❌ Error: Please provide at least one email and a password");
    console.log("   Example: node resetAllDoctorsPassword.js --specific email1@example.com email2@example.com newpassword123");
    process.exit(1);
  }
  
  const emails = args.slice(1, -1); // All args except last (password)
  const password = args[args.length - 1]; // Last arg is password
  
  resetSpecificDoctors(emails, password);
} else {
  console.log("❌ Invalid argument. Use --all or --specific");
  process.exit(1);
}

