import mongoose from "mongoose";

const walletSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: true,
    unique: true
  },
  balance: {
    type: Number,
    default: 0,
    min: 0
  },
  currency: {
    type: String,
    default: "LKR"
  }
}, { timestamps: true });

// Wallet Transaction Schema
const walletTransactionSchema = new mongoose.Schema({
  wallet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Wallet",
    required: true
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: true
  },
  type: {
    type: String,
    enum: ["topup", "payment", "refund"],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  description: String,
  status: {
    type: String,
    enum: ["pending", "completed", "failed", "cancelled"],
    default: "pending"
  },
  // For top-up transactions
  paymentMethod: {
    type: String,
    enum: ["card", "bank_transfer", "cash"]
  },
  cardDetails: {
    cardType: String,
    last4Digits: String,
    cardHolder: String
  },
  // For payment transactions
  bill: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Bill"
  },
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Appointment"
  },
  transactionId: String,
  gatewayTransactionId: String,
  failureReason: String
}, { timestamps: true });

// Generate transaction ID before saving
walletTransactionSchema.pre('save', async function(next) {
  if (!this.transactionId) {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    this.transactionId = `WLT${timestamp}${random}`;
  }
  next();
});

// Index for efficient queries
walletSchema.index({ patient: 1 });
walletTransactionSchema.index({ wallet: 1, createdAt: -1 });
walletTransactionSchema.index({ patient: 1, createdAt: -1 });

export const Wallet = mongoose.model("Wallet", walletSchema);
export const WalletTransaction = mongoose.model("WalletTransaction", walletTransactionSchema);


