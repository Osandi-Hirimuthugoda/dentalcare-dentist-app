# DentalCare+ Mobile App Backend

Clean, simple backend API for the DentalCare+ mobile app with authentication (Login & Register).

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Environment Variables

Create a `.env` file in the `backend` folder:

```env
MONGO_URI=mongodb://localhost:27017/dentalcare
PORT=4000
JWT_SECRET=your_secret_key_here_change_in_production
```

**For MongoDB Atlas (Cloud):**
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/dentalcare
PORT=4000
JWT_SECRET=your_secret_key_here_change_in_production
```

### 3. Start the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

You should see:
```
🔌 Connecting to MongoDB...
✅ MongoDB Connected Successfully!
   Host: localhost
   Database: dentalcare
🚀 Server running on port 4000
📍 API URL: http://localhost:4000/api
```

## 📋 API Endpoints

### Base URL
```
http://localhost:4000/api
```

### Authentication Endpoints

#### 1. Register Patient
**POST** `/api/auth/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "0712345678",
  "age": 30,
  "gender": "male"
}
```

**Response (201 Created):**
```json
{
  "message": "Registration successful",
  "user": {
    "id": "patient_id",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "0712345678",
    "age": 30,
    "gender": "male",
    "status": "active",
    "isEmailVerified": false
  },
  "token": "jwt_token_here"
}
```

#### 2. Login Patient
**POST** `/api/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "message": "Login successful",
  "user": {
    "id": "patient_id",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "0712345678",
    "age": 30,
    "gender": "male"
  },
  "token": "jwt_token_here"
}
```

#### 3. Forgot Password
**POST** `/api/auth/forgot-password`

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

#### 4. Verify Email
**POST** `/api/auth/verify-email`

**Request Body:**
```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

## 📁 Project Structure

```
backend/
├── server.js                 # Main server file
├── .env                      # Environment variables (create this)
├── package.json              # Dependencies
├── README.md                 # This file
└── src/
    ├── config/
    │   └── db.js            # MongoDB connection
    ├── controllers/
    │   └── authController.js # Authentication logic
    ├── models/
    │   └── Patient.js       # Patient database model
    └── routes/
        └── authRoutes.js    # Authentication routes
```

## 🔧 Configuration for Mobile App

The mobile app is configured to use:
- **Android Emulator:** `http://10.0.2.2:4000/api`
- **iOS Simulator:** `http://localhost:4000/api`
- **Physical Device:** `http://YOUR_IP_ADDRESS:4000/api`

Update the base URL in:
```
mobile/lib/core/constants/app_constants.dart
```

## 🐛 Troubleshooting

### Port Already in Use
If you get `EADDRINUSE: address already in use :::4000`:
1. Find the process: `netstat -ano | findstr :4000`
2. Kill it: `taskkill /PID <process_id> /F`
3. Or change PORT in `.env` file

### MongoDB Connection Failed
- Check if MongoDB is running (for local MongoDB)
- Verify `MONGO_URI` in `.env` file
- For MongoDB Atlas, check your connection string and IP whitelist

### Registration/Login Not Working
- Check backend console for error messages
- Verify request body format matches API documentation
- Check if email already exists (registration)
- Verify password is correct (login)

## ✅ Testing

Test the API using:
- Postman
- cURL
- Mobile app

**Example cURL commands:**

Register:
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123","phone":"0712345678","age":30,"gender":"male"}'
```

Login:
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```

## 📝 Notes

- JWT tokens expire after 7 days
- Passwords are hashed using bcryptjs
- Email validation is performed on registration
- All endpoints return JSON responses
- CORS is enabled for all origins (development only)



