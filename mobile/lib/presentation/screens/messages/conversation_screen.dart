import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_application_1/core/constants/app_constants.dart';
import 'package:flutter_application_1/core/services/socket_service.dart';
import 'package:flutter_application_1/core/themes/colors.dart';
import 'package:flutter_application_1/core/themes/text_styles.dart';
import 'package:flutter_application_1/data/data_sources/local/shared_prefs.dart';
import 'package:flutter_application_1/data/data_sources/remote/dental_remote_data_source.dart';
import 'package:flutter_application_1/injection_container.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;

class ConversationScreen extends StatefulWidget {
  final String doctorId;
  final String doctorName;

  const ConversationScreen({
    super.key,
    required this.doctorId,
    required this.doctorName,
  });

  @override
  State<ConversationScreen> createState() => _ConversationScreenState();
}

class _ConversationScreenState extends State<ConversationScreen> {
  List<Map<String, dynamic>> _messages = [];
  bool _isLoading = true;
  bool _isSending = false;
  bool _isConnected = false;
  String? _patientId;

  final TextEditingController _messageController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  // Use global SocketService instead of own socket
  late final SocketService _socketService;

  late final DentalRemoteDataSource _dentalDataSource;

  @override
  void initState() {
    super.initState();
    _dentalDataSource = getIt<DentalRemoteDataSource>();
    _socketService = getIt<SocketService>();
    _socketService.addMessageListener(_onNewMessage);
    _isConnected = _socketService.isConnected;
    _init();
  }

  Future<void> _init() async {
    await _resolvePatientId();
    await _loadConversation();
    // Ensure socket is connected (HomeScreen may have already done this)
    final localData = getIt<LocalDataSource>();
    await _socketService.connect(localData);
    if (mounted) setState(() => _isConnected = _socketService.isConnected);
  }

  void _onNewMessage(Map<String, dynamic> msg) {
    if (!mounted) return;
    final senderId = msg['sender']?['_id']?.toString() ?? msg['sender']?.toString() ?? '';
    final receiverId = msg['receiver']?['_id']?.toString() ?? msg['receiver']?.toString() ?? '';
    final isRelevant = senderId == widget.doctorId || receiverId == widget.doctorId ||
        senderId == _patientId || receiverId == _patientId;
    if (!isRelevant) return;

    final senderModel = msg['senderModel']?.toString() ?? '';
    final newMsgId = msg['_id']?.toString() ?? '';

    setState(() {
      // If this is our own message coming back via socket, replace the optimistic entry
      if (senderModel == 'Patient') {
        final tempIdx = _messages.indexWhere((m) =>
            (m['id'] as String).startsWith('temp_') && m['message'] == msg['message']?.toString());
        if (tempIdx != -1) {
          // Replace optimistic with confirmed message
          _messages[tempIdx] = {
            'id': newMsgId,
            'message': msg['message']?.toString() ?? '',
            'sender': senderModel,
            'time': msg['createdAt']?.toString() ?? DateTime.now().toIso8601String(),
            'read': false,
          };
          return;
        }
      }
      // Avoid duplicate: don't add if message id already exists
      if (newMsgId.isNotEmpty && _messages.any((m) => m['id'] == newMsgId)) return;

      _messages.add({
        'id': newMsgId,
        'message': msg['message']?.toString() ?? '',
        'sender': senderModel,
        'time': msg['createdAt']?.toString() ?? DateTime.now().toIso8601String(),
        'read': false,
      });
    });
    _scrollToBottom();
  }

  Future<void> _resolvePatientId() async {
    try {
      final local = getIt<LocalDataSource>();
      final token = await local.getString(AppConstants.tokenKey);
      if (token == null) return;
      final parts = token.split('.');
      if (parts.length != 3) return;
      String b64 = parts[1].replaceAll('-', '+').replaceAll('_', '/');
      switch (b64.length % 4) {
        case 2: b64 += '=='; break;
        case 3: b64 += '='; break;
      }
      final payload = jsonDecode(utf8.decode(base64Decode(b64)));
      _patientId = payload['id']?.toString();
    } catch (_) {}
  }

