import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter_application_1/core/constants/app_constants.dart';
import 'package:flutter_application_1/core/errors/exceptions.dart';
import 'package:flutter_application_1/data/data_sources/local/shared_prefs.dart';
import 'package:flutter_application_1/data/models/user_model.dart';
import 'package:http/http.dart' as http;
// import 'package:dental_care/core/constants/app_constants.dart';
// import 'package:dental_care/core/errors/exceptions.dart';
// import 'package:dental_care/data/models/user_model.dart';

abstract class AuthRemoteDataSource {
  Future<Map<String, dynamic>> login(String email, String password); // Returns user and token
  Future<Map<String, dynamic>> register(UserModel user, String password); // Returns user and token
  Future<Map<String, dynamic>> getCurrentUser(); // Get current logged in user profile
  Future<Map<String, dynamic>> updateProfile(Map<String, dynamic> profileData); // Update user profile
  Future<void> changePassword(String currentPassword, String newPassword); // Change password
  Future<void> forgotPassword(String email);
  Future<void> verifyEmail(String email, String otp);
  Future<void> logout();
}

class AuthRemoteDataSourceImpl implements AuthRemoteDataSource {
  final http.Client client;
  final LocalDataSource localDataSource;

  AuthRemoteDataSourceImpl({
    required this.client,
    required this.localDataSource,
  });
  
  // Helper method to get headers with authentication
  Future<Map<String, String>> _getHeaders() async {
    final headers = <String, String>{
      'Content-Type': 'application/json',
    };
    
    final token = await localDataSource.getString(AppConstants.tokenKey);
    if (token != null && token.isNotEmpty) {
      headers['Authorization'] = 'Bearer ${token.trim()}';
    }
    
    return headers;
  }

