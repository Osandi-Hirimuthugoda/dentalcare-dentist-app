import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { Calendar, Clock, User, Mail, Phone, Search, Filter, CheckCircle, XCircle, AlertCircle, Edit, Save, X, FileText, RefreshCw } from "lucide-react";
import DoctorSidebar from "../../components/layout/DoctorSidebar";
import styles from "../../styles/pages/DoctorPages.module.css";

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

    if (searchTerm) {
      filtered = filtered.filter(
        (apt) =>
          apt.patient?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          apt.patient?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          apt.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((apt) => apt.status === statusFilter);
    }

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
        return { bg: "#D1FAE5", text: "#065F46", icon: CheckCircle };
      case "pending":
        return { bg: "#FEF3C7", text: "#92400E", icon: AlertCircle };
      case "completed":
        return { bg: "#DBEAFE", text: "#1E40AF", icon: CheckCircle };
      case "cancelled":
        return { bg: "#FEE2E2", text: "#991B1B", icon: XCircle };
      default:
        return { bg: "#F3F4F6", text: "#374151", icon: AlertCircle };
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

  if (error) {
    return (
      <div className={styles.pageWrapper}>
        <DoctorSidebar />
        <div className={styles.mainContent}>
          <div className={styles.contentCard}>
            <div style={{ textAlign: "center", padding: "2rem", color: "#EF4444" }}>
              <AlertCircle size={48} style={{ marginBottom: "1rem" }} />
              <p>{error}</p>
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
        {/* Page Header */}
        <div className={styles.pageHeader}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 className={styles.pageTitle}>
                <Calendar size={32} style={{ marginRight: '0.5rem' }} />
                Appointments
              </h1>
              <p className={styles.pageSubtitle}>
                Manage and track your patient appointments ({filteredAppointments.length} total)
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchAppointments}
              className={styles.buttonSecondary}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <RefreshCw size={18} />
              Refresh
            </motion.button>
          </div>
        </div>

        {/* Success/Error Messages */}
        {message.text && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              padding: '1rem 1.5rem',
              borderRadius: '0.875rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              backgroundColor: message.type === "success" ? 'rgba(74, 222, 128, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              border: `1px solid ${message.type === "success" ? 'rgba(74, 222, 128, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
              color: message.type === "success" ? '#4ADE80' : '#EF4444'
            }}
          >
            {message.type === "success" ? (
              <CheckCircle size={20} />
            ) : (
              <AlertCircle size={20} />
            )}
            <span style={{ fontWeight: '600' }}>{message.text}</span>
          </motion.div>
        )}

        {/* Stats Cards */}
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '1.25rem',
          marginBottom: '2rem'
        }}>
          {[
            { label: "Total", count: statusCounts.all, color: "#60A5FA", icon: Calendar },
            { label: "Pending", count: statusCounts.pending, color: "#FBBF24", icon: Clock },
            { label: "Confirmed", count: statusCounts.confirmed, color: "#4ADE80", icon: CheckCircle },
            { label: "Completed", count: statusCounts.completed, color: "#A78BFA", icon: CheckCircle },
            { label: "Cancelled", count: statusCounts.cancelled, color: "#EF4444", icon: XCircle },
          ].map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '1rem',
                  padding: '1.5rem 1rem',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  border: '1px solid rgba(0, 0, 0, 0.05)',
                  textAlign: 'center',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '145px',
                  flex: '1'
                }}
                whileHover={{ 
                  y: -5, 
                  boxShadow: '0 8px 16px rgba(0, 0, 0, 0.15)',
                  borderColor: stat.color
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  marginBottom: '0.875rem' 
                }}>
                  <div style={{
                    width: '3rem',
                    height: '3rem',
                    borderRadius: '50%',
                    backgroundColor: `${stat.color}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <IconComponent size={24} style={{ color: stat.color }} />
                  </div>
                </div>
                <div style={{ 
                  fontSize: '0.85rem', 
                  color: '#6B7280', 
                  marginBottom: '0.625rem', 
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  {stat.label}
                </div>
                <div style={{ 
                  fontSize: '2rem', 
                  fontWeight: '700', 
                  color: '#1F2937',
                  lineHeight: '1'
                }}>
                  {stat.count}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Search and Filter */}
        <div className={styles.contentCard} style={{ marginBottom: '2rem' }}>
          <div style={{
            display: 'flex',
            gap: '1rem',
            flexWrap: 'wrap',
            alignItems: 'center'
          }}>
            <div style={{ flex: '1', minWidth: '250px', position: 'relative' }}>
              <Search
                size={20}
                style={{
                  position: 'absolute',
                  left: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#9CA3AF',
                  pointerEvents: 'none'
                }}
              />
              <input
                type="text"
                placeholder="Search by patient name, email, or notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.875rem 1rem 0.875rem 2.75rem',
                  background: 'white',
                  border: '1px solid #E5E7EB',
                  borderRadius: '0.75rem',
                  color: '#1F2937',
                  fontSize: '0.95rem',
                  transition: 'all 0.3s ease',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#60A5FA';
                  e.target.style.boxShadow = '0 0 0 3px rgba(96, 165, 250, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#E5E7EB';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <Filter size={20} style={{ color: '#6B7280' }} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  minWidth: '150px',
                  padding: '0.875rem 1rem',
                  background: 'white',
                  border: '1px solid #E5E7EB',
                  borderRadius: '0.75rem',
                  color: '#1F2937',
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  outline: 'none'
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
        </div>

        {/* Appointment Cards */}
        {filteredAppointments.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1.5rem'
          }}>
            {filteredAppointments.map((appt) => {
              const statusStyle = getStatusColor(appt.status);
              const StatusIcon = statusStyle.icon;

              return (
                <motion.div
                  key={appt._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -5, boxShadow: '0 12px 24px rgba(0, 0, 0, 0.15)' }}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '1.25rem',
                    padding: '1.5rem',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    border: '1px solid rgba(0, 0, 0, 0.05)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {/* Patient Info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                    <div
                      style={{
                        width: '3.5rem',
                        height: '3.5rem',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.5rem',
                        fontWeight: '700',
                        color: 'white',
                        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                        flexShrink: 0
                      }}
                    >
                      {appt.patient?.name?.charAt(0).toUpperCase() || 'P'}
                    </div>
                    <div style={{ flex: '1', minWidth: 0 }}>
                      <h3 style={{ 
                        margin: '0 0 0.25rem 0', 
                        fontSize: '1.125rem', 
                        fontWeight: '700', 
                        color: '#1F2937',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {appt.patient?.name || 'Unknown Patient'}
                      </h3>
                      {appt.patient?.email && (
                        <p style={{ 
                          margin: '0', 
                          fontSize: '0.875rem', 
                          color: '#6B7280', 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '0.375rem',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          <Mail size={14} />
                          {appt.patient.email}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Appointment Details */}
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '0.875rem', 
                    marginBottom: '1.25rem',
                    padding: '1rem',
                    backgroundColor: '#F9FAFB',
                    borderRadius: '0.75rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', color: '#374151' }}>
                      <Calendar size={18} style={{ color: '#60A5FA', flexShrink: 0 }} />
                      <span style={{ fontSize: '0.9375rem', fontWeight: '500' }}>{formatDate(appt.startTime)}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', color: '#374151' }}>
                      <Clock size={18} style={{ color: '#4ADE80', flexShrink: 0 }} />
                      <span style={{ fontSize: '0.9375rem', fontWeight: '500' }}>{formatTime(appt.startTime)}</span>
                    </div>
                    {appt.patient?.phone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', color: '#374151' }}>
                        <Phone size={18} style={{ color: '#A78BFA', flexShrink: 0 }} />
                        <span style={{ fontSize: '0.9375rem', fontWeight: '500' }}>{appt.patient.phone}</span>
                      </div>
                    )}
                  </div>

                  {/* Notes Section */}
                  <div style={{ marginBottom: '1.25rem' }}>
                    {editingAppointment === appt._id ? (
                      <div>
                        <textarea
                          value={editNotes}
                          onChange={(e) => setEditNotes(e.target.value)}
                          placeholder="Add notes about this appointment..."
                          rows="3"
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '1px solid #E5E7EB',
                            borderRadius: '0.75rem',
                            fontSize: '0.875rem',
                            resize: 'vertical',
                            outline: 'none',
                            fontFamily: 'inherit'
                          }}
                        />
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleSaveNotes(appt._id)}
                            disabled={updatingStatus === appt._id}
                            style={{
                              padding: '0.5rem 1rem',
                              backgroundColor: '#4ADE80',
                              color: 'white',
                              border: 'none',
                              borderRadius: '0.5rem',
                              fontSize: '0.875rem',
                              fontWeight: '600',
                              cursor: updatingStatus === appt._id ? 'not-allowed' : 'pointer',
                              opacity: updatingStatus === appt._id ? 0.7 : 1,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.375rem'
                            }}
                          >
                            <Save size={16} />
                            Save
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleCancelEdit}
                            style={{
                              padding: '0.5rem 1rem',
                              backgroundColor: '#6B7280',
                              color: 'white',
                              border: 'none',
                              borderRadius: '0.5rem',
                              fontSize: '0.875rem',
                              fontWeight: '600',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.375rem'
                            }}
                          >
                            <X size={16} />
                            Cancel
                          </motion.button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'flex-start', 
                        gap: '0.75rem',
                        padding: '0.75rem',
                        backgroundColor: '#F9FAFB',
                        borderRadius: '0.75rem'
                      }}>
                        <FileText size={16} style={{ color: '#6B7280', flexShrink: 0, marginTop: '0.125rem' }} />
                        {appt.notes ? (
                          <p style={{ fontSize: '0.875rem', color: '#374151', fontStyle: 'italic', flex: 1, margin: 0 }}>
                            {appt.notes}
                          </p>
                        ) : (
                          <p style={{ fontSize: '0.875rem', color: '#9CA3AF', fontStyle: 'italic', flex: 1, margin: 0 }}>
                            No notes added
                          </p>
                        )}
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleEditNotes(appt)}
                          style={{
                            padding: '0.25rem',
                            backgroundColor: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#60A5FA',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                          title="Edit notes"
                        >
                          <Edit size={16} />
                        </motion.button>
                      </div>
                    )}
                  </div>

                  {/* Status Badge */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      backgroundColor: statusStyle.bg,
                      color: statusStyle.text,
                      padding: '0.75rem 1rem',
                      borderRadius: '0.75rem',
                      fontSize: '0.875rem',
                      fontWeight: '700',
                      textTransform: 'capitalize',
                      marginBottom: '1rem'
                    }}
                  >
                    <StatusIcon size={18} />
                    {appt.status}
                  </div>

                  {/* Status Update Buttons */}
                  {appt.status !== "completed" && appt.status !== "cancelled" && (
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                      {appt.status === "pending" && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleStatusChange(appt._id, "confirmed")}
                          disabled={updatingStatus === appt._id}
                          style={{
                            flex: 1,
                            padding: '0.75rem',
                            backgroundColor: '#4ADE80',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.75rem',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            cursor: updatingStatus === appt._id ? 'not-allowed' : 'pointer',
                            opacity: updatingStatus === appt._id ? 0.7 : 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.375rem'
                          }}
                        >
                          <CheckCircle size={16} />
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
                            padding: '0.75rem',
                            backgroundColor: '#A78BFA',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.75rem',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            cursor: updatingStatus === appt._id ? 'not-allowed' : 'pointer',
                            opacity: updatingStatus === appt._id ? 0.7 : 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.375rem'
                          }}
                        >
                          <CheckCircle size={16} />
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
                            padding: '0.75rem',
                            backgroundColor: '#EF4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.75rem',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            cursor: updatingStatus === appt._id ? 'not-allowed' : 'pointer',
                            opacity: updatingStatus === appt._id ? 0.7 : 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.375rem'
                          }}
                        >
                          <XCircle size={16} />
                          {updatingStatus === appt._id ? "Updating..." : "Cancel"}
                        </motion.button>
                      )}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateIcon}>
              <Calendar size={64} style={{ color: '#9CA3AF' }} />
            </div>
            <p className={styles.emptyStateText}>No appointments found</p>
            <p className={styles.emptyStateSubtext}>
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria' 
                : 'Your appointments will appear here'}
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default DoctorAppointments;