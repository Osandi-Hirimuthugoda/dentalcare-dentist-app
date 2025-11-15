import jwt from "jsonwebtoken";
import Doctor from "../models/Doctor.js";

export const protect = async (req, res, next) => {
  let token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Not authorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.doctor = await Doctor.findById(decoded.id).select("-password");
    next();
  } catch (error) {
    res.status(401).json({ message: "Token failed" });
  }
};
