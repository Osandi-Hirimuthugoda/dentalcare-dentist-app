/**
 * Create an admin user for login.
 * Run: node createAdmin.js  (from backend folder)
 * Or with Docker: docker exec -it dentalcare-backend node createAdmin.js
 *
 * Then login at http://localhost:3000/admin-login with:
 *   Email: admin
 *   Password: admin123
 */

import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Admin from "./src/models/Admin.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/dentalcare";

const ADMIN_EMAIL = "admin";
const ADMIN_PASSWORD = "admin123";

async function createAdmin() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected.\n");

    const existing = await Admin.findOne({ email: ADMIN_EMAIL });
    if (existing) {
      console.log("Admin already exists:", ADMIN_EMAIL);
      console.log("Login at http://localhost:3000/admin-login with:");
      console.log("  Email:    admin");
      console.log("  Password: admin123\n");
      process.exit(0);
      return;
    }

    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
    await Admin.create({ email: ADMIN_EMAIL, password: hashedPassword });

    console.log("Admin created successfully!\n");
    console.log("Login at http://localhost:3000/admin-login with:");
    console.log("  Email:    admin");
    console.log("  Password: admin123\n");
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

createAdmin();
