# DentalCare+ Complete Project Folder Structure

This document describes the complete folder structure of the DentalCare+ application, including Mobile App (Flutter), Web Frontend (React), and Backend (Node.js/Express).

## Project Root Structure

```
dentalcare+_user_app/
├── mobile/              # Flutter Mobile Application
├── frontend/            # React Web Application
├── backend/             # Node.js/Express Backend API
└── README.md
```

---

## 📱 Mobile Application (Flutter)

### Location: `mobile/`

### Structure:

```
mobile/
├── lib/                          # Main application code
│   ├── core/                     # Shared utilities, constants, themes, errors
│   │   ├── constants/           # App-wide constants
│   │   │   ├── app_constants.dart
│   │   │   ├── asset_paths.dart
│   │   │   └── route_names.dart
│   │   ├── errors/              # Error handling
│   │   │   ├── exceptions.dart
│   │   │   └── failures.dart
│   │   ├── models/              # Shared models
│   │   │   └── notification_model.dart
│   │   ├── services/            # Shared services
│   │   │   └── notification_service.dart
│   │   ├── themes/              # App theming
│   │   │   ├── app_theme.dart
│   │   │   ├── colors.dart
│   │   │   └── text_styles.dart
│   │   └── utils/               # Utility functions
│   │       ├── extensions.dart
│   │       ├── helpers.dart
│   │       ├── theme_notifier.dart
│   │       └── validators.dart
│   │
│   ├── data/                     # Data Layer
│   │   ├── data_sources/        # Data sources
│   │   │   ├── local/          # Local storage
│   │   │   │   ├── local_db.dart
│   │   │   │   └── shared_prefs.dart
│   │   │   └── remote/         # API calls
│   │   │       ├── auth_remote_data_source.dart
│   │   │       └── dental_remote_data_source.dart
│   │   ├── models/              # Data models (JSON serializable)
│   │   │   ├── appointment_model.dart
│   │   │   ├── hospital_model.dart
│   │   │   ├── treatment_model.dart
│   │   │   └── user_model.dart
│   │   └── repositories/        # Repository implementations
│   │       ├── appointment_repository_impl.dart
│   │       ├── auth_repository_impl.dart
│   │       └── user_repository_impl.dart
│   │
│   ├── domain/                   # Domain Layer (Business Logic)
│   │   ├── entities/            # Domain entities (pure Dart classes)
│   │   │   ├── appoinment_entity.dart
│   │   │   ├── treatment_entity.dart
│   │   │   └── user_entity.dart
│   │   ├── repositories/         # Repository interfaces
│   │   │   ├── appointment_repository.dart
│   │   │   ├── auth_repository.dart
│   │   │   └── user_repository.dart
│   │   └── use_cases/            # Business logic use cases
│   │       ├── appointment/     # Appointment use cases
│   │       │   ├── book_appointment_use_case.dart
│   │       │   ├── cancel_appointment_use_case.dart
│   │       │   ├── get_appointments_use_case.dart
│   │       │   └── reschedule_appointment_use_case.dart
│   │       ├── auth/            # Authentication use cases
│   │       │   ├── forgot_password_use_case.dart
│   │       │   ├── login_use_case.dart
│   │       │   ├── logout_use_case.dart
│   │       │   ├── register_use_case.dart
│   │       │   └── verify_email_use_case.dart
│   │       └── user/            # User use cases
│   │           ├── change_password_use_case.dart
│   │           ├── get_user_profile_use_case.dart
│   │           ├── update_profile_picture_use_case.dart
│   │           └── update_user_profile_use_case.dart
│   │
│   ├── features/                 # Feature Modules (Self-contained)
│   │   ├── bills/               # Bills feature
│   │   │   ├── widgets/         # Feature-specific widgets
│   │   │   │   ├── bill_item.dart
│   │   │   │   ├── payment_summary.dart
│   │   │   │   └── quick_payment_methods.dart
│   │   │   └── my_bills_screen.dart
│   │   └── payment/             # Payment feature
│   │       └── card_payment_screen.dart
│   │
│   ├── presentation/              # Presentation Layer
│   │   ├── bloc/                # State management (BLoC pattern)
│   │   │   ├── appointments/    # Appointment BLoC
│   │   │   │   ├── appointments_bloc.dart
│   │   │   │   ├── appointments_event.dart
│   │   │   │   └── appointments_state.dart
│   │   │   ├── auth/            # Auth BLoC
│   │   │   │   ├── auth_block.dart
│   │   │   │   ├── auth_event.dart
│   │   │   │   └── auth_state.dart
│   │   │   └── user/            # User BLoC
│   │   │       ├── user_block.dart
│   │   │       ├── user_event.dart
│   │   │       └── user_state.dart
│   │   ├── screens/             # App screens
│   │   │   ├── ai_teeth_scan/   # AI teeth scan
│   │   │   │   └── teeth_scan_screen.dart
│   │   │   ├── appoinments/     # Appointments
│   │   │   │   └── book_appointment_screen.dart
│   │   │   ├── auth/            # Authentication
│   │   │   │   ├── forgot_password_page.dart
│   │   │   │   ├── login_page.dart
│   │   │   │   ├── register_page.dart
│   │   │   │   └── verify_email_page.dart
│   │   │   ├── dentists/        # Dentists
│   │   │   │   └── find_dentists_screen.dart
│   │   │   ├── emergency/      # Emergency
│   │   │   │   ├── emergency_help_screen.dart
│   │   │   │   └── emergency_hospitals_screen.dart
│   │   │   ├── home/            # Home screens
│   │   │   │   ├── appointments/
│   │   │   │   │   └── appointments_screen.dart
│   │   │   │   ├── health/
│   │   │   │   │   └── health_screen.dart
│   │   │   │   ├── profile/
│   │   │   │   │   ├── profile_screen.dart
│   │   │   │   │   └── settings_screen.dart
│   │   │   │   └── home_screen.dart
│   │   │   ├── hospitals/       # Hospitals
│   │   │   │   ├── nearby_hospitals_map_screen.dart
│   │   │   │   └── search_hospitals_screen.dart
│   │   │   ├── messages/        # Messaging
│   │   │   │   ├── conversation_screen.dart
│   │   │   │   └── messages_screen.dart
│   │   │   ├── onboarding/      # Onboarding
│   │   │   │   ├── onboarding_screen.dart
│   │   │   │   └── splashscreen.dart
│   │   │   ├── treatments/      # Treatments
│   │   │   │   └── my_treatments_screen.dart
│   │   │   └── notifications_screen.dart
│   │   └── widgets/             # Reusable widgets
│   │       ├── auth/            # Auth widgets
│   │       │   ├── blurred_home_background.dart
│   │       │   └── protected_route.dart
│   │       ├── common/          # Common widgets
│   │       │   ├── appointment_card.dart
│   │       │   ├── bottom_navigation_bar_widget.dart
│   │       │   ├── custom_button.dart
│   │       │   └── custom_text_field.dart
│   │       ├── home/            # Home widgets
│   │       │   ├── announcements_section.dart
│   │       │   ├── appointments_section.dart
│   │       │   ├── emergency_contact.dart
│   │       │   ├── health_tips_carousel.dart
│   │       │   ├── quick_actions_grid.dart
│   │       │   └── welcome_section.dart
│   │       └── reviews/         # Review widgets
│   │           ├── add_review_dialog.dart
│   │           └── reviews_list_dialog.dart
│   │
│   ├── injection_container.dart  # Dependency injection setup
│   ├── main.dart                 # App entry point
│   └── FOLDER_STRUCTURE.md       # This file
│
├── android/                      # Android platform files
├── ios/                          # iOS platform files
├── assets/                       # App assets (images, fonts)
│   └── images/
├── test/                         # Unit and widget tests
├── pubspec.yaml                  # Flutter dependencies
└── README.md
```

