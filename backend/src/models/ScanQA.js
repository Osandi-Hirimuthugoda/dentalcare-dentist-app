import mongoose from "mongoose";

const scanQASchema = new mongoose.Schema({
  scanId: {
    type: String,
    required: [true, "Scan ID is required"],
    index: true
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: [true, "Patient ID is required"]
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    required: false // Will be assigned when dentist starts Q&A
  },
  imageUrl: {
    type: String,
    required: [true, "Image URL is required"]
  },
  analysisResults: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  questions: [{
    question: {
      type: String,
      required: true
    },
    answer: {
      type: String,
      default: ""
    },
    askedAt: {
      type: Date,
      default: Date.now
    },
    answeredAt: {
      type: Date
    }
  }],
  status: {
    type: String,
    enum: ["pending_qa", "qa_completed", "results_shown"],
    default: "pending_qa"
  },
  completedAt: {
    type: Date
  },
  patientNote: {
    type: String,
    default: ""
  },
  reportType: {
    type: String,
    enum: ["scan", "pdf_report"],
    default: "scan"
  },
  sentToPatient: {
    type: Boolean,
    default: false
  },
  sentToPatientAt: {
    type: Date
  },
  doctorNote: {
    type: String,
    default: ""
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

// Create indexes for faster lookups
scanQASchema.index({ scanId: 1 });
scanQASchema.index({ patientId: 1 });
scanQASchema.index({ doctorId: 1 });
scanQASchema.index({ status: 1 });

const ScanQA = mongoose.model("ScanQA", scanQASchema);

export default ScanQA;

