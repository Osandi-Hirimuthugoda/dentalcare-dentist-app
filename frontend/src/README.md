# Frontend Source Structure

This document describes the organization of the frontend source code.

## 📁 Folder Structure

```
src/
├── api/                    # API configuration and setup
│   └── API.js             # Axios instance and interceptors
│
├── assets/                 # Static assets (images, fonts, etc.)
│
├── components/             # Reusable React components
│   ├── common/            # Common/shared components
│   │   ├── NotificationBell.js
│   │   ├── PasswordInput.js
│   │   └── ProtectedRoute.js
│   │
│   └── layout/            # Layout components
│       ├── AdminSidebar.js
│       ├── DoctorSidebar.js
│       ├── Sidebar.js
│       ├── Navbar.js
│       ├── Footer.js
│       └── DoctorLayout.js
│
├── contexts/               # React Context providers
│   └── NotificationContext.js
│
├── hooks/                  # Custom React hooks
│   ├── useAuth.js         # Authentication hook
│   └── index.js           # Hook exports
│
├── pages/                  # Page components (route components)
│   ├── admin/             # Admin pages
│   │   ├── AdminActivity.js
│   │   ├── AdminAppointments.js
│   │   ├── AdminDashboard.js
│   │   ├── AdminDoctors.js
│   │   ├── AdminHospitals.js
│   │   ├── AdminLogin.js
│   │   ├── AdminPatients.js
│   │   └── AdminRegisterDoctor.js
│   │
│   ├── doctor/            # Doctor pages
│   │   ├── DoctorAppointments.js
│   │   ├── DoctorAvailability.js
│   │   ├── DoctorDashboard.js
│   │   ├── DoctorLogin.js
│   │   ├── DoctorMessages.js
│   │   ├── DoctorProfile.js
│   │   ├── DoctorRegister.js
│   │   ├── DoctorReports.js
│   │   ├── DoctorReviews.js
│   │   ├── DoctorScanQA.js
│   │   ├── DoctorServices.js
│   │   └── DoctorSettings.js
│   │
│   ├── patient/           # Patient pages
│   │   ├── Appointments.js
│   │   ├── Dashboard.js
│   │   ├── Health.js
│   │   ├── MyBills.js
│   │   ├── NearbyDoctors.js
│   │   ├── NearbyHospitals.js
│   │   └── Patients.js
│   │
│   └── public/            # Public pages
│       ├── Home.js
│       ├── Login.js
│       ├── LoginPage.js
│       └── NotFound.js
│
├── services/               # API service functions
│   └── api.js             # API calls and data fetching
│
├── styles/                 # CSS/SCSS files
│   ├── components/        # Component-specific styles
│   │   ├── NotificationBell.css
│   │   ├── DoctorSidebar.module.css
│   │   └── StatCard.module.css
│   │
│   ├── pages/             # Page-specific styles
│   │   ├── AdminRegisterDoctor.module.css
│   │   ├── DoctorAppointments.css
│   │   ├── DoctorAvailability.css
│   │   ├── DoctorDashboard.module.css
│   │   ├── DoctorLogin.css
│   │   ├── DoctorMessages.css
│   │   ├── DoctorPages.module.css
│   │   ├── DoctorProfile.css
│   │   ├── DoctorRegister.module.css
│   │   ├── DoctorReports.css
│   │   ├── DoctorReviews.css
│   │   ├── DoctorScanQA.css
│   │   ├── DoctorServices.css
│   │   ├── DoctorSettings.css
│   │   ├── Patients.css
│   │   └── Profile.css
│   │
│   └── globals.css        # Global styles
│
├── utils/                  # Utility functions and constants
│   ├── constants.js       # App constants (routes, API endpoints, etc.)
│   ├── helpers.js         # Helper functions
│   └── index.js           # Utility exports
│
├── App.js                  # Main App component
├── App.css                 # App styles
├── index.js                # Entry point
└── index.css               # Global styles

```

## 🎯 Import Examples

### Components
```javascript
// Layout components
import { Navbar, Footer, Sidebar } from './components/layout';

// Common components
import { NotificationBell, ProtectedRoute } from './components/common';
```

### Pages
```javascript
// Admin pages
import { AdminDashboard, AdminDoctors } from './pages/admin';

// Doctor pages
import { DoctorDashboard, DoctorAppointments } from './pages/doctor';

// Patient pages
import { Dashboard, Appointments } from './pages/patient';

// Public pages
import { Home, Login, NotFound } from './pages/public';
```

### Utilities
```javascript
// Constants
import { API_BASE_URL, ROUTES, USER_ROLES } from './utils/constants';

// Helpers
import { formatDate, formatCurrency, getErrorMessage } from './utils/helpers';

// Or import all
import { API_BASE_URL, formatDate, getErrorMessage } from './utils';
```

### Hooks
```javascript
import { useAuth } from './hooks';
```

## 📝 Naming Conventions

- **Components**: PascalCase (e.g., `NotificationBell.js`)
- **Utilities**: camelCase (e.g., `helpers.js`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`)
- **CSS Modules**: `*.module.css` for scoped styles
- **Regular CSS**: `*.css` for global/shared styles

## 🔧 Best Practices

1. **Keep components small and focused** - Each component should have a single responsibility
2. **Use index.js for exports** - Makes imports cleaner and easier to manage
3. **Separate concerns** - Keep business logic in services, UI logic in components
4. **Use constants** - Avoid hardcoding values, use constants from utils
5. **Custom hooks** - Extract reusable logic into custom hooks
6. **CSS Modules** - Use for component-specific styles to avoid conflicts
7. **PropTypes or TypeScript** - Add type checking for better code quality

## 🚀 Adding New Features

When adding a new feature:

1. Create component in appropriate folder (`common/`, `layout/`, or feature-specific)
2. Add page component in appropriate pages subfolder
3. Create styles in `styles/components/` or `styles/pages/`
4. Add API calls in `services/api.js`
5. Add constants in `utils/constants.js`
6. Export from index.js files for clean imports
