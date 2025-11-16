# Mobile App Database Connection Setup Guide

## Overview
This guide explains how to connect the mobile app to the MongoDB database through the backend API.

## Prerequisites
1. MongoDB installed and running (local or MongoDB Atlas)
2. Node.js and npm installed
3. Backend server running

## Step 1: Configure MongoDB Connection

### For Local MongoDB:
1. Create a `.env` file in the `backend` folder:
```env
MONGO_URI=mongodb://localhost:27017/dentalcare
PORT=4000
JWT_SECRET=your_secret_key_here_change_in_production
```

### For MongoDB Atlas (Cloud):
1. Get your connection string from MongoDB Atlas
2. Create a `.env` file in the `backend` folder:
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/dentalcare
PORT=4000
JWT_SECRET=your_secret_key_here_change_in_production
```

## Step 2: Start the Backend Server

```bash
cd backend
npm install
npm run dev
```

The server should start on `http://localhost:4000`

## Step 3: Configure Mobile App Base URL

The mobile app base URL is configured in:
`mobile/lib/core/constants/app_constants.dart`

### For Android Emulator:
```dart
static const String baseUrl = 'http://10.0.2.2:4000/api';
```

### For iOS Simulator:
```dart
static const String baseUrl = 'http://localhost:4000/api';
```

### For Physical Device:
1. Find your computer's IP address:
   - Windows: `ipconfig` (look for IPv4 Address)
   - Mac/Linux: `ifconfig` or `ip addr`
2. Update the base URL:
```dart
static const String baseUrl = 'http://YOUR_IP_ADDRESS:4000/api';
// Example: 'http://192.168.1.100:4000/api'
```

**Important:** Make sure your phone and computer are on the same WiFi network.

## Step 4: API Endpoints

The mobile app connects to these backend endpoints:

### Authentication:
- `POST /api/auth/register` - Patient registration
- `POST /api/auth/login` - Patient login
- `POST /api/auth/forgot-password` - Password reset
- `POST /api/auth/verify-email` - Email verification

### Appointments:
- `GET /api/appointments` - Get all appointments
- `POST /api/appointments` - Create appointment

### Doctors:
- `GET /api/doctors/all` - Get all doctors

### Patients:
- `GET /api/patients/:id` - Get patient by ID
- `POST /api/patients` - Create patient
- `PUT /api/patients/:id` - Update patient

## Step 5: Test the Connection

1. Start the backend server
2. Run the mobile app
3. Try to register a new patient
4. Check the backend console for MongoDB connection confirmation

## Troubleshooting

### MongoDB Connection Issues:
- Make sure MongoDB is running: `mongod` (local) or check Atlas connection
- Verify the connection string in `.env` file
- Check firewall settings if using Atlas

### Mobile App Connection Issues:
- Verify backend server is running on the correct port
- Check base URL in `app_constants.dart`
- For physical devices, ensure same WiFi network
- Check CORS settings in backend (should allow all origins for development)

### Common Errors:
- **"Network error occurred"**: Check base URL and server status
- **"Invalid credentials"**: Verify patient exists in database
- **"Connection refused"**: Check if backend server is running

## Database Schema

The Patient model now includes:
- `passwordHash` - For authentication
- `isEmailVerified` - Email verification status
- `emailVerificationOTP` - OTP for email verification

All existing fields are preserved.

