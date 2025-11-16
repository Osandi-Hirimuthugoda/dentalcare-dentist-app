import React, { useState, useEffect } from "react";
import DoctorSidebar from "../components/DoctorSidebar";
import { motion } from "framer-motion";
import { Mail, Phone, Briefcase, Award, Building, Calendar, User } from "lucide-react";
import '../styles/DoctorProfile.css'; 

const DoctorProfile = () => {
  const [doctorData, setDoctorData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get doctor data from localStorage
    const storedDoctor = JSON.parse(localStorage.getItem("doctor") || "{}");
    setDoctorData(storedDoctor);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="doctor-profile-layout">
        <DoctorSidebar />
        <div className="doctor-profile-content">
          <div style={{ textAlign: "center", padding: "3rem" }}>Loading profile...</div>
        </div>
      </div>
    );
  }

  if (!doctorData || !doctorData._id) {
    return (
      <div className="doctor-profile-layout">
        <DoctorSidebar />
        <div className="doctor-profile-content">
          <div style={{ textAlign: "center", padding: "3rem", color: "#ef4444" }}>
            Doctor not found. Please login again.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="doctor-profile-layout">
      <DoctorSidebar />
      <div className="doctor-profile-content">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="doctor-profile-title"
        >
          My Profile
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="profile-details-card"
        >
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <div
              style={{
                width: "120px",
                height: "120px",
                borderRadius: "50%",
                backgroundColor: "#e0f2fe",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "3rem",
                fontWeight: "700",
                color: "#2563eb",
                margin: "0 auto 1rem",
              }}
            >
              {doctorData.fullName?.charAt(0) || "D"}
            </div>
            <h3 style={{ fontSize: "1.5rem", fontWeight: "700", color: "#1e3a8a", marginBottom: "0.5rem" }}>
              {doctorData.fullName || "Doctor"}
            </h3>
            {doctorData.specialization && (
              <p style={{ color: "#6b7280", fontSize: "1rem" }}>{doctorData.specialization}</p>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <Mail size={20} style={{ color: "#6b7280" }} />
              <div>
                <strong style={{ color: "#374151" }}>Email:</strong>
                <p style={{ margin: "0.25rem 0 0 0", color: "#1e3a8a" }}>{doctorData.email || "N/A"}</p>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <Phone size={20} style={{ color: "#6b7280" }} />
              <div>
                <strong style={{ color: "#374151" }}>Phone:</strong>
                <p style={{ margin: "0.25rem 0 0 0", color: "#1e3a8a" }}>{doctorData.phone || "N/A"}</p>
              </div>
            </div>

            {doctorData.specialization && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <Briefcase size={20} style={{ color: "#6b7280" }} />
                <div>
                  <strong style={{ color: "#374151" }}>Specialization:</strong>
                  <p style={{ margin: "0.25rem 0 0 0", color: "#1e3a8a" }}>{doctorData.specialization}</p>
                </div>
              </div>
            )}

            {doctorData.qualifications && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <Award size={20} style={{ color: "#6b7280" }} />
                <div>
                  <strong style={{ color: "#374151" }}>Qualifications:</strong>
                  <p style={{ margin: "0.25rem 0 0 0", color: "#1e3a8a" }}>{doctorData.qualifications}</p>
                </div>
              </div>
            )}

            {doctorData.hospital && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <Building size={20} style={{ color: "#6b7280" }} />
                <div>
                  <strong style={{ color: "#374151" }}>Hospital/Workplace:</strong>
                  <p style={{ margin: "0.25rem 0 0 0", color: "#1e3a8a" }}>{doctorData.hospital}</p>
                </div>
              </div>
            )}

            {doctorData.experience && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <Calendar size={20} style={{ color: "#6b7280" }} />
                <div>
                  <strong style={{ color: "#374151" }}>Experience:</strong>
                  <p style={{ margin: "0.25rem 0 0 0", color: "#1e3a8a" }}>{doctorData.experience} years</p>
                </div>
              </div>
            )}

            {doctorData.licenseNumber && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <User size={20} style={{ color: "#6b7280" }} />
                <div>
                  <strong style={{ color: "#374151" }}>License Number:</strong>
                  <p style={{ margin: "0.25rem 0 0 0", color: "#1e3a8a" }}>{doctorData.licenseNumber}</p>
                </div>
              </div>
            )}

            {doctorData.createdAt && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <Calendar size={20} style={{ color: "#6b7280" }} />
                <div>
                  <strong style={{ color: "#374151" }}>Member Since:</strong>
                  <p style={{ margin: "0.25rem 0 0 0", color: "#1e3a8a" }}>
                    {new Date(doctorData.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DoctorProfile;