  Future<void> _loadConversation() async {
    if (!mounted) return;
    setState(() => _isLoading = _messages.isEmpty);

    try {
      final messages = await _dentalDataSource.getConversation(widget.doctorId);

      // Mark doctor messages as read
      for (var msg in messages) {
        final isRead = msg['read'] ?? false;
        final messageId = msg['_id']?.toString() ?? msg['id']?.toString();
        final senderModel = msg['senderModel']?.toString();
        if (!isRead && messageId != null && senderModel == 'Doctor') {
          _dentalDataSource.markMessageAsRead(messageId).catchError((_) {});
        }
      }

      if (mounted) {
        setState(() {
          _messages = messages.map<Map<String, dynamic>>((msg) => {
            'id': msg['_id']?.toString() ?? '',
            'message': msg['message']?.toString() ?? '',
            'sender': msg['senderModel']?.toString() ?? '',
            'time': msg['createdAt']?.toString() ?? '',
            'read': true,
          }).toList();
          _isLoading = false;
        });
        _scrollToBottom();
      }
    } catch (e) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  Future<void> _sendMessage() async {
    final text = _messageController.text.trim();
    if (text.isEmpty || _isSending) return;
    _messageController.clear();
    setState(() => _isSending = true);

    // Optimistic UI
    final optimistic = {
      'id': 'temp_${DateTime.now().millisecondsSinceEpoch}',
      'message': text,
      'sender': 'Patient',
      'time': DateTime.now().toIso8601String(),
      'read': false,
    };
    setState(() => _messages.add(optimistic));
    _scrollToBottom();

    try {
      await _dentalDataSource.sendMessage(widget.doctorId, text);
    } catch (e) {
      // Remove optimistic message on failure
      if (mounted) {
        setState(() => _messages.removeWhere((m) => m['id'] == optimistic['id']));
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to send message.'), backgroundColor: Colors.red),
        );
        _messageController.text = text;
      }
    } finally {
      if (mounted) setState(() => _isSending = false);
    }
  }

  @override
  void dispose() {
    _socketService.removeMessageListener(_onNewMessage);
    _messageController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(widget.doctorName,
                style: TextStyles.bodyLarge.copyWith(color: AppColors.white, fontWeight: FontWeight.bold)),
            Row(
              children: [
                Container(
                  width: 8, height: 8,
                  margin: const EdgeInsets.only(right: 4),
                  decoration: BoxDecoration(
                    color: _socketService.isConnected ? Colors.greenAccent : Colors.grey[400],
                    shape: BoxShape.circle,
                  ),
                ),
                Text(
                  _socketService.isConnected ? 'Connected' : 'Connecting...',
                  style: TextStyles.caption.copyWith(color: AppColors.white.withOpacity(0.85), fontSize: 11),
                ),
              ],
            ),
          ],
        ),
        backgroundColor: AppColors.primary,
        foregroundColor: AppColors.white,
        actions: [
          IconButton(icon: const Icon(Icons.refresh), onPressed: _loadConversation),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _messages.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.message_outlined, size: 64, color: AppColors.grey300),
                            const SizedBox(height: 16),
                            Text('No messages yet', style: TextStyles.bodyMedium.copyWith(color: AppColors.textSecondary)),
                            const SizedBox(height: 8),
                            Text('Start a conversation with ${widget.doctorName}', style: TextStyles.caption),
                          ],
                        ),
                      )
                    : ListView.builder(
                        controller: _scrollController,
                        padding: const EdgeInsets.all(16),
                        itemCount: _messages.length,
                        itemBuilder: (_, i) {
                          final msg = _messages[i];
                          final isMe = msg['sender'] == 'Patient';
                          return Align(
                            alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
                            child: Container(
                              margin: const EdgeInsets.only(bottom: 10),
                              constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.75),
                              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                              decoration: BoxDecoration(
                                color: isMe ? AppColors.primary : AppColors.grey100,
                                borderRadius: BorderRadius.only(
                                  topLeft: const Radius.circular(18),
                                  topRight: const Radius.circular(18),
                                  bottomLeft: Radius.circular(isMe ? 18 : 4),
                                  bottomRight: Radius.circular(isMe ? 4 : 18),
                                ),
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    msg['message'] as String? ?? '',
                                    style: TextStyles.bodyMedium.copyWith(
                                      color: isMe ? AppColors.white : AppColors.textPrimary,
                                    ),
                                  ),
                                  const SizedBox(height: 3),
                                  Text(
                                    _formatTime(msg['time'] as String? ?? ''),
                                    style: TextStyles.caption.copyWith(
                                      color: isMe ? AppColors.white.withOpacity(0.7) : AppColors.textSecondary,
                                      fontSize: 10,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
          ),
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: AppColors.white,
              boxShadow: [BoxShadow(color: AppColors.grey200, blurRadius: 4, offset: const Offset(0, -2))],
            ),
            child: SafeArea(
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _messageController,
                      decoration: InputDecoration(
                        hintText: 'Type a message...',
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(24),
                          borderSide: BorderSide(color: AppColors.grey300),
                        ),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                      ),
                      maxLines: null,
                      textInputAction: TextInputAction.send,
                      onSubmitted: (_) => _sendMessage(),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Container(
                    decoration: BoxDecoration(color: AppColors.primary, shape: BoxShape.circle),
                    child: IconButton(
                      icon: _isSending
                          ? const SizedBox(width: 20, height: 20,
                              child: CircularProgressIndicator(strokeWidth: 2,
                                  valueColor: AlwaysStoppedAnimation<Color>(Colors.white)))
                          : const Icon(Icons.send, color: AppColors.white),
                      onPressed: _isSending ? null : _sendMessage,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  String _formatTime(String dateTime) {
    if (dateTime.isEmpty) return '';
    try {
      final dt = DateTime.parse(dateTime).toUtc().add(const Duration(hours: 5, minutes: 30));
      return '${dt.hour.toString().padLeft(2, '0')}:${dt.minute.toString().padLeft(2, '0')}';
    } catch (_) {
      return '';
    }
  }
}
