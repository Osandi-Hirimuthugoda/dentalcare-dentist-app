import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Stethoscope, User, Mail, Phone, Lock, Award, Briefcase, FileText, CheckCircle, AlertCircle } from "lucide-react";
import PasswordInput from "../../components/common/PasswordInput";
import { DENTAL_SPECIALIZATIONS } from "../../utils/constants";


const DoctorRegister = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    licenseNumber: "",
    specialization: "",
    experience: "",
    hospital: "",
    qualifications: "",
    services: [], // Services/categories doctor offers
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [availableServices, setAvailableServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid";

    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";

    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    if (!formData.licenseNumber.trim())
      newErrors.licenseNumber = "License number is required";

    if (!formData.specialization)
      newErrors.specialization = "Specialization is required";

    if (!formData.services || formData.services.length === 0)
      newErrors.services = "Please select at least one service you offer";

    if (!formData.experience)
      newErrors.experience = "Years of experience is required";

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      // Prepare data for API (remove confirmPassword)
      const { confirmPassword, ...submitData } = formData;

      const response = await axios.post(
        "http://localhost:4000/api/doctors/register",
        submitData
      );

      if (response.data.message === "Doctor registered successfully") {
        setSuccess(true);
        setMessage({ type: "success", text: "Registration successful! Redirecting to login..." });
        
        // Clear form
        setFormData({
          fullName: "",
          email: "",
          phone: "",
          password: "",
          confirmPassword: "",
          licenseNumber: "",
          specialization: "",
          experience: "",
          hospital: "",
          qualifications: "",
          services: [],
        });

        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate("/doctor-login");
        }, 2000);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Registration failed. Please try again.";
      setMessage({ type: "error", text: errorMessage });
      
      // Set specific field errors if available
      if (error.response?.data?.error) {
        setErrors({ submit: errorMessage });
      }
    } finally {
      setLoading(false);
    }
  };

  const specializations = DENTAL_SPECIALIZATIONS;

  // Fetch available services from backend
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoadingServices(true);
        const response = await axios.get("http://localhost:4000/api/services");
        setAvailableServices(response.data || []);
      } catch (error) {
        console.error("Error fetching services:", error);
        // Fallback to default services if API fails
        setAvailableServices([
          { name: "Dental Checkup" },
          { name: "Teeth Cleaning" },
          { name: "Tooth Filling" },
          { name: "Root Canal Treatment" },
          { name: "Dental Crown" },
          { name: "Tooth Extraction" },
          { name: "Braces Consultation" },
          { name: "Teeth Whitening" },
        ]);
      } finally {
        setLoadingServices(false);
      }
    };
    fetchServices();
  }, []);

  // Handle service selection
  const handleServiceToggle = (serviceName) => {
    setFormData((prev) => {
      const services = prev.services || [];
      if (services.includes(serviceName)) {
        return { ...prev, services: services.filter((s) => s !== serviceName) };
      } else {
        return { ...prev, services: [...services, serviceName] };
      }
    });
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 50%, #CBD5E1 100%)',
      padding: '2rem 1rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          width: '100%',
          maxWidth: '1000px',
          background: 'white',
          borderRadius: '20px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
          color: 'white',
          padding: '3rem 2rem',
          textAlign: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <Stethoscope size={48} />
            <h1 style={{ fontSize: '2.5rem', fontWeight: '700', margin: 0 }}>Doctor Registration</h1>
          </div>
          <p style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
            Join DentalCare+ network and provide exceptional dental care to patients
          </p>
        </div>

        <div style={{ padding: '2.5rem' }}>
          {/* Success/Error Messages */}
          {message.text && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                marginBottom: '1.5rem',
                padding: '1rem 1.25rem',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                background: message.type === "success" ? '#D1FAE5' : '#FEE2E2',
                color: message.type === "success" ? '#065F46' : '#991B1B',
                border: `1px solid ${message.type === "success" ? '#A7F3D0' : '#FCA5A5'}`
              }}
            >
              {message.type === "success" ? (
                <CheckCircle size={20} style={{ color: '#10B981', flexShrink: 0 }} />
              ) : (
                <AlertCircle size={20} style={{ color: '#EF4444', flexShrink: 0 }} />
              )}
              <span style={{ fontWeight: '500' }}>{message.text}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Personal Information */}
            <div style={{
              background: '#F9FAFB',
              padding: '2rem',
              borderRadius: '16px',
              border: '1px solid #E5E7EB'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <User style={{ color: '#3B82F6' }} size={24} />
                <h2 style={{ color: '#1F2937', fontSize: '1.25rem', fontWeight: '600', margin: 0 }}>
                  Personal Information
                </h2>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#374151', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                    <User size={16} style={{ color: '#6B7280' }} />
                    Full Name <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Dr. John Doe"
                    style={{
                      width: '100%',
                      padding: '0.875rem 1rem',
                      border: `1px solid ${errors.fullName ? '#EF4444' : '#D1D5DB'}`,
                      borderRadius: '12px',
                      fontSize: '1rem',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      background: 'white'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#3B82F6'}
                    onBlur={(e) => e.target.style.borderColor = errors.fullName ? '#EF4444' : '#D1D5DB'}
                  />
                  {errors.fullName && (
                    <p style={{ color: '#EF4444', fontSize: '0.875rem', marginTop: '0.25rem' }}>{errors.fullName}</p>
                  )}
                </div>

                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#374151', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                    <Mail size={16} style={{ color: '#6B7280' }} />
                    Email Address <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="email@example.com"
                    style={{
                      width: '100%',
                      padding: '0.875rem 1rem',
                      border: `1px solid ${errors.email ? '#EF4444' : '#D1D5DB'}`,
                      borderRadius: '12px',
                      fontSize: '1rem',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      background: 'white'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#3B82F6'}
                    onBlur={(e) => e.target.style.borderColor = errors.email ? '#EF4444' : '#D1D5DB'}
                  />
                  {errors.email && (
                    <p style={{ color: '#EF4444', fontSize: '0.875rem', marginTop: '0.25rem' }}>{errors.email}</p>
                  )}
                </div>

                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#374151', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                    <Phone size={16} style={{ color: '#6B7280' }} />
                    Phone Number <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+94 77 123 4567"
                    style={{
                      width: '100%',
                      padding: '0.875rem 1rem',
                      border: `1px solid ${errors.phone ? '#EF4444' : '#D1D5DB'}`,
                      borderRadius: '12px',
                      fontSize: '1rem',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      background: 'white'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#3B82F6'}
                    onBlur={(e) => e.target.style.borderColor = errors.phone ? '#EF4444' : '#D1D5DB'}
                  />
                  {errors.phone && (
                    <p style={{ color: '#EF4444', fontSize: '0.875rem', marginTop: '0.25rem' }}>{errors.phone}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Account Information */}
            <div style={{
              background: '#F9FAFB',
              padding: '2rem',
              borderRadius: '16px',
              border: '1px solid #E5E7EB'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <Lock style={{ color: '#3B82F6' }} size={24} />
                <h2 style={{ color: '#1F2937', fontSize: '1.25rem', fontWeight: '600', margin: 0 }}>
                  Account Information
                </h2>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#374151', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                    <Lock size={16} style={{ color: '#6B7280' }} />
                    Password <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <PasswordInput
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter password (min 6 characters)"
                    className={`w-full border ${
                      errors.password ? "border-red-500" : "border-gray-300"
                    } rounded-xl p-3 focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 outline-none transition-all duration-300`}
                  />
                  {errors.password && (
                    <p style={{ color: '#EF4444', fontSize: '0.875rem', marginTop: '0.25rem' }}>{errors.password}</p>
                  )}
                </div>

                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#374151', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                    <Lock size={16} style={{ color: '#6B7280' }} />
                    Confirm Password <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <PasswordInput
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    className={`w-full border ${
                      errors.confirmPassword ? "border-red-500" : "border-gray-300"
                    } rounded-xl p-3 focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 outline-none transition-all duration-300`}
                  />
                  {errors.confirmPassword && (
                    <p style={{ color: '#EF4444', fontSize: '0.875rem', marginTop: '0.25rem' }}>{errors.confirmPassword}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Professional Details */}
            <div style={{
              background: '#F9FAFB',
              padding: '2rem',
              borderRadius: '16px',
              border: '1px solid #E5E7EB'
            }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <Briefcase style={{ color: '#3B82F6' }} size={24} />
                <h2 style={{ color: '#1F2937', fontSize: '1.25rem', fontWeight: '600', margin: 0 }}>
                  Professional Details
                </h2>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2 flex items-center gap-2">
                    <FileText size={16} className="text-gray-500" />
                    License Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={handleChange}
                    placeholder="SLMC12345"
                    className={`w-full border ${
                      errors.licenseNumber ? "border-red-500" : "border-gray-300"
                    } rounded-xl p-3 focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 outline-none transition-all duration-300`}
                  />
                  {errors.licenseNumber && (
                    <p className="text-red-500 text-sm mt-1">{errors.licenseNumber}</p>
                  )}
                  <p className="text-gray-500 text-xs mt-1">Enter your medical license number</p>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2 flex items-center gap-2">
                    <Award size={16} className="text-gray-500" />
                    Specialization <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    className={`w-full border ${
                      errors.specialization ? "border-red-500" : "border-gray-300"
                    } rounded-xl p-3 focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 outline-none transition-all duration-300 bg-white`}
                  >
                    <option value="">Select Specialization</option>
                    {specializations.map((spec) => (
                      <option key={spec} value={spec}>
                        {spec}
                      </option>
                    ))}
                  </select>
                  {errors.specialization && (
                    <p className="text-red-500 text-sm mt-1">{errors.specialization}</p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2 flex items-center gap-2">
                    <Briefcase size={16} className="text-gray-500" />
                    Years of Experience <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    placeholder="e.g. 10"
                    min="0"
                    className={`w-full border ${
                      errors.experience ? "border-red-500" : "border-gray-300"
                    } rounded-xl p-3 focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 outline-none transition-all duration-300`}
                  />
                  {errors.experience && (
                    <p className="text-red-500 text-sm mt-1">{errors.experience}</p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2 flex items-center gap-2">
                    <Briefcase size={16} className="text-gray-500" />
                    Hospital / Workplace
                  </label>
                  <input
                    type="text"
                    name="hospital"
                    value={formData.hospital}
                    onChange={handleChange}
                    placeholder="Colombo National Hospital"
                    className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 outline-none transition-all duration-300"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-gray-700 text-sm font-medium mb-2 flex items-center gap-2">
                  <Award size={16} className="text-gray-500" />
                  Qualifications
                </label>
                <textarea
                  rows="3"
                  name="qualifications"
                  value={formData.qualifications}
                  onChange={handleChange}
                  placeholder="MBBS, MD, BDS, MDS, FRCS, etc."
                  className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 outline-none resize-none transition-all duration-300"
                ></textarea>
                <p className="text-gray-500 text-xs mt-1">List your professional qualifications</p>
              </div>

              {/* Services Selection */}
              <div className="mt-6">
                <label className="block text-gray-700 text-sm font-medium mb-3 flex items-center gap-2">
                  <Stethoscope size={16} className="text-gray-500" />
                  Services Offered <span className="text-red-500">*</span>
                </label>
                <p className="text-gray-500 text-xs mb-3">Select the services you offer to patients</p>
                {loadingServices ? (
                  <p className="text-gray-500 text-sm">Loading services...</p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {availableServices.map((service) => (
                      <label
                        key={service._id || service.name}
                        className={`flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                          formData.services?.includes(service.name)
                            ? "border-cyan-500 bg-cyan-50"
                            : "border-gray-200 hover:border-cyan-300"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.services?.includes(service.name) || false}
                          onChange={() => handleServiceToggle(service.name)}
                          className="w-4 h-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
                        />
                        <span className="text-sm text-gray-700">{service.name}</span>
                      </label>
                    ))}
                  </div>
                )}
                {errors.services && (
                  <p className="text-red-500 text-sm mt-1">{errors.services}</p>
                )}
                <p className="text-gray-500 text-xs mt-2">
                  Selected: {formData.services?.length || 0} service(s)
                </p>
              </div>
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              disabled={loading}
              className={`w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-4 rounded-full mt-2 shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Registering...
                </span>
              ) : (
                "Register"
              )}
            </motion.button>

            <p className="text-center mt-6 text-gray-600">
              Already have an account?{" "}
              <Link
                to="/doctor-login"
                className="text-cyan-600 font-semibold hover:underline transition-colors duration-300"
              >
                Login here
              </Link>
            </p>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default DoctorRegister;
