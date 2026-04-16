# 🦷 DentalCare+ — Professional Dental Intelligence

[![CI/CD Pipeline](https://github.com/Osandi-Hirimuthugoda/dentalcare-dentist-app/actions/workflows/ci.yml/badge.svg)](https://github.com/Osandi-Hirimuthugoda/dentalcare-dentist-app/actions/workflows/ci.yml)

DentalCare+ is a unified ecosystem designed to bridge the gap between patients and dental professionals. By combining **AI-powered diagnosis**, **Real-time collaboration**, and **Streamlined practice management**, we are redefining modern oral healthcare.

---

## 📖 Documentation Hub

| Asset | Description |
| :--- | :--- |
| **[🌐 Interactive Portal](docs/index.html)** | **Recommended Start.** A high-end visual guide with architecture, live diagrams, and role-based deep dives. |
| **[📘 User Manual](docs/USER_MANUAL.md)** | Technical reference, data models, and step-by-step feature workflows. |

---

## 📱 Mobile App vs. 💻 Web Application

The system is split into two distinct frontends to serve different user needs:

### 📱 Patient Mobile App (Flutter)
A dedicated health companion for patients to manage their dental journey on the go.
- **Deep AI Integration**: Run teeth disease detection directly from the camera.
- **Location Services**: Real-time GPS tracking to find the nearest open dental hospitals.
- **Health Tracking**: Stay informed with health scores and treatment history.
- **Financial Management**: Built-in digital wallet for secure payments.

### 💻 Doctor & Admin Web Portal (React 19)
A powerful management suite for medical professionals and platform administrators.
- **Clinical Operations**: Full patient profile management and EHR tracking.
- **Decision Support**: Doctor-facing dashboard to review AI scans and provide second opinions.
- **System Administration**: High-level control over the medical network, hospitals, and doctor onboarding.

---

## 👥 User Roles & Detailed Features

DentalCare+ uses a role-based access control (RBAC) system with 3 primary roles:

### 🩻 [Role] Patient (Mobile Only)
*The primary consumer of dental checkups and services.*
- **AI-Powered Diagnostics**: Capture images to detect Calculus, Gingivitis, Cancers, etc.
- **Specialist Q&A**: Post unique questions regarding AI scan results to a pool of dentists.
- **Smart Booking**: Schedule, reschedule, or cancel appointments based on real-time doctor availability.
- **Digital Billing**: View detailed bills and pay using the integrated wallet or card system.
- **Nearby Discovery**: Integrated Google Maps view for Finding Hospitals and Dentists.
- **Real-time Comms**: Instant messaging with assigned doctors or nurses.

### 👨‍⚕️ [Role] Doctor (Web App)
*The medical professional managing clinical delivery.*
- **Practice Dashboard**: Real-time stats on upcoming appointments and patient growth.
- **Scan Q&A Hub**: Review AI-detected anomalies and provide professional medical advice to patients.
- **Schedule Management**: Configure availability slots to allow automated patient booking.
- **Patient Management**: access full medical history, appointment logs, and scan history.
- **Service Catalog**: Manage the list of dental services offered at their clinic.
- **Feedback Loop**: View patient reviews and service satisfaction ratings.

### ⚙️ [Role] System Admin (Web App)
*The platform regulator and data manager.*
- **Staff Onboarding**: Register and verify doctor identities and medical licenses.
- **Global Dashboard**: Monitor system-wide activity, appointment volumes, and revenue.
- **Hospital Directory**: Manage the registry of dental hospitals and their geographical data.
- **Activity Logs**: Audit trail of system changes and user transactions for security.

---

## 📈 Technical Project Statistics

| Metric | Value |
| :--- | :--- |
| **Frontend Framework** | React 19 (Tailwind CSS 4 + Framer Motion) |
| **Mobile Framework** | Flutter 3.7+ (BLoC Architecture) |
| **AI Intelligence** | PyTorch (EfficientNet-B3 Model) |
| **Backend Engine** | Node.js 18 (Express API) |
| **Persistence** | MongoDB (Mongoose ODM) |
| **Real-time Core** | Socket.io (WebSocket for notifications & chat) |

---

## 🛠️ Quick Start Guide

### 🐳 Option A: Using Docker (Recommended)
Make sure you have Docker and Docker Compose installed.
```bash
# Setup environment
cp .env.example .env

# Build and start all services
docker-compose up -d --build
```
*Access Web at `localhost:3000` and API at `localhost:4000`.*

### 💻 Option B: Local Development
1.  **Backend**: `cd backend && npm install && npm run dev`
2.  **AI Engine**: `cd backend/models && python flask_api.py`
3.  **Web Frontend**: `cd frontend && npm install && npm start`
4.  **Mobile App**: `cd mobile && flutter pub get && flutter run`

---

## 🏗️ Project Structure

```text
dentists-app/
├── 📂 backend/       # Node.js API (Controllers, Auth, Services)
│   └── 📂 models/    # Python Flask AI & Prediction scripts
├── 📂 frontend/      # React Application (Admin & Doctor Dashboards)
├── 📂 mobile/        # Flutter Patient Application (Dart)
├── 📂 docs/          # Unified Doc Site & System Manuals
└── 📂 tests/         # E2E and Unit testing suite
```

---
© 2026 DentalCare+ | Built for Excellence in Oral Health
