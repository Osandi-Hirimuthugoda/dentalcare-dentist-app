import mongoose from "mongoose";
import dotenv from "dotenv";
import Patient from "./src/models/Patient.js";
import Doctor from "./src/models/doctorModel.js";
import ScanQA from "./src/models/ScanQA.js";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://admin:Dental1234@cluster0.eurc4fi.mongodb.net/dentalcare";

async function seed() {
  console.log("Connecting to database...");
  await mongoose.connect(MONGODB_URI);
  console.log("Connected successfully!");

  // Find first patient
  const patient = await Patient.findOne();
  if (!patient) {
    console.error("No patients found in database! Please register a patient first.");
    process.exit(1);
  }
  console.log(`Found patient: ${patient.fullName} (${patient._id})`);

  // Find first doctor
  const doctor = await Doctor.findOne();
  if (!doctor) {
    console.error("No doctors found in database!");
    process.exit(1);
  }
  console.log(`Found doctor: ${doctor.fullName} (${doctor._id})`);

  // Check if there is already a scan QA for this patient
  const existing = await ScanQA.findOne({ patientId: patient._id, reportType: "scan" });
  if (existing) {
    console.log("Updating existing scan QA with mock questions...");
    existing.doctorId = doctor._id;
    existing.status = "pending_qa";
    existing.questions = [
      {
        question: "Have you noticed any bleeding when brushing near the ulcer?",
        answer: "Yes, a little bit when using a hard toothbrush.",
        askedAt: new Date(Date.now() - 3600000 * 2), // 2 hours ago
        answeredAt: new Date(Date.now() - 3600000)   // 1 hour ago
      },
      {
        question: "How long has this ulcer been present in your mouth?",
        answer: "", // Pending!
        askedAt: new Date()
      }
    ];
    await existing.save();
    console.log("Scan QA updated successfully!");
  } else {
    console.log("Creating new scan QA...");
    const scanQA = new ScanQA({
      scanId: "SCAN_" + Date.now(),
      patientId: patient._id,
      doctorId: doctor._id,
      imageUrl: "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg",
      analysisResults: {
        hasOralCancer: false,
        detectedConditions: [
          {
            modelClassName: "ulcers",
            name: "Mouth Ulcer",
            type: "oral_disease",
            severity: "Medium",
            description: "A painful sore in the mouth that can make eating and talking uncomfortable.",
            recommendation: "Avoid spicy food, use warm salt water rinses, and consult a dentist."
          }
        ]
      },
      questions: [
        {
          question: "Have you noticed any bleeding when brushing near the ulcer?",
          answer: "Yes, a little bit when using a hard toothbrush.",
          askedAt: new Date(Date.now() - 3600000 * 2),
          answeredAt: new Date(Date.now() - 3600000)
        },
        {
          question: "How long has this ulcer been present in your mouth?",
          answer: "",
          askedAt: new Date()
        }
      ],
      status: "pending_qa",
      reportType: "scan"
    });
    await scanQA.save();
    console.log("Scan QA created successfully!");
  }

  console.log("Done!");
  process.exit(0);
}

seed().catch(err => {
  console.error("Error seeding database:", err);
  process.exit(1);
});
