import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Scan, Calendar, ClipboardList, Receipt, 
  FileText, MessageCircle, MessageSquare, Wallet,
  TrendingUp, Clock, CheckCircle
} from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";

const Dashboard = () => {
  const [userName, setUserName] = useState("Patient");
  const [walletBalance, setWalletBalance] = useState(0);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        setUserName(user.fullName || "Patient");

        const walletRes = await axios.get("/api/wallet/info", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setWalletBalance(walletRes.data.balance || 0);
      } catch (err) {
        console.error("Dashboard error:", err);
      }
    };
    fetchDashboardData();
  }, []);

  const quickActions = [
    { id: 1, title: "AI Teeth Scan", icon: Scan, path: "/health", color: "bg-blue-500", desc: "Scan and analyze teeth using AI" },
    { id: 2, title: "Book Appointment", icon: Calendar, path: "/appointments", color: "bg-emerald-500", desc: "Schedule a visit with your dentist" },
    { id: 3, title: "My Treatments", icon: ClipboardList, path: "/appointments", color: "bg-purple-500", desc: "View your dental history" },
    { id: 4, title: "My Bills", icon: Receipt, path: "/my-bills", color: "bg-amber-500", desc: "Manage payments and invoices" },
    { id: 7, title: "Messages", icon: MessageSquare, path: "/messages", color: "bg-cyan-500", desc: "Chat with your dental team" },
    { id: 8, title: "Wallet", icon: Wallet, path: "/wallet", color: "bg-orange-500", desc: "Top-up and check balance" },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-gradient-to-br from-cyan-600 to-blue-700 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl"
        >
          <div className="relative z-10 space-y-4">
            <h1 className="text-3xl font-bold">Good Day, {userName}! 👋</h1>
            <p className="text-cyan-100 max-w-md">Your oral health journey is looking great. You have one upcoming appointment tomorrow.</p>
            <div className="flex gap-4 pt-2">
              <Link to="/health" className="bg-white text-cyan-700 px-6 py-2.5 rounded-xl font-bold hover:bg-cyan-50 transition-colors flex items-center gap-2">
                <Scan size={18} />
                Start AI Scan
              </Link>
              <Link to="/appointments" className="bg-cyan-500/30 text-white border border-cyan-400/30 px-6 py-2.5 rounded-xl font-bold hover:bg-cyan-500/40 transition-colors">
                My Schedule
              </Link>
            </div>
          </div>
          <div className="absolute right-0 bottom-0 w-64 h-64 opacity-20 transform translate-x-10 translate-y-10">
            <Scan size={250} />
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 flex flex-col justify-between"
        >
          <div>
            <p className="text-slate-500 font-medium mb-1">Total Wallet Balance</p>
            <h2 className="text-4xl font-black text-slate-800">LKR {walletBalance.toLocaleString()}</h2>
            <div className="mt-4 flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-xs font-bold w-fit">
              <TrendingUp size={14} />
              <span>+12.5% this month</span>
            </div>
          </div>
          <Link to="/wallet" className="mt-8 flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-cyan-600">
                <Wallet size={20} />
              </div>
              <span className="font-bold text-slate-700">Go to Wallet</span>
            </div>
            <Clock size={18} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>

      {/* Quick Actions Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">Quick Actions</h2>
          <button className="text-cyan-600 font-bold text-sm hover:underline">View All</button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {quickActions.map((action, i) => (
            <motion.div
              key={action.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * i }}
            >
              <Link 
                to={action.path}
                className="group bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:border-cyan-200 transition-all flex flex-col items-center text-center space-y-4"
              >
                <div className={`w-14 h-14 ${action.color} rounded-2xl flex items-center justify-center text-white shadow-lg transform group-hover:rotate-6 transition-transform`}>
                  <action.icon size={28} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">{action.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-1">{action.desc}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Appointment */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Next Appointment</h3>
          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
            <div className="w-16 h-16 bg-white rounded-xl shadow-sm flex flex-col items-center justify-center text-cyan-600 border border-slate-100">
              <span className="text-xs font-bold uppercase">Oct</span>
              <span className="text-xl font-black">15</span>
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-slate-800">Regular Check-up</h4>
              <p className="text-sm text-slate-500">Dr. Sarah Johnson • 10:30 AM</p>
            </div>
            <div className="flex flex-col gap-2">
              <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black uppercase text-center">Confirmed</span>
              <button className="text-cyan-600 text-xs font-bold hover:underline">Reschedule</button>
            </div>
          </div>
        </div>

        {/* Health Tips / Insights */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 overflow-hidden relative">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-800">Health Insights</h3>
            <CheckCircle size={20} className="text-emerald-500" />
          </div>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-1.5 h-12 bg-amber-400 rounded-full" />
              <div>
                <p className="text-sm font-bold text-slate-800">Brush twice a day</p>
                <p className="text-xs text-slate-500 mt-1">Maintaining consistency is key to long-term oral health.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-1.5 h-12 bg-cyan-400 rounded-full" />
              <div>
                <p className="text-sm font-bold text-slate-800">Drink more water</p>
                <p className="text-xs text-slate-500 mt-1">Water helps wash away food particles and bacteria.</p>
              </div>
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-cyan-50 rounded-full opacity-50" />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
