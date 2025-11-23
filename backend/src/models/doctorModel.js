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
    averageRating: { type: Number, default: 0 }, // Calculated from reviews
    totalReviews: { type: Number, default: 0 }, // Total number of reviews
  },
  { timestamps: true }
);

// Hash password before saving
doctorSchema.pre("save", async function (next) {
  // Skip if password is not modified
  if (!this.isModified("password")) return next();
  
  // If password is already hashed (bcrypt hashes start with $2a$, $2b$, or $2y$), skip
  // BUT if we're explicitly setting a new password, hash it anyway
  if (this.password && this.password.startsWith("$2") && this.password.length > 50) {
    // This is already a bcrypt hash, skip
    return next();
  }
  
  // Hash the plain password
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    console.log(`🔐 Password hashed for: ${this.email || 'doctor'}`);
  } catch (error) {
    console.error(`❌ Error hashing password:`, error);
    return next(error);
  }
  next();
});

// Method to compare password
doctorSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const Doctor = mongoose.model("Doctor", doctorSchema);
export default Doctor;
