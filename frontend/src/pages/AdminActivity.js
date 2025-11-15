import React, { useState, useEffect } from "react";
import AdminSidebar from "../components/AdminSidebar";
import { motion } from "framer-motion";
import { Activity, TrendingUp, Users, Calendar, Clock } from "lucide-react";
import axios from "axios";
import styles from "../styles/DoctorDashboard.module.css";

export default function AdminActivity() {
  const [activityData, setActivityData] = useState({
    recentRegistrations: [],
    systemStats: {},
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivityData();
  }, []);

  const fetchActivityData = async () => {
    try {
      setLoading(true);
      
      // Fetch system activity from admin API
      try {
        const activityRes = await axios.get("http://localhost:4000/api/admins/activity");
        const { recentRegistrations, systemStats } = activityRes.data;
        
        setActivityData({
          recentRegistrations: recentRegistrations || [],
          systemStats: systemStats || {},
        });
      } catch (err) {
        console.error("Error fetching activity data:", err);
        // Fallback to individual API calls
        let recentDoctors = [];
        try {
          const doctorsRes = await axios.get("http://localhost:4000/api/doctors/all");
          recentDoctors = (doctorsRes.data || []).slice(0, 5);
        } catch (err2) {
          recentDoctors = [];
        }

        const stats = {
          totalDoctors: 0,
          totalAppointments: 0,
          activeToday: 0,
          systemUptime: "99.9%",
        };

        setActivityData({
          recentRegistrations: recentDoctors,
          systemStats: stats,
        });
      }
    } catch (err) {
      console.error("Error fetching activity data:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className={styles.dashboardWrapper}>
        <AdminSidebar />
        <div className={styles.mainContentArea}>
          <div style={{ textAlign: "center", padding: "3rem" }}>Loading activity...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboardWrapper}>
      <AdminSidebar />

      <div className={styles.mainContentArea}>
        <header className={styles.header}>
          <div className={styles.titleGroup}>
            <h1 className={styles.mainTitle}>System Activity</h1>
            <p className={styles.statsGridLabel}>Monitor system performance and recent activity</p>
          </div>
        </header>

        {/* System Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "1.5rem",
            marginBottom: "2rem",
          }}
        >
          {[
            { label: "Total Doctors", value: activityData.systemStats.totalDoctors, icon: Users, color: "#3b82f6" },
            { label: "Total Appointments", value: activityData.systemStats.totalAppointments, icon: Calendar, color: "#10b981" },
            { label: "Active Today", value: activityData.systemStats.activeToday, icon: Activity, color: "#f59e0b" },
            { label: "System Uptime", value: activityData.systemStats.systemUptime, icon: TrendingUp, color: "#8b5cf6" },
          ].map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5, boxShadow: "0 15px 30px rgba(0, 0, 0, 0.12)" }}
                style={{
                  backgroundColor: "white",
                  borderRadius: "1.25rem",
                  padding: "1.5rem",
                  boxShadow: "0 10px 20px rgba(0, 0, 0, 0.08), 0 4px 6px rgba(0, 0, 0, 0.04)",
                  border: "1px solid #e5e7eb",
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                }}
              >
                <div
                  style={{
                    backgroundColor: `${stat.color}20`,
                    padding: "1rem",
                    borderRadius: "0.75rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <IconComponent size={24} style={{ color: stat.color }} />
                </div>
                <div>
                  <div style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "0.25rem" }}>
                    {stat.label}
                  </div>
                  <div style={{ fontSize: "1.75rem", fontWeight: "700", color: stat.color }}>
                    {stat.value}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            backgroundColor: "white",
            borderRadius: "1.25rem",
            padding: "2rem",
            boxShadow: "0 10px 20px rgba(0, 0, 0, 0.08), 0 4px 6px rgba(0, 0, 0, 0.04)",
            border: "1px solid #e5e7eb",
          }}
        >
          <h2 style={{ fontSize: "1.5rem", fontWeight: "700", color: "#1e3a8a", marginBottom: "1.5rem" }}>
            Recent Doctor Registrations
          </h2>

          {activityData.recentRegistrations.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {activityData.recentRegistrations.map((doctor, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "1rem",
                    backgroundColor: "#f9fafb",
                    borderRadius: "0.75rem",
                    border: "1px solid #e5e7eb",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <div
                      style={{
                        width: "2.5rem",
                        height: "2.5rem",
                        backgroundColor: "#e0f2fe",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.125rem",
                        fontWeight: "600",
                        color: "#2563eb",
                      }}
                    >
                      {doctor.fullName?.charAt(0) || "D"}
                    </div>
                    <div>
                      <div style={{ fontSize: "1rem", fontWeight: "600", color: "#1e3a8a" }}>
                        {doctor.fullName || "Unknown Doctor"}
                      </div>
                      <div style={{ fontSize: "0.875rem", color: "#6b7280", display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.25rem" }}>
                        <Clock size={14} />
                        {formatDate(doctor.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: "#6b7280", textAlign: "center", padding: "2rem" }}>
              No recent registrations
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}

