import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DoctorSidebar from "../../components/layout/DoctorSidebar";
import {
  CalendarDays, Users, Stethoscope, MessageSquare, Clock,
  CheckCircle, TrendingUp, FileText, BarChart3, Zap,
  DollarSign, ArrowRight, Briefcase, Mail, Phone, Receipt,
} from "lucide-react";
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

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const [doctorData, setDoctorData] = useState(null);
  const [statsData, setStatsData] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [recentMessages, setRecentMessages] = useState([]);
  const [monthlyStats, setMonthlyStats] = useState({ completedAppointments: 0, newPatients: 0, pendingAppointments: 0 });
  const [paymentStats, setPaymentStats] = useState({ totalBills: 0, paidBills: 0, pendingBills: 0, totalAmount: 0, paidAmount: 0, monthlyAmount: 0 });
  const [recentPayments, setRecentPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const storedDoctor = JSON.parse(localStorage.getItem("doctor") || "{}");
        setDoctorData(storedDoctor);
        if (!storedDoctor._id) { setError("Doctor not found. Please login again."); setLoading(false); return; }

        const doctorId = storedDoctor._id;
        const token = localStorage.getItem("token") || "";

        const [patientsRes, appointmentsRes, messagesRes, paymentStatsRes] = await Promise.allSettled([
          axios.get(`${API}/patients/doctor/${doctorId}`),
          axios.get(`${API}/appointments/doctor/${doctorId}`),
          axios.get(`${API}/messages/doctor/${doctorId}`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API}/bills/doctor/stats`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        const patientsData = patientsRes.status === "fulfilled" ? patientsRes.value.data : [];
        const patientsCount = patientsData.length;
        const appointmentsList = appointmentsRes.status === "fulfilled" ? appointmentsRes.value.data || [] : [];

        const today = new Date(); today.setHours(0, 0, 0, 0);
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const todayApts = appointmentsList.filter(a => new Date(a.startTime) >= today && a.status !== "completed" && a.status !== "cancelled");
        const completedThisMonth = appointmentsList.filter(a => new Date(a.startTime) >= startOfMonth && a.status === "completed").length;
        const newPatientsThisMonth = patientsData.filter(p => new Date(p.createdAt) >= startOfMonth).length;
        const pendingApts = appointmentsList.filter(a => a.status === "pending").length;

        setMonthlyStats({ completedAppointments: completedThisMonth, newPatients: newPatientsThisMonth, pendingAppointments: pendingApts });

        let unreadCount = 0;
        if (messagesRes.status === "fulfilled") {
          const msgs = messagesRes.value.data || [];
          unreadCount = msgs.reduce((s, c) => s + (c.unreadCount || 0), 0);
          setRecentMessages(msgs.slice(0, 3).map(c => ({
            id: c.patientId, patientName: c.name || c.patientName,
            message: c.lastMessage,
            time: new Date(c.lastMessageTime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
            unread: c.unreadCount > 0,
          })));
        }

        let paymentData = { totalBills: 0, paidBills: 0, pendingBills: 0, totalAmount: 0, paidAmount: 0, monthlyAmount: 0 };
        if (paymentStatsRes.status === "fulfilled" && paymentStatsRes.value.data) {
          const d = paymentStatsRes.value.data;
          paymentData = { totalBills: d.totalBills || 0, paidBills: d.paidBills || 0, pendingBills: d.pendingBills || 0, totalAmount: d.totalAmount || 0, paidAmount: d.paidAmount || 0, monthlyAmount: d.monthlyAmount || 0 };
          setPaymentStats(paymentData);
          if (d.recentPayments) {
            setRecentPayments(d.recentPayments.map(p => ({
              id: p._id, patientName: p.patient?.name || "Unknown", amount: p.amount,
              method: p.paymentMethod, status: p.status,
              date: new Date(p.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }),
              time: new Date(p.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
              billNumber: p.bill?.billNumber,
            })));
          }
        }

        setStatsData([
          { title: "Total Patients",        count: patientsCount,          icon: Users,         iconClass: statCardStyles.iconBlue,   linkTo: "/doctor/patients" },
          { title: "Appointments",           count: appointmentsList.length, icon: CalendarDays,  iconClass: statCardStyles.iconGreen,  linkTo: "/doctor/appointments" },
          { title: "Consultations Today",    count: todayApts.length,       icon: Stethoscope,   iconClass: statCardStyles.iconPurple, linkTo: "/doctor/appointments" },
          { title: "Unread Messages",        count: unreadCount,            icon: MessageSquare, iconClass: statCardStyles.iconBlue,   linkTo: "/doctor/messages" },
        ]);

        setUpcomingAppointments(
          appointmentsList
            .filter(a => new Date(a.startTime) >= today && a.status !== "completed" && a.status !== "cancelled")
            .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
            .slice(0, 5)
            .map(a => ({
              id: a._id, patientName: a.patient?.name || "Unknown",
              time: new Date(a.startTime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
              date: new Date(a.startTime).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }),
              status: a.status,
            }))
        );
      } catch (err) {
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className={styles.dashboardWrapper}>
      <DoctorSidebar />
      <div className={styles.mainContentArea}>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh", flexDirection: "column", gap: "1rem" }}>
          <div style={{ width: 40, height: 40, border: "3px solid #e5e7eb", borderTopColor: "#00897B", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          <p style={{ color: "#6b7280" }}>Loading dashboard...</p>
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div className={styles.dashboardWrapper}>
      <DoctorSidebar />
      <div className={styles.mainContentArea}>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh", color: "#ef4444" }}>
          <p>{error}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className={styles.dashboardWrapper}>
      <DoctorSidebar />
      <div className={styles.mainContentArea}>

        {/* Header */}
        <header className={styles.header}>
          <div>
            <h1 className={styles.mainTitle}>Dashboard</h1>
            <p className={styles.statsGridLabel}>Overview</p>
          </div>
          <div style={{ background: "white", padding: "1.25rem 1.75rem", borderRadius: "1rem", border: "1px solid #f0f0f0", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
            <p style={{ fontSize: "1rem", fontWeight: "700", color: "#111827", marginBottom: "0.5rem" }}>
              Welcome back, {doctorData?.fullName || "Doctor"}!
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", fontSize: "0.8rem", color: "#6b7280" }}>
              {doctorData?.specialization && <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}><Briefcase size={13} style={{ color: "#00897B" }} />{doctorData.specialization}</span>}
              {doctorData?.email && <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}><Mail size={13} style={{ color: "#10b981" }} />{doctorData.email}</span>}
              {doctorData?.phone && <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}><Phone size={13} style={{ color: "#8b5cf6" }} />{doctorData.phone}</span>}
            </div>
          </div>
        </header>

        {/* Stats */}
        <section className={styles.statsGrid}>
          {statsData.map((item, i) => (
            <StatCard key={i} title={item.title} count={item.count.toLocaleString()}
              icon={item.icon} iconClass={item.iconClass} linkTo={item.linkTo} navigate={navigate} />
          ))}
        </section>

        {/* Quick Actions + Monthly Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
          <section className={styles.quickActionsSection}>
            <h2 className={styles.sectionTitle} style={{ marginBottom: "1.25rem" }}>
              <Zap size={20} style={{ marginRight: "0.4rem", color: "#f59e0b" }} /> Quick Actions
            </h2>
            <div className={styles.quickActionsGrid}>
              {[
                { label: "Appointments", icon: CalendarDays, color: "#3b82f6", path: "/doctor/appointments" },
                { label: "Patients",     icon: Users,        color: "#10b981", path: "/doctor/patients" },
                { label: "Messages",     icon: MessageSquare,color: "#8b5cf6", path: "/doctor/messages" },
                { label: "Reports",      icon: FileText,     color: "#ef4444", path: "/doctor/reports" },
              ].map(({ label, icon: Icon, color, path }) => (
                <button key={label} onClick={() => navigate(path)}
                  className={styles.quickActionButton} style={{ backgroundColor: color }}>
                  <Icon size={18} /><span>{label}</span>
                </button>
              ))}
            </div>
          </section>

          <section className={styles.monthlyStatsSection}>
            <h2 className={styles.sectionTitle} style={{ marginBottom: "1.25rem" }}>
              <BarChart3 size={20} style={{ marginRight: "0.4rem", color: "#10b981" }} /> This Month
            </h2>
            <div className={styles.monthlyStatsList}>
              {[
                { label: "Completed Appointments", value: monthlyStats.completedAppointments, icon: CheckCircle, color: "#10b981" },
                { label: "New Patients",            value: monthlyStats.newPatients,           icon: TrendingUp,  color: "#3b82f6" },
                { label: "Pending Appointments",    value: monthlyStats.pendingAppointments,   icon: Clock,       color: "#f59e0b" },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className={styles.monthlyStatItem}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                    <Icon size={18} style={{ color }} /><span>{label}</span>
                  </div>
                  <span className={styles.monthlyStatValue}>{value}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Recent Messages */}
        {recentMessages.length > 0 && (
          <section className={styles.recentMessagesSection} style={{ marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
              <h2 className={styles.sectionTitle}>
                <MessageSquare size={20} style={{ marginRight: "0.4rem", color: "#8b5cf6" }} /> Recent Messages
              </h2>
              <button onClick={() => navigate("/doctor/messages")}
                style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.4rem 0.875rem", background: "transparent", color: "#8b5cf6", border: "1px solid #8b5cf6", borderRadius: "0.5rem", cursor: "pointer", fontSize: "0.8rem", fontWeight: "600" }}>
                View All <ArrowRight size={14} />
              </button>
            </div>
            <div className={styles.messagesList}>
              {recentMessages.map(msg => (
                <div key={msg.id} className={styles.messageItem} style={{ cursor: "pointer" }} onClick={() => navigate("/doctor/messages")}>
                  <div className={styles.messageHeader}>
                    <div className={styles.patientAvatar}>{(msg.patientName || "U").charAt(0).toUpperCase()}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span className={styles.patientName}>{msg.patientName || "Unknown"}</span>
                        <span style={{ fontSize: "0.75rem", color: "#9ca3af" }}>{msg.time}</span>
                      </div>
                      <p style={{ fontSize: "0.8rem", color: "#6b7280", margin: "2px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{msg.message}</p>
                    </div>
                    {msg.unread && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#8b5cf6", marginLeft: "0.5rem", flexShrink: 0 }} />}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Upcoming Appointments */}
        <section className={styles.upcomingAppointmentsSection}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h2 className={styles.upcomingAppointmentsTitle}>Upcoming Appointments</h2>
            <button onClick={() => navigate("/doctor/appointments")}
              style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.4rem 0.875rem", background: "#00897B", color: "white", border: "none", borderRadius: "0.5rem", cursor: "pointer", fontSize: "0.8rem", fontWeight: "600" }}>
              View All <ArrowRight size={14} />
            </button>
          </div>
          {upcomingAppointments.length > 0 ? (
            <div className={styles.appointmentList}>
              {upcomingAppointments.map(apt => (
                <div key={apt.id} className={styles.appointmentItem} onClick={() => navigate("/doctor/appointments")} style={{ cursor: "pointer" }}>
                  <div className={styles.patientInfo}>
                    <div className={styles.patientAvatar}>{(apt.patientName || "P").charAt(0).toUpperCase()}</div>
                    <div>
                      <p className={styles.patientName}>{apt.patientName}</p>
                      <p style={{ fontSize: "0.75rem", color: "#9ca3af" }}>{apt.date}</p>
                    </div>
                  </div>
                  <div className={styles.appointmentDetails}>
                    <span>{apt.time}</span>
                    <span style={{ fontSize: "0.72rem", padding: "2px 8px", borderRadius: "20px", background: apt.status === "confirmed" ? "#f0fdf4" : "#fffbeb", color: apt.status === "confirmed" ? "#15803d" : "#b45309", fontWeight: 600, textTransform: "capitalize" }}>{apt.status}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.noAppointmentsText}>No upcoming appointments for today.</p>
          )}
        </section>

      </div>
    </div>
  );
}
