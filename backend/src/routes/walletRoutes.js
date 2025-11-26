import express from "express";
import {
  getWalletBalance,
  topUpWallet,
  payBillWithWallet,
  payAppointmentWithWallet,
  getWalletTransactions,
} from "../controllers/walletController.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// All wallet routes require authentication
router.use(requireAuth);

// Get wallet balance
router.get("/balance", getWalletBalance);

// Top-up wallet
router.post("/topup", topUpWallet);

// Pay bill using wallet
router.post("/pay-bill", payBillWithWallet);

// Pay appointment using wallet
router.post("/pay-appointment", payAppointmentWithWallet);

// Get transaction history
router.get("/transactions", getWalletTransactions);

export default router;

