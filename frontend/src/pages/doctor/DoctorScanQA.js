import React, { useState, useEffect } from "react";
import DoctorSidebar from "../../components/layout/DoctorSidebar";
import axios from "axios";
import {
  Camera, MessageSquare, CheckCircle, Clock, Send, X,
  AlertCircle, RefreshCw, FileDown, ExternalLink, Brain,
} from "lucide-react";
import "../../styles/pages/DoctorScanQA.css";

const API_URL = process.env.REACT_APP_API_URL || "/api";

const getAuthHeader = () => {
  const doctor = JSON.parse(localStorage.getItem("doctor") || "{}");
  const token = localStorage.getItem("token") || localStorage.getItem("doctorToken") || doctor.token || "";
  return { Authorization: `Bearer ${token}` };
};

const StatusBadge = ({ status }) => {
  const map = {
    pending_qa:    { cls: "badge-orange", icon: Clock,         label: "Pending Q&A" },
    qa_completed:  { cls: "badge-green",  icon: CheckCircle,   label: "Completed" },
    results_shown: { cls: "badge-blue",   icon: CheckCircle,   label: "Results Shown" },
  };
  const { cls, icon: Icon, label } = map[status] || map.pending_qa;
  return (
    <span className={`badge ${cls}`}>
      <Icon size={11} /> {label}
    </span>
  );
};

