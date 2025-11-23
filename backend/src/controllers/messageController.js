import Message from "../models/Message.js";
import Patient from "../models/Patient.js";
import Doctor from "../models/doctorModel.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

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

// 📨 Get messages for a doctor (conversations with patients AND other doctors)
export const getDoctorMessages = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { type } = req.query; // 'patients', 'doctors', or 'all'

    // Get all messages where doctor is sender or receiver
    let query = {
      $or: [
        { receiver: doctorId, receiverModel: "Doctor" },
        { sender: doctorId, senderModel: "Doctor" }
      ]
    };

    // Filter by conversation type if specified
    if (type === "patients") {
      query = {
        $or: [
          { sender: doctorId, senderModel: "Doctor", receiverModel: "Patient" },
          { receiver: doctorId, receiverModel: "Doctor", senderModel: "Patient" }
        ]
      };
    } else if (type === "doctors") {
      query = {
        $or: [
          { sender: doctorId, senderModel: "Doctor", receiverModel: "Doctor" },
          { receiver: doctorId, receiverModel: "Doctor", senderModel: "Doctor" }
        ]
      };
    }

    const messages = await Message.find(query)
      .sort({ createdAt: -1 });

    // Populate sender and receiver separately based on their model type
    for (let msg of messages) {
      if (msg.senderModel === "Patient") {
        await msg.populate("sender", "name email");
      } else {
        await msg.populate("sender", "fullName email");
      }
      
      if (msg.receiverModel === "Patient") {
        await msg.populate("receiver", "name email");
      } else {
        await msg.populate("receiver", "fullName email");
      }
      
      if (msg.patient) {
        await msg.populate("patient", "name email");
      }
    }

    // Group messages by patient/doctor (conversation)
    const conversations = {};
    messages.forEach(msg => {
      // Determine the other party in the conversation
      let otherPartyId, otherPartyName, otherPartyEmail, conversationType;
      
      if (msg.senderModel === "Patient" && msg.receiverModel === "Doctor") {
        otherPartyId = msg.sender._id ? msg.sender._id.toString() : msg.sender.toString();
        otherPartyName = msg.sender.name || "Unknown Patient";
        otherPartyEmail = msg.sender.email || "";
        conversationType = "patient";
      } else if (msg.senderModel === "Doctor" && msg.receiverModel === "Patient") {
        otherPartyId = msg.receiver._id ? msg.receiver._id.toString() : msg.receiver.toString();
        otherPartyName = msg.receiver.name || "Unknown Patient";
        otherPartyEmail = msg.receiver.email || "";
        conversationType = "patient";
      } else if (msg.senderModel === "Doctor" && msg.receiverModel === "Doctor") {
        // Doctor-to-doctor conversation
        if (msg.sender._id.toString() === doctorId) {
          otherPartyId = msg.receiver._id ? msg.receiver._id.toString() : msg.receiver.toString();
          otherPartyName = msg.receiver.fullName || "Unknown Doctor";
          otherPartyEmail = msg.receiver.email || "";
        } else {
          otherPartyId = msg.sender._id ? msg.sender._id.toString() : msg.sender.toString();
          otherPartyName = msg.sender.fullName || "Unknown Doctor";
          otherPartyEmail = msg.sender.email || "";
        }
        conversationType = "doctor";
      } else {
        // Skip other types
        return;
      }

      const conversationKey = `${conversationType}_${otherPartyId}`;
      if (!conversations[conversationKey]) {
        conversations[conversationKey] = {
          id: otherPartyId,
          name: otherPartyName,
          email: otherPartyEmail,
          type: conversationType, // 'patient' or 'doctor'
          lastMessage: msg.message,
          lastMessageTime: msg.createdAt,
          unreadCount: 0,
          messages: []
        };
      }

      // Update last message if this is more recent
      if (new Date(msg.createdAt) > new Date(conversations[conversationKey].lastMessageTime)) {
        conversations[conversationKey].lastMessage = msg.message;
        conversations[conversationKey].lastMessageTime = msg.createdAt;
      }

      conversations[conversationKey].messages.push({
        id: msg._id,
        message: msg.message,
        sender: msg.sender._id.toString() === doctorId ? "You" : otherPartyName,
        time: msg.createdAt,
        read: msg.read
      });

      // Count unread messages (messages sent to doctor that are unread)
      if (msg.receiver._id.toString() === doctorId && !msg.read) {
        conversations[conversationKey].unreadCount++;
      }
    });

    // Convert to array and sort by last message time
    const conversationsList = Object.values(conversations).sort(
      (a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime)
    );

    res.status(200).json(conversationsList);
  } catch (error) {
    console.error("Error fetching doctor messages:", error);
    res.status(500).json({ message: error.message });
  }
};