---

## 🌐 Web Frontend (React)

### Location: `frontend/`

### Structure:

```
frontend/
├── public/                       # Static files
│   ├── favicon.ico
│   ├── index.html
│   ├── logo192.png
│   ├── logo512.png
│   ├── manifest.json
│   └── robots.txt
│
├── src/                          # Source code
│   ├── api/                      # API configuration
│   │   └── API.js
│   │
│   ├── components/               # Reusable components
│   │   ├── AdminSidebar.js      # Admin sidebar navigation
│   │   ├── DoctorLayout.js      # Doctor layout wrapper
│   │   ├── DoctorSidebar.js     # Doctor sidebar navigation
│   │   ├── Footer.js             # Footer component
│   │   ├── Navbar.js             # Navigation bar
│   │   ├── PasswordInput.js     # Password input component
│   │   ├── ProtectedRoute.js     # Route protection
│   │   └── Sidebar.js            # Generic sidebar
│   │
│   ├── pages/                    # Page components
│   │   ├── AdminActivity.js      # Admin activity page
│   │   ├── AdminAppointments.js  # Admin appointments management
│   │   ├── AdminDashboard.js     # Admin dashboard
│   │   ├── AdminDoctors.js       # Admin doctors management
│   │   ├── AdminHospitals.js     # Admin hospitals management
│   │   ├── AdminLogin.js          # Admin login page
│   │   ├── AdminPatients.js      # Admin patients management
│   │   ├── AdminRegisterDoctor.js # Admin register doctor
│   │   ├── Appointments.js       # Patient appointments
│   │   ├── Dashboard.js           # Patient dashboard
│   │   ├── DoctorAppointments.js  # Doctor appointments
│   │   ├── DoctorAvailability.js # Doctor availability
│   │   ├── DoctorDashboard.js     # Doctor dashboard
│   │   ├── DoctorMessages.js      # Doctor messages
│   │   ├── DoctorProfile.js       # Doctor profile
│   │   ├── DoctorRegister.js      # Doctor registration
│   │   ├── DoctorReports.js       # Doctor reports
│   │   ├── DoctorReviews.js       # Doctor reviews
│   │   ├── DoctorServices.js      # Doctor services
│   │   ├── DoctorSettings.js      # Doctor settings
│   │   ├── DoctorLogin.js         # Doctor login
│   │   ├── Health.js              # Health page
│   │   ├── Home.js                # Home/Landing page
│   │   ├── Login.js               # Generic login
│   │   ├── LoginPage.js           # Login page
│   │   ├── MyBills.js             # My Bills page
│   │   ├── NotFound.js            # 404 page
│   │   └── Patients.js            # Patients page
│   │
│   ├── services/                 # Service layer
│   │   └── api.js                # API service functions
│   │
│   ├── styles/                   # CSS stylesheets
│   │   ├── AdminRegisterDoctor.module.css
│   │   ├── DoctorAppointments.css
│   │   ├── DoctorAvailability.css
│   │   ├── DoctorDashboard.module.css
│   │   ├── DoctorLogin.css
│   │   ├── DoctorMessages.css
│   │   ├── DoctorProfile.css
│   │   ├── DoctorRegister.module.css
│   │   ├── DoctorReports.css
│   │   ├── DoctorReviews.css
│   │   ├── DoctorServices.css
│   │   ├── DoctorSettings.css
│   │   ├── DoctorSidebar.module.css
│   │   ├── globals.css
│   │   ├── Patients.css
│   │   ├── Profile.css
│   │   └── StatCard.module.css
│   │
│   ├── App.js                    # Main App component
│   ├── App.css                   # App styles
│   ├── App.test.js               # App tests
│   ├── index.js                  # Entry point
│   ├── index.css                 # Global styles
│   ├── logo.svg                  # Logo
│   ├── reportWebVitals.js        # Performance monitoring
│   └── setupTests.js             # Test setup
│
├── package.json                  # Node.js dependencies
├── postcss.config.js             # PostCSS configuration
└── README.md
```

