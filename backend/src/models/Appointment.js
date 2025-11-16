import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
  startTime: { type: Date, required: true },
  endTime: Date,
  status: { type: String, enum: ["pending","confirmed","rescheduled","cancelled","completed"], default: "pending" },
  notes: String,
  teleconsult: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model("Appointment", appointmentSchema);
