import 'dart:convert';
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
      final response = await client.post(
        Uri.parse('${AppConstants.baseUrl}${AppConstants.loginEndpoint}'),
        body: jsonEncode({
          'email': email,
          'password': password,
        }),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        // Backend returns user and token
        return {
          'user': data['user'],
          'token': data['token'] ?? '',
        };
      } else if (response.statusCode == 401) {
        throw InvalidCredentialsException();
      } else {
        throw ServerException('Login failed', response.statusCode);
      }
    } on ServerException {
      rethrow;
    } catch (e) {
      throw NetworkException('Network error occurred');
    }
  }

  @override
  Future<Map<String, dynamic>> register(UserModel user, String password) async {
    try {
      // Backend expects: name, email, password, phone, age, gender
      final userJson = user.toJson();
      final response = await client.post(
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
      throw NetworkException('Network error occurred');
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