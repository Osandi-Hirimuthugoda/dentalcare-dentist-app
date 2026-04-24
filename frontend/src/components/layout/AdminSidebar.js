import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, UserPlus, Users, Calendar,
  Activity, LogOut, Shield, UserCircle, Building2,
  PieChart, Package
} from "lucide-react";

import NotificationBell from "../common/NotificationBell";
import { useNotifications } from "../../contexts/NotificationContext";
import styles from "../../styles/components/DoctorSidebar.module.css";

const NavLink = ({ to, icon: Icon, label, isActive }) => (
  <li className={styles.navItem}>
    <Link to={to} className={`${styles.navLink} ${isActive(to) ? styles.active : ""}`}>
      <Icon size={16} className={styles.navIcon} />
      {label}
    </Link>
  </li>
);

export default function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = (path) => location.pathname === path;

  const { initializeSocket, disconnectSocket } = useNotifications();

  React.useEffect(() => {
    initializeSocket();
  }, [initializeSocket]);

  const handleLogout = () => {
    disconnectSocket();
    localStorage.removeItem("admin");
    localStorage.removeItem("role");
    navigate("/");
  };

  return (
    <div className={styles.sidebarContainer}>
      {/* Header */}
      <div className={styles.sidebarHeader}>
        <span className={styles.brandName}>
          <Shield size={18} /> Admin Panel
        </span>
        <NotificationBell />
      </div>

      {/* Nav */}
      <nav className={styles.sidebarNav}>
        {/* Main */}
        <div className={styles.navSection}>
          <p className={styles.navSectionLabel}>Main</p>
          <ul>
            <NavLink to="/admin-dashboard"       icon={LayoutDashboard} label="Dashboard"        isActive={isActive} />
            <NavLink to="/admin/reports"         icon={PieChart}        label="Reports"          isActive={isActive} />
            <NavLink to="/admin/inventory"       icon={Package}         iconClass={styles.iconBlue} label="Inventory"  isActive={isActive} />
            <NavLink to="/admin/appointments"    icon={Calendar}        label="Appointments"     isActive={isActive} />
            <NavLink to="/admin/activity"        icon={Activity}        label="Activity"         isActive={isActive} />

          </ul>
        </div>

        <div className={styles.navDivider} />

        {/* Management */}
        <div className={styles.navSection}>
          <p className={styles.navSectionLabel}>Management</p>
          <ul>
            <NavLink to="/admin/doctors"         icon={Users}           label="Doctors"          isActive={isActive} />
            <NavLink to="/admin/register-doctor" icon={UserPlus}        label="Register Doctor"  isActive={isActive} />
            <NavLink to="/admin/patients"        icon={UserCircle}      label="Patients"         isActive={isActive} />
            <NavLink to="/admin/hospitals"       icon={Building2}       label="Hospitals"        isActive={isActive} />
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
