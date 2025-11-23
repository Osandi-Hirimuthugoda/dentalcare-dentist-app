import mongoose from "mongoose";

const doctorAvailabilitySchema = new mongoose.Schema({
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    required: true,
    unique: true // One availability record per doctor
  },
  // Weekly schedule (e.g., Monday 9 AM - 5 PM)
  weeklySchedule: [{
    dayOfWeek: {
      type: Number, // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
      required: true,
      min: 0,
      max: 6
    },
    startTime: {
      type: String, // "09:00"
      required: true
    },
    endTime: {
      type: String, // "17:00"
      required: true
    },
    isAvailable: {
      type: Boolean,
      default: true
    }
  }],
  // Specific dates when doctor is unavailable (holidays, leaves)
  unavailableDates: [{
    date: {
      type: Date,
      required: true
    },
    reason: String
  }],
  // Specific dates with different hours (e.g., special days)
  specialDates: [{
    date: {
      type: Date,
      required: true
    },
    startTime: String,
    endTime: String,
    isAvailable: {
      type: Boolean,
      default: true
    }
  }],
  // Default appointment duration in minutes
  appointmentDuration: {
    type: Number,
    default: 30,
    min: 15
  },
  // Time slots interval (e.g., 30 minutes)
  slotInterval: {
    type: Number,
    default: 30,
    min: 15
  }
}, { timestamps: true });

// Index for efficient queries
doctorAvailabilitySchema.index({ doctor: 1 });

export default mongoose.model("DoctorAvailability", doctorAvailabilitySchema);


