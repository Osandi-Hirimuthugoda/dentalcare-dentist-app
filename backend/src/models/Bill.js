import mongoose from "mongoose";

const billSchema = new mongoose.Schema({
  billNumber: { type: String, unique: true, required: true },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
  service: { type: String, required: true }, // Service name
  amount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ["pending", "paid", "cancelled", "overdue"],
    default: "pending"
  },
  dueDate: { type: Date, required: true },
  paidDate: Date,
  description: String,
  items: [{
    description: String,
    quantity: { type: Number, default: 1 },
    price: Number,
    subtotal: Number
  }],
  subtotal: Number,
  tax: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  total: { type: Number, required: true }
}, { timestamps: true });

// Generate bill number before validation
billSchema.pre('validate', async function(next) {
  if (!this.billNumber) {
    const count = await mongoose.model('Bill').countDocuments();
    this.billNumber = `INV-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});


export default mongoose.model("Bill", billSchema);

