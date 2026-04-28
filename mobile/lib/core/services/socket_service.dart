import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter_application_1/core/constants/app_constants.dart';
import 'package:flutter_application_1/data/data_sources/local/shared_prefs.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;

/// Global singleton socket service for real-time events
class SocketService {
  static final SocketService _instance = SocketService._internal();
  factory SocketService() => _instance;
  SocketService._internal();

  IO.Socket? _socket;
  String? _patientId;
  bool _connected = false;

  bool get isConnected => _connected;

  // Listeners
  final List<void Function(Map<String, dynamic>)> _messageListeners = [];
  final List<void Function(Map<String, dynamic>)> _notificationListeners = [];
  final List<void Function(Map<String, dynamic>)> _scanQuestionListeners = [];

  void addMessageListener(void Function(Map<String, dynamic>) fn) => _messageListeners.add(fn);
  void removeMessageListener(void Function(Map<String, dynamic>) fn) => _messageListeners.remove(fn);
  void addNotificationListener(void Function(Map<String, dynamic>) fn) => _notificationListeners.add(fn);
  void removeNotificationListener(void Function(Map<String, dynamic>) fn) => _notificationListeners.remove(fn);
  void addScanQuestionListener(void Function(Map<String, dynamic>) fn) => _scanQuestionListeners.add(fn);
  void removeScanQuestionListener(void Function(Map<String, dynamic>) fn) => _scanQuestionListeners.remove(fn);

  Future<void> connect(LocalDataSource localData) async {
    if (_socket != null && _connected) return;

    try {
      final token = await localData.getString(AppConstants.tokenKey);
      if (token == null) return;

      // Decode patient ID from JWT
      final parts = token.split('.');
      if (parts.length != 3) return;
      String b64 = parts[1].replaceAll('-', '+').replaceAll('_', '/');
      switch (b64.length % 4) {
        case 2: b64 += '=='; break;
        case 3: b64 += '='; break;
      }
      final payload = jsonDecode(utf8.decode(base64Decode(b64)));
      _patientId = payload['id']?.toString();
      if (_patientId == null) return;

      final socketUrl = AppConstants.baseUrl.replaceAll('/api', '');
      _socket = IO.io(socketUrl, IO.OptionBuilder()
          .setTransports(['websocket', 'polling'])
          .disableAutoConnect()
          .build());

      _socket!.connect();

      _socket!.onConnect((_) {
        _connected = true;
        _socket!.emit('join', {'userId': _patientId, 'userType': 'Patient'});
        debugPrint('🔌 SocketService connected, joined Patient_$_patientId');
      });

      _socket!.onDisconnect((_) {
        _connected = false;
        debugPrint('🔌 SocketService disconnected');
      });

      _socket!.on('new_message', (data) {
        final msg = Map<String, dynamic>.from(data as Map);
        for (final fn in List.of(_messageListeners)) fn(msg);
      });

      _socket!.on('notification', (data) {
        final notif = Map<String, dynamic>.from(data as Map);
        debugPrint('🔔 Socket notification received: ${notif['title']}');
        for (final fn in List.of(_notificationListeners)) fn(notif);
      });

      _socket!.on('scan_question', (data) {
        final event = Map<String, dynamic>.from(data as Map);
        debugPrint('🦷 Scan question received: ${event['scanId']}');
        for (final fn in List.of(_scanQuestionListeners)) fn(event);
      });
    } catch (e) {
      debugPrint('SocketService connect error: $e');
    }
  }

  void disconnect() {
    _socket?.disconnect();
    _socket?.dispose();
    _socket = null;
    _connected = false;
    _messageListeners.clear();
    _notificationListeners.clear();
    _scanQuestionListeners.clear();
  }
}
