import Notification from "../models/Notification.js";
import Patient from "../models/Patient.js";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dentalcare_secret_key_change_in_production";

// Helper function to extract user from token
const getUserFromToken = (req) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return null;
    }
    
    const token = authHeader.split(" ")[1];
    if (!token) {
      return null;
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (err) {
    console.error(`❌ Token verification failed: ${err.message}`);
    return null;
  }
};

// 📬 Get all notifications for a patient
export const getPatientNotifications = async (req, res) => {
  try {
    const user = getUserFromToken(req);
    if (!user || user.role !== "patient") {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const notifications = await Notification.find({ patient: user.id })
      .populate("doctor", "fullName specialization")
      .populate("appointment")
      .sort({ createdAt: -1 });
    
    res.status(200).json(notifications);
  } catch (err) {
    console.error("❌ Error fetching notifications:", err);
    res.status(500).json({ message: err.message });
  }
};

// ✅ Mark notification as read
export const markNotificationAsRead = async (req, res) => {
  try {
    const user = getUserFromToken(req);
    if (!user || user.role !== "patient") {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const { notificationId } = req.params;
    
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, patient: user.id },
      { isRead: true },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    
    res.status(200).json(notification);
  } catch (err) {
    console.error("❌ Error marking notification as read:", err);
    res.status(500).json({ message: err.message });
  }
};

// ✅ Mark all notifications as read
export const markAllNotificationsAsRead = async (req, res) => {
  try {
    const user = getUserFromToken(req);
    if (!user || user.role !== "patient") {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    await Notification.updateMany(
      { patient: user.id, isRead: false },
      { isRead: true }
    );
    
    res.status(200).json({ message: "All notifications marked as read" });
  } catch (err) {
    console.error("❌ Error marking all notifications as read:", err);
    res.status(500).json({ message: err.message });
  }
};

// 🗑️ Delete notification
export const deleteNotification = async (req, res) => {
  try {
    const user = getUserFromToken(req);
    if (!user || user.role !== "patient") {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const { notificationId } = req.params;
    
    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      patient: user.id
    });
    
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    
    res.status(200).json({ message: "Notification deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting notification:", err);
    res.status(500).json({ message: err.message });
  }
};

// ➕ Create notification (internal use - called by other controllers)
export const createNotification = async (notificationData) => {
  try {
    const notification = new Notification(notificationData);
    await notification.save();
    console.log(`✅ Notification created: ${notification._id}`);
    return notification;
  } catch (err) {
    console.error("❌ Error creating notification:", err);
    throw err;
  }
};

