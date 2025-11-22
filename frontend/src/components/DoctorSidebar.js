import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  Users,
  MessageSquare,
  Settings,
  LogOut,
  Stethoscope,
  FileText,
  User,
} from "lucide-react";
import sidebarStyles from "../styles/DoctorSidebar.module.css";

export default function DoctorSidebar() {
  const location = useLocation();
  const navigate = useNavigate();


  const currentPath = location.pathname;


  const isActive = (path) => currentPath === path;

  
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("doctor");
    navigate("/");
  };

  return (
    <div className={sidebarStyles.sidebarContainer}>
      <div className={sidebarStyles.sidebarHeader}>
        <Stethoscope size={28} /> DentalCare+
      </div>

      <nav className={sidebarStyles.sidebarNav}>
        <ul>
          <li className={sidebarStyles.navItem}>
            <Link
              to="/doctor-dashboard"
              className={`${sidebarStyles.navLink} ${
                isActive("/doctor-dashboard") ? sidebarStyles.active : ""
              }`}
            >
              <LayoutDashboard size={20} className={sidebarStyles.navIcon} /> Dashboard
            </Link>
          </li>

          <li className={sidebarStyles.navItem}>
            <Link
              to="/doctor/appointments"
              className={`${sidebarStyles.navLink} ${
                isActive("/doctor/appointments") ? sidebarStyles.active : ""
              }`}
            >
              <Calendar size={20} className={sidebarStyles.navIcon} /> Appointments
            </Link>
          </li>

          <li className={sidebarStyles.navItem}>
            <Link
              to="/doctor/patients"
              className={`${sidebarStyles.navLink} ${
                isActive("/doctor/patients") ? sidebarStyles.active : ""
              }`}
            >
              <Users size={20} className={sidebarStyles.navIcon} /> Patients
            </Link>
          </li>

          <li className={sidebarStyles.navItem}>
            <Link
              to="/doctor/messages"
              className={`${sidebarStyles.navLink} ${
                isActive("/doctor/messages") ? sidebarStyles.active : ""
              }`}
            >
              <MessageSquare size={20} className={sidebarStyles.navIcon} /> Messages
            </Link>
          </li>

          <li className={sidebarStyles.navItem}>
            <Link
              to="/doctor/reports"
              className={`${sidebarStyles.navLink} ${
                isActive("/doctor/reports") ? sidebarStyles.active : ""
              }`}
            >
              <FileText size={20} className={sidebarStyles.navIcon} /> Reports
            </Link>
          </li>

          <li className={sidebarStyles.navItem}>
            <Link
              to="/doctor/profile"
              className={`${sidebarStyles.navLink} ${
                isActive("/doctor/profile") ? sidebarStyles.active : ""
              }`}
            >
              <User size={20} className={sidebarStyles.navIcon} /> Profile
            </Link>
          </li>

          <li className={sidebarStyles.navItem}>
            <Link
              to="/doctor/availability"
              className={`${sidebarStyles.navLink} ${
                isActive("/doctor/availability") ? sidebarStyles.active : ""
              }`}
            >
              <Calendar size={20} className={sidebarStyles.navIcon} /> Availability
            </Link>
          </li>

          <li className={sidebarStyles.navItem}>
            <Link
              to="/doctor/settings"
              className={`${sidebarStyles.navLink} ${
                isActive("/doctor/settings") ? sidebarStyles.active : ""
              }`}
            >
              <Settings size={20} className={sidebarStyles.navIcon} /> Settings
            </Link>
          </li>
        </ul>
      </nav>

      <div className={sidebarStyles.sidebarFooter}>
        <button onClick={handleLogout} className={sidebarStyles.logoutButton}>
          <LogOut size={18} /> Logout
        </button>
      </div>
    </div>
  );
}
