import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../components/layout/AdminSidebar";
import axios from "axios";
import {
  User, Lock, Briefcase, CheckCircle, AlertCircle,
  Copy, Mail, Key, X, UserPlus, Phone, Building,
} from "lucide-react";
import PasswordInput from "../../components/common/PasswordInput";
import { DENTAL_SPECIALIZATIONS } from "../../utils/constants";
import "../../styles/pages/AdminRegisterDoctor.css";

const API = "/api";

export default function AdminRegisterDoctor() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "", email: "", phone: "", password: "",
    licenseNumber: "", specialization: "", qualifications: "",
    hospital: "", experience: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.fullName.trim())      e.fullName      = "Required";
    if (!form.email.trim())         e.email         = "Required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email";
    if (!form.phone.trim())         e.phone         = "Required";
    if (!form.password)             e.password      = "Required";
    else if (form.password.length < 6) e.password   = "Min 6 characters";
    if (!form.licenseNumber.trim()) e.licenseNumber = "Required";
    if (!form.specialization)       e.specialization = "Required";
    if (!form.experience)           e.experience    = "Required";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const admin = JSON.parse(localStorage.getItem("admin") || "{}");
      const res = await axios.post(`${API}/admins/doctors/register`, form, {
        headers: { Authorization: `Bearer ${admin?.token || ""}` },
      });
      if (res.data.message === "Doctor registered successfully") {
        setCredentials({
          fullName: res.data.doctor?.fullName || form.fullName,
          email:    res.data.credentials?.email    || form.email,
          password: res.data.credentials?.password || form.password,
        });
        setForm({ fullName: "", email: "", phone: "", password: "", licenseNumber: "", specialization: "", qualifications: "", hospital: "", experience: "" });
        setErrors({});
      }
    } catch (err) {
      setErrors({ submit: err.response?.data?.message || "Failed to register doctor." });
    } finally {
      setLoading(false);
    }
  };

  const copy = (text) => navigator.clipboard.writeText(text);

  return (
    <div className="reg-wrapper">
      <AdminSidebar />

      <div className="reg-content">
        {/* Header */}
        <div className="reg-header">
          <h1><UserPlus size={22} /> Register New Doctor</h1>
          <p>Add a new doctor to the DentalCare+ system</p>
        </div>

        {errors.submit && (
          <div className="reg-error-banner">
            <AlertCircle size={15} /> {errors.submit}
          </div>
        )}

        <form onSubmit={handleSubmit} className="reg-form">
          {/* Personal Info */}
          <div className="reg-card">
            <div className="reg-card-header">
              <div className="reg-card-icon" style={{ background: "#eff6ff", border: "1px solid #bfdbfe" }}>
                <User size={16} style={{ color: "#2563eb" }} />
              </div>
              <h2>Personal Information</h2>
            </div>
            <div className="reg-grid">
              {[
                { label: "Full Name",     name: "fullName",  type: "text",  placeholder: "Dr. John Doe",       req: true },
                { label: "Email Address", name: "email",     type: "email", placeholder: "doctor@example.com", req: true },
                { label: "Phone Number",  name: "phone",     type: "tel",   placeholder: "+94 77 123 4567",    req: true },
              ].map(f => (
                <div key={f.name} className="reg-field">
                  <label>{f.label} {f.req && <span className="req-star">*</span>}</label>
                  <input type={f.type} name={f.name} value={form[f.name]}
                    onChange={handleChange} placeholder={f.placeholder}
                    className={errors[f.name] ? "has-error" : ""} />
                  {errors[f.name] && <span className="field-error"><AlertCircle size={11} />{errors[f.name]}</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Professional Details */}
          <div className="reg-card">
            <div className="reg-card-header">
              <div className="reg-card-icon" style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
                <Briefcase size={16} style={{ color: "#059669" }} />
              </div>
              <h2>Professional Details</h2>
            </div>
            <div className="reg-grid">
              {[
                { label: "License Number",       name: "licenseNumber", type: "text",   placeholder: "SLMC12345",                  req: true },
                { label: "Years of Experience",  name: "experience",    type: "number", placeholder: "e.g. 5",                     req: true },
                { label: "Hospital / Workplace", name: "hospital",      type: "text",   placeholder: "Colombo National Hospital",  req: false },
              ].map(f => (
                <div key={f.name} className="reg-field">
                  <label>{f.label} {f.req && <span className="req-star">*</span>}</label>
                  <input type={f.type} name={f.name} value={form[f.name]}
                    onChange={handleChange} placeholder={f.placeholder}
                    className={errors[f.name] ? "has-error" : ""} />
                  {errors[f.name] && <span className="field-error"><AlertCircle size={11} />{errors[f.name]}</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Specialization */}
          <div className="reg-card">
            <div className="reg-card-header">
              <div className="reg-card-icon" style={{ background: "#fdf4ff", border: "1px solid #e9d5ff" }}>
                <Briefcase size={16} style={{ color: "#7c3aed" }} />
              </div>
              <h2>Specialization &amp; Qualifications</h2>
            </div>
            <div className="reg-grid">
              <div className="reg-field">
                <label>Specialization <span className="req-star">*</span></label>
                <select name="specialization" value={form.specialization} onChange={handleChange}
                  className={errors.specialization ? "has-error" : ""}>
                  <option value="">Select Specialization</option>
                  {DENTAL_SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                {errors.specialization && <span className="field-error"><AlertCircle size={11} />{errors.specialization}</span>}
              </div>
              <div className="reg-field">
                <label>Qualifications</label>
                <input type="text" name="qualifications" value={form.qualifications}
                  onChange={handleChange} placeholder="BDS, MDS, FRCS..." />
              </div>
            </div>
          </div>

          {/* Password */}
          <div className="reg-card">
            <div className="reg-card-header">
              <div className="reg-card-icon" style={{ background: "#fff7ed", border: "1px solid #fed7aa" }}>
                <Lock size={16} style={{ color: "#ea580c" }} />
              </div>
              <h2>Account Password</h2>
            </div>
            <div style={{ maxWidth: "380px" }}>
              <div className="reg-field">
                <label>Password <span className="req-star">*</span></label>
                <PasswordInput name="password" value={form.password} onChange={handleChange}
                  placeholder="Min 6 characters"
                  style={{ padding: "0.625rem 2.75rem 0.625rem 0.875rem", border: `1.5px solid ${errors.password ? "#ef4444" : "#e5e7eb"}`, borderRadius: "0.625rem", fontSize: "0.875rem", width: "100%", boxSizing: "border-box", outline: "none" }} />
                {errors.password && <span className="field-error"><AlertCircle size={11} />{errors.password}</span>}
              </div>
            </div>
          </div>

          {/* Submit */}
          <button type="submit" className="reg-submit-btn" disabled={loading}>
            <UserPlus size={18} /> {loading ? "Registering..." : "Register Doctor"}
          </button>
        </form>
      </div>

      {/* Credentials Modal */}
      {credentials && (
        <div className="reg-modal-overlay" onClick={() => { setCredentials(null); navigate("/admin/doctors"); }}>
          <div className="reg-modal" onClick={e => e.stopPropagation()}>
            <div className="reg-modal-header">
              <CheckCircle size={24} style={{ color: "#059669" }} />
              <div>
                <h3>Doctor Registered!</h3>
                <p>{credentials.fullName}</p>
              </div>
              <button className="reg-modal-close" onClick={() => { setCredentials(null); navigate("/admin/doctors"); }}>
                <X size={16} />
              </button>
            </div>

            <div className="reg-modal-body">
              <p className="reg-modal-desc">Share these login credentials with the doctor:</p>
              {[
                { label: "Email",    value: credentials.email,    icon: Mail },
                { label: "Password", value: credentials.password, icon: Key  },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="reg-cred-item">
                  <div className="reg-cred-label"><Icon size={12} /> {label}</div>
                  <div className="reg-cred-value">
                    <code>{value}</code>
                    <button className="reg-copy-btn" onClick={() => copy(value)}><Copy size={13} /></button>
                  </div>
                </div>
              ))}
              <div className="reg-warning">
                <AlertCircle size={14} style={{ color: "#f59e0b", flexShrink: 0 }} />
                <p><strong>Important:</strong> These credentials are shown only once. Share them with the doctor immediately.</p>
              </div>
            </div>

            <div className="reg-modal-footer">
              <button className="reg-copy-all-btn" onClick={() => copy(`Email: ${credentials.email}\nPassword: ${credentials.password}`)}>
                <Copy size={14} /> Copy All
              </button>
              <button className="reg-continue-btn" onClick={() => { setCredentials(null); navigate("/admin/doctors"); }}>
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
