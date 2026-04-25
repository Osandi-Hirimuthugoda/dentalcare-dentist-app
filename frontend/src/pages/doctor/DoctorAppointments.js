import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Calendar, Clock, Search, Filter, CheckCircle, XCircle,
  AlertCircle, Edit, Save, X, RefreshCw, Users, FileText, Plus, Trash2, ChevronDown, ChevronUp
} from "lucide-react";

import DoctorSidebar from "../../components/layout/DoctorSidebar";
import "../../styles/pages/DoctorAppointments.css";

const API = "/api";

const fmtDate = (d) => d
  ? new Date(d).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric", timeZone: "Asia/Colombo" })
  : "N/A";

const fmtTime = (d) => d
  ? new Date(d).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Colombo" })
  : "N/A";

const StatusBadge = ({ status }) => {
  const icons = { confirmed: CheckCircle, pending: AlertCircle, completed: CheckCircle, cancelled: XCircle };
  const Icon = icons[status] || AlertCircle;
  return (
    <span className={`apt-status ${status || "pending"}`}>
      <Icon size={11} /> {status || "pending"}
    </span>
  );
};

const STATS = [
  { key: "all", label: "Total", color: "#6366f1", bg: "#eef2ff" },
  { key: "pending", label: "Pending", color: "#f59e0b", bg: "#fffbeb" },
  { key: "confirmed", label: "Confirmed", color: "#10b981", bg: "#f0fdf4" },
  { key: "completed", label: "Completed", color: "#3b82f6", bg: "#eff6ff" },
  { key: "cancelled", label: "Cancelled", color: "#ef4444", bg: "#fef2f2" },
];

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [toast, setToast] = useState({ type: "", text: "" });
  const [editingId, setEditingId] = useState(null);
  const [editNotes, setEditNotes] = useState("");
  const [updating, setUpdating] = useState(null);
  const [prescribingApt, setPrescribingApt] = useState(null);
  const [prescriptionForm, setPrescriptionForm] = useState({
    diagnosis: "",
    notes: "",
    medications: [{ name: "", dosage: "", frequency: "", duration: "", instructions: "" }]
  });
  const prescriptionRef = useRef(null);

  useEffect(() => {
    if (prescribingApt) {
      setTimeout(() => {
        if (prescriptionRef.current) {
          prescriptionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    }
  }, [prescribingApt]);



  useEffect(() => { fetchAppointments(); }, []);

  const showToast = (type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast({ type: "", text: "" }), 3000);
  };

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const doc = JSON.parse(localStorage.getItem("doctor") || "{}");
      if (!doc._id) { showToast("error", "Doctor not found."); return; }
      const res = await axios.get(`${API}/appointments/doctor/${doc._id}`);
      setAppointments(res.data || []);
    } catch { showToast("error", "Failed to load appointments."); }
    finally { setLoading(false); }
  };

  const updateStatus = async (id, status) => {
    setUpdating(id);
    try {
      await axios.put(`${API}/appointments/${id}`, { status });
      showToast("success", `Appointment marked as ${status}.`);
      await fetchAppointments();
    } catch (err) {
      showToast("error", err.response?.data?.message || "Failed to update.");
    } finally { setUpdating(null); }
  };

  const saveNotes = async (id) => {
    setUpdating(id);
    try {
      await axios.put(`${API}/appointments/${id}`, { notes: editNotes });
      showToast("success", "Notes saved.");
      setEditingId(null);
      await fetchAppointments();
    } catch { showToast("error", "Failed to save notes."); }
  };

  const handlePrescribe = async (e) => {
      e.preventDefault();
      setUpdating(prescribingApt._id);
      try {
        const token = localStorage.getItem("doctorToken") || localStorage.getItem("token") || "";
        await axios.post(`${API}/prescriptions/create`, {
          patientId: prescribingApt.patient._id,
          appointmentId: prescribingApt._id,
          ...prescriptionForm
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        showToast("success", "Prescription issued successfully.");
        setPrescribingApt(null);
        setPrescriptionForm({ diagnosis: "", notes: "", medications: [{ name: "", dosage: "", frequency: "", duration: "", instructions: "" }] });
        await fetchAppointments();
      } catch (err) {
        showToast("error", err.response?.data?.message || "Failed to issue prescription.");
      } finally { setUpdating(null); }
    };

    const addMedication = () => {
      setPrescriptionForm({
        ...prescriptionForm,
        medications: [...prescriptionForm.medications, { name: "", dosage: "", frequency: "", duration: "", instructions: "" }]
      });
    };

    const removeMedication = (index) => {
      const meds = [...prescriptionForm.medications];
      meds.splice(index, 1);
      setPrescriptionForm({ ...prescriptionForm, medications: meds });
    };

    const updateMedication = (index, field, value) => {
      const meds = [...prescriptionForm.medications];
      meds[index][field] = value;
      setPrescriptionForm({ ...prescriptionForm, medications: meds });
    };


    // Filter
    const filtered = appointments
      .filter(a => {
        const q = search.toLowerCase();
        return (
          a.patient?.name?.toLowerCase().includes(q) ||
          a.patient?.email?.toLowerCase().includes(q) ||
          (a.notes || "").toLowerCase().includes(q)
        );
      })
      .filter(a => statusFilter === "all" || a.status === statusFilter)
      .sort((a, b) => new Date(b.startTime) - new Date(a.startTime));

    const counts = {
      all: appointments.length,
      pending: appointments.filter(a => a.status === "pending").length,
      confirmed: appointments.filter(a => a.status === "confirmed").length,
      completed: appointments.filter(a => a.status === "completed").length,
      cancelled: appointments.filter(a => a.status === "cancelled").length,
    };

    if (loading) {
      return (
        <div className="apts-wrapper">
          <DoctorSidebar />
          <div className="apts-content">
            <div className="apts-loading"><div className="apts-spinner" /><p>Loading appointments...</p></div>
          </div>
        </div>
      );
    }

    return (
      <div className="apts-wrapper">
        <DoctorSidebar />

        <div className="apts-content">
          {/* Header */}
          <div className="apts-header">
            <div>
              <h1><Calendar size={22} /> Appointments</h1>
              <p>{filtered.length} appointment{filtered.length !== 1 ? "s" : ""} shown</p>
            </div>
            <button className="apts-refresh-btn" onClick={fetchAppointments}>
              <RefreshCw size={13} /> Refresh
            </button>
          </div>

          {toast.text && (
            <div className={`apts-toast ${toast.type}`}>
              {toast.type === "success" ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
              {toast.text}
            </div>
          )}

          {/* Stats */}
          <div className="apts-stats">
            {STATS.map(s => (
              <div
                key={s.key}
                className={`stat-chip ${statusFilter === s.key ? "active" : ""}`}
                style={{ "--chip-color": s.color }}
                onClick={() => setStatusFilter(s.key)}
              >
                <div className="stat-chip-icon" style={{ background: s.bg }}>
                  <Calendar size={18} style={{ color: s.color }} />
                </div>
                <div className="stat-chip-info">
                  <div className="stat-chip-label">{s.label}</div>
                  <div className="stat-chip-count">{counts[s.key]}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="apts-filters">
            <div className="apts-search">
              <Search size={14} />
              <input
                type="text"
                placeholder="Search patient name, email, notes..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select className="apts-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Table */}
          <div className="apts-card">
            {filtered.length === 0 ? (
              <div className="apts-empty">
                <Calendar size={44} />
                <h3>No appointments found</h3>
                <p>{search ? "Try adjusting your search" : "Appointments will appear here"}</p>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table className="apts-table">
                  <thead>
                    <tr>
                      <th>Patient</th>
                      <th>Date & Time</th>
                      <th>Status</th>
                      <th>Notes</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(apt => (
                      <tr key={apt._id}>
                        {/* Patient */}
                        <td>
                          <div className="apt-patient-cell">
                            <div className="apt-avatar">
                              {(apt.patient?.name || "P").charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="apt-patient-name">{apt.patient?.name || "Unknown"}</div>
                              {apt.patient?.email && (
                                <div className="apt-patient-email">{apt.patient.email}</div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Date & Time */}
                        <td>
                          <div className="apt-datetime">
                            <div className="apt-date">{fmtDate(apt.startTime)}</div>
                            <div className="apt-time"><Clock size={11} />{fmtTime(apt.startTime)}</div>
                          </div>
                        </td>

                        {/* Status */}
                        <td><StatusBadge status={apt.status} /></td>

                        {/* Notes */}
                        <td>
                          {editingId === apt._id ? (
                            <div className="notes-edit-wrap">
                              <textarea
                                value={editNotes}
                                onChange={e => setEditNotes(e.target.value)}
                                placeholder="Add notes..."
                              />
                              <div className="notes-edit-actions">
                                <button className="apt-btn apt-btn-save" onClick={() => saveNotes(apt._id)} disabled={updating === apt._id}>
                                  <Save size={11} /> Save
                                </button>
                                <button className="apt-btn apt-btn-ghost" onClick={() => setEditingId(null)}>
                                  <X size={11} />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                              {apt.notes
                                ? <span className="apt-notes-text" title={apt.notes}>{apt.notes}</span>
                                : <span className="apt-notes-empty">No notes</span>
                              }
                              <button className="apt-btn apt-btn-edit" onClick={() => { setEditingId(apt._id); setEditNotes(apt.notes || ""); }}>
                                <Edit size={11} />
                              </button>
                            </div>
                          )}
                        </td>

                        {/* Actions */}
                        <td>
                          {apt.status === "cancelled" ? (
                            <span style={{ fontSize: "0.75rem", color: "#d1d5db" }}>—</span>
                          ) : (
                            <div className="apt-action-row">
                              {apt.status === "pending" && (
                                <button className="apt-btn apt-btn-confirm"
                                  onClick={() => updateStatus(apt._id, "confirmed")}
                                  disabled={updating === apt._id}>
                                  <CheckCircle size={11} /> Confirm
                                </button>
                              )}
                              {apt.status === "confirmed" && (
                                <button className="apt-btn apt-btn-complete"
                                  onClick={() => updateStatus(apt._id, "completed")}
                                  disabled={updating === apt._id}>
                                  <CheckCircle size={11} /> Complete
                                </button>
                              )}
                              {(apt.status === "confirmed" || apt.status === "completed") && (
                                <button className="apt-btn apt-btn-prescribe"
                                  onClick={() => setPrescribingApt(apt)}
                                  style={{ background: "#8b5cf6", color: "white" }}>
                                  <FileText size={11} /> Prescribe
                                </button>
                              )}
                              {(apt.status === "pending" || apt.status === "confirmed") && (
                                <button className="apt-btn apt-btn-cancel"
                                  onClick={() => updateStatus(apt._id, "cancelled")}
                                  disabled={updating === apt._id}>
                                  <XCircle size={11} /> Cancel
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Prescription Section (In-page instead of Modal) */}
          {prescribingApt && (
            <div ref={prescriptionRef} className="apts-card" style={{ marginTop: "2rem", border: "2px solid #8b5cf6" }}>
                <div className="apts-modal-header" style={{ borderBottom: "1px solid #f0f0f0", padding: "1.5rem" }}>
                  <h2 style={{ color: "#8b5cf6" }}>Issue Prescription for {prescribingApt.patient?.name}</h2>
                  <button className="apt-btn apt-btn-ghost" onClick={() => setPrescribingApt(null)}><X size={18} /></button>
                </div>
                <form onSubmit={handlePrescribe} className="apts-modal-body" style={{ padding: "1.5rem" }}>
                  <div className="form-group" style={{ marginBottom: "1.5rem" }}>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>Diagnosis</label>
                    <input
                      required type="text" placeholder="e.g. Tooth Decay"
                      className="apts-select"
                      style={{ width: "100%", padding: "0.75rem" }}
                      value={prescriptionForm.diagnosis}
                      onChange={e => setPrescriptionForm({ ...prescriptionForm, diagnosis: e.target.value })}
                    />
                  </div>

                  <div className="meds-section" style={{ marginBottom: "1.5rem" }}>
                    <div className="meds-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                      <label style={{ fontWeight: "600" }}>Medications</label>
                      <button type="button" onClick={addMedication} className="apt-btn" style={{ background: "#8b5cf6", color: "white" }}>
                        <Plus size={14} /> Add Medication
                      </button>
                    </div>
                    {prescriptionForm.medications.map((med, idx) => (
                      <div key={idx} className="med-row" style={{ background: "#f9fafb", padding: "1rem", borderRadius: "0.5rem", marginBottom: "1rem", border: "1px solid #f0f0f0" }}>
                        <div className="med-inputs" style={{ display: "grid", gap: "1rem" }}>
                          <input required className="apts-select" style={{ width: "100%" }} placeholder="Medication Name" value={med.name} onChange={e => updateMedication(idx, 'name', e.target.value)} />
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem" }}>
                            <input required className="apts-select" placeholder="Dosage" value={med.dosage} onChange={e => updateMedication(idx, 'dosage', e.target.value)} />
                            <input required className="apts-select" placeholder="Freq" value={med.frequency} onChange={e => updateMedication(idx, 'frequency', e.target.value)} />
                            <input required className="apts-select" placeholder="Dur" value={med.duration} onChange={e => updateMedication(idx, 'duration', e.target.value)} />
                          </div>
                          <input className="apts-select" style={{ width: "100%" }} placeholder="Special Instructions" value={med.instructions} onChange={e => updateMedication(idx, 'instructions', e.target.value)} />
                        </div>
                        {prescriptionForm.medications.length > 1 && (
                          <button type="button" onClick={() => removeMedication(idx)} className="apt-btn" style={{ marginTop: "0.5rem", color: "#ef4444" }}><Trash2 size={14} /> Remove</button>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="form-group" style={{ marginBottom: "1.5rem" }}>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>Additional Notes</label>
                    <textarea
                      rows={3} placeholder="Any extra instructions..."
                      className="apts-select"
                      style={{ width: "100%", padding: "0.75rem", minHeight: "100px" }}
                      value={prescriptionForm.notes}
                      onChange={e => setPrescriptionForm({ ...prescriptionForm, notes: e.target.value })}
                    />
                  </div>

                  <div style={{ display: "flex", gap: "1rem" }}>
                    <button type="submit" className="apt-btn" style={{ flex: 1, background: "#8b5cf6", color: "white", padding: "1rem", fontSize: "1rem" }} disabled={updating === prescribingApt._id}>
                      {updating === prescribingApt._id ? "Issuing..." : "Issue Digital Prescription"}
                    </button>
                    <button type="button" className="apt-btn apt-btn-ghost" onClick={() => setPrescribingApt(null)} style={{ padding: "1rem" }}>Cancel</button>
                  </div>
                </form>
            </div>
          )}

        </div>
      </div>
    );
  }
