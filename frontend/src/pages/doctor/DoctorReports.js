import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Users, Calendar, CheckCircle, Clock, TrendingUp, FileText,
  FileScan, ExternalLink, Send, CheckCheck, Stethoscope,
  Mail, X, Image as ImageIcon,
} from "lucide-react";
import DoctorSidebar from "../../components/layout/DoctorSidebar";
import "../../styles/pages/DoctorReports.css";

const API = "http://localhost:4000/api";
const getToken = () => localStorage.getItem("token") || localStorage.getItem("doctorToken") || "";

const fmtDate = (d) => d
  ? new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
  : "N/A";

export default function DoctorReports() {
  const [stats, setStats]               = useState({ patients: 0, monthly: 0, completed: 0, pending: 0 });
  const [patientReports, setPatientReports] = useState([]);
  const [scanReports, setScanReports]   = useState([]);
  const [loading, setLoading]           = useState(true);
  const [loadingScans, setLoadingScans] = useState(true);
  const [selected, setSelected]         = useState(null);
  const [sending, setSending]           = useState(null);

  useEffect(() => {
    fetchData();
    fetchScans();
  }, []);

  const fetchData = async () => {
    try {
      const doc = JSON.parse(localStorage.getItem("doctor") || "{}");
      if (!doc._id) return;

      const [pRes, aRes] = await Promise.all([
        axios.get(`${API}/patients/doctor/${doc._id}`),
        axios.get(`${API}/appointments/doctor/${doc._id}`),
      ]);

      const patients = pRes.data || [];
      const apts     = aRes.data || [];
      const now      = new Date();
      const som      = new Date(now.getFullYear(), now.getMonth(), 1);

      setStats({
        patients:  patients.length,
        monthly:   apts.filter(a => new Date(a.startTime) >= som).length,
        completed: apts.filter(a => a.status === "completed").length,
        pending:   apts.filter(a => a.status === "pending" || a.status === "confirmed").length,
      });

      setPatientReports(
        patients
          .filter(p => p.diagnosis || p.doctorNotes || p.history?.length)
          .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
      );
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  const fetchScans = async () => {
    try {
      const res = await axios.get(`${API}/scan-qa/pending`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setScanReports((res.data.scans || []).filter(s => s.reportType === "pdf_report"));
    } catch { /* silent */ }
    finally { setLoadingScans(false); }
  };

  const sendToPatient = async (scan) => {
    setSending(scan.scanId);
    try {
      await axios.post(
        `${API}/scan-qa/${scan.scanId}/send-to-patient`,
        { doctorNote: "" },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      setScanReports(prev => prev.map(s => s.scanId === scan.scanId ? { ...s, sentToPatient: true } : s));
    } catch { /* silent */ }
    finally { setSending(null); }
  };

  const STAT_CARDS = [
    { label: "Total Patients",    value: stats.patients,  color: "#3b82f6", bg: "#eff6ff",  icon: Users },
    { label: "This Month",        value: stats.monthly,   color: "#10b981", bg: "#f0fdf4",  icon: Calendar },
    { label: "Completed",         value: stats.completed, color: "#6366f1", bg: "#eef2ff",  icon: CheckCircle },
    { label: "Pending Cases",     value: stats.pending,   color: "#f59e0b", bg: "#fffbeb",  icon: Clock },
  ];

  if (loading) {
    return (
      <div className="rpt-wrapper">
        <DoctorSidebar />
        <div className="rpt-content">
          <div className="rpt-loading"><div className="rpt-spinner" /><p>Loading reports...</p></div>
        </div>
      </div>
    );
  }

  return (
    <div className="rpt-wrapper">
      <DoctorSidebar />

      <div className="rpt-content">
        {/* Header */}
        <div className="rpt-header">
          <h1><FileText size={22} /> Clinic Reports</h1>
          <p>Overview of your clinic performance and patient records</p>
        </div>

        {/* Stats */}
        <div className="rpt-stats">
          {STAT_CARDS.map((s, i) => (
            <div key={i} className="rpt-stat-card">
              <div className="rpt-stat-icon" style={{ background: s.bg }}>
                <s.icon size={20} style={{ color: s.color }} />
              </div>
              <div>
                <div className="rpt-stat-label">{s.label}</div>
                <div className="rpt-stat-value" style={{ color: s.color }}>{s.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Monthly Summary */}
        <div className="rpt-card">
          <div className="rpt-card-header">
            <TrendingUp size={16} style={{ color: "#10b981" }} />
            <h2>Monthly Summary</h2>
          </div>
          <div className="rpt-card-body">
            <div className="rpt-summary-grid">
              <div className="rpt-summary-item" style={{ background: "#f0fdf4", borderColor: "#bbf7d0" }}>
                <div className="rpt-summary-item-label">Completion Rate</div>
                <div className="rpt-summary-item-value" style={{ color: "#10b981" }}>
                  {stats.patients > 0 ? Math.round((stats.completed / stats.patients) * 100) : 0}%
                </div>
              </div>
              <div className="rpt-summary-item" style={{ background: "#fffbeb", borderColor: "#fde68a" }}>
                <div className="rpt-summary-item-label">Pending Cases</div>
                <div className="rpt-summary-item-value" style={{ color: "#f59e0b" }}>{stats.pending}</div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Scan Reports */}
        <div className="rpt-card">
          <div className="rpt-card-header">
            <FileScan size={16} style={{ color: "#6366f1" }} />
            <h2>Patient AI Scan Reports</h2>
            <span className="rpt-count-badge" style={{ background: "#eef2ff", color: "#6366f1" }}>
              {scanReports.length}
            </span>
          </div>
          <div className="rpt-card-body">
            {loadingScans ? (
              <div className="rpt-empty"><div className="rpt-spinner" style={{ margin: "0 auto" }} /></div>
            ) : scanReports.length === 0 ? (
              <div className="rpt-empty">
                <FileScan size={40} />
                <p>No AI scan reports received yet.</p>
              </div>
            ) : scanReports.map(scan => (
              <div key={scan.id} className="scan-report-item">
                <div className="scan-report-left">
                  <div className="scan-avatar">{(scan.patient?.name || "?").charAt(0).toUpperCase()}</div>
                  <div>
                    <div className="scan-patient-name">{scan.patient?.name || "Unknown Patient"}</div>
                    <div className="scan-patient-meta">
                      {scan.patient?.email} · {fmtDate(scan.createdAt)}
                    </div>
                    {scan.patientNote && (
                      <div className="scan-patient-note">"{scan.patientNote}"</div>
                    )}
                  </div>
                </div>
                <div className="scan-report-actions">
                  <a
                    href={`${API}/scan-qa/report-file/${scan.scanId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="scan-open-btn"
                  >
                    <ExternalLink size={13} /> Open PDF
                  </a>
                  <button
                    className={`scan-send-btn ${scan.sentToPatient ? "sent" : "unsent"}`}
                    onClick={() => !scan.sentToPatient && sendToPatient(scan)}
                    disabled={scan.sentToPatient || sending === scan.scanId}
                  >
                    {scan.sentToPatient
                      ? <><CheckCheck size={13} /> Sent</>
                      : sending === scan.scanId
                        ? "Sending..."
                        : <><Send size={13} /> Send to Patient</>
                    }
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Medical Reports */}
        <div className="rpt-card">
          <div className="rpt-card-header">
            <FileText size={16} style={{ color: "#3b82f6" }} />
            <h2>Patient Medical Reports</h2>
            <span className="rpt-count-badge" style={{ background: "#eff6ff", color: "#3b82f6" }}>
              {patientReports.length}
            </span>
          </div>
          <div className="rpt-card-body">
            {patientReports.length === 0 ? (
              <div className="rpt-empty">
                <FileText size={40} />
                <p>No patient medical reports available yet.</p>
              </div>
            ) : patientReports.map(p => (
              <div key={p._id} className="med-report-item" onClick={() => setSelected(p)}>
                <div className="med-report-top">
                  <div className="med-report-patient">
                    <div className="med-avatar">{(p.name || "P").charAt(0).toUpperCase()}</div>
                    <div>
                      <div className="med-patient-name">{p.name}</div>
                      <div className="med-patient-email">{p.email}</div>
                    </div>
                  </div>
                  <div className="med-report-date">{fmtDate(p.updatedAt || p.createdAt)}</div>
                </div>
                {p.diagnosis && (
                  <div className="med-field">
                    <div className="med-field-label"><Stethoscope size={11} /> Diagnosis</div>
                    <div className="med-field-value">{p.diagnosis}</div>
                  </div>
                )}
                {p.doctorNotes && (
                  <div className="med-field">
                    <div className="med-field-label"><FileText size={11} /> Doctor Notes</div>
                    <div className="med-field-value">{p.doctorNotes}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Detail Modal ── */}
      {selected && (
        <div className="rpt-modal-overlay" onClick={() => setSelected(null)}>
          <div className="rpt-modal" onClick={e => e.stopPropagation()}>
            <div className="rpt-modal-header">
              <h2>Medical Report — {selected.name}</h2>
              <button className="rpt-modal-close" onClick={() => setSelected(null)}><X size={15} /></button>
            </div>
            <div className="rpt-modal-body">
              {[
                ["Name",   selected.name],
                ["Email",  selected.email],
                ["Phone",  selected.phone],
                ["Age",    selected.age],
                ["Gender", selected.gender],
              ].filter(([, v]) => v).map(([label, value]) => (
                <div key={label} className="rpt-modal-section">
                  <div className="rpt-modal-section-label">{label}</div>
                  <div className="rpt-modal-section-value">{value}</div>
                </div>
              ))}
              {selected.diagnosis && (
                <div className="rpt-modal-section">
                  <div className="rpt-modal-section-label">Diagnosis</div>
                  <div className="rpt-modal-section-value" style={{ background: "#fef2f2", borderColor: "#fecaca", color: "#991b1b" }}>
                    {selected.diagnosis}
                  </div>
                </div>
              )}
              {selected.doctorNotes && (
                <div className="rpt-modal-section">
                  <div className="rpt-modal-section-label">Doctor Notes</div>
                  <div className="rpt-modal-section-value" style={{ background: "#f0fdf4", borderColor: "#bbf7d0", color: "#065f46" }}>
                    {selected.doctorNotes}
                  </div>
                </div>
              )}
              {selected.history?.length > 0 && (
                <div className="rpt-modal-section">
                  <div className="rpt-modal-section-label">Medical History</div>
                  <div className="rpt-modal-section-value" style={{ background: "#fffbeb", borderColor: "#fde68a", color: "#92400e" }}>
                    <ul style={{ margin: 0, paddingLeft: "1.25rem" }}>
                      {selected.history.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                  </div>
                </div>
              )}
              {selected.images?.length > 0 && (
                <div className="rpt-modal-section">
                  <div className="rpt-modal-section-label"><ImageIcon size={11} /> Images ({selected.images.length})</div>
                  <div className="rpt-modal-section-value">{selected.images.length} image(s) attached</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
