import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  ArrowLeft, FileText, Download, Eye, Search, 
  Filter, Calendar, User, Clipboard, Pill, 
  FileCheck, Clock, MoreHorizontal, ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

const Reports = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [scanReports, setScanReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("prescriptions"); // prescriptions | scans

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Medical Reports</h2>
        <div className="flex bg-slate-100 p-1 rounded-xl shadow-sm">
           <button 
             onClick={() => setActiveTab("prescriptions")}
             className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'prescriptions' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
           >
             Prescriptions
           </button>
           <button 
             onClick={() => setActiveTab("scans")}
             className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'scans' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
           >
             Scan Reports
           </button>
        </div>
      </div>

      <div className="w-full">
        <div className="mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
           <div className="relative w-full md:w-96">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
             <input 
               type="text" 
               placeholder={`Search ${activeTab}...`} 
               className="w-full bg-white border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-rose-500/20 outline-none"
             />
           </div>
           <button className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2.5 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">
             <Filter size={18} />
             Filters
           </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {[1, 2, 3].map(i => <div key={i} className="h-48 bg-white rounded-3xl border border-slate-100 animate-pulse" />)}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {activeTab === "prescriptions" ? (
              <motion.div 
                key="pres"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {prescriptions.length === 0 ? (
                  <EmptyState title="No prescriptions found" desc="Your dental prescriptions will appear here once issued by a doctor." />
                ) : (
                  prescriptions.map((p, i) => <PrescriptionCard key={i} prescription={p} />)
                )}
              </motion.div>
            ) : (
              <motion.div 
                key="scans"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {scanReports.length === 0 ? (
                  <EmptyState title="No scan reports" desc="Completed AI teeth scan analysis reports will appear here." />
                ) : (
                  scanReports.map((r, i) => <ScanReportCard key={i} report={r} />)
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

const PrescriptionCard = ({ prescription: p }) => (
  <div className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col hover:shadow-lg transition-all group">
     <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600">
           <Pill size={24} />
        </div>
        <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-xl"><MoreHorizontal size={18}/></button>
     </div>
     <h3 className="font-bold text-slate-800 text-lg mb-1">{p.diagnosis || 'Dental Prescription'}</h3>
     <p className="text-sm text-slate-500 flex items-center gap-2 mb-4">
        <Calendar size={14} /> {new Date(p.createdAt).toLocaleDateString()}
     </p>
     <div className="flex-1 space-y-2 mb-6">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Medicines</p>
        <div className="flex flex-wrap gap-2">
           {p.medications?.slice(0, 3).map((m, i) => (
             <span key={i} className="px-2 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[10px] font-bold text-slate-600">
               {m.name}
             </span>
           ))}
           {p.medications?.length > 3 && <span className="text-[10px] text-slate-400 font-bold">+{p.medications.length - 3} more</span>}
        </div>
     </div>
     <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">Dr</div>
           <span className="text-xs font-bold text-slate-700">Dr. {p.doctor?.fullName || 'Specialist'}</span>
        </div>
        <button className="p-2 bg-rose-600 text-white rounded-xl shadow-lg shadow-rose-600/20 hover:scale-105 transition-transform">
           <Download size={18} />
        </button>
     </div>
  </div>
);

const ScanReportCard = ({ report: r }) => (
  <div className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col hover:shadow-lg transition-all group">
     <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
           <Clipboard size={24} />
        </div>
        <div className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter">AI Analysis</div>
     </div>
     <h3 className="font-bold text-slate-800 text-lg mb-1">Teeth Scan Analysis</h3>
     <p className="text-sm text-slate-500 flex items-center gap-2 mb-4">
        <Calendar size={14} /> {new Date(r.createdAt).toLocaleDateString()}
     </p>
     <div className="flex-1 bg-slate-50 rounded-2xl p-4 mb-6 border border-slate-100">
        <p className="text-xs text-slate-500 leading-relaxed italic">"Analysis complete. Your detailed dental health report is ready for review."</p>
     </div>
     <div className="flex gap-2">
        <a 
          href={`/api/scan-qa/report-file/${r.scanId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 bg-indigo-600 text-white py-3 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all"
        >
          <Eye size={18} /> View Report
        </a>
     </div>
  </div>
);

const EmptyState = ({ title, desc }) => (
  <div className="col-span-full py-20 text-center space-y-4">
     <div className="w-24 h-24 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto text-slate-200 border border-slate-100">
        <FileText size={48} />
     </div>
     <div>
        <h3 className="text-xl font-bold text-slate-800">{title}</h3>
        <p className="text-slate-500 text-sm max-w-xs mx-auto mt-1">{desc}</p>
     </div>
  </div>
);

export default Reports;
