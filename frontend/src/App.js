import React, { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { NotificationProvider } from "./contexts/NotificationContext";
import PatientLayout from "./components/layout/PatientLayout";

// Public Pages
const Home = lazy(() => import("./pages/public/Home"));
const NotFound = lazy(() => import("./pages/public/NotFound"));

// Doctor Pages
const DoctorLogin = lazy(() => import("./pages/doctor/DoctorLogin"));
const DoctorRegister = lazy(() => import("./pages/doctor/DoctorRegister"));
const DoctorDashboard = lazy(() => import("./pages/doctor/DoctorDashboard"));
const DoctorMessages = lazy(() => import("./pages/doctor/DoctorMessages"));
const DoctorAppointments = lazy(() => import("./pages/doctor/DoctorAppointments"));
const DoctorReports = lazy(() => import("./pages/doctor/DoctorReports"));
const DoctorProfile = lazy(() => import("./pages/doctor/DoctorProfile"));
const DoctorSettings = lazy(() => import("./pages/doctor/DoctorSettings"));
const DoctorAvailability = lazy(() => import("./pages/doctor/DoctorAvailability"));
const DoctorServices = lazy(() => import("./pages/doctor/DoctorServices"));
const DoctorReviews = lazy(() => import("./pages/doctor/DoctorReviews"));
const DoctorScanQA = lazy(() => import("./pages/doctor/DoctorScanQA"));
const DoctorInventory = lazy(() => import("./pages/doctor/DoctorInventory"));

// Admin Pages
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminRegisterDoctor = lazy(() => import("./pages/admin/AdminRegisterDoctor"));
const AdminDoctors = lazy(() => import("./pages/admin/AdminDoctors"));
const AdminAppointments = lazy(() => import("./pages/admin/AdminAppointments"));
const AdminActivity = lazy(() => import("./pages/admin/AdminActivity"));
const AdminPatients = lazy(() => import("./pages/admin/AdminPatients"));
const AdminHospitals = lazy(() => import("./pages/admin/AdminHospitals"));
const AdminReports = lazy(() => import("./pages/admin/AdminReports"));
const AdminInventory = lazy(() => import("./pages/admin/AdminInventory"));

// Patient Pages
const Patients = lazy(() => import("./pages/patient/Patients"));
const NearbyHospitals = lazy(() => import("./pages/patient/NearbyHospitals"));
const NearbyDoctors = lazy(() => import("./pages/patient/NearbyDoctors"));
const Health = lazy(() => import("./pages/patient/Health"));
const MyBills = lazy(() => import("./pages/patient/MyBills"));
const Appointments = lazy(() => import("./pages/patient/Appointments"));
const Wallet = lazy(() => import("./pages/patient/Wallet"));
const ScanQA = lazy(() => import("./pages/patient/ScanQA"));
const Messages = lazy(() => import("./pages/patient/Messages"));
const Reports = lazy(() => import("./pages/patient/Reports"));
const Dashboard = lazy(() => import("./pages/patient/Dashboard"));


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

// Premium Glassmorphic Loading Spinner
const LoadingSpinner = () => (
  <div style={{
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    background: "linear-gradient(135deg, #f0fdfa 0%, #ecfeff 100%)",
    fontFamily: "'Inter', sans-serif"
  }}>
    <div style={{
      width: "50px",
      height: "50px",
      border: "3px solid #e2e8f0",
      borderTop: "3px solid #00897B",
      borderRadius: "50%",
      animation: "spin 1s linear infinite"
    }} />
    <p style={{
      marginTop: "16px",
      color: "#0f766e",
      fontWeight: "500",
      fontSize: "14px",
      letterSpacing: "0.5px"
    }}>Loading DentalCare+...</p>
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

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
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/nearby-doctors" element={<NearbyDoctors />} />
            
            {/* Patient Private Routes Wrapped in PatientLayout */}
            <Route element={<PatientLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/appointments" element={<Appointments />} />
              <Route path="/wallet" element={<Wallet />} />
              <Route path="/scan-qa" element={<ScanQA />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/my-bills" element={<MyBills />} />
              <Route path="/health" element={<Health />} />
            </Route>
            
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
            <Route
              path="/doctor/inventory"
              element={
                <DoctorProtectedRoute>
                  <DoctorInventory />
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
            <Route
              path="/admin/reports"
              element={
                <AdminProtectedRoute>
                  <AdminReports />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/inventory"
              element={
                <AdminProtectedRoute>
                  <AdminInventory />
                </AdminProtectedRoute>
              }
            />

            {/* 404 Fallback */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </Router>
    </NotificationProvider>
  );
};

export default App;

