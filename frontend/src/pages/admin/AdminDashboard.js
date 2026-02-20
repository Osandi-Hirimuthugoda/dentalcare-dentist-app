import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../components/layout/AdminSidebar";
import { motion } from "framer-motion";
import { Users, UserPlus, Calendar, Activity, TrendingUp, ArrowRight } from "lucide-react";
import axios from "axios";

import styles from "../../styles/pages/DoctorDashboard.module.css";
import statCardStyles from "../../styles/components/StatCard.module.css";

const StatCard = ({ title, count, icon: IconComponent, iconClass, linkTo, navigate }) => {
  const handleClick = () => {
    if (linkTo && navigate) {
      navigate(linkTo);
    }
  };

  return (
    <motion.div
      className={statCardStyles.statCard}
      whileHover={{ y: -5, scale: 1.02, boxShadow: "0 15px 30px rgba(0, 0, 0, 0.12), 0 6px 10px rgba(0, 0, 0, 0.06)" }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      onClick={handleClick}
      style={{ cursor: linkTo ? "pointer" : "default" }}
    >
      <div className={statCardStyles.statCardHeader}>
        <h3 className={statCardStyles.statTitle}>{title}</h3>
        <div className={`${statCardStyles.iconBackground} ${iconClass}`}>
          {IconComponent && <IconComponent className={statCardStyles.statIcon} />}
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <p className={statCardStyles.statCount}>{count}</p>
        {linkTo && (
          <ArrowRight size={20} style={{ color: "#3b82f6", marginBottom: "0.5rem" }} />
        )}
      </div>
    </motion.div>
  );
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [adminName, setAdminName] = useState("Admin");
  const [statsData, setStatsData] = useState([]);
  const [recentDoctors, setRecentDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get admin info from localStorage
        const adminData = JSON.parse(localStorage.getItem("admin") || "{}");
        if (adminData.email) {
          setAdminName(adminData.email.split("@")[0] || "Admin");
        }

        // Fetch dashboard stats from admin API
        try {
          const statsRes = await axios.get("http://localhost:4000/api/admins/dashboard/stats");
          const { stats, recentDoctors } = statsRes.data;
          
          const statsList = [
            { 
              title: "Total Doctors", 
              count: stats.totalDoctors, 
              icon: Users, 
              iconClass: statCardStyles.iconBlue,
              linkTo: "/admin/doctors"
            },
            { 
              title: "Total Appointments", 
              count: stats.totalAppointments, 
              icon: Calendar, 
              iconClass: statCardStyles.iconGreen,
              linkTo: "/admin/appointments"
            },
            { 
              title: "New Registrations", 
              count: stats.newRegistrations, 
              icon: UserPlus, 
              iconClass: statCardStyles.iconPurple,
              linkTo: "/admin/doctors"
            },
            { 
              title: "Appointments Today", 
              count: stats.appointmentsToday, 
              icon: Activity, 
              iconClass: statCardStyles.iconBlue,
              linkTo: "/admin/appointments"
            },
          ];

          setStatsData(statsList);
          setRecentDoctors(recentDoctors || []);
        } catch (err) {
          console.error("Error fetching dashboard stats:", err);
          // Fallback to individual API calls
          let doctorsCount = 0;
          let appointmentsCount = 0;
          let recentDoctorsList = [];
          
          try {
            const doctorsRes = await axios.get("http://localhost:4000/api/doctors/all");
            doctorsCount = doctorsRes.data.length || 0;
            recentDoctorsList = doctorsRes.data.slice(0, 5) || [];
          } catch (err2) {
            console.log("Doctors endpoint not available");
            doctorsCount = 0;
          }

          try {
            const appointmentsRes = await axios.get("http://localhost:4000/api/appointments");
            appointmentsCount = appointmentsRes.data.length || 0;
          } catch (err2) {
            console.log("Appointments endpoint not available");
            appointmentsCount = 0;
          }

          const mockStats = [
            { 
              title: "Total Doctors", 
              count: doctorsCount, 
              icon: Users, 
              iconClass: statCardStyles.iconBlue,
              linkTo: "/admin/doctors"
            },
            { 
              title: "Total Appointments", 
              count: appointmentsCount, 
              icon: Calendar, 
              iconClass: statCardStyles.iconGreen,
              linkTo: "/admin/appointments"
            },
            { 
              title: "New Registrations", 
              count: 0, 
              icon: UserPlus, 
              iconClass: statCardStyles.iconPurple,
              linkTo: "/admin/doctors"
            },
            { 
              title: "System Activity", 
              count: "98%", 
              icon: Activity, 
              iconClass: statCardStyles.iconBlue,
              linkTo: "/admin/activity"
            },
          ];

          setStatsData(mockStats);
          setRecentDoctors(recentDoctorsList);
        }
      } catch (err) {
        setError("Failed to load dashboard data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className={styles.dashboardWrapper}>
        <AdminSidebar />
        <div className={styles.mainContentArea}>
          <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "60vh",
            flexDirection: "column",
            gap: "1rem"
          }}>
            <div style={{
              width: "48px",
              height: "48px",
              border: "4px solid #E5E7EB",
              borderTopColor: "#2563EB",
              borderRadius: "50%",
              animation: "spin 1s linear infinite"
            }}></div>
            <p style={{ color: "#6B7280", fontSize: "1rem", fontWeight: "500" }}>Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className={styles.dashboardWrapper}>
        <AdminSidebar />
        <div className={styles.mainContentArea}>
          <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "60vh",
            flexDirection: "column",
            gap: "1rem",
            color: "#EF4444"
          }}>
            <p style={{ fontSize: "1.125rem", fontWeight: "600" }}>Error: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboardWrapper}>
      <AdminSidebar />

      <div className={styles.mainContentArea}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.mainTitle}>Admin Dashboard</h1>
            <p className={styles.statsGridLabel}>System Overview</p>
          </div>
          <div style={{ 
            background: "white", 
            padding: "1.25rem 1.75rem", 
            borderRadius: "1rem", 
            border: "1px solid rgba(0, 0, 0, 0.05)",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)"
          }}>
            <p style={{ 
              fontSize: "1.125rem", 
              fontWeight: "700", 
              color: "#1F2937",
              background: "linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text"
            }}>
              Welcome back, {adminName}!
            </p>
            <p style={{ fontSize: "0.875rem", color: "#6B7280", marginTop: "0.25rem", fontWeight: "500" }}>
              System Administrator
            </p>
          </div>
        </header>

        <section className={styles.statsGrid}>
          {statsData.map((item, index) => (
            <StatCard
              key={index}
              title={item.title}
              count={item.count}
              icon={item.icon}
              iconClass={item.iconClass}
              linkTo={item.linkTo}
              navigate={navigate}
            />
          ))}
        </section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={styles.upcomingAppointmentsSection}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h2 className={styles.upcomingAppointmentsTitle}>Recent Doctors</h2>
            <button
              onClick={() => navigate("/admin/doctors")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.5rem 1rem",
                backgroundColor: "#2563eb",
                color: "white",
                border: "none",
                borderRadius: "0.5rem",
                cursor: "pointer",
                fontSize: "0.875rem",
                fontWeight: "600",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#1d4ed8";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#2563eb";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              View All
              <ArrowRight size={16} />
            </button>
          </div>
          {recentDoctors.length > 0 ? (
            <div className={styles.appointmentList}>
              {recentDoctors.map((doctor, index) => (
                <motion.div
                  key={index}
                  className={styles.appointmentItem}
                  whileHover={{ backgroundColor: "#f9fafb", paddingLeft: "1rem" }}
                  transition={{ duration: 0.2 }}
                  style={{ cursor: "pointer" }}
                  onClick={() => navigate("/admin/doctors")}
                >
                  <div className={styles.patientInfo}>
                    <div className={styles.patientAvatar}>
                      {doctor.fullName?.charAt(0) || "D"}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span className={styles.patientName}>{doctor.fullName || doctor.name || "Unknown Doctor"}</span>
                      {doctor.specialization && (
                        <span style={{ fontSize: "0.85rem", color: "#6b7280" }}>{doctor.specialization}</span>
                      )}
                    </div>
                  </div>
                  <div className={styles.appointmentDetails}>
                    <span>{doctor.email || ""}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className={styles.noAppointmentsText}>No doctors registered yet.</p>
          )}
        </motion.section>
      </div>
    </div>
  );
}