// 📨 Get messages for a patient (conversations with doctors)
export const getPatientMessages = async (req, res) => {
  try {
    const user = getUserFromToken(req);
    if (!user || user.role !== "patient") {
      console.log("❌ getPatientMessages: Unauthorized - user:", user);
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const patientId = user.id;
    console.log("📥 getPatientMessages: Fetching messages for patient:", patientId);
    console.log("   Patient ID type:", typeof patientId);

    // Convert patientId to ObjectId for proper querying
    let patientObjectId;
    try {
      patientObjectId = mongoose.Types.ObjectId.isValid(patientId) 
        ? new mongoose.Types.ObjectId(patientId) 
        : patientId;
    } catch (e) {
      console.log("⚠️ Error converting patientId to ObjectId:", e);
      patientObjectId = patientId;
    }

    const messages = await Message.find({
      $or: [
        { receiver: patientObjectId, receiverModel: "Patient" },
        { sender: patientObjectId, senderModel: "Patient" }
      ]
    })
      .populate("sender", "name email fullName")
      .populate("receiver", "name email fullName")
      .sort({ createdAt: -1 });

    console.log(`📊 Found ${messages.length} messages for patient ${patientId}`);
    
    // Log sample messages for debugging
    if (messages.length > 0) {
      console.log("   Sample message:", {
        id: messages[0]._id,
        sender: messages[0].senderModel,
        receiver: messages[0].receiverModel,
        senderId: messages[0].sender?._id?.toString(),
        receiverId: messages[0].receiver?._id?.toString(),
        message: messages[0].message?.substring(0, 50)
      });
    }

    // Group by doctor
    const conversations = {};
    messages.forEach(msg => {
      let doctorId, doctorName, doctorEmail;
      
      if (msg.senderModel === "Doctor" && msg.receiverModel === "Patient") {
        doctorId = msg.sender?._id?.toString() || msg.sender?.toString();
        doctorName = msg.sender?.fullName || "Unknown Doctor";
        doctorEmail = msg.sender?.email || "";
      } else if (msg.senderModel === "Patient" && msg.receiverModel === "Doctor") {
        doctorId = msg.receiver?._id?.toString() || msg.receiver?.toString();
        doctorName = msg.receiver?.fullName || "Unknown Doctor";
        doctorEmail = msg.receiver?.email || "";
      } else {
        // Skip messages that don't match doctor-patient pattern
        console.log("⚠️ Skipping message with unexpected pattern:", {
          senderModel: msg.senderModel,
          receiverModel: msg.receiverModel
        });
        return;
      }

      if (!doctorId) {
        console.log("⚠️ No doctorId found for message:", msg._id);
        return;
      }

      if (!conversations[doctorId]) {
        conversations[doctorId] = {
          doctorId: doctorId,
          doctorName: doctorName,
          doctorEmail: doctorEmail,
          lastMessage: msg.message,
          lastMessageTime: msg.createdAt,
          unreadCount: 0,
          messages: []
        };
      }

      conversations[doctorId].messages.push({
        id: msg._id,
        message: msg.message,
        sender: msg.senderModel === "Patient" ? "You" : doctorName,
        time: msg.createdAt,
        read: msg.read
      });

      if (msg.receiverModel === "Patient" && !msg.read) {
        conversations[doctorId].unreadCount++;
      }
    });

    const conversationsList = Object.values(conversations).sort(
      (a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime)
    );

    console.log(`✅ Returning ${conversationsList.length} conversations for patient`);
    console.log("   Conversations:", conversationsList.map(c => ({
      doctorId: c.doctorId,
      doctorName: c.doctorName,
      messageCount: c.messages.length,
      unreadCount: c.unreadCount
    })));

    res.status(200).json(conversationsList);
  } catch (error) {
    console.error("❌ Error fetching patient messages:", error);
    res.status(500).json({ message: error.message });
  }
};

// 💬 Send a message
export const sendMessage = async (req, res) => {
  try {
    const { senderId, senderType, receiverId, receiverType, message, patientId, appointmentId, isAnnouncement, announcementType } = req.body;

    console.log("📤 Send message request:", {
      senderId,
      senderType,
      receiverId,
      receiverType,
      messageLength: message?.length,
      isAnnouncement,
      announcementType
    });

    if (!senderId || !senderType || !message) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // If it's an announcement, send to multiple patients
    if (isAnnouncement && senderType === "doctor") {
      const doctor = await Doctor.findById(senderId);
      if (!doctor) {
        return res.status(404).json({ message: "Doctor not found" });
      }

      // Get all patients who have appointments with this doctor
      const Appointment = (await import("../models/Appointment.js")).default;
      const appointments = await Appointment.find({ doctor: senderId }).distinct("patient");
      
      const messages = [];
      for (const patientId of appointments) {
        const newMessage = new Message({
          sender: senderId,
          senderModel: "Doctor",
          receiver: patientId,
          receiverModel: "Patient",
          message: message,
          patient: patientId,
          isAnnouncement: true,
          announcementType: announcementType || "general"
        });
        await newMessage.save();
        await newMessage.populate("sender", "fullName email");
        await newMessage.populate("receiver", "name email");
        messages.push(newMessage);
      }

      return res.status(201).json({ 
        message: "Announcement sent successfully",
        count: messages.length,
        messages: messages 
      });
    }

    // Regular one-to-one message
    if (!receiverId || !receiverType) {
      return res.status(400).json({ message: "Receiver ID and type are required for regular messages" });
    }

    console.log("💬 Creating regular message:", {
      senderId,
      senderType,
      receiverId,
      receiverType,
      patientId
    });

    // Convert IDs to ObjectId for proper storage
    const senderObjectId = mongoose.Types.ObjectId.isValid(senderId) 
      ? new mongoose.Types.ObjectId(senderId) 
      : senderId;
    const receiverObjectId = mongoose.Types.ObjectId.isValid(receiverId) 
      ? new mongoose.Types.ObjectId(receiverId) 
      : receiverId;
    const patientObjectId = patientId && mongoose.Types.ObjectId.isValid(patientId)
      ? new mongoose.Types.ObjectId(patientId)
      : patientId;

    console.log("   Converted IDs:", {
      senderObjectId: senderObjectId.toString(),
      receiverObjectId: receiverObjectId.toString(),
      patientObjectId: patientObjectId?.toString()
    });

    const newMessage = new Message({
      sender: senderObjectId,
      senderModel: senderType === "doctor" ? "Doctor" : "Patient",
      receiver: receiverObjectId,
      receiverModel: receiverType === "doctor" ? "Doctor" : "Patient",
      message: message,
      patient: patientObjectId || null,
      appointment: appointmentId || null,
      isAnnouncement: isAnnouncement || false,
      announcementType: announcementType || null
    });

    await newMessage.save();
    console.log("✅ Message saved:", {
      messageId: newMessage._id,
      sender: newMessage.senderModel,
      receiver: newMessage.receiverModel,
      read: newMessage.read
    });

    // Populate before sending
    await newMessage.populate("sender", "name email fullName");
    await newMessage.populate("receiver", "name email fullName");

    console.log("📨 Message populated and ready to send");

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ Mark message as read
export const markAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findByIdAndUpdate(
      messageId,
      { read: true },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    res.status(200).json({ message: "Message marked as read", message: message });
  } catch (error) {
    console.error("Error marking message as read:", error);
    res.status(500).json({ message: error.message });
  }
};

// 📋 Get conversation between doctor and patient, or doctor and doctor
export const getConversation = async (req, res) => {
  try {
    const { doctorId, patientId, otherDoctorId } = req.params;

    let query;
    if (patientId) {
      // Doctor-Patient conversation
      query = {
        $or: [
          { sender: doctorId, senderModel: "Doctor", receiver: patientId, receiverModel: "Patient" },
          { sender: patientId, senderModel: "Patient", receiver: doctorId, receiverModel: "Doctor" }
        ]
      };
    } else if (otherDoctorId) {
      // Doctor-Doctor conversation
      query = {
        $or: [
          { sender: doctorId, senderModel: "Doctor", receiver: otherDoctorId, receiverModel: "Doctor" },
          { sender: otherDoctorId, senderModel: "Doctor", receiver: doctorId, receiverModel: "Doctor" }
        ]
      };
    } else {
      return res.status(400).json({ message: "Either patientId or otherDoctorId is required" });
    }

    const messages = await Message.find(query)
      .populate("sender", "name email fullName")
      .populate("receiver", "name email fullName")
      .sort({ createdAt: 1 }); // Oldest first for conversation view

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching conversation:", error);
    res.status(500).json({ message: error.message });
  }
};

// 📢 Get announcements for a patient
export const getPatientAnnouncements = async (req, res) => {
  try {
    const user = getUserFromToken(req);
    if (!user || user.role !== "patient") {
      console.log("❌ getPatientAnnouncements: Unauthorized - user:", user);
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const patientId = user.id;
    console.log("📢 getPatientAnnouncements: Fetching announcements for patient:", patientId);

    const announcements = await Message.find({
      receiver: patientId,
      receiverModel: "Patient",
      isAnnouncement: true
    })
      .populate("sender", "fullName email specialization")
      .sort({ createdAt: -1 });

    console.log(`✅ Found ${announcements.length} announcements for patient ${patientId}`);

    res.status(200).json(announcements);
  } catch (error) {
    console.error("❌ Error fetching announcements:", error);
    res.status(500).json({ message: error.message });
  }
};

// 👥 Get all doctors (for doctor-to-doctor messaging)
export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({}, "fullName email specialization hospital")
      .sort({ fullName: 1 });
    
    res.status(200).json(doctors);
  } catch (error) {
    console.error("Error fetching doctors:", error);
    res.status(500).json({ message: error.message });
  }
};

