# 📘 DentalCare+ — Complete Master User Manual & System Reference

> **Version 2.0** | Comprehensive end-to-end documentation for Patients, Doctors, and Administrators.

---

## 📋 Table of Contents

- [1. System Architecture Overview](#1-system-architecture-overview)
- [2. Data Model — Entity Relationship Diagram (ERD)](#2-data-model--entity-relationship-diagram-erd)
- [3. System Class Diagram](#3-system-class-diagram)
- [4. Role-Based Use Case Diagrams](#4-role-based-use-case-diagrams)
- [5. Feature Lifecycle & Workflows](#5-feature-lifecycle--workflows)
- [6. Patient Guide — Flutter Mobile App](#6-patient-guide--flutter-mobile-app)
- [7. Doctor Guide — React Web Dashboard](#7-doctor-guide--react-web-dashboard)
- [8. Administrator Guide — System Control](#8-administrator-guide--system-control)
- [9. Technical Reference & Deployment](#9-technical-reference--deployment)

---

## 1. System Architecture Overview

DentalCare+ uses a distributed micro-services approach to manage high-traffic dental operations and real-time AI processing.

```mermaid
graph TB
    subgraph Clients["🌐 Client Ecosystem"]
        MOBILE["📱 Flutter App<br/>(Patient App)"]
        WEB_DOC["💻 React Dashboard<br/>(Doctor Portal)"]
        WEB_ADM["⚙️ React Admin<br/>(System Control)"]
    end

    subgraph Messaging["💬 Real-time Communication"]
        SOCKET["Socket.io Server<br/>(Notifications & Chat)"]
    end

    subgraph Backend["⚙️ Core API Service"]
        NODE["Node.js / Express Gateway"]
        AUTH["JWT Authentication"]
        MULTER["File / Image Uploads"]
    end

    subgraph Intelligence["🤖 AI Prediction Engine"]
        FLASK["Python Flask API"]
        PYTORCH["PyTorch Inference<br/>(EfficientNet-B3)"]
    end

    subgraph Storage["🗄️ Persistence Layer"]
        MONGO[("MongoDB Cluster<br/>(Mongoose ODM)")]
        DRIVE["Local/Cloud Storage<br/>(Teeth Scan Images)"]
    end

    MOBILE <-->|"REST + Socket"| NODE
    WEB_DOC <-->|"REST + Socket"| NODE
    WEB_ADM <-->|"REST"| NODE
    NODE <--> SOCKET
    NODE -->|"Forward Image"| FLASK
    FLASK --> PYTORCH
    NODE <--> MONGO
```

---

## 2. Data Model — Entity Relationship Diagram (ERD)

The system manages 14 core entities across a non-relational MongoDB schema, utilizing references for cross-entity relationships.

```mermaid
erDiagram
    Patient ||--o{ Appointment : "schedules"
    Patient ||--o{ Bill : "owns"
    Patient ||--o{ ScanQA : "initiates"
    Patient ||--o{ Wallet : "manages balance"
    Patient ||--o{ Review : "writes"
    Patient ||--o{ Message : "sends/receives"

    Doctor ||--o{ Appointment : "conducts"
    Doctor ||--o{ ScanQA : "reviews results"
    Doctor ||--o{ DoctorAvailability : "sets"
    Doctor ||--o{ Review : "receives"
    Doctor ||--o{ Message : "sends/receives"

    Admin ||--o{ Doctor : "onboards"
    Admin ||--o{ Hospital : "registers"

    Appointment }o--|| Service : "provides"
    
    Patient {
        string name
        string email
        string phone
        string passwordHash
        int age
        string gender
        string bloodGroup
        bool isEmailVerified
    }

    Doctor {
        string fullName
        string email
        string licenseNumber
        string specialization
        array services
        float averageRating
        Point location
    }

    Appointment {
        ObjectId patientId
        ObjectId doctorId
        datetime startTime
        datetime endTime
        string status
        bool teleconsult
    }

    ScanQA {
        string scanId
        ObjectId patientId
        ObjectId doctorId
        string imageUrl
        Mixed analysisResults
        array questions
        string status
    }

    Bill {
        ObjectId patientId
        ObjectId doctorId
        float amount
        string status
        array items
    }

    Wallet {
        ObjectId patientId
        float balance
        array transactions
    }
```

---

## 3. System Class Diagram

High-level logical structure showing how the Backend Controllers interface with Mongoose Models and the Clients.

```mermaid
classDiagram
    class AuthController {
        +registerPatient()
        +loginUser()
        +verifyEmail()
    }
    class AppointmentController {
        +createAppointment()
        +updateStatus()
        +getDoctorSchedule()
    }
    class AiScanController {
        +uploadImage()
        +getPrediction()
        +saveResults()
    }
    class PharmacyService {
        +processBills()
        +updateWallet()
    }
    
    class PatientModel {
        +String name
        +String email
        +String passwordHash
    }
    class DoctorModel {
        +String fullName
        +String specialization
        +Number averageRating
    }
    class ScanQAModel {
        +String scanId
        +String imageUrl
        +Array questions
    }

    AuthController ..> PatientModel : "Authenticates"
    AppointmentController ..> PatientModel : "References"
    AppointmentController ..> DoctorModel : "Assigned To"
    AiScanController ..> ScanQAModel : "Persists"
    PharmacyService ..> PatientModel : "Debits Wallet"
```

---

## 4. Role-Based Use Case Diagrams

Defining the primary interactions for each system stakeholder.

### 📱 Patient Use Cases (Mobile)
```mermaid
graph LR
    P((Patient))
    P --> UC1(AI Teeth Scan)
    P --> UC2(Book Appointment)
    P --> UC3(View/Pay Bills)
    P --> UC4(Chat with Doctor)
    P --> UC5(Find Nearby Hospitals)
```

### 👨‍⚕️ Doctor Use Cases (Web)
```mermaid
graph LR
    D((Doctor))
    D --> UC6(Manage Schedule)
    D --> UC7(Review Scan Q&A)
    D --> UC8(Confirm Appointments)
    D --> UC9(Consult Patients)
```

### ⚙️ Admin Use Cases (Web)
```mermaid
graph LR
    A((Admin))
    A --> UC10(Register Doctor)
    A --> UC11(Audit Activity)
    A --> UC12(Manage Hospitals)
```

---

## 5. Feature Lifecycle & Workflows

### 🦷 AI Scan & Consultation Lifecycle
Detailed sequence from image capture to professional advice.

```mermaid
sequenceDiagram
    participant P as Patient (Mobile)
    participant N as Node.js API
    participant AI as Python AI Engine
    participant D as Doctor (Web)

    P->>N: Upload Teeth Image
    N->>AI: analyze_teeth_scan(image)
    AI-->>N: { disease: 'Gingivitis', confidence: 0.94 }
    N-->>P: Return Results + Confidence
    P->>N: Ask: "Is this urgent?"
    N->>D: Notify: New Scan Question
    D->>N: Submit Answer: "Yes, book a cleaning."
    N->>P: Push Notification: "Doctor Responded"
```

### 📅 Appointment State Machine
Visualizing the transitions of a booking request.

```mermaid
stateDiagram-v2
    [*] --> Pending : Patient Submits Request
    Pending --> Confirmed : Doctor Accepts
    Pending --> Cancelled : Patient/Doctor Rejects
    Confirmed --> Rescheduled : Availability Change
    Rescheduled --> Confirmed
    Confirmed --> Completed : Post-Visit Finalization
    Completed --> [*]
```

---

## 6. Patient Guide — Flutter Mobile App

### 🏠 Dashboard
The home screen provides a 360-degree view of your oral health:
- **Health Score**: A dynamic metric calculated based on scan history and appointment consistency.
- **Wallet Balance**: Quick view of your current funds for automated billing.
- **Top Actions**: Quick-access buttons for AI Scan and Find Doctors.

### 🧪 AI Teeth Scan
A core feature that puts a digital dentist in your pocket:
- **Circular Masking**: The app guides you to align your teeth within a circular frame for optimal AI accuracy.
- **AI Engine**: Uses EfficientNet-B3 to detect Calculus, Gingivitis, Ulcers, and more.
- **History**: All previous scans are saved for timeline tracking.

---

## 7. Doctor Guide — React Web Dashboard

### 📅 Managing Availability
Doctors must set their "Availability Slots" to appear in patient searches:
- **Weekly Slots**: Configure daily start/end times.
- **Override**: Mark specific days as vacation or unavailable.

### 💬 Real-Time Messaging
Integrates Socket.io for instant patient communication:
- **Chat Interface**: Unified inbox for all patients with pending appointments.
- **File Sharing**: Send reports or prescriptions directly within the chat.

---

## 8. Administrator Guide — System Control

### 👨‍⚕️ Global Staffing
Admins can onboard doctors from the **Admin Panel**:
- **Credentials**: Upload and verify medical licenses.
- **Affiliation**: Assign doctors to specific hospitals in the Google Maps overlay.

### 🏥 Hospital Management
- **Geocoding**: Add hospitals with Latitude/Longitude for the patient "Nearby" search.
- **Contact Info**: Manage centralized emergency numbers for every facility.

---

## 9. Technical Reference & Deployment

### 🐳 Containerization
The system is fully Dockerized for "Infrastructure as Code" delivery:
- `docker-compose.yml` orchestrates MongoDB, AI Service, Backend, and Frontend.
- Use `docker-compose up -d` for a "One-Click" production-ready deployment.

### 🛠️ Developer Scripts
Found in the `backend/` directory:
- `node createAdmin.js`: Initialize the system superuser.
- `npm run seed-services`: Populate default dental categories.

---
*© 2026 DentalCare+ | Intelligence in Every Smile.*
