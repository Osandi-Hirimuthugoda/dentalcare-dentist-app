/// Application Configuration
/// Contains app-wide configuration settings
class AppConfig {
  // App Information
  static const String appName = 'DentalCare+';
  static const String appVersion = '1.0.0';
  static const String appBuildNumber = '1';
  
  // API Configuration
  static const String apiBaseUrl = 'http://10.0.2.2:4000/api';
  static const String flaskApiUrl = 'http://10.0.2.2:5000';
  
  // Timeouts (in seconds)
  static const int connectionTimeout = 30;
  static const int receiveTimeout = 30;
  
  // Pagination
  static const int defaultPageSize = 20;
  static const int maxPageSize = 100;
  
  // Cache
  static const int cacheMaxAge = 3600; // 1 hour in seconds
  
  // Image Upload
  static const int maxImageSize = 5 * 1024 * 1024; // 5MB
  static const List<String> allowedImageFormats = ['jpg', 'jpeg', 'png'];
  
  // Google Maps (if using)
  static const String googleMapsApiKey = 'YOUR_GOOGLE_MAPS_API_KEY';
  
  // Feature Flags
  static const bool enableAnalytics = false;
  static const bool enableCrashReporting = false;
  static const bool enableDebugMode = true;
  
  // Environment
  static const String environment = String.fromEnvironment(
    'ENV',
    defaultValue: 'development',
  );
  
  static bool get isDevelopment => environment == 'development';
  static bool get isProduction => environment == 'production';
  static bool get isStaging => environment == 'staging';
}
