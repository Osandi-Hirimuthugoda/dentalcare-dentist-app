import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DoctorSidebar from "../../components/layout/DoctorSidebar";
import { motion } from "framer-motion";
import { 
  CalendarDays, Users, Stethoscope, Mail, Phone, Briefcase, ArrowRight, 
  MessageSquare, Clock, CheckCircle, TrendingUp, FileText, BarChart3, Zap,
  DollarSign, CreditCard, Receipt
} from "lucide-react";
import axios from "axios";

import styles from "../../styles/pages/DoctorDashboard.module.css";
import statCardStyles from "../../styles/components/StatCard.module.css";


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
          <ArrowRight size={20} style={{ color: "#00897B", marginBottom: "0.5rem" }} />
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
  const [paymentStats, setPaymentStats] = useState({
    totalBills: 0,
    paidBills: 0,
    pendingBills: 0,
    totalAmount: 0,
    paidAmount: 0,
    monthlyAmount: 0,
  });
  const [recentPayments, setRecentPayments] = useState([]);
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
        const token = localStorage.getItem('token') || '';

        try {
          // Fetch all data in parallel for faster loading
          const [patientsRes, appointmentsRes, messagesRes, paymentStatsRes] = await Promise.allSettled([
            axios.get(`http://localhost:4000/api/patients/doctor/${doctorId}`),
            axios.get(`http://localhost:4000/api/appointments/doctor/${doctorId}`),
            axios.get(`http://localhost:4000/api/messages/doctor/${doctorId}`, {
              headers: { 'Authorization': `Bearer ${token}` }
            }),
            axios.get(`http://localhost:4000/api/bills/doctor/stats`, {
              headers: { 'Authorization': `Bearer ${token}` }
            })
          ]);

          // Process patients data
          const patientsCount = patientsRes.status === 'fulfilled' ? (patientsRes.value.data.length || 0) : 0;
          const patientsData = patientsRes.status === 'fulfilled' ? patientsRes.value.data : [];

          // Process appointments data
          const appointmentsList = appointmentsRes.status === 'fulfilled' ? (appointmentsRes.value.data || []) : [];
          const appointmentsCount = appointmentsList.length;

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
          
          const newPatientsThisMonth = patientsData.filter(patient => {
            const patientDate = new Date(patient.createdAt);
            return patientDate >= startOfMonth;
          }).length;

          const pendingAppointments = appointmentsList.filter(apt => apt.status === "pending").length;

          setMonthlyStats({
            completedAppointments: completedThisMonth,
            newPatients: newPatientsThisMonth,
            pendingAppointments: pendingAppointments,
          });

          // Process messages data
          let unreadMessagesCount = 0;
          if (messagesRes.status === 'fulfilled') {
            const messagesData = messagesRes.value.data;
            unreadMessagesCount = messagesData.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
            
            // Get recent messages (last 3)
            const recentMessagesList = messagesData
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
          }

          // Process payment statistics
          let paymentData = {
            totalBills: 0,
            paidBills: 0,
            pendingBills: 0,
            totalAmount: 0,
            paidAmount: 0,
            monthlyAmount: 0,
          };

          if (paymentStatsRes.status === 'fulfilled' && paymentStatsRes.value.data) {
            const data = paymentStatsRes.value.data;
            paymentData = {
              totalBills: data.totalBills || 0,
              paidBills: data.paidBills || 0,
              pendingBills: data.pendingBills || 0,
              totalAmount: data.totalAmount || 0,
              paidAmount: data.paidAmount || 0,
              monthlyAmount: data.monthlyAmount || 0,
            };
            setPaymentStats(paymentData);
            
            // Set recent payments
            if (data.recentPayments) {
              setRecentPayments(data.recentPayments.map(payment => ({
                id: payment._id,
                transactionId: payment.transactionId,
                patientName: payment.patient?.name || 'Unknown Patient',
                amount: payment.amount,
                method: payment.paymentMethod,
                status: payment.status,
                date: new Date(payment.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }),
                time: new Date(payment.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
                billNumber: payment.bill?.billNumber,
              })));
            }
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
            { 
              title: "Paid Bills", 
              count: paymentData.paidBills, 
              icon: Receipt, 
              iconClass: statCardStyles.iconGreen,
              linkTo: null
            },
            { 
              title: "Pending Bills", 
              count: paymentData.pendingBills, 
              icon: Clock, 
              iconClass: statCardStyles.iconPurple,
              linkTo: null
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

  if (loading) {
    return (
      <div className={styles.dashboardWrapper}>
        <DoctorSidebar />
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
        <DoctorSidebar />
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
      <DoctorSidebar />

      <div className={styles.mainContentArea}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.mainTitle}>Dashboard</h1>
            <p className={styles.statsGridLabel}>Overview</p>
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
              marginBottom: "0.75rem",
              background: "linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text"
            }}>
              Welcome back, {doctorData?.fullName || "Doctor"}!
            </p>
            {doctorData && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "1.25rem", fontSize: "0.875rem", color: "#6B7280" }}>
                {doctorData.specialization && (
                  <span style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontWeight: "500" }}>
                    <Briefcase size={16} style={{ color: "#2563EB" }} />
                    {doctorData.specialization}
                  </span>
                )}
                {doctorData.email && (
                  <span style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontWeight: "500" }}>
                    <Mail size={16} style={{ color: "#10B981" }} />
                    {doctorData.email}
                  </span>
                )}
                {doctorData.phone && (
                  <span style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontWeight: "500" }}>
                    <Phone size={16} style={{ color: "#8B5CF6" }} />
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
              key={`stat-${item.title}-${index}`}
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

        {/* Payment Statistics Section */}
        {(paymentStats.totalBills > 0 || recentPayments.length > 0) && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className={styles.recentMessagesSection}
            style={{ marginBottom: "2rem" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 className={styles.sectionTitle}>
                <DollarSign size={24} style={{ marginRight: "0.5rem", color: "#10b981" }} />
                Payment Statistics
              </h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
              <div style={{ padding: "1rem", backgroundColor: "#f9fafb", borderRadius: "0.5rem", border: "1px solid #e5e7eb" }}>
                <div style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "0.5rem" }}>Total Amount</div>
                <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#1f2937" }}>
                  LKR {paymentStats.totalAmount?.toLocaleString() || 0}
                </div>
              </div>
              <div style={{ padding: "1rem", backgroundColor: "#f0fdf4", borderRadius: "0.5rem", border: "1px solid #86efac" }}>
                <div style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "0.5rem" }}>Paid Amount</div>
                <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#10b981" }}>
                  LKR {paymentStats.paidAmount?.toLocaleString() || 0}
                </div>
              </div>
              <div style={{ padding: "1rem", backgroundColor: "#fffbeb", borderRadius: "0.5rem", border: "1px solid #fde68a" }}>
                <div style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "0.5rem" }}>Pending Amount</div>
                <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#f59e0b" }}>
                  LKR {paymentStats.pendingAmount?.toLocaleString() || 0}
                </div>
              </div>
              <div style={{ padding: "1rem", backgroundColor: "#eff6ff", borderRadius: "0.5rem", border: "1px solid #93c5fd" }}>
                <div style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "0.5rem" }}>This Month</div>
                <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#2563eb" }}>
                  LKR {paymentStats.monthlyAmount?.toLocaleString() || 0}
                </div>
              </div>
            </div>
            {recentPayments.length > 0 && (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                  <h3 style={{ fontSize: "1rem", fontWeight: "600", color: "#1f2937" }}>Recent Payments</h3>
                </div>
                <div className={styles.messagesList}>
                  {recentPayments.slice(0, 5).map((payment) => (
                    <motion.div
                      key={payment.id}
                      className={styles.messageItem}
                      whileHover={{ backgroundColor: "#f9fafb", paddingLeft: "1rem" }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className={styles.messageHeader}>
                        <div className={styles.patientAvatar} style={{ width: "2rem", height: "2rem", fontSize: "0.9rem", backgroundColor: "#10b981" }}>
                          <DollarSign size={16} style={{ color: "white" }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span className={styles.patientName} style={{ fontSize: "0.95rem" }}>{payment.patientName}</span>
                            <span style={{ fontSize: "0.875rem", fontWeight: "600", color: "#10b981" }}>
                              LKR {payment.amount?.toLocaleString() || 0}
                            </span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.25rem" }}>
                            <p style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                              {payment.billNumber || payment.transactionId} • {payment.method || 'card'}
                            </p>
                            <span style={{ fontSize: "0.75rem", color: "#9ca3af" }}>{payment.date} {payment.time}</span>
                          </div>
                        </div>
                        {payment.status === 'completed' && (
                          <CheckCircle size={20} style={{ color: "#10b981", marginLeft: "0.5rem" }} />
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </motion.section>
        )}

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
                      {(msg.patientName || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span className={styles.patientName} style={{ fontSize: "0.95rem" }}>{msg.patientName || 'Unknown Patient'}</span>
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
                      {(appointment.patientName || 'U').charAt(0).toUpperCase()}
                    </div>
                    <span className={styles.patientName}>{appointment.patientName || 'Unknown Patient'}</span>
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