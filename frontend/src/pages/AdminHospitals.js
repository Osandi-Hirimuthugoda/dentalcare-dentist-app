import React, { useState, useEffect } from "react";
import AdminSidebar from "../components/AdminSidebar";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Building2,
  X,
  Check,
  AlertCircle,
} from "lucide-react";
import axios from "axios";
import styles from "../styles/DoctorDashboard.module.css";

const SRI_LANKAN_DISTRICTS = [
  "Colombo",
  "Gampaha",
  "Kalutara",
  "Kandy",
  "Matale",
  "Nuwara Eliya",
  "Galle",
  "Matara",
  "Hambantota",
  "Jaffna",
  "Kilinochchi",
  "Mannar",
  "Vavuniya",
  "Mullaitivu",
  "Batticaloa",
  "Ampara",
  "Trincomalee",
  "Kurunegala",
  "Puttalam",
  "Anuradhapura",
  "Polonnaruwa",
  "Badulla",
  "Moneragala",
  "Ratnapura",
  "Kegalle",
];

export default function AdminHospitals() {
  const [hospitals, setHospitals] = useState([]);
  const [filteredHospitals, setFilteredHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingHospital, setEditingHospital] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [formData, setFormData] = useState({
    name: "",
    district: "",
    address: "",
    city: "",
    phone: "",
    email: "",
    website: "",
    description: "",
    facilities: "",
    isActive: true,
  });

  useEffect(() => {
    fetchHospitals();
  }, []);

  useEffect(() => {
    filterHospitals();
  }, [searchTerm, selectedDistrict, hospitals]);

  const fetchHospitals = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:4000/api/hospitals", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken") || ""}`,
        },
      });
      setHospitals(response.data.hospitals || []);
      setFilteredHospitals(response.data.hospitals || []);
    } catch (err) {
      console.error("Error fetching hospitals:", err);
      setMessage({
        type: "error",
        text: "Failed to load hospitals. Please try again.",
      });
      setHospitals([]);
      setFilteredHospitals([]);
    } finally {
      setLoading(false);
    }
  };

  const filterHospitals = () => {
    let filtered = [...hospitals];

    if (searchTerm) {
      filtered = filtered.filter(
        (hospital) =>
          hospital.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          hospital.district?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          hospital.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          hospital.city?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedDistrict) {
      filtered = filtered.filter(
        (hospital) => hospital.district === selectedDistrict
      );
    }

    setFilteredHospitals(filtered);
  };

  const handleOpenModal = (hospital = null) => {
    if (hospital) {
      setEditingHospital(hospital);
      setFormData({
        name: hospital.name || "",
        district: hospital.district || "",
        address: hospital.address || "",
        city: hospital.city || "",
        phone: hospital.phone || "",
        email: hospital.email || "",
        website: hospital.website || "",
        description: hospital.description || "",
        facilities: hospital.facilities?.join(", ") || "",
        isActive: hospital.isActive !== undefined ? hospital.isActive : true,
      });
    } else {
      setEditingHospital(null);
      setFormData({
        name: "",
        district: "",
        address: "",
        city: "",
        phone: "",
        email: "",
        website: "",
        description: "",
        facilities: "",
        isActive: true,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingHospital(null);
    setFormData({
      name: "",
      district: "",
      address: "",
      city: "",
      phone: "",
      email: "",
      website: "",
      description: "",
      facilities: "",
      isActive: true,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const hospitalData = {
        ...formData,
        facilities: formData.facilities
          .split(",")
          .map((f) => f.trim())
          .filter((f) => f.length > 0),
      };

      if (editingHospital) {
        await axios.put(
          `http://localhost:4000/api/hospitals/${editingHospital._id}`,
          hospitalData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("adminToken") || ""}`,
            },
          }
        );
        setMessage({ type: "success", text: "Hospital updated successfully!" });
      } else {
        await axios.post("http://localhost:4000/api/hospitals", hospitalData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken") || ""}`,
          },
        });
        setMessage({ type: "success", text: "Hospital created successfully!" });
      }

      handleCloseModal();
      fetchHospitals();
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (err) {
      console.error("Error saving hospital:", err);
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to save hospital. Please try again.",
      });
      setTimeout(() => setMessage({ type: "", text: "" }), 5000);
    }
  };

  const handleDelete = async (hospitalId) => {
    try {
      await axios.delete(`http://localhost:4000/api/hospitals/${hospitalId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken") || ""}`,
        },
      });
      setMessage({ type: "success", text: "Hospital deleted successfully!" });
      setDeleteConfirm(null);
      fetchHospitals();
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (err) {
      console.error("Error deleting hospital:", err);
      setMessage({
        type: "error",
        text: "Failed to delete hospital. Please try again.",
      });
      setTimeout(() => setMessage({ type: "", text: "" }), 5000);
    }
  };

  if (loading) {
    return (
      <div className={styles.dashboardWrapper}>
        <AdminSidebar />
        <div className={styles.mainContentArea}>
          <div style={{ textAlign: "center", padding: "3rem" }}>Loading hospitals...</div>
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
            <h1 className={styles.mainTitle}>Hospital Management</h1>
            <p className={styles.statsGridLabel}>Manage hospitals across Sri Lankan districts</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleOpenModal()}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "0.5rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              fontSize: "1rem",
              fontWeight: "600",
            }}
          >
            <Plus size={20} /> Add Hospital
          </motion.button>
        </header>

        {message.text && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              padding: "1rem",
              marginBottom: "1.5rem",
              borderRadius: "0.5rem",
              backgroundColor: message.type === "success" ? "#d1fae5" : "#fee2e2",
              color: message.type === "success" ? "#065f46" : "#991b1b",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            {message.type === "success" ? (
              <Check size={20} />
            ) : (
              <AlertCircle size={20} />
            )}
            {message.text}
          </motion.div>
        )}

        {/* Filters */}
        <div
          style={{
            display: "flex",
            gap: "1rem",
            marginBottom: "1.5rem",
            flexWrap: "wrap",
          }}
        >
          <div style={{ position: "relative", flex: "1", minWidth: "300px" }}>
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
              placeholder="Search hospitals..."
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
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            style={{
              padding: "0.75rem 1rem",
              border: "1px solid #d1d5db",
              borderRadius: "0.75rem",
              fontSize: "1rem",
              outline: "none",
              minWidth: "200px",
            }}
          >
            <option value="">All Districts</option>
            {SRI_LANKAN_DISTRICTS.map((district) => (
              <option key={district} value={district}>
                {district}
              </option>
            ))}
          </select>
        </div>

        {/* Hospitals List */}
        {filteredHospitals.length > 0 ? (
          <div style={{ display: "grid", gap: "1rem" }}>
            {filteredHospitals.map((hospital) => (
              <motion.div
                key={hospital._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  backgroundColor: "white",
                  padding: "1.5rem",
                  borderRadius: "0.75rem",
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                      <Building2 size={20} color="#3b82f6" />
                      <h3 style={{ fontSize: "1.25rem", fontWeight: "600", margin: 0 }}>
                        {hospital.name}
                      </h3>
                      {hospital.isActive ? (
                        <span
                          style={{
                            padding: "0.25rem 0.5rem",
                            backgroundColor: "#d1fae5",
                            color: "#065f46",
                            borderRadius: "0.25rem",
                            fontSize: "0.75rem",
                            fontWeight: "600",
                          }}
                        >
                          Active
                        </span>
                      ) : (
                        <span
                          style={{
                            padding: "0.25rem 0.5rem",
                            backgroundColor: "#fee2e2",
                            color: "#991b1b",
                            borderRadius: "0.25rem",
                            fontSize: "0.75rem",
                            fontWeight: "600",
                          }}
                        >
                          Inactive
                        </span>
                      )}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", color: "#6b7280" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <MapPin size={16} />
                        <span>{hospital.district}</span>
                        {hospital.city && <span>• {hospital.city}</span>}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <MapPin size={16} />
                        <span>{hospital.address}</span>
                      </div>
                      {hospital.phone && (
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <Phone size={16} />
                          <span>{hospital.phone}</span>
                        </div>
                      )}
                      {hospital.email && (
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <Mail size={16} />
                          <span>{hospital.email}</span>
                        </div>
                      )}
                      {hospital.website && (
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <Globe size={16} />
                          <a href={hospital.website} target="_blank" rel="noopener noreferrer" style={{ color: "#3b82f6" }}>
                            {hospital.website}
                          </a>
                        </div>
                      )}
                      {hospital.facilities && hospital.facilities.length > 0 && (
                        <div style={{ marginTop: "0.5rem" }}>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                            {hospital.facilities.map((facility, idx) => (
                              <span
                                key={idx}
                                style={{
                                  padding: "0.25rem 0.5rem",
                                  backgroundColor: "#eff6ff",
                                  color: "#1e40af",
                                  borderRadius: "0.25rem",
                                  fontSize: "0.75rem",
                                }}
                              >
                                {facility}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                      onClick={() => handleOpenModal(hospital)}
                      style={{
                        padding: "0.5rem",
                        backgroundColor: "#f3f4f6",
                        border: "none",
                        borderRadius: "0.5rem",
                        cursor: "pointer",
                      }}
                    >
                      <Edit size={18} color="#3b82f6" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(hospital._id)}
                      style={{
                        padding: "0.5rem",
                        backgroundColor: "#fee2e2",
                        border: "none",
                        borderRadius: "0.5rem",
                        cursor: "pointer",
                      }}
                    >
                      <Trash2 size={18} color="#dc2626" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "3rem", color: "#6b7280" }}>
            No hospitals found
          </div>
        )}

        {/* Add/Edit Modal */}
        {showModal && (
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
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                backgroundColor: "white",
                padding: "2rem",
                borderRadius: "1rem",
                width: "90%",
                maxWidth: "600px",
                maxHeight: "90vh",
                overflow: "auto",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <h2 style={{ fontSize: "1.5rem", fontWeight: "600", margin: 0 }}>
                  {editingHospital ? "Edit Hospital" : "Add New Hospital"}
                </h2>
                <button
                  onClick={handleCloseModal}
                  style={{
                    padding: "0.5rem",
                    backgroundColor: "transparent",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <div>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
                      Hospital Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
                      District *
                    </label>
                    <select
                      required
                      value={formData.district}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        border: "1px solid #d1d5db",
                        borderRadius: "0.5rem",
                        fontSize: "1rem",
                      }}
                    >
                      <option value="">Select District</option>
                      {SRI_LANKAN_DISTRICTS.map((district) => (
                        <option key={district} value={district}>
                          {district}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
                      Address *
                    </label>
                    <textarea
                      required
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      rows={3}
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

                  <div>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
                      City
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        border: "1px solid #d1d5db",
                        borderRadius: "0.5rem",
                        fontSize: "1rem",
                      }}
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div>
                      <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
                        Phone
                      </label>
                      <input
                        type="text"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
                      <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        style={{
                          width: "100%",
                          padding: "0.75rem",
                          border: "1px solid #d1d5db",
                          borderRadius: "0.5rem",
                          fontSize: "1rem",
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
                      Website
                    </label>
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
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
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
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

                  <div>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
                      Facilities (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={formData.facilities}
                      onChange={(e) => setFormData({ ...formData, facilities: e.target.value })}
                      placeholder="e.g., Emergency, ICU, Pharmacy"
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        border: "1px solid #d1d5db",
                        borderRadius: "0.5rem",
                        fontSize: "1rem",
                      }}
                    />
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      id="isActive"
                    />
                    <label htmlFor="isActive" style={{ fontWeight: "500" }}>
                      Active
                    </label>
                  </div>

                  <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                    <button
                      type="submit"
                      style={{
                        flex: 1,
                        padding: "0.75rem",
                        backgroundColor: "#3b82f6",
                        color: "white",
                        border: "none",
                        borderRadius: "0.5rem",
                        fontSize: "1rem",
                        fontWeight: "600",
                        cursor: "pointer",
                      }}
                    >
                      {editingHospital ? "Update Hospital" : "Add Hospital"}
                    </button>
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      style={{
                        flex: 1,
                        padding: "0.75rem",
                        backgroundColor: "#f3f4f6",
                        color: "#374151",
                        border: "none",
                        borderRadius: "0.5rem",
                        fontSize: "1rem",
                        fontWeight: "600",
                        cursor: "pointer",
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Delete Confirmation */}
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
              zIndex: 1001,
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                backgroundColor: "white",
                padding: "2rem",
                borderRadius: "1rem",
                maxWidth: "400px",
                width: "90%",
              }}
            >
              <h3 style={{ marginBottom: "1rem", fontSize: "1.25rem", fontWeight: "600" }}>
                Confirm Delete
              </h3>
              <p style={{ marginBottom: "1.5rem", color: "#6b7280" }}>
                Are you sure you want to delete this hospital? This action cannot be undone.
              </p>
              <div style={{ display: "flex", gap: "1rem" }}>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  style={{
                    flex: 1,
                    padding: "0.75rem",
                    backgroundColor: "#dc2626",
                    color: "white",
                    border: "none",
                    borderRadius: "0.5rem",
                    fontSize: "1rem",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  Delete
                </button>
                <button
                  onClick={() => setDeleteConfirm(null)}
                  style={{
                    flex: 1,
                    padding: "0.75rem",
                    backgroundColor: "#f3f4f6",
                    color: "#374151",
                    border: "none",
                    borderRadius: "0.5rem",
                    fontSize: "1rem",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}

