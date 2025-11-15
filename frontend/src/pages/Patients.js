import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { Search, User, Mail, Phone, Calendar, FileText, Clock } from "lucide-react";
import DoctorSidebar from "../components/DoctorSidebar";
import "../styles/Patients.css"; 

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
      // Use empty array if API fails
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
      
      // Get all appointments for this doctor
      const response = await axios.get(`http://localhost:4000/api/appointments/doctor/${doctorData._id}`);
      
      // Filter appointments for this specific patient
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
      <div className="patients-page">
        <DoctorSidebar />
        <div className="patients-main-content">
          <div style={{ textAlign: "center", padding: "3rem" }}>Loading patients...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="patients-page">
        <DoctorSidebar />
        <div className="patients-main-content">
          <div style={{ textAlign: "center", padding: "3rem", color: "#ef4444" }}>{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="patients-page">
      <DoctorSidebar />
      <div className="patients-main-content">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="patients-page-title"
        >
          Patient Records ({filteredPatients.length})
        </motion.h2>

        {/* Search Bar */}
        <div style={{ marginBottom: "1.5rem", position: "relative" }}>
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
            placeholder="Search by name, email, or phone..."
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

        {filteredPatients.length > 0 ? (
          <div className="patients-table-container">
            <table className="patients-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Age</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Gender</th>
                  <th>Registered</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map((p, idx) => (
                  <tr key={p._id || idx}>
                    <td className="patient-name">
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <div
                          style={{
                            width: "2rem",
                            height: "2rem",
                            borderRadius: "50%",
                            backgroundColor: "#e0f2fe",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#2563eb",
                            fontWeight: "600",
                            fontSize: "0.875rem",
                          }}
                        >
                          {p.name?.charAt(0) || "P"}
                        </div>
                        {p.name || "Unknown"}
                      </div>
                    </td>
                    <td>{p.age || "N/A"}</td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                        <Mail size={14} style={{ color: "#6b7280" }} />
                        {p.email || "N/A"}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                        <Phone size={14} style={{ color: "#6b7280" }} />
                        {p.phone || "N/A"}
                      </div>
                    </td>
                    <td>{p.gender || "N/A"}</td>
                    <td>{formatDate(p.createdAt)}</td>
                    <td>
                      <button
                        onClick={() => handleViewPatient(p)}
                        style={{
                          padding: "0.5rem 1rem",
                          backgroundColor: "#2563eb",
                          color: "white",
                          border: "none",
                          borderRadius: "0.5rem",
                          cursor: "pointer",
                          fontSize: "0.875rem",
                          fontWeight: "500",
                        }}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "3rem", color: "#6b7280" }}>
            <User size={48} style={{ marginBottom: "1rem", opacity: 0.5 }} />
            <p>No patients found. Patients who select you will appear here.</p>
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
      </div>
    </div>
  );
};

export default Patients;