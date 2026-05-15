# DentalCare+

A full-stack dental care platform with AI-powered teeth scan analysis. The system connects patients with dentists, supports appointment booking, real-time messaging, billing, inventory management, and automated dental disease detection using a deep learning CNN model.

---

## Architecture

```
dentists-app/
├── backend/          # Node.js REST API + Socket.io
│   ├── src/          # Controllers, models, routes, middleware
│   └── models/       # Python Flask AI service (PyTorch CNN)
├── frontend/         # React web app (Doctor & Admin portals)
├── mobile/           # Flutter mobile app (Patient portal)
└── tests/            # Selenium E2E + Jest + Flutter test suite
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend API | Node.js 20, Express 4, MongoDB 7, Socket.io |
| AI Service | Python 3.10, Flask, PyTorch (CNN v3) |
| Web Frontend | React 19, React Router 6, Recharts, Tailwind CSS |
| Mobile App | Flutter 3, BLoC, GetIt (DI), Google Maps SDK |
| Database | MongoDB (Mongoose ODM) |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| Email | Nodemailer (Gmail SMTP) |
| Testing | Jest, Supertest, Selenium WebDriver, pytest, Flutter test |
| CI/CD | GitHub Actions |
| Deployment | Docker, Docker Compose |

---

## Features

### Patient (Mobile App — Flutter)
- Register, login with email OTP verification
- Book appointments with dentists (5-step wizard: condition → service → doctor → date/time → confirm)
- AI teeth scan — upload a photo, get instant dental disease detection with severity scores
- View scan reports and attach them to appointments
- Real-time messaging with doctors (Socket.io)
- Wallet top-up and bill payments
- View and download bills as PDF
- Find nearby hospitals and dentists (Google Maps)
- Onboarding screens for new users
- Dark mode / Eye comfort mode

### Doctor (Web Portal — React)
- Dashboard with appointment stats, monthly charts, recent messages
- Manage appointments — confirm, reschedule, complete
- View and manage patient records
- Set weekly availability schedules
- Upload scan reports and prescriptions
- Real-time patient messaging with Socket.io notifications
- Manage offered services (select from catalogue or create new)
- View clinic inventory (read-only — supplies, medicines, equipment)
- Patient reviews and ratings
- Profile and account settings

### Admin (Web Portal — React)
- System dashboard with live stats (doctors, patients, appointments)
- Register and manage doctors (CRUD with edit modal)
- Manage patients and appointments
- Manage hospitals with geolocation coordinates
- Inventory management — add, update stock, delete items with low-stock alerts
- System analytics — revenue charts, patient growth, appointment status breakdown, popular services, doctor performance table
- System activity log

### AI Disease Detection
- PyTorch CNN model (v3) trained on dental image data
- Detects conditions: gingivitis, caries, hypodontia, tooth discolouration, and more
- REST API via Flask (`POST /predict`, `GET /health`, `GET /classes`)
- Accepts multipart image upload or base64 encoded image
- Scan Q&A — patients can ask questions about their scan results

---

## Getting Started

### Prerequisites
- Node.js 20+
- Python 3.10+
- Flutter 3.29+
- MongoDB 7+ (or Docker)
- Docker & Docker Compose

### Run with Docker (recommended)

```bash
# 1. Copy and configure environment
cp .env.example .env
# Edit .env — set JWT_SECRET at minimum

# 2. Start all services
docker-compose up -d

# 3. Seed initial data (run after containers are up)
docker exec -it dentalcare-backend node seedInventory.js
docker exec -it dentalcare-backend node seedReportsData.js
```

Services:
| Service | URL |
|---|---|
| Frontend (Web) | http://localhost:3000 |
| Backend API | http://localhost:4000 |
| AI Model API | http://localhost:5000 |
| MongoDB | localhost:27017 |

### Run Locally (without Docker)

**Backend**
```bash
cd backend
npm install
cp .env.example .env   # fill in MONGO_URI, JWT_SECRET, EMAIL_USER, EMAIL_PASS
npm run dev            # starts on port 4000
```

**Frontend**
```bash
cd frontend
npm install
npm start              # starts on port 3000
```

**AI Model Service**
```bash
cd backend/models
pip install -r requirements.txt
python flask_api.py    # starts on port 5000
```

**Mobile App**
```bash
cd mobile
flutter pub get
flutter run            # connect a device or emulator first
```

---

## Environment Variables

Create `backend/.env`:

```env
MONGO_URI=mongodb://localhost:27017/dentalcare
JWT_SECRET=your_secret_key_here
PORT=4000
FLASK_API_URL=http://localhost:5000
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
```

Root `.env` (for Docker Compose + Selenium tests):

```env
JWT_SECRET=your_secret_key_here
DOCTOR_EMAIL=doctor@test.com
DOCTOR_PASSWORD=password123
ADMIN_EMAIL=admin@dentalcare.com
ADMIN_PASSWORD=admin123
```

---

## Seed Data

After the backend is running, seed the database with sample data:

```bash
# Seed clinic inventory (supplies, medicines, equipment)
node backend/seedInventory.js

