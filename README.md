# DentalCare+ — Dentists App

Full-stack dental care platform for dentists: web dashboard, mobile app, and AI-powered scan features.

---

## Technology Stack

| Layer | Technologies |
|-------|--------------|
| **Backend** | Node.js, Express.js, MongoDB (Mongoose), JWT, Socket.io, Multer |
| **Frontend** | React 19, React Router, Tailwind CSS, Framer Motion, Axios, Recharts |
| **Mobile** | Flutter (Dart), BLoC, Get It, Google Maps, Geolocator |
| **AI/ML** | Python, Flask, PyTorch, Torchvision, Pillow, NumPy |

---

## Project Structure

```
dentists-app/
├── backend/          # Node.js + Express API
├── frontend/         # React web app
├── mobile/           # Flutter app
├── backend/models/   # Python Flask + PyTorch AI service
└── README.md
```

---

## Prerequisites

- **Node.js** (v18+)
- **MongoDB** (local or Atlas)
- **Python** 3.10+ (for AI service)
- **Flutter** SDK (for mobile)

---

## Setup & Run

### 1. Backend

```bash
cd backend
npm install
```

Create `.env` in `backend/`:

```env
MONGO_URI=mongodb://localhost:27017/dentalcare
JWT_SECRET=your-secret-key
PORT=4000
```

Start:

```bash
npm run dev
```

### 2. Frontend

```bash
cd frontend
npm install
npm start
```

Uses proxy to `http://localhost:4000` (see `frontend/package.json`).

### 3. Mobile (Flutter)

```bash
cd mobile
flutter pub get
flutter run
```

### 4. AI Model Service (optional)

```bash
cd backend/models
python -m venv venv
venv\Scripts\activate   # Windows
pip install -r requirements.txt
# Run the Flask app (check backend/models for entry script)
```

---

## Environment Variables (Backend)

| Variable | Description |
|----------|-------------|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for JWT signing |
| `PORT` | API port (default 4000) |
| `ALLOW_DB_FAILURE` | Set `true` to run without DB (dev only) |

---

## Main Features

- Auth (JWT), doctors, appointments, services, patients
- Real-time messaging (Socket.io)
- Bills, reviews, notifications, hospitals, health, wallet
- AI dental scan & scan Q&A (Python/Flask + PyTorch)
- Flutter app: maps, location, image picker, BLoC state

---

## License

Private / ISC (see `backend/package.json`).