  @override
  Future<Map<String, dynamic>> login(String email, String password) async {
    try {
      final url = '${AppConstants.baseUrl}${AppConstants.loginEndpoint}';
      debugPrint('🔐 Login request: POST $url');
      
      final response = await client
          .post(
        Uri.parse(url),
        body: jsonEncode({
          'email': email,
          'password': password,
        }),
        headers: {'Content-Type': 'application/json'},
          )
          .timeout(
            const Duration(seconds: 30), // Increased timeout to 30 seconds
            onTimeout: () {
              debugPrint('Login timeout - Server did not respond in 30 seconds');
              throw NetworkException(
                'Login request timed out. Please check:\n'
                '1. Backend server is running (port 4000)\n'
                '2. API URL is correct: http://10.0.2.2:4000/api\n'
                '3. Your internet connection'
              );
            },
      );
      
      debugPrint('Login response: ${response.statusCode}');

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        // Backend returns user and token
        if (data['user'] == null) {
          throw ServerException('Invalid response: user data missing', response.statusCode);
        }
        return {
          'user': data['user'],
          'token': data['token'] ?? '',
        };
      } else if (response.statusCode == 401) {
        throw InvalidCredentialsException();
      } else {
        // Try to parse error message from response
        try {
          final errorData = jsonDecode(response.body);
          throw ServerException(
            errorData['message'] ?? 'Login failed',
            response.statusCode,
          );
        } catch (_) {
          throw ServerException('Login failed', response.statusCode);
        }
      }
    } on ServerException {
      rethrow;
    } on InvalidCredentialsException {
      rethrow;
    } on NetworkException {
      rethrow;
    } catch (e) {
      // Log the actual error for debugging
      debugPrint('Login error details: $e');
      
      final errorString = e.toString().toLowerCase();
      
      // Check for specific connection errors
      if (errorString.contains('socketexception') || 
          errorString.contains('failed host lookup') ||
          errorString.contains('connection refused') ||
          errorString.contains('network is unreachable')) {
        throw NetworkException(
          'Cannot connect to server. Please check:\n'
          '1. Backend server is running on port 4000\n'
          '2. Run: cd backend && npm start\n'
          '3. API URL: ${AppConstants.baseUrl}\n'
          '4. For Android emulator: http://10.0.2.2:4000/api\n'
          '5. For physical device: Use your computer IP address'
        );
      }
      
      if (errorString.contains('timeout')) {
        throw NetworkException(
          'Connection timeout. Please check:\n'
          '1. Backend server is running\n'
          '2. Check server logs for errors\n'
          '3. Try restarting the server'
        );
      }
      
      throw NetworkException('Network error occurred: ${e.toString()}');
    }
  }

  @override
  Future<Map<String, dynamic>> register(UserModel user, String password) async {
    try {
      // Backend expects: name, email, password, phone, age, gender
      final userJson = user.toJson();
      final response = await client
          .post(
        Uri.parse('${AppConstants.baseUrl}${AppConstants.registerEndpoint}'),
        body: jsonEncode({
          'name': userJson['name'] ?? userJson['fullName'] ?? '',
          'email': userJson['email'] ?? '',
          'password': password,
          'phone': userJson['phone'] ?? userJson['phoneNumber'] ?? '',
          'age': userJson['age'],
          'gender': userJson['gender'] ?? 'other',
        }),
        headers: {'Content-Type': 'application/json'},
          )
          .timeout(
            const Duration(seconds: 30), // Increased timeout
            onTimeout: () {
              throw NetworkException('Registration request timed out. Please check your connection.');
            },
      );

      if (response.statusCode == 201) {
        final data = jsonDecode(response.body);
        // Backend returns user and token
        if (data['user'] == null) {
          throw ServerException('Invalid response: user data missing', response.statusCode);
        }
        return {
          'user': data['user'],
          'token': data['token'] ?? '',
        };
      } else if (response.statusCode == 409) {
        final errorData = jsonDecode(response.body);
        throw ServerException(
          errorData['message'] ?? 'Email already exists',
          response.statusCode,
        );
      } else {
        // Try to parse error message from response
        try {
          final errorData = jsonDecode(response.body);
          throw ServerException(
            errorData['message'] ?? 'Registration failed',
            response.statusCode,
          );
        } catch (_) {
          throw ServerException('Registration failed', response.statusCode);
        }
      }
    } on ServerException {
      rethrow;
    } catch (e) {
      // Provide more detailed error message
      debugPrint('Registration network error details: $e');
      
      // Check if it's a connection error
      if (e.toString().contains('SocketException') || 
          e.toString().contains('Failed host lookup') ||
          e.toString().contains('Connection refused')) {
        throw NetworkException(
          'Cannot connect to server. Please check:\n'
          '1. Backend server is running on port 4000\n'
          '2. Your computer and emulator are on the same network\n'
          '3. API URL is correct: http://10.0.2.2:4000/api'
        );
      }
      
      throw NetworkException('Network error occurred: ${e.toString()}');
    }
  }

  @override
  Future<void> forgotPassword(String email) async {
    try {
      final response = await client.post(
        Uri.parse('${AppConstants.baseUrl}/auth/forgot-password'),
        body: jsonEncode({'email': email}),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode != 200) {
        throw ServerException('Password reset failed', response.statusCode);
      }
    } catch (e) {
      throw NetworkException('Network error occurred');
    }
  }

  @override
  Future<void> verifyEmail(String email, String otp) async {
    try {
      final response = await client.post(
        Uri.parse('${AppConstants.baseUrl}/auth/verify-email'),
        body: jsonEncode({
          'email': email,
          'otp': otp,
        }),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode != 200) {
        throw ServerException('Email verification failed', response.statusCode);
      }
    } catch (e) {
      throw NetworkException('Network error occurred');
    }
  }

  @override
  Future<Map<String, dynamic>> getCurrentUser() async {
    try {
      final headers = await _getHeaders();
      final response = await client.get(
        Uri.parse('${AppConstants.baseUrl}/auth/me'),
        headers: headers,
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['user'] == null) {
          throw ServerException('Invalid response: user data missing', response.statusCode);
        }
        return data['user'] as Map<String, dynamic>;
      } else if (response.statusCode == 401) {
        throw InvalidCredentialsException();
      } else {
        try {
          final errorData = jsonDecode(response.body);
          throw ServerException(
            errorData['message'] ?? 'Failed to get user profile',
            response.statusCode,
          );
        } catch (_) {
          throw ServerException('Failed to get user profile', response.statusCode);
        }
      }
    } on ServerException {
      rethrow;
    } on InvalidCredentialsException {
      rethrow;
    } catch (e) {
      debugPrint('Get current user error: $e');
      throw NetworkException('Network error occurred: ${e.toString()}');
    }
  }

  @override
  Future<Map<String, dynamic>> updateProfile(Map<String, dynamic> profileData) async {
    try {
      final headers = await _getHeaders();
      final response = await client.put(
        Uri.parse('${AppConstants.baseUrl}/auth/me'),
        body: jsonEncode(profileData),
        headers: headers,
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['user'] == null) {
          throw ServerException('Invalid response: user data missing', response.statusCode);
        }
        return data['user'] as Map<String, dynamic>;
      } else if (response.statusCode == 401) {
        throw InvalidCredentialsException();
      } else {
        try {
          final errorData = jsonDecode(response.body);
          throw ServerException(
            errorData['message'] ?? 'Failed to update profile',
            response.statusCode,
          );
        } catch (_) {
          throw ServerException('Failed to update profile', response.statusCode);
        }
      }
    } on ServerException {
      rethrow;
    } on InvalidCredentialsException {
      rethrow;
    } catch (e) {
      debugPrint('Update profile error: $e');
      throw NetworkException('Network error occurred: ${e.toString()}');
    }
  }

  @override
  Future<void> changePassword(String currentPassword, String newPassword) async {
    try {
      final headers = await _getHeaders();
      final response = await client.put(
        Uri.parse('${AppConstants.baseUrl}/auth/change-password'),
        body: jsonEncode({
          'currentPassword': currentPassword,
          'newPassword': newPassword,
        }),
        headers: headers,
      );

      if (response.statusCode == 200) {
        // Password changed successfully
        return;
      } else if (response.statusCode == 401) {
        try {
          final errorData = jsonDecode(response.body);
          throw InvalidCredentialsException(
            errorData['message'] ?? 'Current password is incorrect'
          );
        } catch (_) {
          throw InvalidCredentialsException('Current password is incorrect');
        }
      } else {
        try {
          final errorData = jsonDecode(response.body);
          throw ServerException(
            errorData['message'] ?? 'Failed to change password',
            response.statusCode,
          );
        } catch (_) {
          throw ServerException('Failed to change password', response.statusCode);
        }
      }
    } on ServerException {
      rethrow;
    } on InvalidCredentialsException {
      rethrow;
    } catch (e) {
      debugPrint('Change password error: $e');
      throw NetworkException('Network error occurred: ${e.toString()}');
    }
  }

  @override
  Future<void> logout() async {
    try {
      final response = await client.post(
        Uri.parse('${AppConstants.baseUrl}/auth/logout'),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode != 200) {
        throw ServerException('Logout failed', response.statusCode);
      }
    } catch (e) {
      throw NetworkException('Network error occurred');
    }
  }
}