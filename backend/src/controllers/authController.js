import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import Doctor from "../models/Doctor.js";

const JWT_SECRET = process.env.JWT_SECRET || "secretkey";

// 🧑‍⚕️ Admin login
export const loginAdmin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const isValid = await bcrypt.compare(password, admin.passwordHash);
    if (!isValid) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: admin._id, role: "admin" }, JWT_SECRET, { expiresIn: "1d" });
    res.json({ token, admin });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ➕ Register new doctor (admin only)
export const registerDoctor = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const doctor = new Doctor({ name, email, passwordHash });
    await doctor.save();
    res.status(201).json({ message: "Doctor registered successfully", doctor });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
