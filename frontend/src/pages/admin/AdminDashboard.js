import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../components/layout/AdminSidebar";
import { Users, UserPlus, Calendar, Activity, ArrowRight, Shield } from "lucide-react";
import axios from "axios";
import styles from "../../styles/pages/DoctorDashboard.module.css";
import statCardStyles from "../../styles/components/StatCard.module.css";

const API = "http://localhost:4000/api";

const StatCard = ({ title, count, icon: Icon, iconClass, linkTo, navigate: nav }) => (
  <div
    className={statCardStyles.statCard}
    onClick={() => linkTo && nav && nav(linkTo)}
    style={{ cursor: linkTo ? "pointer" : "default" }}
  >
    <div className={statCardStyles.statCardHeader}>
      <h3 className={statCardStyles.statTitle}>{title}</h3>
      <div className={`${statCardStyles.iconBackground} ${iconClass}`}>
        {Icon && <Icon className={statCardStyles.statIcon} />}
      </div>
    </div>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
      <p className={statCardStyles.statCount}>{count}</p>
      {linkTo && <ArrowRight size={20} style={{ color: "#00897B", marginBottom: "0.5rem" }} />}
    </div>
  </div>
);

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [adminName, setAdminName] = useState("Admin");
  const [statsData, setStatsData] = useState([]);
  const [recentDoctors, setRecentDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const adminData = JSON.parse(localStorage.getItem("admin") || "{}");
        if (adminData.email) setAdminName(adminData.email.split("@")[0] || "Admin");

        let doctorsCount = 0, appointmentsCount = 0, recentList = [];

        try {
          const res = await axios.get(`${API}/admins/dashboard/stats`);
          const { stats, recentDoctors: rd } = res.data;
          doctorsCount     = stats.totalDoctors || 0;
          appointmentsCount = stats.totalAppointments || 0;
          recentList       = rd || [];
        } catch {
          try {
            const dr = await axios.get(`${API}/doctors/all`);
            doctorsCount = dr.data.length || 0;
            recentList   = dr.data.slice(0, 5);
          } catch { /* silent */ }
          try {
            const ar = await axios.get(`${API}/appointments`);
            appointmentsCount = ar.data.length || 0;
          } catch { /* silent */ }
        }

        setStatsData([
          { title: "Total Doctors",      count: doctorsCount,      icon: Users,    iconClass: statCardStyles.iconBlue,   linkTo: "/admin/doctors" },
          { title: "Total Appointments", count: appointmentsCount, icon: Calendar, iconClass: statCardStyles.iconGreen,  linkTo: "/admin/appointments" },
          { title: "New Registrations",  count: recentList.length, icon: UserPlus, iconClass: statCardStyles.iconPurple, linkTo: "/admin/doctors" },
          { title: "System Activity",    count: "Active",          icon: Activity, iconClass: statCardStyles.iconBlue,   linkTo: "/admin/activity" },
        ]);
        setRecentDoctors(recentList);
      } catch { /* silent */ }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className={styles.dashboardWrapper}>
      <AdminSidebar />
      <div className={styles.mainContentArea}>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh", flexDirection: "column", gap: "1rem" }}>
          <div style={{ width: 40, height: 40, border: "3px solid #e5e7eb", borderTopColor: "#00897B", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          <p style={{ color: "#6b7280" }}>Loading dashboard...</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className={styles.dashboardWrapper}>
      <AdminSidebar />

      <div className={styles.mainContentArea}>
        {/* Header */}
        <header className={styles.header}>
          <div>
            <h1 className={styles.mainTitle}>Admin Dashboard</h1>
            <p className={styles.statsGridLabel}>System Overview</p>
          </div>
          <div style={{ background: "white", padding: "1.25rem 1.75rem", borderRadius: "1rem", border: "1px solid #f0f0f0", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
            <p style={{ fontSize: "1rem", fontWeight: "700", color: "#111827", marginBottom: "0.25rem" }}>
              Welcome back, {adminName}!
            </p>
            <p style={{ fontSize: "0.8rem", color: "#6b7280", display: "flex", alignItems: "center", gap: "0.3rem" }}>
              <Shield size={13} style={{ color: "#00897B" }} /> System Administrator
            </p>
          </div>
        </header>

        {/* Stats */}
        <section className={styles.statsGrid}>
          {statsData.map((item, i) => (
            <StatCard key={i} title={item.title} count={item.count}
              icon={item.icon} iconClass={item.iconClass} linkTo={item.linkTo} navigate={navigate} />
          ))}
        </section>

        {/* Recent Doctors */}
        <section className={styles.upcomingAppointmentsSection}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h2 className={styles.upcomingAppointmentsTitle}>Recent Doctors</h2>
            <button onClick={() => navigate("/admin/doctors")}
              style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.4rem 0.875rem", background: "#00897B", color: "white", border: "none", borderRadius: "0.5rem", cursor: "pointer", fontSize: "0.8rem", fontWeight: "600" }}>
              View All <ArrowRight size={14} />
            </button>
          </div>

          {recentDoctors.length > 0 ? (
            <div className={styles.appointmentList}>
              {recentDoctors.map((doc, i) => (
                <div key={i} className={styles.appointmentItem} style={{ cursor: "pointer" }} onClick={() => navigate("/admin/doctors")}>
                  <div className={styles.patientInfo}>
                    <div className={styles.patientAvatar}>{(doc.fullName || doc.name || "D").charAt(0).toUpperCase()}</div>
                    <div>
                      <p className={styles.patientName}>{doc.fullName || doc.name || "Unknown Doctor"}</p>
                      {doc.specialization && <p style={{ fontSize: "0.75rem", color: "#9ca3af" }}>{doc.specialization}</p>}
                    </div>
                  </div>
                  <div className={styles.appointmentDetails}>
                    <span style={{ fontSize: "0.8rem", color: "#6b7280" }}>{doc.email || ""}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.noAppointmentsText}>No doctors registered yet.</p>
          )}
        </section>
      </div>
    </div>
  );
}
