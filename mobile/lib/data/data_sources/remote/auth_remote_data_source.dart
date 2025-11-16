import 'dart:convert';
import 'package:flutter_application_1/core/constants/app_constants.dart';
import 'package:flutter_application_1/core/errors/exceptions.dart';
import 'package:flutter_application_1/data/models/user_model.dart';
import 'package:http/http.dart' as http;
// import 'package:dental_care/core/constants/app_constants.dart';
// import 'package:dental_care/core/errors/exceptions.dart';
// import 'package:dental_care/data/models/user_model.dart';

abstract class AuthRemoteDataSource {
  Future<UserModel> login(String email, String password);
  Future<UserModel> register(UserModel user, String password);
  Future<void> forgotPassword(String email);
  Future<void> verifyEmail(String email, String otp);
  Future<void> logout();
}

class AuthRemoteDataSourceImpl implements AuthRemoteDataSource {
  final http.Client client;

  AuthRemoteDataSourceImpl({required this.client});

  @override
  Future<UserModel> login(String email, String password) async {
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
        return UserModel.fromJson(data['user']);
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
  Future<UserModel> register(UserModel user, String password) async {
    try {
      final response = await client.post(
        Uri.parse('${AppConstants.baseUrl}${AppConstants.registerEndpoint}'),
        body: jsonEncode({
          'user': user.toJson(),
          'password': password,
        }),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == 201) {
        final data = jsonDecode(response.body);
        return UserModel.fromJson(data['user']);
      } else if (response.statusCode == 409) {
        throw EmailAlreadyExistsException();
      } else {
        throw ServerException('Registration failed', response.statusCode);
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