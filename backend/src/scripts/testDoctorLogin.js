import Doctor from "../models/doctorModel.js";
import connectDB from "../config/db.js";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

// Test doctor login by verifying password
const testDoctorLogin = async (email, testPassword) => {
  try {
    await connectDB();
    console.log(`\n🔍 Testing doctor login for: ${email}\n`);
    
    const doctor = await Doctor.findOne({ email: email.toLowerCase().trim() });
    
    if (!doctor) {
      console.log(`❌ Doctor not found: ${email}`);
      process.exit(1);
    }
    
    console.log(`✅ Doctor found: ${doctor.fullName}`);
    console.log(`   Email: ${doctor.email}`);
    console.log(`   Password in DB: ${doctor.password.substring(0, 20)}... (bcrypt hash)`);
    console.log(`   Password starts with $2: ${doctor.password.startsWith('$2') ? 'Yes ✅' : 'No ❌'}`);
    console.log(`\n🔐 Testing password: "${testPassword}"`);
    
    // Test password comparison
    const isMatch = await bcrypt.compare(testPassword, doctor.password);
    
    console.log(`\n📊 Result:`);
    if (isMatch) {
      console.log(`   ✅ Password matches! Login should work.`);
    } else {
      console.log(`   ❌ Password does NOT match!`);
      console.log(`\n💡 The password "${testPassword}" is incorrect.`);
      console.log(`   Try using: password123`);
    }
    
    // Try to hash the test password and see what it looks like
    const testHash = await bcrypt.hash(testPassword, 10);
    console.log(`\n🔧 If we hash "${testPassword}" now, it would be: ${testHash.substring(0, 30)}...`);
    console.log(`   Stored password starts with: ${doctor.password.substring(0, 30)}...`);
    
    // Check if stored password looks like it was hashed multiple times
    if (doctor.password.startsWith('$2$') || doctor.password.includes('$2a$') && doctor.password.split('$2a$').length > 2) {
      console.log(`\n⚠️  Warning: Password might be double-hashed!`);
    }
    
    process.exit(isMatch ? 0 : 1);
  } catch (error) {
    console.error(`❌ Error:`, error);
    process.exit(1);
  }
};

// Get command line arguments
const email = process.argv[2];
const password = process.argv[3] || "password123";

if (!email) {
  console.log("Usage: node testDoctorLogin.js <email> [password]");
  console.log("Example: node testDoctorLogin.js jagath@dental.com password123");
  process.exit(1);
}

testDoctorLogin(email, password);

