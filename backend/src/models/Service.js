import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: String,
  category: String, // e.g., "General", "Orthodontic", "Cosmetic"
  specialization: [String], // Which specializations can provide this service
  duration: { type: Number, default: 30 }, // in minutes
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model("Service", serviceSchema);

