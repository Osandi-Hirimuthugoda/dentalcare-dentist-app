import mongoose from "mongoose";

const prescriptionSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    required: true
  },
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Appointment"
  },
  medications: [{
    name: { type: String, required: true },
    dosage: { type: String, required: true }, // e.g., "500mg"
    frequency: { type: String, required: true }, // e.g., "Twice a day"
    duration: { type: String, required: true }, // e.g., "5 days"
    instructions: String // e.g., "After meals"
  }],
  diagnosis: {
    type: String,
    required: true
  },
  notes: String,
  date: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const Prescription = mongoose.model("Prescription", prescriptionSchema);

export default Prescription;
