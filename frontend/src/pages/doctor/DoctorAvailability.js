import React, { useState, useEffect } from "react";
import axios from "axios";
import DoctorSidebar from "../../components/layout/DoctorSidebar";
import {
  Calendar, Clock, Save, Plus, X, AlertCircle, CheckCircle, Settings,
} from "lucide-react";
import "../../styles/pages/DoctorAvailability.css";

const API = "http://localhost:4000/api";

const DEFAULT_SCHEDULE = [
  { dayOfWeek: 1, dayName: "Monday",    startTime: "09:00", endTime: "17:00", isAvailable: true  },
  { dayOfWeek: 2, dayName: "Tuesday",   startTime: "09:00", endTime: "17:00", isAvailable: true  },
  { dayOfWeek: 3, dayName: "Wednesday", startTime: "09:00", endTime: "17:00", isAvailable: true  },
  { dayOfWeek: 4, dayName: "Thursday",  startTime: "09:00", endTime: "17:00", isAvailable: true  },
  { dayOfWeek: 5, dayName: "Friday",    startTime: "09:00", endTime: "17:00", isAvailable: true  },
  { dayOfWeek: 6, dayName: "Saturday",  startTime: "09:00", endTime: "13:00", isAvailable: false },
  { dayOfWeek: 0, dayName: "Sunday",    startTime: "09:00", endTime: "13:00", isAvailable: false },
];

const DAY_NAMES = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

