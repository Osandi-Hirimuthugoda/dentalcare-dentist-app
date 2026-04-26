import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Heart, Activity, AlertCircle, Phone, X, User, MapPin, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import Footer from "../../components/layout/Footer";

const Health = () => {
  const [healthData, setHealthData] = useState({
    healthScore: 85,
    healthStatus: "Good",
    tips: [],
    recentActivities: [],
    loading: true,
    error: null,
  });

  const [showAvailableDoctors, setShowAvailableDoctors] = useState(false);
  const [availableDoctors, setAvailableDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  
  // DentalCare+ Emergency Hotline
  const EMERGENCY_HOTLINE = "+94112345678"; // Replace with actual hotline number

  useEffect(() => {
    fetchHealthData();
  }, []);

  const handleEmergencyCall = () => {
    // Open phone dialer with emergency hotline
    window.location.href = `tel:${EMERGENCY_HOTLINE}`;
    
    // After a delay, fetch and show available doctors
    setTimeout(() => {
      fetchAvailableDoctors();
    }, 2000); // Wait 2 seconds after call initiation
  };

  const fetchAvailableDoctors = async () => {
    try {
      setLoadingDoctors(true);
      const response = await axios.get("/api/doctors/available-now");
      setAvailableDoctors(response.data.availableDoctors || []);
      setShowAvailableDoctors(true);
    } catch (error) {
      console.error("Error fetching available doctors:", error);
      // Still show modal even if API fails
      setShowAvailableDoctors(true);
    } finally {
      setLoadingDoctors(false);
    }
  };

  const fetchHealthData = async () => {
    try {
      const response = await axios.get("/api/health/data");
      setHealthData({
        ...response.data,
        loading: false,
      });
    } catch (error) {
      console.error("Error fetching health data:", error);
      // Set default data if API fails
      setHealthData({
        healthScore: 85,
        healthStatus: "Good",
        tips: [
          {
            emoji: "🦷",
            title: "Brush twice daily",
            description: "Morning and night for 2 minutes",
          },
          {
            emoji: "🧵",
            title: "Floss regularly",
            description: "Remove food particles between teeth",
          },
          {
            emoji: "🍎",
            title: "Healthy diet",
            description: "Limit sugary foods and drinks",
          },
          {
            emoji: "👨‍⚕️",
            title: "Regular checkups",
            description: "Visit dentist every 6 months",
          },
        ],
        recentActivities: [],
        loading: false,
        error: error.message,
      });
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBgColor = (score) => {
    if (score >= 80) return "bg-green-100";
    if (score >= 60) return "bg-yellow-100";
    return "bg-red-100";
  };

  if (healthData.loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading health data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Heart size={28} className="text-rose-500" />
          Dental Health
        </h2>
      </div>

      <div className="max-w-4xl space-y-6">

      {/* Content */}
      <div className="container mx-auto px-6 py-8 flex-1">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Health Score Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Your Dental Health Score
            </h2>
            <div className="flex flex-col items-center">
              <div className="relative w-48 h-48 mb-4">
                <svg className="transform -rotate-90 w-48 h-48">
                  <circle
                    cx="96"
                    cy="96"
                    r="84"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    className="text-gray-200"
                  />
                  <circle
                    cx="96"
                    cy="96"
                    r="84"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${(healthData.healthScore / 100) * 528} 528`}
                    className={getScoreColor(healthData.healthScore)}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span
                    className={`text-4xl font-bold ${getScoreColor(
                      healthData.healthScore
                    )}`}
                  >
                    {healthData.healthScore}%
                  </span>
                  <span className="text-gray-600 text-sm mt-1">
                    {healthData.healthStatus}
                  </span>
                </div>
              </div>
              <p className="text-gray-600 text-center max-w-md">
                Keep up the good work! Your dental hygiene is excellent.
              </p>
            </div>
          </motion.div>

          {/* Health Tips Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Daily Health Tips
            </h2>
            <div className="space-y-3">
              {healthData.tips.map((tip, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="text-2xl">{tip.emoji}</span>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-800">{tip.title}</h3>
                    <p className="text-sm text-gray-600">{tip.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Recent Activities Card */}
          {healthData.recentActivities && healthData.recentActivities.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                <Activity size={24} className="text-cyan-600" />
                <span>Recent Activities</span>
              </h2>
              <div className="space-y-3">
                {healthData.recentActivities.map((activity, index) => {
                  // Determine icon and color based on activity type and status
                  let iconColor = "text-cyan-600";
                  let bgColor = "bg-cyan-100";
                  let statusBadge = null;

                  if (activity.type === "bill") {
                    if (activity.status === "paid") {
                      iconColor = "text-green-600";
                      bgColor = "bg-green-100";
                      statusBadge = (
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                          Paid
                        </span>
                      );
                    } else if (activity.status === "pending") {
                      iconColor = "text-yellow-600";
                      bgColor = "bg-yellow-100";
                      statusBadge = (
                        <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full">
                          Pending
                        </span>
                      );
                    }
                  } else if (activity.type === "appointment") {
                    if (activity.status === "completed") {
                      iconColor = "text-green-600";
                      bgColor = "bg-green-100";
                      statusBadge = (
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                          Completed
                        </span>
                      );
                    } else if (activity.status === "confirmed") {
                      iconColor = "text-blue-600";
                      bgColor = "bg-blue-100";
                      statusBadge = (
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                          Confirmed
                        </span>
                      );
                    } else if (activity.status === "pending") {
                      iconColor = "text-yellow-600";
                      bgColor = "bg-yellow-100";
                      statusBadge = (
                        <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full">
                          Pending
                        </span>
                      );
                    } else if (activity.status === "cancelled") {
                      iconColor = "text-red-600";
                      bgColor = "bg-red-100";
                      statusBadge = (
                        <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full">
                          Cancelled
                        </span>
                      );
                    }
                  }

                  return (
                    <div
                      key={index}
                      className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
                    >
                      <div className={`w-10 h-10 rounded-full ${bgColor} flex items-center justify-center flex-shrink-0`}>
                        {activity.type === "bill" ? (
                          <span className="text-lg">💰</span>
                        ) : activity.teleconsult ? (
                          <span className="text-lg">📹</span>
                        ) : (
                          <Activity size={20} className={iconColor} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-medium text-gray-800 text-sm">
                            {activity.title}
                          </h3>
                          {statusBadge}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {activity.description}
                        </p>
                        {activity.amount && (
                          <p className="text-xs text-gray-500 mt-1">
                            Amount: Rs. {activity.amount.toLocaleString()}
                          </p>
                        )}
                        {activity.billNumber && (
                          <p className="text-xs text-gray-500 mt-1">
                            Bill: {activity.billNumber}
                          </p>
                        )}
                      </div>
                      <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                        {activity.date}
                      </span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Emergency Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center space-x-2">
              <AlertCircle size={24} className="text-red-500" />
              <span>Emergency Contact</span>
            </h2>
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-800">
                  Emergency Dental Care
                </h3>
                <p className="text-sm text-gray-600">24/7 emergency service</p>
                <p className="text-xs text-gray-500 mt-1">
                  Hotline: +94112345678
                </p>
              </div>
              <a 
                href="tel:+94112345678"
                onClick={() => {
                  setTimeout(() => {
                    fetchAvailableDoctors();
                  }, 2000);
                }}
                className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                <Phone size={18} />
                <span>Call Now</span>
              </a>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Available Doctors Modal */}
      <AnimatePresence>
        {showAvailableDoctors && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowAvailableDoctors(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
                    <Clock size={24} className="text-cyan-600" />
                    <span>Available Doctors Now</span>
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Doctors available at this time
                  </p>
                </div>
                <button
                  onClick={() => setShowAvailableDoctors(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {loadingDoctors ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading available doctors...</p>
                  </div>
                ) : availableDoctors.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertCircle size={48} className="text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">No doctors available at this time</p>
                    <p className="text-sm text-gray-500">
                      Please call the emergency hotline for immediate assistance
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {availableDoctors.map((doctor, index) => (
                      <motion.div
                        key={doctor._id || index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 rounded-full bg-cyan-100 flex items-center justify-center flex-shrink-0">
                            <User size={24} className="text-cyan-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-800 text-lg">
                              {doctor.fullName}
                            </h3>
                            {doctor.specialization && (
                              <p className="text-sm text-cyan-600 mt-1">
                                {doctor.specialization}
                              </p>
                            )}
                            {doctor.hospital && (
                              <div className="flex items-center space-x-1 text-sm text-gray-600 mt-2">
                                <MapPin size={14} />
                                <span>{doctor.hospital}</span>
                              </div>
                            )}
                            {doctor.phone && (
                              <div className="flex items-center space-x-1 text-sm text-gray-600 mt-1">
                                <Phone size={14} />
                                <a 
                                  href={`tel:${doctor.phone}`}
                                  className="text-cyan-600 hover:underline"
                                >
                                  {doctor.phone}
                                </a>
                              </div>
                            )}
                            {doctor.reason && (
                              <div className="mt-2">
                                <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                                  {doctor.reason}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="border-t p-4 bg-gray-50">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    {availableDoctors.length} doctor{availableDoctors.length !== 1 ? 's' : ''} available
                  </p>
                  <button
                    onClick={() => setShowAvailableDoctors(false)}
                    className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      </div>
    </div>
  );
};

export default Health;

