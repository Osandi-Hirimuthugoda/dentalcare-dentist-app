# Dental Care API Documentation

## Base URL
```
http://localhost:4000/api
```

## Authentication
Most endpoints require authentication. Include the token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## 📋 Patient/User Endpoints (Mobile App)

### 1. Register New Patient/User
**POST** `/api/patients`

Register a new patient from mobile app.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+94 77 123 4567",
  "age": 30,
  "gender": "male"
}
```

**Response:**
```json
{
  "_id": "patient_id",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+94 77 123 4567",
  "age": 30,
  "gender": "male",
  "status": "active",
  "createdAt": "2024-05-20T10:00:00.000Z"
}
```

---

### 2. User Selects a Doctor
**POST** `/api/patients/select-doctor`

When a user selects a doctor from mobile app, this creates a link and appointment.

**Request Body:**
```json
{
  "patientId": "patient_id",
  "doctorId": "doctor_id"
}
```

**Response:**
```json
{
  "message": "Doctor selected successfully",
  "patient": {
    "_id": "patient_id",
    "name": "John Doe",
    "email": "john@example.com",
    "selectedDoctor": {
      "_id": "doctor_id",
      "fullName": "Dr. Smith",
      "specialization": "Orthodontist",
      "email": "doctor@example.com",
      "phone": "+94 77 999 8888",
      "hospital": "Colombo Hospital"
    }
  },
  "appointment": {
    "_id": "appointment_id",
    "patient": "patient_id",
    "doctor": "doctor_id",
    "status": "pending",
    "startTime": "2024-05-20T10:00:00.000Z"
  }
}
```

---

### 3. Get Patient by ID
**GET** `/api/patients/:id`

Get patient details by ID.

**Response:**
```json
{
  "_id": "patient_id",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+94 77 123 4567",
  "age": 30,
  "gender": "male",
  "selectedDoctor": {
    "_id": "doctor_id",
    "fullName": "Dr. Smith",
    "specialization": "Orthodontist"
  },
  "history": [],
  "images": [],
  "diagnosis": "",
  "doctorNotes": ""
}
```

---

## 👨‍⚕️ Doctor Endpoints (Web App)

### 4. Get Patients by Doctor ID
**GET** `/api/patients/doctor/:doctorId`

Get all patients who selected a specific doctor. Used in web app for doctors to view their patients.

**Response:**
```json
[
  {
    "_id": "patient_id",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+94 77 123 4567",
    "age": 30,
    "gender": "male",
    "history": ["Previous treatment"],
    "images": ["image_url"],
    "diagnosis": "Cavity",
    "doctorNotes": "Needs follow-up",
    "selectedDoctor": {
      "_id": "doctor_id",
      "fullName": "Dr. Smith",
      "specialization": "Orthodontist"
    },
    "createdAt": "2024-05-20T10:00:00.000Z"
  }
]
```

---

### 5. Update Patient Information
**PUT** `/api/patients/:id`

Doctor can update patient information (diagnosis, notes, etc.).

**Request Body:**
```json
{
  "diagnosis": "Cavity in upper molar",
  "doctorNotes": "Patient needs root canal treatment",
  "history": ["Previous filling", "Regular checkups"],
  "images": ["image_url_1", "image_url_2"]
}
```

**Response:**
```json
{
  "_id": "patient_id",
  "name": "John Doe",
  "diagnosis": "Cavity in upper molar",
  "doctorNotes": "Patient needs root canal treatment",
  "history": ["Previous filling", "Regular checkups"],
  "images": ["image_url_1", "image_url_2"],
  "selectedDoctor": {
    "_id": "doctor_id",
    "fullName": "Dr. Smith",
    "specialization": "Orthodontist"
  }
}
```

---

## 📅 Appointment Endpoints

### 6. Get Appointments by Doctor ID
**GET** `/api/appointments/doctor/:doctorId`

Get all appointments for a specific doctor with patient details.

**Response:**
```json
[
  {
    "_id": "appointment_id",
    "patient": {
      "_id": "patient_id",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+94 77 123 4567",
      "age": 30,
      "gender": "male",
      "history": [],
      "images": [],
      "diagnosis": "",
      "doctorNotes": ""
    },
    "doctor": {
      "_id": "doctor_id",
      "fullName": "Dr. Smith",
      "specialization": "Orthodontist",
      "email": "doctor@example.com",
      "phone": "+94 77 999 8888",
      "hospital": "Colombo Hospital"
    },
    "startTime": "2024-05-20T10:00:00.000Z",
    "status": "pending",
    "notes": "",
    "createdAt": "2024-05-20T09:00:00.000Z"
  }
]
```

---

### 7. Get All Appointments (Admin)
**GET** `/api/appointments`

Get all appointments in the system.

---

### 8. Create Appointment
**POST** `/api/appointments`

Create a new appointment.

**Request Body:**
```json
{
  "patient": "patient_id",
  "doctor": "doctor_id",
  "startTime": "2024-05-20T10:00:00.000Z",
  "status": "pending",
  "notes": "Initial consultation"
}
```

---

### 9. Update Appointment
**PUT** `/api/appointments/:id`

Update appointment details.

**Request Body:**
```json
{
  "status": "confirmed",
  "notes": "Confirmed appointment",
  "startTime": "2024-05-20T11:00:00.000Z"
}
```

---

## 🔐 Admin Endpoints

### 10. Admin Login
**POST** `/api/admins/login`

**Request Body:**
```json
{
  "email": "admin",
  "password": "admin123"
}
```

---

### 11. Register Doctor (Admin Only)
**POST** `/api/doctors/register`

**Request Body:**
```json
{
  "fullName": "Dr. John Smith",
  "email": "doctor@example.com",
  "phone": "+94 77 999 8888",
  "password": "password123",
  "licenseNumber": "SLMC12345",
  "specialization": "Orthodontist",
  "qualifications": "MBBS, MD",
  "hospital": "Colombo National Hospital",
  "experience": 10
}
```

---

### 12. Get All Doctors
**GET** `/api/doctors/all`

Get all registered doctors.

---

## 🔄 Flow Summary

### Mobile App Flow:
1. User registers → `POST /api/patients`
2. User selects doctor → `POST /api/patients/select-doctor`
   - This automatically creates an appointment
   - Links patient to doctor

### Web App Flow (Doctor):
1. Doctor logs in → `POST /api/doctors/login`
2. Doctor views their patients → `GET /api/patients/doctor/:doctorId`
3. Doctor views appointments → `GET /api/appointments/doctor/:doctorId`
4. Doctor updates patient info → `PUT /api/patients/:id`

### Admin Flow:
1. Admin logs in → `POST /api/admins/login`
2. Admin registers doctors → `POST /api/doctors/register`
3. Admin views all patients → `GET /api/patients`
4. Admin views all appointments → `GET /api/appointments`

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "message": "Error description"
}
```

Common status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Server Error

