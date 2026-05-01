# DentalCare+

A full-stack dental care platform with AI-powered teeth scan analysis. The system connects patients with dentists, supports appointment booking, real-time messaging, billing, and automated dental disease detection using a deep learning model.

---

## Architecture

The project is split into four main components:

```
dentists-app/
├── backend/          # Node.js REST API + Socket.io
│   └── models/       # Python Flask AI service (PyTorch CNN)
├── frontend/         # React web app (Doctor & Admin portals)
├── mobile/           # Flutter mobile app (Patient portal)
└── tests/            # Selenium E2E test suite
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend API | Node.js, Express, MongoDB, Socket.io |
| AI Service | Python, Flask, PyTorch (CNN v3) |
| Web Frontend | React 19, React Router, Recharts, Tailwind CSS |
| Mobile App | Flutter 3, BLoC, GetIt, Google Maps |
| Database | MongoDB (Mongoose ODM) |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| Email | Nodemailer |
| Testing | Jest, Supertest, Selenium, pytest |
| CI/CD | GitHub Actions |
| Deployment | Docker, Docker Compose |

---

## Features

### Patient (Mobile App)
- Register, login, email verification
- Book appointments with dentists
- AI teeth scan — upload a photo, get instant dental disease detection
- View scan reports and treatment history
- Real-time messaging with doctors
- Wallet top-up and bill payments
- Find nearby hospitals and dentists (Google Maps)
- Emergency help screen
- Dark mode / Eye comfort mode

### Doctor (Web Portal)
- Dashboard with appointment stats and charts
- Manage appointments and patient records
- Set availability schedules
- Upload scan reports and prescriptions
- Real-time patient messaging
- Manage services and reviews
- Profile and settings management

### Admin (Web Portal)
- System dashboard with analytics
- Register and manage doctors
- Manage patients, appointments, hospitals
- Inventory and reports management
- Activity log

### AI Disease Detection
- PyTorch CNN model trained on dental X-ray/photo data
- Detects conditions: gingivitis, caries, hypodontia, and more
- REST API via Flask (`/predict`, `/health`, `/classes`)
- Accepts image file upload or base64 encoded image

---

## Getting Started

### Prerequisites
- Node.js 20+
- Python 3.10+
- Flutter 3.29+
- MongoDB 7+ (or Docker)
- Docker & Docker Compose (optional)

### Run with Docker (recommended)

```bash
# Copy and configure environment
cp .env.example .env

# Start all services
docker-compose up -d
```

Services will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- AI Model API: http://localhost:5000
- MongoDB: localhost:27017

### Run locally

**Backend**
```bash
cd backend
npm install
cp .env.example .env   # fill in MONGO_URI, JWT_SECRET
npm run dev
```

**Frontend**
```bash
cd frontend
npm install
npm start
```

**AI Model Service**
```bash
cd backend/models
pip install -r requirements.txt
python flask_api.py
```

**Mobile App**
```bash
cd mobile
flutter pub get
flutter run
```

---

## Environment Variables

Create `backend/.env` based on `.env.example`:

```env
MONGO_URI=mongodb://localhost:27017/dentalcare
JWT_SECRET=your_secret_key
PORT=4000
FLASK_API_URL=http://localhost:5000
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

---

## API Overview

Base URL: `http://localhost:4000`

| Resource | Endpoints |
|---|---|
| Auth | `POST /api/auth/login`, `POST /api/auth/register` |
| Appointments | `GET/POST/PUT /api/appointments` |
| Doctors | `GET/PUT /api/doctors` |
| Patients | `GET/PUT /api/patients` |
| AI Scan | `POST /api/ai-scan/upload` |
| Scan QA | `GET/POST /api/scan-qa` |
| Messages | `GET/POST /api/messages` |
| Notifications | `GET /api/notifications` |
| Wallet | `GET/POST /api/wallet` |
| Bills | `GET /api/bills` |
| Inventory | `GET/POST/PUT/DELETE /api/inventory` |
| Prescriptions | `GET/POST /api/prescriptions` |
| Reports | `GET/POST /api/reports` |
| Hospitals | `GET /api/hospitals` |
| Reviews | `GET/POST /api/reviews` |

Real-time events are handled via Socket.io on the same port.

---

## Testing

**Backend unit & integration tests**
```bash
cd backend
npm test
```

**Frontend unit tests**
```bash
cd frontend
npm test -- --watchAll=false
```

**Flutter tests**
```bash
cd mobile
flutter test
```

**Selenium E2E tests**
```bash
# Start the app first, then:
cd tests
pip install -r requirements.txt
pytest test_cases/ -v

# Or with Docker:
docker-compose --profile testing up
```

Test reports are generated in `tests/reports/`.

---

## CI/CD

GitHub Actions pipeline runs on every push to `main`:

- **Backend** — installs dependencies, verifies server starts
- **Frontend** — installs dependencies, runs production build
- **Docker** — builds all three images (backend, frontend, AI model)
- **Mobile** — sets up Flutter, runs `flutter pub get`

See `.github/workflows/ci.yml` for full configuration.

---

## Project Structure

```
backend/
├── src/
│   ├── controllers/    # Route handlers
│   ├── models/         # Mongoose schemas
│   ├── routes/         # Express routers
│   ├── middleware/      # Auth middleware
│   ├── services/       # Business logic (notifications, email)
│   └── utils/          # Email templates
├── models/             # Python AI service
│   ├── flask_api.py    # Flask REST API
│   ├── inference.py    # PyTorch model inference
│   └── model_weights.pth
└── tests/              # Jest integration tests

frontend/
└── src/
    ├── pages/
    │   ├── admin/      # Admin portal pages
    │   ├── doctor/     # Doctor portal pages
    │   ├── patient/    # Patient portal pages
    │   └── public/     # Landing page, login
    ├── components/     # Shared layout components
    ├── contexts/       # React context (notifications)
    └── services/       # Axios API client

mobile/
└── lib/
    ├── presentation/   # Screens and widgets
    ├── features/       # Feature-specific screens (bills, payment)
    ├── data/           # Repositories and remote data sources
    ├── core/           # Services, constants, themes, utils
    └── config/         # App config and routes

tests/
├── test_cases/         # Selenium test cases
├── pages/              # Page object models
└── reports/            # Generated HTML reports
```

---

## License

ISC
