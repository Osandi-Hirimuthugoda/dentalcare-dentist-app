import 'dart:convert';
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:flutter_application_1/core/constants/app_constants.dart';
import 'package:flutter_application_1/core/errors/exceptions.dart';
import 'package:flutter_application_1/data/data_sources/local/shared_prefs.dart';
import 'package:http/http.dart' as http;
import 'package:http_parser/http_parser.dart';
// import 'package:dental_care/core/constants/app_constants.dart';
// import 'package:dental_care/core/errors/exceptions.dart';

abstract class DentalRemoteDataSource {
  Future<List<dynamic>> getAppointments();
  Future<dynamic> bookAppointment(Map<String, dynamic> appointmentData);
  Future<List<dynamic>> getDentists();
  Future<List<dynamic>> getTreatments();
  Future<List<dynamic>> getServices(); // Get available services
  Future<Map<String, dynamic>> getDoctorAvailability(String doctorId); // Get doctor availability
  Future<List<dynamic>> getBills(); // Get all bills for patient
  Future<dynamic> processPayment(String billId, String paymentMethod, Map<String, dynamic>? cardDetails); // Process payment
  Future<dynamic> createBillFromAppointment(String appointmentId); // Create bill from appointment
  Future<List<dynamic>> getMessages(); // Get messages/conversations for patient
  Future<List<dynamic>> getConversation(String doctorId); // Get conversation with a doctor
  Future<dynamic> sendMessage(String doctorId, String message); // Send message to doctor
  Future<dynamic> createReview(String doctorId, String? appointmentId, int rating, String? comment); // Create a review
  Future<List<dynamic>> getDoctorReviews(String doctorId); // Get reviews for a doctor
  Future<List<dynamic>> getPatientReviews(); // Get patient's reviews
  Future<List<dynamic>> getAnnouncements(); // Get announcements from doctors
  Future<void> markMessageAsRead(String messageId); // Mark a message as read
  Future<List<dynamic>> getNotifications(); // Get notifications for patient
  Future<void> markNotificationAsRead(String notificationId); // Mark a notification as read
  Future<void> markAllNotificationsAsRead(); // Mark all notifications as read
  Future<void> deleteNotification(String notificationId); // Delete a notification
  Future<List<dynamic>> searchHospitals({String? query, String? district}); // Search hospitals
  Future<List<dynamic>> getHospitalsByDistrict(String district); // Get hospitals by district
  Future<List<dynamic>> getDistrictsWithCounts(); // Get all districts with hospital counts
  Future<Map<String, dynamic>> getWalletBalance(); // Get wallet balance
  Future<Map<String, dynamic>> topUpWallet(int amount, String paymentMethod, Map<String, dynamic>? cardDetails); // Top-up wallet
  Future<Map<String, dynamic>> payBillWithWallet(String billId); // Pay bill using wallet
  Future<Map<String, dynamic>> payAppointmentWithWallet(String appointmentId, double amount); // Pay appointment using wallet
  Future<List<dynamic>> getWalletTransactions(); // Get wallet transaction history
  Future<List<dynamic>> getRecentActivities(); // Get recent activities for health screen
  Future<Map<String, dynamic>> uploadTeethScan(String imagePath); // Upload and analyze teeth scan image
  Future<Map<String, dynamic>> createScanQA(String imageUrl, Map<String, dynamic> analysisResults); // Create scan Q&A session
  Future<Map<String, dynamic>> getScanQAForPatient(String scanId); // Get scan Q&A for patient
  Future<Map<String, dynamic>> addAnswerToQuestion(String scanId, String questionId, String answer); // Add answer to question
  Future<Map<String, dynamic>> markResultsShown(String scanId); // Mark results as shown
  Future<void> sendScanReportToDoctor({required String pdfPath, required Map<String, dynamic> scanResults, String? note}); // Send scan report to doctor
  Future<List<dynamic>> getDoctorSentReports(); // Get reports sent to patient by doctor
  Future<void> cancelAppointment(String appointmentId); // Cancel an appointment
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
      // Trim token to remove any whitespace
      final cleanToken = token.trim();
      headers['Authorization'] = 'Bearer $cleanToken';
      
