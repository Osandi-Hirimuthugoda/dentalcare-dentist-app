import mongoose from "mongoose";
import bcrypt from "bcryptjs";

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
    services: [{ type: String }], // Services/categories doctor offers
  },
  { timestamps: true }
);

// Hash password before saving
doctorSchema.pre("save", async function (next) {
  // Skip if password is not modified
  if (!this.isModified("password")) return next();
  
  // Skip if password is already hashed (bcrypt hashes start with $2a$, $2b$, or $2y$)
  if (this.password && this.password.startsWith("$2")) {
    return next();
  }
  
  // Hash the plain password
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare password
doctorSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const Doctor = mongoose.model("Doctor", doctorSchema);
export default Doctor;
