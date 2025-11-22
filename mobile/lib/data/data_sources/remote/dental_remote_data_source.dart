import 'dart:convert';
import 'package:flutter_application_1/core/constants/app_constants.dart';
import 'package:flutter_application_1/core/errors/exceptions.dart';
import 'package:flutter_application_1/data/data_sources/local/shared_prefs.dart';
import 'package:http/http.dart' as http;
// import 'package:dental_care/core/constants/app_constants.dart';
// import 'package:dental_care/core/errors/exceptions.dart';

abstract class DentalRemoteDataSource {
  Future<List<dynamic>> getAppointments();
  Future<dynamic> bookAppointment(Map<String, dynamic> appointmentData);
  Future<List<dynamic>> getDentists();
  Future<List<dynamic>> getTreatments();
  Future<List<dynamic>> getServices(); // Get available services
  Future<dynamic> uploadTeethScan(String imagePath);
}

class DentalRemoteDataSourceImpl implements DentalRemoteDataSource {
  final http.Client client;
  final LocalDataSource localDataSource;

  DentalRemoteDataSourceImpl({
    required this.client,
    required this.localDataSource,
  });

  // Helper method to get headers with authentication
  Future<Map<String, String>> _getHeaders() async {
    final headers = <String, String>{
      'Content-Type': 'application/json',
    };
    
    // Add authentication token if available
    final token = await localDataSource.getString(AppConstants.tokenKey);
    if (token != null && token.isNotEmpty) {
      headers['Authorization'] = 'Bearer $token';
    }
    
    return headers;
  }

  @override
  Future<List<dynamic>> getAppointments() async {
    try {
      final headers = await _getHeaders();
      final response = await client.get(
        Uri.parse('${AppConstants.baseUrl}/appointments/patient'),
        headers: headers,
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        // Backend returns array directly or wrapped in appointments key
        return data is List ? data : (data['appointments'] ?? []);
      } else {
        throw ServerException('Failed to fetch appointments', response.statusCode);
      }
    } catch (e) {
      if (e is ServerException) {
        rethrow;
      }
      throw NetworkException('Network error occurred');
    }
  }

  @override
  Future<dynamic> bookAppointment(Map<String, dynamic> appointmentData) async {
    try {
      final headers = await _getHeaders();
      final response = await client.post(
        Uri.parse('${AppConstants.baseUrl}/appointments'),
        body: jsonEncode(appointmentData),
        headers: headers,
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        return jsonDecode(response.body);
      } else {
        final errorBody = jsonDecode(response.body);
        final errorMessage = errorBody['message'] ?? 'Failed to book appointment';
        throw ServerException(errorMessage, response.statusCode);
      }
    } catch (e) {
      if (e is ServerException) {
        rethrow;
      }
      throw NetworkException('Network error occurred');
    }
  }

  @override
  Future<List<dynamic>> getDentists() async {
    try {
      final headers = await _getHeaders();
      // Backend route is /api/doctors/all to get all doctors
      final response = await client.get(
        Uri.parse('${AppConstants.baseUrl}/doctors/all'),
        headers: headers,
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        // Backend returns array directly or wrapped in doctors key
        return data is List ? data : (data['doctors'] ?? []);
      } else {
        throw ServerException('Failed to fetch dentists', response.statusCode);
      }
    } catch (e) {
      if (e is ServerException) {
        rethrow;
      }
      throw NetworkException('Network error occurred');
    }
  }

  @override
  Future<List<dynamic>> getServices() async {
    try {
      final headers = await _getHeaders();
      final response = await client.get(
        Uri.parse('${AppConstants.baseUrl}/services'),
        headers: headers,
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data is List ? data : (data['services'] ?? []);
      } else {
        throw ServerException('Failed to fetch services', response.statusCode);
      }
    } catch (e) {
      if (e is ServerException) {
        rethrow;
      }
      throw NetworkException('Network error occurred');
    }
  }

  @override
  Future<List<dynamic>> getTreatments() async {
    try {
      final response = await client.get(
        Uri.parse('${AppConstants.baseUrl}/treatments'),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['treatments'];
      } else {
        throw ServerException('Failed to fetch treatments', response.statusCode);
      }
    } catch (e) {
      throw NetworkException('Network error occurred');
    }
  }

  @override
  Future<dynamic> uploadTeethScan(String imagePath) async {
    try {
      // This would typically involve file upload logic
      // For now, we'll simulate the response
      final response = await client.post(
        Uri.parse('${AppConstants.baseUrl}/ai-scan'),
        body: jsonEncode({'image_path': imagePath}),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        throw ServerException('Failed to upload teeth scan', response.statusCode);
      }
    } catch (e) {
      throw NetworkException('Network error occurred');
    }
  }
}