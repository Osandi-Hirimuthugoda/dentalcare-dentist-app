// seedReportsData.js — Seeds Bills + Appointments for Reports page analytics
// Run: node seedReportsData.js
import "dotenv/config";
import mongoose from "mongoose";
import Bill from "./src/models/Bill.js";
import Appointment from "./src/models/Appointment.js";
import Patient from "./src/models/Patient.js";
import Doctor from "./src/models/doctorModel.js";

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/dentalcare";

// Helper: random date within last N months
function randomDateInPast(monthsAgo) {
  const now = new Date();
  const past = new Date();
  past.setMonth(now.getMonth() - monthsAgo);
  return new Date(past.getTime() + Math.random() * (now.getTime() - past.getTime()));
}

// Helper: random item from array
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const SERVICES = [
  "Dental Checkups & Consultations",
  "Teeth Cleaning (Scaling & Polishing)",
  "Cavity Filling",
  "Root Canal Treatment (RCT)",
  "Teeth Whitening",
  "Dental Crowns & Bridges",
  "Tooth Extraction",
  "Braces & Teeth Alignment",
  "Dental Implants & Dentures",
  "Emergency Dental Care",
];

const STATUSES = ["pending", "confirmed", "completed", "cancelled"];

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log("✅ Connected to MongoDB:", MONGO_URI);

  // ── Fetch existing doctors and patients ──────────────────────────────────
  const doctors  = await Doctor.find().limit(10);
  const patients = await Patient.find().limit(20);

  if (doctors.length === 0) {
    console.error("❌ No doctors found. Please register at least one doctor first.");
    await mongoose.disconnect();
    process.exit(1);
  }

  if (patients.length === 0) {
    console.error("❌ No patients found. Please register at least one patient first.");
    await mongoose.disconnect();
    process.exit(1);
  }

  console.log(`👨‍⚕️  Found ${doctors.length} doctors, 👤 ${patients.length} patients`);

  // ── Clear existing bills and appointments ────────────────────────────────
  const deletedBills = await Bill.deleteMany({});
  const deletedAppts = await Appointment.deleteMany({});
  console.log(`🗑️  Cleared ${deletedBills.deletedCount} bills, ${deletedAppts.deletedCount} appointments`);

  // ── Seed Appointments (last 6 months) ────────────────────────────────────
  const appointments = [];
  for (let i = 0; i < 80; i++) {
    const startTime = randomDateInPast(6);
    const endTime   = new Date(startTime.getTime() + 30 * 60 * 1000); // +30 min
    appointments.push({
      patient:   pick(patients)._id,
      doctor:    pick(doctors)._id,
      startTime,
      endTime,
      status:    pick(STATUSES),
      notes:     `Appointment for ${pick(SERVICES)}`,
    });
  }

  const insertedAppts = await Appointment.insertMany(appointments);
  console.log(`✅ Inserted ${insertedAppts.length} appointments`);

  // ── Seed Bills (last 12 months, paid ones have paidDate) ─────────────────
  const bills = [];
  for (let i = 0; i < 60; i++) {
    const service   = pick(SERVICES);
    const amount    = Math.floor(Math.random() * 8000) + 1500; // LKR 1500–9500
    const tax       = Math.round(amount * 0.05);
    const discount  = pick([0, 0, 0, 200, 500]);
    const total     = amount + tax - discount;
    const isPaid    = Math.random() > 0.25; // 75% paid
    const createdAt = randomDateInPast(12);
    const paidDate  = isPaid ? new Date(createdAt.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000) : undefined;
    const dueDate   = new Date(createdAt.getTime() + 14 * 24 * 60 * 60 * 1000);

    bills.push({
      patient:     pick(patients)._id,
      doctor:      pick(doctors)._id,
      appointment: pick(insertedAppts)._id,
      service,
      amount,
      subtotal:    amount,
      tax,
      discount,
      total,
      status:      isPaid ? "paid" : pick(["pending", "overdue"]),
      dueDate,
      paidDate,
      description: `${service} — dental treatment`,
      items: [{
        description: service,
        quantity:    1,
        price:       amount,
        subtotal:    amount,
      }],
      createdAt,
    });
  }

  // insertMany doesn't trigger pre-validate for billNumber, so set manually
  const billDocs = bills.map((b, i) => ({
    ...b,
    billNumber: `INV-${String(i + 1).padStart(6, "0")}`,
  }));

  const insertedBills = await Bill.insertMany(billDocs);
  console.log(`✅ Inserted ${insertedBills.length} bills`);

  // ── Summary ───────────────────────────────────────────────────────────────
  const paidBills   = insertedBills.filter(b => b.status === "paid");
  const totalRev    = paidBills.reduce((sum, b) => sum + b.total, 0);
  console.log(`\n📊 Summary:`);
  console.log(`   Total bills:       ${insertedBills.length}`);
  console.log(`   Paid bills:        ${paidBills.length}`);
  console.log(`   Total revenue:     LKR ${totalRev.toLocaleString()}`);
  console.log(`   Appointments:      ${insertedAppts.length}`);

  await mongoose.disconnect();
  console.log("\n🔌 Disconnected. Done!");
}

seed().catch(err => { console.error("❌ Seed failed:", err); process.exit(1); });
