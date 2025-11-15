import React, { useState, useEffect } from "react";
import AdminSidebar from "../components/AdminSidebar";
import { motion } from "framer-motion";
import { Search, Filter, User, Mail, Phone, Calendar, FileText, Trash2, Eye, AlertCircle, CheckCircle } from "lucide-react";
import axios from "axios";
import styles from "../styles/DoctorDashboard.module.css";

export default function AdminPatients() {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    filterPatients();
  }, [searchTerm, patients]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:4000/api/admins/patients");
      setPatients(response.data || []);
      setFilteredPatients(response.data || []);
    } catch (err) {
      console.error("Error fetching patients:", err);
      setPatients([]);
      setFilteredPatients([]);
    } finally {
      setLoading(false);
    }
  };

  const filterPatients = () => {
    let filtered = [...patients];

    if (searchTerm) {
      filtered = filtered.filter(
        (patient) =>
          patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          patient.phone?.includes(searchTerm) ||
          patient.selectedDoctor?.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredPatients(filtered);
  };

  const handleDelete = async (patientId) => {
    try {
      setLoading(true);
      // Note: Delete patient endpoint needs to be added to backend
      const response = await axios.delete(`http://localhost:4000/api/patients/${patientId}`);

      if (response.status === 200) {
        setMessage({ type: "success", text: "Patient deleted successfully!" });
        setDeleteConfirm(null);
        await fetchPatients();
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to delete patient. Please try again.",
      });
      setDeleteConfirm(null);
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className={styles.dashboardWrapper}>
        <AdminSidebar />
        <div className={styles.mainContentArea}>
          <div style={{ textAlign: "center", padding: "3rem" }}>Loading patients...</div>
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
            <h1 className={styles.mainTitle}>Manage Patients</h1>
            <p className={styles.statsGridLabel}>View and manage all registered patients</p>
          </div>
        </header>

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

        {/* Search Section */}
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
          <div style={{ position: "relative" }}>
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
              placeholder="Search by name, email, phone, or doctor..."
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
          <div style={{ marginTop: "1rem", color: "#6b7280", fontSize: "0.875rem" }}>
            Showing {filteredPatients.length} of {patients.length} patients
          </div>
        </motion.div>

        {/* Patients Grid */}
        {filteredPatients.length > 0 ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {filteredPatients.map((patient, index) => (
              <motion.div
                key={patient._id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5, boxShadow: "0 15px 30px rgba(0, 0, 0, 0.12)" }}
                style={{
                  backgroundColor: "white",
                  borderRadius: "1.25rem",
                  padding: "1.5rem",
                  boxShadow: "0 10px 20px rgba(0, 0, 0, 0.08), 0 4px 6px rgba(0, 0, 0, 0.04)",
                  border: "1px solid #e5e7eb",
                  transition: "all 0.3s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
                  <div
                    style={{
                      width: "3.5rem",
                      height: "3.5rem",
                      backgroundColor: "#e0f2fe",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.5rem",
                      fontWeight: "600",
                      color: "#2563eb",
                    }}
                  >
                    {patient.name?.charAt(0) || "P"}
                  </div>
                  <div style={{ flex: "1" }}>
                    <h3 style={{ fontSize: "1.25rem", fontWeight: "600", color: "#1e3a8a", marginBottom: "0.25rem" }}>
                      {patient.name || "Unknown Patient"}
                    </h3>
                    {patient.selectedDoctor && (
                      <span
                        style={{
                          display: "inline-block",
                          backgroundColor: "#dbeafe",
                          color: "#1e40af",
                          padding: "0.25rem 0.75rem",
                          borderRadius: "0.5rem",
                          fontSize: "0.875rem",
                          fontWeight: "500",
                        }}
                      >
                        {patient.selectedDoctor.fullName}
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1rem" }}>
                  {patient.email && (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#6b7280" }}>
                      <Mail size={16} />
                      <span style={{ fontSize: "0.875rem" }}>{patient.email}</span>
                    </div>
                  )}

                  {patient.phone && (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#6b7280" }}>
                      <Phone size={16} />
                      <span style={{ fontSize: "0.875rem" }}>{patient.phone}</span>
                    </div>
                  )}

                  {patient.age && (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#6b7280" }}>
                      <User size={16} />
                      <span style={{ fontSize: "0.875rem" }}>Age: {patient.age} | {patient.gender || "N/A"}</span>
                    </div>
                  )}

                  {patient.createdAt && (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#6b7280" }}>
                      <Calendar size={16} />
                      <span style={{ fontSize: "0.875rem" }}>Registered: {formatDate(patient.createdAt)}</span>
                    </div>
                  )}

                  {patient.diagnosis && (
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", color: "#6b7280" }}>
                      <FileText size={16} style={{ marginTop: "0.125rem" }} />
                      <span style={{ fontSize: "0.875rem" }}>Diagnosis: {patient.diagnosis}</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div style={{ display: "flex", gap: "0.5rem", paddingTop: "1rem", borderTop: "1px solid #e5e7eb" }}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedPatient(patient)}
                    style={{
                      flex: 1,
                      padding: "0.5rem",
                      backgroundColor: "#3b82f6",
                      color: "white",
                      border: "none",
                      borderRadius: "0.5rem",
                      fontSize: "0.875rem",
                      fontWeight: "600",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <Eye size={16} />
                    View
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setDeleteConfirm(patient._id)}
                    style={{
                      flex: 1,
                      padding: "0.5rem",
                      backgroundColor: "#ef4444",
                      color: "white",
                      border: "none",
                      borderRadius: "0.5rem",
                      fontSize: "0.875rem",
                      fontWeight: "600",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <Trash2 size={16} />
                    Delete
                  </motion.button>
                </div>
              </motion.div>
            ))}
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
            <User size={48} style={{ color: "#9ca3af", marginBottom: "1rem" }} />
            <p style={{ color: "#6b7280", fontSize: "1.125rem" }}>
              No patients found matching your search criteria.
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

              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                <div>
                  <label style={{ fontSize: "0.875rem", fontWeight: "600", color: "#6b7280" }}>Name</label>
                  <p style={{ marginTop: "0.5rem", fontSize: "1rem" }}>{selectedPatient.name}</p>
                </div>

                <div>
                  <label style={{ fontSize: "0.875rem", fontWeight: "600", color: "#6b7280" }}>Email</label>
                  <p style={{ marginTop: "0.5rem", fontSize: "1rem" }}>{selectedPatient.email}</p>
                </div>

                <div>
                  <label style={{ fontSize: "0.875rem", fontWeight: "600", color: "#6b7280" }}>Phone</label>
                  <p style={{ marginTop: "0.5rem", fontSize: "1rem" }}>{selectedPatient.phone || "N/A"}</p>
                </div>

                {selectedPatient.age && (
                  <div>
                    <label style={{ fontSize: "0.875rem", fontWeight: "600", color: "#6b7280" }}>Age & Gender</label>
                    <p style={{ marginTop: "0.5rem", fontSize: "1rem" }}>
                      {selectedPatient.age} years old | {selectedPatient.gender || "N/A"}
                    </p>
                  </div>
                )}

                {selectedPatient.selectedDoctor && (
                  <div>
                    <label style={{ fontSize: "0.875rem", fontWeight: "600", color: "#6b7280" }}>Assigned Doctor</label>
                    <p style={{ marginTop: "0.5rem", fontSize: "1rem" }}>
                      {selectedPatient.selectedDoctor.fullName} ({selectedPatient.selectedDoctor.specialization})
                    </p>
                  </div>
                )}

                {selectedPatient.diagnosis && (
                  <div>
                    <label style={{ fontSize: "0.875rem", fontWeight: "600", color: "#6b7280" }}>Diagnosis</label>
                    <p style={{ marginTop: "0.5rem", fontSize: "1rem", color: "#ef4444" }}>{selectedPatient.diagnosis}</p>
                  </div>
                )}

                {selectedPatient.doctorNotes && (
                  <div>
                    <label style={{ fontSize: "0.875rem", fontWeight: "600", color: "#6b7280" }}>Doctor Notes</label>
                    <p style={{ marginTop: "0.5rem", fontSize: "1rem" }}>{selectedPatient.doctorNotes}</p>
                  </div>
                )}

                {selectedPatient.history && selectedPatient.history.length > 0 && (
                  <div>
                    <label style={{ fontSize: "0.875rem", fontWeight: "600", color: "#6b7280" }}>Medical History</label>
                    <ul style={{ marginTop: "0.5rem", paddingLeft: "1.5rem" }}>
                      {selectedPatient.history.map((item, idx) => (
                        <li key={idx} style={{ fontSize: "1rem", marginBottom: "0.25rem" }}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <label style={{ fontSize: "0.875rem", fontWeight: "600", color: "#6b7280" }}>Registration Date</label>
                  <p style={{ marginTop: "0.5rem", fontSize: "1rem" }}>{formatDate(selectedPatient.createdAt)}</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
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
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                backgroundColor: "white",
                borderRadius: "1rem",
                padding: "2rem",
                maxWidth: "400px",
                width: "90%",
              }}
            >
              <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
                <AlertCircle size={48} style={{ color: "#ef4444", marginBottom: "1rem" }} />
                <h2 style={{ fontSize: "1.25rem", fontWeight: "700", color: "#1e3a8a", marginBottom: "0.5rem" }}>
                  Delete Patient?
                </h2>
                <p style={{ color: "#6b7280" }}>
                  Are you sure you want to delete this patient? This action cannot be undone and will also delete all associated appointments.
                </p>
              </div>

              <div style={{ display: "flex", gap: "1rem" }}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setDeleteConfirm(null)}
                  style={{
                    flex: 1,
                    padding: "0.75rem",
                    backgroundColor: "#6b7280",
                    color: "white",
                    border: "none",
                    borderRadius: "0.5rem",
                    fontSize: "1rem",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleDelete(deleteConfirm)}
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: "0.75rem",
                    backgroundColor: "#ef4444",
                    color: "white",
                    border: "none",
                    borderRadius: "0.5rem",
                    fontSize: "1rem",
                    fontWeight: "600",
                    cursor: loading ? "not-allowed" : "pointer",
                    opacity: loading ? 0.7 : 1,
                  }}
                >
                  {loading ? "Deleting..." : "Delete"}
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}

