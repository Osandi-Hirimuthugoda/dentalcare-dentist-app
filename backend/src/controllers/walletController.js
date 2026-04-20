import { Wallet, WalletTransaction } from "../models/Wallet.js";
import Bill from "../models/Bill.js";
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

// Get wallet balance and recent transactions
export const getWalletInfo = async (req, res) => {
  try {
    const user = getUserFromToken(req);
    if (!user || user.role !== "patient") {
      return res.status(401).json({ message: "Unauthorized. Patient access required." });
    }

    let wallet = await Wallet.findOne({ patient: user.id });
    if (!wallet) {
      // Create wallet if it doesn't exist
      wallet = new Wallet({ patient: user.id, balance: 0 });
      await wallet.save();
    }

    const transactions = await WalletTransaction.find({ patient: user.id })
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      balance: wallet.balance,
      currency: wallet.currency,
      transactions
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Top up wallet
export const topUpWallet = async (req, res) => {
  try {
    const user = getUserFromToken(req);
    if (!user || user.role !== "patient") {
      return res.status(401).json({ message: "Unauthorized. Patient access required." });
    }

    const { amount, paymentMethod, cardDetails } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    let wallet = await Wallet.findOne({ patient: user.id });
    if (!wallet) {
      wallet = new Wallet({ patient: user.id, balance: 0 });
    }

    wallet.balance += amount;
    await wallet.save();

    const transaction = new WalletTransaction({
      wallet: wallet._id,
      patient: user.id,
      type: "topup",
      amount,
      status: "completed",
      paymentMethod,
      cardDetails,
      description: `Wallet top up via ${paymentMethod}`
    });

    await transaction.save();

    res.status(200).json({
      success: true,
      message: "Wallet topped up successfully",
      balance: wallet.balance,
      transaction
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Pay bill from wallet
export const payFromWallet = async (req, res) => {
  try {
    const user = getUserFromToken(req);
    if (!user || user.role !== "patient") {
      return res.status(401).json({ message: "Unauthorized. Patient access required." });
    }

    const { billId } = req.body;
    const bill = await Bill.findById(billId);

    if (!bill) {
      return res.status(404).json({ message: "Bill not found" });
    }

    if (bill.status === "paid") {
      return res.status(400).json({ message: "Bill already paid" });
    }

    const wallet = await Wallet.findOne({ patient: user.id });
    if (!wallet || wallet.balance < bill.total) {
      return res.status(400).json({ message: "Insufficient wallet balance" });
    }

    // Deduct from wallet
    wallet.balance -= bill.total;
    await wallet.save();

    // Create transaction
    const transaction = new WalletTransaction({
      wallet: wallet._id,
      patient: user.id,
      type: "payment",
      amount: bill.total,
      status: "completed",
      bill: bill._id,
      description: `Payment for bill ${bill.billNumber}`
    });
    await transaction.save();

    // Update bill
    bill.status = "paid";
    bill.paidDate = new Date();
    await bill.save();

    res.status(200).json({
      success: true,
      message: "Bill paid successfully using wallet",
      balance: wallet.balance,
      transaction
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get wallet transactions
export const getWalletTransactions = async (req, res) => {
  try {
    const user = getUserFromToken(req);
    if (!user || user.role !== "patient") {
      return res.status(401).json({ message: "Unauthorized. Patient access required." });
    }

    const transactions = await WalletTransaction.find({ patient: user.id })
      .sort({ createdAt: -1 });

    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Pay for appointment from wallet
export const payAppointmentWithWallet = async (req, res) => {
  try {
    const user = getUserFromToken(req);
    if (!user || user.role !== "patient") {
      return res.status(401).json({ message: "Unauthorized. Patient access required." });
    }

    const { appointmentId, amount } = req.body;
    
    if (!amount || amount <= 0) {
       return res.status(400).json({ message: "Invalid amount" });
    }

    const wallet = await Wallet.findOne({ patient: user.id });
    if (!wallet || wallet.balance < amount) {
      return res.status(400).json({ message: "Insufficient wallet balance" });
    }

    // Deduct from wallet
    wallet.balance -= amount;
    await wallet.save();

    // Create transaction
    const transaction = new WalletTransaction({
      wallet: wallet._id,
      patient: user.id,
      type: "payment",
      amount: amount,
      status: "completed",
      description: `Payment for appointment ${appointmentId}`
    });
    await transaction.save();

    res.status(200).json({
      success: true,
      message: "Appointment paid successfully using wallet",
      balance: wallet.balance,
      transaction
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

