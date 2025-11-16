class AppConstants {
  static const String appName = 'DentalCare+';
  static const String appVersion = '1.0.0';
  static const String defaultUserImage = 'assets/images/user_placeholder.png';
  
  // API Endpoints (if any)
  static const String baseUrl = 'https://api.dentalcare.com';
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