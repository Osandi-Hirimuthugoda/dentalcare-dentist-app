import React, { useState, useEffect } from "react";
import axios from "axios";
import { Users, Search, RefreshCw, X, Calendar, Phone, Mail, Clock, FileText } from "lucide-react";
import DoctorSidebar from "../../components/layout/DoctorSidebar";
import "../../styles/pages/Patients.css";

const API = "/api";

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const doc = JSON.parse(localStorage.getItem("doctor") || "{}");
      if (!doc._id) return;

      // Fetch patients associated with this doctor
      const [patientsRes, appointmentsRes] = await Promise.all([
        axios.get(`${API}/patients/doctor/${doc._id}`),
        axios.get(`${API}/appointments/doctor/${doc._id}`)
      ]);

      setPatients(patientsRes.data || []);
      setAppointments(appointmentsRes.data || []);
    } catch (error) {
      console.error("Failed to fetch patients:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter((p) => {
    const q = search.toLowerCase();
    return (
      (p.name || "").toLowerCase().includes(q) ||
      (p.email || "").toLowerCase().includes(q) ||
      (p.phone || "").toLowerCase().includes(q)
    );
  });

  const getPatientAppointments = (patientId) => {
    return appointments
      .filter((apt) => apt.patient && apt.patient._id === patientId)
      .sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
  };

  const handleViewPatient = (patient) => {
    setSelectedPatient(patient);
  };

  const closeModal = () => {
    setSelectedPatient(null);
  };

  if (loading) {
    return (
      <div className="pts-wrapper">
        <DoctorSidebar />
        <div className="pts-content">
          <div className="pts-loading">
            <div className="pts-spinner" />
            <p>Loading your patients...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pts-wrapper">
      <DoctorSidebar />

      <div className="pts-content">
        {/* Header */}
        <div className="pts-header">
          <div className="pts-header-left">
            <h1><Users size={24} color="#00897B" /> My Patients</h1>
            <p>{filteredPatients.length} patient{filteredPatients.length !== 1 ? "s" : ""} total</p>
          </div>
          <button className="pts-refresh-btn" onClick={fetchData}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {/* Search */}
        <div className="pts-search">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search patients by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Table Card */}
        <div className="pts-card">
          {filteredPatients.length === 0 ? (
            <div className="pts-empty">
              <Users size={48} />
              <h3>No patients found</h3>
              <p>{search ? "Try adjusting your search query." : "You have no patients yet."}</p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="pts-table">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Contact Info</th>
                    <th>Age / Gender</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPatients.map((pt) => (
                    <tr key={pt._id}>
                      {/* Name */}
                      <td>
                        <div className="pt-name-cell">
                          <div className="pt-avatar">
                            {(pt.name || "U").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="pt-name">{pt.name || "Unknown"}</div>
                          </div>
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td>
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                          <div className="pt-meta">
                            <Mail size={12} /> {pt.email || "N/A"}
                          </div>
                          <div className="pt-meta">
                            <Phone size={12} /> {pt.phone || "N/A"}
                          </div>
                        </div>
                      </td>

                      {/* Age / Gender */}
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ fontWeight: 600, color: "#374151" }}>{pt.age ? `${pt.age} yrs` : "N/A"}</span>
                          <span className={`pt-badge ${pt.gender === 'Male' ? 'pt-badge-male' : pt.gender === 'Female' ? 'pt-badge-female' : 'pt-badge-other'}`}>
                            {pt.gender || "N/A"}
                          </span>
                        </div>
                      </td>

                      {/* Joined */}
                      <td>
                        <span style={{ color: "#6b7280", fontSize: "0.85rem" }}>
                          {pt.createdAt ? new Date(pt.createdAt).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' }) : "N/A"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td>
                        <button className="pt-view-btn" onClick={() => handleViewPatient(pt)}>
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Patient Details Modal */}
      {selectedPatient && (
        <div className="pts-modal-overlay" onClick={closeModal}>
          <div className="pts-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-top">
              <h2>Patient Profile</h2>
              <button className="modal-close" onClick={closeModal}>
                <X size={16} />
              </button>
            </div>
            <div className="modal-body">
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
                <div className="pt-avatar" style={{ width: 56, height: 56, fontSize: "1.5rem" }}>
                  {(selectedPatient.name || "U").charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 style={{ margin: "0 0 0.25rem", fontSize: "1.25rem", color: "#111827" }}>{selectedPatient.name}</h3>
                  <div style={{ display: "flex", gap: "0.5rem", color: "#6b7280", fontSize: "0.875rem" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}><Mail size={12} />{selectedPatient.email || "N/A"}</span>
                    <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}><Phone size={12} />{selectedPatient.phone || "N/A"}</span>
                  </div>
                </div>
              </div>

              <div className="pt-info-grid">
                <div className="pt-info-item">
                  <span className="pt-info-label">Age</span>
                  <span className="pt-info-value">{selectedPatient.age || "Not specified"}</span>
                </div>
                <div className="pt-info-item">
                  <span className="pt-info-label">Gender</span>
                  <span className="pt-info-value">{selectedPatient.gender || "Not specified"}</span>
                </div>
                <div className="pt-info-item full">
                  <span className="pt-info-label">Patient Since</span>
                  <span className="pt-info-value">
                    {selectedPatient.createdAt ? new Date(selectedPatient.createdAt).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' }) : "Unknown"}
                  </span>
                </div>
              </div>

              <h4 className="modal-section-title"><Calendar size={16} color="#00897B" /> Appointment History</h4>
              {getPatientAppointments(selectedPatient._id).length > 0 ? (
                <div className="apt-list">
                  {getPatientAppointments(selectedPatient._id).map((apt) => (
                    <div key={apt._id} className="apt-item">
                      <div className="apt-item-info">
                        <div className="apt-date">
                          {new Date(apt.startTime).toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                        <div className="apt-time">
                          <Clock size={12} /> {new Date(apt.startTime).toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        {apt.notes && (
                          <div className="apt-notes"><FileText size={10} style={{ display: "inline", marginRight: "2px" }} /> {apt.notes}</div>
                        )}
                      </div>
                      <div>
                        <span className={`apt-badge apt-${apt.status || "pending"}`}>{apt.status || "Pending"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "1.5rem", background: "#f9fafb", borderRadius: "0.5rem", color: "#6b7280", fontSize: "0.875rem" }}>
                  No past appointments found.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
