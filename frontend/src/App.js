import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import DoctorLogin from "./pages/DoctorLogin";
import DoctorRegister from "./pages/DoctorRegister";
import DoctorDashboard from "./pages/DoctorDashboard";
import Patients from "./pages/Patients";
import DoctorMessages from "./pages/DoctorMessages";
import DoctorAppointments from "./pages/DoctorAppointments";
import DoctorReports from "./pages/DoctorReports";
import DoctorProfile from "./pages/DoctorProfile";
import DoctorSettings from "./pages/DoctorSettings";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminRegisterDoctor from "./pages/AdminRegisterDoctor";
import AdminDoctors from "./pages/AdminDoctors";
import AdminAppointments from "./pages/AdminAppointments";
import AdminActivity from "./pages/AdminActivity";
import AdminPatients from "./pages/AdminPatients";
import NotFound from "./pages/NotFound";

// Protected Route Component for Admin
const AdminProtectedRoute = ({ children }) => {
  const admin = localStorage.getItem("admin");
  return admin ? children : <Navigate to="/admin-login" replace />;
};

// Protected Route Component for Doctor
const DoctorProtectedRoute = ({ children }) => {
  const doctor = localStorage.getItem("doctor");
  return doctor ? children : <Navigate to="/doctor-login" replace />;
};

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/doctor-login" element={<DoctorLogin />} />
        <Route path="/doctor-register" element={<DoctorRegister />} />
        <Route path="/admin-login" element={<AdminLogin />} />

        {/* Doctor portal */}
        <Route
          path="/doctor-dashboard"
          element={
            <DoctorProtectedRoute>
              <DoctorDashboard />
            </DoctorProtectedRoute>
          }
        />
        <Route
          path="/doctor/patients"
          element={
            <DoctorProtectedRoute>
              <Patients />
            </DoctorProtectedRoute>
          }
        />
        <Route
          path="/doctor/appointments"
          element={
            <DoctorProtectedRoute>
              <DoctorAppointments />
            </DoctorProtectedRoute>
          }
        />
        <Route
          path="/doctor/reports"
          element={
            <DoctorProtectedRoute>
              <DoctorReports />
            </DoctorProtectedRoute>
          }
        />
        <Route
          path="/doctor/messages"
          element={
            <DoctorProtectedRoute>
              <DoctorMessages />
            </DoctorProtectedRoute>
          }
        />
        <Route
          path="/doctor/profile"
          element={
            <DoctorProtectedRoute>
              <DoctorProfile />
            </DoctorProtectedRoute>
          }
        />
        <Route
          path="/doctor/settings"
          element={
            <DoctorProtectedRoute>
              <DoctorSettings />
            </DoctorProtectedRoute>
          }
        />

        {/* Admin portal */}
        <Route
          path="/admin-dashboard"
          element={
            <AdminProtectedRoute>
              <AdminDashboard />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/register-doctor"
          element={
            <AdminProtectedRoute>
              <AdminRegisterDoctor />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/doctors"
          element={
            <AdminProtectedRoute>
              <AdminDoctors />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/appointments"
          element={
            <AdminProtectedRoute>
              <AdminAppointments />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/activity"
          element={
            <AdminProtectedRoute>
              <AdminActivity />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/patients"
          element={
            <AdminProtectedRoute>
              <AdminPatients />
            </AdminProtectedRoute>
          }
        />

        {/* 404 Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default App;