---

## 🔧 Backend API (Node.js/Express)

### Location: `backend/`

### Structure:

```
backend/
├── src/                          # Source code
│   ├── config/                   # Configuration files
│   │   └── db.js                # Database configuration
│   │
│   ├── controllers/             # Request handlers (Business Logic)
│   │   ├── adminController.js   # Admin operations
│   │   ├── appointmentController.js # Appointment operations
│   │   ├── authController.js    # Authentication
│   │   ├── availabilityController.js # Doctor availability
│   │   ├── billController.js    # Bill management
│   │   ├── doctorController.js  # Doctor operations
│   │   ├── healthController.js  # Health data
│   │   ├── hospitalController.js # Hospital operations
│   │   ├── messageController.js # Messaging
│   │   ├── notificationController.js # Notifications
│   │   ├── patientController.js # Patient operations
│   │   ├── reviewController.js  # Reviews
│   │   ├── serviceController.js # Services
│   │   └── walletController.js  # Wallet operations
│   │
│   ├── middleware/              # Express middleware
│   │   ├── auth.js              # Authentication middleware
│   │   └── authMiddleware.js    # Alternative auth middleware
│   │
│   ├── models/                  # Database models (Mongoose)
│   │   ├── Admin.js             # Admin model
│   │   ├── Appointment.js       # Appointment model
│   │   ├── Bill.js              # Bill model
│   │   ├── DoctorAvailability.js # Doctor availability model
│   │   ├── doctorModel.js       # Doctor model
│   │   ├── Hospital.js          # Hospital model
│   │   ├── Message.js           # Message model
│   │   ├── Notification.js      # Notification model
│   │   ├── Patient.js           # Patient model
│   │   ├── Payment.js           # Payment model
│   │   ├── Review.js            # Review model
│   │   ├── Service.js           # Service model
│   │   └── Wallet.js            # Wallet model
│   │
│   ├── routes/                   # API routes
│   │   ├── adminRoutes.js       # Admin routes
│   │   ├── appointmentRoutes.js # Appointment routes
│   │   ├── authRoutes.js        # Authentication routes
│   │   ├── availabilityRoutes.js # Availability routes
│   │   ├── billRoutes.js        # Bill routes
│   │   ├── doctorRoutes.js      # Doctor routes
│   │   ├── healthRoutes.js      # Health routes
│   │   ├── hospitalRoutes.js    # Hospital routes
│   │   ├── messageRoutes.js     # Message routes
│   │   ├── notificationRoutes.js # Notification routes
│   │   ├── patientRoutes.js     # Patient routes
│   │   ├── reviewRoutes.js      # Review routes
│   │   ├── serviceRoutes.js     # Service routes
│   │   └── walletRoutes.js      # Wallet routes
│   │
│   └── scripts/                  # Utility scripts
│       ├── checkAndFixAllDoctors.js
│       ├── listDoctors.js
│       ├── resetAllDoctorsPassword.js
│       ├── resetDoctorPassword.js
│       └── testDoctorLogin.js
│
├── server.js                     # Express server entry point
├── createAdmin.js                # Admin creation script
├── generateHash.js               # Password hash generator
├── seedServices.js               # Services seeding script
├── test-db-connection.js         # Database connection test
├── test-registration.js          # Registration test
├── package.json                  # Node.js dependencies
└── README.md
```

