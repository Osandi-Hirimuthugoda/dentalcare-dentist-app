import React, { useState, useEffect } from "react";
import DoctorSidebar from "../../components/layout/DoctorSidebar";
import { Plus, X, Save, Check, AlertCircle, CheckCircle, Stethoscope, Search, Clock } from "lucide-react";
import axios from "axios";
import "../../styles/pages/DoctorServices.css";

const API = process.env.REACT_APP_API_URL || "/api";

const CATEGORIES = ["General","Orthodontic","Surgical","Endodontic","Cosmetic","Restorative","Emergency","Pediatric","Periodontic"];

const getToken = () => localStorage.getItem("token") || "";

export default function DoctorServices() {
  const [allServices, setAllServices]       = useState([]);
  const [myServices, setMyServices]         = useState([]);
  const [loading, setLoading]               = useState(true);
  const [saving, setSaving]                 = useState(false);
  const [creating, setCreating]             = useState(false);
  const [toast, setToast]                   = useState({ type: "", text: "" });
  const [showForm, setShowForm]             = useState(false);
  const [search, setSearch]                 = useState("");
  const [doctorId, setDoctorId]             = useState(null);
  const [newSvc, setNewSvc]                 = useState({ name: "", description: "", category: "General", duration: 30 });

  useEffect(() => {
    const doc = JSON.parse(localStorage.getItem("doctor") || "{}");
    if (!doc._id) { showToast("error", "Doctor not found. Please login again."); setLoading(false); return; }
    setDoctorId(doc._id);
    Promise.all([fetchAll(), fetchMine(doc._id)]).finally(() => setLoading(false));
  }, []);

  const showToast = (type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast({ type: "", text: "" }), 3500);
  };

  const fetchAll = async () => {
    try {
      const res = await axios.get(`${API}/services`);
      setAllServices(res.data || []);
    } catch { showToast("error", "Failed to load services"); }
  };

  const fetchMine = async (id) => {
    try {
      const res = await axios.get(`${API}/doctors/profile/${id}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setMyServices(res.data.doctor?.services || []);
    } catch { showToast("error", "Failed to load your services"); }
  };

  const handleSave = async () => {
    if (!doctorId) return;
    setSaving(true);
    try {
      await axios.put(`${API}/doctors/${doctorId}/services`,
        { services: myServices },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      // update localStorage
      const doc = JSON.parse(localStorage.getItem("doctor") || "{}");
      doc.services = myServices;
      localStorage.setItem("doctor", JSON.stringify(doc));
      showToast("success", "Services saved successfully.");
    } catch (err) {
      showToast("error", err.response?.data?.message || "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = async () => {
    if (!newSvc.name.trim()) { showToast("error", "Service name is required."); return; }
    setCreating(true);
    try {
      await axios.post(`${API}/services`, newSvc, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!myServices.includes(newSvc.name)) setMyServices([...myServices, newSvc.name]);
      await fetchAll();
      setNewSvc({ name: "", description: "", category: "General", duration: 30 });
      setShowForm(false);
      showToast("success", "Service created and added.");
    } catch (err) {
      showToast("error", err.response?.data?.message || "Failed to create service.");
    } finally {
      setCreating(false);
    }
  };

  const toggleService = (name) => {
    if (myServices.includes(name)) {
      setMyServices(myServices.filter(s => s !== name));
    } else {
      setMyServices([...myServices, name]);
    }
  };

  // Group by category, filtered by search
  const grouped = {};
  allServices
    .filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.category?.toLowerCase().includes(search.toLowerCase()))
    .forEach(s => {
      const cat = s.category || "General";
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(s);
    });

  if (loading) {
    return (
      <div className="svc-wrapper">
        <DoctorSidebar />
        <div className="svc-content">
          <div className="svc-loading"><div className="svc-spinner" /><p>Loading services...</p></div>
        </div>
      </div>
    );
  }

  return (
    <div className="svc-wrapper">
      <DoctorSidebar />

      <div className="svc-content">
        {/* Header */}
        <div className="svc-header">
          <h1>Services</h1>
          <p>Manage the dental services you offer to patients</p>
        </div>

        {toast.text && (
          <div className={`svc-toast ${toast.type}`}>
            {toast.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            {toast.text}
          </div>
        )}

        <div className="svc-grid">
          {/* ── Left: My Services ── */}
          <div className="svc-card">
            <div className="svc-card-header">
              <h2><Stethoscope size={15} /> My Services ({myServices.length})</h2>
              <button className="btn-teal" onClick={() => setShowForm(!showForm)}>
                {showForm ? <><X size={13} /> Cancel</> : <><Plus size={13} /> New</>}
              </button>
            </div>

            <div className="svc-card-body">
              {/* Create Form */}
              {showForm && (
                <div className="add-svc-form">
                  <h3>Create New Service</h3>
                  <div className="form-field">
                    <label>Name *</label>
                    <input type="text" placeholder="e.g., Teeth Whitening" value={newSvc.name}
                      onChange={e => setNewSvc({ ...newSvc, name: e.target.value })} />
                  </div>
                  <div className="form-field">
                    <label>Category</label>
                    <select value={newSvc.category} onChange={e => setNewSvc({ ...newSvc, category: e.target.value })}>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="form-field">
                    <label>Duration (min)</label>
                    <input type="number" min="15" step="15" value={newSvc.duration}
                      onChange={e => setNewSvc({ ...newSvc, duration: parseInt(e.target.value) || 30 })} />
                  </div>
                  <div className="form-field">
                    <label>Description</label>
                    <textarea placeholder="Brief description..." value={newSvc.description}
                      onChange={e => setNewSvc({ ...newSvc, description: e.target.value })} />
                  </div>
                  <div className="form-actions">
                    <button className="btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                    <button className="btn-teal" onClick={handleCreate} disabled={creating}>
                      {creating ? "Creating..." : "Create & Add"}
                    </button>
                  </div>
                </div>
              )}

              {/* My Services List */}
              {myServices.length === 0 ? (
                <div className="svc-empty">
                  No services added yet.<br />Browse the catalogue on the right to add.
                </div>
              ) : (
                <div className="my-svc-list">
                  {myServices.map((name, i) => (
                    <div key={i} className="my-svc-item">
                      <span>{name}</span>
                      <button className="my-svc-remove" onClick={() => toggleService(name)}>
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Save */}
              <button className="save-svc-btn" onClick={handleSave} disabled={saving}>
                <Save size={17} /> {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>

          {/* ── Right: Browse Catalogue ── */}
          <div className="svc-card">
            <div className="svc-card-header">
              <h2><Search size={15} /> Service Catalogue</h2>
            </div>

            <div className="browse-search">
              <input
                type="text"
                placeholder="Search services..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            <div className="browse-body">
              {Object.keys(grouped).length === 0 ? (
                <div className="svc-empty">No services found.</div>
              ) : (
                Object.keys(grouped).sort().map(cat => (
                  <div key={cat} className="cat-group">
                    <div className="cat-label">{cat}</div>
                    <div className="cat-services">
                      {grouped[cat].map(svc => {
                        const added = myServices.includes(svc.name);
                        return (
                          <div key={svc._id} className={`svc-browse-item ${added ? "is-added" : ""}`}>
                            <div className="svc-browse-info">
                              <div className="svc-browse-name">{svc.name}</div>
                              {svc.description && <div className="svc-browse-desc">{svc.description}</div>}
                              <div className="svc-browse-dur"><Clock size={10} /> {svc.duration || 30} min</div>
                            </div>
                            <button
                              className={`svc-toggle-btn ${added ? "remove" : "add"}`}
                              onClick={() => toggleService(svc.name)}
                            >
                              {added ? <><Check size={12} /> Added</> : <><Plus size={12} /> Add</>}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
