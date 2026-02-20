import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import DoctorSidebar from "../../components/layout/DoctorSidebar";
import { Calendar, Clock, Save, Plus, X, AlertCircle, ArrowLeft, CheckCircle } from "lucide-react";
import "../../styles/pages/DoctorAvailability.css";

const DoctorAvailability = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [doctorId, setDoctorId] = useState(null);
  
  // Weekly schedule state
  const [weeklySchedule, setWeeklySchedule] = useState([
    { dayOfWeek: 1, dayName: "Monday", startTime: "09:00", endTime: "17:00", isAvailable: true },
    { dayOfWeek: 2, dayName: "Tuesday", startTime: "09:00", endTime: "17:00", isAvailable: true },
    { dayOfWeek: 3, dayName: "Wednesday", startTime: "09:00", endTime: "17:00", isAvailable: true },
    { dayOfWeek: 4, dayName: "Thursday", startTime: "09:00", endTime: "17:00", isAvailable: true },
    { dayOfWeek: 5, dayName: "Friday", startTime: "09:00", endTime: "17:00", isAvailable: true },
    { dayOfWeek: 6, dayName: "Saturday", startTime: "09:00", endTime: "13:00", isAvailable: false },
    { dayOfWeek: 0, dayName: "Sunday", startTime: "09:00", endTime: "13:00", isAvailable: false },
  ]);
  
  // Unavailable dates (holidays, leaves)
  const [unavailableDates, setUnavailableDates] = useState([]);
  const [newUnavailableDate, setNewUnavailableDate] = useState({ date: "", reason: "" });
  
  // Special dates with different hours
  const [specialDates, setSpecialDates] = useState([]);
  const [newSpecialDate, setNewSpecialDate] = useState({ date: "", startTime: "09:00", endTime: "17:00", isAvailable: true });
  
  // Appointment settings
  const [appointmentDuration, setAppointmentDuration] = useState(30);
  const [slotInterval, setSlotInterval] = useState(30);

  useEffect(() => {
    loadAvailability();
  }, []);

  const loadAvailability = async () => {
    try {
      setLoading(true);
      const doctorData = JSON.parse(localStorage.getItem("doctor") || "{}");
      
      if (!doctorData._id) {
        setMessage({ type: "error", text: "Doctor not found. Please login again." });
        return;
      }
      
      setDoctorId(doctorData._id);
      
      const response = await axios.get(`http://localhost:4000/api/availability/doctor/${doctorData._id}`);
      
      if (response.data) {
        if (response.data.weeklySchedule && response.data.weeklySchedule.length > 0) {
          setWeeklySchedule(response.data.weeklySchedule.map(sched => ({
            ...sched,
            dayName: getDayName(sched.dayOfWeek)
          })));
        }
        
        if (response.data.unavailableDates) {
          setUnavailableDates(response.data.unavailableDates);
        }
        
        if (response.data.specialDates) {
          setSpecialDates(response.data.specialDates);
        }
        
        if (response.data.appointmentDuration) {
          setAppointmentDuration(response.data.appointmentDuration);
        }
        
        if (response.data.slotInterval) {
          setSlotInterval(response.data.slotInterval);
        }
      }
    } catch (error) {
      console.error("Error loading availability:", error);
      // Don't show error if availability doesn't exist yet (first time setup)
      if (error.response?.status !== 404) {
        setMessage({ type: "error", text: "Failed to load availability settings." });
      }
    } finally {
      setLoading(false);
    }
  };

  const getDayName = (dayOfWeek) => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return days[dayOfWeek] || "";
  };

  const handleScheduleChange = (index, field, value) => {
    const updated = [...weeklySchedule];
    if (field === "isAvailable") {
      updated[index].isAvailable = !updated[index].isAvailable;
    } else {
      updated[index][field] = value;
    }
    setWeeklySchedule(updated);
  };

  const handleSave = async () => {
    if (!doctorId) {
      setMessage({ type: "error", text: "Doctor not found. Please login again." });
      return;
    }

    try {
      setSaving(true);
      setMessage({ type: "", text: "" });
      
      await axios.put(`http://localhost:4000/api/availability/doctor/${doctorId}`, {
        weeklySchedule: weeklySchedule.filter(day => day.isAvailable).map(day => ({
          dayOfWeek: day.dayOfWeek,
          startTime: day.startTime,
          endTime: day.endTime,
          isAvailable: true
        })),
        unavailableDates: unavailableDates.map(ud => ({
          date: ud.date,
          reason: ud.reason
        })),
        specialDates: specialDates,
        appointmentDuration,
        slotInterval
      });
      
      setMessage({ type: "success", text: "Availability saved successfully!" });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (error) {
      console.error("Error saving availability:", error);
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to save availability. Please try again.",
      });
      setTimeout(() => setMessage({ type: "", text: "" }), 5000);
    } finally {
      setSaving(false);
    }
  };

  const addUnavailableDate = () => {
    if (!newUnavailableDate.date) {
      setMessage({ type: "error", text: "Please select a date." });
      return;
    }
    
    setUnavailableDates([...unavailableDates, { ...newUnavailableDate }]);
    setNewUnavailableDate({ date: "", reason: "" });
  };

  const removeUnavailableDate = (index) => {
    setUnavailableDates(unavailableDates.filter((_, i) => i !== index));
  };

  const addSpecialDate = () => {
    if (!newSpecialDate.date) {
      setMessage({ type: "error", text: "Please select a date." });
      return;
    }
    
    setSpecialDates([...specialDates, { ...newSpecialDate }]);
    setNewSpecialDate({ date: "", startTime: "09:00", endTime: "17:00", isAvailable: true });
  };

  const removeSpecialDate = (index) => {
    setSpecialDates(specialDates.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div style={{ display: "flex", minHeight: "100vh", background: "linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 50%, #CBD5E1 100%)" }}>
        <DoctorSidebar />
        <div style={{ flex: 1, marginLeft: "14rem", padding: "2rem 2.5rem" }}>
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
            Loading...
          </div>
        </div>
      </div>
    );
  }

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
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 style={{ 
              margin: 0, 
              fontSize: "2.5rem", 
              fontWeight: "900", 
              background: "linear-gradient(135deg, #2563EB 0%, #3B82F6 50%, #60A5FA 100%)", 
              WebkitBackgroundClip: "text", 
              WebkitTextFillColor: "transparent", 
              backgroundClip: "text", 
              display: "flex", 
              alignItems: "center" 
            }}>
              <Calendar size={32} style={{ marginRight: "0.5rem", color: "#2563EB" }} />
              Set Your Availability
            </h2>
          </motion.div>
        </div>

        {message.text && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              padding: "1rem 1.5rem",
              borderRadius: "0.875rem",
              marginBottom: "1.5rem",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              backgroundColor: message.type === "success" ? 'rgba(74, 222, 128, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              border: `1px solid ${message.type === "success" ? 'rgba(74, 222, 128, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
              color: message.type === "success" ? '#4ADE80' : '#EF4444'
            }}
          >
            {message.type === "success" ? (
              <CheckCircle size={20} />
            ) : (
              <AlertCircle size={20} />
            )}
            <span style={{ fontWeight: '600' }}>{message.text}</span>
          </motion.div>
        )}

        <div style={{
          background: "white",
          borderRadius: "1.25rem",
          padding: "2rem",
          border: "1px solid rgba(0, 0, 0, 0.05)",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)"
        }}>
          {/* Weekly Schedule */}
          <section className="availability-section">
            <h3 className="section-title">Weekly Schedule</h3>
            <p className="section-description">Set your regular working hours for each day of the week.</p>
            
            <div className="schedule-list">
              {weeklySchedule.map((day, index) => (
                <div key={day.dayOfWeek} className="schedule-item">
                  <label className="schedule-day-checkbox">
                    <input
                      type="checkbox"
                      checked={day.isAvailable}
                      onChange={() => handleScheduleChange(index, "isAvailable")}
                    />
                    <span className="day-name">{day.dayName}</span>
                  </label>
                  
                  {day.isAvailable && (
                    <div className="schedule-times">
                      <div className="time-input-group">
                        <label>Start Time</label>
                        <input
                          type="time"
                          value={day.startTime}
                          onChange={(e) => handleScheduleChange(index, "startTime", e.target.value)}
                        />
                      </div>
                      <span className="time-separator">-</span>
                      <div className="time-input-group">
                        <label>End Time</label>
                        <input
                          type="time"
                          value={day.endTime}
                          onChange={(e) => handleScheduleChange(index, "endTime", e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Appointment Settings */}
          <section className="availability-section">
            <h3 className="section-title">Appointment Settings</h3>
            
            <div className="settings-grid">
              <div className="setting-item">
                <label>Appointment Duration (minutes)</label>
                <input
                  type="number"
                  value={appointmentDuration}
                  onChange={(e) => setAppointmentDuration(parseInt(e.target.value) || 30)}
                  min="15"
                  step="15"
                />
              </div>
              
              <div className="setting-item">
                <label>Time Slot Interval (minutes)</label>
                <input
                  type="number"
                  value={slotInterval}
                  onChange={(e) => setSlotInterval(parseInt(e.target.value) || 30)}
                  min="15"
                  step="15"
                />
              </div>
            </div>
          </section>

          {/* Unavailable Dates */}
          <section className="availability-section">
            <h3 className="section-title">Unavailable Dates (Holidays, Leaves)</h3>
            
            <div className="unavailable-dates-list">
              {unavailableDates.map((ud, index) => (
                <div key={index} className="unavailable-date-item">
                  <span>{new Date(ud.date).toLocaleDateString()}</span>
                  {ud.reason && <span className="reason">- {ud.reason}</span>}
                  <button
                    onClick={() => removeUnavailableDate(index)}
                    className="remove-button"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
            
            <div className="add-unavailable-date">
              <input
                type="date"
                value={newUnavailableDate.date}
                onChange={(e) => setNewUnavailableDate({ ...newUnavailableDate, date: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
              />
              <input
                type="text"
                placeholder="Reason (optional)"
                value={newUnavailableDate.reason}
                onChange={(e) => setNewUnavailableDate({ ...newUnavailableDate, reason: e.target.value })}
              />
              <button onClick={addUnavailableDate} className="add-button">
                <Plus size={16} /> Add
              </button>
            </div>
          </section>

          {/* Special Dates */}
          <section className="availability-section">
            <h3 className="section-title">Special Dates (Different Hours)</h3>
            
            <div className="special-dates-list">
              {specialDates.map((sd, index) => (
                <div key={index} className="special-date-item">
                  <span>{new Date(sd.date).toLocaleDateString()}</span>
                  <span className="special-times">
                    {sd.startTime} - {sd.endTime}
                  </span>
                  <button
                    onClick={() => removeSpecialDate(index)}
                    className="remove-button"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
            
            <div className="add-special-date">
              <input
                type="date"
                value={newSpecialDate.date}
                onChange={(e) => setNewSpecialDate({ ...newSpecialDate, date: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
              />
              <input
                type="time"
                value={newSpecialDate.startTime}
                onChange={(e) => setNewSpecialDate({ ...newSpecialDate, startTime: e.target.value })}
              />
              <input
                type="time"
                value={newSpecialDate.endTime}
                onChange={(e) => setNewSpecialDate({ ...newSpecialDate, endTime: e.target.value })}
              />
              <button onClick={addSpecialDate} className="add-button">
                <Plus size={16} /> Add
              </button>
            </div>
          </section>

          {/* Save Button */}
          <motion.button
            whileHover={{ scale: saving ? 1 : 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSave}
            disabled={saving}
            style={{
              width: "100%",
              padding: "1rem 2rem",
              background: saving ? "#9CA3AF" : "linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)",
              color: "white",
              border: "none",
              borderRadius: "0.875rem",
              fontSize: "1rem",
              fontWeight: "600",
              cursor: saving ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.75rem",
              boxShadow: saving ? "none" : "0 4px 15px rgba(37, 99, 235, 0.3)",
              transition: "all 0.3s ease"
            }}
          >
            <Save size={20} />
            {saving ? "Saving..." : "Save Availability"}
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default DoctorAvailability;