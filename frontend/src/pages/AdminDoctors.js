import React, { useState, useEffect } from "react";
import AdminSidebar from "../components/AdminSidebar";
import { motion } from "framer-motion";
import { Search, Filter, User, Mail, Phone, Briefcase, Award, Calendar, Edit, Trash2, X, Save, AlertCircle, CheckCircle } from "lucide-react";
import axios from "axios";
import styles from "../styles/DoctorDashboard.module.css";

export default function AdminDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [error, setError] = useState(null);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [message, setMessage] = useState({ type: "", text: "" });
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    filterDoctors();
  }, [searchTerm, selectedCategory, doctors]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      // Try admin endpoint first, fallback to doctor endpoint
      let response;
      try {
        response = await axios.get("http://localhost:4000/api/admins/doctors");
      } catch (err) {
        response = await axios.get("http://localhost:4000/api/doctors/all");
      }
      setDoctors(response.data || []);
      setFilteredDoctors(response.data || []);
    } catch (err) {
      console.error("Error fetching doctors:", err);
      // Use mock data if API fails
      const mockDoctors = [
        {
          _id: "1",
          fullName: "Dr. John Smith",
          email: "john.smith@example.com",
          phone: "+94 77 123 4567",
          specialization: "Orthodontist",
          hospital: "Colombo National Hospital",
          experience: 10,
          qualifications: "MBBS, MD",
          createdAt: "2024-01-15",
        },
        {
          _id: "2",
          fullName: "Dr. Sarah Johnson",
          email: "sarah.j@example.com",
          phone: "+94 77 234 5678",
          specialization: "Periodontist",
          hospital: "Kandy General Hospital",
          experience: 8,
          qualifications: "BDS, MDS",
          createdAt: "2024-02-20",
        },
        {
          _id: "3",
          fullName: "Dr. Michael Brown",
          email: "michael.b@example.com",
          phone: "+94 77 345 6789",
          specialization: "Endodontist",
          hospital: "Galle Teaching Hospital",
          experience: 12,
          qualifications: "BDS, FRCS",
          createdAt: "2024-03-10",
        },
        {
          _id: "4",
          fullName: "Dr. Emily Davis",
          email: "emily.d@example.com",
          phone: "+94 77 456 7890",
          specialization: "Pediatric Dentist",
          hospital: "Colombo National Hospital",
          experience: 5,
          qualifications: "BDS, MDS",
          createdAt: "2024-04-05",
        },
      ];
      setDoctors(mockDoctors);
      setFilteredDoctors(mockDoctors);
    } finally {
      setLoading(false);
    }
  };

  const filterDoctors = () => {
    let filtered = [...doctors];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (doctor) =>
          doctor.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doctor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doctor.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doctor.hospital?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (doctor) => doctor.specialization?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    setFilteredDoctors(filtered);
  };

  const categories = [
    "all",
    ...new Set(doctors.map((d) => d.specialization).filter(Boolean)),
  ];

  const getCategoryCount = (category) => {
    if (category === "all") return doctors.length;
    return doctors.filter((d) => d.specialization?.toLowerCase() === category.toLowerCase()).length;
  };

  const handleEdit = (doctor) => {
    setEditingDoctor(doctor._id);
    setEditFormData({
      fullName: doctor.fullName || "",
      email: doctor.email || "",
      phone: doctor.phone || "",
      licenseNumber: doctor.licenseNumber || "",
      specialization: doctor.specialization || "",
      qualifications: doctor.qualifications || "",
      hospital: doctor.hospital || "",
      experience: doctor.experience || "",
    });
  };

  const handleCancelEdit = () => {
    setEditingDoctor(null);
    setEditFormData({});
  };

  const handleSaveEdit = async (doctorId) => {
    try {
      setLoading(true);
      const response = await axios.put(
        `http://localhost:4000/api/admins/doctors/${doctorId}`,
        editFormData
      );

      if (response.data.message === "Doctor updated successfully") {
        setMessage({ type: "success", text: "Doctor updated successfully!" });
        setEditingDoctor(null);
        setEditFormData({});
        // Refresh doctors list
        await fetchDoctors();
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to update doctor. Please try again.",
      });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (doctorId) => {
    try {
      setLoading(true);
      const response = await axios.delete(
        `http://localhost:4000/api/admins/doctors/${doctorId}`
      );

      if (response.data.message === "Doctor deleted successfully") {
        setMessage({ type: "success", text: "Doctor deleted successfully!" });
        setDeleteConfirm(null);
        // Refresh doctors list
        await fetchDoctors();
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to delete doctor. Please try again.",
      });
      setDeleteConfirm(null);
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } finally {
      setLoading(false);
    }
  };

  const specializations = [
    "Orthodontist",
    "Periodontist",
    "Endodontist",
    "Oral Surgeon",
    "Prosthodontist",
    "Pediatric Dentist",
    "Oral Pathologist",
    "General Dentist",
    "Cosmetic Dentist",
    "Implantologist",
    "Other",
  ];

  if (loading) {
    return (
      <div className={styles.dashboardWrapper}>
        <AdminSidebar />
        <div className={styles.mainContentArea}>
          <div style={{ textAlign: "center", padding: "3rem" }}>Loading doctors...</div>
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
            <h1 className={styles.mainTitle}>Manage Doctors</h1>
            <p className={styles.statsGridLabel}>View and categorize all registered doctors</p>
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
                placeholder="Search by name, email, specialization, or hospital..."
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
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
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
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === "all" ? "All Specializations" : cat} ({getCategoryCount(cat)})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ marginTop: "1rem", color: "#6b7280", fontSize: "0.875rem" }}>
            Showing {filteredDoctors.length} of {doctors.length} doctors
          </div>
        </motion.div>

        {/* Doctors Grid */}
        {filteredDoctors.length > 0 ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {filteredDoctors.map((doctor, index) => (
              <motion.div
                key={doctor._id || index}
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
                    {doctor.fullName?.charAt(0) || "D"}
                  </div>
                  <div style={{ flex: "1" }}>
                    <h3 style={{ fontSize: "1.25rem", fontWeight: "600", color: "#1e3a8a", marginBottom: "0.25rem" }}>
                      {doctor.fullName || "Unknown Doctor"}
                    </h3>
                    {doctor.specialization && (
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
                        {doctor.specialization}
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {doctor.email && (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#6b7280" }}>
                      <Mail size={16} />
                      <span style={{ fontSize: "0.875rem" }}>{doctor.email}</span>
                    </div>
                  )}

                  {doctor.phone && (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#6b7280" }}>
                      <Phone size={16} />
                      <span style={{ fontSize: "0.875rem" }}>{doctor.phone}</span>
                    </div>
                  )}

                  {doctor.hospital && (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#6b7280" }}>
                      <Briefcase size={16} />
                      <span style={{ fontSize: "0.875rem" }}>{doctor.hospital}</span>
                    </div>
                  )}

                  {doctor.experience && (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#6b7280" }}>
                      <Calendar size={16} />
                      <span style={{ fontSize: "0.875rem" }}>{doctor.experience} years of experience</span>
                    </div>
                  )}

                  {doctor.qualifications && (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#6b7280" }}>
                      <Award size={16} />
                      <span style={{ fontSize: "0.875rem" }}>{doctor.qualifications}</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid #e5e7eb" }}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleEdit(doctor)}
                    style={{
                      flex: 1,
                      padding: "0.5rem",
                      backgroundColor: "#3b82f6",
                      color: "white",
                      border: "none",
                      borderRadius: "0.5rem",
                      cursor: "pointer",
                      fontSize: "0.875rem",
                      fontWeight: "600",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <Edit size={16} />
                    Edit
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setDeleteConfirm(doctor._id)}
                    style={{
                      flex: 1,
                      padding: "0.5rem",
                      backgroundColor: "#ef4444",
                      color: "white",
                      border: "none",
                      borderRadius: "0.5rem",
                      cursor: "pointer",
                      fontSize: "0.875rem",
                      fontWeight: "600",
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
              No doctors found matching your search criteria.
            </p>
          </div>
        )}

        {/* Edit Modal */}
        {editingDoctor && (
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
            onClick={handleCancelEdit}
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
                <h2 style={{ fontSize: "1.5rem", fontWeight: "700", color: "#1e3a8a" }}>Edit Doctor</h2>
                <button
                  onClick={handleCancelEdit}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: "1.5rem",
                    cursor: "pointer",
                    color: "#6b7280",
                  }}
                >
                  <X size={24} />
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "#374151" }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={editFormData.fullName}
                    onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid #d1d5db",
                      borderRadius: "0.5rem",
                      fontSize: "1rem",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "#374151" }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid #d1d5db",
                      borderRadius: "0.5rem",
                      fontSize: "1rem",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "#374151" }}>
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid #d1d5db",
                      borderRadius: "0.5rem",
                      fontSize: "1rem",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "#374151" }}>
                    License Number
                  </label>
                  <input
                    type="text"
                    value={editFormData.licenseNumber}
                    onChange={(e) => setEditFormData({ ...editFormData, licenseNumber: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid #d1d5db",
                      borderRadius: "0.5rem",
                      fontSize: "1rem",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "#374151" }}>
                    Specialization
                  </label>
                  <select
                    value={editFormData.specialization}
                    onChange={(e) => setEditFormData({ ...editFormData, specialization: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid #d1d5db",
                      borderRadius: "0.5rem",
                      fontSize: "1rem",
                      backgroundColor: "white",
                    }}
                  >
                    <option value="">Select Specialization</option>
                    {specializations.map((spec) => (
                      <option key={spec} value={spec}>
                        {spec}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "#374151" }}>
                    Hospital / Workplace
                  </label>
                  <input
                    type="text"
                    value={editFormData.hospital}
                    onChange={(e) => setEditFormData({ ...editFormData, hospital: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid #d1d5db",
                      borderRadius: "0.5rem",
                      fontSize: "1rem",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "#374151" }}>
                    Years of Experience
                  </label>
                  <input
                    type="number"
                    value={editFormData.experience}
                    onChange={(e) => setEditFormData({ ...editFormData, experience: e.target.value })}
                    min="0"
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid #d1d5db",
                      borderRadius: "0.5rem",
                      fontSize: "1rem",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "#374151" }}>
                    Qualifications
                  </label>
                  <textarea
                    rows="3"
                    value={editFormData.qualifications}
                    onChange={(e) => setEditFormData({ ...editFormData, qualifications: e.target.value })}
                    placeholder="MBBS, MD, BDS, MDS, etc."
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid #d1d5db",
                      borderRadius: "0.5rem",
                      fontSize: "1rem",
                      resize: "vertical",
                    }}
                  />
                </div>

                <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSaveEdit(editingDoctor)}
                    disabled={loading}
                    style={{
                      flex: 1,
                      padding: "0.75rem",
                      backgroundColor: "#3b82f6",
                      color: "white",
                      border: "none",
                      borderRadius: "0.5rem",
                      fontSize: "1rem",
                      fontWeight: "600",
                      cursor: loading ? "not-allowed" : "pointer",
                      opacity: loading ? 0.7 : 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <Save size={18} />
                    {loading ? "Saving..." : "Save Changes"}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCancelEdit}
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
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <X size={18} />
                    Cancel
                  </motion.button>
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
                  Delete Doctor?
                </h2>
                <p style={{ color: "#6b7280" }}>
                  Are you sure you want to delete this doctor? This action cannot be undone and will also delete all associated appointments.
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

