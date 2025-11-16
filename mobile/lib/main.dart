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

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
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
        RouteNames.home: (context) => const HomeScreen(),
        RouteNames.login: (context) => const LoginPage(),
        RouteNames.register: (context) => const RegisterPage(),
        RouteNames.forgotPassword: (context) => const ForgotPasswordPage(),
        RouteNames.verifyEmail: (context) => const VerifyEmailPage(),
        
        // Home Navigation
        '/appointments': (context) => const AppointmentsScreen(),
        '/profile': (context) => const ProfileScreen(),
        '/health': (context) => const HealthScreen(),
        '/notification': (context) => const NotificationsScreen(),
        // Features
        '/teeth-scan': (context) => const TeethScanScreen(),
        '/book-appointment': (context) => const BookAppointmentScreen(),
        '/my-treatments': (context) => const MyTreatmentsScreen(),
        '/my-bills': (context) => const MyBillsScreen(),
        '/find-dentists': (context) => const FindDentistsScreen(),
        '/card-payment': (context) {
          final bill = ModalRoute.of(context)!.settings.arguments as Map<String, dynamic>?;
          return CardPaymentScreen(
            bill: bill ?? {},
            onPaymentSuccess: () {
              // Handle payment success
              Navigator.pop(context);
            },
          );
        },
      },
      onGenerateRoute: (settings) {
        // Handle dynamic routes with arguments
        switch (settings.name) {
          case '/card-payment':
            final bill = settings.arguments as Map<String, dynamic>;
            return MaterialPageRoute(
              builder: (context) => CardPaymentScreen(
                bill: bill,
                onPaymentSuccess: () {
                  Navigator.pop(context);
                },
              ),
            );
          default:
            return null;
        }
      },
    );
  }
}