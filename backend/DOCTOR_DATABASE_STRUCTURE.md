# Doctor Database Structure & Flow

## Database Models

### 1. Doctor Model
```javascript
{
  _id: ObjectId,
  fullName: String,
  email: String (unique),
  phone: String,
  password: String (hashed),
  licenseNumber: String,
  specialization: String,
  qualifications: String,
  hospital: String,
  experience: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### 2. Patient Model
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  phone: String,
  age: Number,
  gender: String (enum: "male", "female", "other"),
  history: [String], // Medical history
  images: [String], // Oral disease images
  diagnosis: String,
  doctorNotes: String,
  selectedDoctor: ObjectId (ref: "Doctor"), // Links to doctor when user selects
  status: String (enum: "active", "inactive"),
  createdAt: Date,
  updatedAt: Date
}
```

### 3. Appointment Model
```javascript
{
  _id: ObjectId,
  patient: ObjectId (ref: "Patient"),
  doctor: ObjectId (ref: "Doctor"),
  startTime: Date,
  endTime: Date,
  status: String (enum: "pending", "confirmed", "rescheduled", "cancelled", "completed"),
  notes: String,
  teleconsult: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

---

## Complete Flow

### Step 1: Admin Registers Doctor
- **Admin** → Admin Panel → Register Doctor
- Creates doctor with username (email) and password
- Doctor data saved in MongoDB `doctors` collection

### Step 2: Doctor Login
- **Doctor** → Login page → Enters email and password
- Backend verifies credentials
- Returns doctor data (without password) + JWT token
- Frontend stores doctor data in `localStorage`

### Step 3: Doctor Views Own Details
After login, doctor can see:
- **Dashboard**: Shows doctor's name, email, phone, specialization
- **Profile Page**: Complete doctor information
  - Full name, email, phone
  - Specialization, qualifications
  - Hospital, experience
  - License number
  - Member since date

### Step 4: User (Mobile App) Selects Doctor
- **User** (from mobile app) → Selects a doctor
- API call: `POST /api/patients/select-doctor`
  ```json
  {
    "patientId": "patient_id",
    "doctorId": "doctor_id"
  }
  ```
- Backend:
  1. Updates patient's `selectedDoctor` field
  2. Creates appointment automatically
  3. Links patient to doctor

### Step 5: Doctor Views Selected Patients
- **Doctor** → Patients page
- API call: `GET /api/patients/doctor/:doctorId`
- Returns all patients where `selectedDoctor === doctorId`
- Doctor sees:
  - Patient name, age, email, phone, gender
  - Registration date
  - Can view full details in modal:
    - Complete patient information
    - Diagnosis
    - Doctor notes
    - Medical history
    - Images

---

## API Endpoints for Doctor Side

### Authentication
- `POST /api/doctors/login` - Doctor login
  - Returns: `{ token, doctor }` (doctor without password)

### Doctor Profile
- `GET /api/doctors/profile/:id` - Get doctor profile
- `PUT /api/doctors/:doctorId/profile` - Update doctor profile
- `PUT /api/doctors/:doctorId/change-password` - Change password

### Patients
- `GET /api/patients/doctor/:doctorId` - Get all patients who selected this doctor
- `GET /api/patients/:id` - Get specific patient details
- `PUT /api/patients/:id` - Update patient (add diagnosis, notes, etc.)

### Appointments
- `GET /api/appointments/doctor/:doctorId` - Get all appointments for this doctor
- `PUT /api/appointments/:id` - Update appointment status

---

## Frontend Pages

### Doctor Dashboard (`/doctor-dashboard`)
- Shows doctor's own details in header
- Displays statistics:
  - Total Patients (who selected this doctor)
  - Upcoming Appointments
  - Consultations Today
- Shows recent appointments with patient names

### Patients Page (`/doctor/patients`)
- Lists all patients who selected this doctor
- Search functionality
- View patient details in modal
- Shows: name, age, email, phone, gender, registration date

### Profile Page (`/doctor/profile`)
- Shows complete doctor information
- All doctor details from database
- Formatted with icons

### Settings Page (`/doctor/settings`)
- Update profile information
- Change password (with current password verification)

---

## Data Flow Diagram

```
1. Admin → Register Doctor
   ↓
   MongoDB: doctors collection

2. Doctor → Login (email + password)
   ↓
   Backend: Verify credentials
   ↓
   Frontend: Store doctor data in localStorage

3. Doctor → View Dashboard
   ↓
   Frontend: Read from localStorage
   ↓
   API: GET /api/patients/doctor/:doctorId
   ↓
   Display: Doctor details + Patient count

4. User (Mobile) → Select Doctor
   ↓
   API: POST /api/patients/select-doctor
   ↓
   MongoDB: Update patient.selectedDoctor
   ↓
   MongoDB: Create appointment

5. Doctor → View Patients
   ↓
   API: GET /api/patients/doctor/:doctorId
   ↓
   MongoDB: Find patients where selectedDoctor = doctorId
   ↓
   Display: All patients who selected this doctor
```

---

## Key Features

✅ **Doctor Login**: Email/username + password authentication
✅ **Doctor Details**: Shows own information after login
✅ **Patient Linking**: When user selects doctor, automatically linked
✅ **Patient Viewing**: Doctor sees only patients who selected them
✅ **Real-time Data**: All data fetched from MongoDB
✅ **Secure**: Passwords hashed, doctor data without password in responses

---

## Testing the Flow

1. **Create Doctor** (as Admin):
   - Go to Admin Panel → Register Doctor
   - Fill form and create doctor

2. **Doctor Login**:
   - Go to `/doctor-login`
   - Enter doctor's email and password
   - Should see dashboard with doctor's name

3. **View Profile**:
   - Click Profile in sidebar
   - Should see all doctor details

4. **View Patients** (after mobile app user selects):
   - Go to Patients page
   - Should see patients who selected this doctor
   - Click "View Details" to see full patient information

---

## Database Collections Summary

- **doctors**: All registered doctors
- **patients**: All users/patients (with selectedDoctor field)
- **appointments**: All appointments (links patients to doctors)
- **admins**: Admin accounts

All collections use MongoDB with Mongoose ODM.

