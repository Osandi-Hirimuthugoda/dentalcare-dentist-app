import express from "express";
import {
  getWalletInfo,
  getWalletTransactions,
  topUpWallet,
  payFromWallet,
  payAppointmentWithWallet
} from "../controllers/walletController.js";

const router = express.Router();

router.get("/info", getWalletInfo);
router.get("/transactions", getWalletTransactions);
router.post("/topup", topUpWallet);
router.post("/pay", payFromWallet);
router.post("/pay-appointment", payAppointmentWithWallet);

export default router;
