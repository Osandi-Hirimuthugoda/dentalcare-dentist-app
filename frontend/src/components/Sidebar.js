import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Calendar, Users, MessageCircle, Stethoscope, Settings, Home } from "lucide-react";

const DoctorSidebar = () => {
  const location = useLocation();

  const menuItems = [
    { name: "Dashboard", path: "/doctor-dashboard", icon: <Home size={18} /> },
    { name: "Patients", path: "/patients", icon: <Users size={18} /> },
    { name: "Appointments", path: "/appointments", icon: <Calendar size={18} /> },
    { name: "Chat", path: "/chat", icon: <MessageCircle size={18} /> },
    { name: "Teleconsultation", path: "/teleconsultations", icon: <Stethoscope size={18} /> },
    { name: "AI Diagnostics", path: "/ai-diagnostics", icon: <Stethoscope size={18} /> },
    { name: "Settings", path: "/settings", icon: <Settings size={18} /> },
  ];

  return (
    <div className="w-60 h-screen bg-white shadow-lg border-r border-gray-100 p-6">
      <h3 className="text-2xl font-bold text-cyan-600 mb-8">DentalCare+</h3>
      <ul className="space-y-3">
        {menuItems.map((item) => (
          <li key={item.path}>
            <Link
              to={item.path}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
                location.pathname === item.path
                  ? "bg-cyan-100 text-cyan-700 font-semibold"
                  : "text-gray-700 hover:bg-cyan-50 hover:text-cyan-700"
              }`}
            >
              {item.icon}
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DoctorSidebar;
