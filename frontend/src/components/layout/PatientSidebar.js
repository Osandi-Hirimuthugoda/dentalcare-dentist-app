import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  TrendingUp, Calendar, Receipt, MessageSquare, 
  Wallet, User, LogOut, Scan, FileText
} from "lucide-react";

const PatientSidebar = ({ sidebarOpen }) => {
  const location = useLocation();

  const menuItems = [
    { name: "Overview", path: "/dashboard", icon: TrendingUp },
    { name: "Teeth Scan", path: "/health", icon: Scan },
    { name: "Appointments", path: "/appointments", icon: Calendar },
    { name: "Bills", path: "/my-bills", icon: Receipt },
    { name: "Messages", path: "/messages", icon: MessageSquare },
    { name: "Wallet", path: "/wallet", icon: Wallet },
    { name: "Profile", path: "/profile", icon: User },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("patient");
    window.location.href = "/login";
  };

  return (
    <aside className={`bg-white border-r border-slate-200 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'} hidden md:flex flex-col h-screen sticky top-0`}>
      <div className="p-6 flex items-center justify-between">
        <Link to="/" className={`flex items-center gap-2 ${!sidebarOpen && 'justify-center w-full'}`}>
          <div className="w-10 h-10 bg-cyan-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">D+</div>
          {sidebarOpen && <span className="text-xl font-bold text-slate-800">DentalCare+</span>}
        </Link>
      </div>
      
      <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => (
          <SidebarLink 
            key={item.path}
            icon={item.icon} 
            label={item.name} 
            active={location.pathname === item.path} 
            sidebarOpen={sidebarOpen} 
            path={item.path} 
          />
        ))}
      </nav>

      <div className="p-4 mt-auto">
        <button 
          onClick={handleLogout}
          className={`flex items-center gap-3 w-full p-3 rounded-xl text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors ${!sidebarOpen && 'justify-center'}`}
        >
          <LogOut size={20} />
          {sidebarOpen && <span className="font-medium">Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};

const SidebarLink = ({ icon: Icon, label, active, sidebarOpen, path }) => (
  <Link 
    to={path} 
    className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
      active 
        ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/20' 
        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
    } ${!sidebarOpen && 'justify-center'}`}
  >
    <Icon size={20} />
    {sidebarOpen && <span className="font-medium">{label}</span>}
  </Link>
);

export default PatientSidebar;