# Seed reports data (bills + appointments for analytics charts)
# Requires at least one doctor and one patient to exist first
node backend/seedReportsData.js

# Seed hospitals
node backend/seedHospitals.js

# Create admin account
node backend/createAdmin.js
```

With Docker:
```bash
docker exec -it dentalcare-backend node seedInventory.js
docker exec -it dentalcare-backend node seedHospitals.js
docker exec -it dentalcare-backend node createAdmin.js
```

---

## API Overview

Base URL: `http://localhost:4000`

| Resource | Method | Endpoint |
|---|---|---|
| Auth (Patient) | POST | `/api/auth/register`, `/api/auth/login`, `/api/auth/verify-otp` |
| Auth (Doctor) | POST | `/api/auth/doctor/login` |
| Admin | POST/GET/PUT/DELETE | `/api/admins/login`, `/api/admins/doctors`, `/api/admins/patients`, `/api/admins/appointments` |
| Admin Dashboard | GET | `/api/admins/dashboard/stats`, `/api/admins/activity` |
| Doctors | GET/PUT | `/api/doctors/all`, `/api/doctors/profile/:id`, `/api/doctors/:id/services`, `/api/doctors/:id/availability` |
| Patients | GET/PUT | `/api/patients/doctor/:id`, `/api/patients/:id` |
| Appointments | GET/POST/PUT | `/api/appointments`, `/api/appointments/doctor/:id`, `/api/appointments/patient/:id` |
| AI Scan | POST | `/api/ai-scan/upload` |
| Scan Q&A | GET/POST | `/api/scan-qa` |
| Messages | GET/POST | `/api/messages/doctor/:id`, `/api/messages/patient/:id` |
| Notifications | GET/PUT | `/api/notifications` |
| Wallet | GET/POST | `/api/wallet` |
| Bills | GET/POST | `/api/bills`, `/api/bills/doctor/stats` |
| Inventory | GET/POST/PUT/DELETE | `/api/inventory/all`, `/api/inventory/add`, `/api/inventory/update/:id`, `/api/inventory/:id` |
| Prescriptions | GET/POST | `/api/prescriptions` |
| Reports (Analytics) | GET | `/api/reports/revenue`, `/api/reports/patients`, `/api/reports/appointments` |
| Hospitals | GET | `/api/hospitals`, `/api/hospitals/nearby` |
| Reviews | GET/POST | `/api/reviews` |
| Services | GET/POST | `/api/services`, `/api/services/categories` |
| Availability | GET/POST | `/api/availability/:doctorId` |

Real-time events are handled via **Socket.io** on the same port (4000):
- `new_message` — incoming chat message
- `notification` — appointment updates, system alerts
- `appointment_update` — status changes

---

## Testing

**Backend unit & integration tests (Jest)**
```bash
cd backend
npm test
```

**Frontend unit tests (Jest + React Testing Library)**
```bash
cd frontend
npm test -- --watchAll=false
```

**Flutter unit & widget tests**
```bash
cd mobile
flutter test
```

**Selenium E2E tests (pytest + Selenium WebDriver)**
```bash
# Start the app first, then:
cd tests
pip install -r requirements.txt
pytest test_cases/ -v --html=reports/report.html

# Or with Docker (runs against live containers):
docker-compose --profile testing up
```

Test reports are generated in `tests/reports/` as HTML files.

---

## CI/CD

GitHub Actions pipeline (`.github/workflows/ci.yml`) runs on every push to `main`:

| Job | Steps |
|---|---|
| Backend | Install deps → verify server starts → run Jest tests |
| Frontend | Install deps → production build (`npm run build`) |
| Docker | Build all three images (backend, frontend, ai-model) |
| Mobile | Setup Flutter → `flutter pub get` → `flutter analyze` |

