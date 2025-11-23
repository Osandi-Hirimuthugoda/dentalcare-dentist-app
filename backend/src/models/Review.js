import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: false, // Optional, but recommended
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    isVerified: {
      type: Boolean,
      default: false, // Can be verified if linked to completed appointment
    },
  },
  { timestamps: true }
);

// Index to prevent duplicate reviews from same patient for same doctor (optional - can allow multiple reviews)
// reviewSchema.index({ patient: 1, doctor: 1 }, { unique: true });

// Index for faster queries
reviewSchema.index({ doctor: 1, createdAt: -1 });
reviewSchema.index({ patient: 1 });

export default mongoose.model("Review", reviewSchema);

