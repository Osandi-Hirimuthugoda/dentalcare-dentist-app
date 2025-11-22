import 'dart:convert';
import 'package:flutter/foundation.dart';
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
  Future<Map<String, dynamic>> getDoctorAvailability(String doctorId); // Get doctor availability
  Future<dynamic> uploadTeethScan(String imagePath);
  Future<List<dynamic>> getBills(); // Get all bills for patient
  Future<dynamic> processPayment(String billId, String paymentMethod, Map<String, dynamic>? cardDetails); // Process payment
  Future<List<dynamic>> getMessages(); // Get messages/conversations for patient
  Future<List<dynamic>> getConversation(String doctorId); // Get conversation with a doctor
  Future<dynamic> sendMessage(String doctorId, String message); // Send message to doctor
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
  Future<Map<String, dynamic>> getDoctorAvailability(String doctorId) async {
    try {
      final headers = await _getHeaders();
      final response = await client.get(
        Uri.parse('${AppConstants.baseUrl}/availability/doctor/$doctorId'),
        headers: headers,
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data is Map) {
          return Map<String, dynamic>.from(data);
        } else {
          return <String, dynamic>{'availableSlots': []};
        }
      } else {
        throw ServerException('Failed to fetch doctor availability', response.statusCode);
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
      final headers = await _getHeaders();
      final response = await client.get(
        Uri.parse('${AppConstants.baseUrl}/appointments/patient/treatments'),
        headers: headers,
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data is List ? data : (data['treatments'] ?? []);
      } else {
        throw ServerException('Failed to fetch treatments', response.statusCode);
      }
    } catch (e) {
      if (e is ServerException) {
        rethrow;
      }
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

  @override
  Future<List<dynamic>> getBills() async {
    try {
      final headers = await _getHeaders();
      final response = await client.get(
        Uri.parse('${AppConstants.baseUrl}/bills/patient/bills'),
        headers: headers,
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data is List ? data : (data['bills'] ?? []);
      } else {
        throw ServerException('Failed to fetch bills', response.statusCode);
      }
    } catch (e) {
      if (e is ServerException) {
        rethrow;
      }
      throw NetworkException('Network error occurred');
    }
  }

  @override
  Future<dynamic> processPayment(String billId, String paymentMethod, Map<String, dynamic>? cardDetails) async {
    try {
      final headers = await _getHeaders();
      final body = <String, dynamic>{
        'billId': billId,
        'paymentMethod': paymentMethod,
      };
      
      if (cardDetails != null) {
        body['cardDetails'] = cardDetails;
      }
      
      final response = await client.post(
        Uri.parse('${AppConstants.baseUrl}/bills/$billId/pay'),
        body: jsonEncode(body),
        headers: headers,
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        return jsonDecode(response.body);
      } else {
        final errorBody = jsonDecode(response.body);
        final errorMessage = errorBody['message'] ?? 'Failed to process payment';
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
  Future<List<dynamic>> getMessages() async {
    try {
      final headers = await _getHeaders();
      final response = await client.get(
        Uri.parse('${AppConstants.baseUrl}/messages/patient/messages'),
        headers: headers,
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data is List ? data : (data['conversations'] ?? []);
      } else {
        throw ServerException('Failed to fetch messages', response.statusCode);
      }
    } catch (e) {
      if (e is ServerException) {
        rethrow;
      }
      throw NetworkException('Network error occurred');
    }
  }

  @override
  Future<List<dynamic>> getConversation(String doctorId) async {
    try {
      final headers = await _getHeaders();
      final token = await localDataSource.getString(AppConstants.tokenKey);
      
      if (token == null) {
        throw NetworkException('Not authenticated');
      }
      
      // Get patient ID from token
      String? patientId;
      try {
        final parts = token.split('.');
        if (parts.length == 3) {
          // Decode base64url (JWT uses base64url)
          String base64 = parts[1].replaceAll('-', '+').replaceAll('_', '/');
          // Add padding if needed
          switch (base64.length % 4) {
            case 2: base64 += '=='; break;
            case 3: base64 += '='; break;
          }
          final payload = jsonDecode(utf8.decode(base64Decode(base64)));
          patientId = payload['id']?.toString();
        }
      } catch (e) {
        debugPrint('Error decoding token: $e');
      }
      
      if (patientId == null) {
        throw NetworkException('Unable to get patient ID');
      }
      
      final response = await client.get(
        Uri.parse('${AppConstants.baseUrl}/messages/conversation/$doctorId/$patientId'),
        headers: headers,
      );
      
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data is List ? data : [];
      } else {
        throw ServerException('Failed to fetch conversation', response.statusCode);
      }
    } catch (e) {
      if (e is ServerException || e is NetworkException) {
        rethrow;
      }
      throw NetworkException('Network error occurred');
    }
  }

  @override
  Future<dynamic> sendMessage(String doctorId, String message) async {
    try {
      final headers = await _getHeaders();
      final token = await localDataSource.getString(AppConstants.tokenKey);
      
      if (token == null) {
        throw NetworkException('Not authenticated');
      }
      
      // Decode token to get patient ID
      String? patientId;
      try {
        final parts = token.split('.');
        if (parts.length == 3) {
          // Decode base64url (JWT uses base64url, not base64)
          String base64 = parts[1].replaceAll('-', '+').replaceAll('_', '/');
          // Add padding if needed
          switch (base64.length % 4) {
            case 2: base64 += '=='; break;
            case 3: base64 += '='; break;
          }
          final payload = jsonDecode(utf8.decode(base64Decode(base64)));
          patientId = payload['id']?.toString();
        }
      } catch (e) {
        debugPrint('Error decoding token: $e');
      }
      
      if (patientId == null) {
        throw NetworkException('Unable to get patient ID');
      }
      
      final body = {
        'senderId': patientId,
        'senderType': 'patient',
        'receiverId': doctorId,
        'receiverType': 'doctor',
        'message': message,
        'patientId': patientId,
      };
      
      final response = await client.post(
        Uri.parse('${AppConstants.baseUrl}/messages'),
        body: jsonEncode(body),
        headers: headers,
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        return jsonDecode(response.body);
      } else {
        final errorBody = jsonDecode(response.body);
        final errorMessage = errorBody['message'] ?? 'Failed to send message';
        throw ServerException(errorMessage, response.statusCode);
      }
    } catch (e) {
      if (e is ServerException) {
        rethrow;
      }
      throw NetworkException('Network error occurred');
    }
  }
}