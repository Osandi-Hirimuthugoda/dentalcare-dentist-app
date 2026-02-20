import React, { useState, useEffect } from "react";
import DoctorSidebar from "../../components/layout/DoctorSidebar";
import { motion } from "framer-motion";
import { Mail, Phone, Briefcase, Award, Building, Calendar, User } from "lucide-react";
import styles from "../../styles/pages/DoctorPages.module.css";

const DoctorProfile = () => {
  const [doctorData, setDoctorData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedDoctor = JSON.parse(localStorage.getItem("doctor") || "{}");
    setDoctorData(storedDoctor);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className={styles.pageWrapper}>
        <DoctorSidebar />
        <div className={styles.mainContent}>
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
          </div>
        </div>
      </div>
    );
  }

  if (!doctorData || !doctorData._id) {
    return (
      <div className={styles.pageWrapper}>
        <DoctorSidebar />
        <div className={styles.mainContent}>
          <div className={styles.contentCard}>
            <div style={{ textAlign: "center", padding: "2rem", color: "#EF4444" }}>
              Doctor not found. Please login again.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageWrapper}>
      <DoctorSidebar />
      <motion.div
        className={styles.mainContent}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>
            <User size={32} style={{ marginRight: '0.5rem' }} />
            My Profile
          </h1>
          <p className={styles.pageSubtitle}>View your professional information</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            backgroundColor: 'white',
            borderRadius: '1.25rem',
            padding: '2.5rem',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(0, 0, 0, 0.05)'
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <div
              style={{
                width: "140px",
                height: "140px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "4rem",
                fontWeight: "700",
                color: "white",
                margin: "0 auto 1.5rem",
                boxShadow: "0 8px 24px rgba(59, 130, 246, 0.3)"
              }}
            >
              {doctorData.fullName?.charAt(0) || "D"}
            </div>
            <h3 style={{ fontSize: "2rem", fontWeight: "700", color: "#1F2937", marginBottom: "0.75rem" }}>
              {doctorData.fullName || "Doctor"}
            </h3>
            {doctorData.specialization && (
              <p style={{ 
                color: "#6B7280", 
                fontSize: "1.125rem",
                padding: "0.5rem 1.5rem",
                backgroundColor: "#F3F4F6",
                borderRadius: "0.75rem",
                display: "inline-block"
              }}>
                {doctorData.specialization}
              </p>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "1rem",
              padding: "1.25rem",
              backgroundColor: "#F9FAFB",
              borderRadius: "0.875rem",
              border: "1px solid #E5E7EB"
            }}>
              <div style={{
                width: "3rem",
                height: "3rem",
                borderRadius: "0.75rem",
                backgroundColor: "#DBEAFE",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <Mail size={24} style={{ color: "#2563EB" }} />
              </div>
              <div style={{ flex: 1 }}>
                <strong style={{ color: "#6B7280", fontSize: "0.875rem", display: "block", marginBottom: "0.25rem" }}>Email</strong>
                <p style={{ margin: 0, color: "#1F2937", fontSize: "1rem", fontWeight: "500" }}>{doctorData.email || "N/A"}</p>
              </div>
            </div>

            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "1rem",
              padding: "1.25rem",
              backgroundColor: "#F9FAFB",
              borderRadius: "0.875rem",
              border: "1px solid #E5E7EB"
            }}>
              <div style={{
                width: "3rem",
                height: "3rem",
                borderRadius: "0.75rem",
                backgroundColor: "#D1FAE5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <Phone size={24} style={{ color: "#10B981" }} />
              </div>
              <div style={{ flex: 1 }}>
                <strong style={{ color: "#6B7280", fontSize: "0.875rem", display: "block", marginBottom: "0.25rem" }}>Phone</strong>
                <p style={{ margin: 0, color: "#1F2937", fontSize: "1rem", fontWeight: "500" }}>{doctorData.phone || "N/A"}</p>
              </div>
            </div>

            {doctorData.specialization && (
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "1rem",
                padding: "1.25rem",
                backgroundColor: "#F9FAFB",
                borderRadius: "0.875rem",
                border: "1px solid #E5E7EB"
              }}>
                <div style={{
                  width: "3rem",
                  height: "3rem",
                  borderRadius: "0.75rem",
                  backgroundColor: "#E0E7FF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  <Briefcase size={24} style={{ color: "#6366F1" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <strong style={{ color: "#6B7280", fontSize: "0.875rem", display: "block", marginBottom: "0.25rem" }}>Specialization</strong>
                  <p style={{ margin: 0, color: "#1F2937", fontSize: "1rem", fontWeight: "500" }}>{doctorData.specialization}</p>
                </div>
              </div>
            )}

            {doctorData.qualifications && (
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "1rem",
                padding: "1.25rem",
                backgroundColor: "#F9FAFB",
                borderRadius: "0.875rem",
                border: "1px solid #E5E7EB"
              }}>
                <div style={{
                  width: "3rem",
                  height: "3rem",
                  borderRadius: "0.75rem",
                  backgroundColor: "#FEF3C7",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  <Award size={24} style={{ color: "#F59E0B" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <strong style={{ color: "#6B7280", fontSize: "0.875rem", display: "block", marginBottom: "0.25rem" }}>Qualifications</strong>
                  <p style={{ margin: 0, color: "#1F2937", fontSize: "1rem", fontWeight: "500" }}>{doctorData.qualifications}</p>
                </div>
              </div>
            )}

            {doctorData.hospital && (
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "1rem",
                padding: "1.25rem",
                backgroundColor: "#F9FAFB",
                borderRadius: "0.875rem",
                border: "1px solid #E5E7EB"
              }}>
                <div style={{
                  width: "3rem",
                  height: "3rem",
                  borderRadius: "0.75rem",
                  backgroundColor: "#FCE7F3",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  <Building size={24} style={{ color: "#EC4899" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <strong style={{ color: "#6B7280", fontSize: "0.875rem", display: "block", marginBottom: "0.25rem" }}>Hospital/Workplace</strong>
                  <p style={{ margin: 0, color: "#1F2937", fontSize: "1rem", fontWeight: "500" }}>{doctorData.hospital}</p>
                </div>
              </div>
            )}

            {doctorData.experience && (
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "1rem",
                padding: "1.25rem",
                backgroundColor: "#F9FAFB",
                borderRadius: "0.875rem",
                border: "1px solid #E5E7EB"
              }}>
                <div style={{
                  width: "3rem",
                  height: "3rem",
                  borderRadius: "0.75rem",
                  backgroundColor: "#DBEAFE",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  <Calendar size={24} style={{ color: "#3B82F6" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <strong style={{ color: "#6B7280", fontSize: "0.875rem", display: "block", marginBottom: "0.25rem" }}>Experience</strong>
                  <p style={{ margin: 0, color: "#1F2937", fontSize: "1rem", fontWeight: "500" }}>{doctorData.experience} years</p>
                </div>
              </div>
            )}

            {doctorData.licenseNumber && (
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "1rem",
                padding: "1.25rem",
                backgroundColor: "#F9FAFB",
                borderRadius: "0.875rem",
                border: "1px solid #E5E7EB"
              }}>
                <div style={{
                  width: "3rem",
                  height: "3rem",
                  borderRadius: "0.75rem",
                  backgroundColor: "#E0E7FF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  <User size={24} style={{ color: "#6366F1" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <strong style={{ color: "#6B7280", fontSize: "0.875rem", display: "block", marginBottom: "0.25rem" }}>License Number</strong>
                  <p style={{ margin: 0, color: "#1F2937", fontSize: "1rem", fontWeight: "500" }}>{doctorData.licenseNumber}</p>
                </div>
              </div>
            )}

            {doctorData.createdAt && (
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "1rem",
                padding: "1.25rem",
                backgroundColor: "#F9FAFB",
                borderRadius: "0.875rem",
                border: "1px solid #E5E7EB"
              }}>
                <div style={{
                  width: "3rem",
                  height: "3rem",
                  borderRadius: "0.75rem",
                  backgroundColor: "#D1FAE5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  <Calendar size={24} style={{ color: "#10B981" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <strong style={{ color: "#6B7280", fontSize: "0.875rem", display: "block", marginBottom: "0.25rem" }}>Member Since</strong>
                  <p style={{ margin: 0, color: "#1F2937", fontSize: "1rem", fontWeight: "500" }}>
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
      </motion.div>
    </div>
  );
};

export default DoctorProfile;