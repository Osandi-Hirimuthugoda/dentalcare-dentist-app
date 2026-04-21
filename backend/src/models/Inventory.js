import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema({
  itemName: {
    type: String,
    required: true,
    unique: true
  },
  category: {
    type: String,
    enum: ["Equipment", "Supplies", "Medicine", "Other"],
    default: "Supplies"
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  unit: {
    type: String, // e.g., "Boxes", "Units", "Vials"
    required: true
  },
  minThreshold: {
    type: Number,
    default: 10
  },
  expiryDate: Date,
  lastRestocked: {
    type: Date,
    default: Date.now
  },
  supplier: String,
  location: String // e.g., "Shelf A", "Room 101"
}, { timestamps: true });

const Inventory = mongoose.model("Inventory", inventorySchema);

export default Inventory;
