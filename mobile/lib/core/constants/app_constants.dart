class AppConstants {
  static const String appName = 'DentalCare+';
  static const String appVersion = '1.0.0';
  static const String defaultUserImage = 'assets/images/user_placeholder.png';
  
  // API Endpoints
  // Change this to your backend server URL
  // For local development: 'http://10.0.2.2:4000/api' (Android emulator)
  // For local development: 'http://localhost:4000/api' (iOS simulator)
  // For physical device: 'http://YOUR_COMPUTER_IP:4000/api' (e.g., 'http://192.168.1.100:4000/api')
  static const String baseUrl = 'http://10.0.2.2:4000/api';
  static const String loginEndpoint = '/auth/login';
  static const String registerEndpoint = '/auth/register';
  
  // Shared Preferences Keys
  static const String tokenKey = 'auth_token';
  static const String userKey = 'user_data';
  static const String isLoggedInKey = 'is_logged_in';
  
  // App Settings
  static const int splashDelay = 3000; // 3 seconds
  static const int otpTimeout = 120; // 2 minutes
}