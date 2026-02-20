# Mobile App Architecture

This Flutter application follows **Clean Architecture** principles with a feature-based folder structure.

## 📁 Folder Structure

```
lib/
├── config/                     # App configuration
│   ├── app_config.dart        # App-wide configuration
│   └── routes.dart            # Route configuration
│
├── core/                       # Core functionality (shared across features)
│   ├── constants/             # App constants
│   │   ├── app_constants.dart # General constants
│   │   ├── asset_paths.dart   # Asset path constants
│   │   └── route_names.dart   # Route name constants
│   │
│   ├── errors/                # Error handling
│   │   ├── exceptions.dart    # Custom exceptions
│   │   └── failures.dart      # Failure classes
│   │
│   ├── models/                # Core models
│   │   └── notification_model.dart
│   │
│   ├── services/              # Core services
│   │   └── notification_service.dart
│   │
│   ├── themes/                # App theming
│   │   ├── app_theme.dart     # Theme configuration
│   │   ├── colors.dart        # Color palette
│   │   └── text_styles.dart   # Text styles
│   │
│   └── utils/                 # Utility functions
│       ├── extensions.dart    # Dart extensions
│       ├── helpers.dart       # Helper functions
│       ├── theme_notifier.dart
│       └── validators.dart    # Input validators
│
├── data/                       # Data layer
│   ├── data_sources/          # Data sources
│   │   ├── local/            # Local data sources (SQLite, SharedPreferences)
│   │   └── remote/           # Remote data sources (API calls)
│   │
│   ├── models/                # Data models (DTOs)
│   │   ├── appointment_model.dart
│   │   ├── hospital_model.dart
│   │   ├── treatment_model.dart
│   │   └── user_model.dart
│   │
│   └── repositories/          # Repository implementations
│       ├── appointment_repository_impl.dart
│       ├── auth_repository_impl.dart
│       └── user_repository_impl.dart
│
├── domain/                     # Domain layer (Business logic)
│   ├── entities/              # Business entities
│   │   ├── appoinment_entity.dart
│   │   ├── treatment_entity.dart
│   │   └── user_entity.dart
│   │
│   ├── repositories/          # Repository interfaces
│   │   ├── appointment_repository.dart
│   │   ├── auth_repository.dart
│   │   └── user_repository.dart
│   │
│   └── use_cases/             # Business use cases
│       ├── appointment/       # Appointment use cases
│       ├── auth/             # Authentication use cases
│       └── user/             # User use cases
│
├── features/                   # Feature modules
│   ├── bills/                # Bills feature
│   │   ├── widgets/          # Feature-specific widgets
│   │   └── my_bills_screen.dart
│   │
│   └── payment/              # Payment feature
│       └── card_payment_screen.dart
│
├── presentation/               # Presentation layer (UI)
│   ├── bloc/                  # State management (BLoC)
│   │   ├── appointments/     # Appointment BLoCs
│   │   ├── auth/            # Auth BLoCs
│   │   └── user/            # User BLoCs
│   │
│   ├── screens/               # Screen widgets
│   │   ├── ai_teeth_scan/    # AI scan screens
│   │   ├── appoinments/      # Appointment screens
│   │   ├── auth/             # Authentication screens
│   │   ├── dentists/         # Dentist screens
│   │   │   ├── nearby_doctors_screen.dart
│   │   │   └── nearby_hospitals_screen.dart
│   │   ├── emergency/        # Emergency screens
│   │   ├── home/             # Home screens
│   │   │   └── notifications_screen.dart
│   │   ├── hospitals/        # Hospital screens
│   │   ├── messages/         # Messaging screens
│   │   ├── onboarding/       # Onboarding screens
│   │   └── treatments/       # Treatment screens
│   │
│   └── widgets/               # Reusable UI widgets
│       ├── auth/             # Auth widgets
│       ├── common/           # Common widgets
│       ├── home/             # Home widgets
│       └── reviews/          # Review widgets
│
├── shared/                     # Shared components
│   └── widgets/               # Shared widgets
│       ├── custom_button.dart
│       ├── custom_text_field.dart
│       ├── loading_indicator.dart
│       ├── error_widget.dart
│       └── widgets.dart       # Widget exports
│
├── injection_container.dart    # Dependency injection setup
├── main.dart                   # App entry point
└── main_image_prediction.dart  # Alternative entry point

```

