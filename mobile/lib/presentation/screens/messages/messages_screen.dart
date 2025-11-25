// lib/presentation/screens/messages/messages_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_application_1/core/themes/colors.dart';
import 'package:flutter_application_1/core/themes/text_styles.dart';
import 'package:flutter_application_1/data/data_sources/remote/dental_remote_data_source.dart';
import 'package:flutter_application_1/injection_container.dart';
import 'conversation_screen.dart';

class MessagesScreen extends StatefulWidget {
  final String? filterType; // Filter by announcement type: 'general', 'important', 'reminder'
  
  const MessagesScreen({super.key, this.filterType});

  @override
  State<MessagesScreen> createState() => _MessagesScreenState();
}

class _MessagesScreenState extends State<MessagesScreen> {
  List<Map<String, dynamic>> _conversations = [];
  List<dynamic> _announcements = [];
  bool _isLoading = true;
  String? _errorMessage;
  bool _showAnnouncements = false; // Toggle between messages and announcements

  late final DentalRemoteDataSource _dentalDataSource;

  @override
  void initState() {
    super.initState();
    _dentalDataSource = getIt<DentalRemoteDataSource>();
    // If filterType is provided, show announcements filtered by type
    if (widget.filterType != null) {
      _showAnnouncements = true;
      _loadAnnouncements();
    } else {
      _loadMessages();
    }
  }

  Future<void> _loadMessages() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final conversations = await _dentalDataSource.getMessages();
      debugPrint('Conversations loaded: ${conversations.length} conversations');
      