export default function DoctorAvailability() {
  const [loading, setLoading]   = useState(false);
  const [saving, setSaving]     = useState(false);
  const [toast, setToast]       = useState({ type: "", text: "" });
  const [doctorId, setDoctorId] = useState(null);

  const [schedule, setSchedule]                   = useState(DEFAULT_SCHEDULE);
  const [unavailDates, setUnavailDates]           = useState([]);
  const [specialDates, setSpecialDates]           = useState([]);
  const [newUnavail, setNewUnavail]               = useState({ date: "", reason: "" });
  const [newSpecial, setNewSpecial]               = useState({ date: "", startTime: "09:00", endTime: "17:00" });
  const [apptDuration, setApptDuration]           = useState(30);
  const [slotInterval, setSlotInterval]           = useState(30);

  useEffect(() => { loadAvailability(); }, []);

  const showToast = (type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast({ type: "", text: "" }), 3500);
  };

  const loadAvailability = async () => {
    try {
      setLoading(true);
      const doc = JSON.parse(localStorage.getItem("doctor") || "{}");
      if (!doc._id) { showToast("error", "Doctor not found. Please login again."); return; }
      setDoctorId(doc._id);

      const res = await axios.get(`${API}/availability/doctor/${doc._id}`);
      const d = res.data;
      if (d.weeklySchedule?.length) {
        setSchedule(d.weeklySchedule.map(s => ({ ...s, dayName: DAY_NAMES[s.dayOfWeek] })));
      }
      if (d.unavailableDates) setUnavailDates(d.unavailableDates);
      if (d.specialDates)     setSpecialDates(d.specialDates);
      if (d.appointmentDuration) setApptDuration(d.appointmentDuration);
      if (d.slotInterval)        setSlotInterval(d.slotInterval);
    } catch (err) {
      if (err.response?.status !== 404) showToast("error", "Failed to load availability.");
    } finally {
      setLoading(false);
    }
  };

  const updateDay = (idx, field, value) => {
    const updated = [...schedule];
    updated[idx] = { ...updated[idx], [field]: value };
    setSchedule(updated);
  };

  const handleSave = async () => {
    if (!doctorId) { showToast("error", "Doctor not found."); return; }
    try {
      setSaving(true);
      await axios.put(`${API}/availability/doctor/${doctorId}`, {
        weeklySchedule: schedule.filter(d => d.isAvailable).map(d => ({
          dayOfWeek: d.dayOfWeek, startTime: d.startTime, endTime: d.endTime, isAvailable: true,
        })),
        unavailableDates: unavailDates.map(u => ({ date: u.date, reason: u.reason })),
        specialDates,
        appointmentDuration: apptDuration,
        slotInterval,
      });
      showToast("success", "Availability saved successfully.");
    } catch (err) {
      showToast("error", err.response?.data?.message || "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  const addUnavail = () => {
    if (!newUnavail.date) { showToast("error", "Please select a date."); return; }
    setUnavailDates([...unavailDates, { ...newUnavail }]);
    setNewUnavail({ date: "", reason: "" });
  };

  const addSpecial = () => {
    if (!newSpecial.date) { showToast("error", "Please select a date."); return; }
    setSpecialDates([...specialDates, { ...newSpecial }]);
    setNewSpecial({ date: "", startTime: "09:00", endTime: "17:00" });
  };

  const fmtDate = (d) => new Date(d).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
  const today   = new Date().toISOString().split("T")[0];

  if (loading) {
    return (
      <div className="avail-wrapper">
        <DoctorSidebar />
        <div className="avail-content">
          <div className="avail-loading">
            <div className="avail-spinner" />
            <p>Loading availability...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="avail-wrapper">
      <DoctorSidebar />

      <div className="avail-content">
        {/* Header */}
        <div className="avail-header">
          <h1><Calendar size={22} /> Availability</h1>
          <p>Manage your working hours, holidays, and special schedules</p>
        </div>

        {/* Toast */}
        {toast.text && (
          <div className={`avail-toast ${toast.type}`}>
            {toast.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            {toast.text}
          </div>
        )}

        <div className="avail-grid">
          {/* ── Left Column ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

            {/* Weekly Schedule */}
            <div className="avail-card">
              <div className="avail-card-header">
                <Calendar size={16} />
                <h2>Weekly Schedule</h2>
              </div>
              <div className="avail-card-body">
                {schedule.map((day, idx) => (
                  <div key={day.dayOfWeek} className={`day-row ${day.isAvailable ? "active" : "inactive"}`}>
                    {/* Toggle */}
                    <div className="toggle-wrap">
                      <label className="toggle">
                        <input
                          type="checkbox"
                          checked={day.isAvailable}
                          onChange={() => updateDay(idx, "isAvailable", !day.isAvailable)}
                        />
                        <span className="toggle-slider" />
                      </label>
                      <span className="day-label">{day.dayName}</span>
                    </div>

                    {/* Times */}
                    {day.isAvailable && (
                      <div className="day-times">
                        <div className="time-group">
                          <label>From</label>
                          <input
                            type="time"
                            value={day.startTime}
                            onChange={(e) => updateDay(idx, "startTime", e.target.value)}
                          />
                        </div>
                        <span className="time-sep">—</span>
                        <div className="time-group">
                          <label>To</label>
                          <input
                            type="time"
                            value={day.endTime}
                            onChange={(e) => updateDay(idx, "endTime", e.target.value)}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Unavailable Dates */}
            <div className="avail-card">
              <div className="avail-card-header">
                <X size={16} />
                <h2>Unavailable Dates</h2>
              </div>
              <div className="avail-card-body">
                {unavailDates.length > 0 && (
                  <div className="date-list">
                    {unavailDates.map((u, i) => (
                      <div key={i} className="date-chip">
                        <span className="chip-date">{fmtDate(u.date)}</span>
                        {u.reason && <span className="chip-meta">{u.reason}</span>}
                        <button className="chip-remove" onClick={() => setUnavailDates(unavailDates.filter((_, j) => j !== i))}>
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="add-date-row">
                  <input type="date" value={newUnavail.date} min={today}
                    onChange={(e) => setNewUnavail({ ...newUnavail, date: e.target.value })} />
                  <input type="text" placeholder="Reason (optional)" value={newUnavail.reason}
                    onChange={(e) => setNewUnavail({ ...newUnavail, reason: e.target.value })} />
                  <button className="add-btn" onClick={addUnavail}><Plus size={14} /> Add</button>
                </div>
              </div>
            </div>

            {/* Special Dates */}
            <div className="avail-card">
              <div className="avail-card-header">
                <Clock size={16} />
                <h2>Special Hours</h2>
              </div>
              <div className="avail-card-body">
                {specialDates.length > 0 && (
                  <div className="date-list">
                    {specialDates.map((s, i) => (
                      <div key={i} className="date-chip">
                        <span className="chip-date">{fmtDate(s.date)}</span>
                        <span className="chip-meta">{s.startTime} — {s.endTime}</span>
                        <button className="chip-remove" onClick={() => setSpecialDates(specialDates.filter((_, j) => j !== i))}>
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="add-date-row">
                  <input type="date" value={newSpecial.date} min={today}
                    onChange={(e) => setNewSpecial({ ...newSpecial, date: e.target.value })} />
                  <input type="time" value={newSpecial.startTime}
                    onChange={(e) => setNewSpecial({ ...newSpecial, startTime: e.target.value })} />
                  <input type="time" value={newSpecial.endTime}
                    onChange={(e) => setNewSpecial({ ...newSpecial, endTime: e.target.value })} />
                  <button className="add-btn" onClick={addSpecial}><Plus size={14} /> Add</button>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right Column ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

            {/* Appointment Settings */}
            <div className="avail-card">
              <div className="avail-card-header">
                <Settings size={16} />
                <h2>Appointment Settings</h2>
              </div>
              <div className="avail-card-body">
                <div className="setting-row">
                  <label>Appointment Duration</label>
                  <p>How long each appointment lasts (minutes)</p>
                  <input type="number" value={apptDuration} min="15" step="15"
                    onChange={(e) => setApptDuration(parseInt(e.target.value) || 30)} />
                </div>
                <div className="setting-row">
                  <label>Slot Interval</label>
                  <p>Gap between available time slots (minutes)</p>
                  <input type="number" value={slotInterval} min="15" step="15"
                    onChange={(e) => setSlotInterval(parseInt(e.target.value) || 30)} />
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="avail-card">
              <div className="avail-card-header">
                <CheckCircle size={16} />
                <h2>Summary</h2>
              </div>
              <div className="avail-card-body">
                {schedule.filter(d => d.isAvailable).map(d => (
                  <div key={d.dayOfWeek} style={{
                    display: "flex", justifyContent: "space-between",
                    padding: "0.5rem 0", borderBottom: "1px solid #f5f5f5",
                    fontSize: "0.82rem",
                  }}>
                    <span style={{ fontWeight: 600, color: "#374151" }}>{d.dayName}</span>
                    <span style={{ color: "#00897B", fontWeight: 600 }}>{d.startTime} — {d.endTime}</span>
                  </div>
                ))}
                {schedule.filter(d => d.isAvailable).length === 0 && (
                  <p style={{ color: "#9ca3af", fontSize: "0.82rem", textAlign: "center", padding: "1rem 0" }}>
                    No working days selected
                  </p>
                )}
              </div>
            </div>

            {/* Save */}
            <button className="save-btn" onClick={handleSave} disabled={saving}>
              <Save size={18} />
              {saving ? "Saving..." : "Save Availability"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
