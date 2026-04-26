import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  ArrowLeft, Calendar, Clock, User, CheckCircle, 
  XCircle, AlertCircle, Plus, ChevronRight, 
  MapPin, Stethoscope, Filter, Search, MoreHorizontal,
  FileText, Pill, Download, Eye, Clipboard
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [treatments, setTreatments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [scanReports, setScanReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("upcoming"); // upcoming | history | reports | prescriptions | book
  const [doctors, setDoctors] = useState([]);
  
  const [bookingData, setBookingData] = useState({
    doctorId: "",
    date: "",
    time: "",
    reason: ""
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
    fetchDoctors();
    fetchReports();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const [apptsRes, treatRes] = await Promise.all([
        axios.get("/api/appointments/patient", { headers: { Authorization: `Bearer ${token}` } }),
        axios.get("/api/appointments/patient/treatments", { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setAppointments(apptsRes.data || []);
      setTreatments(treatRes.data || []);
    } catch (err) {
      console.error("Fetch appointments error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem("token");
      const [presRes, scanRes] = await Promise.all([
        axios.get("/api/prescriptions/patient", { headers: { Authorization: `Bearer ${token}` } }),
        axios.get("/api/scan-qa/patient/sent-reports", { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setPrescriptions(presRes.data || []);
      setScanReports(scanRes.data.reports || []);
    } catch (err) {
      console.error("Fetch reports error:", err);
    }
  };

  const fetchDoctors = async () => {
    try {
      const res = await axios.get("/api/messages/doctors");
      setDoctors(res.data || []);
    } catch (err) {
      console.error("Fetch doctors error:", err);
    }
  };

  const handleBook = async (e) => {
    e.preventDefault();
    if (!bookingData.doctorId || !bookingData.date || !bookingData.time) {
      return alert("Please fill all fields");
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      
      const payload = {
        ...bookingData,
        patientId: user._id,
        status: "Pending"
      };

      await axios.post("/api/appointments", payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert("Appointment requested successfully!");
      setBookingData({ doctorId: "", date: "", time: "", reason: "" });
      setActiveTab("upcoming");
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Booking failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this appointment?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.put(`/api/appointments/${id}`, { status: "Cancelled" }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (err) {
      alert("Failed to cancel");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-4 rounded-3xl border border-slate-200 shadow-sm overflow-x-auto no-scrollbar">
        <h2 className="text-xl font-bold text-slate-800 whitespace-nowrap mr-4">My Treatments</h2>
        <div className="flex bg-slate-100 p-1 rounded-xl whitespace-nowrap">
           <TabButton active={activeTab === "upcoming"} onClick={() => setActiveTab("upcoming")} label="Upcoming" />
           <TabButton active={activeTab === "history"} onClick={() => setActiveTab("history")} label="History" />
           <TabButton active={activeTab === "reports"} onClick={() => setActiveTab("reports")} label="Reports" />
           <TabButton active={activeTab === "prescriptions"} onClick={() => setActiveTab("prescriptions")} label="Prescriptions" />
           <TabButton active={activeTab === "book"} onClick={() => setActiveTab("book")} label="Book" primary />
        </div>
      </div>

      <div className="w-full">
        <AnimatePresence mode="wait">
          {activeTab === "book" ? (
            <motion.div 
              key="book"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden"
            >
               <div className="bg-emerald-600 p-8 text-white">
                  <h2 className="text-2xl font-bold">Request Appointment</h2>
                  <p className="text-emerald-100 mt-1">Select a doctor and your preferred time slot.</p>
               </div>
               <form onSubmit={handleBook} className="p-8 space-y-6">
                  <div className="space-y-4">
                     <div>
                       <label className="block text-sm font-bold text-slate-700 mb-2">Select Dentist</label>
                       <select 
                         className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-slate-800 focus:border-emerald-500 transition-all outline-none"
                         value={bookingData.doctorId}
                         onChange={(e) => setBookingData({...bookingData, doctorId: e.target.value})}
                       >
                         <option value="">Choose a specialist...</option>
                         {doctors.map(d => <option key={d._id} value={d._id}>Dr. {d.fullName}</option>)}
                       </select>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">Date</label>
                          <input 
                            type="date" 
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 focus:border-emerald-500 outline-none"
                            value={bookingData.date}
                            onChange={(e) => setBookingData({...bookingData, date: e.target.value})}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">Time</label>
                          <input 
                            type="time" 
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 focus:border-emerald-500 outline-none"
                            value={bookingData.time}
                            onChange={(e) => setBookingData({...bookingData, time: e.target.value})}
                          />
                        </div>
                     </div>
                     <div>
                       <label className="block text-sm font-bold text-slate-700 mb-2">Reason for Visit</label>
                       <textarea 
                         placeholder="Briefly describe your concern..."
                         className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 min-h-[120px] focus:border-emerald-500 outline-none"
                         value={bookingData.reason}
                         onChange={(e) => setBookingData({...bookingData, reason: e.target.value})}
                       />
                     </div>
                  </div>
                  <button 
                    disabled={submitting}
                    className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black text-lg hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/20 flex items-center justify-center gap-3"
                  >
                    {submitting ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Confirm Booking Request'}
                  </button>
               </form>
            </motion.div>
          ) : activeTab === "reports" ? (
            <motion.div key="reports" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {scanReports.length === 0 ? <EmptyState title="No reports found" desc="Your scan reports will appear here." /> : scanReports.map((r, i) => <ScanReportCard key={i} report={r} />)}
            </motion.div>
          ) : activeTab === "prescriptions" ? (
            <motion.div key="pres" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {prescriptions.length === 0 ? <EmptyState title="No prescriptions found" desc="Your prescriptions will appear here." /> : prescriptions.map((p, i) => <PrescriptionCard key={i} prescription={p} />)}
            </motion.div>
          ) : (
            <motion.div 
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
               {activeTab === "upcoming" ? (
                 <div className="space-y-4">
                    {appointments.filter(a => a.status !== 'Completed' && a.status !== 'Cancelled').length === 0 ? (
                      <EmptyState title="No upcoming appointments" desc="You don't have any scheduled visits." onAction={() => setActiveTab("book")} />
                    ) : (
                      appointments.filter(a => a.status !== 'Completed' && a.status !== 'Cancelled').map(a => (
                        <AppointmentCard key={a._id} appointment={a} onCancel={() => handleCancel(a._id)} />
                      ))
                    )}
                 </div>
               ) : (
                 <div className="space-y-4">
                    {treatments.length === 0 ? (
                      <EmptyState title="No treatment history" desc="Your completed treatments will appear here." />
                    ) : (
                      treatments.map(t => (
                        <TreatmentCard key={t._id} treatment={t} />
                      ))
                    )}
                 </div>
               )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const TabButton = ({ active, onClick, label, primary }) => (
  <button 
    onClick={onClick}
    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
      active 
      ? (primary ? 'bg-emerald-600 text-white shadow-md' : 'bg-white text-slate-800 shadow-sm') 
      : 'text-slate-500 hover:text-slate-700'
    }`}
  >
    {label}
  </button>
);

const AppointmentCard = ({ appointment: a, onCancel }) => {
  const statusColors = {
    Pending: "bg-amber-100 text-amber-700",
    Confirmed: "bg-emerald-100 text-emerald-700",
    Cancelled: "bg-rose-100 text-rose-700"
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col md:flex-row items-center gap-6 shadow-sm hover:shadow-md transition-shadow">
       <div className="w-20 h-20 bg-slate-50 rounded-2xl flex flex-col items-center justify-center border border-slate-100 text-emerald-600">
          <span className="text-[10px] font-black uppercase">{new Date(a.date).toLocaleString('default', { month: 'short' })}</span>
          <span className="text-2xl font-black leading-none">{new Date(a.date).getDate()}</span>
       </div>
       <div className="flex-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
            <h3 className="text-lg font-bold text-slate-800">{a.reason || 'Dental Consultation'}</h3>
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${statusColors[a.status] || 'bg-slate-100 text-slate-600'}`}>
              {a.status}
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-slate-500 text-sm font-medium">
             <div className="flex items-center gap-1.5"><User size={14}/> Dr. {a.doctorId?.fullName || 'Specialist'}</div>
             <div className="flex items-center gap-1.5"><Clock size={14}/> {a.time}</div>
          </div>
       </div>
       <div className="flex gap-2">
          {a.status === 'Pending' && (
            <button onClick={onCancel} className="p-3 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"><XCircle size={20}/></button>
          )}
          <button className="px-6 py-3 bg-slate-50 text-slate-700 rounded-xl font-bold hover:bg-slate-100 transition-all flex items-center gap-2">
             Details <ChevronRight size={16}/>
          </button>
       </div>
    </div>
  );
};

const TreatmentCard = ({ treatment: t }) => (
  <div className="bg-white rounded-3xl border border-slate-200 p-6 flex items-center gap-6 opacity-80 hover:opacity-100 transition-opacity">
     <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
        <Stethoscope size={28} />
     </div>
     <div className="flex-1">
        <h3 className="font-bold text-slate-800">{t.reason || 'Completed Treatment'}</h3>
        <p className="text-xs text-slate-500 mt-1">{new Date(t.date).toLocaleDateString()} • {t.doctorId?.fullName || 'Specialist'}</p>
     </div>
     <div className="text-right">
        <div className="flex items-center gap-1 text-emerald-600 font-bold text-xs uppercase">
           <CheckCircle size={14}/> Completed
        </div>
     </div>
  </div>
);

const PrescriptionCard = ({ prescription: p }) => (
  <div className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col hover:shadow-lg transition-all group">
     <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600">
           <Pill size={24} />
        </div>
     </div>
     <h3 className="font-bold text-slate-800 text-lg mb-1">{p.diagnosis || 'Prescription'}</h3>
     <p className="text-sm text-slate-500 mb-4">{new Date(p.createdAt).toLocaleDateString()}</p>
     <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
        <span className="text-xs font-bold text-slate-700">Dr. {p.doctor?.fullName || 'Specialist'}</span>
        <button className="p-2 bg-rose-600 text-white rounded-xl shadow-lg"><Download size={18} /></button>
     </div>
  </div>
);

const ScanReportCard = ({ report: r }) => (
  <div className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col hover:shadow-lg transition-all group">
     <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
           <Clipboard size={24} />
        </div>
     </div>
     <h3 className="font-bold text-slate-800 text-lg mb-1">Teeth Scan Report</h3>
     <p className="text-sm text-slate-500 mb-4">{new Date(r.createdAt).toLocaleDateString()}</p>
     <a href={`/api/scan-qa/report-file/${r.scanId}`} target="_blank" rel="noopener noreferrer" className="bg-indigo-600 text-white py-3 rounded-2xl font-bold flex items-center justify-center gap-2">
        <Eye size={18} /> View
     </a>
  </div>
);

const EmptyState = ({ title, desc, onAction }) => (
  <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-4">
     <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
        <Calendar size={40} />
     </div>
     <div>
        <h3 className="text-xl font-bold text-slate-800">{title}</h3>
        <p className="text-slate-500 text-sm max-w-xs mx-auto mt-1">{desc}</p>
     </div>
     {onAction && (
       <button 
         onClick={onAction}
         className="px-8 py-3 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20"
       >
         Book Now
       </button>
     )}
  </div>
);

export default Appointments;
