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

  return (
    <div className="messages-page">
      <DoctorSidebar />
      <div className="messages-main-content">
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
                  backgroundColor: msg.unread ? "#eff6ff" : "white",
                  borderLeft: msg.unread ? "4px solid #2563eb" : "4px solid transparent",
                }}
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
    </div>
  );
};

export default DoctorMessages;