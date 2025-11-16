import mongoose from "mongoose";

const doctorSchema = mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    licenseNumber: { type: String, required: true },
    specialization: { type: String },
    qualifications: { type: String },
    hospital: { type: String },
    experience: { type: Number },
  },
  { timestamps: true }
);

const Doctor = mongoose.model("Doctor", doctorSchema);
export default Doctor;
