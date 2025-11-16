import mongoose from "mongoose";

const patientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  age: { type: Number },
  gender: { type: String, enum: ["male", "female", "other"] },
  // Medical information
  history: [String], // Medical history
  images: [String], // Oral disease images
  diagnosis: String,
  doctorNotes: String,
  // Linked doctor (when user selects a doctor)
  selectedDoctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
  // Status
  status: { type: String, enum: ["active", "inactive"], default: "active" },
}, { timestamps: true });

export default mongoose.model("Patient", patientSchema);
