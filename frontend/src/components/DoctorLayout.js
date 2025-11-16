import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import DoctorSidebar from "./DoctorSidebar";

export default function DoctorLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("doctor");
    navigate("/doctor-login");
  };

  return (
    <div className="flex min-h-screen bg-blue-50">
      <DoctorSidebar onLogout={handleLogout} />
      <div className="flex-1 p-10 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
}
