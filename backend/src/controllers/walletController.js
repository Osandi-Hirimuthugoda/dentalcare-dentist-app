import { Wallet, WalletTransaction } from "../models/Wallet.js";
import Patient from "../models/Patient.js";
import Bill from "../models/Bill.js";
import Appointment from "../models/Appointment.js";
import Payment from "../models/Payment.js";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dentalcare_secret_key_change_in_production";

// Helper function to extract user from token
const getUserFromToken = (req) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return null;
    
    const token = authHeader.split(" ")[1];
    if (!token) return null;
    
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (err) {
    return null;
  }
};

// Get wallet balance
export const getWalletBalance = async (req, res) => {
  try {
    // Use req.user from requireAuth middleware if available, otherwise use getUserFromToken
    const user = req.user || getUserFromToken(req);
    if (!user || user.role !== "patient") {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Get user ID (could be id or _id depending on token structure)
    const userId = user.id || user._id || user.userId;
    if (!userId) {
      return res.status(401).json({ message: "Invalid user ID in token" });
    }

    let wallet = await Wallet.findOne({ patient: userId });
    
    // Create wallet if it doesn't exist
    if (!wallet) {
      wallet = new Wallet({
        patient: userId,
        balance: 0
      });
      await wallet.save();
    }

    res.status(200).json({
      balance: wallet.balance,
      currency: wallet.currency,
      walletId: wallet._id
    });
  } catch (error) {
    console.error("Error fetching wallet balance:", error);
    res.status(500).json({ message: error.message });
  }
};

// Top-up wallet
export const topUpWallet = async (req, res) => {
  try {
    // Use req.user from requireAuth middleware if available, otherwise use getUserFromToken
    const user = req.user || getUserFromToken(req);
    if (!user || user.role !== "patient") {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { amount, paymentMethod, cardDetails } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Valid amount is required" });
    }

    // HARDCODED: Basic card validation (for demo purposes, accepts any card)
    if (paymentMethod === "card" && cardDetails) {
      // Validate card number format (should be 13-19 digits)
      if (cardDetails.last4Digits && cardDetails.last4Digits.length < 4) {
        console.log("⚠️ Card validation: Using provided last4Digits");
      }
      // In production, validate full card number, expiry, CVV
      // For demo: Accept any card details
      console.log(`💳 HARDCODED: Processing card payment - Card Type: ${cardDetails.cardType || "Visa"}, Last 4: ${cardDetails.last4Digits || "****"}`);
    }

    // Minimum amount validation
    if (amount < 100) {
      return res.status(400).json({ 
        message: "Minimum top-up amount is LKR 100" 
      });
    }

    // Maximum amount validation (optional safety limit)
    if (amount > 100000) {
      return res.status(400).json({ 
        message: "Maximum top-up amount is LKR 100,000" 
      });
    }

    // Get user ID
    const userId = user.id || user._id || user.userId;
    if (!userId) {
      return res.status(401).json({ message: "Invalid user ID in token" });
    }

    // Get or create wallet
    let wallet = await Wallet.findOne({ patient: userId });
    if (!wallet) {
      wallet = new Wallet({
        patient: userId,
        balance: 0
      });
      await wallet.save();
    }
    
    // Extract card details for transaction record
    let transactionCardDetails = undefined;
    if (cardDetails) {
      transactionCardDetails = {
        cardType: cardDetails.cardType || "Visa",
        last4Digits: cardDetails.last4Digits || "0000",
        cardHolder: cardDetails.cardHolder || "Card Holder"
      };
    }

    // Create transaction
    const transaction = new WalletTransaction({
      wallet: wallet._id,
      patient: userId,
      type: "topup",
      amount: amount,
      description: `Wallet top-up of LKR ${amount.toLocaleString()}`,
      status: "pending",
      paymentMethod: paymentMethod || "card",
      cardDetails: transactionCardDetails
    });

    // HARDCODED: Simulate card payment processing (always succeeds for demo)
    if (paymentMethod === "card" || !paymentMethod) {
      // Simulate payment gateway delay (1.5 seconds)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // HARDCODED: Payment always succeeds
      transaction.status = "completed";
      transaction.gatewayTransactionId = `GW${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      transaction.transactionId = `TXN${Date.now()}`;
      
      // Update wallet balance
      wallet.balance += amount;
      await wallet.save();
      
      console.log(`✅ HARDCODED: Card payment successful for LKR ${amount}. New balance: LKR ${wallet.balance}`);
    } else {
      transaction.status = "pending";
    }

    await transaction.save();

    res.status(201).json({
      success: true,
      message: "Wallet top-up successful! Payment processed via card.",
      transaction: {
        id: transaction._id,
        type: transaction.type,
        amount: transaction.amount,
        status: transaction.status,
        description: transaction.description,
        transactionId: transaction.transactionId,
        gatewayTransactionId: transaction.gatewayTransactionId,
        createdAt: transaction.createdAt
      },
      newBalance: wallet.balance,
      previousBalance: wallet.balance - amount
    });
  } catch (error) {
    console.error("Error topping up wallet:", error);
    res.status(500).json({ message: error.message });
  }
};

// Pay bill using wallet
export const payBillWithWallet = async (req, res) => {
  try {
    // Use req.user from requireAuth middleware if available, otherwise use getUserFromToken
    const user = req.user || getUserFromToken(req);
    if (!user || user.role !== "patient") {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { billId } = req.body;

    if (!billId) {
      return res.status(400).json({ message: "Bill ID is required" });
    }

    // Get user ID
    const userId = user.id || user._id || user.userId;
    if (!userId) {
      return res.status(401).json({ message: "Invalid user ID in token" });
    }

    // Get wallet
    const wallet = await Wallet.findOne({ patient: userId });
    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found. Please top up first." });
    }

    // Get bill
    const bill = await Bill.findOne({ 
      _id: billId,
      patient: userId 
    });

    if (!bill) {
      return res.status(404).json({ message: "Bill not found" });
    }

    if (bill.status === "paid") {
      return res.status(400).json({ message: "Bill is already paid" });
    }

    // Check if wallet has sufficient balance
    if (wallet.balance < bill.total) {
      return res.status(400).json({ 
        message: "Insufficient wallet balance",
        required: bill.total,
        available: wallet.balance
      });
    }

    // Create wallet transaction
    const transaction = new WalletTransaction({
      wallet: wallet._id,
      patient: userId,
      type: "payment",
      amount: bill.total,
      description: `Payment for bill ${bill.billNumber} - ${bill.service}`,
      status: "completed",
      bill: billId,
      appointment: bill.appointment
    });

    await transaction.save();

    // Deduct from wallet
    wallet.balance -= bill.total;
    await wallet.save();

    // Update bill status
    bill.status = "paid";
    bill.paidDate = new Date();
    await bill.save();

    // Create payment record
    const payment = new Payment({
      bill: billId,
      patient: userId,
      amount: bill.total,
      paymentMethod: "wallet",
      status: "completed",
      processedAt: new Date()
    });
    await payment.save();

    res.status(200).json({
      success: true,
      message: "Payment successful",
      transaction: transaction,
      bill: bill,
      newBalance: wallet.balance
    });
  } catch (error) {
    console.error("Error paying bill with wallet:", error);
    res.status(500).json({ message: error.message });
  }
};

// Pay appointment using wallet (for future appointments)
export const payAppointmentWithWallet = async (req, res) => {
  try {
    // Use req.user from requireAuth middleware if available, otherwise use getUserFromToken
    const user = req.user || getUserFromToken(req);
    if (!user || user.role !== "patient") {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { appointmentId, amount } = req.body;

    if (!appointmentId || !amount) {
      return res.status(400).json({ message: "Appointment ID and amount are required" });
    }

    // Get user ID
    const userId = user.id || user._id || user.userId;
    if (!userId) {
      return res.status(401).json({ message: "Invalid user ID in token" });
    }

    // Get wallet
    const wallet = await Wallet.findOne({ patient: userId });
    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found. Please top up first." });
    }

    // Check if wallet has sufficient balance
    if (wallet.balance < amount) {
      return res.status(400).json({ 
        message: "Insufficient wallet balance",
        required: amount,
        available: wallet.balance
      });
    }

    // Get appointment
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      patient: userId
    });

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Create wallet transaction
    const transaction = new WalletTransaction({
      wallet: wallet._id,
      patient: userId,
      type: "payment",
      amount: amount,
      description: `Payment for appointment`,
      status: "completed",
      appointment: appointmentId
    });

    await transaction.save();

    // Deduct from wallet
    wallet.balance -= amount;
    await wallet.save();

    res.status(200).json({
      success: true,
      message: "Appointment payment successful",
      transaction: transaction,
      newBalance: wallet.balance
    });
  } catch (error) {
    console.error("Error paying appointment with wallet:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get wallet transaction history
export const getWalletTransactions = async (req, res) => {
  try {
    // Use req.user from requireAuth middleware if available, otherwise use getUserFromToken
    const user = req.user || getUserFromToken(req);
    if (!user || user.role !== "patient") {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Get user ID
    const userId = user.id || user._id || user.userId;
    if (!userId) {
      return res.status(401).json({ message: "Invalid user ID in token" });
    }

    const transactions = await WalletTransaction.find({ patient: userId })
      .populate("bill", "billNumber service")
      .populate("appointment", "startTime notes")
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json(transactions);
  } catch (error) {
    console.error("Error fetching wallet transactions:", error);
    res.status(500).json({ message: error.message });
  }
};

