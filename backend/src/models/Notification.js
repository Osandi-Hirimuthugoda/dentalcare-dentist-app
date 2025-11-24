import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  patient: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Patient", 
    required: true 
  },
  doctor: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Doctor" 
  },
  appointment: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Appointment" 
  },
  title: { 
    type: String, 
    required: true 
  },
  message: { 
    type: String, 
    required: true 
  },
  type: { 
    type: String, 
    enum: ["appointment", "reminder", "general", "emergency", "promotion"], 
    default: "general" 
  },
  isRead: { 
    type: Boolean, 
    default: false 
  },
}, { timestamps: true });

export default mongoose.model("Notification", notificationSchema);