      debugPrint(' Auth header - Token length: ${cleanToken.length}');
      debugPrint('   Token preview: ${cleanToken.substring(0, 20)}...');
    } else {
      debugPrint(' No token found in storage');
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
  Future<List<dynamic>> getRecentActivities() async {
    try {
      final headers = await _getHeaders();
      final response = await client.get(
        Uri.parse('${AppConstants.baseUrl}/appointments/patient/recent-activities'),
        headers: headers,
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data is List ? data : [];
      } else if (response.statusCode == 401) {
        throw InvalidCredentialsException();
      } else {
        throw ServerException('Failed to fetch recent activities', response.statusCode);
      }
    } on ServerException {
      rethrow;
    } on InvalidCredentialsException {
      rethrow;
    } catch (e) {
      if (e is ServerException || e is InvalidCredentialsException) {
        rethrow;
      }
      throw NetworkException('Network error occurred: ${e.toString()}');
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
  Future<dynamic> createBillFromAppointment(String appointmentId) async {
    try {
      final headers = await _getHeaders();
      final response = await client.post(
        Uri.parse('${AppConstants.baseUrl}/bills/from-appointment'),
        body: jsonEncode({'appointmentId': appointmentId}),
        headers: headers,
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        return jsonDecode(response.body);
      } else {
        final errorBody = jsonDecode(response.body);
        final errorMessage = errorBody['message'] ?? 'Failed to create bill';
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
      debugPrint('📥 Fetching messages from: ${AppConstants.baseUrl}/messages/patient/messages');
      
      final response = await client.get(
        Uri.parse('${AppConstants.baseUrl}/messages/patient/messages'),
        headers: headers,
      );

      debugPrint(' Messages response status: ${response.statusCode}');

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final messages = data is List ? data : (data['conversations'] ?? []);
        debugPrint(' Received ${messages.length} message conversations');
        return messages;
      } else {
        final errorBody = jsonDecode(response.body);
        debugPrint(' Messages API error: ${errorBody['message']}');
        throw ServerException('Failed to fetch messages', response.statusCode);
      }
    } catch (e) {
      debugPrint(' getMessages exception: $e');
      if (e is ServerException) {
        rethrow;
      }
      throw NetworkException('Network error occurred: $e');
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

  @override
  Future<dynamic> createReview(String doctorId, String? appointmentId, int rating, String? comment) async {
    try {
      // Check if token exists before making request
      final token = await localDataSource.getString(AppConstants.tokenKey);
      if (token == null || token.isEmpty) {
        debugPrint(' Create review: No token found');
        throw ServerException('Authentication required. Please login again.', 401);
      }
      
      debugPrint(' Create review: Token found (length: ${token.length})');
      
      final headers = await _getHeaders();
      
      // Verify Authorization header was added
      if (!headers.containsKey('Authorization') || headers['Authorization'] == null) {
        debugPrint(' Create review: Authorization header missing');
        throw ServerException('Authentication required. Please login again.', 401);
      }
      
      final body = {
        'doctorId': doctorId,
        'rating': rating,
        if (appointmentId != null) 'appointmentId': appointmentId,
        if (comment != null && comment.isNotEmpty) 'comment': comment,
      };
      
      debugPrint(' Create review request: POST ${AppConstants.baseUrl}/reviews');
      debugPrint('   Body: ${jsonEncode(body)}');
      
      final response = await client.post(
        Uri.parse('${AppConstants.baseUrl}/reviews'),
        body: jsonEncode(body),
        headers: headers,
      );

      debugPrint(' Create review response: ${response.statusCode}');
      debugPrint('   Body: ${response.body}');

      if (response.statusCode == 200 || response.statusCode == 201) {
        return jsonDecode(response.body);
      } else {
        final errorBody = jsonDecode(response.body);
        final errorMessage = errorBody['message'] ?? 'Failed to create review';
        
        // Handle token expiration specifically
        if (response.statusCode == 401) {
          debugPrint(' Create review: Unauthorized - token may be expired');
          throw ServerException(
            'Your session has expired. Please logout and login again.',
            response.statusCode
          );
        }
        
        throw ServerException(errorMessage, response.statusCode);
      }
    } catch (e) {
      if (e is ServerException) {
        rethrow;
      }
      debugPrint(' Create review exception: $e');
      throw NetworkException('Network error occurred: $e');
    }
  }

  @override
  Future<List<dynamic>> getDoctorReviews(String doctorId) async {
    try {
      final headers = await _getHeaders();
      final response = await client.get(
        Uri.parse('${AppConstants.baseUrl}/reviews/doctor/$doctorId'),
        headers: headers,
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        debugPrint(' Get reviews response: ${data is Map ? 'Map with ${data.keys}' : 'List'}');
        
        // Backend returns { reviews: [...], totalReviews: number, hasMore: boolean }
        if (data is Map && data.containsKey('reviews')) {
          final reviews = data['reviews'] as List? ?? [];
          debugPrint(' Found ${reviews.length} reviews');
          return reviews;
        } else if (data is List) {
          debugPrint(' Found ${data.length} reviews (direct list)');
          return data;
        } else {
          debugPrint(' Unexpected response format');
          return [];
        }
      } else {
        throw ServerException('Failed to fetch reviews', response.statusCode);
      }
    } catch (e) {
      debugPrint(' Error fetching reviews: $e');
      if (e is ServerException) {
        rethrow;
      }
      throw NetworkException('Network error occurred');
    }
  }

  @override
  Future<List<dynamic>> getPatientReviews() async {
    try {
      final headers = await _getHeaders();
      final response = await client.get(
        Uri.parse('${AppConstants.baseUrl}/reviews/patient'),
        headers: headers,
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data is List ? data : (data['reviews'] ?? []);
      } else {
        throw ServerException('Failed to fetch reviews', response.statusCode);
      }
    } catch (e) {
      if (e is ServerException) {
        rethrow;
      }
      throw NetworkException('Network error occurred');
    }
  }

  @override
  Future<List<dynamic>> getAnnouncements() async {
    try {
      final headers = await _getHeaders();
      final response = await client.get(
        Uri.parse('${AppConstants.baseUrl}/messages/patient/announcements'),
        headers: headers,
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        debugPrint(' Announcements loaded: ${data is List ? data.length : 0}');
        return data is List ? data : [];
      } else {
        throw ServerException('Failed to fetch announcements', response.statusCode);
      }
    } catch (e) {
      debugPrint(' Error fetching announcements: $e');
      if (e is ServerException) {
        rethrow;
      }
      throw NetworkException('Network error occurred');
    }
  }

  @override
  Future<void> markMessageAsRead(String messageId) async {
    try {
      final headers = await _getHeaders();
      final response = await client.put(
        Uri.parse('${AppConstants.baseUrl}/messages/$messageId/read'),
        headers: headers,
      );

      if (response.statusCode != 200) {
        throw ServerException('Failed to mark message as read', response.statusCode);
      }
    } catch (e) {
      debugPrint(' Error marking message as read: $e');
      // Don't throw - this is not critical
    }
  }

  @override
  Future<List<dynamic>> getNotifications() async {
    try {
      final headers = await _getHeaders();
      final response = await client.get(
        Uri.parse('${AppConstants.baseUrl}/notifications/patient'),
        headers: headers,
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        debugPrint(' Notifications loaded: ${data is List ? data.length : 0}');
        return data is List ? data : [];
      } else if (response.statusCode == 404) {
        // Route not found - backend may need restart, return empty gracefully
        debugPrint(' Notifications endpoint not found (404) - returning empty list');
        return [];
      } else {
        throw ServerException('Failed to fetch notifications', response.statusCode);
      }
    } catch (e) {
      debugPrint(' Error fetching notifications: $e');
      if (e is ServerException) {
        rethrow;
      }
      // Network errors - return empty instead of crashing
      return [];
    }
  }

  @override
  Future<void> markNotificationAsRead(String notificationId) async {
    try {
      final headers = await _getHeaders();
      final response = await client.put(
        Uri.parse('${AppConstants.baseUrl}/notifications/$notificationId/read'),
        headers: headers,
      );

      if (response.statusCode != 200) {
        throw ServerException('Failed to mark notification as read', response.statusCode);
      }
    } catch (e) {
      debugPrint(' Error marking notification as read: $e');
      if (e is ServerException) {
        rethrow;
      }
      throw NetworkException('Network error occurred');
    }
  }

  @override
  Future<void> markAllNotificationsAsRead() async {
    try {
      final headers = await _getHeaders();
      final response = await client.put(
        Uri.parse('${AppConstants.baseUrl}/notifications/read-all'),
        headers: headers,
      );

      if (response.statusCode != 200) {
        throw ServerException('Failed to mark all notifications as read', response.statusCode);
      }
    } catch (e) {
      debugPrint(' Error marking all notifications as read: $e');
      if (e is ServerException) {
        rethrow;
      }
      throw NetworkException('Network error occurred');
    }
  }

  @override
  Future<void> deleteNotification(String notificationId) async {
    try {
      final headers = await _getHeaders();
      final response = await client.delete(
        Uri.parse('${AppConstants.baseUrl}/notifications/$notificationId'),
        headers: headers,
      );

      if (response.statusCode != 200) {
        throw ServerException('Failed to delete notification', response.statusCode);
      }
    } catch (e) {
      debugPrint(' Error deleting notification: $e');
      if (e is ServerException) {
        rethrow;
      }
      throw NetworkException('Network error occurred');
    }
  }

  @override
  Future<List<dynamic>> searchHospitals({String? query, String? district}) async {
    try {
      // Hospital search is public, no auth required
      final uri = Uri.parse('${AppConstants.baseUrl}/hospitals/search').replace(
        queryParameters: {
          if (query != null && query.isNotEmpty) 'query': query,
          if (district != null && district.isNotEmpty) 'district': district,
        },
      );
      
      final response = await client.get(uri);

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        debugPrint(' Hospitals search response: ${data is Map ? 'Map' : 'List'}');
        
        if (data is Map && data.containsKey('hospitals')) {
          final hospitals = data['hospitals'] as List? ?? [];
          debugPrint(' Found ${hospitals.length} hospitals');
          return hospitals;
        } else if (data is List) {
          debugPrint(' Found ${data.length} hospitals (direct list)');
          return data;
        } else {
          debugPrint(' Unexpected response format');
          return [];
        }
      } else {
        throw ServerException('Failed to search hospitals', response.statusCode);
      }
    } catch (e) {
      debugPrint(' Error searching hospitals: $e');
      if (e is ServerException) {
        rethrow;
      }
      throw NetworkException('Network error occurred');
    }
  }

  @override
  Future<List<dynamic>> getHospitalsByDistrict(String district) async {
    try {
      final response = await client.get(
        Uri.parse('${AppConstants.baseUrl}/hospitals/district/$district'),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data is Map && data.containsKey('hospitals')) {
          return data['hospitals'] as List? ?? [];
        } else if (data is List) {
          return data;
        }
        return [];
      } else {
        throw ServerException('Failed to fetch hospitals by district', response.statusCode);
      }
    } catch (e) {
      debugPrint(' Error fetching hospitals by district: $e');
      if (e is ServerException) {
        rethrow;
      }
      throw NetworkException('Network error occurred');
    }
  }

  @override
  Future<List<dynamic>> getDistrictsWithCounts() async {
    try {
      final response = await client.get(
        Uri.parse('${AppConstants.baseUrl}/hospitals/districts'),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data is Map && data.containsKey('districts')) {
          return data['districts'] as List? ?? [];
        } else if (data is List) {
          return data;
        }
        return [];
      } else {
        throw ServerException('Failed to fetch districts', response.statusCode);
      }
    } catch (e) {
      debugPrint(' Error fetching districts: $e');
      if (e is ServerException) {
        rethrow;
      }
      throw NetworkException('Network error occurred');
    }
  }

  @override
  Future<Map<String, dynamic>> getWalletBalance() async {
    try {
      final headers = await _getHeaders();
      final response = await client.get(
        Uri.parse('${AppConstants.baseUrl}/wallet/balance'),
        headers: headers,
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body) as Map<String, dynamic>;
      } else {
        throw ServerException('Failed to fetch wallet balance', response.statusCode);
      }
    } catch (e) {
      debugPrint(' Error fetching wallet balance: $e');
      if (e is ServerException) {
        rethrow;
      }
      throw NetworkException('Network error occurred');
    }
  }

  @override
  Future<Map<String, dynamic>> topUpWallet(int amount, String paymentMethod, Map<String, dynamic>? cardDetails) async {
    try {
      final headers = await _getHeaders();
      final body = {
        'amount': amount,
        'paymentMethod': paymentMethod,
        if (cardDetails != null) 'cardDetails': cardDetails,
      };

      final response = await client.post(
        Uri.parse('${AppConstants.baseUrl}/wallet/topup'),
        headers: headers,
        body: jsonEncode(body),
      );

      if (response.statusCode == 201 || response.statusCode == 200) {
        return jsonDecode(response.body) as Map<String, dynamic>;
      } else {
        final error = jsonDecode(response.body);
        throw ServerException(error['message'] ?? 'Failed to top up wallet', response.statusCode);
      }
    } catch (e) {
      debugPrint(' Error topping up wallet: $e');
      if (e is ServerException) {
        rethrow;
      }
      throw NetworkException('Network error occurred');
    }
  }

  @override
  Future<Map<String, dynamic>> payBillWithWallet(String billId) async {
    try {
      final headers = await _getHeaders();
      final body = {'billId': billId};

      final response = await client.post(
        Uri.parse('${AppConstants.baseUrl}/wallet/pay-bill'),
        headers: headers,
        body: jsonEncode(body),
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body) as Map<String, dynamic>;
      } else {
        final error = jsonDecode(response.body);
        throw ServerException(error['message'] ?? 'Failed to pay bill', response.statusCode);
      }
    } catch (e) {
      debugPrint(' Error paying bill with wallet: $e');
      if (e is ServerException) {
        rethrow;
      }
      throw NetworkException('Network error occurred');
    }
  }

  @override
  Future<Map<String, dynamic>> payAppointmentWithWallet(String appointmentId, double amount) async {
    try {
      final headers = await _getHeaders();
      final body = {
        'appointmentId': appointmentId,
        'amount': amount,
      };

      final response = await client.post(
        Uri.parse('${AppConstants.baseUrl}/wallet/pay-appointment'),
        headers: headers,
        body: jsonEncode(body),
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body) as Map<String, dynamic>;
      } else {
        final error = jsonDecode(response.body);
        throw ServerException(error['message'] ?? 'Failed to pay appointment', response.statusCode);
      }
    } catch (e) {
      debugPrint('❌ Error paying appointment with wallet: $e');
      if (e is ServerException) {
        rethrow;
      }
      throw NetworkException('Network error occurred');
    }
  }

  @override
  Future<List<dynamic>> getWalletTransactions() async {
    try {
      final headers = await _getHeaders();
      final response = await client.get(
        Uri.parse('${AppConstants.baseUrl}/wallet/transactions'),
        headers: headers,
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data is List) {
          return data;
        }
        return [];
      } else {
        throw ServerException('Failed to fetch wallet transactions', response.statusCode);
      }
    } catch (e) {
      debugPrint(' Error fetching wallet transactions: $e');
      if (e is ServerException) {
        rethrow;
      }
      throw NetworkException('Network error occurred');
    }
  }

  @override
  Future<Map<String, dynamic>> uploadTeethScan(String imagePath) async {
    try {
      // Try to get token, but don't fail if not available (for testing without login)
      final token = await localDataSource.getString(AppConstants.tokenKey);

      // Create multipart request
      final request = http.MultipartRequest(
        'POST',
        Uri.parse('${AppConstants.baseUrl}/ai-scan/teeth-scan'),
      );

      // Add authorization header if token is available
      if (token != null && token.isNotEmpty) {
        request.headers['Authorization'] = 'Bearer ${token.trim()}';
      }

      // Add image file
      final imageFile = File(imagePath);
      if (!await imageFile.exists()) {
        throw ServerException('Image file not found', 400);
      }

      final fileStream = imageFile.openRead();
      final fileLength = await imageFile.length();
      
      // Determine content type based on file extension
      String contentType = 'image/jpeg'; // default
      final extension = imagePath.toLowerCase().split('.').last;
      if (extension == 'png') {
        contentType = 'image/png';
      } else if (extension == 'jpg' || extension == 'jpeg') {
        contentType = 'image/jpeg';
      } else if (extension == 'gif') {
        contentType = 'image/gif';
      }
      
      final multipartFile = http.MultipartFile(
        'image',
        fileStream,
        fileLength,
        filename: imagePath.split('/').last,
        contentType: MediaType.parse(contentType),
      );
      request.files.add(multipartFile);

      // Send request
      final streamedResponse = await client.send(request);
      final response = await http.Response.fromStream(streamedResponse);

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data as Map<String, dynamic>;
      } else {
        String errorMessage = 'Failed to process teeth scan';
        try {
          final errorBody = jsonDecode(response.body);
          errorMessage = errorBody['message'] ?? errorBody['error'] ?? errorMessage;
          debugPrint('❌ AI Scan error details: ${errorBody}');
        } catch (e) {
          debugPrint('❌ Failed to parse error response: $e');
          errorMessage = 'Server error (Status ${response.statusCode})';
        }
        throw ServerException(errorMessage, response.statusCode);
      }
    } catch (e) {
      debugPrint('Error uploading teeth scan: $e');
      if (e is ServerException) {
        rethrow;
      }
      throw NetworkException('Network error occurred');
    }
  }

  @override
  Future<Map<String, dynamic>> createScanQA(String imageUrl, Map<String, dynamic> analysisResults) async {
    try {
      final headers = await _getHeaders();
      final body = {
        'imageUrl': imageUrl,
        'analysisResults': analysisResults,
      };
      
      final response = await client.post(
        Uri.parse('${AppConstants.baseUrl}/scan-qa'),
        body: jsonEncode(body),
        headers: headers,
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        return jsonDecode(response.body) as Map<String, dynamic>;
      } else {
        final errorBody = jsonDecode(response.body);
        final errorMessage = errorBody['message'] ?? 'Failed to create scan Q&A';
        throw ServerException(errorMessage, response.statusCode);
      }
    } catch (e) {
      print(e);
      if (e is ServerException) {
        rethrow;
      }
      throw NetworkException('Network error occurred');
    }
  }

  @override
  Future<Map<String, dynamic>> getScanQAForPatient(String scanId) async {
    try {
      final headers = await _getHeaders();
      final response = await client.get(
        Uri.parse('${AppConstants.baseUrl}/scan-qa/$scanId/patient'),
        headers: headers,
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body) as Map<String, dynamic>;
      } else {
        final errorBody = jsonDecode(response.body);
        final errorMessage = errorBody['message'] ?? 'Failed to get scan Q&A';
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
  Future<Map<String, dynamic>> addAnswerToQuestion(String scanId, String questionId, String answer) async {
    try {
      final headers = await _getHeaders();
      final body = {
        'answer': answer,
      };
      
      final response = await client.post(
        Uri.parse('${AppConstants.baseUrl}/scan-qa/$scanId/question/$questionId/answer'),
        body: jsonEncode(body),
        headers: headers,
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body) as Map<String, dynamic>;
      } else {
        final errorBody = jsonDecode(response.body);
        final errorMessage = errorBody['message'] ?? 'Failed to add answer';
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
  Future<Map<String, dynamic>> markResultsShown(String scanId) async {
    try {
      final headers = await _getHeaders();
      final response = await client.post(
        Uri.parse('${AppConstants.baseUrl}/scan-qa/$scanId/mark-shown'),
        headers: headers,
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body) as Map<String, dynamic>;
      } else {
        final errorBody = jsonDecode(response.body);
        final errorMessage = errorBody['message'] ?? 'Failed to mark results as shown';
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
  Future<void> sendScanReportToDoctor({
    required String pdfPath,
    required Map<String, dynamic> scanResults,
    String? note,
  }) async {
    try {
      final token = await localDataSource.getString(AppConstants.tokenKey);
      if (token == null || token.isEmpty) {
        throw ServerException('Authentication required. Please login again.', 401);
      }

      final uri = Uri.parse('${AppConstants.baseUrl}/scan-qa/send-report');
      final request = http.MultipartRequest('POST', uri);
      request.headers['Authorization'] = 'Bearer ${token.trim()}';

      // Attach PDF file
      request.files.add(await http.MultipartFile.fromPath(
        'report',
        pdfPath,
        contentType: MediaType('application', 'pdf'),
      ));

      // Attach scan results as JSON
      request.fields['scanResults'] = jsonEncode(scanResults);
      if (note != null && note.isNotEmpty) {
        request.fields['note'] = note;
      }

      final streamedResponse = await request.send();
      final response = await http.Response.fromStream(streamedResponse);

      if (response.statusCode != 200 && response.statusCode != 201) {
        final errorBody = jsonDecode(response.body);
        throw ServerException(
          errorBody['message'] ?? 'Failed to send report',
          response.statusCode,
        );
      }
    } catch (e) {
      if (e is ServerException) rethrow;
      throw NetworkException('Network error occurred: $e');
    }
  }

  @override
  Future<List<dynamic>> getDoctorSentReports() async {
    try {
      final headers = await _getHeaders();
      final response = await client.get(
        Uri.parse('${AppConstants.baseUrl}/scan-qa/patient/sent-reports'),
        headers: headers,
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return (data['reports'] as List?) ?? [];
      } else {
        throw ServerException('Failed to fetch doctor reports', response.statusCode);
      }
    } catch (e) {
      if (e is ServerException) rethrow;
      throw NetworkException('Network error occurred');
    }
  }

  @override
  Future<void> cancelAppointment(String appointmentId) async {
    try {
      final headers = await _getHeaders();
      final response = await client.put(
        Uri.parse('${AppConstants.baseUrl}/appointments/$appointmentId'),
        headers: headers,
        body: jsonEncode({'status': 'cancelled'}),
      );

      if (response.statusCode != 200) {
        final errorBody = jsonDecode(response.body);
        throw ServerException(
          errorBody['message'] ?? 'Failed to cancel appointment',
          response.statusCode,
        );
      }
    } catch (e) {
      if (e is ServerException) rethrow;
      throw NetworkException('Network error occurred: $e');
    }
  }
}