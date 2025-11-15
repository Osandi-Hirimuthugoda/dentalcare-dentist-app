import express from "express";
import { loginAdmin, registerDoctor } from "../controllers/authController.js";

const router = express.Router();

router.post("/admin/login", loginAdmin);
router.post("/admin/register-doctor", registerDoctor);

export default router;