---

## Project Structure

```
backend/
├── src/
│   ├── controllers/     # Route handlers (auth, appointments, bills, inventory, reports...)
│   ├── models/          # Mongoose schemas (Doctor, Patient, Appointment, Bill, Inventory...)
│   ├── routes/          # Express routers
│   ├── middleware/       # JWT auth middleware
│   ├── services/        # Notification service, email service
│   └── utils/           # Email templates
├── models/              # Python AI service
│   ├── flask_api.py     # Flask REST API
│   ├── inference.py     # PyTorch CNN inference
│   └── model_weights.pth
├── tests/               # Jest integration tests
├── seedInventory.js     # Seed clinic inventory data
├── seedReportsData.js   # Seed bills + appointments for analytics
├── seedHospitals.js     # Seed hospital data
└── createAdmin.js       # Create initial admin account

frontend/
└── src/
    ├── pages/
    │   ├── admin/       # AdminDashboard, AdminDoctors, AdminPatients,
    │   │                #   AdminAppointments, AdminHospitals, AdminInventory,
    │   │                #   AdminReports, AdminActivity, AdminRegisterDoctor
    │   ├── doctor/      # DoctorDashboard, DoctorAppointments, DoctorPatients,
    │   │                #   DoctorMessages, DoctorReports, DoctorProfile,
    │   │                #   DoctorServices, DoctorAvailability, DoctorInventory,
    │   │                #   DoctorScanQA, DoctorReviews, DoctorSettings
    │   ├── patient/     # Dashboard, Appointments, Bills, Wallet, Messages,
    │   │                #   Reports, ScanQA, Health, NearbyHospitals
    │   └── public/      # Home (landing page), NotFound
    ├── components/      # DoctorSidebar, AdminSidebar, NotificationBell, PatientLayout
    ├── contexts/        # NotificationContext (Socket.io)
    ├── styles/          # Per-page CSS modules
    └── utils/           # helpers.js, constants.js

mobile/
└── lib/
    ├── presentation/
    │   └── screens/     # Appointments (book + list), Messages, Reports,
    │                    #   Dentists (nearby), Onboarding, Home
    ├── features/        # Bills screen, Payment screen
    ├── data/
    │   ├── repositories/        # UserRepository, AppointmentRepository
    │   └── data_sources/remote/ # DentalRemoteDataSource (all API calls)
    ├── domain/
    │   ├── entities/    # AppointmentEntity, UserEntity
    │   └── use_cases/   # BookAppointmentUseCase, GetAppointmentsUseCase
    ├── core/
    │   ├── services/    # SocketService (real-time)
    │   ├── themes/      # AppColors, TextStyles
    │   └── utils/       # Validators, Helpers
    └── config/          # AppConfig (base URL), Routes

tests/
├── test_cases/          # Selenium test cases (admin, doctor, patient, public pages)
├── pages/               # Page Object Models (DoctorDashboard, DoctorLogin, Base)
├── reports/             # Generated HTML test reports
└── conftest.py          # pytest fixtures and setup
```

---

## Default Credentials (after seeding)

| Role | Email | Password |
|---|---|---|
| Admin | admin@dentalcare.com | admin123 |
| Doctor | (registered via admin panel) | (set during registration) |
| Patient | (registered via mobile app) | (set during registration) |

---

## License

ISC

---

---

# User Manual

> This section covers how to use DentalCare+ as a Patient, Doctor, or Admin.

---

## Table of Contents

