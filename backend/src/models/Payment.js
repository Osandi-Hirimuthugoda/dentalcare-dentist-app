import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  transactionId: { type: String, unique: true, required: true },
  bill: { type: mongoose.Schema.Types.ObjectId, ref: "Bill", required: true },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
  amount: { type: Number, required: true },
  paymentMethod: { 
    type: String, 
    enum: ["card", "bank_transfer", "cash", "online", "wallet"],
    required: true 
  },
  status: { 
    type: String, 
    enum: ["pending", "completed", "failed", "refunded"],
    default: "pending"
  },
  cardDetails: {
    cardType: String, // Visa, MasterCard, etc.
    last4Digits: String,
    cardHolder: String
  },
  paymentGateway: String, // Stripe, PayPal, etc.
  gatewayTransactionId: String,
  failureReason: String,
  refundAmount: Number,
  refundReason: String,
  processedAt: Date
}, { timestamps: true });

// Generate transaction ID before saving
paymentSchema.pre('save', async function(next) {
  if (!this.transactionId) {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    this.transactionId = `TXN${timestamp}${random}`;
  }
  next();
});

export default mongoose.model("Payment", paymentSchema);

