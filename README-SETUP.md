# DentalCare+ Setup Guide

## 🚀 Quick Start

### Option 1: Use Batch Scripts (Easiest)

1. **Start Everything:**
   ```bash
   start-all.bat
   ```
   This will:
   - Start Docker containers (Backend, Frontend, MongoDB, AI Model)
   - Launch Android Emulator (Pixel 7 Pro)
   - Open browser to login page

2. **Stop Everything:**
   ```bash
   stop-all.bat
   ```

### Option 2: Manual Commands

#### Start Docker Services (Web App)

```bash
# Start all Docker containers
docker-compose up -d

# Check status
docker ps

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

**Access URLs:**
- Web Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- AI Model: http://localhost:5000
- MongoDB: localhost:27017

#### Start Mobile App

```bash
# Navigate to mobile folder
cd mobile

# Install dependencies (first time only)
flutter pub get

# Launch emulator
flutter emulators --launch Pixel_7_Pro_API_35

# Wait for emulator to start, then run app
flutter run
```

**Or use VS Code:**
1. Open `mobile/lib/main.dart`
2. Select device: "Pixel 7 Pro API 35" (bottom right)
3. Press F5 or Run > Start Debugging

---

## 🔐 Login Credentials

### Web App (http://localhost:3000/doctor-login) - Doctors Only

| Name | Email | Password | Role |
|------|-------|----------|------|
| Dr.Kavindu Gamage | kavindu2002@gmail.com | password123 | Periodontist |
| Dr.Nuwan Gamage | nuwan@gmail.com | password123 | Oral Pathologist |
| Dr.Ravindu Wishwashan | ravinduwishawashan@gmail.com | password123 | Prosthodontist |
| Dr. Anoma Perera | anoma@gmail.com | password123 | Endodontist |
| Test Doctor | doctor@test.com | Test123! | General Dentistry |

### Mobile App - Patients Only

| Name | Email | Password |
|------|-------|----------|
| Kavindu Gamage | kavindu@patient.com | password123 |
| Nuwan Silva | nuwan@patient.com | password123 |
| Anoma Perera | anoma@patient.com | password123 |

**Note:** 
- Web app = Doctors & Admins login
- Mobile app = Patients login
- Different user types, different credentials!

---

## 🛠️ Useful Commands

### Docker Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Restart a service
docker-compose restart backend

# Rebuild and start
docker-compose up -d --build

# View logs
docker-compose logs -f [service-name]

# Execute command in container
docker exec -it dentalcare-backend sh
docker exec -it dentalcare-backend node createTestDoctor.js

# List doctors in database
docker exec -it dentalcare-backend node src/scripts/listDoctors.js

# Reset doctor password
docker exec -it dentalcare-backend node src/scripts/resetDoctorPassword.js <email> <password>
```

### Flutter Commands

```bash
# Get dependencies
flutter pub get

# List available emulators
flutter emulators

# Launch emulator
flutter emulators --launch Pixel_7_Pro_API_35

# List connected devices
flutter devices

# Run app
flutter run

# Run on specific device
flutter run -d <device-id>

# Build APK
flutter build apk

# Clean build
flutter clean
```

---

## 📊 Project Structure

```
dentists-app/
├── backend/              # Node.js Backend API
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   └── scripts/
│   ├── models/          # Python AI Model (Flask)
│   └── Dockerfile
├── frontend/            # React Web App
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/
│   └── Dockerfile
├── mobile/              # Flutter Mobile App
│   ├── lib/
│   │   ├── config/
│   │   ├── core/
│   │   ├── data/
│   │   ├── domain/
│   │   ├── features/
│   │   └── presentation/
│   └── android/
├── docker-compose.yml   # Docker configuration
├── start-all.bat       # Start all services
└── stop-all.bat        # Stop all services
```

---

## 🐛 Troubleshooting

### Docker Issues

**Problem:** Port already in use
```bash
# Find process using port
netstat -ano | findstr :4000

# Kill process
taskkill /F /PID <process-id>
```

**Problem:** Containers not starting
```bash
# Check logs
docker-compose logs

# Restart Docker Desktop
# Then try again
docker-compose up -d
```

### Flutter Issues

**Problem:** Emulator not starting
```bash
# Check available emulators
flutter emulators

# Try launching from Android Studio
# Or create new emulator
flutter emulators --create
```

**Problem:** App not connecting to backend
- Make sure Docker containers are running
- Check `mobile/lib/config/app_config.dart`
- API URL should be: `http://10.0.2.2:4000/api`
- For physical device, use your computer's IP address

---

## 🚀 CI/CD Pipeline

This project uses **GitHub Actions** for automated testing and building.

**What happens on every push to main:**
1. ✅ Backend tests - Verifies Node.js dependencies and server startup
2. ✅ Frontend tests - Builds React app and runs tests
3. ✅ Docker builds - Tests all Docker images (backend, frontend, AI model)
4. ✅ Mobile tests - Analyzes Flutter code and runs tests

**Check build status:**
- Visit: https://github.com/Osandi-Hirimuthugoda/dentalcare-dentist-app/actions
- Look for the green ✅ or red ❌ badge in README.md

**Pipeline configuration:**
- File: `.github/workflows/ci.yml`
- Runs on: Ubuntu latest
- Node version: 20
- Flutter version: 3.29.2

---

## 📝 Notes

- **10.0.2.2** is the special IP address for Android emulator to access host machine's localhost
- Docker containers must be running before starting mobile app
- First time setup may take longer due to downloading Docker images and Flutter dependencies
- Emulator startup takes 1-2 minutes

---

## 🆘 Support

If you encounter any issues:
1. Check Docker containers are running: `docker ps`
2. Check backend logs: `docker-compose logs -f backend`
3. Check Flutter doctor: `flutter doctor`
4. Restart everything: `stop-all.bat` then `start-all.bat`
