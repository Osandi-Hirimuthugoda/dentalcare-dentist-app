import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { NotificationProvider } from "./contexts/NotificationContext";

// Public Pages
import Home from "./pages/public/Home";
import NotFound from "./pages/public/NotFound";

// Doctor Pages
import DoctorLogin from "./pages/doctor/DoctorLogin";
import DoctorRegister from "./pages/doctor/DoctorRegister";
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import DoctorMessages from "./pages/doctor/DoctorMessages";
import DoctorAppointments from "./pages/doctor/DoctorAppointments";
import DoctorReports from "./pages/doctor/DoctorReports";
import DoctorProfile from "./pages/doctor/DoctorProfile";
import DoctorSettings from "./pages/doctor/DoctorSettings";
import DoctorAvailability from "./pages/doctor/DoctorAvailability";
import DoctorServices from "./pages/doctor/DoctorServices";
import DoctorReviews from "./pages/doctor/DoctorReviews";
import DoctorScanQA from "./pages/doctor/DoctorScanQA";

// Admin Pages
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminRegisterDoctor from "./pages/admin/AdminRegisterDoctor";
import AdminDoctors from "./pages/admin/AdminDoctors";
import AdminAppointments from "./pages/admin/AdminAppointments";
import AdminActivity from "./pages/admin/AdminActivity";
import AdminPatients from "./pages/admin/AdminPatients";
import AdminHospitals from "./pages/admin/AdminHospitals";

// Patient Pages
import Patients from "./pages/patient/Patients";
import NearbyHospitals from "./pages/patient/NearbyHospitals";
import NearbyDoctors from "./pages/patient/NearbyDoctors";
import Health from "./pages/patient/Health";
import MyBills from "./pages/patient/MyBills";

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
    <NotificationProvider>
      <Router>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={true}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          toastStyle={{
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          }}
        />
        <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/health" element={<Health />} />
        <Route path="/my-bills" element={<MyBills />} />
        <Route path="/nearby-hospitals" element={<NearbyHospitals />} />
        <Route path="/nearby-doctors" element={<NearbyDoctors />} />
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
        <Route
          path="/doctor/availability"
          element={
            <DoctorProtectedRoute>
              <DoctorAvailability />
            </DoctorProtectedRoute>
          }
        />
        <Route
          path="/doctor/scan-qa"
          element={
            <DoctorProtectedRoute>
              <DoctorScanQA />
            </DoctorProtectedRoute>
          }
        />
        <Route
          path="/doctor/services"
          element={
            <DoctorProtectedRoute>
              <DoctorServices />
            </DoctorProtectedRoute>
          }
        />
        <Route
          path="/doctor/reviews"
          element={
            <DoctorProtectedRoute>
              <DoctorReviews />
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
        <Route
          path="/admin/hospitals"
          element={
            <AdminProtectedRoute>
              <AdminHospitals />
            </AdminProtectedRoute>
          }
        />

        {/* 404 Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      </Router>
    </NotificationProvider>
  );
};

export default App;
