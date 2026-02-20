import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import DoctorSidebar from "../../components/layout/DoctorSidebar";
import PasswordInput from "../../components/common/PasswordInput";
import "../../styles/pages/DoctorSettings.css"; // Import your new CSS file

const DoctorSettings = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    specialization: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    profilePicture: "https://via.placeholder.com/100/0891b2/FFFFFF?text=JD",
  });
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    // Load doctor data from localStorage
    const doctorData = JSON.parse(localStorage.getItem("doctor") || "{}");
    if (doctorData._id) {
      setFormData((prev) => ({
        ...prev,
        fullName: doctorData.fullName || "",
        email: doctorData.email || "",
        phone: doctorData.phone || "",
        specialization: doctorData.specialization || "",
      }));
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNotificationChange = (e) => {
    setNotificationSettings({
      ...notificationSettings,
      [e.target.name]: e.target.checked,
    });
  };

  const handleProfilePictureUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, profilePicture: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const doctorData = JSON.parse(localStorage.getItem("doctor") || "{}");
      const doctorId = doctorData._id;

      if (!doctorId) {
        setMessage({ type: "error", text: "Doctor not found. Please login again." });
        return;
      }

      // Update profile
      if (formData.fullName || formData.phone || formData.specialization) {
        await axios.put(`http://localhost:4000/api/doctors/${doctorId}/profile`, {
          fullName: formData.fullName,
          phone: formData.phone,
          specialization: formData.specialization,
        });
      }

      // Change password if provided
      if (formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          setMessage({ type: "error", text: "New passwords do not match!" });
          setLoading(false);
          return;
        }

        if (!formData.currentPassword) {
          setMessage({ type: "error", text: "Current password is required to change password!" });
          setLoading(false);
          return;
        }

        await axios.put(`http://localhost:4000/api/doctors/${doctorId}/change-password`, {
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        });

        // Clear password fields after successful change
        setFormData({
          ...formData,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }

      setMessage({ type: "success", text: "Settings saved successfully!" });
      
      // Update localStorage with new data
      const updatedDoctor = { ...doctorData, ...formData };
      localStorage.setItem("doctor", JSON.stringify(updatedDoctor));
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to save settings. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      // Implement account deletion logic here (e.g., API call)
      alert("Account deleted.");
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 50%, #CBD5E1 100%)" }}>
      <DoctorSidebar />

      <div style={{ flex: 1, marginLeft: "14rem", padding: "2rem 2.5rem" }}>
        <div style={{ 
          background: "white", 
          borderRadius: "1.25rem", 
          padding: "1.5rem 2rem", 
          marginBottom: "2rem", 
          border: "1px solid rgba(0, 0, 0, 0.05)", 
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)"
        }}>
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ 
              margin: 0, 
              fontSize: "2.5rem", 
              fontWeight: "900", 
              background: "linear-gradient(135deg, #2563EB 0%, #3B82F6 50%, #60A5FA 100%)", 
              WebkitBackgroundClip: "text", 
              WebkitTextFillColor: "transparent", 
              backgroundClip: "text", 
              display: "flex", 
              alignItems: "center" 
            }}
          >
            Account Settings
          </motion.h2>
        </div>

        <div style={{
          background: "white",
          borderRadius: "1.25rem",
          padding: "2rem",
          border: "1px solid rgba(0, 0, 0, 0.05)",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)"
        }}>
          {message.text && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                padding: "1rem 1.5rem",
                borderRadius: "0.875rem",
                marginBottom: "1.5rem",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                backgroundColor: message.type === "success" ? 'rgba(74, 222, 128, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                border: `1px solid ${message.type === "success" ? 'rgba(74, 222, 128, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                color: message.type === "success" ? '#4ADE80' : '#EF4444',
                textAlign: "center",
                fontWeight: "600"
              }}
            >
              {message.text}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

            {/* Profile Picture Section */}
            <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
              <img
                src={formData.profilePicture}
                alt="Profile"
                style={{
                  width: "100px",
                  height: "100px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  marginBottom: "1rem",
                  border: "4px solid #E5E7EB"
                }}
              />
              <label htmlFor="profilePictureInput" style={{
                display: "inline-block",
                padding: "0.75rem 1.5rem",
                background: "linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)",
                color: "white",
                borderRadius: "0.75rem",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "0.9rem",
                boxShadow: "0 4px 15px rgba(37, 99, 235, 0.3)",
                transition: "all 0.3s ease"
              }}>
                Upload New Picture
              </label>
              <input
                id="profilePictureInput"
                type="file"
                accept="image/*"
                onChange={handleProfilePictureUpload}
                style={{ display: "none" }}
              />
            </div>

            {/* General Information */}
            <div>
              <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "600", color: "#374151", marginBottom: "0.5rem" }}>
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "0.875rem 1rem",
                  background: "white",
                  border: "1px solid #E5E7EB",
                  borderRadius: "0.75rem",
                  color: "#1F2937",
                  fontSize: "0.95rem",
                  transition: "all 0.3s ease",
                  outline: "none"
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#60A5FA";
                  e.target.style.boxShadow = "0 0 0 3px rgba(96, 165, 250, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#E5E7EB";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "600", color: "#374151", marginBottom: "0.5rem" }}>
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "0.875rem 1rem",
                  background: "white",
                  border: "1px solid #E5E7EB",
                  borderRadius: "0.75rem",
                  color: "#1F2937",
                  fontSize: "0.95rem",
                  transition: "all 0.3s ease",
                  outline: "none"
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#60A5FA";
                  e.target.style.boxShadow = "0 0 0 3px rgba(96, 165, 250, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#E5E7EB";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "600", color: "#374151", marginBottom: "0.5rem" }}>
                Phone
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "0.875rem 1rem",
                  background: "white",
                  border: "1px solid #E5E7EB",
                  borderRadius: "0.75rem",
                  color: "#1F2937",
                  fontSize: "0.95rem",
                  transition: "all 0.3s ease",
                  outline: "none"
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#60A5FA";
                  e.target.style.boxShadow = "0 0 0 3px rgba(96, 165, 250, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#E5E7EB";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "600", color: "#374151", marginBottom: "0.5rem" }}>
                Specialization
              </label>
              <input
                type="text"
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "0.875rem 1rem",
                  background: "white",
                  border: "1px solid #E5E7EB",
                  borderRadius: "0.75rem",
                  color: "#1F2937",
                  fontSize: "0.95rem",
                  transition: "all 0.3s ease",
                  outline: "none"
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#60A5FA";
                  e.target.style.boxShadow = "0 0 0 3px rgba(96, 165, 250, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#E5E7EB";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            <hr style={{ border: "none", borderTop: "1px solid #E5E7EB", margin: "1rem 0" }} />

            {/* Password Section */}
            <h3 style={{ fontSize: "1.25rem", fontWeight: "700", color: "#1F2937", marginBottom: "1rem" }}>Change Password</h3>
            
            <div>
              <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "600", color: "#374151", marginBottom: "0.5rem" }}>
                Current Password
              </label>
              <PasswordInput
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                placeholder="Enter current password"
                style={{
                  width: "100%",
                  padding: "0.875rem 1rem",
                  background: "white",
                  border: "1px solid #E5E7EB",
                  borderRadius: "0.75rem",
                  color: "#1F2937",
                  fontSize: "0.95rem",
                  transition: "all 0.3s ease",
                  outline: "none"
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "600", color: "#374151", marginBottom: "0.5rem" }}>
                New Password
              </label>
              <PasswordInput
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="Enter new password"
                style={{
                  width: "100%",
                  padding: "0.875rem 1rem",
                  background: "white",
                  border: "1px solid #E5E7EB",
                  borderRadius: "0.75rem",
                  color: "#1F2937",
                  fontSize: "0.95rem",
                  transition: "all 0.3s ease",
                  outline: "none"
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "600", color: "#374151", marginBottom: "0.5rem" }}>
                Confirm New Password
              </label>
              <PasswordInput
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm new password"
                style={{
                  width: "100%",
                  padding: "0.875rem 1rem",
                  background: "white",
                  border: "1px solid #E5E7EB",
                  borderRadius: "0.75rem",
                  color: "#1F2937",
                  fontSize: "0.95rem",
                  transition: "all 0.3s ease",
                  outline: "none"
                }}
              />
            </div>

            <hr style={{ border: "none", borderTop: "1px solid #E5E7EB", margin: "1rem 0" }} />

            {/* Notification Preferences */}
            <h3 style={{ fontSize: "1.25rem", fontWeight: "700", color: "#1F2937", marginBottom: "1rem" }}>Notification Preferences</h3>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem", background: "#F9FAFB", borderRadius: "0.75rem", marginBottom: "1rem" }}>
              <label style={{ fontSize: "0.95rem", fontWeight: "600", color: "#374151" }}>Email Notifications</label>
              <label style={{ position: "relative", display: "inline-block", width: "50px", height: "24px" }}>
                <input
                  type="checkbox"
                  name="emailNotifications"
                  checked={notificationSettings.emailNotifications}
                  onChange={handleNotificationChange}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span style={{
                  position: "absolute",
                  cursor: "pointer",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: notificationSettings.emailNotifications ? "#2563EB" : "#CBD5E1",
                  transition: "0.4s",
                  borderRadius: "24px"
                }}>
                  <span style={{
                    position: "absolute",
                    content: "",
                    height: "18px",
                    width: "18px",
                    left: notificationSettings.emailNotifications ? "28px" : "3px",
                    bottom: "3px",
                    backgroundColor: "white",
                    transition: "0.4s",
                    borderRadius: "50%"
                  }}></span>
                </span>
              </label>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem", background: "#F9FAFB", borderRadius: "0.75rem" }}>
              <label style={{ fontSize: "0.95rem", fontWeight: "600", color: "#374151" }}>SMS Notifications</label>
              <label style={{ position: "relative", display: "inline-block", width: "50px", height: "24px" }}>
                <input
                  type="checkbox"
                  name="smsNotifications"
                  checked={notificationSettings.smsNotifications}
                  onChange={handleNotificationChange}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span style={{
                  position: "absolute",
                  cursor: "pointer",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: notificationSettings.smsNotifications ? "#2563EB" : "#CBD5E1",
                  transition: "0.4s",
                  borderRadius: "24px"
                }}>
                  <span style={{
                    position: "absolute",
                    content: "",
                    height: "18px",
                    width: "18px",
                    left: notificationSettings.smsNotifications ? "28px" : "3px",
                    bottom: "3px",
                    backgroundColor: "white",
                    transition: "0.4s",
                    borderRadius: "50%"
                  }}></span>
                </span>
              </label>
            </div>

            <motion.button
              whileHover={{ scale: loading ? 1 : 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "1rem 2rem",
                background: loading ? "#9CA3AF" : "linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)",
                color: "white",
                border: "none",
                borderRadius: "0.875rem",
                fontSize: "1rem",
                fontWeight: "600",
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: loading ? "none" : "0 4px 15px rgba(37, 99, 235, 0.3)",
                transition: "all 0.3s ease",
                marginTop: "1rem"
              }}
            >
              {loading ? "Saving..." : "Save Changes"}
            </motion.button>
          </form>

          {/* Delete Account Section */}
          <div style={{ marginTop: "2rem", padding: "1.5rem", background: "rgba(239, 68, 68, 0.05)", borderRadius: "0.875rem", border: "1px solid rgba(239, 68, 68, 0.2)" }}>
            <h3 style={{ fontSize: "1.125rem", fontWeight: "700", color: "#EF4444", marginBottom: "0.5rem" }}>Danger Zone</h3>
            <p style={{ fontSize: "0.875rem", color: "#6B7280", marginBottom: "1rem" }}>
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDeleteAccount}
              style={{
                padding: "0.75rem 1.5rem",
                background: "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)",
                color: "white",
                border: "none",
                borderRadius: "0.75rem",
                fontSize: "0.9rem",
                fontWeight: "600",
                cursor: "pointer",
                boxShadow: "0 4px 15px rgba(239, 68, 68, 0.3)"
              }}
            >
              Delete Account
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorSettings;