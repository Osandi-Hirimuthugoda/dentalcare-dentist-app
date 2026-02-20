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
  Star,
  Camera,
} from "lucide-react";
import NotificationBell from "../common/NotificationBell";
import styles from "../../styles/components/DoctorSidebar.module.css";

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
    <div className={styles.sidebarContainer}>
      <div className={styles.sidebarHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Stethoscope size={28} /> DentalCare+
        </div>
        <NotificationBell />
      </div>

      <nav className={styles.sidebarNav}>
        <ul>
          <li className={styles.navItem}>
            <Link
              to="/doctor-dashboard"
              className={`${styles.navLink} ${
                isActive("/doctor-dashboard") ? styles.active : ""
              }`}
            >
              <LayoutDashboard size={20} className={styles.navIcon} /> Dashboard
            </Link>
          </li>

          <li className={styles.navItem}>
            <Link
              to="/doctor/appointments"
              className={`${styles.navLink} ${
                isActive("/doctor/appointments") ? styles.active : ""
              }`}
            >
              <Calendar size={20} className={styles.navIcon} /> Appointments
            </Link>
          </li>

          <li className={styles.navItem}>
            <Link
              to="/doctor/patients"
              className={`${styles.navLink} ${
                isActive("/doctor/patients") ? styles.active : ""
              }`}
            >
              <Users size={20} className={styles.navIcon} /> Patients
            </Link>
          </li>

          <li className={styles.navItem}>
            <Link
              to="/doctor/messages"
              className={`${styles.navLink} ${
                isActive("/doctor/messages") ? styles.active : ""
              }`}
            >
              <MessageSquare size={20} className={styles.navIcon} /> Messages
            </Link>
          </li>

          <li className={styles.navItem}>
            <Link
              to="/doctor/reports"
              className={`${styles.navLink} ${
                isActive("/doctor/reports") ? styles.active : ""
              }`}
            >
              <FileText size={20} className={styles.navIcon} /> Reports
            </Link>
          </li>

          <li className={styles.navItem}>
            <Link
              to="/doctor/scan-qa"
              className={`${styles.navLink} ${
                isActive("/doctor/scan-qa") ? styles.active : ""
              }`}
            >
              <Camera size={20} className={styles.navIcon} /> Scan Q&A
            </Link>
          </li>

          <li className={styles.navItem}>
            <Link
              to="/doctor/profile"
              className={`${styles.navLink} ${
                isActive("/doctor/profile") ? styles.active : ""
              }`}
            >
              <User size={20} className={styles.navIcon} /> Profile
            </Link>
          </li>

          <li className={styles.navItem}>
            <Link
              to="/doctor/availability"
              className={`${styles.navLink} ${
                isActive("/doctor/availability") ? styles.active : ""
              }`}
            >
              <Calendar size={20} className={styles.navIcon} /> Availability
            </Link>
          </li>

          <li className={styles.navItem}>
            <Link
              to="/doctor/services"
              className={`${styles.navLink} ${
                isActive("/doctor/services") ? styles.active : ""
              }`}
            >
              <Stethoscope size={20} className={styles.navIcon} /> Services
            </Link>
          </li>

          <li className={styles.navItem}>
            <Link
              to="/doctor/reviews"
              className={`${styles.navLink} ${
                isActive("/doctor/reviews") ? styles.active : ""
              }`}
            >
              <Star size={20} className={styles.navIcon} /> Reviews
            </Link>
          </li>

          <li className={styles.navItem}>
            <Link
              to="/doctor/settings"
              className={`${styles.navLink} ${
                isActive("/doctor/settings") ? styles.active : ""
              }`}
            >
              <Settings size={20} className={styles.navIcon} /> Settings
            </Link>
          </li>
        </ul>
      </nav>

      <div className={styles.sidebarFooter}>
        <button onClick={handleLogout} className={styles.logoutButton}>
          <LogOut size={18} /> Logout
        </button>
      </div>
    </div>
  );
}
