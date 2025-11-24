import mongoose from "mongoose";

const patientSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, "Name is required"],
    trim: true 
  },
  email: { 
    type: String, 
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"]
  },
  phone: { 
    type: String, 
    required: [true, "Phone number is required"],
    trim: true 
  },
  passwordHash: { 
    type: String, 
    required: [true, "Password is required"]
  },
  age: { 
    type: Number,
    min: [1, "Age must be greater than 0"],
    max: [150, "Age must be less than 150"]
  },
  gender: { 
    type: String, 
    enum: ["male", "female", "other"],
    lowercase: true
  },
  bloodGroup: {
    type: String,
    enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  // Status
  status: { 
    type: String, 
    enum: ["active", "inactive"], 
    default: "active" 
  },
  // Email verification
  isEmailVerified: { 
    type: Boolean, 
    default: false 
  },
  emailVerificationOTP: { 
    type: String 
  }
}, { 
  timestamps: true // Adds createdAt and updatedAt fields
});

// Create index on email for faster lookups
patientSchema.index({ email: 1 });

const Patient = mongoose.model("Patient", patientSchema);

export default Patient;
