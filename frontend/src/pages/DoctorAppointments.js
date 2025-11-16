import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { Calendar, Clock, User, Mail, Phone, Search, Filter, CheckCircle, XCircle, AlertCircle, Edit, Save, X, FileText } from "lucide-react";
import DoctorSidebar from "../components/DoctorSidebar";
import "../styles/DoctorAppointments.css";

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [error, setError] = useState(null);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [editNotes, setEditNotes] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    filterAppointments();
  }, [searchTerm, statusFilter, appointments]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const doctorData = JSON.parse(localStorage.getItem("doctor") || "{}");
      
      if (!doctorData._id) {
        setError("Doctor not found. Please login again.");
        setLoading(false);
        return;
      }

      const response = await axios.get(`http://localhost:4000/api/appointments/doctor/${doctorData._id}`);
      setAppointments(response.data || []);
      setFilteredAppointments(response.data || []);
    } catch (err) {
      console.error("Error fetching appointments:", err);
      setError("Failed to load appointments. Please try again.");
      setAppointments([]);
      setFilteredAppointments([]);
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
          apt.patient?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          apt.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((apt) => apt.status === statusFilter);
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));

    setFilteredAppointments(filtered);
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

  const statusCounts = {
    all: appointments.length,
    pending: appointments.filter((a) => a.status === "pending").length,
    confirmed: appointments.filter((a) => a.status === "confirmed").length,
    completed: appointments.filter((a) => a.status === "completed").length,
    cancelled: appointments.filter((a) => a.status === "cancelled").length,
  };

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      setUpdatingStatus(appointmentId);
      const response = await axios.put(
        `http://localhost:4000/api/appointments/${appointmentId}`,
        { status: newStatus }
      );

      if (response.data) {
        setMessage({ type: "success", text: "Appointment status updated successfully!" });
        await fetchAppointments();
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to update status. Please try again.",
      });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleEditNotes = (appointment) => {
    setEditingAppointment(appointment._id);
    setEditNotes(appointment.notes || "");
  };

  const handleSaveNotes = async (appointmentId) => {
    try {
      setUpdatingStatus(appointmentId);
      const response = await axios.put(
        `http://localhost:4000/api/appointments/${appointmentId}`,
        { notes: editNotes }
      );

      if (response.data) {
        setMessage({ type: "success", text: "Notes updated successfully!" });
        setEditingAppointment(null);
        setEditNotes("");
        await fetchAppointments();
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to update notes. Please try again.",
      });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingAppointment(null);
    setEditNotes("");
  };

  if (loading) {
    return (
      <div className="doctor-appointments-page">
        <DoctorSidebar />
        <div className="main-content">
          <div style={{ textAlign: "center", padding: "3rem" }}>Loading appointments...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="doctor-appointments-page">
        <DoctorSidebar />
        <div className="main-content">
          <div style={{ textAlign: "center", padding: "3rem", color: "#ef4444" }}>{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="doctor-appointments-page">
      <DoctorSidebar />

      <motion.div
        className="main-content"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="page-title"
        >
          Appointments ({filteredAppointments.length})
        </motion.h2>

        {/* Success/Error Messages */}
        {message.text && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-4 p-4 rounded-xl flex items-center gap-3 ${
              message.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle size={20} className="text-green-600" />
            ) : (
              <AlertCircle size={20} className="text-red-600" />
            )}
            <span className="font-medium">{message.text}</span>
          </motion.div>
        )}

        {/* Stats Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
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
                padding: "1rem",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
                border: "1px solid #e5e7eb",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "0.25rem" }}>
                {stat.label}
              </div>
              <div style={{ fontSize: "1.75rem", fontWeight: "700", color: stat.color }}>
                {stat.count}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Search and Filter */}
        <div
          style={{
            display: "flex",
            gap: "1rem",
            marginBottom: "2rem",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
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
              placeholder="Search by patient name, email, or notes..."
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
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Appointment Cards */}
        {filteredAppointments.length > 0 ? (
          <div className="appointment-cards-grid">
            {filteredAppointments.map((appt) => {
              const statusStyle = getStatusColor(appt.status);
              const StatusIcon = statusStyle.icon;

              return (
                <motion.div
                  key={appt._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="appointment-card"
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
                    <div
                      style={{
                        width: "3rem",
                        height: "3rem",
                        borderRadius: "50%",
                        backgroundColor: "#e0f2fe",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.25rem",
                        fontWeight: "600",
                        color: "#2563eb",
                      }}
                    >
                      {appt.patient?.name?.charAt(0) || "P"}
                    </div>
                    <div style={{ flex: "1" }}>
                      <h3 style={{ margin: "0 0 0.25rem 0", fontSize: "1.125rem", fontWeight: "600", color: "#1e3a8a" }}>
                        {appt.patient?.name || "Unknown Patient"}
                      </h3>
                      {appt.patient?.email && (
                        <p style={{ margin: "0", fontSize: "0.875rem", color: "#6b7280", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                          <Mail size={12} />
                          {appt.patient.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#6b7280" }}>
                      <Calendar size={16} />
                      <span style={{ fontSize: "0.875rem" }}>{formatDate(appt.startTime)}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#6b7280" }}>
                      <Clock size={16} />
                      <span style={{ fontSize: "0.875rem" }}>{formatTime(appt.startTime)}</span>
                    </div>
                    {appt.patient?.phone && (
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#6b7280" }}>
                        <Phone size={16} />
                        <span style={{ fontSize: "0.875rem" }}>{appt.patient.phone}</span>
                      </div>
                    )}
                    {editingAppointment === appt._id ? (
                      <div style={{ marginTop: "0.5rem" }}>
                        <textarea
                          value={editNotes}
                          onChange={(e) => setEditNotes(e.target.value)}
                          placeholder="Add notes about this appointment..."
                          rows="3"
                          style={{
                            width: "100%",
                            padding: "0.5rem",
                            border: "1px solid #d1d5db",
                            borderRadius: "0.5rem",
                            fontSize: "0.875rem",
                            resize: "vertical",
                            outline: "none",
                          }}
                        />
                        <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleSaveNotes(appt._id)}
                            disabled={updatingStatus === appt._id}
                            style={{
                              padding: "0.25rem 0.75rem",
                              backgroundColor: "#10b981",
                              color: "white",
                              border: "none",
                              borderRadius: "0.375rem",
                              fontSize: "0.75rem",
                              fontWeight: "600",
                              cursor: updatingStatus === appt._id ? "not-allowed" : "pointer",
                              opacity: updatingStatus === appt._id ? 0.7 : 1,
                              display: "flex",
                              alignItems: "center",
                              gap: "0.25rem",
                            }}
                          >
                            <Save size={12} />
                            Save
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleCancelEdit}
                            style={{
                              padding: "0.25rem 0.75rem",
                              backgroundColor: "#6b7280",
                              color: "white",
                              border: "none",
                              borderRadius: "0.375rem",
                              fontSize: "0.75rem",
                              fontWeight: "600",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "0.25rem",
                            }}
                          >
                            <X size={12} />
                            Cancel
                          </motion.button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", marginTop: "0.5rem" }}>
                        {appt.notes ? (
                          <p style={{ fontSize: "0.875rem", color: "#6b7280", fontStyle: "italic", flex: 1 }}>
                            {appt.notes}
                          </p>
                        ) : (
                          <p style={{ fontSize: "0.875rem", color: "#9ca3af", fontStyle: "italic", flex: 1 }}>
                            No notes added
                          </p>
                        )}
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleEditNotes(appt)}
                          style={{
                            padding: "0.25rem",
                            backgroundColor: "transparent",
                            border: "none",
                            cursor: "pointer",
                            color: "#6b7280",
                          }}
                          title="Edit notes"
                        >
                          <FileText size={14} />
                        </motion.button>
                      </div>
                    )}
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
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
                        justifyContent: "center",
                      }}
                    >
                      <StatusIcon size={16} />
                      {appt.status}
                    </div>

                    {/* Status Update Buttons */}
                    {appt.status !== "completed" && appt.status !== "cancelled" && (
                      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                        {appt.status === "pending" && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleStatusChange(appt._id, "confirmed")}
                            disabled={updatingStatus === appt._id}
                            style={{
                              flex: 1,
                              padding: "0.5rem",
                              backgroundColor: "#10b981",
                              color: "white",
                              border: "none",
                              borderRadius: "0.375rem",
                              fontSize: "0.75rem",
                              fontWeight: "600",
                              cursor: updatingStatus === appt._id ? "not-allowed" : "pointer",
                              opacity: updatingStatus === appt._id ? 0.7 : 1,
                            }}
                          >
                            {updatingStatus === appt._id ? "Updating..." : "Confirm"}
                          </motion.button>
                        )}
                        {appt.status !== "completed" && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleStatusChange(appt._id, "completed")}
                            disabled={updatingStatus === appt._id}
                            style={{
                              flex: 1,
                              padding: "0.5rem",
                              backgroundColor: "#6366f1",
                              color: "white",
                              border: "none",
                              borderRadius: "0.375rem",
                              fontSize: "0.75rem",
                              fontWeight: "600",
                              cursor: updatingStatus === appt._id ? "not-allowed" : "pointer",
                              opacity: updatingStatus === appt._id ? 0.7 : 1,
                            }}
                          >
                            {updatingStatus === appt._id ? "Updating..." : "Complete"}
                          </motion.button>
                        )}
                        {appt.status !== "cancelled" && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleStatusChange(appt._id, "cancelled")}
                            disabled={updatingStatus === appt._id}
                            style={{
                              flex: 1,
                              padding: "0.5rem",
                              backgroundColor: "#ef4444",
                              color: "white",
                              border: "none",
                              borderRadius: "0.375rem",
                              fontSize: "0.75rem",
                              fontWeight: "600",
                              cursor: updatingStatus === appt._id ? "not-allowed" : "pointer",
                              opacity: updatingStatus === appt._id ? 0.7 : 1,
                            }}
                          >
                            {updatingStatus === appt._id ? "Updating..." : "Cancel"}
                          </motion.button>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "3rem", color: "#6b7280" }}>
            <Calendar size={48} style={{ marginBottom: "1rem", opacity: 0.5 }} />
            <p>No appointments found.</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default DoctorAppointments;