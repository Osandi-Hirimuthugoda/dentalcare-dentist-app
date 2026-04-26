import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { 
  ArrowLeft, Search, Send, User, MessageSquare, 
  MoreVertical, Paperclip, Smile, Check, CheckCheck,
  Clock, Plus, Phone, Video, Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useNotifications } from "../../contexts/NotificationContext";

const Messages = () => {
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [doctors, setDoctors] = useState([]);
  const [showNewChat, setShowNewChat] = useState(false);
  
  const { connected } = useNotifications();
  const chatEndRef = useRef(null);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetchConversations();
    fetchDoctors();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/api/messages/patient/messages", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConversations(res.data || []);
      setLoading(false);
    } catch (err) {
      console.error("Fetch conversations error:", err);
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/api/messages/doctors", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDoctors(res.data || []);
    } catch (err) {
      console.error("Fetch doctors error:", err);
    }
  };

  const fetchMessages = async (doctorId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`/api/messages/conversation/${doctorId}/${user._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(res.data || []);
    } catch (err) {
      console.error("Fetch messages error:", err);
    }
  };

  const handleSelectChat = (chat) => {
    setActiveChat(chat);
    fetchMessages(chat.otherUser?._id);
    setShowNewChat(false);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;

    const messageData = {
      receiverId: activeChat.otherUser?._id,
      receiverModel: "Doctor",
      content: newMessage.trim()
    };

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post("/api/messages", messageData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setMessages([...messages, res.data]);
      setNewMessage("");
      fetchConversations(); // Refresh list
    } catch (err) {
      console.error("Send message error:", err);
    }
  };

  const startNewChat = (doctor) => {
    const existing = conversations.find(c => c.otherUser?._id === doctor._id);
    if (existing) {
      handleSelectChat(existing);
    } else {
      const tempChat = {
        otherUser: doctor,
        lastMessage: { content: "Start a new conversation", createdAt: new Date() }
      };
      setActiveChat(tempChat);
      setMessages([]);
      setShowNewChat(false);
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-1 overflow-hidden flex gap-4">
        {/* Conversations Sidebar */}
        <div className={`w-full md:w-96 flex flex-col bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden ${activeChat ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-black text-slate-800 text-lg">Chats</h2>
              <button 
                onClick={() => setShowNewChat(true)}
                className="p-2 bg-cyan-50 text-cyan-600 rounded-xl hover:bg-cyan-100 transition-colors"
              >
                <Plus size={20} />
              </button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search messages..." 
                className="w-full bg-slate-50 border-none rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-cyan-500/20"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              [1, 2, 3].map(i => <div key={i} className="h-20 bg-white border-b border-slate-50 animate-pulse" />)
            ) : conversations.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                 <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
                   <MessageSquare size={32} />
                 </div>
                 <p className="text-sm text-slate-500 font-medium">No conversations yet.</p>
                 <button onClick={() => setShowNewChat(true)} className="text-cyan-600 text-xs font-bold uppercase hover:underline">Start Chat</button>
              </div>
            ) : (
              conversations.map((chat, i) => (
                <button
                  key={i}
                  onClick={() => handleSelectChat(chat)}
                  className={`w-full flex items-center gap-4 p-4 hover:bg-slate-50 transition-all border-l-4 ${
                    activeChat?.otherUser?._id === chat.otherUser?._id 
                    ? 'bg-cyan-50/50 border-cyan-600' 
                    : 'border-transparent'
                  }`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 flex-shrink-0 overflow-hidden ring-2 ring-white shadow-sm">
                    <img src={`https://ui-avatars.com/api/?name=${chat.otherUser?.fullName}&background=0891b2&color=fff`} alt="" />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-bold text-slate-800 truncate">{chat.otherUser?.fullName}</h4>
                      <span className="text-[10px] text-slate-400 font-bold whitespace-nowrap">
                        {new Date(chat.lastMessage?.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate leading-relaxed">{chat.lastMessage?.content}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Window */}
        <div className={`flex-1 flex flex-col bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden ${!activeChat && !showNewChat ? 'hidden md:flex' : 'flex'}`}>
          {showNewChat ? (
            <div className="flex-1 flex flex-col">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-lg text-slate-800">New Conversation</h3>
                <button onClick={() => setShowNewChat(false)} className="text-slate-400 hover:text-slate-600"><Plus size={24} className="rotate-45" /></button>
              </div>
              <div className="p-4 flex-1 overflow-y-auto space-y-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2 mb-4">Available Doctors</p>
                {doctors.map(doc => (
                  <button
                    key={doc._id}
                    onClick={() => startNewChat(doc)}
                    className="w-full flex items-center gap-4 p-3 hover:bg-slate-50 rounded-2xl transition-all group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-cyan-100 flex items-center justify-center text-cyan-600 font-bold">
                       {doc.fullName[0]}
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-slate-800 group-hover:text-cyan-600 transition-colors">Dr. {doc.fullName}</p>
                      <p className="text-xs text-slate-500 uppercase tracking-tighter font-black">Dental Specialist</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : !activeChat ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-4">
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                <MessageSquare size={56} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-800 italic">DentalCare+ Chat</h3>
                <p className="text-slate-500 text-sm max-w-xs mx-auto mt-2">Connect with your dental specialists for real-time consultation and support.</p>
              </div>
              <button 
                onClick={() => setShowNewChat(true)}
                className="mt-4 px-8 py-3 bg-cyan-600 text-white rounded-2xl font-bold hover:bg-cyan-700 transition-all shadow-lg shadow-cyan-600/20"
              >
                Start a New Chat
              </button>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-shrink-0 bg-white">
                <div className="flex items-center gap-4">
                  <button onClick={() => setActiveChat(null)} className="md:hidden p-2 hover:bg-slate-100 rounded-lg"><ArrowLeft size={20}/></button>
                  <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden ring-2 ring-white shadow-sm">
                     <img src={`https://ui-avatars.com/api/?name=${activeChat.otherUser?.fullName}&background=0891b2&color=fff`} alt="" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 leading-tight">Dr. {activeChat.otherUser?.fullName}</h3>
                    <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">Active Now</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                   <button className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors"><Phone size={18}/></button>
                   <button className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors"><Video size={18}/></button>
                   <button className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors"><Info size={18}/></button>
                </div>
              </div>

              {/* Chat Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/30">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-50">
                     <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Beginning of conversation</p>
                  </div>
                ) : (
                  messages.map((m, i) => {
                    const isMe = m.senderId === user._id;
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[75%] px-4 py-3 rounded-2xl shadow-sm ${
                          isMe 
                          ? 'bg-cyan-600 text-white rounded-tr-none' 
                          : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'
                        }`}>
                          <p className="text-sm leading-relaxed">{m.content}</p>
                          <div className={`flex items-center gap-1 mt-1 justify-end ${isMe ? 'text-white/60' : 'text-slate-400'}`}>
                             <span className="text-[9px] font-bold">
                               {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                             </span>
                             {isMe && (m.read ? <CheckCheck size={12}/> : <Check size={12}/>)}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 bg-white border-t border-slate-100 flex-shrink-0">
                <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                  <button type="button" className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors">
                    <Paperclip size={20} />
                  </button>
                  <div className="flex-1 relative">
                    <input 
                      type="text" 
                      placeholder="Type a message..."
                      className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-cyan-500/20"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                    />
                    <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-600 transition-colors">
                      <Smile size={20} />
                    </button>
                  </div>
                  <button 
                    type="submit"
                    disabled={!newMessage.trim()}
                    className={`p-3 rounded-2xl transition-all ${
                      newMessage.trim() 
                      ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30 hover:scale-105 active:scale-95' 
                      : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    <Send size={20} />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
