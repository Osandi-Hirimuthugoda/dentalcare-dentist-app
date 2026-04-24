import React, { useState, useEffect } from "react";
import AdminSidebar from "../../components/layout/AdminSidebar";
import {
  Search, Mail, Phone, Calendar, FileText, Trash2, Eye,
  AlertCircle, CheckCircle, Users, UserCheck, Filter, X, User,
} from "lucide-react";
import axios from "axios";
import "../../styles/pages/AdminPatients.css";

const API = "/api";
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "N/A";
const cap = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : "N/A";

export default function AdminPatients() {
  const [patients, setPatients]         = useState([]);
  const [filtered, setFiltered]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState("");
  const [genderFilter, setGenderFilter] = useState("all");
  const [selected, setSelected]         = useState(null);
  const [deleteId, setDeleteId]         = useState(null);
  const [toast, setToast]               = useState({ type: "", text: "" });

  useEffect(() => { fetchPatients(); }, []);

  useEffect(() => {
    let list = [...patients];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p => p.name?.toLowerCase().includes(q) || p.email?.toLowerCase().includes(q) || p.phone?.includes(q));
    }
    if (genderFilter !== "all") list = list.filter(p => p.gender?.toLowerCase() === genderFilter);
    setFiltered(list);
  }, [search, genderFilter, patients]);

  const showToast = (type, text) => { setToast({ type, text }); setTimeout(() => setToast({ type: "", text: "" }), 3000); };

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/admins/patients`);
      setPatients(res.data || []);
    } catch { setPatients([]); }
    finally { setLoading(false); }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API}/patients/${deleteId}`);
      showToast("success", "Patient deleted successfully.");
      setDeleteId(null);
      await fetchPatients();
    } catch (err) {
      showToast("error", err.response?.data?.message || "Failed to delete.");
      setDeleteId(null);
    }
  };

  const now = new Date();
  const stats = [
    { label: "Total Patients",  value: patients.length,                                                                    color: "#3b82f6", bg: "#eff6ff",  icon: Users },
    { label: "Active",          value: patients.filter(p => (p.status || "active") === "active").length,                  color: "#10b981", bg: "#f0fdf4",  icon: UserCheck },
    { label: "Email Verified",  value: patients.filter(p => p.isEmailVerified).length,                                    color: "#8b5cf6", bg: "#f5f3ff",  icon: CheckCircle },
    { label: "New This Month",  value: patients.filter(p => { const d = new Date(p.createdAt); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); }).length, color: "#f59e0b", bg: "#fffbeb", icon: Calendar },
  ];

  if (loading && patients.length === 0) return (
    <div className="apt-wrapper"><AdminSidebar />
      <div className="apt-content"><div className="apt-loading"><div className="apt-spinner" /><p>Loading patients...</p></div></div>
    </div>
  );

  return (
    <div className="apt-wrapper">
      <AdminSidebar />
      <div className="apt-content">
        <div className="apt-header">
          <h1><Users size={22} /> Manage Patients</h1>
          <p>All patients registered via the mobile app</p>
        </div>

        {toast.text && (
          <div className={`apt-toast ${toast.type}`}>
            {toast.type === "success" ? <CheckCircle size={15} /> : <AlertCircle size={15} />} {toast.text}
          </div>
        )}

        {/* Stats */}
        <div className="apt-stats">
          {stats.map((s, i) => (
            <div key={i} className="apt-stat-card">
              <div className="apt-stat-icon" style={{ background: s.bg }}>
                <s.icon size={18} style={{ color: s.color }} />
              </div>
              <div>
                <div className="apt-stat-value" style={{ color: s.color }}>{s.value}</div>
                <div className="apt-stat-label">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="apt-filters">
          <div className="apt-search">
            <Search size={14} />
            <input type="text" placeholder="Search by name, email, phone..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="apt-select" value={genderFilter} onChange={e => setGenderFilter(e.target.value)}>
            <option value="all">All Genders</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          {(search || genderFilter !== "all") && (
            <button className="apt-clear-btn" onClick={() => { setSearch(""); setGenderFilter("all"); }}>
              <X size={13} /> Clear
            </button>
          )}
          <span className="apt-count">{filtered.length} of {patients.length}</span>
        </div>

        {/* Table */}
        <div className="apt-card">
          {filtered.length === 0 ? (
            <div className="apt-empty"><Users size={44} /><h3>No patients found</h3><p>{search ? "Try adjusting your search" : "No patients registered yet"}</p></div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="apt-table">
                <thead>
                  <tr>
                    <th>Patient</th><th>Contact</th><th>Age / Gender</th>
                    <th>Blood Group</th><th>Status</th><th>Registered</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p, i) => (
                    <tr key={p._id || i}>
                      <td>
                        <div className="apt-patient-cell">
                          <div className="apt-avatar">{(p.name || "P").charAt(0).toUpperCase()}</div>
                          <div>
                            <div className="apt-patient-name">{p.name || "Unknown"}</div>
                            <div className="apt-verified">
                              {p.isEmailVerified
                                ? <><CheckCircle size={10} style={{ color: "#10b981" }} /> Verified</>
                                : <><AlertCircle size={10} style={{ color: "#f59e0b" }} /> Unverified</>}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="apt-contact"><Mail size={12} />{p.email || "—"}</div>
                        <div className="apt-contact"><Phone size={12} />{p.phone || "—"}</div>
                      </td>
                      <td className="apt-cell-sm">{p.age ? `${p.age} yrs` : "—"} / {cap(p.gender)}</td>
                      <td>
                        {p.bloodGroup
                          ? <span className="apt-blood-badge">{p.bloodGroup}</span>
                          : <span className="apt-na">—</span>}
                      </td>
                      <td>
                        <span className={`apt-status-badge ${(p.status || "active") === "active" ? "active" : "inactive"}`}>
                          {cap(p.status || "active")}
                        </span>
                      </td>
                      <td className="apt-cell-sm">{fmtDate(p.createdAt)}</td>
                      <td>
                        <div className="apt-row-actions">
                          <button className="apt-view-btn" onClick={() => setSelected(p)}><Eye size={12} /> View</button>
                          <button className="apt-del-btn" onClick={() => setDeleteId(p._id)}><Trash2 size={12} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* View Modal */}
      {selected && (
        <div className="apt-modal-overlay" onClick={() => setSelected(null)}>
          <div className="apt-modal" onClick={e => e.stopPropagation()}>
            <div className="apt-modal-header">
              <h2>Patient Details</h2>
              <button className="apt-modal-close" onClick={() => setSelected(null)}><X size={15} /></button>
            </div>
            <div className="apt-modal-body">
              <div className="apt-modal-avatar-wrap">
                <div className="apt-modal-avatar">{(selected.name || "P").charAt(0).toUpperCase()}</div>
                <div className="apt-modal-name">{selected.name}</div>
                <span className={`apt-status-badge ${selected.isEmailVerified ? "active" : "inactive"}`}>
                  {selected.isEmailVerified ? "✓ Email Verified" : "⚠ Unverified"}
                </span>
              </div>
              <div className="apt-detail-grid">
                {[
                  ["Email",       selected.email,                                    Mail],
                  ["Phone",       selected.phone || "—",                             Phone],
                  ["Age",         selected.age ? `${selected.age} years` : "—",     User],
                  ["Gender",      cap(selected.gender),                              User],
                  ["Blood Group", selected.bloodGroup || "—",                        FileText],
                  ["Status",      cap(selected.status || "active"),                  UserCheck],
                  ["Registered",  fmtDate(selected.createdAt),                       Calendar],
                ].map(([label, value, Icon]) => (
                  <div key={label} className="apt-detail-item">
                    <div className="apt-detail-label"><Icon size={11} /> {label}</div>
                    <div className="apt-detail-value">{value}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="apt-modal-footer">
              <button className="apt-cancel-btn" onClick={() => setSelected(null)}>Close</button>
              <button className="apt-delete-btn" onClick={() => { setDeleteId(selected._id); setSelected(null); }}>
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="apt-modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="apt-modal apt-modal-sm" onClick={e => e.stopPropagation()}>
            <div className="apt-modal-body" style={{ textAlign: "center", padding: "2rem" }}>
              <AlertCircle size={44} style={{ color: "#ef4444", marginBottom: "1rem" }} />
              <h2 style={{ fontSize: "1rem", fontWeight: "800", color: "#111827", margin: "0 0 0.5rem" }}>Delete Patient?</h2>
              <p style={{ color: "#6b7280", fontSize: "0.875rem", margin: "0 0 1.5rem" }}>This will permanently delete the patient and all their appointments.</p>
              <div style={{ display: "flex", gap: "0.75rem" }}>
                <button className="apt-cancel-btn" style={{ flex: 1 }} onClick={() => setDeleteId(null)}>Cancel</button>
                <button className="apt-delete-btn" style={{ flex: 1 }} onClick={handleDelete}>
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
