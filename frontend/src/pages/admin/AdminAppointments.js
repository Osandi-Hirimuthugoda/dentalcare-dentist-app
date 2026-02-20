import React, { useState, useEffect } from "react";
import AdminSidebar from "../../components/layout/AdminSidebar";
import { motion } from "framer-motion";
import { Calendar, Clock, User, Search, Filter, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import axios from "axios";
import styles from "../../styles/pages/DoctorDashboard.module.css";

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    filterAppointments();
  }, [searchTerm, statusFilter, appointments]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:4000/api/appointments");
      setAppointments(response.data || []);
      setFilteredAppointments(response.data || []);
    } catch (err) {
      console.error("Error fetching appointments:", err);
      // Use mock data if API fails
      const mockAppointments = [
        {
          _id: "1",
          patient: { name: "John Doe", email: "john@example.com" },
          doctor: { fullName: "Dr. John Smith", specialization: "Orthodontist" },
          startTime: "2024-05-20T10:00:00Z",
          status: "confirmed",
          notes: "Regular checkup",
        },
        {
          _id: "2",
          patient: { name: "Jane Smith", email: "jane@example.com" },
          doctor: { fullName: "Dr. Sarah Johnson", specialization: "Periodontist" },
          startTime: "2024-05-20T11:30:00Z",
          status: "pending",
          notes: "First visit",
        },
        {
          _id: "3",
          patient: { name: "Bob Wilson", email: "bob@example.com" },
          doctor: { fullName: "Dr. Michael Brown", specialization: "Endodontist" },
          startTime: "2024-05-21T14:00:00Z",
          status: "completed",
          notes: "Root canal treatment",
        },
      ];
      setAppointments(mockAppointments);
      setFilteredAppointments(mockAppointments);
    } finally {
      setLoading(false);
    }
  };

  const filterAppointments = () => {
    let filtered = [...appointments];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (apt) =>
          apt.patient?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          apt.doctor?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          apt.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((apt) => apt.status === statusFilter);
    }

    setFilteredAppointments(filtered);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return { bg: "#d1fae5", text: "#065f46", icon: CheckCircle };
      case "pending":
        return { bg: "#fef3c7", text: "#92400e", icon: AlertCircle };
      case "completed":
        return { bg: "#dbeafe", text: "#1e40af", icon: CheckCircle };
      case "cancelled":
        return { bg: "#fee2e2", text: "#991b1b", icon: XCircle };
      default:
        return { bg: "#f3f4f6", text: "#374151", icon: AlertCircle };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const statusCounts = {
    all: appointments.length,
    pending: appointments.filter((a) => a.status === "pending").length,
    confirmed: appointments.filter((a) => a.status === "confirmed").length,
    completed: appointments.filter((a) => a.status === "completed").length,
    cancelled: appointments.filter((a) => a.status === "cancelled").length,
  };

  if (loading) {
    return (
      <div className={styles.dashboardWrapper}>
        <AdminSidebar />
        <div className={styles.mainContentArea}>
          <div style={{ textAlign: "center", padding: "3rem" }}>Loading appointments...</div>
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
            <h1 className={styles.mainTitle}>Appointments</h1>
            <p className={styles.statsGridLabel}>View and manage all appointments</p>
          </div>
        </header>

        {/* Stats Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1rem",
            marginBottom: "2rem",
          }}
        >
          {[
            { label: "Total", count: statusCounts.all, color: "#3b82f6" },
            { label: "Pending", count: statusCounts.pending, color: "#f59e0b" },
            { label: "Confirmed", count: statusCounts.confirmed, color: "#10b981" },
            { label: "Completed", count: statusCounts.completed, color: "#6366f1" },
            { label: "Cancelled", count: statusCounts.cancelled, color: "#ef4444" },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              style={{
                backgroundColor: "white",
                borderRadius: "1rem",
                padding: "1.5rem",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
                border: "1px solid #e5e7eb",
              }}
            >
              <div style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "0.5rem" }}>
                {stat.label}
              </div>
              <div style={{ fontSize: "2rem", fontWeight: "700", color: stat.color }}>
                {stat.count}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Search and Filter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            backgroundColor: "white",
            borderRadius: "1.25rem",
            padding: "1.5rem",
            boxShadow: "0 10px 20px rgba(0, 0, 0, 0.08), 0 4px 6px rgba(0, 0, 0, 0.04)",
            border: "1px solid #e5e7eb",
            marginBottom: "2rem",
          }}
        >
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ flex: "1", minWidth: "250px", position: "relative" }}>
              <Search
                size={20}
                style={{
                  position: "absolute",
                  left: "0.75rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#9ca3af",
                }}
              />
              <input
                type="text"
                placeholder="Search by patient name, doctor name, or notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.75rem 0.75rem 0.75rem 2.5rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.75rem",
                  fontSize: "1rem",
                  outline: "none",
                }}
              />
            </div>

            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <Filter size={20} style={{ color: "#6b7280" }} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  padding: "0.75rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.75rem",
                  fontSize: "1rem",
                  outline: "none",
                  backgroundColor: "white",
                  cursor: "pointer",
                }}
              >
                <option value="all">All Status ({statusCounts.all})</option>
                <option value="pending">Pending ({statusCounts.pending})</option>
                <option value="confirmed">Confirmed ({statusCounts.confirmed})</option>
                <option value="completed">Completed ({statusCounts.completed})</option>
                <option value="cancelled">Cancelled ({statusCounts.cancelled})</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: "1rem", color: "#6b7280", fontSize: "0.875rem" }}>
            Showing {filteredAppointments.length} of {appointments.length} appointments
          </div>
        </motion.div>

        {/* Appointments List */}
        {filteredAppointments.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {filteredAppointments.map((appointment, index) => {
              const statusStyle = getStatusColor(appointment.status);
              const StatusIcon = statusStyle.icon;

              return (
                <motion.div
                  key={appointment._id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -2, boxShadow: "0 15px 30px rgba(0, 0, 0, 0.12)" }}
                  style={{
                    backgroundColor: "white",
                    borderRadius: "1.25rem",
                    padding: "1.5rem",
                    boxShadow: "0 10px 20px rgba(0, 0, 0, 0.08), 0 4px 6px rgba(0, 0, 0, 0.04)",
                    border: "1px solid #e5e7eb",
                    transition: "all 0.3s ease",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
                    <div style={{ flex: "1", minWidth: "250px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
                        <div
                          style={{
                            width: "3rem",
                            height: "3rem",
                            backgroundColor: "#e0f2fe",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "1.25rem",
                            fontWeight: "600",
                            color: "#2563eb",
                          }}
                        >
                          {appointment.patient?.name?.charAt(0) || "P"}
                        </div>
                        <div>
                          <h3 style={{ fontSize: "1.125rem", fontWeight: "600", color: "#1e3a8a", marginBottom: "0.25rem" }}>
                            {appointment.patient?.name || "Unknown Patient"}
                          </h3>
                          <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                            {appointment.patient?.email || "No email"}
                          </p>
                        </div>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#6b7280" }}>
                          <User size={16} />
                          <span style={{ fontSize: "0.875rem" }}>
                            {appointment.doctor?.fullName || "Unassigned Doctor"}
                            {appointment.doctor?.specialization && ` - ${appointment.doctor.specialization}`}
                          </span>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#6b7280" }}>
                          <Calendar size={16} />
                          <span style={{ fontSize: "0.875rem" }}>{formatDate(appointment.startTime)}</span>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#6b7280" }}>
                          <Clock size={16} />
                          <span style={{ fontSize: "0.875rem" }}>{formatTime(appointment.startTime)}</span>
                        </div>

                        {appointment.notes && (
                          <p style={{ fontSize: "0.875rem", color: "#6b7280", marginTop: "0.5rem", fontStyle: "italic" }}>
                            {appointment.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.5rem" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          backgroundColor: statusStyle.bg,
                          color: statusStyle.text,
                          padding: "0.5rem 1rem",
                          borderRadius: "0.5rem",
                          fontSize: "0.875rem",
                          fontWeight: "600",
                          textTransform: "capitalize",
                        }}
                      >
                        <StatusIcon size={16} />
                        {appointment.status}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "1.25rem",
              padding: "3rem",
              textAlign: "center",
              boxShadow: "0 10px 20px rgba(0, 0, 0, 0.08), 0 4px 6px rgba(0, 0, 0, 0.04)",
              border: "1px solid #e5e7eb",
            }}
          >
            <Calendar size={48} style={{ color: "#9ca3af", marginBottom: "1rem" }} />
            <p style={{ color: "#6b7280", fontSize: "1.125rem" }}>
              No appointments found matching your search criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

