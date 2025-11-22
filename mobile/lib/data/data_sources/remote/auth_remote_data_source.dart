import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter_application_1/core/constants/app_constants.dart';
import 'package:flutter_application_1/core/errors/exceptions.dart';
import 'package:flutter_application_1/data/models/user_model.dart';
import 'package:http/http.dart' as http;
// import 'package:dental_care/core/constants/app_constants.dart';
// import 'package:dental_care/core/errors/exceptions.dart';
// import 'package:dental_care/data/models/user_model.dart';

abstract class AuthRemoteDataSource {
  Future<Map<String, dynamic>> login(String email, String password); // Returns user and token
  Future<Map<String, dynamic>> register(UserModel user, String password); // Returns user and token
  Future<void> forgotPassword(String email);
  Future<void> verifyEmail(String email, String otp);
  Future<void> logout();
}

class AuthRemoteDataSourceImpl implements AuthRemoteDataSource {
  final http.Client client;

  AuthRemoteDataSourceImpl({required this.client});

  @override
  Future<Map<String, dynamic>> login(String email, String password) async {
    try {
      final response = await client
          .post(
            Uri.parse('${AppConstants.baseUrl}${AppConstants.loginEndpoint}'),
            body: jsonEncode({
              'email': email,
              'password': password,
            }),
            headers: {'Content-Type': 'application/json'},
          )
          .timeout(
            const Duration(seconds: 10),
            onTimeout: () {
              throw NetworkException('Login request timed out. Please try again.');
            },
          );

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
    } catch (e) {
      // Log the actual error for debugging
      debugPrint('Login error: $e');
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
            const Duration(seconds: 10),
            onTimeout: () {
              throw NetworkException('Registration request timed out. Please try again.');
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