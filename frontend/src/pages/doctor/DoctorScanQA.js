import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DoctorSidebar from "../../components/layout/DoctorSidebar";
import axios from "axios";
import { 
  Camera, MessageSquare, CheckCircle, Clock, User, 
  Send, X, AlertCircle, Image as ImageIcon, RefreshCw,
  Eye, Calendar, FileText
} from "lucide-react";
import "../../styles/pages/DoctorScanQA.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:4000/api";

export default function DoctorScanQA() {
  const navigate = useNavigate();
  const [scans, setScans] = useState([]);
  const [selectedScan, setSelectedScan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newQuestion, setNewQuestion] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchPendingScans();
    // Poll every 5 seconds for new scans
    const interval = setInterval(fetchPendingScans, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchPendingScans = async (showRefresh = false) => {
    try {
      if (showRefresh) setRefreshing(true);
      
      const doctor = JSON.parse(localStorage.getItem("doctor") || "{}");
      const token = localStorage.getItem("doctorToken") || doctor.token;

      const response = await axios.get(`${API_URL}/scan-qa/dentist/pending`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setScans(response.data.scans || []);
      }
      setLoading(false);
      setRefreshing(false);
    } catch (err) {
      console.error("Error fetching scans:", err);
      setError(err.response?.data?.message || "Failed to fetch scans");
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchScanDetails = async (scanId) => {
    try {
      const doctor = JSON.parse(localStorage.getItem("doctor") || "{}");
      const token = localStorage.getItem("doctorToken") || doctor.token;

      const response = await axios.get(`${API_URL}/scan-qa/${scanId}/dentist`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setSelectedScan(response.data.scanQA);
      }
    } catch (err) {
      console.error("Error fetching scan details:", err);
      alert(err.response?.data?.message || "Failed to fetch scan details");
    }
  };

  const handleAddQuestion = async () => {
    if (!newQuestion.trim() || !selectedScan) return;

    setSubmitting(true);
    try {
      const doctor = JSON.parse(localStorage.getItem("doctor") || "{}");
      const token = localStorage.getItem("doctorToken") || doctor.token;

      await axios.post(
        `${API_URL}/scan-qa/${selectedScan.scanId}/question`,
        { question: newQuestion.trim() },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setNewQuestion("");
      await fetchScanDetails(selectedScan.scanId);
      await fetchPendingScans();
    } catch (err) {
      console.error("Error adding question:", err);
      alert(err.response?.data?.message || "Failed to add question");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCompleteQA = async () => {
    if (!selectedScan) return;

    if (!window.confirm("Are you sure you want to complete this Q&A session? The patient will be able to see the results.")) {
      return;
    }

    try {
      const doctor = JSON.parse(localStorage.getItem("doctor") || "{}");
      const token = localStorage.getItem("doctorToken") || doctor.token;

      await axios.post(
        `${API_URL}/scan-qa/${selectedScan.scanId}/complete`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      alert("Q&A session completed! Patient can now see the results.");
      setSelectedScan(null);
      await fetchPendingScans();
    } catch (err) {
      console.error("Error completing Q&A:", err);
      alert(err.response?.data?.message || "Failed to complete Q&A");
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending_qa: { color: "orange", text: "Pending Q&A", icon: Clock },
      qa_completed: { color: "green", text: "Q&A Completed", icon: CheckCircle },
      results_shown: { color: "blue", text: "Results Shown", icon: CheckCircle }
    };

    const badge = badges[status] || badges.pending_qa;
    const Icon = badge.icon;

    return (
      <span style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        padding: "4px 12px",
        borderRadius: "12px",
        backgroundColor: `${badge.color}20`,
        color: badge.color,
        fontSize: "12px",
        fontWeight: "500"
      }}>
        <Icon size={14} />
        {badge.text}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <DoctorSidebar />
        <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div>Loading scans...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
      <DoctorSidebar />
      
      <div style={{ flex: 1, padding: "24px", marginLeft: "250px" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          <div style={{ marginBottom: "24px" }}>
            <h1 style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "8px" }}>
              Scan Q&A Review
            </h1>
            <p style={{ color: "#666" }}>
              Review patient scans and ask questions before providing results
            </p>
          </div>

          {error && (
            <div style={{
              padding: "12px 16px",
              backgroundColor: "#fee",
              border: "1px solid #fcc",
              borderRadius: "8px",
              color: "#c33",
              marginBottom: "24px"
            }}>
              {error}
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: selectedScan ? "1fr 1fr" : "1fr", gap: "24px" }}>
            {/* Scans List */}
            <div>
              <div style={{
                backgroundColor: "white",
                borderRadius: "12px",
                padding: "20px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
              }}>
                <h2 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "16px" }}>
                  Pending Scans ({scans.length})
                </h2>

                {scans.length === 0 ? (
                  <div style={{
                    textAlign: "center",
                    padding: "40px",
                    color: "#999"
                  }}>
                    <Camera size={48} style={{ marginBottom: "16px", opacity: 0.5 }} />
                    <p>No pending scans</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {scans.map((scan) => (
                      <div
                        key={scan.id}
                        onClick={() => fetchScanDetails(scan.scanId)}
                        style={{
                          padding: "16px",
                          border: selectedScan?.scanId === scan.scanId 
                            ? "2px solid #00897B" 
                            : "1px solid #e0e0e0",
                          borderRadius: "8px",
                          cursor: "pointer",
                          backgroundColor: selectedScan?.scanId === scan.scanId ? "#f0f9f8" : "white",
                          transition: "all 0.2s"
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "8px" }}>
                          <div>
                            <div style={{ fontWeight: "600", marginBottom: "4px" }}>
                              {scan.patient?.name || "Unknown Patient"}
                            </div>
                            <div style={{ fontSize: "12px", color: "#666" }}>
                              {formatDate(scan.createdAt)}
                            </div>
                          </div>
                          {getStatusBadge(scan.status)}
                        </div>
                        <div style={{ fontSize: "12px", color: "#666", marginTop: "8px" }}>
                          Questions: {scan.questions?.length || 0}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Scan Details */}
            {selectedScan && (
              <div style={{
                backgroundColor: "white",
                borderRadius: "12px",
                padding: "20px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                maxHeight: "calc(100vh - 120px)",
                overflowY: "auto"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "20px" }}>
                  <div>
                    <h2 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "8px" }}>
                      Scan Details
                    </h2>
                    <div style={{ fontSize: "14px", color: "#666" }}>
                      Patient: {selectedScan.patient?.name || "Unknown"}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedScan(null)}
                    style={{
                      padding: "8px",
                      border: "none",
                      background: "none",
                      cursor: "pointer"
                    }}
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Image */}
                {selectedScan.imageUrl && (
                  <div style={{ marginBottom: "20px" }}>
                    <img
                      src={`http://localhost:4000${selectedScan.imageUrl}`}
                      alt="Scan"
                      style={{
                        width: "100%",
                        borderRadius: "8px",
                        border: "1px solid #e0e0e0"
                      }}
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/400x300?text=Image+Not+Found";
                      }}
                    />
                  </div>
                )}

                {/* Analysis Results */}
                {selectedScan.analysisResults && (
                  <div style={{
                    padding: "16px",
                    backgroundColor: "#f9f9f9",
                    borderRadius: "8px",
                    marginBottom: "20px"
                  }}>
                    <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "12px" }}>
                      AI Analysis Results
                    </h3>
                    {selectedScan.analysisResults.detectedConditions?.map((condition, idx) => (
                      <div key={idx} style={{
                        padding: "12px",
                        backgroundColor: "white",
                        borderRadius: "6px",
                        marginBottom: "8px"
                      }}>
                        <div style={{ fontWeight: "600", marginBottom: "4px" }}>
                          {condition.name}
                        </div>
                        <div style={{ fontSize: "12px", color: "#666" }}>
                          Confidence: {condition.confidence} | Severity: {condition.severity}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Questions & Answers */}
                <div style={{ marginBottom: "20px" }}>
                  <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "12px" }}>
                    Questions & Answers
                  </h3>
                  
                  {selectedScan.questions?.length === 0 ? (
                    <p style={{ color: "#999", fontSize: "14px" }}>No questions yet</p>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      {selectedScan.questions?.map((qa, idx) => (
                        <div key={idx} style={{
                          padding: "12px",
                          backgroundColor: qa.answer ? "#f0f9f8" : "#fff3e0",
                          borderRadius: "6px",
                          border: `1px solid ${qa.answer ? "#4caf50" : "#ff9800"}`
                        }}>
                          <div style={{ fontWeight: "600", marginBottom: "8px" }}>
                            Q: {qa.question}
                          </div>
                          {qa.answer ? (
                            <div style={{ color: "#2e7d32", marginTop: "8px" }}>
                              A: {qa.answer}
                            </div>
                          ) : (
                            <div style={{ color: "#f57c00", fontSize: "14px", marginTop: "8px" }}>
                              Waiting for patient answer...
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Add Question */}
                <div style={{ marginBottom: "20px" }}>
                  <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "12px" }}>
                    Ask a Question
                  </h3>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <input
                      type="text"
                      value={newQuestion}
                      onChange={(e) => setNewQuestion(e.target.value)}
                      placeholder="Type your question..."
                      style={{
                        flex: 1,
                        padding: "10px 12px",
                        border: "1px solid #e0e0e0",
                        borderRadius: "6px",
                        fontSize: "14px"
                      }}
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && !submitting) {
                          handleAddQuestion();
                        }
                      }}
                    />
                    <button
                      onClick={handleAddQuestion}
                      disabled={!newQuestion.trim() || submitting}
                      style={{
                        padding: "10px 20px",
                        backgroundColor: "#00897B",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor: submitting || !newQuestion.trim() ? "not-allowed" : "pointer",
                        opacity: submitting || !newQuestion.trim() ? 0.5 : 1,
                        display: "flex",
                        alignItems: "center",
                        gap: "8px"
                      }}
                    >
                      <Send size={16} />
                      Send
                    </button>
                  </div>
                </div>

                {/* Complete Q&A Button */}
                {selectedScan.status === "pending_qa" && (
                  <button
                    onClick={handleCompleteQA}
                    style={{
                      width: "100%",
                      padding: "12px",
                      backgroundColor: "#4caf50",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      fontSize: "16px",
                      fontWeight: "600",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px"
                    }}
                  >
                    <CheckCircle size={20} />
                    Complete Q&A Session
                  </button>
                )}

                {selectedScan.status === "qa_completed" && (
                  <div style={{
                    padding: "12px",
                    backgroundColor: "#e8f5e9",
                    borderRadius: "6px",
                    color: "#2e7d32",
                    textAlign: "center",
                    fontWeight: "600"
                  }}>
                    Q&A Completed - Patient can see results
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


