import React, { useState, useEffect } from "react";
import AdminSidebar from "../../components/layout/AdminSidebar";
import { Calendar, Clock, User, Search, Filter, CheckCircle, XCircle, AlertCircle, RefreshCw } from "lucide-react";
import axios from "axios";
import "../../styles/pages/AdminAppointments.css";

const API = "/api";
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" }) : "N/A";
const fmtTime = (d) => d ? new Date(d).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "N/A";

const StatusBadge = ({ status }) => {
  const map = { confirmed: "aap-confirmed", pending: "aap-pending", completed: "aap-completed", cancelled: "aap-cancelled" };
  const icons = { confirmed: CheckCircle, pending: AlertCircle, completed: CheckCircle, cancelled: XCircle };
  const Icon = icons[status] || AlertCircle;
  return <span className={`aap-status ${map[status] || "aap-pending"}`}><Icon size={11} /> {status}</span>;
};

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [filtered, setFiltered]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => { fetchAppointments(); }, []);

  useEffect(() => {
    let list = [...appointments];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(a =>
        a.patient?.name?.toLowerCase().includes(q) ||
        a.doctor?.fullName?.toLowerCase().includes(q) ||
        (a.notes || "").toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "all") list = list.filter(a => a.status === statusFilter);
    list.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
    setFiltered(list);
  }, [search, statusFilter, appointments]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/appointments`);
      setAppointments(res.data || []);
    } catch { setAppointments([]); }
    finally { setLoading(false); }
  };

  const counts = {
    all:       appointments.length,
    pending:   appointments.filter(a => a.status === "pending").length,
    confirmed: appointments.filter(a => a.status === "confirmed").length,
    completed: appointments.filter(a => a.status === "completed").length,
    cancelled: appointments.filter(a => a.status === "cancelled").length,
  };

  const STATS = [
    { label: "Total",     count: counts.all,       color: "#6366f1", bg: "#eef2ff" },
    { label: "Pending",   count: counts.pending,   color: "#f59e0b", bg: "#fffbeb" },
    { label: "Confirmed", count: counts.confirmed, color: "#10b981", bg: "#f0fdf4" },
    { label: "Completed", count: counts.completed, color: "#3b82f6", bg: "#eff6ff" },
    { label: "Cancelled", count: counts.cancelled, color: "#ef4444", bg: "#fef2f2" },
  ];

  if (loading) return (
    <div className="aap-wrapper"><AdminSidebar />
      <div className="aap-content"><div className="aap-loading"><div className="aap-spinner" /><p>Loading appointments...</p></div></div>
    </div>
  );

  return (
    <div className="aap-wrapper">
      <AdminSidebar />
      <div className="aap-content">
        <div className="aap-header">
          <div>
            <h1><Calendar size={22} /> Appointments</h1>
            <p>{filtered.length} of {appointments.length} appointments</p>
          </div>
          <button className="aap-refresh-btn" onClick={fetchAppointments}><RefreshCw size={13} /> Refresh</button>
        </div>

        {/* Stats */}
        <div className="aap-stats">
          {STATS.map(s => (
            <div key={s.label} className={`aap-stat-chip ${statusFilter === s.label.toLowerCase() || (s.label === "Total" && statusFilter === "all") ? "active" : ""}`}
              style={{ "--chip-color": s.color }}
              onClick={() => setStatusFilter(s.label === "Total" ? "all" : s.label.toLowerCase())}>
              <div className="aap-stat-icon" style={{ background: s.bg }}>
                <Calendar size={16} style={{ color: s.color }} />
              </div>
              <div>
                <div className="aap-stat-label">{s.label}</div>
                <div className="aap-stat-count" style={{ color: s.color }}>{s.count}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="aap-filters">
          <div className="aap-search">
            <Search size={14} />
            <input type="text" placeholder="Search patient, doctor, notes..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="aap-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Table */}
        <div className="aap-card">
          {filtered.length === 0 ? (
            <div className="aap-empty"><Calendar size={44} /><h3>No appointments found</h3><p>{search ? "Try adjusting your search" : "No appointments yet"}</p></div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="aap-table">
                <thead>
                  <tr>
                    <th>Patient</th><th>Doctor</th><th>Date & Time</th><th>Status</th><th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((apt, i) => (
                    <tr key={apt._id || i}>
                      <td>
                        <div className="aap-patient-cell">
                          <div className="aap-avatar">{(apt.patient?.name || "P").charAt(0).toUpperCase()}</div>
                          <div>
                            <div className="aap-patient-name">{apt.patient?.name || "Unknown"}</div>
                            {apt.patient?.email && <div className="aap-patient-email">{apt.patient.email}</div>}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="aap-doctor-name">{apt.doctor?.fullName || "—"}</div>
                        {apt.doctor?.specialization && <div className="aap-doctor-spec">{apt.doctor.specialization}</div>}
                      </td>
                      <td>
                        <div className="aap-datetime">
                          <div className="aap-date"><Calendar size={11} />{fmtDate(apt.startTime)}</div>
                          <div className="aap-time"><Clock size={11} />{fmtTime(apt.startTime)}</div>
                        </div>
                      </td>
                      <td><StatusBadge status={apt.status} /></td>
                      <td className="aap-notes">{apt.notes || <span className="aap-na">—</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
