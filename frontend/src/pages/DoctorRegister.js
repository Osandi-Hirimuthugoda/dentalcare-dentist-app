import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Stethoscope, User, Mail, Phone, Lock, Award, Briefcase, FileText, CheckCircle, AlertCircle } from "lucide-react";
import PasswordInput from "../components/PasswordInput";


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
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

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

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-teal-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white p-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Stethoscope size={40} />
            <h1 className="text-3xl md:text-4xl font-bold">Doctor Registration</h1>
          </div>
          <p className="text-cyan-100 max-w-2xl mx-auto">
            Join DentalCare+ network and provide exceptional dental care to patients.
          </p>
        </div>

        <div className="p-8 md:p-10">
          {/* Success/Error Messages */}
          {message.text && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
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

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information */}
            <div className="bg-cyan-50/50 p-6 rounded-2xl border border-cyan-100">
              <div className="flex items-center gap-2 mb-5">
                <User className="text-cyan-600" size={20} />
                <h2 className="text-cyan-800 text-lg font-semibold">
                  Personal Information
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2 flex items-center gap-2">
                    <User size={16} className="text-gray-500" />
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Dr. John Doe"
                    className={`w-full border ${
                      errors.fullName ? "border-red-500" : "border-gray-300"
                    } rounded-xl p-3 focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 outline-none transition-all duration-300`}
                  />
                  {errors.fullName && (
                    <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2 flex items-center gap-2">
                    <Mail size={16} className="text-gray-500" />
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="email@example.com"
                    className={`w-full border ${
                      errors.email ? "border-red-500" : "border-gray-300"
                    } rounded-xl p-3 focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 outline-none transition-all duration-300`}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2 flex items-center gap-2">
                    <Phone size={16} className="text-gray-500" />
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+94 77 123 4567"
                    className={`w-full border ${
                      errors.phone ? "border-red-500" : "border-gray-300"
                    } rounded-xl p-3 focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 outline-none transition-all duration-300`}
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Account Information */}
            <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
              <div className="flex items-center gap-2 mb-5">
                <Lock className="text-blue-600" size={20} />
                <h2 className="text-blue-800 text-lg font-semibold">
                  Account Information
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2 flex items-center gap-2">
                    <Lock size={16} className="text-gray-500" />
                    Password <span className="text-red-500">*</span>
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
                    <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2 flex items-center gap-2">
                    <Lock size={16} className="text-gray-500" />
                    Confirm Password <span className="text-red-500">*</span>
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
                    <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Professional Details */}
            <div className="bg-teal-50/50 p-6 rounded-2xl border border-teal-100">
               <div className="flex items-center gap-2 mb-5">
                <Briefcase className="text-teal-600" size={20} />
                <h2 className="text-teal-800 text-lg font-semibold">
                  Professional Details
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
