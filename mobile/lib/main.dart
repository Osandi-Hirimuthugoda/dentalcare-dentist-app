import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_application_1/core/constants/route_names.dart';
import 'package:flutter_application_1/core/themes/app_theme.dart';
import 'package:flutter_application_1/features/bills/my_bills_screen.dart';
import 'package:flutter_application_1/injection_container.dart' as di;
import 'package:flutter_application_1/presentation/screens/appoinments/book_appointment_screen.dart';
import 'package:flutter_application_1/presentation/screens/auth/forgot_password_page.dart';
import 'package:flutter_application_1/presentation/screens/auth/login_page.dart';
import 'package:flutter_application_1/presentation/screens/auth/register_page.dart';
import 'package:flutter_application_1/presentation/screens/auth/verify_email_page.dart';
import 'package:flutter_application_1/presentation/screens/dentists/find_dentists_screen.dart';
import 'package:flutter_application_1/presentation/screens/home/home_screen.dart';
import 'package:flutter_application_1/presentation/screens/home/appointments/appointments_screen.dart';
import 'package:flutter_application_1/presentation/screens/home/profile/profile_screen.dart';
import 'package:flutter_application_1/presentation/screens/home/health/health_screen.dart';
import 'package:flutter_application_1/presentation/screens/ai_teeth_scan/teeth_scan_screen.dart';
import 'package:flutter_application_1/presentation/screens/notifications_screen.dart';
import 'package:flutter_application_1/presentation/screens/onboarding/onboarding_screen.dart';
import 'package:flutter_application_1/presentation/screens/onboarding/splashscreen.dart';
import 'package:flutter_application_1/presentation/screens/treatments/my_treatments_screen.dart';
import 'package:flutter_application_1/features/payment/card_payment_screen.dart';
import 'package:flutter_application_1/presentation/screens/messages/messages_screen.dart';
import 'package:flutter_application_1/presentation/widgets/auth/protected_route.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Disable Impeller for Android emulator to prevent texture mipmap crashes
  // This is a workaround for Impeller rendering issues on emulators
  if (kDebugMode) {
    debugPrint('Flutter app initializing...');
  }
  
  await di.init();
  runApp(const DentalCareApp());
}

class DentalCareApp extends StatelessWidget {
  const DentalCareApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Dental Care+',
      theme: AppTheme.lightTheme,
      initialRoute: RouteNames.splash,
      routes: {
        RouteNames.splash: (context) => const SplashScreen(),
        RouteNames.onboarding: (context) => const OnboardingScreen(),
        RouteNames.login: (context) {
          final email = ModalRoute.of(context)?.settings.arguments as String?;
          return LoginPage(preFilledEmail: email);
        },
        RouteNames.register: (context) => const RegisterPage(),
        RouteNames.forgotPassword: (context) => const ForgotPasswordPage(),
        RouteNames.verifyEmail: (context) => const VerifyEmailPage(),
        
        // Home page - protected route (requires login)
        RouteNames.home: (context) => const ProtectedRoute(
          child: HomeScreen(),
        ),
        '/appointments': (context) => const ProtectedRoute(
          child: AppointmentsScreen(),
        ),
        '/profile': (context) => const ProtectedRoute(
          child: ProfileScreen(),
        ),
        '/health': (context) => const ProtectedRoute(
          child: HealthScreen(),
        ),
        '/notification': (context) => const ProtectedRoute(
          child: NotificationsScreen(),
        ),
        // Features - Protected
        '/teeth-scan': (context) => const ProtectedRoute(
          child: TeethScanScreen(),
        ),
        '/book-appointment': (context) => const ProtectedRoute(
          child: BookAppointmentScreen(),
        ),
        '/my-treatments': (context) => const ProtectedRoute(
          child: MyTreatmentsScreen(),
        ),
        '/my-bills': (context) => const ProtectedRoute(
          child: MyBillsScreen(),
        ),
        '/find-dentists': (context) => const ProtectedRoute(
          child: FindDentistsScreen(),
        ),
        '/messages': (context) {
          final args = ModalRoute.of(context)!.settings.arguments as Map<String, dynamic>?;
          return ProtectedRoute(
            child: MessagesScreen(filterType: args?['filter']),
          );
        },
        '/announcements': (context) {
          final args = ModalRoute.of(context)!.settings.arguments as Map<String, dynamic>?;
          return ProtectedRoute(
            child: MessagesScreen(filterType: args?['filter']),
          );
        },
        '/card-payment': (context) {
          final bill = ModalRoute.of(context)!.settings.arguments as Map<String, dynamic>?;
          return ProtectedRoute(
            child: CardPaymentScreen(
              bill: bill ?? {},
              onPaymentSuccess: () {
                // Handle payment success
                Navigator.pop(context);
              },
            ),
          );
        },
      },
      onGenerateRoute: (settings) {
        // Handle dynamic routes with arguments
        switch (settings.name) {
          case '/card-payment':
            final bill = settings.arguments as Map<String, dynamic>?;
            return MaterialPageRoute(
              builder: (context) => ProtectedRoute(
                child: CardPaymentScreen(
                  bill: bill ?? {},
                  onPaymentSuccess: () {
                    Navigator.pop(context);
                  },
                ),
              ),
            );
          default:
            return null;
        }
      },
    );
  }
}