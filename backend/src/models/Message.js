import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: "senderModel"
  },
  senderModel: {
    type: String,
    required: true,
    enum: ["Patient", "Doctor"]
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: "receiverModel"
  },
  receiverModel: {
    type: String,
    required: true,
    enum: ["Patient", "Doctor"]
  },
  message: {
    type: String,
    required: true
  },
  read: {
    type: Boolean,
    default: false
  },
  // Optional: Link to appointment or patient record
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Appointment"
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient"
  }
}, { timestamps: true });

// Index for efficient querying
messageSchema.index({ sender: 1, receiver: 1, createdAt: -1 });
messageSchema.index({ receiver: 1, read: 1 });

export default mongoose.model("Message", messageSchema);




