import 'package:flutter/material.dart';
import 'package:flutter_application_1/core/models/notification_model.dart';
import 'package:flutter_application_1/core/themes/colors.dart';
import 'package:flutter_application_1/core/themes/text_styles.dart';
import 'package:flutter_application_1/data/data_sources/remote/dental_remote_data_source.dart';
import 'package:flutter_application_1/injection_container.dart' as di;

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  late final DentalRemoteDataSource _dentalDataSource;
  List<NotificationModel> _notifications = [];
  bool _isLoading = true;
  String? _errorMessage;
  int _unreadCount = 0;

  @override
  void initState() {
    super.initState();
    _dentalDataSource = di.getIt<DentalRemoteDataSource>();
    _loadNotifications();
  }

  Future<void> _loadNotifications() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final notificationsData = await _dentalDataSource.getNotifications();
      
      final notifications = notificationsData.map<NotificationModel>((data) {
        final id = data['_id']?.toString() ?? data['id']?.toString() ?? '';
        final title = data['title']?.toString() ?? 'Notification';
        final message = data['message']?.toString() ?? '';
        final isRead = data['isRead'] ?? false;
        final typeString = data['type']?.toString() ?? 'general';
        
        // Parse date
        DateTime date = DateTime.now();
        if (data['createdAt'] != null) {
          try {
            final utcDate = DateTime.parse(data['createdAt']).toUtc();
            date = utcDate.add(const Duration(hours: 5, minutes: 30)); // Sri Lankan time
          } catch (e) {
            debugPrint('Error parsing notification date: $e');
          }
        }
        
        // Map type string to enum
        NotificationType type = NotificationType.general;
        switch (typeString) {
          case 'appointment':
            type = NotificationType.appointment;
            break;
          case 'reminder':
            type = NotificationType.reminder;
            break;
          case 'emergency':
            type = NotificationType.emergency;
            break;
          case 'promotion':
            type = NotificationType.promotion;
            break;
          default:
            type = NotificationType.general;
        }
        
        // Parse actionUrl — used for navigation on tap
        final actionUrl = data['actionUrl']?.toString() ??
            (typeString == 'message' ? '/messages' : null);

        return NotificationModel(
          id: id,
          title: title,
          message: message,
          date: date,
          isRead: isRead,
          type: type,
          actionUrl: actionUrl,
        );
      }).toList();
      
      setState(() {
        _notifications = notifications;
        _unreadCount = notifications.where((n) => !n.isRead).length;
        _isLoading = false;
      });
    } catch (e) {
      debugPrint('❌ Error loading notifications: $e');
      setState(() {
        _errorMessage = 'Failed to load notifications. Please try again.';
        _isLoading = false;
        _notifications = [];
      });
    }
  }

  Future<void> _markAllAsRead() async {
    try {
      await _dentalDataSource.markAllNotificationsAsRead();
      await _loadNotifications();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('All notifications marked as read')),
        );
      }
    } catch (e) {
      debugPrint('❌ Error marking all as read: $e');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Failed to mark all as read. Please try again.'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    }
  }

  Future<void> _deleteNotification(String id) async {
    try {
      await _dentalDataSource.deleteNotification(id);
      await _loadNotifications();
    } catch (e) {
      debugPrint('❌ Error deleting notification: $e');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Failed to delete notification. Please try again.'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    }
  }

  Future<void> _markAsRead(String id) async {
    try {
      await _dentalDataSource.markNotificationAsRead(id);
      await _loadNotifications();
    } catch (e) {
      debugPrint('❌ Error marking notification as read: $e');
    }
  }

  Widget _buildNotificationIcon(NotificationType type) {
    switch (type) {
      case NotificationType.appointment:
        return Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: AppColors.info.withValues(alpha: 0.1),
            shape: BoxShape.circle,
          ),
          child: Icon(Icons.calendar_today, size: 20, color: AppColors.info),
        );
      case NotificationType.reminder:
        return Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: AppColors.warning.withValues(alpha: 0.1),
            shape: BoxShape.circle,
          ),
          child: Icon(Icons.notifications, size: 20, color: AppColors.warning),
        );
      case NotificationType.emergency:
        return Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: AppColors.error.withValues(alpha: 0.1),
            shape: BoxShape.circle,
          ),
          child: Icon(Icons.warning, size: 20, color: AppColors.error),
        );
      case NotificationType.promotion:
        return Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: AppColors.success.withValues(alpha: 0.1),
            shape: BoxShape.circle,
          ),
          child: Icon(Icons.local_offer, size: 20, color: AppColors.success),
        );
      default:
        return Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: AppColors.grey500.withValues(alpha: 0.1),
            shape: BoxShape.circle,
          ),
          child: Icon(Icons.info, size: 20, color: AppColors.grey500),
        );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Notifications'),
        backgroundColor: AppColors.primary,
        foregroundColor: AppColors.white,
        actions: [
          if (_unreadCount > 0)
            IconButton(
              icon: const Icon(Icons.mark_email_read),
              onPressed: _markAllAsRead,
              tooltip: 'Mark all as read',
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
                      Icon(
                        Icons.error_outline,
                        size: 64,
                        color: AppColors.error.withValues(alpha: 0.5),
                      ),
                      const SizedBox(height: 16),
                      Text(
                        _errorMessage!,
                        style: TextStyles.bodyMedium,
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 16),
                      ElevatedButton(
                        onPressed: _loadNotifications,
                        child: const Text('Retry'),
                      ),
                    ],
                  ),
                )
              : _notifications.isEmpty
                  ? _buildEmptyState()
                  : RefreshIndicator(
                      onRefresh: _loadNotifications,
                      child: ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: _notifications.length,
                        itemBuilder: (context, index) {
                          final notification = _notifications[index];
                          return _buildNotificationCard(notification);
                        },
                      ),
                    ),
    );
  }

  Widget _buildNotificationCard(NotificationModel notification) {
    return Dismissible(
      key: Key(notification.id),
      direction: DismissDirection.endToStart,
      background: Container(
        color: AppColors.error,
        alignment: Alignment.centerRight,
        padding: const EdgeInsets.only(right: 20),
        child: const Icon(Icons.delete, color: AppColors.white),
      ),
      onDismissed: (direction) => _deleteNotification(notification.id),
      child: Card(
        margin: const EdgeInsets.only(bottom: 12),
        color: notification.isRead ? AppColors.white : AppColors.info.withValues(alpha: 0.05),
        child: ListTile(
          leading: _buildNotificationIcon(notification.type),
          title: Text(
            notification.title,
            style: TextStyles.bodyMedium.copyWith(
              fontWeight: notification.isRead ? FontWeight.normal : FontWeight.bold,
            ),
          ),
          subtitle: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(notification.message),
              const SizedBox(height: 4),
              Text(
                notification.timeAgo,
                style: TextStyles.caption.copyWith(
                  color: AppColors.textSecondary,
                ),
              ),
            ],
          ),
          trailing: notification.isRead
              ? null
              : Container(
                  width: 8,
                  height: 8,
                  decoration: const BoxDecoration(
                    color: AppColors.info,
                    shape: BoxShape.circle,
                  ),
                ),
          onTap: () {
            if (!notification.isRead) {
              _markAsRead(notification.id);
            }
            // Navigate based on actionUrl or notification type
            final url = notification.actionUrl;
            if (url != null && url.isNotEmpty) {
              Navigator.pushNamed(context, url);
            } else if (notification.type == NotificationType.appointment) {
              Navigator.pushNamed(context, '/appointments');
            }
          },
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.notifications_off,
            size: 80,
            color: AppColors.grey500.withValues(alpha: 0.5),
          ),
          const SizedBox(height: 16),
          Text(
            'No Notifications',
            style: TextStyles.heading1,
          ),
          const SizedBox(height: 8),
          Text(
            'You\'re all caught up!',
            style: TextStyles.bodyMedium.copyWith(
              color: AppColors.textSecondary,
            ),
          ),
        ],
      ),
    );
  }
}