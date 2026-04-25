import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Calendar, Users, MessageSquare,
  Settings, LogOut, Stethoscope, FileText, User,
  Star, Camera, Clock,
} from "lucide-react";
import NotificationBell from "../common/NotificationBell";
import { useNotifications } from "../../contexts/NotificationContext";
import styles from "../../styles/components/DoctorSidebar.module.css";

const NavLink = ({ to, icon: Icon, label, isActive }) => (
  <li className={styles.navItem}>
    <Link
      to={to}
      className={`${styles.navLink} ${isActive(to) ? styles.active : ""}`}
    >
      <Icon size={16} className={styles.navIcon} />
      {label}
    </Link>
  </li>
);

export default function DoctorSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = (path) => location.pathname === path;

  const { initializeSocket, disconnectSocket } = useNotifications();

  React.useEffect(() => {
    initializeSocket();
  }, [initializeSocket]);

  const handleLogout = () => {
    disconnectSocket();
    localStorage.removeItem("token");
    localStorage.removeItem("doctor");
    navigate("/");
  };

  return (
    <div className={styles.sidebarContainer}>
      {/* Header */}
      <div className={styles.sidebarHeader}>
        <span className={styles.brandName}>
          <Stethoscope size={18} /> DentalCare+
        </span>
        <NotificationBell />
      </div>

      {/* Nav */}
      <nav className={styles.sidebarNav}>
        {/* Main */}
        <div className={styles.navSection}>
          <p className={styles.navSectionLabel}>Main</p>
          <ul>
            <NavLink to="/doctor-dashboard" icon={LayoutDashboard} label="Dashboard" isActive={isActive} />
            <NavLink to="/doctor/appointments" icon={Calendar} label="Appointments" isActive={isActive} />
            <NavLink to="/doctor/patients" icon={Users} label="Patients" isActive={isActive} />
            <NavLink to="/doctor/messages" icon={MessageSquare} label="Messages" isActive={isActive} />
          </ul>
        </div>

        <div className={styles.navDivider} />

        {/* Clinical */}
        <div className={styles.navSection}>
          <p className={styles.navSectionLabel}>Clinical</p>
          <ul>
            <NavLink to="/doctor/reports" icon={FileText} label="Reports" isActive={isActive} />
            <NavLink to="/doctor/scan-qa" icon={Camera} label="Scan Q&A" isActive={isActive} />
            <NavLink to="/doctor/availability" icon={Clock} label="Availability" isActive={isActive} />
            <NavLink to="/doctor/services" icon={Stethoscope} label="Services" isActive={isActive} />
          </ul>
        </div>

        <div className={styles.navDivider} />

        {/* Account */}
        <div className={styles.navSection}>
          <p className={styles.navSectionLabel}>Account</p>
          <ul>
            <NavLink to="/doctor/profile" icon={User} label="Profile" isActive={isActive} />
            <NavLink to="/doctor/reviews" icon={Star} label="Reviews" isActive={isActive} />
            <NavLink to="/doctor/settings" icon={Settings} label="Settings" isActive={isActive} />
          </ul>
        </div>
      </nav>

      {/* Logout */}
      <div className={styles.logoutItem}>
        <button onClick={handleLogout} className={styles.logoutButton}>
          <LogOut size={16} className={styles.navIcon} />
          Logout
        </button>
      </div>
    </div>
  );
}
