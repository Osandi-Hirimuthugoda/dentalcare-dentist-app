import React, { useState, useEffect } from "react";
import axios from "axios";
import DoctorSidebar from "../../components/layout/DoctorSidebar";
import PasswordInput from "../../components/common/PasswordInput";
import { DENTAL_SPECIALIZATIONS } from "../../utils/constants";
import { Settings, User, Lock, Bell, AlertTriangle, CheckCircle, AlertCircle, Save } from "lucide-react";
import "../../styles/pages/DoctorSettings.css";

const API = "http://localhost:4000/api";
const getToken = () => localStorage.getItem("token") || "";

export default function DoctorSettings() {
  const [profile, setProfile] = useState({ fullName: "", phone: "", specialization: "" });
  const [email, setEmail]     = useState("");
  const [pwd, setPwd]         = useState({ current: "", newPwd: "", confirm: "" });
  const [notifs, setNotifs]   = useState({ email: true, sms: false });
  const [saving, setSaving]   = useState(false);
  const [toast, setToast]     = useState({ type: "", text: "" });
  const [doctorId, setDoctorId] = useState(null);

  useEffect(() => {
    const doc = JSON.parse(localStorage.getItem("doctor") || "{}");
    if (doc._id) {
      setDoctorId(doc._id);
      setEmail(doc.email || "");
      setProfile({
        fullName:       doc.fullName       || "",
        phone:          doc.phone          || "",
        specialization: doc.specialization || "",
      });
    }
  }, []);

  const showToast = (type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast({ type: "", text: "" }), 3500);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!doctorId) { showToast("error", "Doctor not found."); return; }

    // Password validation
    if (pwd.newPwd) {
      if (!pwd.current) { showToast("error", "Current password is required."); return; }
      if (pwd.newPwd !== pwd.confirm) { showToast("error", "New passwords do not match."); return; }
      if (pwd.newPwd.length < 6) { showToast("error", "New password must be at least 6 characters."); return; }
    }

    setSaving(true);
    try {
      // Update profile
      const res = await axios.put(`${API}/doctors/${doctorId}/profile`, profile, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const updated = { ...JSON.parse(localStorage.getItem("doctor") || "{}"), ...res.data.doctor };
      localStorage.setItem("doctor", JSON.stringify(updated));

      // Change password if provided
      if (pwd.newPwd) {
        await axios.put(`${API}/doctors/${doctorId}/change-password`, {
          currentPassword: pwd.current,
          newPassword: pwd.newPwd,
        }, { headers: { Authorization: `Bearer ${getToken()}` } });
        setPwd({ current: "", newPwd: "", confirm: "" });
      }

      showToast("success", "Settings saved successfully.");
    } catch (err) {
      showToast("error", err.response?.data?.message || "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete your account? This cannot be undone.")) {
      alert("Account deletion is not yet implemented.");
    }
  };

  const doc = JSON.parse(localStorage.getItem("doctor") || "{}");

  return (
    <div className="set-wrapper">
      <DoctorSidebar />

      <div className="set-content">
        {/* Header */}
        <div className="set-header">
          <h1><Settings size={22} /> Settings</h1>
          <p>Manage your account preferences and security</p>
        </div>

        {toast.text && (
          <div className={`set-toast ${toast.type}`}>
            {toast.type === "success" ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
            {toast.text}
          </div>
        )}

        <form onSubmit={handleSave}>
          <div className="set-grid">
            {/* ── Left: Profile Card ── */}
            <div>
              <div className="set-card" style={{ marginBottom: "1.5rem" }}>
                <div className="profile-avatar-wrap">
                  <div className="profile-avatar-circle">
                    {(doc.fullName || "D").charAt(0).toUpperCase()}
                  </div>
                  <div className="profile-name">{doc.fullName || "Doctor"}</div>
                  {doc.specialization && <div className="profile-spec">{doc.specialization}</div>}
                  <div className="profile-email">{doc.email}</div>
                </div>
              </div>

              {/* Notifications */}
              <div className="set-card">
                <div className="set-card-header">
                  <Bell size={15} />
                  <h2>Notifications</h2>
                </div>
                <div className="set-card-body">
                  <div className="set-toggle-row">
                    <div>
                      <div className="set-toggle-label">Email Notifications</div>
                      <div className="set-toggle-sub">Appointment reminders</div>
                    </div>
                    <label className="toggle">
                      <input type="checkbox" checked={notifs.email}
                        onChange={e => setNotifs({ ...notifs, email: e.target.checked })} />
                      <span className="toggle-slider" />
                    </label>
                  </div>
                  <div className="set-toggle-row">
                    <div>
                      <div className="set-toggle-label">SMS Notifications</div>
                      <div className="set-toggle-sub">Text message alerts</div>
                    </div>
                    <label className="toggle">
                      <input type="checkbox" checked={notifs.sms}
                        onChange={e => setNotifs({ ...notifs, sms: e.target.checked })} />
                      <span className="toggle-slider" />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Right: Forms ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

              {/* Profile Info */}
              <div className="set-card">
                <div className="set-card-header">
                  <User size={15} />
                  <h2>Profile Information</h2>
                </div>
                <div className="set-card-body">
                  <div className="set-form">
                    <div className="set-row">
                      <div className="set-field">
                        <label>Full Name</label>
                        <input type="text" value={profile.fullName}
                          onChange={e => setProfile({ ...profile, fullName: e.target.value })}
                          placeholder="Dr. John Smith" />
                      </div>
                      <div className="set-field">
                        <label>Phone</label>
                        <input type="text" value={profile.phone}
                          onChange={e => setProfile({ ...profile, phone: e.target.value })}
                          placeholder="+94 77 123 4567" />
                      </div>
                    </div>
                    <div className="set-field">
                      <label>Email</label>
                      <input type="email" value={email} disabled />
                    </div>
                    <div className="set-field">
                      <label>Specialization</label>
                      <select value={profile.specialization}
                        onChange={e => setProfile({ ...profile, specialization: e.target.value })}>
                        <option value="">Select Specialization</option>
                        {DENTAL_SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Change Password */}
              <div className="set-card">
                <div className="set-card-header">
                  <Lock size={15} />
                  <h2>Change Password</h2>
                </div>
                <div className="set-card-body">
                  <div className="set-form">
                    <div className="set-field">
                      <label>Current Password</label>
                      <PasswordInput
                        name="currentPassword"
                        value={pwd.current}
                        onChange={e => setPwd({ ...pwd, current: e.target.value })}
                        placeholder="Enter current password"
                        className="set-field input"
                        style={{ padding: "0.625rem 2.75rem 0.625rem 0.875rem", border: "1.5px solid #e5e7eb", borderRadius: "0.625rem", fontSize: "0.875rem", width: "100%", boxSizing: "border-box", outline: "none" }}
                      />
                    </div>
                    <div className="set-row">
                      <div className="set-field">
                        <label>New Password</label>
                        <PasswordInput
                          name="newPassword"
                          value={pwd.newPwd}
                          onChange={e => setPwd({ ...pwd, newPwd: e.target.value })}
                          placeholder="Min 6 characters"
                          style={{ padding: "0.625rem 2.75rem 0.625rem 0.875rem", border: "1.5px solid #e5e7eb", borderRadius: "0.625rem", fontSize: "0.875rem", width: "100%", boxSizing: "border-box", outline: "none" }}
                        />
                      </div>
                      <div className="set-field">
                        <label>Confirm Password</label>
                        <PasswordInput
                          name="confirmPassword"
                          value={pwd.confirm}
                          onChange={e => setPwd({ ...pwd, confirm: e.target.value })}
                          placeholder="Repeat new password"
                          style={{ padding: "0.625rem 2.75rem 0.625rem 0.875rem", border: "1.5px solid #e5e7eb", borderRadius: "0.625rem", fontSize: "0.875rem", width: "100%", boxSizing: "border-box", outline: "none" }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Save */}
              <button type="submit" className="set-save-btn" disabled={saving}>
                <Save size={17} /> {saving ? "Saving..." : "Save Changes"}
              </button>

              {/* Danger Zone */}
              <div className="set-danger">
                <h3><AlertTriangle size={14} style={{ display: "inline", marginRight: "4px" }} /> Danger Zone</h3>
                <p>Once you delete your account, there is no going back. Please be certain.</p>
                <button type="button" className="set-delete-btn" onClick={handleDelete}>
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
