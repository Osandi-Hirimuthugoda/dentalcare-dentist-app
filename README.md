# DentalCare+ — Dentists App

[![CI/CD Pipeline](https://github.com/Osandi-Hirimuthugoda/dentalcare-dentist-app/actions/workflows/ci.yml/badge.svg)](https://github.com/Osandi-Hirimuthugoda/dentalcare-dentist-app/actions/workflows/ci.yml)

Full-stack dental care platform: **Backend API**, **AI teeth-scan model**, **React web app** (doctors & admin), and **Flutter mobile app** (patients). Includes real-time messaging, appointments, billing, and AI-powered dental disease detection.

---

## How to run this project

You can run everything with **Docker** (easiest) or run each part **locally**.

### Option A — Run with Docker (recommended)

**Prerequisites:** Docker and Docker Compose. Optional: put `model_weights.pth` in `backend/models/` for AI teeth scan.

```bash
# From project root (dentists-app/)
cp .env.example .env
# Edit .env and set JWT_SECRET=your-secret-key

docker-compose up -d
```

Then open:

- **Web app:** http://localhost:3000  
- **API:** http://localhost:4000  

To run the **mobile app**, use Flutter on your machine and point it to `http://localhost:4000` (or `http://10.0.2.2:4000` on Android emulator). See **Option B — Step 4 (Mobile)** below.

---

### Option B — Run locally (without Docker)

**Prerequisites:** Node.js 18+, MongoDB, Python 3.10+ (for AI), Flutter (for mobile).

1. **MongoDB**  
   Install and start MongoDB (e.g. local on `mongodb://localhost:27017` or use MongoDB Atlas).

2. **Backend**  
   ```bash
   cd backend
   npm install
   ```  
   Create `backend/.env`:
   ```env
   MONGO_URI=mongodb://localhost:27017/dentalcare
   JWT_SECRET=your-secret-key
   PORT=4000
   ```
   ```bash
   npm run dev
   ```  
   Optional: `npm run create-admin` and `npm run seed-services`.

3. **AI model (optional, for teeth scan)**  
   ```bash
   cd backend/models
   python -m venv venv
   venv\Scripts\activate   # Windows
   # source venv/bin/activate   # macOS/Linux
   pip install -r requirements.txt
   ```  
   Put `model_weights.pth` in `backend/models/`, then:
   ```bash
   python flask_api.py
   ```
   Backend uses `FLASK_API_URL=http://localhost:5000` by default.

4. **Frontend**  
   ```bash
   cd frontend
   npm install
   npm start
   ```  
   Opens at http://localhost:3000 (proxies API to http://localhost:4000).

5. **Mobile app**  
   ```bash
   cd mobile
   flutter pub get
   flutter run
   ```  
   Set the app’s API base URL to your backend (e.g. `http://localhost:4000` or `http://10.0.2.2:4000` for Android emulator).

---

## Project Structure

```
dentists-app/
├── backend/                 # Node.js + Express API
│   ├── server.js            # Entry, Socket.io, routes
│   ├── src/
│   │   ├── config/          # DB (MongoDB)
│   │   ├── controllers/    # Auth, doctors, appointments, AI scan, scan Q&A, etc.
│   │   ├── models/          # Mongoose schemas
│   │   └── routes/          # API routes
│   └── models/              # AI service (Python)
│       ├── flask_api.py     # Flask REST API for predictions
│       ├── inference.py     # PyTorch inference (EfficientNet-B3)
│       ├── requirements.txt
│       └── model_weights.pth # Trained weights (add separately)
├── frontend/                # React web app
│   └── src/
│       ├── App.js           # Routes (public, doctor, admin, patient)
│       ├── pages/           # admin, doctor, patient, public
│       ├── components/     # Layout, common
│       └── contexts/       # Notifications
├── mobile/                  # Flutter app (patient-facing)
│   └── lib/
│       ├── config/          # Routes
│       ├── core/             # Theme, constants, errors
│       ├── data/             # Repositories, data sources, models
│       ├── domain/           # Entities, use cases, repositories
│       ├── features/         # Bills, payment
│       ├── presentation/    # Screens, widgets, BLoC
│       └── main_image_prediction.dart
└── README.md
```

---

## Technology Stack

| Layer | Technologies |
|-------|--------------|
| **Backend** | Node.js, Express.js, MongoDB (Mongoose), JWT (jsonwebtoken), bcryptjs, Socket.io, Multer, CORS, dotenv, uuid |
| **Frontend** | React 19, React Router DOM 7, Tailwind CSS 4, Framer Motion, Axios, Recharts, Lucide React, React Toastify, Socket.io client, @react-google-maps/api |
| **Mobile** | Flutter (Dart 3.7+), BLoC, Get It, Google Maps Flutter, Geolocator, Geocoding, HTTP, Shared Preferences, Image Picker, URL Launcher, Intl |
| **AI/ML** | Python 3.10+, Flask, Flask-CORS, PyTorch, Torchvision, Pillow, NumPy; EfficientNet-B3, circular-mask preprocessing |

---

## Backend Features & API

- **Auth** — Register, login, JWT; roles: patient, doctor, admin.  
  Routes: `POST /api/auth/register`, `POST /api/auth/login`, etc.

- **Doctors** — List/search doctors, profile.  
  `GET /api/doctors`, etc.

- **Appointments** — Create, list, update, cancel, reschedule.  
  `GET/POST /api/appointments`, etc.

- **Services** — List services (seed via `npm run seed-services`).  
  `GET /api/services`

- **Patients** — CRUD for doctors/admins.  
  `GET/POST /api/patients`, etc.

- **Messages** — Chat between doctors and patients; real-time via Socket.io (join by `userId`, `userType`).  
  `GET/POST /api/messages`

- **Availability** — Doctor availability slots.  
  `GET/POST /api/availability`

- **Bills** — Create, list, update status (e.g. paid).  
  `GET/POST /api/bills`

- **Reviews** — Doctor reviews and ratings.  
  `GET/POST /api/reviews`

- **Notifications** — List, mark read; server can emit via `global.io`.  
  `GET/POST /api/notifications`

- **Hospitals** — Hospital management and search.  
  `GET/POST /api/hospitals`

- **Health** — Health tips, scores, activities.  
  `GET/POST /api/health`

- **Wallet** — Balance, top-up, payments.  
  `GET/POST /api/wallet`

- **AI Scan** — Upload teeth image; backend forwards to Python model and returns prediction.  
  `POST /api/ai-scan/teeth-scan` (multipart image, max 5MB)

- **Scan Q&A** — After a scan, create a Q&A session; patient asks, dentist answers; mark results shown / complete.  
  - Patient: `POST /api/scan-qa/create`, `GET /api/scan-qa/patient/:scanId`, `POST /api/scan-qa/:scanId/answer/:questionId`, `POST /api/scan-qa/:scanId/mark-shown`  
  - Dentist: `GET /api/scan-qa/pending`, `GET /api/scan-qa/dentist/:scanId`, `POST /api/scan-qa/:scanId/question`, `POST /api/scan-qa/:scanId/complete`

- **Admins** — Admin-only routes (dashboard, register doctor, etc.).  
  `GET/POST /api/admins`, etc.

---

## AI Model (Teeth Scan)

- **Purpose:** Classify dental disease from a single teeth image.
- **Location:** `backend/models/`
- **Stack:** Flask, PyTorch, Torchvision, Pillow, NumPy.
- **Model:** EfficientNet-B3, fine-tuned; preprocessing: circular mask (match training), resize 256, center crop 224, ImageNet normalization.
- **Classes (default):** `calculus`, `cancers`, `gingivitis`, `ulcers`, `olp`.
- **Weights:** `model_weights.pth` (and optional `class_labels.json`) in `backend/models/`. Not in repo; add after training/export.
- **Flask API:**
  - `GET /health` — Status, model loaded or not, device.
  - `POST /predict` — Input: multipart `file` or JSON `image` (base64). Output: `prediction`, `disease_name`, `confidence`, `class_index`, `all_probabilities`.
- **Backend integration:** Backend calls this service (URL configurable) from `aiScanController` and returns result to client; mobile/frontend use `/api/ai-scan/teeth-scan`.

---

## Frontend Features (React Web)

- **Public**
  - Home, Health, My Bills, Nearby Hospitals, Nearby Doctors (with map where used).
  - Doctor Login, Doctor Register, Admin Login.

- **Doctor portal** (protected)
  - Dashboard, Patients, Appointments, Reports, Messages (with real-time), Profile, Settings, Availability, **Scan Q&A** (answer patient scan questions), Services, Reviews.

- **Admin portal** (protected)
  - Admin Dashboard, Register Doctor, Doctors list, Appointments, Activity, Patients, Hospitals.

- **Patient-facing pages** (used from web)
  - Health, My Bills, Nearby Hospitals, Nearby Doctors, Appointments (if routed).

- **Tech:** Tailwind, Framer Motion, Recharts, Socket.io for notifications, Axios, React Router. Proxy to backend: `http://localhost:4000`.

---

## Mobile App Features (Flutter)

- **Auth:** Login, Register, Verify Email, Forgot Password (if implemented).
- **Home:** Dashboard with stats (upcoming appointments, total appointments, pending bills, health score), quick actions, health tips carousel, announcements, emergency contact.
- **Appointments:** List, book, reschedule, cancel (use cases + BLoC).
- **Teeth Scan (AI):** Capture/upload image, send to backend `/api/ai-scan/teeth-scan`, show result; link to Scan Q&A (view/add questions/answers).
- **Treatments:** My treatments screen.
- **Bills:** My bills, payment methods; card payment screen.
- **Doctors & Hospitals:** Find dentists, search hospitals, nearby hospitals (list + map), nearby doctors; Google Maps, Geolocator, Geocoding.
- **Health:** Health screen (tips, score, activities).
- **Profile & Settings:** Profile screen, settings screen.
- **Notifications:** Notifications screen, unread count on home.
- **State:** BLoC; DI with Get It; remote data source (DentalRemoteDataSource), local (SharedPreferences).

---

## Prerequisites

- **Node.js** v18+
- **MongoDB** (local or Atlas)
- **Python** 3.10+ (for AI service in `backend/models`)
- **Flutter** SDK (for mobile)

---

## Setup & Run

### 1. Backend

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
MONGO_URI=mongodb://localhost:27017/dentalcare
JWT_SECRET=your-secret-key
PORT=4000
```

Optional: `ALLOW_DB_FAILURE=true` to run without DB (e.g. only AI scan).

```bash
npm run dev
```

- Create admin: `npm run create-admin`
- Seed services: `npm run seed-services`

### 2. AI Model Service

```bash
cd backend/models
python -m venv venv
venv\Scripts\activate   # Windows
pip install -r requirements.txt
```

Place `model_weights.pth` (and optionally `class_labels.json`) in `backend/models/`. Then run the Flask app (e.g. `python flask_api.py`). Ensure backend is configured to call this service URL for `/api/ai-scan/teeth-scan`.

### 3. Frontend

```bash
cd frontend
npm install
npm start
```

Uses proxy to `http://localhost:4000`.

### 4. Mobile

```bash
cd mobile
flutter pub get
flutter run
```

Point app base URL to your backend (e.g. `http://10.0.2.2:4000` for Android emulator).

---

## Docker Setup

Run the whole stack (MongoDB, Backend, AI Model, Frontend) with Docker Compose.

### Prerequisites

- Docker and Docker Compose installed
- `model_weights.pth` in `backend/models/` (for AI predictions; optional — service starts without it but predictions will fail)

### Quick start

```bash
# From project root (dentists-app/)
cp .env.example .env
# Edit .env and set JWT_SECRET

docker-compose up -d
```

- **Frontend:** http://localhost:3000  
- **Backend API:** http://localhost:4000  
- **MongoDB:** localhost:27017 (internal; use from host if needed)

### Services

| Service    | Image build context      | Port  | Description                |
|-----------|---------------------------|-------|----------------------------|
| `mongodb` | `mongo:7`                 | 27017 | MongoDB database          |
| `ai-model`| `backend/models/Dockerfile` | 5000  | Flask + PyTorch teeth scan |
| `backend` | `backend/Dockerfile`      | 4000  | Node.js Express API        |
| `frontend`| `frontend/Dockerfile`     | 3000→80 | React app (nginx)        |

### Commands

```bash
# Build and start all
docker-compose up -d

# Rebuild after code changes
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop all
docker-compose down

# Stop and remove volumes (clears DB data)
docker-compose down -v
```

### Build only (no compose)

```bash
# Backend
docker build -t dentalcare-backend ./backend

# AI model (from backend/models; place model_weights.pth there first)
docker build -t dentalcare-ai ./backend/models

# Frontend
docker build -t dentalcare-frontend --build-arg REACT_APP_API_URL=http://localhost:4000 ./frontend
```

### Notes

- Backend connects to MongoDB at `mongodb://mongodb:27017/dentalcare` and to the AI service at `http://ai-model:5000`.
- For production, set `JWT_SECRET` in `.env` and use stronger MongoDB credentials (e.g. custom image or init scripts).
- Mobile app is not containerized; run with Flutter locally and point API URL to `http://localhost:4000` (or your host IP).

---

## CI/CD Pipeline (GitHub Actions)

A GitHub Actions workflow runs on every **push** and **pull request** to `main` / `master`.

**Location:** `.github/workflows/ci.yml`

**Jobs:**

| Job       | What it does |
|-----------|----------------|
| **Backend**  | `npm ci` / `npm install`, then verifies the server can start (with `ALLOW_DB_FAILURE=true`, no MongoDB in CI). |
| **Frontend** | `npm ci` / `npm install`, `npm run build`, `npm test` (Jest). |
| **Docker**   | Builds the three images (backend, frontend, ai-model) to ensure Dockerfiles work. No push to a registry. |

**To see results:** GitHub repo → **Actions** tab. Fix any failing job before merging.

To add **deploy** (e.g. push images to Docker Hub or deploy frontend to GitHub Pages), add a new workflow under `.github/workflows/` that triggers on push to `main` and uses the needed secrets (e.g. `DOCKERHUB_TOKEN`, `GH_PAGES_TOKEN`).

---

## Environment Variables (Backend)

| Variable | Description |
|----------|-------------|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for JWT signing |
| `PORT` | API port (default 4000) |
| `ALLOW_DB_FAILURE` | Set `true` to run without DB (dev only); AI scan can still work |

---

## License

Private / ISC (see `backend/package.json`).
