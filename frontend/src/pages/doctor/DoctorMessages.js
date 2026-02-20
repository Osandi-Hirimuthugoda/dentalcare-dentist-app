import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { MessageSquare, Search, Send, User, Clock, Mail, ArrowLeft } from "lucide-react";
import DoctorSidebar from "../../components/layout/DoctorSidebar";
import "../../styles/pages/DoctorMessages.css";

const DoctorMessages = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [conversation, setConversation] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [activeTab, setActiveTab] = useState("patients"); // 'patients' or 'doctors'
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [announcementText, setAnnouncementText] = useState("");
  const [announcementType, setAnnouncementType] = useState("general");
  const [allDoctors, setAllDoctors] = useState([]);

  useEffect(() => {
    fetchMessages();
    if (activeTab === "doctors") {
      fetchAllDoctors();
    }
  }, [activeTab]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const doctorData = JSON.parse(localStorage.getItem("doctor") || "{}");
      
      if (!doctorData._id) {
        setLoading(false);
        return;
      }

      const type = activeTab === "patients" ? "patients" : activeTab === "doctors" ? "doctors" : "all";
      const response = await axios.get(`http://localhost:4000/api/messages/doctor/${doctorData._id}?type=${type}`);
      
      // Transform the response to match the expected format
      const transformedMessages = response.data.map(conv => ({
        id: conv.id || conv.patientId,
        sender: conv.name || conv.patientName,
        senderEmail: conv.email || conv.patientEmail,
        message: conv.lastMessage,
        time: new Date(conv.lastMessageTime).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "Asia/Colombo"
        }),
        date: new Date(conv.lastMessageTime).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          timeZone: "Asia/Colombo"
        }),
        unread: conv.unreadCount > 0,
        unreadCount: conv.unreadCount,
        patientId: conv.id || conv.patientId,
        type: conv.type || "patient", // 'patient' or 'doctor'
      }));

      setMessages(transformedMessages);
    } catch (err) {
      console.error("Error fetching messages:", err);
      // Use empty array if API fails
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllDoctors = async () => {
    try {
      const response = await axios.get(`http://localhost:4000/api/messages/doctors`);
      setAllDoctors(response.data || []);
    } catch (err) {
      console.error("Error fetching doctors:", err);
      setAllDoctors([]);
    }
  };

  const filteredMessages = messages.filter(
    (msg) =>
      msg.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectPatient = async (patientMsg) => {
    if (patientMsg.type === "doctor") {
      setSelectedDoctor(patientMsg);
      setSelectedPatient(null);
    } else {
      setSelectedPatient(patientMsg);
      setSelectedDoctor(null);
    }
    
    try {
      const doctorData = JSON.parse(localStorage.getItem("doctor") || "{}");
      let response;
      
      if (patientMsg.type === "doctor") {
        response = await axios.get(
          `http://localhost:4000/api/messages/conversation/doctors/${doctorData._id}/${patientMsg.patientId}`
        );
      } else {
        response = await axios.get(
          `http://localhost:4000/api/messages/conversation/${doctorData._id}/${patientMsg.patientId}`
        );
      }
      setConversation(response.data || []);
    } catch (err) {
      console.error("Error fetching conversation:", err);
      setConversation([]);
    }
  };

  const handleSendMessage = async () => {
    const currentSelection = selectedPatient || selectedDoctor;
    if (!newMessage.trim() || !currentSelection) return;

    try {
      setSendingMessage(true);
      const doctorData = JSON.parse(localStorage.getItem("doctor") || "{}");
      
      const receiverType = currentSelection.type === "doctor" ? "doctor" : "patient";
      
      await axios.post("http://localhost:4000/api/messages/", {
        senderId: doctorData._id,
        senderType: "doctor",
        receiverId: currentSelection.patientId,
        receiverType: receiverType,
        message: newMessage.trim(),
        patientId: currentSelection.type === "patient" ? currentSelection.patientId : null,
      });

      setNewMessage("");
      // Refresh conversation
      await handleSelectPatient(currentSelection);
      // Refresh messages list
      await fetchMessages();
    } catch (err) {
      console.error("Error sending message:", err);
      alert("Failed to send message. Please try again.");
    } finally {
      setSendingMessage(false);
    }
  };

  const handleSendAnnouncement = async () => {
    if (!announcementText.trim()) {
      alert("Please enter an announcement message.");
      return;
    }

    try {
      setSendingMessage(true);
      const doctorData = JSON.parse(localStorage.getItem("doctor") || "{}");
      
      await axios.post("http://localhost:4000/api/messages/", {
        senderId: doctorData._id,
        senderType: "doctor",
        message: announcementText.trim(),
        isAnnouncement: true,
        announcementType: announcementType,
      });

      alert("Announcement sent to all your patients!");
      setAnnouncementText("");
      setShowAnnouncementModal(false);
      await fetchMessages();
    } catch (err) {
      console.error("Error sending announcement:", err);
      alert("Failed to send announcement. Please try again.");
    } finally {
      setSendingMessage(false);
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 50%, #CBD5E1 100%)" }}>
      <DoctorSidebar />
      <div style={{ flex: 1, marginLeft: "14rem", padding: "2rem 2.5rem", width: selectedPatient ? "60%" : "100%" }}>
        <div style={{ 
          background: "white", 
          borderRadius: "1.25rem", 
          padding: "1.5rem 2rem", 
          marginBottom: "2rem", 
          border: "1px solid rgba(0, 0, 0, 0.05)", 
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ display: "flex", alignItems: "center", gap: "1rem" }}
          >
            <h2 style={{ 
              margin: 0, 
              fontSize: "2.5rem", 
              fontWeight: "900", 
              background: "linear-gradient(135deg, #2563EB 0%, #3B82F6 50%, #60A5FA 100%)", 
              WebkitBackgroundClip: "text", 
              WebkitTextFillColor: "transparent", 
              backgroundClip: "text", 
              display: "flex", 
              alignItems: "center" 
            }}>
              <MessageSquare size={32} style={{ marginRight: "0.5rem", color: "#2563EB" }} />
              Messages
            </h2>
          </motion.div>
          {activeTab === "patients" && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAnnouncementModal(true)}
              style={{
                padding: "0.75rem 1.5rem",
                background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                color: "white",
                border: "none",
                borderRadius: "0.75rem",
                cursor: "pointer",
                fontSize: "0.9rem",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                boxShadow: "0 4px 15px rgba(16, 185, 129, 0.3)"
              }}
            >
              Send Announcement
            </motion.button>
          )}
        </div>

        {/* Tabs */}
        <div style={{ 
          background: "white", 
          borderRadius: "1.25rem", 
          padding: "0.5rem", 
          marginBottom: "2rem", 
          border: "1px solid rgba(0, 0, 0, 0.05)", 
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
          display: "flex",
          gap: "0.5rem"
        }}>
          <button
            onClick={() => {
              setActiveTab("patients");
              setSelectedPatient(null);
              setSelectedDoctor(null);
            }}
            style={{
              flex: 1,
              padding: "0.875rem 1.5rem",
              border: "none",
              background: activeTab === "patients" ? "linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)" : "transparent",
              color: activeTab === "patients" ? "white" : "#6B7280",
              fontWeight: "600",
              cursor: "pointer",
              borderRadius: "0.75rem",
              transition: "all 0.3s ease"
            }}
          >
            Patients
          </button>
          <button
            onClick={() => {
              setActiveTab("doctors");
              setSelectedPatient(null);
              setSelectedDoctor(null);
            }}
            style={{
              flex: 1,
              padding: "0.875rem 1.5rem",
              border: "none",
              background: activeTab === "doctors" ? "linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)" : "transparent",
              color: activeTab === "doctors" ? "white" : "#6B7280",
              fontWeight: "600",
              cursor: "pointer",
              borderRadius: "0.75rem",
              transition: "all 0.3s ease"
            }}
          >
            Doctors
          </button>
        </div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            background: "white",
            borderRadius: "1.25rem",
            padding: "1.5rem",
            marginBottom: "2rem",
            border: "1px solid rgba(0, 0, 0, 0.05)",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
            position: "relative"
          }}
        >
          <Search
            size={20}
            style={{
              position: "absolute",
              left: "2.5rem",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#9CA3AF",
              pointerEvents: "none"
            }}
          />
          <input
            type="text"
            placeholder="Search messages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "0.875rem 1rem 0.875rem 3rem",
              border: "1px solid #E5E7EB",
              borderRadius: "0.75rem",
              fontSize: "0.95rem",
              outline: "none",
              backgroundColor: "white",
              transition: "all 0.3s ease"
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#60A5FA";
              e.target.style.boxShadow = "0 0 0 3px rgba(96, 165, 250, 0.1)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#E5E7EB";
              e.target.style.boxShadow = "none";
            }}
          />
        </motion.div>

        {/* Messages List */}
        {loading ? (
          <div style={{ 
            background: "white", 
            borderRadius: "1.25rem", 
            padding: "3rem", 
            textAlign: "center", 
            border: "1px solid rgba(0, 0, 0, 0.05)", 
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)" 
          }}>
            <div style={{ 
              width: "48px", 
              height: "48px", 
              border: "4px solid #E5E7EB", 
              borderTopColor: "#2563EB", 
              borderRadius: "50%", 
              animation: "spin 1s linear infinite", 
              margin: "0 auto 1rem" 
            }}></div>
            Loading messages...
          </div>
        ) : filteredMessages.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {filteredMessages.map((msg, idx) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ y: -2, boxShadow: "0 8px 16px rgba(0, 0, 0, 0.1)" }}
                style={{
                  backgroundColor: msg.unread || (selectedPatient && selectedPatient.id === msg.id) ? "#EFF6FF" : "white",
                  borderLeft: msg.unread || (selectedPatient && selectedPatient.id === msg.id) ? "4px solid #2563EB" : "4px solid transparent",
                  cursor: "pointer",
                  padding: "1.5rem",
                  borderRadius: "1.25rem",
                  border: "1px solid rgba(0, 0, 0, 0.05)",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
                  transition: "all 0.3s ease"
                }}
                onClick={() => handleSelectPatient(msg)}
              >
                <div style={{ display: "flex", gap: "1rem", flex: "1" }}>
                  <div
                    style={{
                      width: "3rem",
                      height: "3rem",
                      borderRadius: "50%",
                      backgroundColor: "#e0f2fe",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.25rem",
                      fontWeight: "600",
                      color: "#2563eb",
                      flexShrink: 0,
                    }}
                  >
                    {msg.sender.charAt(0)}
                  </div>
                  <div style={{ flex: "1", minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.25rem" }}>
                      <p className="message-sender" style={{ fontWeight: msg.unread ? "700" : "600" }}>
                        {msg.sender}
                        {msg.unread && (
                          <span
                            style={{
                              display: "inline-block",
                              padding: "0.125rem 0.5rem",
                              borderRadius: "1rem",
                              backgroundColor: "#2563eb",
                              color: "white",
                              fontSize: "0.75rem",
                              fontWeight: "600",
                              marginLeft: "0.5rem",
                            }}
                          >
                            {msg.unreadCount || "New"}
                          </span>
                        )}
                      </p>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.25rem" }}>
                        <span className="message-time">{msg.time}</span>
                        <span style={{ fontSize: "0.75rem", color: "#9ca3af" }}>{msg.date}</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                      <Mail size={12} style={{ color: "#9ca3af" }} />
                      <span style={{ fontSize: "0.875rem", color: "#6b7280" }}>{msg.senderEmail}</span>
                    </div>
                    <p className="message-content">{msg.message}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div style={{ 
            background: "white", 
            borderRadius: "1.25rem", 
            padding: "3rem", 
            textAlign: "center", 
            border: "1px solid rgba(0, 0, 0, 0.05)", 
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
            color: "#6B7280"
          }}>
            <MessageSquare size={48} style={{ marginBottom: "1rem", opacity: 0.5, color: "#9CA3AF" }} />
            <p style={{ fontSize: "1.1rem", fontWeight: "600", color: "#374151", marginBottom: "0.5rem" }}>
              {searchTerm ? "No messages found" : "No new messages"}
            </p>
            <p style={{ fontSize: "0.9rem", color: "#6B7280" }}>
              {searchTerm ? "Try adjusting your search terms" : "You're all caught up!"}
            </p>
          </div>
        )}
      </div>

      {/* Announcement Modal */}
      {showAnnouncementModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
        }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              backgroundColor: "white",
              padding: "2rem",
              borderRadius: "1.25rem",
              width: "90%",
              maxWidth: "500px",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
            }}
          >
            <h3 style={{ 
              margin: "0 0 1.5rem 0", 
              fontSize: "1.5rem", 
              fontWeight: "700",
              background: "linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text"
            }}>
              Send Announcement to All Patients
            </h3>
            <select
              value={announcementType}
              onChange={(e) => setAnnouncementType(e.target.value)}
              style={{
                width: "100%",
                padding: "0.875rem 1rem",
                marginBottom: "1rem",
                border: "1px solid #E5E7EB",
                borderRadius: "0.75rem",
                fontSize: "0.95rem",
                outline: "none",
                cursor: "pointer",
                transition: "all 0.3s ease"
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#60A5FA";
                e.target.style.boxShadow = "0 0 0 3px rgba(96, 165, 250, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#E5E7EB";
                e.target.style.boxShadow = "none";
              }}
            >
              <option value="general">General</option>
              <option value="appointment">Appointment</option>
              <option value="important">Important</option>
              <option value="reminder">Reminder</option>
            </select>
            <textarea
              value={announcementText}
              onChange={(e) => setAnnouncementText(e.target.value)}
              placeholder="Enter your announcement message..."
              rows={5}
              style={{
                width: "100%",
                padding: "0.875rem 1rem",
                marginBottom: "1.5rem",
                border: "1px solid #E5E7EB",
                borderRadius: "0.75rem",
                resize: "vertical",
                fontSize: "0.95rem",
                outline: "none",
                fontFamily: "inherit",
                transition: "all 0.3s ease"
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#60A5FA";
                e.target.style.boxShadow = "0 0 0 3px rgba(96, 165, 250, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#E5E7EB";
                e.target.style.boxShadow = "none";
              }}
            />
            <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setShowAnnouncementModal(false);
                  setAnnouncementText("");
                }}
                style={{
                  padding: "0.75rem 1.5rem",
                  backgroundColor: "#F3F4F6",
                  color: "#374151",
                  border: "1px solid #E5E7EB",
                  borderRadius: "0.75rem",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "0.9375rem",
                  transition: "all 0.3s ease"
                }}
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: sendingMessage || !announcementText.trim() ? 1 : 1.05 }}
                whileTap={{ scale: sendingMessage || !announcementText.trim() ? 1 : 0.95 }}
                onClick={handleSendAnnouncement}
                disabled={sendingMessage || !announcementText.trim()}
                style={{
                  padding: "0.75rem 1.5rem",
                  background: sendingMessage || !announcementText.trim() 
                    ? "#E5E7EB" 
                    : "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                  color: sendingMessage || !announcementText.trim() ? "#9CA3AF" : "white",
                  border: "none",
                  borderRadius: "0.75rem",
                  cursor: sendingMessage || !announcementText.trim() ? "not-allowed" : "pointer",
                  fontWeight: "600",
                  fontSize: "0.9375rem",
                  boxShadow: sendingMessage || !announcementText.trim() 
                    ? "none" 
                    : "0 4px 12px rgba(16, 185, 129, 0.3)",
                  transition: "all 0.3s ease"
                }}
              >
                {sendingMessage ? "Sending..." : "Send Announcement"}
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Conversation View */}
      {(selectedPatient || selectedDoctor) && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          style={{
            width: "40%",
            background: "white",
            borderLeft: "1px solid rgba(0, 0, 0, 0.05)",
            display: "flex",
            flexDirection: "column",
            height: "100vh",
            boxShadow: "-4px 0 6px rgba(0, 0, 0, 0.05)"
          }}
        >
          <div style={{
            padding: "1.5rem",
            borderBottom: "1px solid #E5E7EB",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            background: "white"
          }}>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                setSelectedPatient(null);
                setSelectedDoctor(null);
              }}
              style={{
                background: "rgba(37, 99, 235, 0.1)",
                border: "none",
                width: "2.5rem",
                height: "2.5rem",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "#2563EB",
                fontSize: "1.5rem",
                fontWeight: "700"
              }}
            >
              ←
            </motion.button>
            <div
              style={{
                width: "3rem",
                height: "3rem",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.25rem",
                fontWeight: "700",
                color: "white",
                boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)"
              }}
            >
              {(selectedPatient || selectedDoctor)?.sender?.charAt(0).toUpperCase() || "?"}
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.125rem", fontWeight: "700", color: "#1F2937" }}>
                {(selectedPatient || selectedDoctor)?.sender || "Unknown"}
              </h3>
              <p style={{ margin: 0, fontSize: "0.875rem", color: "#6B7280" }}>
                {(selectedPatient || selectedDoctor)?.senderEmail || ""}
              </p>
            </div>
          </div>

          <div style={{
            flex: 1,
            overflowY: "auto",
            padding: "1.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            background: "#F9FAFB"
          }}>
            {conversation.map((msg) => {
              const isDoctor = msg.senderModel === "Doctor";
              return (
                <motion.div
                  key={msg._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    alignSelf: isDoctor ? "flex-end" : "flex-start",
                    maxWidth: "75%",
                  }}
                >
                  <div
                    style={{
                      padding: "0.875rem 1.125rem",
                      borderRadius: isDoctor ? "1.25rem 1.25rem 0.25rem 1.25rem" : "1.25rem 1.25rem 1.25rem 0.25rem",
                      background: isDoctor ? "linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)" : "white",
                      color: isDoctor ? "white" : "#1F2937",
                      boxShadow: isDoctor ? "0 4px 12px rgba(37, 99, 235, 0.3)" : "0 2px 8px rgba(0, 0, 0, 0.1)",
                      border: isDoctor ? "none" : "1px solid #E5E7EB"
                    }}
                  >
                    <p style={{ margin: 0, fontSize: "0.9375rem", lineHeight: "1.5" }}>{msg.message}</p>
                    <span style={{
                      fontSize: "0.75rem",
                      opacity: 0.8,
                      display: "block",
                      marginTop: "0.375rem",
                      textAlign: isDoctor ? "right" : "left"
                    }}>
                      {new Date(msg.createdAt).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                        timeZone: "Asia/Colombo"
                      })}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div style={{
            padding: "1.5rem",
            borderTop: "1px solid #E5E7EB",
            display: "flex",
            gap: "0.75rem",
            background: "white"
          }}>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder={`Type a message to ${(selectedPatient || selectedDoctor)?.sender || "..."}...`}
              style={{
                flex: 1,
                padding: "0.875rem 1rem",
                border: "1px solid #E5E7EB",
                borderRadius: "0.75rem",
                fontSize: "0.9375rem",
                outline: "none",
                transition: "all 0.3s ease"
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#60A5FA";
                e.target.style.boxShadow = "0 0 0 3px rgba(96, 165, 250, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#E5E7EB";
                e.target.style.boxShadow = "none";
              }}
            />
            <motion.button
              whileHover={{ scale: newMessage.trim() && !sendingMessage && (selectedPatient || selectedDoctor) ? 1.05 : 1 }}
              whileTap={{ scale: newMessage.trim() && !sendingMessage && (selectedPatient || selectedDoctor) ? 0.95 : 1 }}
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || sendingMessage || (!selectedPatient && !selectedDoctor)}
              style={{
                padding: "0.875rem 1.5rem",
                background: newMessage.trim() && !sendingMessage && (selectedPatient || selectedDoctor) 
                  ? "linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)" 
                  : "#E5E7EB",
                color: newMessage.trim() && !sendingMessage && (selectedPatient || selectedDoctor) ? "white" : "#9CA3AF",
                border: "none",
                borderRadius: "0.75rem",
                cursor: newMessage.trim() && !sendingMessage && (selectedPatient || selectedDoctor) ? "pointer" : "not-allowed",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                fontWeight: "600",
                fontSize: "0.9375rem",
                boxShadow: newMessage.trim() && !sendingMessage && (selectedPatient || selectedDoctor) 
                  ? "0 4px 12px rgba(37, 99, 235, 0.3)" 
                  : "none",
                transition: "all 0.3s ease"
              }}
            >
              <Send size={18} />
              {sendingMessage ? "Sending..." : "Send"}
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default DoctorMessages;