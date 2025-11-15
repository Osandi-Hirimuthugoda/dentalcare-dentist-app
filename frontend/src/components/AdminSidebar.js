import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  UserPlus,
  Users,
  Calendar,
  Activity,
  Settings,
  LogOut,
  Shield,
  UserCircle,
} from "lucide-react";
import sidebarStyles from "../styles/DoctorSidebar.module.css";

export default function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const currentPath = location.pathname;
  const isActive = (path) => currentPath === path;

  const handleLogout = () => {
    localStorage.removeItem("admin");
    localStorage.removeItem("role");
    navigate("/");
  };

  return (
    <div className={sidebarStyles.sidebarContainer}>
      <div className={sidebarStyles.sidebarHeader}>
        <Shield size={28} /> Admin Panel
      </div>

      <nav className={sidebarStyles.sidebarNav}>
        <ul>
          <li className={sidebarStyles.navItem}>
            <Link
              to="/admin-dashboard"
              className={`${sidebarStyles.navLink} ${
                isActive("/admin-dashboard") ? sidebarStyles.active : ""
              }`}
            >
              <LayoutDashboard size={20} className={sidebarStyles.navIcon} /> Dashboard
            </Link>
          </li>

          <li className={sidebarStyles.navItem}>
            <Link
              to="/admin/register-doctor"
              className={`${sidebarStyles.navLink} ${
                isActive("/admin/register-doctor") ? sidebarStyles.active : ""
              }`}
            >
              <UserPlus size={20} className={sidebarStyles.navIcon} /> Register Doctor
            </Link>
          </li>

          <li className={sidebarStyles.navItem}>
            <Link
              to="/admin/doctors"
              className={`${sidebarStyles.navLink} ${
                isActive("/admin/doctors") ? sidebarStyles.active : ""
              }`}
            >
              <Users size={20} className={sidebarStyles.navIcon} /> Manage Doctors
            </Link>
          </li>

          <li className={sidebarStyles.navItem}>
            <Link
              to="/admin/patients"
              className={`${sidebarStyles.navLink} ${
                isActive("/admin/patients") ? sidebarStyles.active : ""
              }`}
            >
              <UserCircle size={20} className={sidebarStyles.navIcon} /> Patients
            </Link>
          </li>

          <li className={sidebarStyles.navItem}>
            <Link
              to="/admin/appointments"
              className={`${sidebarStyles.navLink} ${
                isActive("/admin/appointments") ? sidebarStyles.active : ""
              }`}
            >
              <Calendar size={20} className={sidebarStyles.navIcon} /> Appointments
            </Link>
          </li>

          <li className={sidebarStyles.navItem}>
            <Link
              to="/admin/activity"
              className={`${sidebarStyles.navLink} ${
                isActive("/admin/activity") ? sidebarStyles.active : ""
              }`}
            >
              <Activity size={20} className={sidebarStyles.navIcon} /> Activity
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

