import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { 
  ArrowLeft, MessageCircle, Send, CheckCircle, 
  Clock, AlertCircle, User, Activity, Search, RefreshCw,
  HelpCircle, History
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import io from "socket.io-client";

const ScanQA = () => {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState({});
  const [answers, setAnswers] = useState({});
  const socketRef = useRef(null);

  useEffect(() => {
    fetchSessions();
    setupSocket();
    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  const setupSocket = () => {
    const token = localStorage.getItem("token");
    socketRef.current = io("/", { auth: { token } });
    
    socketRef.current.on("new_scan_question", (data) => {
      if (selectedSession && selectedSession.scanId === data.scanId) {
        fetchSessionDetails(data.scanId);
      } else {
        fetchSessions();
      }
    });
  };

  const fetchSessions = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/api/scan-qa/patient/sessions", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSessions(res.data.sessions || []);
    } catch (err) {
      console.error("Sessions error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSessionDetails = async (scanId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`/api/scan-qa/patient/${scanId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedSession(res.data.scanQA);
    } catch (err) {
      console.error("QA details error:", err);
    }
  };

  const handleSelectSession = (session) => {
    setSelectedSession(null);
    fetchSessionDetails(session.scanId);
  };

  const handleAnswerSubmit = async (questionId) => {
    const answerText = answers[questionId];
    if (!answerText || !answerText.trim()) return;

    setSubmitting(prev => ({ ...prev, [questionId]: true }));
    try {
      const token = localStorage.getItem("token");
      await axios.post(`/api/scan-qa/${selectedSession.scanId}/answer/${questionId}`, 
        { answer: answerText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAnswers(prev => ({ ...prev, [questionId]: "" }));
      fetchSessionDetails(selectedSession.scanId);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit answer");
    } finally {
      setSubmitting(prev => ({ ...prev, [questionId]: false }));
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <main className="flex-1 overflow-hidden flex flex-col md:flex-row gap-6">
        {/* Sessions List */}
        <div className={`w-full md:w-80 flex flex-col space-y-4 ${selectedSession ? 'hidden md:flex' : 'flex'}`}>
          <div className="flex items-center justify-between px-2">
            <h2 className="font-bold text-slate-500 text-sm uppercase tracking-wider">Recent Scans</h2>
            <Activity size={16} className="text-slate-400" />
          </div>
          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {loading ? (
              [1, 2, 3].map(i => <div key={i} className="h-24 bg-white rounded-2xl border border-slate-100 animate-pulse" />)
            ) : sessions.length === 0 ? (
              <div className="bg-white rounded-2xl p-6 text-center border border-slate-200">
                <HelpCircle size={32} className="mx-auto text-slate-300 mb-2" />
                <p className="text-xs text-slate-500 font-medium">No active sessions requiring feedback.</p>
              </div>
            ) : (
              sessions.map(s => (
                <button
                  key={s.scanId}
                  onClick={() => handleSelectSession(s)}
                  className={`w-full text-left p-4 rounded-2xl border-2 transition-all group ${
                    selectedSession?.scanId === s.scanId 
                    ? "border-indigo-600 bg-indigo-50 shadow-md" 
                    : "border-white bg-white hover:border-slate-200"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">
                      Scan #{s.scanId.substring(0, 8)}
                    </span>
                    <div className={`w-2 h-2 rounded-full ${s.questions.some(q => !q.answer) ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                  </div>
                  <h3 className={`font-bold text-sm ${selectedSession?.scanId === s.scanId ? 'text-indigo-900' : 'text-slate-800'}`}>
                    Teeth Analysis Result
                  </h3>
                  <div className="flex items-center gap-2 mt-2">
                    <Clock size={12} className="text-slate-400" />
                    <span className="text-[10px] text-slate-500 font-bold">{new Date(s.createdAt).toLocaleDateString()}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Conversation Area */}
        <div className={`flex-1 flex flex-col bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden ${!selectedSession ? 'hidden md:flex' : 'flex'}`}>
          {!selectedSession ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-4">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                <MessageCircle size={48} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">Select a consultation</h3>
                <p className="text-slate-500 text-sm max-w-xs mx-auto">Click on a scan result on the left to see questions from your doctor.</p>
              </div>
            </div>
          ) : (
            <>
              {/* Doctor Header */}
              <div className="bg-indigo-600 p-6 text-white flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                  <User size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Dr. {selectedSession.doctor?.fullName || "Consultant"}</h3>
                  <p className="text-indigo-100 text-xs">Medical Review Specialist</p>
                </div>
                <div className="ml-auto bg-white/20 px-3 py-1 rounded-full text-[10px] font-black uppercase">
                  Active Review
                </div>
              </div>

              {/* Chat Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-50/30">
                {selectedSession.questions?.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8">
                     <Clock size={48} className="text-slate-300 mb-4" />
                     <p className="text-slate-500 font-medium">Analyzing your scan data...</p>
                     <p className="text-slate-400 text-xs mt-1">The doctor is currently reviewing your results. New questions will appear here automatically.</p>
                  </div>
                ) : (
                  selectedSession.questions.map((q, i) => (
                    <div key={q._id || i} className="space-y-4">
                      {/* Doctor Question */}
                      <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-start gap-3 max-w-[85%]"
                      >
                        <div className="w-8 h-8 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 flex-shrink-0">
                          <User size={16} />
                        </div>
                        <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-slate-100">
                          <p className="text-sm text-slate-800 font-medium leading-relaxed">{q.question}</p>
                          <span className="text-[10px] text-slate-400 font-bold mt-2 block uppercase tracking-wider">Doctor • Just now</span>
                        </div>
                      </motion.div>

                      {/* Patient Answer */}
                      {q.answer ? (
                        <motion.div 
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-start gap-3 justify-end ml-auto max-w-[85%]"
                        >
                          <div className="bg-indigo-600 text-white p-4 rounded-2xl rounded-tr-none shadow-md">
                            <p className="text-sm font-medium leading-relaxed">{q.answer}</p>
                            <div className="flex items-center gap-1 mt-2">
                               <CheckCircle size={10} className="text-indigo-200" />
                               <span className="text-[10px] text-indigo-200 font-bold uppercase tracking-wider">Answered</span>
                            </div>
                          </div>
                          <div className="w-8 h-8 bg-slate-200 rounded-xl overflow-hidden flex-shrink-0 ring-2 ring-white">
                             <img src={`https://ui-avatars.com/api/?name=Patient&background=64748b&color=fff`} alt="You" />
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="ml-11 max-w-[85%] space-y-3"
                        >
                          <div className="relative group">
                            <textarea 
                              placeholder="Type your response here..."
                              className="w-full bg-white border-2 border-slate-100 rounded-2xl p-4 text-sm focus:border-indigo-400 focus:ring-0 transition-all min-h-[100px] resize-none shadow-sm"
                              value={answers[q._id] || ""}
                              onChange={(e) => setAnswers(prev => ({ ...prev, [q._id]: e.target.value }))}
                            />
                            <button 
                              onClick={() => handleAnswerSubmit(q._id)}
                              disabled={submitting[q._id] || !answers[q._id]?.trim()}
                              className={`absolute bottom-3 right-3 p-3 rounded-xl transition-all ${
                                answers[q._id]?.trim() 
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 hover:scale-105 active:scale-95' 
                                : 'bg-slate-100 text-slate-400'
                              }`}
                            >
                              {submitting[q._id] ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <Send size={20} />
                              )}
                            </button>
                          </div>
                          <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase px-2">
                             <AlertCircle size={12} /> Response required for case review
                          </div>
                        </motion.div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default ScanQA;