---

## 📋 Architecture Overview

### Mobile App (Flutter)
- **Architecture**: Clean Architecture with BLoC pattern
- **State Management**: BLoC (Business Logic Component)
- **Dependency Injection**: GetIt
- **API Communication**: HTTP package
- **Local Storage**: SharedPreferences, SQLite

### Web Frontend (React)
- **Framework**: React.js
- **Routing**: React Router DOM
- **Styling**: CSS Modules, Tailwind CSS
- **State Management**: React Hooks (useState, useEffect)
- **API Communication**: Axios

### Backend (Node.js/Express)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Architecture**: MVC (Model-View-Controller)
- **API Style**: RESTful API

---

## 🔗 Key Relationships

1. **Mobile App ↔ Backend**: 
   - Mobile app makes HTTP requests to backend API
   - Uses JWT tokens for authentication
   - Endpoints defined in `core/constants/app_constants.dart`

2. **Web Frontend ↔ Backend**:
   - React app makes API calls to backend
   - Uses JWT tokens stored in localStorage
   - API configuration in `src/api/API.js` and `src/services/api.js`

3. **Shared Models**:
   - Backend models (Mongoose) define database schema
   - Mobile app models map to API responses
   - Web frontend uses API responses directly

---

## 📝 Naming Conventions

### Mobile (Flutter/Dart)
- **Files**: `snake_case.dart` (e.g., `my_bills_screen.dart`)
- **Classes**: `PascalCase` (e.g., `MyBillsScreen`)
- **Variables**: `camelCase` (e.g., `walletBalance`)
- **Constants**: `camelCase` with `const` (e.g., `const appName`)

### Web Frontend (React/JavaScript)
- **Files**: `PascalCase.js` (e.g., `DoctorDashboard.js`)
- **Components**: `PascalCase` (e.g., `DoctorDashboard`)
- **Variables**: `camelCase` (e.g., `userData`)
- **CSS Files**: `PascalCase.module.css` or `PascalCase.css`

### Backend (Node.js/JavaScript)
- **Files**: `camelCase.js` (e.g., `doctorController.js`)
- **Classes/Constructors**: `PascalCase` (e.g., `DoctorController`)
- **Functions**: `camelCase` (e.g., `getDoctors`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `JWT_SECRET`)

---

## 🎯 Best Practices

### Mobile App
1. **Separation of Concerns**: Keep data, domain, and presentation layers separate
2. **Feature-Based Organization**: Group related files by feature
3. **Reusability**: Place shared code in `core/` or `presentation/widgets/common/`
4. **Dependency Direction**: Domain → Data (Domain doesn't depend on Data)
5. **Single Responsibility**: Each file should have a single, clear purpose

### Web Frontend
1. **Component Reusability**: Create reusable components in `components/`
2. **Page Organization**: Keep page components in `pages/`
3. **Style Organization**: Use CSS Modules for component-specific styles
4. **API Abstraction**: Centralize API calls in `services/api.js`
5. **Route Protection**: Use `ProtectedRoute` for authenticated routes

### Backend
1. **MVC Pattern**: Separate Models, Controllers, and Routes
2. **Middleware**: Use middleware for authentication and validation
3. **Error Handling**: Implement consistent error handling
4. **Environment Variables**: Use environment variables for sensitive data
5. **API Documentation**: Keep routes well-documented

---

## 🚀 Getting Started

### Mobile App
```bash
cd mobile
flutter pub get
flutter run
```

### Web Frontend
```bash
cd frontend
npm install
npm start
```

### Backend
```bash
cd backend
npm install
npm start
```

---

## 📚 Additional Resources

- **Flutter Documentation**: https://flutter.dev/docs
- **React Documentation**: https://react.dev
- **Express Documentation**: https://expressjs.com
- **MongoDB Documentation**: https://docs.mongodb.com

---

*Last Updated: 2025*
