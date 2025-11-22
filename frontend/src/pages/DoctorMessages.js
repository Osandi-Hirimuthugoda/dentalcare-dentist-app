import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { MessageSquare, Search, Send, User, Clock, Mail } from "lucide-react";
import DoctorSidebar from "../components/DoctorSidebar";
import "../styles/DoctorMessages.css";

const DoctorMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [conversation, setConversation] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const doctorData = JSON.parse(localStorage.getItem("doctor") || "{}");
      
      if (!doctorData._id) {
        setLoading(false);
        return;
      }

      const response = await axios.get(`http://localhost:4000/api/messages/doctor/${doctorData._id}`);
      
      // Transform the response to match the expected format
      const transformedMessages = response.data.map(conv => ({
        id: conv.patientId,
        sender: conv.patientName,
        senderEmail: conv.patientEmail,
        message: conv.lastMessage,
        time: new Date(conv.lastMessageTime).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        date: new Date(conv.lastMessageTime).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        unread: conv.unreadCount > 0,
        unreadCount: conv.unreadCount,
        patientId: conv.patientId,
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

  const filteredMessages = messages.filter(
    (msg) =>
      msg.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectPatient = async (patientMsg) => {
    setSelectedPatient(patientMsg);
    try {
      const doctorData = JSON.parse(localStorage.getItem("doctor") || "{}");
      const response = await axios.get(
        `http://localhost:4000/api/messages/conversation/${doctorData._id}/${patientMsg.patientId}`
      );
      setConversation(response.data || []);
    } catch (err) {
      console.error("Error fetching conversation:", err);
      setConversation([]);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedPatient) return;

    try {
      setSendingMessage(true);
      const doctorData = JSON.parse(localStorage.getItem("doctor") || "{}");
      
      await axios.post("http://localhost:4000/api/messages/", {
        senderId: doctorData._id,
        senderType: "doctor",
        receiverId: selectedPatient.patientId,
        receiverType: "patient",
        message: newMessage.trim(),
        patientId: selectedPatient.patientId,
      });

      setNewMessage("");
      // Refresh conversation
      await handleSelectPatient(selectedPatient);
      // Refresh messages list
      await fetchMessages();
    } catch (err) {
      console.error("Error sending message:", err);
      alert("Failed to send message. Please try again.");
    } finally {
      setSendingMessage(false);
    }
  };

  return (
    <div className="messages-page" style={{ display: "flex" }}>
      <DoctorSidebar />
      <div className="messages-main-content" style={{ flex: selectedPatient ? "1" : "1", width: selectedPatient ? "60%" : "100%" }}>
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="messages-page-title"
        >
          <MessageSquare size={28} style={{ marginRight: "0.5rem", color: "#2563eb" }} />
          Messages
        </motion.h2>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            position: "relative",
            marginBottom: "2rem",
          }}
        >
          <Search
            size={20}
            style={{
              position: "absolute",
              left: "1rem",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#9ca3af",
            }}
          />
          <input
            type="text"
            placeholder="Search messages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "0.75rem 0.75rem 0.75rem 3rem",
              border: "1px solid #d1d5db",
              borderRadius: "0.75rem",
              fontSize: "1rem",
              outline: "none",
              backgroundColor: "white",
            }}
          />
        </motion.div>

        {/* Messages List */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "3rem" }}>Loading messages...</div>
        ) : filteredMessages.length > 0 ? (
          <div className="messages-container">
            {filteredMessages.map((msg, idx) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="message-list-item"
                style={{
                  backgroundColor: msg.unread || (selectedPatient && selectedPatient.id === msg.id) ? "#eff6ff" : "white",
                  borderLeft: msg.unread || (selectedPatient && selectedPatient.id === msg.id) ? "4px solid #2563eb" : "4px solid transparent",
                  cursor: "pointer",
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
          <div style={{ textAlign: "center", padding: "3rem", color: "#6b7280" }}>
            <MessageSquare size={48} style={{ marginBottom: "1rem", opacity: 0.5 }} />
            <p>{searchTerm ? "No messages found matching your search." : "No new messages."}</p>
          </div>
        )}
      </div>

      {/* Conversation View */}
      {selectedPatient && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="conversation-panel"
          style={{
            width: "40%",
            backgroundColor: "white",
            borderLeft: "1px solid #e5e7eb",
            display: "flex",
            flexDirection: "column",
            height: "100vh",
          }}
        >
          <div style={{
            padding: "1.5rem",
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
          }}>
            <button
              onClick={() => setSelectedPatient(null)}
              style={{
                background: "none",
                border: "none",
                fontSize: "1.5rem",
                cursor: "pointer",
                color: "#6b7280",
              }}
            >
              ←
            </button>
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
              }}
            >
              {selectedPatient.sender.charAt(0)}
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.125rem", fontWeight: "600" }}>
                {selectedPatient.sender}
              </h3>
              <p style={{ margin: 0, fontSize: "0.875rem", color: "#6b7280" }}>
                {selectedPatient.senderEmail}
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
          }}>
            {conversation.map((msg) => {
              const isDoctor = msg.senderModel === "Doctor";
              return (
                <div
                  key={msg._id}
                  style={{
                    alignSelf: isDoctor ? "flex-end" : "flex-start",
                    maxWidth: "70%",
                  }}
                >
                  <div
                    style={{
                      padding: "0.75rem 1rem",
                      borderRadius: "1rem",
                      backgroundColor: isDoctor ? "#2563eb" : "#f3f4f6",
                      color: isDoctor ? "white" : "#1f2937",
                    }}
                  >
                    <p style={{ margin: 0, fontSize: "0.875rem" }}>{msg.message}</p>
                    <span style={{
                      fontSize: "0.75rem",
                      opacity: 0.7,
                      display: "block",
                      marginTop: "0.25rem",
                    }}>
                      {new Date(msg.createdAt).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{
            padding: "1.5rem",
            borderTop: "1px solid #e5e7eb",
            display: "flex",
            gap: "0.75rem",
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
              placeholder="Type a message..."
              style={{
                flex: 1,
                padding: "0.75rem",
                border: "1px solid #d1d5db",
                borderRadius: "0.5rem",
                fontSize: "0.875rem",
                outline: "none",
              }}
            />
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || sendingMessage}
              style={{
                padding: "0.75rem 1.5rem",
                backgroundColor: "#2563eb",
                color: "white",
                border: "none",
                borderRadius: "0.5rem",
                cursor: newMessage.trim() && !sendingMessage ? "pointer" : "not-allowed",
                opacity: newMessage.trim() && !sendingMessage ? 1 : 0.5,
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <Send size={18} />
              {sendingMessage ? "Sending..." : "Send"}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default DoctorMessages;