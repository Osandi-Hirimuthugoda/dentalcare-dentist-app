import 'package:flutter/material.dart';
import 'package:flutter_application_1/core/models/notification_model.dart';
import 'package:flutter_application_1/core/services/notification_service.dart';
import 'package:flutter_application_1/core/themes/colors.dart';
import 'package:flutter_application_1/core/themes/text_styles.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  final NotificationService _notificationService = NotificationService();
  List<NotificationModel> _notifications = [];

  @override
  void initState() {
    super.initState();
    _loadNotifications();
  }

  void _loadNotifications() {
    setState(() {
      _notifications = _notificationService.notifications;
    });
  }

  void _markAllAsRead() {
    setState(() {
      _notificationService.markAllAsRead();
      _loadNotifications();
    });
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('All notifications marked as read')),
    );
  }

  void _deleteNotification(String id) {
    setState(() {
      _notificationService.deleteNotification(id);
      _loadNotifications();
    });
  }

  Widget _buildNotificationIcon(NotificationType type) {
    switch (type) {
      case NotificationType.appointment:
        return Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: Colors.blue.withOpacity(0.1),
            shape: BoxShape.circle,
          ),
          child: Icon(Icons.calendar_today, size: 20, color: Colors.blue),
        );
      case NotificationType.reminder:
        return Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: Colors.orange.withOpacity(0.1),
            shape: BoxShape.circle,
          ),
          child: Icon(Icons.notifications, size: 20, color: Colors.orange),
        );
      case NotificationType.emergency:
        return Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: Colors.red.withOpacity(0.1),
            shape: BoxShape.circle,
          ),
          child: Icon(Icons.warning, size: 20, color: Colors.red),
        );
      case NotificationType.promotion:
        return Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: Colors.green.withOpacity(0.1),
            shape: BoxShape.circle,
          ),
          child: Icon(Icons.local_offer, size: 20, color: Colors.green),
        );
      default:
        return Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: Colors.grey.withOpacity(0.1),
            shape: BoxShape.circle,
          ),
          child: Icon(Icons.info, size: 20, color: Colors.grey),
        );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Notifications'),
        backgroundColor: Colors.teal[700],
        foregroundColor: Colors.white,
        actions: [
          if (_notificationService.unreadCount > 0)
            IconButton(
              icon: const Icon(Icons.mark_email_read),
              onPressed: _markAllAsRead,
              tooltip: 'Mark all as read',
            ),
        ],
      ),
      body: _notifications.isEmpty
          ? _buildEmptyState()
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _notifications.length,
              itemBuilder: (context, index) {
                final notification = _notifications[index];
                return _buildNotificationCard(notification);
              },
            ),
    );
  }

  Widget _buildNotificationCard(NotificationModel notification) {
    return Dismissible(
      key: Key(notification.id),
      direction: DismissDirection.endToStart,
      background: Container(
        color: Colors.red,
        alignment: Alignment.centerRight,
        padding: const EdgeInsets.only(right: 20),
        child: const Icon(Icons.delete, color: Colors.white),
      ),
      onDismissed: (direction) => _deleteNotification(notification.id),
      child: Card(
        margin: const EdgeInsets.only(bottom: 12),
        color: notification.isRead ? Colors.white : Colors.blue.withOpacity(0.05),
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
                    color: Colors.blue,
                    shape: BoxShape.circle,
                  ),
                ),
          onTap: () {
            if (!notification.isRead) {
              setState(() {
                _notificationService.markAsRead(notification.id);
              });
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
            color: Colors.grey.withOpacity(0.5),
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