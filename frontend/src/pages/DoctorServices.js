import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DoctorSidebar from "../components/DoctorSidebar";
import { motion } from "framer-motion";
import { Plus, X, Save, Trash2, Edit, Check, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react";
import axios from "axios";
import "../styles/DoctorServices.css";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:4000/api";

export default function DoctorServices() {
  const navigate = useNavigate();
  const [allServices, setAllServices] = useState([]);
  const [doctorServices, setDoctorServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [showAddService, setShowAddService] = useState(false);
  const [newService, setNewService] = useState({
    name: "",
    description: "",
    category: "General",
  });
  const [editingService, setEditingService] = useState(null);
  const [doctorId, setDoctorId] = useState(null);

  const categories = [
    "General",
    "Orthodontic",
    "Surgical",
    "Endodontic",
    "Cosmetic",
    "Restorative",
    "Emergency",
    "Pediatric",
    "Periodontic",
  ];

  useEffect(() => {
    const doctor = JSON.parse(localStorage.getItem("doctor") || "{}");
    if (doctor._id) {
      setDoctorId(doctor._id);
      fetchServices();
      fetchDoctorServices(doctor._id);
    } else {
      setLoading(false);
      setMessage({ type: "error", text: "Doctor not found. Please login again." });
    }
  }, []);

  const fetchServices = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/services`);
      setAllServices(response.data || []);
    } catch (error) {
      console.error("Error fetching services:", error);
      setMessage({ type: "error", text: "Failed to load available services" });
    }
  };

  const fetchDoctorServices = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/doctors/profile/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDoctorServices(response.data.doctor?.services || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching doctor services:", error);
      setLoading(false);
      setMessage({ type: "error", text: "Failed to load your services" });
    }
  };

  const handleAddService = () => {
    if (!newService.name.trim()) {
      setMessage({ type: "error", text: "Please enter a service name" });
      return;
    }

    if (doctorServices.includes(newService.name)) {
      setMessage({ type: "error", text: "Service already added" });
      return;
    }

    setDoctorServices([...doctorServices, newService.name]);
    setNewService({ name: "", description: "", category: "General" });
    setShowAddService(false);
    setMessage({ type: "success", text: "Service added (click Save to update)" });
  };

  const handleRemoveService = (serviceName) => {
    setDoctorServices(doctorServices.filter((s) => s !== serviceName));
    setMessage({ type: "success", text: "Service removed (click Save to update)" });
  };

  const handleSaveServices = async () => {
    if (!doctorId) return;

    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_BASE_URL}/doctors/${doctorId}/services`,
        { services: doctorServices },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessage({ type: "success", text: "Services updated successfully!" });
      
      // Update localStorage doctor data
      const doctor = JSON.parse(localStorage.getItem("doctor") || "{}");
      doctor.services = doctorServices;
      localStorage.setItem("doctor", JSON.stringify(doctor));
    } catch (error) {
      console.error("Error saving services:", error);
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to save services",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCreateNewService = async () => {
    if (!newService.name.trim()) {
      setMessage({ type: "error", text: "Please enter a service name" });
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_BASE_URL}/services`,
        {
          name: newService.name,
          description: newService.description,
          category: newService.category,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Add the new service to doctor's services
      if (!doctorServices.includes(newService.name)) {
        setDoctorServices([...doctorServices, newService.name]);
      }

      // Refresh services list
      await fetchServices();

      setNewService({ name: "", description: "", category: "General" });
      setShowAddService(false);
      setMessage({ type: "success", text: "Service created and added successfully!" });
    } catch (error) {
      console.error("Error creating service:", error);
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to create service",
      });
    } finally {
      setSaving(false);
    }
  };

  const getServicesByCategory = () => {
    const categorized = {};
    allServices.forEach((service) => {
      const category = service.category || "General";
      if (!categorized[category]) {
        categorized[category] = [];
      }
      categorized[category].push(service);
    });
    return categorized;
  };

  if (loading) {
    return (
      <div className="doctor-services-layout">
        <DoctorSidebar />
        <div className="doctor-services-content">
          <div style={{ textAlign: "center", padding: "3rem" }}>Loading services...</div>
        </div>
      </div>
    );
  }

  const categorizedServices = getServicesByCategory();

  return (
    <div className="doctor-services-layout">
      <DoctorSidebar />
      <div className="doctor-services-content">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="doctor-services-container"
        >
          <div className="services-header">
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <button
                onClick={() => navigate("/doctor/dashboard")}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "0.5rem",
                  borderRadius: "50%",
                  transition: "background-color 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f3f4f6")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                title="Back to Dashboard"
              >
                <ArrowLeft size={24} color="#1e3a8a" />
              </button>
              <div>
                <h1>Manage Services</h1>
                <p>Add and manage the services you offer to patients</p>
              </div>
            </div>
          </div>

          {message.text && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`message ${message.type}`}
            >
              {message.type === "success" ? (
                <CheckCircle size={20} />
              ) : (
                <AlertCircle size={20} />
              )}
              <span>{message.text}</span>
            </motion.div>
          )}

          {/* My Services Section */}
          <div className="services-section">
            <div className="section-header">
              <h2>My Services ({doctorServices.length})</h2>
              <button
                className="btn-primary"
                onClick={() => setShowAddService(!showAddService)}
              >
                <Plus size={18} /> {showAddService ? "Cancel" : "Add Service"}
              </button>
            </div>

            {showAddService && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="add-service-form"
              >
                <h3>Add New Service</h3>
                <div className="form-group">
                  <label>Service Name *</label>
                  <input
                    type="text"
                    value={newService.name}
                    onChange={(e) =>
                      setNewService({ ...newService, name: e.target.value })
                    }
                    placeholder="e.g., Teeth Whitening"
                  />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={newService.category}
                    onChange={(e) =>
                      setNewService({ ...newService, category: e.target.value })
                    }
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Description (Optional)</label>
                  <textarea
                    value={newService.description}
                    onChange={(e) =>
                      setNewService({ ...newService, description: e.target.value })
                    }
                    placeholder="Brief description of the service..."
                    rows={3}
                  />
                </div>
                <div className="form-actions">
                  <button
                    className="btn-secondary"
                    onClick={() => {
                      setShowAddService(false);
                      setNewService({ name: "", description: "", category: "General" });
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn-primary"
                    onClick={handleCreateNewService}
                    disabled={saving}
                  >
                    {saving ? "Creating..." : "Create & Add Service"}
                  </button>
                </div>
              </motion.div>
            )}

            {doctorServices.length === 0 ? (
              <div className="empty-state">
                <p>No services added yet. Click "Add Service" to get started.</p>
              </div>
            ) : (
              <div className="services-list">
                {doctorServices.map((serviceName, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="service-item"
                  >
                    <div className="service-info">
                      <span className="service-name">{serviceName}</span>
                    </div>
                    <button
                      className="btn-icon"
                      onClick={() => handleRemoveService(serviceName)}
                      title="Remove service"
                    >
                      <X size={18} />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}

            {doctorServices.length > 0 && (
              <div className="save-section">
                <button
                  className="btn-save"
                  onClick={handleSaveServices}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <div className="spinner" /> Saving...
                    </>
                  ) : (
                    <>
                      <Save size={18} /> Save Changes
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Available Services Section */}
          <div className="services-section">
            <div className="section-header">
              <h2>Available Services by Category</h2>
              <p className="section-subtitle">
                Browse and add services from the available list
              </p>
            </div>

            {Object.keys(categorizedServices).length === 0 ? (
              <div className="empty-state">
                <p>No services available. Create a new service above.</p>
              </div>
            ) : (
              <div className="categorized-services">
                {Object.keys(categorizedServices).map((category) => (
                  <div key={category} className="category-group">
                    <h3 className="category-title">{category}</h3>
                    <div className="category-services">
                      {categorizedServices[category].map((service) => {
                        const isAdded = doctorServices.includes(service.name);
                        return (
                          <div
                            key={service._id}
                            className={`service-card ${isAdded ? "added" : ""}`}
                          >
                            <div className="service-card-content">
                              <h4>{service.name}</h4>
                              {service.description && (
                                <p className="service-description">{service.description}</p>
                              )}
                              <div className="service-meta">
                                <span className="service-duration">
                                  Duration: {service.duration || 30} min
                                </span>
                              </div>
                            </div>
                            <button
                              className={`btn-add-service ${isAdded ? "added" : ""}`}
                              onClick={() => {
                                if (isAdded) {
                                  handleRemoveService(service.name);
                                } else {
                                  setDoctorServices([...doctorServices, service.name]);
                                  setMessage({
                                    type: "success",
                                    text: "Service added (click Save to update)",
                                  });
                                }
                              }}
                              disabled={saving}
                            >
                              {isAdded ? (
                                <>
                                  <Check size={16} /> Added
                                </>
                              ) : (
                                <>
                                  <Plus size={16} /> Add
                                </>
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