1. [Patient — Mobile App](#1-patient--mobile-app)
   - [Getting Started](#11-getting-started)
   - [Booking an Appointment](#12-booking-an-appointment)
   - [AI Teeth Scan](#13-ai-teeth-scan)
   - [Messaging Your Doctor](#14-messaging-your-doctor)
   - [Bills & Wallet](#15-bills--wallet)
   - [Finding Nearby Dentists & Hospitals](#16-finding-nearby-dentists--hospitals)
   - [Scan Reports](#17-scan-reports)
2. [Doctor — Web Portal](#2-doctor--web-portal)
   - [Logging In](#21-logging-in)
   - [Dashboard](#22-dashboard)
   - [Managing Appointments](#23-managing-appointments)
   - [Patient Records](#24-patient-records)
   - [Setting Availability](#25-setting-availability)
   - [Managing Services](#26-managing-services)
   - [Messaging Patients](#27-messaging-patients)
   - [Scan Q&A](#28-scan-qa)
   - [Clinic Inventory](#29-clinic-inventory)
   - [Reports & Prescriptions](#210-reports--prescriptions)
   - [Profile & Settings](#211-profile--settings)
3. [Admin — Web Portal](#3-admin--web-portal)
   - [Logging In](#31-logging-in)
   - [Dashboard](#32-dashboard)
   - [Managing Doctors](#33-managing-doctors)
   - [Managing Patients](#34-managing-patients)
   - [Managing Appointments](#35-managing-appointments)
   - [Managing Hospitals](#36-managing-hospitals)
   - [Inventory Management](#37-inventory-management)
   - [System Analytics (Reports)](#38-system-analytics-reports)
   - [Activity Log](#39-activity-log)

---

## 1. Patient — Mobile App

### 1.1 Getting Started

**Register**
1. Open the DentalCare+ mobile app.
2. Tap **Get Started** on the onboarding screen.
3. Fill in your name, email, phone number, and password.
4. Tap **Register** — a 6-digit OTP will be sent to your email.
5. Enter the OTP to verify your account.
6. You are now logged in and taken to the Home dashboard.

**Login**
1. Open the app and tap **Login**.
2. Enter your registered email and password.
3. Tap **Login** to access your dashboard.

---

### 1.2 Booking an Appointment

1. From the Home screen, tap **Book Appointment** or go to the **Appointments** tab.
2. The booking wizard has 5 steps:

   **Step 1 — Condition**
   Select your dental condition(s) from the list (e.g., Toothache, Gum Disease, Cavity). You can select multiple. This is optional but helps the doctor prepare.

   **Step 2 — Service**
   Choose the type of dental service you need (e.g., Teeth Cleaning, Root Canal, Teeth Whitening). Services are grouped by category. Use the category filter to narrow down.

   **Step 3 — Doctor**
   A list of available doctors for your selected service is shown. Tap a doctor card to select them. The number of available doctors is shown at the top.

   **Step 4 — Date & Time**
   Tap **Select Date** to open the calendar. Only dates when the doctor has set availability are selectable. After choosing a date, select an available time slot from the dropdown.

   **Step 5 — Confirm**
   Review your appointment summary (service, doctor, hospital, date, time, conditions, notes). If you have an AI scan report, you can choose to attach it. Tap **Confirm Booking**.

3. A confirmation dialog appears — tap **Confirm**.
4. On success, a bill is automatically generated. Tap **View Bill** to see it.

---

### 1.3 AI Teeth Scan

1. Go to the **Scan** section from the bottom navigation.
2. Tap **Upload Photo** or use the camera to take a photo of your teeth.
3. The AI model analyses the image and returns:
   - Detected dental conditions (e.g., Gingivitis, Caries, Hypodontia)
   - Severity level for each condition
   - Whether oral cancer indicators are present (shown as a warning)
4. Tap **Save Report** to store the scan result.
5. When booking an appointment, you can attach this scan report so the doctor sees it before your visit.

**Scan Q&A**
After a scan, you can ask questions about your results. Go to **Scan Q&A**, type your question, and a doctor will respond.

---

### 1.4 Messaging Your Doctor

1. Go to the **Messages** tab.
2. Your active conversations with doctors are listed.
3. Tap a conversation to open the chat.
4. Type your message and tap **Send**.
5. Messages are delivered in real-time. You will receive a notification when the doctor replies.

---

### 1.5 Bills & Wallet

**View Bills**
1. Go to **My Bills** from the Home screen or bottom navigation.
2. All your bills are listed with status (Pending / Paid / Overdue).
3. Tap a bill to see the full breakdown (service, amount, tax, discount, total).
4. Tap **Download PDF** to save or share the bill.

**Wallet**
1. Go to **Wallet** from the Home screen.
2. Your current wallet balance is shown.
3. Tap **Top Up** to add funds — enter the amount and confirm.
4. Use your wallet balance to pay pending bills.

---

### 1.6 Finding Nearby Dentists & Hospitals

1. Go to **Find Dentists** or **Nearby Hospitals** from the Home screen.
2. The map shows your current location with nearby clinics and hospitals marked.
3. Tap a marker to see the name, address, and contact details.
4. Tap **Book Appointment** on a doctor card to go directly to the booking wizard with that doctor pre-selected.

---

### 1.7 Scan Reports

1. Go to **My Reports** from the Home screen.
2. All your saved scan reports are listed with date and detected conditions.
3. Tap a report to view the full details.
4. Tap **View PDF** to open the report as a PDF document.

---

## 2. Doctor — Web Portal

Access the Doctor portal at: `http://localhost:3000/doctor-login`

### 2.1 Logging In

1. Go to the Doctor login page.
2. Enter your email and password (provided by the admin when your account was created).
3. Click **Login**.
4. You are taken to the Doctor Dashboard.

---

### 2.2 Dashboard

The dashboard shows:
- **Stats cards** — Total Patients, Total Appointments, Consultations Today, Unread Messages
- **Quick Actions** — shortcuts to Appointments, Patients, Messages, Reports
- **This Month** — Completed appointments, New patients, Pending appointments
- **Recent Messages** — Latest patient conversations
- **Upcoming Appointments** — Next scheduled appointments with patient name, date, time, and status

From the dashboard you can **Confirm** a pending appointment directly by clicking the green Confirm button next to it.

---

### 2.3 Managing Appointments

1. Click **Appointments** in the sidebar.
2. All appointments are listed with patient name, date, time, service, and status.
3. **Filter** by status (Pending, Confirmed, Completed, Cancelled) or search by patient name.
4. Click an appointment to expand details.
5. Use the action buttons to:
   - **Confirm** a pending appointment
   - **Complete** a confirmed appointment after the visit
   - **Cancel** if needed
   - **Reschedule** — change the date/time

---

### 2.4 Patient Records

1. Click **Patients** in the sidebar.
2. All patients assigned to you are listed.
3. Click a patient to view their profile — personal details, medical history, past appointments, diagnoses, and doctor notes.
4. Add or update **Doctor Notes** and **Diagnosis** directly from the patient profile.

---

### 2.5 Setting Availability

1. Click **Availability** in the sidebar.
2. Select a day of the week.
3. Add time slots by clicking **Add Slot** — choose start and end time.
4. Click **Save** to publish your availability.
5. Patients will only be able to book appointments on the dates and times you have set here.

---

### 2.6 Managing Services

1. Click **Services** in the sidebar.
2. **My Services** panel (left) — shows services you currently offer.
   - Click the **×** next to a service to remove it.
   - Click **Save Changes** to update.
3. **Service Catalogue** panel (right) — browse all available services grouped by category.
   - Click **Add** to add a service to your list.
   - Use the search bar to find specific services.
4. To create a new service not in the catalogue, click **New** and fill in the name, category, duration, and description.

---

### 2.7 Messaging Patients

1. Click **Messages** in the sidebar.
2. All patient conversations are listed with the last message and unread count.
3. Click a conversation to open the chat window.
4. Type your message and press **Enter** or click **Send**.
5. Messages are delivered in real-time via Socket.io.
6. The notification bell (top right) shows unread message counts.

---

### 2.8 Scan Q&A

1. Click **Scan Q&A** in the sidebar.
2. Patient questions about their scan results are listed.
3. Click a question to view the scan details and the patient's question.
4. Type your answer and click **Submit Answer**.
5. The patient will see your response in their app.

---

### 2.9 Clinic Inventory

1. Click **Inventory** in the sidebar.
2. View all clinic supplies, medicines, and equipment with current stock levels.
3. Items with stock at or below the minimum threshold are highlighted in red with a **Low Stock** badge.
4. Use the **Search** bar to find items by name, category, or location.
5. Use the **Category** filter to view only Medicines, Supplies, Equipment, or Other.

> Note: Doctors have read-only access to inventory. Stock updates are managed by the Admin.

---

### 2.10 Reports & Prescriptions

**Reports**
1. Click **Reports** in the sidebar.
2. Upload scan reports or treatment summaries for patients.
3. Reports are linked to the patient's record and visible in their mobile app.

**Prescriptions**
- Prescriptions can be created and attached to appointments.
- Patients can view their prescriptions from the mobile app.

---

### 2.11 Profile & Settings

**Profile**
1. Click **Profile** in the sidebar.
2. Update your name, phone, hospital, specialization, qualifications, experience, and profile photo.
3. Click **Save Changes**.

**Settings**
1. Click **Settings** in the sidebar.
2. Change your password — enter current password, new password, and confirm.
3. Update notification preferences.

**Reviews**
1. Click **Reviews** in the sidebar.
2. View all patient reviews and ratings for your profile.
3. Average rating is shown at the top.

---

## 3. Admin — Web Portal

Access the Admin portal at: `http://localhost:3000/admin-login`

Default credentials: `admin@dentalcare.com` / `admin123`

### 3.1 Logging In

1. Go to the Admin login page.
2. Enter the admin email and password.
3. Click **Login**.
4. You are taken to the Admin Dashboard.

---

### 3.2 Dashboard

The dashboard shows live system stats:
- Total Doctors registered
- Total Appointments in the system
- New Registrations this month
- System Activity status

The **Recent Doctors** list shows the latest registered doctors. Click **View All** to go to the Doctors management page.

---

### 3.3 Managing Doctors

1. Click **Doctors** in the sidebar.
2. All registered doctors are shown as cards with name, specialization, email, phone, hospital, and experience.
3. **Search** by name, email, specialization, or hospital.
4. **Filter** by specialization using the dropdown.
5. Click **Refresh** to reload the list.

**Register a New Doctor**
1. Click **Register Doctor** in the sidebar (or navigate to `/admin/register-doctor`).
2. Fill in all required fields: Full Name, Email, Phone, Password, License Number, Specialization, Hospital, Experience, Qualifications.
3. Click **Register Doctor**.
4. The doctor can now log in using the provided email and password.

**Edit a Doctor**
1. Click the **Edit** button on a doctor card.
2. Update any fields in the modal.
3. Click **Save Changes**.

**Delete a Doctor**
1. Click the **Delete** button on a doctor card.
2. Confirm the deletion in the dialog.
3. All appointments associated with the doctor are also removed.

---

### 3.4 Managing Patients

1. Click **Patients** in the sidebar.
2. All registered patients are listed with name, email, phone, age, gender, and status.
3. Search and filter patients by name or status.
4. Click a patient to view their full profile.

---

### 3.5 Managing Appointments

1. Click **Appointments** in the sidebar.
2. All appointments across all doctors are listed.
3. Filter by status, doctor, or date range.
4. View patient and doctor details for each appointment.

---

### 3.6 Managing Hospitals

1. Click **Hospitals** in the sidebar.
2. All hospitals are listed with name, address, phone, and coordinates.
3. Click **Add Hospital** to register a new hospital — fill in name, address, phone, latitude, and longitude.
4. Edit or delete existing hospitals using the action buttons.
5. Hospitals appear on the patient's nearby map in the mobile app.

---

### 3.7 Inventory Management

1. Click **Inventory** in the sidebar.
2. All clinic inventory items are listed in a table with name, category, stock level, location, and status.

**Add a New Item**
1. Click **Add New Item** (top right).
2. Fill in: Item Name, Category (Supplies / Equipment / Medicine / Other), Quantity, Unit, Minimum Threshold, Supplier, Location.
3. Click **Confirm and Add**.

**Update Stock**
- Click **+** to add 1 unit to an item's stock.
- Click **−** to subtract 1 unit.

**Low Stock Alerts**
- Items at or below the minimum threshold show a red **Low Stock** badge.
- The stats card at the top shows the total count of low-stock items.

**Delete an Item**
1. Click the trash icon on the item row.
2. Confirm deletion in the dialog.

---

### 3.8 System Analytics (Reports)

1. Click **Reports** in the sidebar.
2. The page shows:

   **Summary Cards**
   - Total Revenue (from paid bills)
   - Active Patients (total registered)
   - Total Appointments (with completed-this-month count)

   **Charts**
   - **Revenue Growth** — line chart of monthly revenue over the last 12 months
   - **Patient Registrations** — bar chart of new patient signups per month
   - **Appointment Status** — donut chart showing breakdown by status (pending, confirmed, completed, cancelled)
   - **Popular Services** — horizontal bar chart of most-booked services

   **Doctor Performance Table**
   - Lists each doctor with their total revenue generated and a visual performance bar.

3. Use **Filter** to adjust the date range (coming soon).
4. Use **Export** to download the report data.

---

### 3.9 Activity Log

1. Click **Activity** in the sidebar.
2. View recent system events — doctor registrations, appointment activity, system stats.
3. Shows:
   - Recent doctor registrations with date
   - Appointments by status breakdown
   - Doctors grouped by specialization
   - System uptime and active sessions today