export default function DoctorScanQA() {
  const [scans, setScans]               = useState([]);
  const [selectedScan, setSelectedScan] = useState(null);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [newQuestion, setNewQuestion]   = useState("");
  const [submitting, setSubmitting]     = useState(false);
  const [refreshing, setRefreshing]     = useState(false);

  useEffect(() => {
    fetchScans();
    const interval = setInterval(() => {
      fetchScans();
      if (selectedScan) {
        fetchDetail(selectedScan.scanId);
      }
    }, 8000);
    return () => clearInterval(interval);
  }, [selectedScan?.scanId]); // Re-run effect when selection changes to ensure interval has latest id

  const fetchScans = async (manual = false) => {
    try {
      if (manual) setRefreshing(true);
      const res = await axios.get(`${API_URL}/scan-qa/pending`, { headers: getAuthHeader() });
      if (res.data.success) setScans(res.data.scans || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch scans");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchDetail = async (scanId) => {
    try {
      const res = await axios.get(`${API_URL}/scan-qa/dentist/${scanId}`, { headers: getAuthHeader() });
      if (res.data.success) setSelectedScan(res.data.scanQA);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load scan details");
    }
  };

  const handleSendQuestion = async () => {
    if (!newQuestion.trim() || !selectedScan) return;
    setSubmitting(true);
    try {
      await axios.post(
        `${API_URL}/scan-qa/${selectedScan.scanId}/question`,
        { question: newQuestion.trim() },
        { headers: getAuthHeader() }
      );
      setNewQuestion("");
      await fetchDetail(selectedScan.scanId);
      await fetchScans();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send question");
    } finally {
      setSubmitting(false);
    }
  };

  const handleComplete = async () => {
    if (!selectedScan) return;
    if (!window.confirm("Mark this Q&A session as complete? The patient will be able to see the results.")) return;
    try {
      await axios.post(
        `${API_URL}/scan-qa/${selectedScan.scanId}/complete`,
        {},
        { headers: getAuthHeader() }
      );
      setSelectedScan(null);
      await fetchScans();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to complete session");
    }
  };

  const fmt = (d) => d ? new Date(d).toLocaleString("en-US", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

  if (loading) {
    return (
      <div className="scanqa-wrapper">
        <DoctorSidebar />
        <div className="scanqa-content">
          <div className="scanqa-loading">
            <div className="spinner" />
            <p>Loading scans...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="scanqa-wrapper">
      <DoctorSidebar />

      <div className="scanqa-content">
        {/* Header */}
        <div className="scanqa-header">
          <h1>Scan Q&amp;A Review</h1>
          <p>Review patient scans and ask questions before providing results</p>
        </div>

        {error && (
          <div className="scanqa-error">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <div className={`scanqa-grid ${!selectedScan ? "no-detail" : ""}`}>
          {/* ── Scans List ── */}
          <div className="scanqa-card">
            <div className="scanqa-card-header">
              <h2><Camera size={16} /> Pending Scans ({scans.length})</h2>
              <button className="refresh-btn" onClick={() => fetchScans(true)}>
                <RefreshCw size={13} className={refreshing ? "spin" : ""} />
                Refresh
              </button>
            </div>

            {scans.length === 0 ? (
              <div className="empty-state">
                <Camera size={40} />
                <p>No pending scans</p>
              </div>
            ) : (
              <div className="scan-list">
                {scans.map((scan) => (
                  <div
                    key={scan.id}
                    className={`scan-item ${selectedScan?.scanId === scan.scanId ? "selected" : ""}`}
                    onClick={() => fetchDetail(scan.scanId)}
                  >
                    <div className="scan-item-top">
                      <div>
                        <div className="scan-patient-name">{scan.patient?.name || "Unknown Patient"}</div>
                        <div className="scan-date">{fmt(scan.createdAt)}</div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px", alignItems: "flex-end" }}>
                        <StatusBadge status={scan.status} />
                        {scan.reportType === "pdf_report" && (
                          <span className="badge badge-pdf"><FileDown size={10} /> PDF</span>
                        )}
                      </div>
                    </div>
                    <div className="scan-meta">
                      <MessageSquare size={12} />
                      {scan.questions?.length || 0} question{scan.questions?.length !== 1 ? "s" : ""}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Detail Panel ── */}
          {selectedScan && (
            <div className="detail-panel">
              {/* Detail Header */}
              <div className="detail-header">
                <div className="detail-header-info">
                  <h2>Scan Details</h2>
                  <p>Patient: {selectedScan.patient?.name || "Unknown"} &nbsp;·&nbsp; <StatusBadge status={selectedScan.status} /></p>
                </div>
                <button className="close-btn" onClick={() => setSelectedScan(null)}>
                  <X size={16} />
                </button>
              </div>

              <div className="detail-body">
                {/* PDF Report */}
                {selectedScan.imageUrl && selectedScan.reportType === "pdf_report" ? (
                  <div className="pdf-report-card">
                    <div className="pdf-report-info">
                      <FileDown size={28} color="#2563EB" />
                      <div>
                        <h4>AI Scan PDF Report</h4>
                        <p>Sent by patient · {fmt(selectedScan.createdAt)}</p>
                        {selectedScan.patientNote && (
                          <p className="note">"{selectedScan.patientNote}"</p>
                        )}
                      </div>
                    </div>
                    <a
                      href={`${API_URL}/scan-qa/report-file/${selectedScan.scanId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="open-report-btn"
                    >
                      <ExternalLink size={14} /> Open Report
                    </a>
                  </div>
                ) : selectedScan.imageUrl ? (
                  <div className="scan_image_container">
                    <img
                      src={selectedScan.imageUrl.startsWith("http") ? selectedScan.imageUrl : `${API_URL.replace("/api", "")}${selectedScan.imageUrl}`}
                      alt="Dental Scan"
                      onError={(e) => { e.target.src = "https://via.placeholder.com/400x300?text=Image+Not+Found"; }}
                    />
                  </div>
                ) : null}

                {/* AI Analysis */}
                {selectedScan.analysisResults?.detectedConditions?.length > 0 && (
                  <div className="detail-section">
                    <h3><Brain size={15} /> AI Analysis Results</h3>
                    <div className="analysis-list">
                      {selectedScan.analysisResults.detectedConditions.map((c, i) => (
                        <div key={i} className="analysis-item">
                          <div className="analysis-item-name">{c.name}</div>
                          <div className="analysis-item-meta">
                            Confidence: {c.confidence} &nbsp;·&nbsp; Severity: {c.severity}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Q&A */}
                <div className="detail-section">
                  <h3><MessageSquare size={15} /> Questions &amp; Answers</h3>
                  {!selectedScan.questions?.length ? (
                    <p style={{ color: "#9ca3af", fontSize: "0.875rem" }}>No questions yet. Ask one below.</p>
                  ) : (
                    <div className="qa-list">
                      {selectedScan.questions.map((qa, i) => (
                        <div key={i} className={`qa-item ${qa.answer ? "answered" : "unanswered"}`}>
                          <div className="qa-question">Q: {qa.question}</div>
                          {qa.answer ? (
                            <div className="qa-answer">A: {qa.answer}</div>
                          ) : (
                            <div className="qa-waiting"><Clock size={13} /> Waiting for patient answer...</div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Ask Question */}
                <div className="detail-section">
                  <h3><Send size={15} /> Ask a Question</h3>
                  <div className="ask-question-row">
                    <input
                      type="text"
                      value={newQuestion}
                      onChange={(e) => setNewQuestion(e.target.value)}
                      placeholder="Type your question to the patient..."
                      onKeyDown={(e) => { if (e.key === "Enter" && !submitting) handleSendQuestion(); }}
                    />
                    <button
                      className="send-btn"
                      onClick={handleSendQuestion}
                      disabled={!newQuestion.trim() || submitting}
                    >
                      <Send size={14} /> Send
                    </button>
                  </div>
                </div>

                {/* Complete / Status */}
                {selectedScan.status === "pending_qa" && (
                  <button className="complete-btn" onClick={handleComplete}>
                    <CheckCircle size={18} /> Complete Q&amp;A Session
                  </button>
                )}

                {selectedScan.status === "qa_completed" && (
                  <div className="completed-banner">
                    <CheckCircle size={16} /> Q&amp;A Completed — Patient can see results
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
