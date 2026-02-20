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
  Building2,
} from "lucide-react";
import NotificationBell from "../common/NotificationBell";
import styles from "../../styles/components/DoctorSidebar.module.css";

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
    <div className={styles.sidebarContainer}>
      <div className={styles.sidebarHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Shield size={28} /> Admin Panel
        </div>
        <NotificationBell />
      </div>

      <nav className={styles.sidebarNav}>
        <ul>
          <li className={styles.navItem}>
            <Link
              to="/admin-dashboard"
              className={`${styles.navLink} ${
                isActive("/admin-dashboard") ? styles.active : ""
              }`}
            >
              <LayoutDashboard size={20} className={styles.navIcon} /> Dashboard
            </Link>
          </li>

          <li className={styles.navItem}>
            <Link
              to="/admin/register-doctor"
              className={`${styles.navLink} ${
                isActive("/admin/register-doctor") ? styles.active : ""
              }`}
            >
              <UserPlus size={20} className={styles.navIcon} /> Register Doctor
            </Link>
          </li>

          <li className={styles.navItem}>
            <Link
              to="/admin/doctors"
              className={`${styles.navLink} ${
                isActive("/admin/doctors") ? styles.active : ""
              }`}
            >
              <Users size={20} className={styles.navIcon} /> Manage Doctors
            </Link>
          </li>

          <li className={styles.navItem}>
            <Link
              to="/admin/patients"
              className={`${styles.navLink} ${
                isActive("/admin/patients") ? styles.active : ""
              }`}
            >
              <UserCircle size={20} className={styles.navIcon} /> Patients
            </Link>
          </li>

          <li className={styles.navItem}>
            <Link
              to="/admin/appointments"
              className={`${styles.navLink} ${
                isActive("/admin/appointments") ? styles.active : ""
              }`}
            >
              <Calendar size={20} className={styles.navIcon} /> Appointments
            </Link>
          </li>

          <li className={styles.navItem}>
            <Link
              to="/admin/activity"
              className={`${styles.navLink} ${
                isActive("/admin/activity") ? styles.active : ""
              }`}
            >
              <Activity size={20} className={styles.navIcon} /> Activity
            </Link>
          </li>

          <li className={styles.navItem}>
            <Link
              to="/admin/hospitals"
              className={`${styles.navLink} ${
                isActive("/admin/hospitals") ? styles.active : ""
              }`}
            >
              <Building2 size={20} className={styles.navIcon} /> Hospitals
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
