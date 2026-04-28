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
import 'package:flutter_application_1/presentation/screens/hospitals/search_hospitals_screen.dart';
import 'package:flutter_application_1/presentation/screens/hospitals/nearby_hospitals_map_screen.dart';
import 'package:flutter_application_1/presentation/screens/dentists/nearby_hospitals_screen.dart';
import 'package:flutter_application_1/presentation/screens/dentists/nearby_doctors_screen.dart';
import 'package:flutter_application_1/presentation/screens/emergency/emergency_help_screen.dart';
import 'package:flutter_application_1/presentation/screens/home/home_screen.dart';
import 'package:flutter_application_1/presentation/screens/home/appointments/appointments_screen.dart';
import 'package:flutter_application_1/presentation/screens/home/profile/profile_screen.dart';
import 'package:flutter_application_1/presentation/screens/home/health/health_screen.dart';
import 'package:flutter_application_1/presentation/screens/ai_teeth_scan/teeth_scan_screen.dart';
import 'package:flutter_application_1/presentation/screens/home/notifications_screen.dart';
import 'package:flutter_application_1/presentation/screens/onboarding/onboarding_screen.dart';
import 'package:flutter_application_1/presentation/screens/onboarding/splashscreen.dart';
import 'package:flutter_application_1/presentation/screens/treatments/my_treatments_screen.dart';
import 'package:flutter_application_1/features/payment/card_payment_screen.dart';
import 'package:flutter_application_1/presentation/screens/messages/messages_screen.dart';
import 'package:flutter_application_1/presentation/screens/reports/my_reports_screen.dart';
import 'package:flutter_application_1/presentation/screens/scan_qa/scan_qa_screen.dart';
import 'package:flutter_application_1/presentation/screens/wallet/wallet_screen.dart';
import 'package:flutter_application_1/presentation/widgets/auth/protected_route.dart';

import 'package:flutter_application_1/core/utils/theme_notifier.dart';

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

class DentalCareApp extends StatefulWidget {
  const DentalCareApp({super.key});

  @override
  State<DentalCareApp> createState() => _DentalCareAppState();
}

class _DentalCareAppState extends State<DentalCareApp> {
  final ThemeNotifier _themeNotifier = ThemeNotifier();
  bool _isDarkMode = false;
  bool _isEyeComfortMode = false;

  @override
  void initState() {
    super.initState();
    _loadTheme();
    _themeNotifier.addListener(_onThemeChanged);
  }

  @override
  void dispose() {
    _themeNotifier.removeListener(_onThemeChanged);
    _themeNotifier.dispose();
    super.dispose();
  }

  void _onThemeChanged() {
    setState(() {
      _isDarkMode = _themeNotifier.isDarkMode;
      _isEyeComfortMode = _themeNotifier.isEyeComfortMode;
    });
  }

  Future<void> _loadTheme() async {
    await _themeNotifier.loadTheme();
    setState(() {
      _isDarkMode = _themeNotifier.isDarkMode;
      _isEyeComfortMode = _themeNotifier.isEyeComfortMode;
    });
  }

  ThemeData _getCurrentTheme() {
    if (_isEyeComfortMode) {
      return AppTheme.eyeComfortTheme;
    } else if (_isDarkMode) {
      return AppTheme.darkTheme;
    } else {
      return AppTheme.lightTheme;
    }
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Dental Care+',
      theme: _getCurrentTheme(),
      darkTheme: AppTheme.darkTheme,
      themeMode: _isDarkMode ? ThemeMode.dark : ThemeMode.light,
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
        '/book-appointment': (context) {
          final args = ModalRoute.of(context)?.settings.arguments;
          Map<String, dynamic>? scanReportData;
          Map<String, dynamic>? preSelectedDentist;
          if (args is Map<String, dynamic>) {
            scanReportData = args['scanReportData'] as Map<String, dynamic>?;
            // If args has 'id' key, it's a dentist object passed directly from Find Dentists
            if (args.containsKey('id') && args.containsKey('name')) {
              preSelectedDentist = args;
            } else {
              preSelectedDentist = args['preSelectedDentist'] as Map<String, dynamic>?;
            }
          }
          return ProtectedRoute(
            child: BookAppointmentScreen(
              scanReportData: scanReportData,
              preSelectedDentist: preSelectedDentist,
            ),
          );
        },
        '/my-treatments': (context) => const ProtectedRoute(
          child: MyTreatmentsScreen(),
        ),
        '/my-bills': (context) => const ProtectedRoute(
          child: MyBillsScreen(),
        ),
        RouteNames.myReports: (context) => const ProtectedRoute(
          child: MyReportsScreen(),
        ),
        RouteNames.wallet: (context) => const ProtectedRoute(
          child: WalletScreen(),
        ),

        '/scan-qa': (context) => const ProtectedRoute(
          child: ScanQAScreen(),
        ),
        '/find-dentists': (context) => const ProtectedRoute(
          child: FindDentistsScreen(),
        ),
        '/search-hospitals': (context) => const ProtectedRoute(
          child: SearchHospitalsScreen(),
        ),
        '/nearby-hospitals-map': (context) => const ProtectedRoute(
          child: NearbyHospitalsMapScreen(),  
        ),
        '/nearby-hospitals': (context) => const ProtectedRoute(
          child: NearbyHospitalsScreen(),
        ),
        '/nearby-doctors': (context) => const ProtectedRoute(
          child: NearbyDoctorsScreen(),
        ),
        '/emergency-help': (context) => const ProtectedRoute(
          child: EmergencyHelpScreen(),
        ),
        '/messages': (context) {          final args = ModalRoute.of(context)!.settings.arguments as Map<String, dynamic>?;
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
          final args = ModalRoute.of(context)!.settings.arguments as Map<String, dynamic>?;
          final bill = args?['bill'] as Map<String, dynamic>? ?? {};
          return ProtectedRoute(
            child: CardPaymentScreen(
              bill: bill,
              onPaymentSuccess: null, // Bills page will handle reload
            ),
          );
        },
      },
      onGenerateRoute: (settings) {
        // Handle dynamic routes with arguments
        switch (settings.name) {
          case '/card-payment':
            final args = settings.arguments as Map<String, dynamic>?;
            final bill = args?['bill'] as Map<String, dynamic>? ?? {};
            return MaterialPageRoute(
              builder: (context) => ProtectedRoute(
                child: CardPaymentScreen(
                  bill: bill,
                  onPaymentSuccess: null, // Bills page will handle reload
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