      setState(() {
        _conversations = conversations.map<Map<String, dynamic>>((conv) {
          return {
            'doctorId': conv['doctorId']?.toString() ?? '',
            'doctorName': conv['doctorName']?.toString() ?? 'Unknown Doctor',
            'doctorEmail': conv['doctorEmail']?.toString() ?? '',
            'lastMessage': conv['lastMessage']?.toString() ?? '',
            'lastMessageTime': conv['lastMessageTime']?.toString() ?? '',
            'unreadCount': conv['unreadCount'] ?? 0,
            'messages': conv['messages'] ?? [],
          };
        }).toList();
        _isLoading = false;
      });
    } catch (e) {
      debugPrint('Error loading messages: $e');
      setState(() {
        _errorMessage = 'Failed to load messages. Please try again.';
        _isLoading = false;
        _conversations = [];
      });
    }
  }

  Future<void> _loadAnnouncements() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final announcements = await _dentalDataSource.getAnnouncements();
      debugPrint('Announcements loaded: ${announcements.length}');
      
      // Filter by type if filterType is provided
      List<dynamic> filtered = announcements;
      if (widget.filterType != null) {
        filtered = announcements.where((announcement) {
          final type = announcement['announcementType'] as String?;
          if (widget.filterType == 'general') {
            return type == 'general' || type == null;
          }
          return type == widget.filterType;
        }).toList();
      }
      
      setState(() {
        _announcements = filtered;
        _isLoading = false;
      });
    } catch (e) {
      debugPrint('Error loading announcements: $e');
      setState(() {
        _errorMessage = 'Failed to load announcements. Please try again.';
        _isLoading = false;
        _announcements = [];
      });
    }
  }

  String _getAnnouncementTypeLabel(String? type) {
    switch (type) {
      case 'important':
        return 'Important';
      case 'reminder':
        return 'Reminder';
      default:
        return 'General';
    }
  }

  Color _getAnnouncementTypeColor(String? type) {
    switch (type) {
      case 'important':
        return Colors.red;
      case 'reminder':
        return Colors.orange;
      default:
        return AppColors.primary;
    }
  }

  @override
  Widget build(BuildContext context) {
    final String title = widget.filterType != null 
        ? _getAnnouncementTypeLabel(widget.filterType).toUpperCase() 
        : 'Messages';
    
    return Scaffold(
      appBar: AppBar(
        title: Text(title),
        backgroundColor: AppColors.primary,
        foregroundColor: AppColors.white,
        actions: [
          if (widget.filterType == null)
            IconButton(
              icon: const Icon(Icons.announcement),
              onPressed: () {
                Navigator.pushNamed(context, '/announcements');
              },
              tooltip: 'Announcements',
            ),
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _showAnnouncements ? _loadAnnouncements : _loadMessages,
            tooltip: 'Refresh',
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _errorMessage != null
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.error_outline, size: 64, color: AppColors.grey300),
                      const SizedBox(height: 16),
                      Text(
                        _errorMessage!,
                        style: TextStyles.bodyMedium.copyWith(
                          color: AppColors.textSecondary,
                        ),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 16),
                      ElevatedButton(
                        onPressed: _showAnnouncements ? _loadAnnouncements : _loadMessages,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.primary,
                          foregroundColor: AppColors.white,
                        ),
                        child: const Text('Retry'),
                      ),
                    ],
                  ),
                )
              : _showAnnouncements
                  ? RefreshIndicator(
                      onRefresh: _loadAnnouncements,
                      child: _announcements.isEmpty
                          ? Center(
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(Icons.announcement_outlined, size: 64, color: AppColors.grey300),
                                  const SizedBox(height: 16),
                                  Text(
                                    'No ${_getAnnouncementTypeLabel(widget.filterType)} announcements',
                                    style: TextStyles.bodyMedium.copyWith(
                                      color: AppColors.textSecondary,
                                    ),
                                  ),
                                ],
                              ),
                            )
                          : ListView.builder(
                              padding: const EdgeInsets.all(16),
                              itemCount: _announcements.length,
                              itemBuilder: (context, index) {
                                final announcement = _announcements[index];
                                final doctor = announcement['sender'] as Map<String, dynamic>?;
                                final doctorId = doctor?['_id']?.toString() ?? doctor?['id']?.toString() ?? '';
                                final doctorName = doctor?['fullName'] as String? ?? 'Unknown Doctor';
                                final message = announcement['message'] as String? ?? '';
                                final type = announcement['announcementType'] as String?;
                                final createdAt = announcement['createdAt'] as String?;
                                final typeColor = _getAnnouncementTypeColor(type);

                                DateTime? date;
                                if (createdAt != null) {
                                  try {
                                    final utcDate = DateTime.parse(createdAt).toUtc();
                                    date = utcDate.add(const Duration(hours: 5, minutes: 30));
                                  } catch (e) {
                                    debugPrint('Error parsing date: $e');
                                  }
                                }

                                return Card(
                                  margin: const EdgeInsets.only(bottom: 16),
                                  elevation: 2,
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: InkWell(
                                    onTap: doctorId.isNotEmpty
                                        ? () {
                                            Navigator.push(
                                              context,
                                              MaterialPageRoute(
                                                builder: (context) => ConversationScreen(
                                                  doctorId: doctorId,
                                                  doctorName: doctorName,
                                                ),
                                              ),
                                            );
                                          }
                                        : null,
                                    borderRadius: BorderRadius.circular(12),
                                    child: Padding(
                                      padding: const EdgeInsets.all(20),
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Row(
                                            children: [
                                              Container(
                                                width: 24,
                                                height: 24,
                                                decoration: BoxDecoration(
                                                  color: typeColor.withValues(alpha: 0.15),
                                                  shape: BoxShape.circle,
                                                ),
                                                child: Icon(
                                                  type == 'important'
                                                      ? Icons.priority_high
                                                      : type == 'reminder'
                                                          ? Icons.notifications
                                                          : Icons.info_outline,
                                                  color: typeColor,
                                                  size: 14,
                                                ),
                                              ),
                                              const SizedBox(width: 8),
                                              Text(
                                                _getAnnouncementTypeLabel(type),
                                                style: TextStyles.bodySmall.copyWith(
                                                  color: typeColor,
                                                  fontWeight: FontWeight.w600,
                                                ),
                                              ),
                                            ],
                                          ),
                                          const SizedBox(height: 1),
                                          Text(
                                            doctorName,
                                            style: TextStyles.heading3.copyWith(
                                              fontWeight: FontWeight.bold,
                                            ),
                                          ),
                                          if (date != null) ...[
                                            const SizedBox(height: 6),
                                            Text(
                                              '${date.day}/${date.month}/${date.year}',
                                              style: TextStyles.bodySmall.copyWith(
                                                color: AppColors.textSecondary,
                                              ),
                                            ),
                                          ],
                                          const SizedBox(height: 16),
                                          Container(
                                            width: double.infinity,
                                            padding: const EdgeInsets.all(16),
                                            decoration: BoxDecoration(
                                              color: AppColors.grey100,
                                              borderRadius: BorderRadius.circular(8),
                                            ),
                                            child: Text(
                                              message,
                                              style: TextStyles.bodyMedium,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ),
                                );
                              },
                            ),
                    )
                  : RefreshIndicator(
                      onRefresh: _loadMessages,
                      child: _conversations.isEmpty
                          ? Center(
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(Icons.message_outlined, size: 64, color: AppColors.grey300),
                                  const SizedBox(height: 16),
                                  Text(
                                    'No messages yet',
                                    style: TextStyles.bodyMedium.copyWith(
                                      color: AppColors.textSecondary,
                                    ),
                                  ),
                                  const SizedBox(height: 8),
                                  Text(
                                    'Messages from doctors will appear here',
                                    style: TextStyles.caption,
                                  ),
                                ],
                              ),
                            )
                          : ListView.builder(
                              padding: const EdgeInsets.all(16),
                              itemCount: _conversations.length,
                              itemBuilder: (context, index) {
                                final conv = _conversations[index];
                                final unreadCount = conv['unreadCount'] as int? ?? 0;
                                
                                return Card(
                                  margin: const EdgeInsets.only(bottom: 12),
                                  child: ListTile(
                                    leading: CircleAvatar(
                                      backgroundColor: AppColors.primary.withValues(alpha: 0.1),
                                      child: Text(
                                        (conv['doctorName'] as String? ?? 'D')[0].toUpperCase(),
                                        style: TextStyles.bodyMedium.copyWith(
                                          color: AppColors.primary,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    ),
                                    title: Row(
                                      children: [
                                        Expanded(
                                          child: Text(
                                            conv['doctorName'] as String? ?? 'Unknown Doctor',
                                            style: TextStyles.bodyMedium.copyWith(
                                              fontWeight: unreadCount > 0 ? FontWeight.bold : FontWeight.normal,
                                            ),
                                          ),
                                        ),
                                        if (unreadCount > 0)
                                          Container(
                                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                            decoration: BoxDecoration(
                                              color: AppColors.primary,
                                              borderRadius: BorderRadius.circular(12),
                                            ),
                                            child: Text(
                                              unreadCount.toString(),
                                              style: TextStyles.caption.copyWith(
                                                color: AppColors.white,
                                                fontWeight: FontWeight.bold,
                                              ),
                                            ),
                                          ),
                                      ],
                                    ),
                                    subtitle: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        const SizedBox(height: 4),
                                        Text(
                                          conv['lastMessage'] as String? ?? '',
                                          style: TextStyles.caption,
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                        const SizedBox(height: 4),
                                        Text(
                                          _formatTime(conv['lastMessageTime'] as String? ?? ''),
                                          style: TextStyles.caption.copyWith(
                                            color: AppColors.textSecondary,
                                            fontSize: 11,
                                          ),
                                        ),
                                      ],
                                    ),
                                    onTap: () {
                                      Navigator.push(
                                        context,
                                        MaterialPageRoute(
                                          builder: (context) => ConversationScreen(
                                            doctorId: conv['doctorId'] as String,
                                            doctorName: conv['doctorName'] as String? ?? 'Unknown Doctor',
                                          ),
                                        ),
                                      ).then((_) {
                                        // Refresh messages when returning from conversation
                                        _loadMessages();
                                      });
                                    },
                                  ),
                                );
                              },
                            ),
                    ),
    );
  }

  String _formatTime(String dateTime) {
    if (dateTime.isEmpty) return '';
    try {
      // Parse UTC time and convert to Sri Lankan time (UTC+5:30)
      final dt = DateTime.parse(dateTime).toUtc();
      final sriLankanTime = dt.add(const Duration(hours: 5, minutes: 30));
      final now = DateTime.now();
      final difference = now.difference(sriLankanTime);

      if (difference.inDays == 0) {
        return '${sriLankanTime.hour.toString().padLeft(2, '0')}:${sriLankanTime.minute.toString().padLeft(2, '0')}';
      } else if (difference.inDays == 1) {
        return 'Yesterday';
      } else if (difference.inDays < 7) {
        return '${difference.inDays} days ago';
      } else {
        return '${sriLankanTime.day}/${sriLankanTime.month}/${sriLankanTime.year}';
      }
    } catch (e) {
      return dateTime;
    }
  }
}

