import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { Search, User, Mail, Phone, Calendar, FileText, Clock, RefreshCw } from "lucide-react";
import DoctorSidebar from "../../components/layout/DoctorSidebar";
import styles from "../../styles/pages/DoctorPages.module.css";

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientAppointments, setPatientAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = patients.filter(
        (p) =>
          p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.phone?.includes(searchTerm)
      );
      setFilteredPatients(filtered);
    } else {
      setFilteredPatients(patients);
    }
  }, [searchTerm, patients]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const doctorData = JSON.parse(localStorage.getItem("doctor") || "{}");
      
      if (!doctorData._id) {
        setError("Doctor not found. Please login again.");
        setLoading(false);
        return;
      }

      const response = await axios.get(`http://localhost:4000/api/patients/doctor/${doctorData._id}`);
      setPatients(response.data || []);
      setFilteredPatients(response.data || []);
    } catch (err) {
      console.error("Error fetching patients:", err);
      setError("Failed to load patients. Please try again.");
      setPatients([]);
      setFilteredPatients([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatientAppointments = async (patientId) => {
    try {
      setLoadingAppointments(true);
      const doctorData = JSON.parse(localStorage.getItem("doctor") || "{}");
      
      const response = await axios.get(`http://localhost:4000/api/appointments/doctor/${doctorData._id}`);
      const patientApts = response.data.filter(apt => apt.patient?._id === patientId);
      setPatientAppointments(patientApts || []);
    } catch (err) {
      console.error("Error fetching appointments:", err);
      setPatientAppointments([]);
    } finally {
      setLoadingAppointments(false);
    }
  };

  const handleViewPatient = (patient) => {
    setSelectedPatient(patient);
    if (patient._id) {
      fetchPatientAppointments(patient._id);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
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
            <div style={{ textAlign: "center", padding: "2rem", color: "#EF4444" }}>{error}</div>
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 className={styles.pageTitle}>
                <User size={32} style={{ marginRight: '0.5rem' }} />
                Patient Records
              </h1>
              <p className={styles.pageSubtitle}>
                Manage your patient information ({filteredPatients.length} total)
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchPatients}
              className={styles.buttonSecondary}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <RefreshCw size={18} />
              Refresh
            </motion.button>
          </div>
        </div>

        {/* Search Bar */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '1rem',
          padding: '1.5rem',
          marginBottom: '2rem',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{ position: "relative" }}>
            <Search
              size={20}
              style={{
                position: "absolute",
                left: "1rem",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#9CA3AF",
                pointerEvents: "none"
              }}
            />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                padding: "0.875rem 1rem 0.875rem 2.75rem",
                background: "white",
                border: "1px solid #E5E7EB",
                borderRadius: "0.75rem",
                color: "#1F2937",
                fontSize: "0.95rem",
                transition: "all 0.3s ease",
                outline: "none"
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
        </div>

        {filteredPatients.length > 0 ? (
          <div style={{
            background: 'white',
            borderRadius: '1.25rem',
            padding: '0',
            border: '1px solid rgba(0, 0, 0, 0.05)',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
            overflow: 'hidden'
          }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'separate',
                borderSpacing: 0
              }}>
                <thead>
                  <tr style={{
                    background: '#F3F4F6',
                    borderBottom: '2px solid #E5E7EB'
                  }}>
                    <th style={{
                      padding: '1rem',
                      textAlign: 'left',
                      fontWeight: '600',
                      color: '#374151',
                      fontSize: '0.9rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>Name</th>
                    <th style={{
                      padding: '1rem',
                      textAlign: 'left',
                      fontWeight: '600',
                      color: '#374151',
                      fontSize: '0.9rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>Age</th>
                    <th style={{
                      padding: '1rem',
                      textAlign: 'left',
                      fontWeight: '600',
                      color: '#374151',
                      fontSize: '0.9rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>Email</th>
                    <th style={{
                      padding: '1rem',
                      textAlign: 'left',
                      fontWeight: '600',
                      color: '#374151',
                      fontSize: '0.9rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>Phone</th>
                    <th style={{
                      padding: '1rem',
                      textAlign: 'left',
                      fontWeight: '600',
                      color: '#374151',
                      fontSize: '0.9rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>Gender</th>
                    <th style={{
                      padding: '1rem',
                      textAlign: 'left',
                      fontWeight: '600',
                      color: '#374151',
                      fontSize: '0.9rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>Registered</th>
                    <th style={{
                      padding: '1rem',
                      textAlign: 'left',
                      fontWeight: '600',
                      color: '#374151',
                      fontSize: '0.9rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPatients.map((p, idx) => (
                    <motion.tr
                      key={p._id || idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      style={{
                        borderBottom: '1px solid #E5E7EB',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#F9FAFB';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <td style={{
                        padding: '1rem',
                        color: '#374151',
                        fontSize: '0.95rem'
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                          <div
                            style={{
                              width: "2.5rem",
                              height: "2.5rem",
                              borderRadius: "50%",
                              background: "linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "white",
                              fontWeight: "700",
                              fontSize: "1rem",
                              boxShadow: "0 2px 8px rgba(59, 130, 246, 0.3)"
                            }}
                          >
                            {p.name?.charAt(0).toUpperCase() || "P"}
                          </div>
                          <span style={{ fontWeight: "600", color: "#1F2937" }}>
                            {p.name || "Unknown"}
                          </span>
                        </div>
                      </td>
                      <td style={{
                        padding: '1rem',
                        color: '#374151',
                        fontSize: '0.95rem'
                      }}>{p.age || "N/A"}</td>
                      <td style={{
                        padding: '1rem',
                        color: '#374151',
                        fontSize: '0.95rem'
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <Mail size={16} style={{ color: "#6B7280" }} />
                          {p.email || "N/A"}
                        </div>
                      </td>
                      <td style={{
                        padding: '1rem',
                        color: '#374151',
                        fontSize: '0.95rem'
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <Phone size={16} style={{ color: "#6B7280" }} />
                          {p.phone || "N/A"}
                        </div>
                      </td>
                      <td style={{
                        padding: '1rem',
                        color: '#374151',
                        fontSize: '0.95rem'
                      }}>
                        <span style={{
                          padding: "0.35rem 0.75rem",
                          borderRadius: "0.5rem",
                          fontSize: "0.875rem",
                          fontWeight: "600",
                          background: p.gender === "Male" ? "rgba(59, 130, 246, 0.1)" : p.gender === "Female" ? "rgba(236, 72, 153, 0.1)" : "rgba(107, 114, 128, 0.1)",
                          color: p.gender === "Male" ? "#2563EB" : p.gender === "Female" ? "#EC4899" : "#6B7280",
                          border: `1px solid ${p.gender === "Male" ? "rgba(59, 130, 246, 0.3)" : p.gender === "Female" ? "rgba(236, 72, 153, 0.3)" : "rgba(107, 114, 128, 0.3)"}`
                        }}>
                          {p.gender || "N/A"}
                        </span>
                      </td>
                      <td style={{
                        padding: '1rem',
                        color: '#374151',
                        fontSize: '0.95rem'
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <Calendar size={16} style={{ color: "#6B7280" }} />
                          {formatDate(p.createdAt)}
                        </div>
                      </td>
                      <td style={{
                        padding: '1rem',
                        color: '#374151',
                        fontSize: '0.95rem'
                      }}>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleViewPatient(p)}
                          style={{
                            padding: "0.625rem 1.25rem",
                            background: "linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)",
                            color: "white",
                            border: "none",
                            borderRadius: "0.75rem",
                            cursor: "pointer",
                            fontSize: "0.875rem",
                            fontWeight: "600",
                            boxShadow: "0 2px 8px rgba(37, 99, 235, 0.3)",
                            transition: "all 0.3s ease"
                          }}
                        >
                          View Details
                        </motion.button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div style={{
            background: 'white',
            borderRadius: '1.25rem',
            padding: '3rem',
            textAlign: 'center',
            border: '1px solid rgba(0, 0, 0, 0.05)',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
            color: '#6B7280'
          }}>
            <User size={64} style={{ marginBottom: "1rem", opacity: 0.5, color: "#9CA3AF", margin: "0 auto 1rem" }} />
            <h3 style={{ fontSize: "1.25rem", fontWeight: "700", color: "#374151", marginBottom: "0.5rem" }}>
              No patients found
            </h3>
            <p style={{ fontSize: "0.95rem", color: "#6B7280" }}>
              {searchTerm ? "Try adjusting your search terms" : "Patients who select you will appear here"}
            </p>
          </div>
        )}

        {/* Patient Details Modal */}
        {selectedPatient && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
            }}
            onClick={() => setSelectedPatient(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                backgroundColor: "white",
                borderRadius: "1rem",
                padding: "2rem",
                maxWidth: "600px",
                width: "90%",
                maxHeight: "80vh",
                overflowY: "auto",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <h2 style={{ fontSize: "1.5rem", fontWeight: "700", color: "#1e3a8a" }}>
                  Patient Details
                </h2>
                <button
                  onClick={() => setSelectedPatient(null)}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: "1.5rem",
                    cursor: "pointer",
                    color: "#6b7280",
                  }}
                >
                  ×
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div>
                  <label style={{ fontSize: "0.875rem", fontWeight: "600", color: "#6b7280" }}>Name</label>
                  <p style={{ fontSize: "1rem", marginTop: "0.25rem" }}>{selectedPatient.name}</p>
                </div>
                <div>
                  <label style={{ fontSize: "0.875rem", fontWeight: "600", color: "#6b7280" }}>Email</label>
                  <p style={{ fontSize: "1rem", marginTop: "0.25rem" }}>{selectedPatient.email}</p>
                </div>
                <div>
                  <label style={{ fontSize: "0.875rem", fontWeight: "600", color: "#6b7280" }}>Phone</label>
                  <p style={{ fontSize: "1rem", marginTop: "0.25rem" }}>{selectedPatient.phone}</p>
                </div>
                <div>
                  <label style={{ fontSize: "0.875rem", fontWeight: "600", color: "#6b7280" }}>Age</label>
                  <p style={{ fontSize: "1rem", marginTop: "0.25rem" }}>{selectedPatient.age || "N/A"}</p>
                </div>
                <div>
                  <label style={{ fontSize: "0.875rem", fontWeight: "600", color: "#6b7280" }}>Gender</label>
                  <p style={{ fontSize: "1rem", marginTop: "0.25rem" }}>{selectedPatient.gender || "N/A"}</p>
                </div>
                {selectedPatient.diagnosis && (
                  <div>
                    <label style={{ fontSize: "0.875rem", fontWeight: "600", color: "#6b7280" }}>Diagnosis</label>
                    <p style={{ fontSize: "1rem", marginTop: "0.25rem" }}>{selectedPatient.diagnosis}</p>
                  </div>
                )}
                {selectedPatient.doctorNotes && (
                  <div>
                    <label style={{ fontSize: "0.875rem", fontWeight: "600", color: "#6b7280" }}>Doctor Notes</label>
                    <p style={{ fontSize: "1rem", marginTop: "0.25rem" }}>{selectedPatient.doctorNotes}</p>
                  </div>
                )}
                {selectedPatient.history && selectedPatient.history.length > 0 && (
                  <div>
                    <label style={{ fontSize: "0.875rem", fontWeight: "600", color: "#6b7280" }}>Medical History</label>
                    <ul style={{ marginTop: "0.25rem", paddingLeft: "1.5rem" }}>
                      {selectedPatient.history.map((item, idx) => (
                        <li key={idx} style={{ fontSize: "1rem", marginBottom: "0.25rem" }}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <div>
                  <label style={{ fontSize: "0.875rem", fontWeight: "600", color: "#6b7280" }}>Registered Date</label>
                  <p style={{ fontSize: "1rem", marginTop: "0.25rem" }}>{formatDate(selectedPatient.createdAt)}</p>
                </div>
              </div>

              {/* Appointments Section */}
              <div style={{ marginTop: "2rem", paddingTop: "2rem", borderTop: "2px solid #e5e7eb" }}>
                <h3 style={{ fontSize: "1.25rem", fontWeight: "700", color: "#1e3a8a", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Calendar size={20} />
                  Appointments ({patientAppointments.length})
                </h3>

                {loadingAppointments ? (
                  <p style={{ color: "#6b7280", textAlign: "center", padding: "1rem" }}>Loading appointments...</p>
                ) : patientAppointments.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {patientAppointments.map((apt) => (
                      <div
                        key={apt._id}
                        style={{
                          padding: "1rem",
                          backgroundColor: "#f9fafb",
                          borderRadius: "0.75rem",
                          border: "1px solid #e5e7eb",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <Calendar size={16} style={{ color: "#6b7280" }} />
                            <span style={{ fontWeight: "600", color: "#374151" }}>
                              {formatDate(apt.startTime)}
                            </span>
                          </div>
                          <span
                            style={{
                              padding: "0.25rem 0.75rem",
                              borderRadius: "0.5rem",
                              fontSize: "0.875rem",
                              fontWeight: "600",
                              textTransform: "capitalize",
                              backgroundColor:
                                apt.status === "confirmed"
                                  ? "#d1fae5"
                                  : apt.status === "pending"
                                  ? "#fef3c7"
                                  : apt.status === "completed"
                                  ? "#dbeafe"
                                  : "#fee2e2",
                              color:
                                apt.status === "confirmed"
                                  ? "#065f46"
                                  : apt.status === "pending"
                                  ? "#92400e"
                                  : apt.status === "completed"
                                  ? "#1e40af"
                                  : "#991b1b",
                            }}
                          >
                            {apt.status}
                          </span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#6b7280", fontSize: "0.875rem" }}>
                          <Clock size={14} />
                          <span>
                            {new Date(apt.startTime).toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        {apt.notes && (
                          <p style={{ marginTop: "0.5rem", fontSize: "0.875rem", color: "#6b7280", fontStyle: "italic" }}>
                            {apt.notes}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: "#6b7280", textAlign: "center", padding: "1rem" }}>
                    No appointments found for this patient.
                  </p>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Patients;