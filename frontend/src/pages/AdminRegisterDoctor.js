import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import axios from "axios";
import { User, Lock, Briefcase, CheckCircle, AlertCircle, Copy, Mail, Key, X } from "lucide-react";
import PasswordInput from "../components/PasswordInput";
import styles from "../styles/DoctorDashboard.module.css";
import formStyles from "../styles/AdminRegisterDoctor.module.css";

export default function AdminRegisterDoctor() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    licenseNumber: "",
    specialization: "",
    qualifications: "",
    hospital: "",
    experience: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [registeredCredentials, setRegisteredCredentials] = useState(null); // Store credentials for display

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid";

    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";

    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    if (!formData.licenseNumber.trim())
      newErrors.licenseNumber = "License number is required";

    if (!formData.specialization)
      newErrors.specialization = "Specialization is required";

    if (!formData.experience)
      newErrors.experience = "Years of experience is required";

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setLoading(true);
    setSuccess(false);

    try {
      const response = await axios.post("http://localhost:4000/api/admins/doctors/register", formData);
      
      if (response.data.message === "Doctor registered successfully") {
        setSuccess(true);
        
        // Store credentials temporarily for display
        const registeredEmail = formData.email;
        const registeredPassword = formData.password;
        
        setFormData({
          fullName: "",
          email: "",
          phone: "",
          password: "",
          licenseNumber: "",
          specialization: "",
          qualifications: "",
          hospital: "",
          experience: "",
        });
        
        // Store credentials for display in modal (modal will show automatically)
        setRegisteredCredentials({
          email: registeredEmail,
          password: registeredPassword,
          fullName: response.data.doctor?.fullName || formData.fullName
        });
      }
    } catch (error) {
      setErrors({ submit: error.response?.data?.message || "Failed to register doctor. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const specializations = [
    "Orthodontist",
    "Periodontist",
    "Endodontist",
    "Oral Surgeon",
    "Prosthodontist",
    "Pediatric Dentist",
    "Oral Pathologist",
    "General Dentist",
    "Other",
  ];

  return (
    <div className={styles.dashboardWrapper}>
      <AdminSidebar />

      <div className={styles.mainContentArea}>
        <header className={styles.header}>
          <div className={styles.titleGroup}>
            <h1 className={styles.mainTitle}>Register New Doctor</h1>
            <p className={styles.statsGridLabel}>Add a new doctor to the system</p>
          </div>
        </header>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={formStyles.formContainer}
        >
          {success && registeredCredentials && (
            <div className={formStyles.credentialsModal}>
              <div className={formStyles.credentialsCard}>
                <div className={formStyles.credentialsHeader}>
                  <CheckCircle size={24} style={{ color: "#10b981" }} />
                  <h3>Doctor Registered Successfully!</h3>
                  <button 
                    onClick={() => {
                      setSuccess(false);
                      setRegisteredCredentials(null);
                      navigate("/admin/doctors");
                    }}
                    className={formStyles.closeButton}
                  >
                    <X size={20} />
                  </button>
                </div>
                
                <div className={formStyles.credentialsBody}>
                  <p style={{ marginBottom: "1rem", color: "#6b7280" }}>
                    Please share these login credentials with the doctor:
                  </p>
                  
                  <div className={formStyles.credentialItem}>
                    <div className={formStyles.credentialLabel}>
                      <Mail size={18} />
                      <span>Email Address</span>
                    </div>
                    <div className={formStyles.credentialValue}>
                      <code>{registeredCredentials.email}</code>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(registeredCredentials.email);
                          alert("Email copied to clipboard!");
                        }}
                        className={formStyles.copyButton}
                        title="Copy email"
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <div className={formStyles.credentialItem}>
                    <div className={formStyles.credentialLabel}>
                      <Key size={18} />
                      <span>Password</span>
                    </div>
                    <div className={formStyles.credentialValue}>
                      <code>{registeredCredentials.password}</code>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(registeredCredentials.password);
                          alert("Password copied to clipboard!");
                        }}
                        className={formStyles.copyButton}
                        title="Copy password"
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <div className={formStyles.credentialsWarning}>
                    <AlertCircle size={18} />
                    <p>
                      <strong>Important:</strong> These credentials are only shown once. 
                      Please save them or share them with the doctor immediately.
                    </p>
                  </div>
                </div>
                
                <div className={formStyles.credentialsFooter}>
                  <button
                    onClick={() => {
                      const text = `Login Credentials for ${registeredCredentials.email}:\nEmail: ${registeredCredentials.email}\nPassword: ${registeredCredentials.password}`;
                      navigator.clipboard.writeText(text);
                      alert("All credentials copied to clipboard!");
                    }}
                    className={formStyles.copyAllButton}
                  >
                    <Copy size={18} />
                    Copy All Credentials
                  </button>
                  <button
                    onClick={() => {
                      setSuccess(false);
                      setRegisteredCredentials(null);
                      navigate("/admin/doctors");
                    }}
                    className={formStyles.continueButton}
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {success && !registeredCredentials && (
            <div className={formStyles.successMessage}>
              <CheckCircle size={20} />
              Doctor registered successfully! Redirecting...
            </div>
          )}

          {errors.submit && (
            <div className={formStyles.errorMessage}>
              <AlertCircle size={20} style={{ display: "inline", marginRight: "0.5rem" }} />
              {errors.submit}
            </div>
          )}

          <form onSubmit={handleSubmit} className={formStyles.form}>
            {/* Personal Information */}
            <div className={`${formStyles.section} ${formStyles.personalSection}`}>
              <h2 className={formStyles.sectionTitle}>
                <User className={formStyles.sectionIcon} />
                Personal Information
              </h2>

              <div className={formStyles.grid}>
                {[
                  { label: "Full Name", name: "fullName", type: "text", placeholder: "Dr. John Doe" },
                  { label: "Email Address", name: "email", type: "email", placeholder: "email@example.com" },
                  { label: "Phone Number", name: "phone", type: "tel", placeholder: "+94 77 123 4567" },
                ].map((field) => (
                  <div key={field.name} className={formStyles.formGroup}>
                    <label className={formStyles.label}>
                      {field.label}
                    </label>
                    <input
                      type={field.type}
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleChange}
                      placeholder={field.placeholder}
                      className={`${formStyles.input} ${errors[field.name] ? formStyles.error : ""}`}
                    />
                    {errors[field.name] && (
                      <p className={formStyles.errorText}>
                        <AlertCircle size={14} />
                        {errors[field.name]}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Account Information */}
            <div className={`${formStyles.section} ${formStyles.accountSection}`}>
              <h2 className={formStyles.sectionTitle}>
                <Lock className={formStyles.sectionIcon} />
                Account Information
              </h2>

              <div className={formStyles.passwordGroup}>
                <label className={formStyles.label}>
                  Password
                </label>
                <PasswordInput
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`${formStyles.input} ${errors.password ? formStyles.error : ""}`}
                  error={!!errors.password}
                />
                {errors.password && (
                  <p className={formStyles.errorText}>
                    <AlertCircle size={14} />
                    {errors.password}
                  </p>
                )}
              </div>
            </div>

            {/* Professional Details */}
            <div className={`${formStyles.section} ${formStyles.professionalSection}`}>
              <h2 className={formStyles.sectionTitle}>
                <Briefcase className={formStyles.sectionIcon} />
                Professional Details
              </h2>

              <div className={formStyles.grid}>
                <div className={formStyles.formGroup}>
                  <label className={formStyles.label}>
                    Medical License Number
                  </label>
                  <input
                    type="text"
                    name="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={handleChange}
                    placeholder="SLMC / GMC / etc."
                    className={`${formStyles.input} ${errors.licenseNumber ? formStyles.error : ""}`}
                  />
                  {errors.licenseNumber && (
                    <p className={formStyles.errorText}>
                      <AlertCircle size={14} />
                      {errors.licenseNumber}
                    </p>
                  )}
                </div>

                <div className={formStyles.formGroup}>
                  <label className={formStyles.label}>
                    Specialization
                  </label>
                  <select
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    className={`${formStyles.select} ${errors.specialization ? formStyles.error : ""}`}
                  >
                    <option value="">Select Specialization</option>
                    {specializations.map((spec) => (
                      <option key={spec} value={spec}>
                        {spec}
                      </option>
                    ))}
                  </select>
                  {errors.specialization && (
                    <p className={formStyles.errorText}>
                      <AlertCircle size={14} />
                      {errors.specialization}
                    </p>
                  )}
                </div>

                <div className={formStyles.formGroup}>
                  <label className={formStyles.label}>
                    Years of Experience
                  </label>
                  <input
                    type="number"
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    placeholder="e.g. 10"
                    min="0"
                    className={`${formStyles.input} ${errors.experience ? formStyles.error : ""}`}
                  />
                  {errors.experience && (
                    <p className={formStyles.errorText}>
                      <AlertCircle size={14} />
                      {errors.experience}
                    </p>
                  )}
                </div>

                <div className={formStyles.formGroup}>
                  <label className={formStyles.label}>
                    Hospital / Workplace
                  </label>
                  <input
                    type="text"
                    name="hospital"
                    value={formData.hospital}
                    onChange={handleChange}
                    placeholder="Colombo National Hospital"
                    className={formStyles.input}
                  />
                </div>
              </div>

              <div className={formStyles.formGroup} style={{ marginTop: "1.5rem" }}>
                <label className={formStyles.label}>
                  Qualifications
                </label>
                <textarea
                  rows="3"
                  name="qualifications"
                  value={formData.qualifications}
                  onChange={handleChange}
                  placeholder="MBBS, MD, FRCS, etc."
                  className={formStyles.textarea}
                ></textarea>
              </div>
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className={formStyles.submitButton}
            >
              {loading ? "Registering..." : "Register Doctor"}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

