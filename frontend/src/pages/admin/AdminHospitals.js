import React, { useState, useEffect } from "react";
import AdminSidebar from "../../components/layout/AdminSidebar";
import { Search, Plus, Edit, Trash2, MapPin, Phone, Mail, Globe, Building2, X, CheckCircle, AlertCircle } from "lucide-react";
import axios from "axios";
import "../../styles/pages/AdminHospitals.css";

const API = "/api";
const getToken = () => { try { return JSON.parse(localStorage.getItem("admin") || "{}").token || ""; } catch { return ""; } };

const DISTRICTS = ["Colombo","Gampaha","Kalutara","Kandy","Matale","Nuwara Eliya","Galle","Matara","Hambantota","Jaffna","Kilinochchi","Mannar","Vavuniya","Mullaitivu","Batticaloa","Ampara","Trincomalee","Kurunegala","Puttalam","Anuradhapura","Polonnaruwa","Badulla","Moneragala","Ratnapura","Kegalle"];

const EMPTY_FORM = { name: "", district: "", address: "", city: "", phone: "", email: "", website: "", description: "", facilities: "", isActive: true };

export default function AdminHospitals() {
  const [hospitals, setHospitals]   = useState([]);
  const [filtered, setFiltered]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [district, setDistrict]     = useState("");
  const [showModal, setShowModal]   = useState(false);
  const [editing, setEditing]       = useState(null);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [deleteId, setDeleteId]     = useState(null);
  const [toast, setToast]           = useState({ type: "", text: "" });
  const [saving, setSaving]         = useState(false);

  useEffect(() => { fetchHospitals(); }, []);

  useEffect(() => {
    let list = [...hospitals];
    if (search) { const q = search.toLowerCase(); list = list.filter(h => h.name?.toLowerCase().includes(q) || h.district?.toLowerCase().includes(q) || h.city?.toLowerCase().includes(q)); }
    if (district) list = list.filter(h => h.district === district);
    setFiltered(list);
  }, [search, district, hospitals]);

  const showToast = (type, text) => { setToast({ type, text }); setTimeout(() => setToast({ type: "", text: "" }), 3000); };

  const fetchHospitals = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/hospitals`, { headers: { Authorization: `Bearer ${getToken()}` } });
      setHospitals(res.data.hospitals || []);
    } catch { setHospitals([]); }
    finally { setLoading(false); }
  };

  const openModal = (hospital = null) => {
    setEditing(hospital);
    setForm(hospital ? {
      name: hospital.name || "", district: hospital.district || "", address: hospital.address || "",
      city: hospital.city || "", phone: hospital.phone || "", email: hospital.email || "",
      website: hospital.website || "", description: hospital.description || "",
      facilities: hospital.facilities?.join(", ") || "", isActive: hospital.isActive !== false,
    } : EMPTY_FORM);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, facilities: form.facilities.split(",").map(f => f.trim()).filter(Boolean) };
      if (editing) {
        await axios.put(`${API}/hospitals/${editing._id}`, payload, { headers: { Authorization: `Bearer ${getToken()}` } });
        showToast("success", "Hospital updated successfully.");
      } else {
        await axios.post(`${API}/hospitals`, payload, { headers: { Authorization: `Bearer ${getToken()}` } });
        showToast("success", "Hospital added successfully.");
      }
      setShowModal(false);
      await fetchHospitals();
    } catch (err) {
      showToast("error", err.response?.data?.message || "Failed to save hospital.");
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API}/hospitals/${deleteId}`, { headers: { Authorization: `Bearer ${getToken()}` } });
      showToast("success", "Hospital deleted.");
      setDeleteId(null);
      await fetchHospitals();
    } catch { showToast("error", "Failed to delete hospital."); setDeleteId(null); }
  };

  if (loading) return (
    <div className="hosp-wrapper"><AdminSidebar />
      <div className="hosp-content"><div className="hosp-loading"><div className="hosp-spinner" /><p>Loading hospitals...</p></div></div>
    </div>
  );

  return (
    <div className="hosp-wrapper">
      <AdminSidebar />
      <div className="hosp-content">
        <div className="hosp-header">
          <div>
            <h1><Building2 size={22} /> Hospital Management</h1>
            <p>{filtered.length} of {hospitals.length} hospitals</p>
          </div>
          <button className="hosp-add-btn" onClick={() => openModal()}>
            <Plus size={15} /> Add Hospital
          </button>
        </div>

        {toast.text && (
          <div className={`hosp-toast ${toast.type}`}>
            {toast.type === "success" ? <CheckCircle size={15} /> : <AlertCircle size={15} />} {toast.text}
          </div>
        )}

        {/* Filters */}
        <div className="hosp-filters">
          <div className="hosp-search">
            <Search size={14} />
            <input type="text" placeholder="Search hospitals..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="hosp-select" value={district} onChange={e => setDistrict(e.target.value)}>
            <option value="">All Districts</option>
            {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div className="hosp-empty"><Building2 size={44} /><h3>No hospitals found</h3><p>{search ? "Try adjusting your search" : "No hospitals added yet"}</p></div>
        ) : (
          <div className="hosp-list">
            {filtered.map(h => (
              <div key={h._id} className="hosp-card">
                <div className="hosp-card-left">
                  <div className="hosp-card-top">
                    <Building2 size={18} style={{ color: "#3b82f6", flexShrink: 0 }} />
                    <h3 className="hosp-name">{h.name}</h3>
                    <span className={`hosp-status ${h.isActive !== false ? "active" : "inactive"}`}>
                      {h.isActive !== false ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div className="hosp-details">
                    {(h.district || h.city) && <div className="hosp-detail"><MapPin size={13} />{[h.district, h.city].filter(Boolean).join(" • ")}</div>}
                    {h.address  && <div className="hosp-detail"><MapPin size={13} />{h.address}</div>}
                    {h.phone    && <div className="hosp-detail"><Phone size={13} />{h.phone}</div>}
                    {h.email    && <div className="hosp-detail"><Mail size={13} />{h.email}</div>}
                    {h.website  && <div className="hosp-detail"><Globe size={13} /><a href={h.website} target="_blank" rel="noopener noreferrer" className="hosp-link">{h.website}</a></div>}
                  </div>
                  {h.facilities?.length > 0 && (
                    <div className="hosp-facilities">
                      {h.facilities.map((f, i) => <span key={i} className="hosp-facility-tag">{f}</span>)}
                    </div>
                  )}
                </div>
                <div className="hosp-card-actions">
                  <button className="hosp-edit-btn" onClick={() => openModal(h)}><Edit size={14} /></button>
                  <button className="hosp-del-btn" onClick={() => setDeleteId(h._id)}><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="hosp-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="hosp-modal" onClick={e => e.stopPropagation()}>
            <div className="hosp-modal-header">
              <h2>{editing ? "Edit Hospital" : "Add New Hospital"}</h2>
              <button className="hosp-modal-close" onClick={() => setShowModal(false)}><X size={15} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="hosp-modal-body">
                <div className="hosp-form-grid">
                  <div className="hosp-field hosp-field-full">
                    <label>Hospital Name <span className="req">*</span></label>
                    <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g., Colombo National Hospital" />
                  </div>
                  <div className="hosp-field">
                    <label>District <span className="req">*</span></label>
                    <select required value={form.district} onChange={e => setForm({ ...form, district: e.target.value })}>
                      <option value="">Select District</option>
                      {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div className="hosp-field">
                    <label>City</label>
                    <input type="text" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} placeholder="City name" />
                  </div>
                  <div className="hosp-field hosp-field-full">
                    <label>Address <span className="req">*</span></label>
                    <textarea required rows={2} value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Full address" />
                  </div>
                  <div className="hosp-field">
                    <label>Phone</label>
                    <input type="text" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+94 11 234 5678" />
                  </div>
                  <div className="hosp-field">
                    <label>Email</label>
                    <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="hospital@example.com" />
                  </div>
                  <div className="hosp-field hosp-field-full">
                    <label>Website</label>
                    <input type="url" value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} placeholder="https://..." />
                  </div>
                  <div className="hosp-field hosp-field-full">
                    <label>Facilities (comma-separated)</label>
                    <input type="text" value={form.facilities} onChange={e => setForm({ ...form, facilities: e.target.value })} placeholder="Emergency, ICU, Pharmacy, X-Ray" />
                  </div>
                  <div className="hosp-field hosp-field-full">
                    <label>Description</label>
                    <textarea rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Brief description..." />
                  </div>
                  <div className="hosp-field hosp-field-full">
                    <label className="hosp-checkbox-label">
                      <input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} />
                      Active
                    </label>
                  </div>
                </div>
              </div>
              <div className="hosp-modal-footer">
                <button type="button" className="hosp-cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="hosp-save-btn" disabled={saving}>
                  {saving ? "Saving..." : editing ? "Update Hospital" : "Add Hospital"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="hosp-modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="hosp-modal hosp-modal-sm" onClick={e => e.stopPropagation()}>
            <div className="hosp-modal-body" style={{ textAlign: "center", padding: "2rem" }}>
              <AlertCircle size={44} style={{ color: "#ef4444", marginBottom: "1rem" }} />
              <h2 style={{ fontSize: "1rem", fontWeight: "800", color: "#111827", margin: "0 0 0.5rem" }}>Delete Hospital?</h2>
              <p style={{ color: "#6b7280", fontSize: "0.875rem", margin: "0 0 1.5rem" }}>This action cannot be undone.</p>
              <div style={{ display: "flex", gap: "0.75rem" }}>
                <button className="hosp-cancel-btn" style={{ flex: 1 }} onClick={() => setDeleteId(null)}>Cancel</button>
                <button className="hosp-delete-confirm-btn" style={{ flex: 1 }} onClick={handleDelete}>
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
