import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { MessageSquare, Search, Send, Megaphone, X } from "lucide-react";
import DoctorSidebar from "../../components/layout/DoctorSidebar";
import "../../styles/pages/DoctorMessages.css";

const API          = "/api";
const SOCKET_URL   = "";
const getToken     = () => localStorage.getItem("token") || "";
const getDoctor    = () => JSON.parse(localStorage.getItem("doctor") || "{}");

const fmtTime = (d) => d
  ? new Date(d).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
  : "";

const fmtDate = (d) => {
  if (!d) return "";
  const now  = new Date();
  const date = new Date(d);
  const diff = now - date;
  if (diff < 86400000) return fmtTime(d);
  if (diff < 604800000) return date.toLocaleDateString("en-US", { weekday: "short" });
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

export default function DoctorMessages() {
  const [tab, setTab]                   = useState("patients");
  const [convs, setConvs]               = useState([]);
  const [allDoctors, setAllDoctors]     = useState([]);
  const [selected, setSelected]         = useState(null);
  const [messages, setMessages]         = useState([]);
  const [newMsg, setNewMsg]             = useState("");
  const [sending, setSending]           = useState(false);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState("");
  const [showModal, setShowModal]       = useState(false);
  const [announce, setAnnounce]         = useState({ text: "", type: "general" });
  const [announceSending, setAnnounceSending] = useState(false);

  const bottomRef    = useRef(null);
  const socketRef    = useRef(null);
  const selectedRef  = useRef(null);

  useEffect(() => { selectedRef.current = selected; }, [selected]);

  // Socket setup
  useEffect(() => {
    const doc = getDoctor();
    if (!doc._id) return;
    const socket = io(SOCKET_URL, { transports: ["websocket"] });
    socketRef.current = socket;
    socket.on("connect", () => {
      socket.emit("join", { userId: doc._id, userType: "Doctor" });
    });
    socket.on("new_message", (msg) => {
      const cur = selectedRef.current;
      const otherId = msg.senderModel === "Doctor"
        ? msg.receiver?._id?.toString() || msg.receiver?.toString()
        : msg.sender?._id?.toString() || msg.sender?.toString();
      if (cur && (cur.id === otherId || cur.id === msg.sender?._id?.toString())) {
        setMessages(prev => [...prev, msg]);
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 80);
      }
      fetchConvs();
    });
    return () => socket.disconnect();
  }, []);

  useEffect(() => { fetchConvs(); }, [tab]);

  useEffect(() => {
    if (tab === "doctors") fetchAllDoctors();
  }, [tab]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchConvs = async () => {
    setLoading(true);
    try {
      const doc = getDoctor();
      if (!doc._id) return;
      const res = await axios.get(`${API}/messages/doctor/${doc._id}?type=${tab}`);
      setConvs(res.data || []);
    } catch { setConvs([]); }
    finally { setLoading(false); }
  };

  const fetchAllDoctors = async () => {
    try {
      const res = await axios.get(`${API}/messages/doctors`);
      const myId = getDoctor()._id;
      // Exclude self
      setAllDoctors((res.data || []).filter(d => d._id !== myId));
    } catch { setAllDoctors([]); }
  };

  const selectConv = async (conv) => {
    setSelected(conv);
    try {
      const doc = getDoctor();
      const url = conv.type === "doctor"
        ? `${API}/messages/conversation/doctors/${doc._id}/${conv.id}`
        : `${API}/messages/conversation/${doc._id}/${conv.id}`;
      const res = await axios.get(url);
      setMessages(res.data || []);
    } catch { setMessages([]); }
  };

  const handleSend = async () => {
    if (!newMsg.trim() || !selected) return;
    setSending(true);
    try {
      const doc = getDoctor();
      await axios.post(`${API}/messages/`, {
        senderId:     doc._id,
        senderType:   "doctor",
        receiverId:   selected.id,
        receiverType: selected.type === "doctor" ? "doctor" : "patient",
        message:      newMsg.trim(),
        patientId:    selected.type === "patient" ? selected.id : null,
      });
      setNewMsg("");
      await selectConv(selected);
      fetchConvs();
    } catch { /* silent */ }
    finally { setSending(false); }
  };

  const handleAnnounce = async () => {
    if (!announce.text.trim()) return;
    setAnnounceSending(true);
    try {
      const doc = getDoctor();
      await axios.post(`${API}/messages/`, {
        senderId:         doc._id,
        senderType:       "doctor",
        message:          announce.text.trim(),
        isAnnouncement:   true,
        announcementType: announce.type,
      });
      setShowModal(false);
      setAnnounce({ text: "", type: "general" });
      fetchConvs();
    } catch { /* silent */ }
    finally { setAnnounceSending(false); }
  };

  // Doctors tab: show all doctors list; Patients tab: show conversations
  const filtered = tab === "doctors"
    ? allDoctors
        .filter(d => (d.fullName || d.name || "").toLowerCase().includes(search.toLowerCase()))
        .map(d => ({
          id: d._id,
          name: d.fullName || d.name || "Doctor",
          email: d.email || "",
          type: "doctor",
          lastMessage: d.specialization || "",
          lastMessageTime: null,
          unreadCount: 0,
        }))
    : convs.filter(c =>
        (c.name || "").toLowerCase().includes(search.toLowerCase())
      );

  const docId = getDoctor()._id;

  return (
    <div className="msg-wrapper">
      <DoctorSidebar />

      <div className="msg-content">
        {/* Top Bar */}
        <div className="msg-topbar">
          <h1><MessageSquare size={20} /> Messages</h1>
          {tab === "patients" && (
            <button className="announce-btn" onClick={() => setShowModal(true)}>
              <Megaphone size={14} /> Announce
            </button>
          )}
        </div>

        <div className="chat-shell">
          {/* ── Conversations Panel ── */}
          <div className="conv-panel">
            {/* Tabs */}
            <div className="conv-tabs">
              <button className={`conv-tab ${tab === "patients" ? "active" : ""}`}
                onClick={() => { setTab("patients"); setSelected(null); }}>Patients</button>
              <button className={`conv-tab ${tab === "doctors" ? "active" : ""}`}
                onClick={() => { setTab("doctors"); setSelected(null); }}>Doctors</button>
            </div>

            {/* Search */}
            <div className="conv-search">
              <Search size={14} />
              <input placeholder="Search..." value={search}
                onChange={e => setSearch(e.target.value)} />
            </div>

            {/* List */}
            <div className="conv-list">
              {loading ? (
                <div className="conv-empty"><div className="msg-spinner" style={{ margin: "0 auto" }} /></div>
              ) : filtered.length === 0 ? (
                <div className="conv-empty">{tab === "doctors" ? "No doctors found" : "No conversations yet"}</div>
              ) : filtered.map(conv => (
                <div key={conv.id}
                  className={`conv-item ${selected?.id === conv.id ? "active" : ""}`}
                  onClick={() => selectConv(conv)}
                >
                  <div className={`conv-avatar ${conv.type === "doctor" ? "doctor-avatar" : ""}`}>
                    {(conv.name || "?").charAt(0).toUpperCase()}
                  </div>
                  <div className="conv-info">
                    <div className="conv-name">{conv.name || "Unknown"}</div>
                    <div className="conv-last">{conv.lastMessage || "No messages yet"}</div>
                  </div>
                  <div className="conv-meta">
                    <span className="conv-time">{fmtDate(conv.lastMessageTime)}</span>
                    {conv.unreadCount > 0 && (
                      <span className="unread-badge">{conv.unreadCount}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Chat Window ── */}
          {selected ? (
            <div className="chat-window">
              {/* Header */}
              <div className="chat-header">
                <div className={`chat-header-avatar ${selected.type === "doctor" ? "doctor-avatar" : ""}`}>
                  {(selected.name || "?").charAt(0).toUpperCase()}
                </div>
                <div className="chat-header-info">
                  <h3>{selected.name || "Unknown"}</h3>
                  <p>{selected.email || (selected.type === "doctor" ? "Doctor" : "Patient")}</p>
                </div>
              </div>

              {/* Messages */}
              <div className="chat-messages">
                {messages.map((msg, i) => {
                  const mine = (msg.senderModel === "Doctor" && (msg.sender?._id?.toString() === docId || msg.sender?.toString() === docId))
                    || msg.sender === "You";
                  return (
                    <div key={msg._id || i} className={`bubble-wrap ${mine ? "mine" : "theirs"}`}>
                      <div className={`bubble ${mine ? "mine" : "theirs"}`}>
                        {msg.message}
                      </div>
                      <span className="bubble-time">{fmtTime(msg.createdAt || msg.time)}</span>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="chat-input-row">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={newMsg}
                  onChange={e => setNewMsg(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                />
                <button className="send-msg-btn" onClick={handleSend} disabled={sending || !newMsg.trim()}>
                  <Send size={14} /> Send
                </button>
              </div>
            </div>
          ) : (
            <div className="chat-placeholder">
              <MessageSquare size={40} style={{ opacity: 0.3 }} />
              <p>Select a conversation to start messaging</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Announcement Modal ── */}
      {showModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className="modal-box">
            <h3>Send Announcement to All Patients</h3>
            <div className="modal-field">
              <label>Type</label>
              <select value={announce.type} onChange={e => setAnnounce({ ...announce, type: e.target.value })}>
                <option value="general">General</option>
                <option value="appointment">Appointment</option>
                <option value="important">Important</option>
                <option value="reminder">Reminder</option>
              </select>
            </div>
            <div className="modal-field">
              <label>Message</label>
              <textarea placeholder="Enter your announcement..." value={announce.text}
                onChange={e => setAnnounce({ ...announce, text: e.target.value })} />
            </div>
            <div className="modal-actions">
              <button className="announce-btn" style={{ background: "#f3f4f6", color: "#374151" }}
                onClick={() => setShowModal(false)}>
                <X size={13} /> Cancel
              </button>
              <button className="announce-btn" onClick={handleAnnounce}
                disabled={announceSending || !announce.text.trim()}>
                <Megaphone size={13} /> {announceSending ? "Sending..." : "Send"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
