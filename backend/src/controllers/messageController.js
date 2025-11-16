import Message from "../models/Message.js";
import Patient from "../models/Patient.js";
import Doctor from "../models/doctorModel.js";

// 📨 Get messages for a doctor (conversations with patients)
export const getDoctorMessages = async (req, res) => {
  try {
    const { doctorId } = req.params;

    // Get all messages where doctor is sender or receiver
    const messages = await Message.find({
      $or: [
        { receiver: doctorId, receiverModel: "Doctor" },
        { sender: doctorId, senderModel: "Doctor" }
      ]
    })
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
      // Determine the other party in the conversation (patient)
      let otherPartyId, otherPartyName, otherPartyEmail;
      
      if (msg.senderModel === "Patient" && msg.receiverModel === "Doctor") {
        otherPartyId = msg.sender._id ? msg.sender._id.toString() : msg.sender.toString();
        otherPartyName = msg.sender.name || "Unknown Patient";
        otherPartyEmail = msg.sender.email || "";
      } else if (msg.senderModel === "Doctor" && msg.receiverModel === "Patient") {
        otherPartyId = msg.receiver._id ? msg.receiver._id.toString() : msg.receiver.toString();
        otherPartyName = msg.receiver.name || "Unknown Patient";
        otherPartyEmail = msg.receiver.email || "";
      } else {
        // Skip if not a doctor-patient conversation
        return;
      }

      if (!conversations[otherPartyId]) {
        conversations[otherPartyId] = {
          patientId: otherPartyId,
          patientName: otherPartyName,
          patientEmail: otherPartyEmail,
          lastMessage: msg.message,
          lastMessageTime: msg.createdAt,
          unreadCount: 0,
          messages: []
        };
      }

      // Update last message if this is more recent
      if (new Date(msg.createdAt) > new Date(conversations[otherPartyId].lastMessageTime)) {
        conversations[otherPartyId].lastMessage = msg.message;
        conversations[otherPartyId].lastMessageTime = msg.createdAt;
      }

      conversations[otherPartyId].messages.push({
        id: msg._id,
        message: msg.message,
        sender: msg.senderModel === "Doctor" ? "You" : otherPartyName,
        time: msg.createdAt,
        read: msg.read
      });

      // Count unread messages (messages sent to doctor that are unread)
      if (msg.receiverModel === "Doctor" && !msg.read) {
        conversations[otherPartyId].unreadCount++;
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
    const { patientId } = req.params;

    const messages = await Message.find({
      $or: [
        { receiver: patientId, receiverModel: "Patient" },
        { sender: patientId, senderModel: "Patient" }
      ]
    })
      .populate("sender", "name email fullName")
      .populate("receiver", "name email fullName")
      .populate("doctor", "fullName email specialization")
      .sort({ createdAt: -1 });

    // Group by doctor
    const conversations = {};
    messages.forEach(msg => {
      let doctorId, doctorName, doctorEmail;
      
      if (msg.senderModel === "Doctor" && msg.receiverModel === "Patient") {
        doctorId = msg.sender._id.toString();
        doctorName = msg.sender.fullName;
        doctorEmail = msg.sender.email;
      } else if (msg.senderModel === "Patient" && msg.receiverModel === "Doctor") {
        doctorId = msg.receiver._id.toString();
        doctorName = msg.receiver.fullName;
        doctorEmail = msg.receiver.email;
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

    res.status(200).json(conversationsList);
  } catch (error) {
    console.error("Error fetching patient messages:", error);
    res.status(500).json({ message: error.message });
  }
};

// 💬 Send a message
export const sendMessage = async (req, res) => {
  try {
    const { senderId, senderType, receiverId, receiverType, message, patientId, appointmentId } = req.body;

    if (!senderId || !senderType || !receiverId || !receiverType || !message) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newMessage = new Message({
      sender: senderId,
      senderModel: senderType === "doctor" ? "Doctor" : "Patient",
      receiver: receiverId,
      receiverModel: receiverType === "doctor" ? "Doctor" : "Patient",
      message: message,
      patient: patientId || null,
      appointment: appointmentId || null
    });

    await newMessage.save();

    // Populate before sending
    await newMessage.populate("sender", "name email fullName");
    await newMessage.populate("receiver", "name email fullName");

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

// 📋 Get conversation between doctor and patient
export const getConversation = async (req, res) => {
  try {
    const { doctorId, patientId } = req.params;

    const messages = await Message.find({
      $or: [
        { sender: doctorId, senderModel: "Doctor", receiver: patientId, receiverModel: "Patient" },
        { sender: patientId, senderModel: "Patient", receiver: doctorId, receiverModel: "Doctor" }
      ]
    })
      .populate("sender", "name email fullName")
      .populate("receiver", "name email fullName")
      .sort({ createdAt: 1 }); // Oldest first for conversation view

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching conversation:", error);
    res.status(500).json({ message: error.message });
  }
};

