import React, { useState, useEffect } from "react";
import AdminSidebar from "../../components/layout/AdminSidebar";
import { Search, Filter, Users, Mail, Phone, Briefcase, Award, Calendar, Edit, Trash2, X, Save, AlertCircle, CheckCircle, RefreshCw } from "lucide-react";
import axios from "axios";
import { DENTAL_SPECIALIZATIONS } from "../../utils/constants";
import "../../styles/pages/AdminDoctors.css";

const API = "/api";

const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }) : "—";

export default function AdminDoctors() {
  const [doctors, setDoctors]           = useState([]);
  const [filtered, setFiltered]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState("");
  const [specFilter, setSpecFilter]     = useState("all");
  const [toast, setToast]               = useState({ type: "", text: "" });
  const [editId, setEditId]             = useState(null);
  const [editForm, setEditForm]         = useState({});
  const [saving, setSaving]             = useState(false);
  const [deleteId, setDeleteId]         = useState(null);

  useEffect(() => { fetchDoctors(); }, []);

  useEffect(() => {
    let list = [...doctors];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(d =>
        d.fullName?.toLowerCase().includes(q) ||
        d.email?.toLowerCase().includes(q) ||
        d.specialization?.toLowerCase().includes(q) ||
        d.hospital?.toLowerCase().includes(q)
      );
    }
    if (specFilter !== "all") list = list.filter(d => d.specialization === specFilter);
    setFiltered(list);
  }, [search, specFilter, doctors]);

  const showToast = (type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast({ type: "", text: "" }), 3000);
  };

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      let res;
      try { res = await axios.get(`${API}/admins/doctors`); }
      catch { res = await axios.get(`${API}/doctors/all`); }
      setDoctors(res.data || []);
    } catch { setDoctors([]); }
    finally { setLoading(false); }
  };

  const handleEdit = (doc) => {
    setEditId(doc._id);
    setEditForm({
      fullName: doc.fullName || "", email: doc.email || "", phone: doc.phone || "",
      licenseNumber: doc.licenseNumber || "", specialization: doc.specialization || "",
      qualifications: doc.qualifications || "", hospital: doc.hospital || "", experience: doc.experience || "",
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put(`${API}/admins/doctors/${editId}`, editForm);
      showToast("success", "Doctor updated successfully.");
      setEditId(null);
      await fetchDoctors();
    } catch (err) {
      showToast("error", err.response?.data?.message || "Failed to update.");
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API}/admins/doctors/${deleteId}`);
      showToast("success", "Doctor deleted successfully.");
      setDeleteId(null);
      await fetchDoctors();
    } catch (err) {
      showToast("error", err.response?.data?.message || "Failed to delete.");
      setDeleteId(null);
    }
  };

  const specs = ["all", ...new Set(doctors.map(d => d.specialization).filter(Boolean))];

  if (loading) return (
    <div className="adoc-wrapper">
      <AdminSidebar />
      <div className="adoc-content">
        <div className="adoc-loading"><div className="adoc-spinner" /><p>Loading doctors...</p></div>
      </div>
    </div>
  );

  return (
    <div className="adoc-wrapper">
      <AdminSidebar />

      <div className="adoc-content">
        {/* Header */}
        <div className="adoc-header">
          <div>
            <h1><Users size={22} /> Manage Doctors</h1>
            <p>{filtered.length} of {doctors.length} doctors</p>
          </div>
          <button className="adoc-refresh-btn" onClick={fetchDoctors}>
            <RefreshCw size={13} /> Refresh
          </button>
        </div>

        {toast.text && (
          <div className={`adoc-toast ${toast.type}`}>
            {toast.type === "success" ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
            {toast.text}
          </div>
        )}

        {/* Filters */}
        <div className="adoc-filters">
          <div className="adoc-search">
            <Search size={14} />
            <input type="text" placeholder="Search by name, email, specialization, hospital..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="adoc-select" value={specFilter} onChange={e => setSpecFilter(e.target.value)}>
            {specs.map(s => (
              <option key={s} value={s}>
                {s === "all" ? "All Specializations" : s} ({s === "all" ? doctors.length : doctors.filter(d => d.specialization === s).length})
              </option>
            ))}
          </select>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="adoc-empty">
            <Users size={44} />
            <h3>No doctors found</h3>
            <p>{search ? "Try adjusting your search" : "No doctors registered yet"}</p>
          </div>
        ) : (
          <div className="adoc-grid">
            {filtered.map((doc, i) => (
              <div key={doc._id || i} className="adoc-card">
                {/* Card Top */}
                <div className="adoc-card-top">
                  <div className="adoc-avatar">{(doc.fullName || "D").charAt(0).toUpperCase()}</div>
                  <div className="adoc-card-info">
                    <div className="adoc-name">{doc.fullName || "Unknown"}</div>
                    {doc.specialization && <span className="adoc-spec-badge">{doc.specialization}</span>}
                  </div>
                </div>

                {/* Card Details */}
                <div className="adoc-details">
                  {doc.email    && <div className="adoc-detail-row"><Mail size={13} />{doc.email}</div>}
                  {doc.phone    && <div className="adoc-detail-row"><Phone size={13} />{doc.phone}</div>}
                  {doc.hospital && <div className="adoc-detail-row"><Briefcase size={13} />{doc.hospital}</div>}
                  {doc.experience && <div className="adoc-detail-row"><Calendar size={13} />{doc.experience} yrs experience</div>}
                  {doc.qualifications && <div className="adoc-detail-row"><Award size={13} />{doc.qualifications}</div>}
                </div>

                {/* Actions */}
                <div className="adoc-actions">
                  <button className="adoc-edit-btn" onClick={() => handleEdit(doc)}>
                    <Edit size={13} /> Edit
                  </button>
                  <button className="adoc-delete-btn" onClick={() => setDeleteId(doc._id)}>
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editId && (
        <div className="adoc-modal-overlay" onClick={() => setEditId(null)}>
          <div className="adoc-modal" onClick={e => e.stopPropagation()}>
            <div className="adoc-modal-header">
              <h2>Edit Doctor</h2>
              <button className="adoc-modal-close" onClick={() => setEditId(null)}><X size={15} /></button>
            </div>
            <div className="adoc-modal-body">
              <div className="adoc-edit-grid">
                {[
                  { label: "Full Name",    key: "fullName",    type: "text" },
                  { label: "Email",        key: "email",       type: "email" },
                  { label: "Phone",        key: "phone",       type: "tel" },
                  { label: "License No.",  key: "licenseNumber", type: "text" },
                  { label: "Hospital",     key: "hospital",    type: "text" },
                  { label: "Experience",   key: "experience",  type: "number" },
                  { label: "Qualifications", key: "qualifications", type: "text" },
                ].map(f => (
                  <div key={f.key} className="adoc-edit-field">
                    <label>{f.label}</label>
                    <input type={f.type} value={editForm[f.key] || ""}
                      onChange={e => setEditForm({ ...editForm, [f.key]: e.target.value })} />
                  </div>
                ))}
                <div className="adoc-edit-field">
                  <label>Specialization</label>
                  <select value={editForm.specialization || ""}
                    onChange={e => setEditForm({ ...editForm, specialization: e.target.value })}>
                    <option value="">Select</option>
                    {DENTAL_SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="adoc-modal-footer">
              <button className="adoc-cancel-btn" onClick={() => setEditId(null)}>Cancel</button>
              <button className="adoc-save-btn" onClick={handleSave} disabled={saving}>
                <Save size={14} /> {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteId && (
        <div className="adoc-modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="adoc-modal adoc-modal-sm" onClick={e => e.stopPropagation()}>
            <div className="adoc-modal-body" style={{ textAlign: "center", padding: "2rem" }}>
              <AlertCircle size={44} style={{ color: "#ef4444", marginBottom: "1rem" }} />
              <h2 style={{ fontSize: "1rem", fontWeight: "800", color: "#111827", margin: "0 0 0.5rem" }}>Delete Doctor?</h2>
              <p style={{ color: "#6b7280", fontSize: "0.875rem", margin: "0 0 1.5rem" }}>
                This action cannot be undone. All associated data will be removed.
              </p>
              <div style={{ display: "flex", gap: "0.75rem" }}>
                <button className="adoc-cancel-btn" style={{ flex: 1 }} onClick={() => setDeleteId(null)}>Cancel</button>
                <button className="adoc-delete-confirm-btn" style={{ flex: 1 }} onClick={handleDelete}>
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
