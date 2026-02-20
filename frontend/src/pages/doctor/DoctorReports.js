import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { Users, Calendar, CheckCircle, Clock, TrendingUp, FileText, User, Mail, Phone, Stethoscope, Image, FileText as FileTextIcon } from "lucide-react";
import DoctorSidebar from "../../components/layout/DoctorSidebar";
import '../../styles/pages/DoctorReports.css'; 

const DoctorReports = () => {
  const [stats, setStats] = useState([
    { label: "Total Patients", value: 0, icon: Users, color: "#3b82f6" },
    { label: "Appointments This Month", value: 0, icon: Calendar, color: "#10b981" },
    { label: "Completed Treatments", value: 0, icon: CheckCircle, color: "#6366f1" },
    { label: "Pending Cases", value: 0, icon: Clock, color: "#f59e0b" },
  ]);
  const [patientReports, setPatientReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      const doctorData = JSON.parse(localStorage.getItem("doctor") || "{}");
      if (!doctorData._id) {
        setLoading(false);
        return;
      }

      // Fetch patients
      const patientsRes = await axios.get(`http://localhost:4000/api/patients/doctor/${doctorData._id}`);
      const patientsCount = patientsRes.data.length || 0;

      // Fetch appointments
      const appointmentsRes = await axios.get(`http://localhost:4000/api/appointments/doctor/${doctorData._id}`);
      const appointments = appointmentsRes.data || [];

      // Calculate monthly appointments
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthlyAppointments = appointments.filter(apt => new Date(apt.startTime) >= startOfMonth).length;

      // Calculate completed
      const completed = appointments.filter(apt => apt.status === "completed").length;

      // Calculate pending
      const pending = appointments.filter(apt => apt.status === "pending" || apt.status === "confirmed").length;

      setStats([
        { label: "Total Patients", value: patientsCount, icon: Users, color: "#3b82f6" },
        { label: "Appointments This Month", value: monthlyAppointments, icon: Calendar, color: "#10b981" },
        { label: "Completed Treatments", value: completed, icon: CheckCircle, color: "#6366f1" },
        { label: "Pending Cases", value: pending, icon: Clock, color: "#f59e0b" },
      ]);

      // Set patient reports (patients with medical information)
      const reports = patientsRes.data
        .filter(patient => patient.diagnosis || patient.doctorNotes || (patient.history && patient.history.length > 0))
        .map(patient => ({
          ...patient,
          reportDate: patient.updatedAt || patient.createdAt
        }))
        .sort((a, b) => new Date(b.reportDate) - new Date(a.reportDate));
      
      setPatientReports(reports);
    } catch (err) {
      console.error("Error fetching report data:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 50%, #CBD5E1 100%)" }}>
      <DoctorSidebar />
      <div style={{ flex: 1, marginLeft: "14rem", padding: "2rem 2.5rem" }}>
        <div style={{ 
          background: "white", 
          borderRadius: "1.25rem", 
          padding: "1.5rem 2rem", 
          marginBottom: "2rem", 
          border: "1px solid rgba(0, 0, 0, 0.05)", 
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)"
        }}>
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ 
              margin: 0, 
              fontSize: "2.5rem", 
              fontWeight: "900", 
              background: "linear-gradient(135deg, #2563EB 0%, #3B82F6 50%, #60A5FA 100%)", 
              WebkitBackgroundClip: "text", 
              WebkitTextFillColor: "transparent", 
              backgroundClip: "text", 
              display: "flex", 
              alignItems: "center" 
            }}
          >
            <FileText size={32} style={{ marginRight: "0.5rem", color: "#2563EB" }} />
            Clinic Reports
          </motion.h2>
        </div>

        {loading ? (
          <div style={{ 
            background: "white", 
            borderRadius: "1.25rem", 
            padding: "3rem", 
            textAlign: "center", 
            border: "1px solid rgba(0, 0, 0, 0.05)", 
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)" 
          }}>
            <div style={{ 
              width: "48px", 
              height: "48px", 
              border: "4px solid #E5E7EB", 
              borderTopColor: "#2563EB", 
              borderRadius: "50%", 
              animation: "spin 1s linear infinite", 
              margin: "0 auto 1rem" 
            }}></div>
            Loading reports...
          </div>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1.25rem", marginBottom: "2rem" }}>
              {stats.map((s, i) => {
                const IconComponent = s.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ y: -5, boxShadow: "0 8px 16px rgba(0, 0, 0, 0.15)" }}
                    style={{
                      background: "white",
                      padding: "1.5rem",
                      borderRadius: "1.25rem",
                      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
                      border: "1px solid rgba(0, 0, 0, 0.05)",
                      transition: "all 0.3s ease",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      minHeight: "150px"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
                      <div style={{ 
                        padding: "0.75rem", 
                        borderRadius: "50%", 
                        background: `${s.color}20`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}>
                        <IconComponent size={24} style={{ color: s.color }} />
                      </div>
                    </div>
                    <div>
                      <p style={{ fontSize: "0.9rem", fontWeight: "600", color: "#6B7280", marginBottom: "0.5rem" }}>
                        {s.label}
                      </p>
                      <h3 style={{ fontSize: "2.5rem", fontWeight: "900", color: s.color, margin: 0 }}>
                        {s.value}
                      </h3>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              style={{
                background: "white",
                borderRadius: "1.25rem",
                padding: "2rem",
                marginBottom: "2rem",
                border: "1px solid rgba(0, 0, 0, 0.05)",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
                <TrendingUp size={24} style={{ color: "#10B981" }} />
                <h3 style={{ fontSize: "1.5rem", fontWeight: "700", color: "#1F2937", margin: 0 }}>Monthly Summary</h3>
              </div>
              <p style={{ color: "#6B7280", marginBottom: "1.5rem" }}>
                This month has shown consistent growth in patient engagement and
                appointment completions. Great job maintaining high patient
                satisfaction!
              </p>
              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                <div style={{ 
                  padding: "1.5rem", 
                  background: "linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%)", 
                  borderRadius: "1rem",
                  flex: "1",
                  minWidth: "200px",
                  border: "1px solid rgba(16, 185, 129, 0.2)"
                }}>
                  <div style={{ fontSize: "0.875rem", color: "#6B7280", marginBottom: "0.5rem", fontWeight: "600" }}>Completion Rate</div>
                  <div style={{ fontSize: "2rem", fontWeight: "900", color: "#10B981" }}>
                    {stats[0].value > 0 ? Math.round((stats[2].value / stats[0].value) * 100) : 0}%
                  </div>
                </div>
                <div style={{ 
                  padding: "1.5rem", 
                  background: "linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(245, 158, 11, 0.1) 100%)", 
                  borderRadius: "1rem",
                  flex: "1",
                  minWidth: "200px",
                  border: "1px solid rgba(251, 191, 36, 0.2)"
                }}>
                  <div style={{ fontSize: "0.875rem", color: "#6B7280", marginBottom: "0.5rem", fontWeight: "600" }}>Pending Cases</div>
                  <div style={{ fontSize: "2rem", fontWeight: "900", color: "#F59E0B" }}>
                    {stats[3].value}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Patient Reports Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              style={{
                marginTop: "2rem",
                backgroundColor: "white",
                borderRadius: "1rem",
                padding: "2rem",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
                border: "1px solid #e5e7eb",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
                <FileTextIcon size={24} style={{ color: "#2563eb" }} />
                <h3 style={{ fontSize: "1.5rem", fontWeight: "700", color: "#1e3a8a" }}>Patient Medical Reports</h3>
              </div>

              {patientReports.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {patientReports.map((patient) => (
                    <motion.div
                      key={patient._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      whileHover={{ scale: 1.01, boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }}
                      onClick={() => setSelectedPatient(patient)}
                      style={{
                        padding: "1.5rem",
                        backgroundColor: "#f9fafb",
                        borderRadius: "0.75rem",
                        border: "1px solid #e5e7eb",
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
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
                            {patient.name.charAt(0)}
                          </div>
                          <div>
                            <h4 style={{ fontSize: "1.125rem", fontWeight: "600", color: "#1e3a8a", marginBottom: "0.25rem" }}>
                              {patient.name}
                            </h4>
                            <div style={{ display: "flex", gap: "1rem", fontSize: "0.875rem", color: "#6b7280" }}>
                              <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                                <Mail size={14} />
                                {patient.email}
                              </span>
                              {patient.age && (
                                <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                                  <User size={14} />
                                  Age: {patient.age}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <span style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                          {formatDate(patient.reportDate)}
                        </span>
                      </div>

                      {patient.diagnosis && (
                        <div style={{ marginBottom: "0.75rem" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                            <Stethoscope size={16} style={{ color: "#ef4444" }} />
                            <strong style={{ fontSize: "0.875rem", color: "#374151" }}>Diagnosis:</strong>
                          </div>
                          <p style={{ fontSize: "0.875rem", color: "#1e3a8a", marginLeft: "1.5rem" }}>{patient.diagnosis}</p>
                        </div>
                      )}

                      {patient.doctorNotes && (
                        <div style={{ marginBottom: "0.75rem" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                            <FileTextIcon size={16} style={{ color: "#10b981" }} />
                            <strong style={{ fontSize: "0.875rem", color: "#374151" }}>Doctor Notes:</strong>
                          </div>
                          <p style={{ fontSize: "0.875rem", color: "#1e3a8a", marginLeft: "1.5rem" }}>{patient.doctorNotes}</p>
                        </div>
                      )}

                      {patient.history && patient.history.length > 0 && (
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                            <Clock size={16} style={{ color: "#f59e0b" }} />
                            <strong style={{ fontSize: "0.875rem", color: "#374151" }}>Medical History:</strong>
                          </div>
                          <ul style={{ marginLeft: "1.5rem", fontSize: "0.875rem", color: "#1e3a8a" }}>
                            {patient.history.map((item, idx) => (
                              <li key={idx} style={{ marginBottom: "0.25rem" }}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {patient.images && patient.images.length > 0 && (
                        <div style={{ marginTop: "0.75rem" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                            <Image size={16} style={{ color: "#6366f1" }} />
                            <strong style={{ fontSize: "0.875rem", color: "#374151" }}>Images: {patient.images.length}</strong>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "2rem", color: "#6b7280" }}>
                  <FileTextIcon size={48} style={{ marginBottom: "1rem", opacity: 0.5 }} />
                  <p>No patient reports available yet.</p>
                </div>
              )}
            </motion.div>
          </>
        )}

        {/* Patient Report Detail Modal */}
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
                maxWidth: "700px",
                width: "90%",
                maxHeight: "80vh",
                overflowY: "auto",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <h2 style={{ fontSize: "1.5rem", fontWeight: "700", color: "#1e3a8a" }}>
                  Medical Report - {selectedPatient.name}
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
                  <label style={{ fontSize: "0.875rem", fontWeight: "600", color: "#6b7280" }}>Patient Information</label>
                  <div style={{ marginTop: "0.5rem", padding: "1rem", backgroundColor: "#f9fafb", borderRadius: "0.5rem" }}>
                    <p><strong>Name:</strong> {selectedPatient.name}</p>
                    <p><strong>Email:</strong> {selectedPatient.email}</p>
                    <p><strong>Phone:</strong> {selectedPatient.phone}</p>
                    {selectedPatient.age && <p><strong>Age:</strong> {selectedPatient.age}</p>}
                    {selectedPatient.gender && <p><strong>Gender:</strong> {selectedPatient.gender}</p>}
                  </div>
                </div>

                {selectedPatient.diagnosis && (
                  <div>
                    <label style={{ fontSize: "0.875rem", fontWeight: "600", color: "#6b7280" }}>Diagnosis</label>
                    <p style={{ marginTop: "0.5rem", padding: "1rem", backgroundColor: "#fef2f2", borderRadius: "0.5rem", color: "#991b1b" }}>
                      {selectedPatient.diagnosis}
                    </p>
                  </div>
                )}

                {selectedPatient.doctorNotes && (
                  <div>
                    <label style={{ fontSize: "0.875rem", fontWeight: "600", color: "#6b7280" }}>Doctor Notes</label>
                    <p style={{ marginTop: "0.5rem", padding: "1rem", backgroundColor: "#f0fdf4", borderRadius: "0.5rem", color: "#065f46" }}>
                      {selectedPatient.doctorNotes}
                    </p>
                  </div>
                )}

                {selectedPatient.history && selectedPatient.history.length > 0 && (
                  <div>
                    <label style={{ fontSize: "0.875rem", fontWeight: "600", color: "#6b7280" }}>Medical History</label>
                    <ul style={{ marginTop: "0.5rem", padding: "1rem", backgroundColor: "#fef3c7", borderRadius: "0.5rem", paddingLeft: "2rem" }}>
                      {selectedPatient.history.map((item, idx) => (
                        <li key={idx} style={{ marginBottom: "0.5rem", color: "#92400e" }}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedPatient.images && selectedPatient.images.length > 0 && (
                  <div>
                    <label style={{ fontSize: "0.875rem", fontWeight: "600", color: "#6b7280" }}>Medical Images ({selectedPatient.images.length})</label>
                    <div style={{ marginTop: "0.5rem", display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                      {selectedPatient.images.map((img, idx) => (
                        <div key={idx} style={{ padding: "0.5rem", backgroundColor: "#eef2ff", borderRadius: "0.5rem" }}>
                          <Image size={20} style={{ color: "#6366f1" }} />
                          <span style={{ fontSize: "0.875rem", marginLeft: "0.5rem" }}>Image {idx + 1}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label style={{ fontSize: "0.875rem", fontWeight: "600", color: "#6b7280" }}>Report Date</label>
                  <p style={{ marginTop: "0.5rem" }}>{formatDate(selectedPatient.reportDate)}</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorReports;