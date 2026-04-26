import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import PatientSidebar from "./PatientSidebar";
import PatientHeader from "./PatientHeader";
import axios from "axios";

const PatientLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userName, setUserName] = useState("Patient");
  const [notifications, setNotifications] = useState(0);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setUserName(user.fullName || "Patient");
    
    // Initial fetch for notifications or other global patient state
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <PatientSidebar sidebarOpen={sidebarOpen} />
      <div className="flex-1 flex flex-col min-w-0">
        <PatientHeader 
          sidebarOpen={sidebarOpen} 
          setSidebarOpen={setSidebarOpen} 
          userName={userName}
          notifications={notifications}
        />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default PatientLayout;
