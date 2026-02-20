// Application Constants

// API Base URL
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4001/api';

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  DOCTOR: 'doctor',
  PATIENT: 'patient'
};

// Route Paths
export const ROUTES = {
  // Public
  HOME: '/',
  LOGIN: '/login',
  NOT_FOUND: '/404',
  
  // Admin
  ADMIN_LOGIN: '/admin/login',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_DOCTORS: '/admin/doctors',
  ADMIN_PATIENTS: '/admin/patients',
  ADMIN_APPOINTMENTS: '/admin/appointments',
  ADMIN_HOSPITALS: '/admin/hospitals',
  ADMIN_ACTIVITY: '/admin/activity',
  ADMIN_REGISTER_DOCTOR: '/admin/register-doctor',
  
  // Doctor
  DOCTOR_LOGIN: '/doctor/login',
  DOCTOR_REGISTER: '/doctor/register',
  DOCTOR_DASHBOARD: '/doctor/dashboard',
  DOCTOR_APPOINTMENTS: '/doctor/appointments',
  DOCTOR_AVAILABILITY: '/doctor/availability',
  DOCTOR_PROFILE: '/doctor/profile',
  DOCTOR_MESSAGES: '/doctor/messages',
  DOCTOR_REVIEWS: '/doctor/reviews',
  DOCTOR_REPORTS: '/doctor/reports',
  DOCTOR_SERVICES: '/doctor/services',
  DOCTOR_SETTINGS: '/doctor/settings',
  DOCTOR_SCAN_QA: '/doctor/scan-qa',
  
  // Patient
  PATIENT_DASHBOARD: '/dashboard',
  PATIENT_APPOINTMENTS: '/appointments',
  PATIENT_HEALTH: '/health',
  PATIENT_BILLS: '/bills',
  PATIENT_NEARBY_DOCTORS: '/nearby-doctors',
  PATIENT_NEARBY_HOSPITALS: '/nearby-hospitals',
  PATIENT_PROFILE: '/patients'
};

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  THEME: 'theme'
};

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  
  // Doctors
  DOCTORS: '/doctors',
  DOCTOR_AVAILABILITY: '/availability',
  
  // Appointments
  APPOINTMENTS: '/appointments',
  
  // Patients
  PATIENTS: '/patients',
  
  // Hospitals
  HOSPITALS: '/hospitals',
  
  // Services
  SERVICES: '/services',
  
  // Bills
  BILLS: '/bills',
  
  // Reviews
  REVIEWS: '/reviews',
  
  // Messages
  MESSAGES: '/messages',
  
  // Notifications
  NOTIFICATIONS: '/notifications',
  
  // Health
  HEALTH: '/health',
  
  // AI Scan
  AI_SCAN: '/ai-scan',
  SCAN_QA: '/scan-qa'
};
