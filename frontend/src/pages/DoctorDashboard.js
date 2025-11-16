import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DoctorSidebar from "../components/DoctorSidebar";
import { motion } from "framer-motion";
import { 
  CalendarDays, Users, Stethoscope, Mail, Phone, Briefcase, ArrowRight, 
  MessageSquare, Clock, CheckCircle, TrendingUp, FileText, BarChart3, Zap
} from "lucide-react";
import axios from "axios";

import styles from "../styles/DoctorDashboard.module.css";
import statCardStyles from "../styles/StatCard.module.css";


const StatCard = ({ title, count, icon: IconComponent, iconClass, onClick, linkTo, navigate }) => {
  const handleClick = () => {
    if (linkTo && navigate) {
      navigate(linkTo);
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <motion.div
      className={statCardStyles.statCard}
      whileHover={{ y: -5, scale: 1.02, boxShadow: "0 15px 30px rgba(0, 0, 0, 0.12), 0 6px 10px rgba(0, 0, 0, 0.06)" }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      onClick={handleClick}
      style={{ cursor: linkTo || onClick ? "pointer" : "default" }}
    >
      <div className={statCardStyles.statCardHeader}>
        <h3 className={statCardStyles.statTitle}>{title}</h3>
        <div className={`${statCardStyles.iconBackground} ${iconClass}`}>
          {IconComponent && <IconComponent className={statCardStyles.statIcon} />}
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <p className={statCardStyles.statCount}>{count}</p>
        {(linkTo || onClick) && (
          <ArrowRight size={20} style={{ color: "#3b82f6", marginBottom: "0.5rem" }} />
        )}
      </div>
    </motion.div>
  );
};

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const [doctorData, setDoctorData] = useState(null);
  const [statsData, setStatsData] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [recentMessages, setRecentMessages] = useState([]);
  const [monthlyStats, setMonthlyStats] = useState({
    completedAppointments: 0,
    newPatients: 0,
    pendingAppointments: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get doctor data from localStorage
        const storedDoctor = JSON.parse(localStorage.getItem("doctor") || "{}");
        setDoctorData(storedDoctor);
        
        if (!storedDoctor._id) {
          setError("Doctor not found. Please login again.");
          setLoading(false);
          return;
        }

        const doctorId = storedDoctor._id;

        // Fetch real data from API
        let patientsCount = 0;
        let appointmentsCount = 0;
        let appointmentsList = [];

        try {
          // Get patients who selected this doctor
          const patientsRes = await axios.get(`http://localhost:4000/api/patients/doctor/${doctorId}`);
          patientsCount = patientsRes.data.length || 0;

          // Get appointments for this doctor
          const appointmentsRes = await axios.get(`http://localhost:4000/api/appointments/doctor/${doctorId}`);
          appointmentsList = appointmentsRes.data || [];
          appointmentsCount = appointmentsList.length || 0;

          // Get today's appointments
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const todayAppointments = appointmentsList.filter(apt => {
            const aptDate = new Date(apt.startTime);
            return aptDate >= today && apt.status !== "completed" && apt.status !== "cancelled";
          });

          // Calculate monthly statistics
          const now = new Date();
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          const completedThisMonth = appointmentsList.filter(apt => {
            const aptDate = new Date(apt.startTime);
            return aptDate >= startOfMonth && apt.status === "completed";
          }).length;
          
          const newPatientsThisMonth = patientsRes.data.filter(patient => {
            const patientDate = new Date(patient.createdAt);
            return patientDate >= startOfMonth;
          }).length;

          const pendingAppointments = appointmentsList.filter(apt => apt.status === "pending").length;

          setMonthlyStats({
            completedAppointments: completedThisMonth,
            newPatients: newPatientsThisMonth,
            pendingAppointments: pendingAppointments,
          });

          // Get unread messages count
          let unreadMessagesCount = 0;
          try {
            const messagesRes = await axios.get(`http://localhost:4000/api/messages/doctor/${doctorId}`);
            unreadMessagesCount = messagesRes.data.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
            
            // Get recent messages (last 3)
            const recentMessagesList = messagesRes.data
              .slice(0, 3)
              .map(conv => ({
                id: conv.patientId,
                patientName: conv.patientName,
                message: conv.lastMessage,
                time: new Date(conv.lastMessageTime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
                unread: conv.unreadCount > 0,
                unreadCount: conv.unreadCount,
              }));
            setRecentMessages(recentMessagesList);
          } catch (msgErr) {
            console.error("Error fetching messages:", msgErr);
          }

          setStatsData([
            { 
              title: "Total Patients", 
              count: patientsCount, 
              icon: Users, 
              iconClass: statCardStyles.iconBlue,
              linkTo: "/doctor/patients"
            },
            { 
              title: "Upcoming Appointments", 
              count: appointmentsCount, 
              icon: CalendarDays, 
              iconClass: statCardStyles.iconGreen,
              linkTo: "/doctor/appointments"
            },
            { 
              title: "Consultations Today", 
              count: todayAppointments.length, 
              icon: Stethoscope, 
              iconClass: statCardStyles.iconPurple,
              linkTo: "/doctor/appointments"
            },
            { 
              title: "Unread Messages", 
              count: unreadMessagesCount, 
              icon: MessageSquare, 
              iconClass: statCardStyles.iconBlue,
              linkTo: "/doctor/messages"
            },
            { 
              title: "Completed This Month", 
              count: completedThisMonth, 
              icon: CheckCircle, 
              iconClass: statCardStyles.iconGreen,
              linkTo: "/doctor/appointments"
            },
            { 
              title: "New Patients (Month)", 
              count: newPatientsThisMonth, 
              icon: TrendingUp, 
              iconClass: statCardStyles.iconPurple,
              linkTo: "/doctor/patients"
            },
          ]);

          // Format appointments for display
          const formattedAppointments = appointmentsList
            .filter(apt => {
              const aptDate = new Date(apt.startTime);
              return aptDate >= today && apt.status !== "completed" && apt.status !== "cancelled";
            })
            .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
            .slice(0, 5)
            .map(apt => ({
              id: apt._id,
              patientName: apt.patient?.name || "Unknown Patient",
              time: new Date(apt.startTime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
              date: new Date(apt.startTime).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }),
              status: apt.status,
            }));

          setUpcomingAppointments(formattedAppointments);
        } catch (err) {
          console.error("Error fetching data:", err);
          // Use mock data if API fails
          setStatsData([
            { title: "Total Patients", count: 0, icon: Users, iconClass: statCardStyles.iconBlue, linkTo: "/doctor/patients" },
            { title: "Upcoming Appointments", count: 0, icon: CalendarDays, iconClass: statCardStyles.iconGreen, linkTo: "/doctor/appointments" },
            { title: "Consultations Today", count: 0, icon: Stethoscope, iconClass: statCardStyles.iconPurple, linkTo: "/doctor/appointments" },
            { title: "Unread Messages", count: 0, icon: MessageSquare, iconClass: statCardStyles.iconBlue, linkTo: "/doctor/messages" },
            { title: "Completed This Month", count: 0, icon: CheckCircle, iconClass: statCardStyles.iconGreen, linkTo: "/doctor/appointments" },
            { title: "New Patients (Month)", count: 0, icon: TrendingUp, iconClass: statCardStyles.iconPurple, linkTo: "/doctor/patients" },
          ]);
          setUpcomingAppointments([]);
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

  if (loading) return <div className={styles.dashboardWrapper}>Loading dashboard...</div>;
  if (error) return <div className={styles.dashboardWrapper} style={{ color: 'red' }}>Error: {error}</div>;

  return (
    <div className={styles.dashboardWrapper}>
      <DoctorSidebar />

      <div className={styles.mainContentArea}>
        <header className={styles.header}>
          <div className={styles.titleGroup}>
            <h1 className={styles.mainTitle}>Dashboard</h1>
            <p className={styles.statsGridLabel}>Stats Grid</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.5rem" }}>
            <p className={styles.welcomeMessage}>
              Welcome back, <span>{doctorData?.fullName || "Doctor"}!</span>
            </p>
            {doctorData && (
              <div style={{ display: "flex", gap: "1rem", fontSize: "0.875rem", color: "#6b7280" }}>
                {doctorData.specialization && (
                  <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                    <Briefcase size={14} />
                    {doctorData.specialization}
                  </span>
                )}
                {doctorData.email && (
                  <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                    <Mail size={14} />
                    {doctorData.email}
                  </span>
                )}
                {doctorData.phone && (
                  <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                    <Phone size={14} />
                    {doctorData.phone}
                  </span>
                )}
              </div>
            )}
          </div>
        </header>

        <section className={styles.statsGrid}>
          {statsData.map((item, index) => (
            <StatCard
              key={index}
              title={item.title}
              count={item.count.toLocaleString()}
              icon={item.icon}
              iconClass={item.iconClass}
              linkTo={item.linkTo}
              navigate={navigate}
            />
          ))}
        </section>

        {/* Quick Actions and Recent Activity Section */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
          {/* Quick Actions */}
          <motion.section
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className={styles.quickActionsSection}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 className={styles.sectionTitle}>
                <Zap size={24} style={{ marginRight: "0.5rem", color: "#f59e0b" }} />
                Quick Actions
              </h2>
            </div>
            <div className={styles.quickActionsGrid}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/doctor/appointments")}
                className={styles.quickActionButton}
                style={{ backgroundColor: "#3b82f6" }}
              >
                <CalendarDays size={20} />
                <span>View Appointments</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/doctor/patients")}
                className={styles.quickActionButton}
                style={{ backgroundColor: "#10b981" }}
              >
                <Users size={20} />
                <span>Manage Patients</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/doctor/messages")}
                className={styles.quickActionButton}
                style={{ backgroundColor: "#8b5cf6" }}
              >
                <MessageSquare size={20} />
                <span>Messages</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/doctor/reports")}
                className={styles.quickActionButton}
                style={{ backgroundColor: "#ef4444" }}
              >
                <FileText size={20} />
                <span>View Reports</span>
              </motion.button>
            </div>
          </motion.section>

          {/* Monthly Statistics */}
          <motion.section
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className={styles.monthlyStatsSection}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 className={styles.sectionTitle}>
                <BarChart3 size={24} style={{ marginRight: "0.5rem", color: "#10b981" }} />
                This Month
              </h2>
            </div>
            <div className={styles.monthlyStatsList}>
              <div className={styles.monthlyStatItem}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <CheckCircle size={20} style={{ color: "#10b981" }} />
                  <span>Completed Appointments</span>
                </div>
                <span className={styles.monthlyStatValue}>{monthlyStats.completedAppointments}</span>
              </div>
              <div className={styles.monthlyStatItem}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <TrendingUp size={20} style={{ color: "#3b82f6" }} />
                  <span>New Patients</span>
                </div>
                <span className={styles.monthlyStatValue}>{monthlyStats.newPatients}</span>
              </div>
              <div className={styles.monthlyStatItem}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <Clock size={20} style={{ color: "#f59e0b" }} />
                  <span>Pending Appointments</span>
                </div>
                <span className={styles.monthlyStatValue}>{monthlyStats.pendingAppointments}</span>
              </div>
            </div>
          </motion.section>
        </div>

        {/* Recent Messages Section */}
        {recentMessages.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className={styles.recentMessagesSection}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 className={styles.sectionTitle}>
                <MessageSquare size={24} style={{ marginRight: "0.5rem", color: "#8b5cf6" }} />
                Recent Messages
              </h2>
              <button
                onClick={() => navigate("/doctor/messages")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.5rem 1rem",
                  backgroundColor: "transparent",
                  color: "#8b5cf6",
                  border: "1px solid #8b5cf6",
                  borderRadius: "0.5rem",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                  fontWeight: "600",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#8b5cf6";
                  e.currentTarget.style.color = "white";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "#8b5cf6";
                }}
              >
                View All
                <ArrowRight size={16} />
              </button>
            </div>
            <div className={styles.messagesList}>
              {recentMessages.map((msg) => (
                <motion.div
                  key={msg.id}
                  className={styles.messageItem}
                  whileHover={{ backgroundColor: "#f9fafb", paddingLeft: "1rem" }}
                  transition={{ duration: 0.2 }}
                  style={{ cursor: "pointer" }}
                  onClick={() => navigate("/doctor/messages")}
                >
                  <div className={styles.messageHeader}>
                    <div className={styles.patientAvatar} style={{ width: "2rem", height: "2rem", fontSize: "0.9rem" }}>
                      {msg.patientName.charAt(0)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span className={styles.patientName} style={{ fontSize: "0.95rem" }}>{msg.patientName}</span>
                        <span style={{ fontSize: "0.75rem", color: "#9ca3af" }}>{msg.time}</span>
                      </div>
                      <p style={{ fontSize: "0.875rem", color: "#6b7280", marginTop: "0.25rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {msg.message}
                      </p>
                    </div>
                    {msg.unread && (
                      <div style={{
                        width: "0.5rem",
                        height: "0.5rem",
                        borderRadius: "50%",
                        backgroundColor: "#8b5cf6",
                        marginLeft: "0.5rem"
                      }} />
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Upcoming Appointments Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={styles.upcomingAppointmentsSection}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h2 className={styles.upcomingAppointmentsTitle}>Upcoming Appointments</h2>
            <button
              onClick={() => navigate("/doctor/appointments")}
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
          {upcomingAppointments.length > 0 ? (
            <div className={styles.appointmentList}>
              {upcomingAppointments.map((appointment) => (
                <motion.div
                  key={appointment.id}
                  className={styles.appointmentItem}
                  whileHover={{ backgroundColor: "#f9fafb", paddingLeft: "1rem" }}
                  transition={{ duration: 0.2 }}
                  style={{ cursor: "pointer" }}
                  onClick={() => navigate("/doctor/appointments")}
                >
                  <div className={styles.patientInfo}>
                    <div className={styles.patientAvatar}>
                      {appointment.patientName.charAt(0)}
                    </div>
                    <span className={styles.patientName}>{appointment.patientName}</span>
                  </div>
                  <div className={styles.appointmentDetails}>
                    <span>{appointment.time}</span>
                    <span>{appointment.date}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className={styles.noAppointmentsText}>No upcoming appointments for today. 🎉</p>
          )}
        </motion.section>
      </div>
    </div>
  );
}