import 'dart:convert';
import 'package:flutter_application_1/core/constants/app_constants.dart';
import 'package:flutter_application_1/core/errors/exceptions.dart';
import 'package:http/http.dart' as http;
// import 'package:dental_care/core/constants/app_constants.dart';
// import 'package:dental_care/core/errors/exceptions.dart';

abstract class DentalRemoteDataSource {
  Future<List<dynamic>> getAppointments();
  Future<dynamic> bookAppointment(Map<String, dynamic> appointmentData);
  Future<List<dynamic>> getDentists();
  Future<List<dynamic>> getTreatments();
  Future<dynamic> uploadTeethScan(String imagePath);
}

class DentalRemoteDataSourceImpl implements DentalRemoteDataSource {
  final http.Client client;

  DentalRemoteDataSourceImpl({required this.client});

  @override
  Future<List<dynamic>> getAppointments() async {
    try {
      final response = await client.get(
        Uri.parse('${AppConstants.baseUrl}/appointments'),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['appointments'];
      } else {
        throw ServerException('Failed to fetch appointments', response.statusCode);
      }
    } catch (e) {
      throw NetworkException('Network error occurred');
    }
  }

  @override
  Future<dynamic> bookAppointment(Map<String, dynamic> appointmentData) async {
    try {
      final response = await client.post(
        Uri.parse('${AppConstants.baseUrl}/appointments'),
        body: jsonEncode(appointmentData),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == 201) {
        return jsonDecode(response.body);
      } else {
        throw ServerException('Failed to book appointment', response.statusCode);
      }
    } catch (e) {
      throw NetworkException('Network error occurred');
    }
  }

  @override
  Future<List<dynamic>> getDentists() async {
    try {
      final response = await client.get(
        Uri.parse('${AppConstants.baseUrl}/dentists'),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['dentists'];
      } else {
        throw ServerException('Failed to fetch dentists', response.statusCode);
      }
    } catch (e) {
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