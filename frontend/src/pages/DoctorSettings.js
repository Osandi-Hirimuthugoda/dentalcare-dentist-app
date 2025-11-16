import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import DoctorSidebar from "../components/DoctorSidebar";
import PasswordInput from "../components/PasswordInput";
import "../styles/DoctorSettings.css"; // Import your new CSS file

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
    <div className="settings-page"> {/* Apply base page layout class */}
      <DoctorSidebar />

      <div className="settings-main-content"> {/* Apply main content class */}
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="settings-page-title" // Apply page title class
        >
          Account Settings
        </motion.h2>

        <div className="settings-card"> {/* Apply settings card class */}
          {message.text && (
            <div
              style={{
                padding: "1rem",
                marginBottom: "1.5rem",
                borderRadius: "0.5rem",
                backgroundColor: message.type === "success" ? "#d1fae5" : "#fee2e2",
                color: message.type === "success" ? "#065f46" : "#991b1b",
                textAlign: "center",
                fontWeight: "600",
              }}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="settings-form"> {/* Apply form class */}

            {/* Profile Picture Section */}
            <div className="profile-picture-section">
              <img
                src={formData.profilePicture}
                alt="Profile"
                className="profile-picture-preview"
              />
              <label htmlFor="profilePictureInput" className="upload-button">
                Upload New Picture
              </label>
              <input
                id="profilePictureInput"
                type="file"
                accept="image/*"
                onChange={handleProfilePictureUpload}
                className="upload-input"
              />
            </div>

            {/* General Information */}
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Specialization</label>
              <input
                type="text"
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <hr className="form-divider" /> {/* Apply divider class */}

            {/* Password Section */}
            <h3 style={{ marginBottom: "1rem", color: "#1e3a8a" }}>Change Password</h3>
            
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <PasswordInput
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                placeholder="Enter current password"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">New Password</label>
              <PasswordInput
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="Enter new password"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <PasswordInput
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm new password"
                className="form-input"
              />
            </div>

            <hr className="form-divider" />

            {/* Notification Preferences */}
            <h3>Notification Preferences</h3>
            <div className="notification-preference">
              <label className="form-label">Email Notifications</label>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  name="emailNotifications"
                  checked={notificationSettings.emailNotifications}
                  onChange={handleNotificationChange}
                />
                <span className="slider"></span>
              </label>
            </div>
            <div className="notification-preference">
              <label className="form-label">SMS Notifications</label>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  name="smsNotifications"
                  checked={notificationSettings.smsNotifications}
                  onChange={handleNotificationChange}
                />
                <span className="slider"></span>
              </label>
            </div>

            <motion.button
              whileHover={{ scale: loading ? 1 : 1.02 }} /* Slightly reduced scale for button */
              type="submit"
              className="save-button" // Apply save button class
              disabled={loading}
              style={{ opacity: loading ? 0.7 : 1, cursor: loading ? "not-allowed" : "pointer" }}
            >
              {loading ? "Saving..." : "Save Changes"}
            </motion.button>
          </form>

          {/* Delete Account Section */}
          <div className="delete-account-section">
            <motion.button
              whileHover={{ scale: 1.02 }}
              onClick={handleDeleteAccount}
              className="delete-account-button"
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