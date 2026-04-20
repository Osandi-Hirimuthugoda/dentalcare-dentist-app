import Bill from "../models/Bill.js";
import Patient from "../models/Patient.js";
import Appointment from "../models/Appointment.js";
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

// Get revenue analytics
export const getRevenueAnalytics = async (req, res) => {
  try {
    const user = getUserFromToken(req);
    if (!user || user.role !== "admin") {
      return res.status(401).json({ message: "Unauthorized. Admin access required." });
    }

    const { timeframe } = req.query; // 'monthly', 'weekly', 'yearly'
    
    // Total revenue
    const totalRevenue = await Bill.aggregate([
      { $match: { status: "paid" } },
      { $group: { _id: null, total: { $sum: "$total" } } }
    ]);

    // Revenue by month (last 12 months)
    const monthlyRevenue = await Bill.aggregate([
      { $match: { status: "paid" } },
      {
        $group: {
          _id: { 
            month: { $month: "$paidDate" },
            year: { $year: "$paidDate" }
          },
          revenue: { $sum: "$total" }
        }
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
      { $limit: 12 }
    ]);

    // Revenue by doctor
    const doctorRevenue = await Bill.aggregate([
      { $match: { status: "paid" } },
      {
        $group: {
          _id: "$doctor",
          revenue: { $sum: "$total" }
        }
      },
      {
        $lookup: {
          from: "doctors",
          localField: "_id",
          foreignField: "_id",
          as: "doctorInfo"
        }
      },
      { $unwind: "$doctorInfo" },
      {
        $project: {
          doctorName: "$doctorInfo.fullName",
          revenue: 1
        }
      },
      { $sort: { revenue: -1 } }
    ]);

    res.status(200).json({
      success: true,
      summary: {
        totalRevenue: totalRevenue[0]?.total || 0,
        monthlyRevenue,
        doctorRevenue
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get patient growth analytics
export const getPatientAnalytics = async (req, res) => {
  try {
    const user = getUserFromToken(req);
    if (!user || user.role !== "admin") {
      return res.status(401).json({ message: "Unauthorized." });
    }

    const patientGrowth = await Patient.aggregate([
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
      { $limit: 12 }
    ]);

    const genderDistribution = await Patient.aggregate([
      { $group: { _id: "$gender", count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      success: true,
      patientGrowth,
      genderDistribution
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get appointment trends
export const getAppointmentTrends = async (req, res) => {
  try {
    const statusBreakdown = await Appointment.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    const serviceTrends = await Bill.aggregate([
      { $group: { _id: "$service", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    res.status(200).json({
      success: true,
      statusBreakdown,
      serviceTrends
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