## 🏗️ Architecture Layers

### 1. **Presentation Layer** (`presentation/`)
- **Screens**: Full-page UI components
- **Widgets**: Reusable UI components
- **BLoC**: State management using BLoC pattern

### 2. **Domain Layer** (`domain/`)
- **Entities**: Core business objects
- **Repositories**: Abstract repository interfaces
- **Use Cases**: Business logic operations

### 3. **Data Layer** (`data/`)
- **Models**: Data transfer objects (DTOs)
- **Data Sources**: API calls, local storage
- **Repositories**: Repository implementations

### 4. **Core** (`core/`)
- Shared utilities, constants, themes
- Error handling
- Common services

### 5. **Config** (`config/`)
- App configuration
- Route management

### 6. **Shared** (`shared/`)
- Reusable widgets across features
- Common UI components

## 📦 Import Examples

### Shared Widgets
```dart
// Import all shared widgets
import 'package:your_app/shared/widgets/widgets.dart';

// Or import specific widgets
import 'package:your_app/shared/widgets/custom_button.dart';
import 'package:your_app/shared/widgets/loading_indicator.dart';
```

### Configuration
```dart
import 'package:your_app/config/app_config.dart';
import 'package:your_app/config/routes.dart';
```

### Core Utilities
```dart
import 'package:your_app/core/constants/app_constants.dart';
import 'package:your_app/core/utils/validators.dart';
import 'package:your_app/core/themes/app_theme.dart';
```

### Domain Layer
```dart
import 'package:your_app/domain/entities/user_entity.dart';
import 'package:your_app/domain/use_cases/auth/login_use_case.dart';
```

### Data Layer
```dart
import 'package:your_app/data/models/user_model.dart';
import 'package:your_app/data/repositories/auth_repository_impl.dart';
```

## 🎯 Clean Architecture Benefits

1. **Separation of Concerns**: Each layer has a specific responsibility
2. **Testability**: Easy to write unit tests for each layer
3. **Maintainability**: Changes in one layer don't affect others
4. **Scalability**: Easy to add new features
5. **Independence**: Business logic is independent of UI and frameworks

## 📝 Naming Conventions

- **Files**: snake_case (e.g., `user_profile_screen.dart`)
- **Classes**: PascalCase (e.g., `UserProfileScreen`)
- **Variables**: camelCase (e.g., `userName`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`)
- **Private**: Prefix with underscore (e.g., `_privateMethod`)

## 🔧 Best Practices

1. **Single Responsibility**: Each class should have one responsibility
2. **Dependency Injection**: Use `injection_container.dart` for DI
3. **State Management**: Use BLoC pattern for state management
4. **Error Handling**: Use custom exceptions and failures
5. **Code Reusability**: Create shared widgets and utilities
6. **Documentation**: Add comments for complex logic
7. **Testing**: Write tests for business logic and use cases

## 🚀 Adding New Features

When adding a new feature:

1. Create feature folder in `features/` or add screens to `presentation/screens/`
2. Create entities in `domain/entities/`
3. Create use cases in `domain/use_cases/`
4. Create models in `data/models/`
5. Create repository interface in `domain/repositories/`
6. Implement repository in `data/repositories/`
7. Create BLoC in `presentation/bloc/`
8. Create screens in `presentation/screens/`
9. Add routes in `config/routes.dart`
10. Register dependencies in `injection_container.dart`

## 📚 Resources

- [Flutter Clean Architecture](https://resocoder.com/flutter-clean-architecture-tdd/)
- [BLoC Pattern](https://bloclibrary.dev/)
- [Flutter Best Practices](https://flutter.dev/docs/development/best-practices)
