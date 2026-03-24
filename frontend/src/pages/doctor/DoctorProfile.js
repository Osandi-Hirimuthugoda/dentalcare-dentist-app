import React, { useState, useEffect } from "react";
import axios from "axios";
import DoctorSidebar from "../../components/layout/DoctorSidebar";
import {
  Mail, Phone, Briefcase, Award, Building, Calendar,
  Edit2, Save, X, CheckCircle, AlertCircle, Hash, User,
} from "lucide-react";
import "../../styles/pages/DoctorProfile.css";

const API = process.env.REACT_APP_API_URL || "http://localhost:4000/api";
const getToken = () => localStorage.getItem("token") || "";

export default function DoctorProfile() {
  const [doctor, setDoctor]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [toast, setToast]     = useState({ type: "", text: "" });
  const [form, setForm]       = useState({});

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("doctor") || "{}");
    if (stored._id) {
      setDoctor(stored);
      setForm(toForm(stored));
    }
    setLoading(false);
  }, []);

  const toForm = (d) => ({
    fullName:       d.fullName       || "",
    phone:          d.phone          || "",
    specialization: d.specialization || "",
    qualifications: d.qualifications || "",
    hospital:       d.hospital       || "",
    experience:     d.experience     || "",
  });

  const showToast = (type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast({ type: "", text: "" }), 3500);
  };

  const handleSave = async () => {
    if (!doctor?._id) return;
    setSaving(true);
    try {
      const res = await axios.put(
        `${API}/doctors/${doctor._id}/profile`,
        form,
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      const updated = { ...doctor, ...res.data.doctor };
      setDoctor(updated);
      localStorage.setItem("doctor", JSON.stringify(updated));
      setEditing(false);
      showToast("success", "Profile updated successfully.");
    } catch (err) {
      showToast("error", err.response?.data?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm(toForm(doctor));
    setEditing(false);
  };

  const fmtDate = (d) => d
    ? new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : null;

  if (loading) {
    return (
      <div className="prof-wrapper">
        <DoctorSidebar />
        <div className="prof-content">
          <div className="prof-loading"><div className="prof-spinner" /><p>Loading profile...</p></div>
        </div>
      </div>
    );
  }

  if (!doctor?._id) {
    return (
      <div className="prof-wrapper">
        <DoctorSidebar />
        <div className="prof-content">
          <div className="prof-toast error"><AlertCircle size={16} /> Doctor not found. Please login again.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="prof-wrapper">
      <DoctorSidebar />

      <div className="prof-content">
        {/* Header */}
        <div className="prof-header">
          <h1>My Profile</h1>
          <p>View and update your professional information</p>
        </div>

        {toast.text && (
          <div className={`prof-toast ${toast.type}`}>
            {toast.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            {toast.text}
          </div>
        )}

        <div className="prof-grid">
          {/* ── Left: Avatar Card ── */}
          <div className="prof-card">
            <div className="avatar-card">
              <div className="avatar-circle">
                {(doctor.fullName || "D").charAt(0).toUpperCase()}
              </div>
              <h2 className="avatar-name">{doctor.fullName || "Doctor"}</h2>
              {doctor.specialization && (
                <span className="avatar-spec">{doctor.specialization}</span>
              )}

              <div className="avatar-divider" />

              <div className="avatar-meta">
                {doctor.email && (
                  <div className="avatar-meta-row">
                    <Mail size={14} />
                    <span>{doctor.email}</span>
                  </div>
                )}
                {doctor.phone && (
                  <div className="avatar-meta-row">
                    <Phone size={14} />
                    <span>{doctor.phone}</span>
                  </div>
                )}
                {doctor.hospital && (
                  <div className="avatar-meta-row">
                    <Building size={14} />
                    <span>{doctor.hospital}</span>
                  </div>
                )}
                {doctor.experience && (
                  <div className="avatar-meta-row">
                    <Calendar size={14} />
                    <span>{doctor.experience} yrs experience</span>
                  </div>
                )}
                {doctor.createdAt && (
                  <div className="avatar-meta-row">
                    <User size={14} />
                    <span>Since {fmtDate(doctor.createdAt)}</span>
                  </div>
                )}
              </div>

              {/* Services */}
              {doctor.services?.length > 0 && (
                <>
                  <div className="avatar-divider" />
                  <div className="services-tags">
                    {doctor.services.map((s, i) => (
                      <span key={i} className="svc-tag">{s}</span>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ── Right: Info Card ── */}
          <div className="prof-card">
            <div className="info-card-header">
              <h2>Professional Details</h2>
              <button
                className={`edit-btn ${editing ? "active" : ""}`}
                onClick={() => editing ? handleCancel() : setEditing(true)}
              >
                {editing ? <><X size={13} /> Cancel</> : <><Edit2 size={13} /> Edit</>}
              </button>
            </div>

            <div className="info-body">
              {/* Row 1 */}
              <div className="info-row">
                <div className="info-field">
                  <div className="field-label"><User size={12} /> Full Name</div>
                  {editing
                    ? <input className="field-input" value={form.fullName}
                        onChange={e => setForm({ ...form, fullName: e.target.value })} />
                    : <div className="field-value">{doctor.fullName || <span className="empty">Not set</span>}</div>
                  }
                </div>
                <div className="info-field">
                  <div className="field-label"><Phone size={12} /> Phone</div>
                  {editing
                    ? <input className="field-input" value={form.phone}
                        onChange={e => setForm({ ...form, phone: e.target.value })} />
                    : <div className="field-value">{doctor.phone || <span className="empty">Not set</span>}</div>
                  }
                </div>
              </div>

              {/* Row 2 */}
              <div className="info-row">
                <div className="info-field">
                  <div className="field-label"><Mail size={12} /> Email</div>
                  <div className="field-value">{doctor.email}</div>
                </div>
                <div className="info-field">
                  <div className="field-label"><Hash size={12} /> License Number</div>
                  <div className="field-value">{doctor.licenseNumber || <span className="empty">Not set</span>}</div>
                </div>
              </div>

              {/* Row 3 */}
              <div className="info-row">
                <div className="info-field">
                  <div className="field-label"><Briefcase size={12} /> Specialization</div>
                  {editing
                    ? <input className="field-input" value={form.specialization}
                        onChange={e => setForm({ ...form, specialization: e.target.value })} />
                    : <div className="field-value">{doctor.specialization || <span className="empty">Not set</span>}</div>
                  }
                </div>
                <div className="info-field">
                  <div className="field-label"><Calendar size={12} /> Experience (years)</div>
                  {editing
                    ? <input className="field-input" type="number" min="0" value={form.experience}
                        onChange={e => setForm({ ...form, experience: e.target.value })} />
                    : <div className="field-value">{doctor.experience ? `${doctor.experience} years` : <span className="empty">Not set</span>}</div>
                  }
                </div>
              </div>

              {/* Row 4 */}
              <div className="info-row">
                <div className="info-field">
                  <div className="field-label"><Award size={12} /> Qualifications</div>
                  {editing
                    ? <input className="field-input" value={form.qualifications}
                        onChange={e => setForm({ ...form, qualifications: e.target.value })} />
                    : <div className="field-value">{doctor.qualifications || <span className="empty">Not set</span>}</div>
                  }
                </div>
                <div className="info-field">
                  <div className="field-label"><Building size={12} /> Hospital / Workplace</div>
                  {editing
                    ? <input className="field-input" value={form.hospital}
                        onChange={e => setForm({ ...form, hospital: e.target.value })} />
                    : <div className="field-value">{doctor.hospital || <span className="empty">Not set</span>}</div>
                  }
                </div>
              </div>
            </div>

            {/* Save Row */}
            {editing && (
              <div className="save-row">
                <button className="cancel-btn" onClick={handleCancel}>Cancel</button>
                <button className="save-prof-btn" onClick={handleSave} disabled={saving}>
                  <Save size={14} /> {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
