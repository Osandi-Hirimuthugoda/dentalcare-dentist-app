import React from "react";
import { Search, Bell, Menu } from "lucide-react";

const PatientHeader = ({ sidebarOpen, setSidebarOpen, userName, notifications }) => {
  return (
    <header className="bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 md:block hidden">
          <Menu size={20} />
        </button>
        <div className="relative md:w-96 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search services, doctors..." 
            className="w-full bg-slate-50 border-none rounded-xl pl-10 pr-4 py-2 focus:ring-2 focus:ring-cyan-500/20 text-sm"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="relative p-2 hover:bg-slate-100 rounded-xl text-slate-600">
          <Bell size={20} />
          {notifications > 0 && (
            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
          )}
        </button>
        <div className="h-8 w-px bg-slate-200 mx-2 hidden sm:block" />
        <div className="flex items-center gap-3 pl-2">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-800 leading-tight">{userName}</p>
            <p className="text-xs text-slate-500">Member</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-200 overflow-hidden ring-2 ring-white shadow-sm">
            <img src={`https://ui-avatars.com/api/?name=${userName}&background=0891b2&color=fff`} alt="Profile" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default PatientHeader;
