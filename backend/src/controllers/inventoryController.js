import Inventory from "../models/Inventory.js";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dentalcare_secret_key_change_in_production";

const getUserFromToken = (req) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return null;
    const token = authHeader.split(" ")[1];
    if (!token) return null;
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
};

// Add new inventory item
export const addItem = async (req, res) => {
  try {
    const user = getUserFromToken(req);
    if (!user || user.role !== "admin") {
      return res.status(401).json({ message: "Unauthorized. Admin access required." });
    }

    const { itemName, category, quantity, unit, minThreshold, expiryDate, supplier, location } = req.body;

    const item = new Inventory({
      itemName,
      category,
      quantity,
      unit,
      minThreshold,
      expiryDate,
      supplier,
      location
    });

    await item.save();
    res.status(201).json({ success: true, item });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update stock quantity
export const updateStock = async (req, res) => {
  try {
    const user = getUserFromToken(req);
    if (!user || (user.role !== "admin" && user.role !== "doctor")) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    const { id } = req.params;
    const { quantity, type } = req.body; // type: 'add' or 'subtract'

    const item = await Inventory.findById(id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    if (type === 'add') {
      item.quantity += quantity;
      item.lastRestocked = new Date();
    } else {
      if (item.quantity < quantity) {
        return res.status(400).json({ message: "Insufficient stock" });
      }
      item.quantity -= quantity;
    }

    await item.save();

    // Check if below threshold
    const alert = item.quantity <= item.minThreshold;

    res.status(200).json({ success: true, item, alert });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all inventory items
export const getInventory = async (req, res) => {
  try {
    const items = await Inventory.find().sort({ itemName: 1 });
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete item
export const deleteItem = async (req, res) => {
  try {
    const user = getUserFromToken(req);
    if (!user || user.role !== "admin") {
      return res.status(401).json({ message: "Unauthorized. Admin access required." });
    }

    await Inventory.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Item deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
