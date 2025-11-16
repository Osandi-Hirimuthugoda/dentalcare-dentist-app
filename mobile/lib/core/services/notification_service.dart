import '../models/notification_model.dart';

class NotificationService {
  static final NotificationService _instance = NotificationService._internal();
  factory NotificationService() => _instance;
  NotificationService._internal();

  final List<NotificationModel> _notifications = [
    NotificationModel(
      id: '1',
      title: 'Appointment Reminder',
      message: 'Your dental checkup with Dr. Kamal Fernando is scheduled for tomorrow at 10:00 AM',
      date: DateTime.now().subtract(const Duration(minutes: 5)),
      type: NotificationType.reminder,
    ),
    NotificationModel(
      id: '2',
      title: 'Appointment Confirmed',
      message: 'Your appointment with Dr. Sameera Perera has been confirmed for December 20th',
      date: DateTime.now().subtract(const Duration(hours: 2)),
      type: NotificationType.appointment,
    ),
    NotificationModel(
      id: '3',
      title: 'Health Tip',
      message: 'Remember to brush twice daily and floss regularly for optimal dental health',
      date: DateTime.now().subtract(const Duration(days: 1)),
      type: NotificationType.general,
    ),
    NotificationModel(
      id: '4',
      title: 'Special Offer',
      message: 'Get 20% off on dental cleaning this month. Book your appointment now!',
      date: DateTime.now().subtract(const Duration(days: 2)),
      type: NotificationType.promotion,
    ),
    NotificationModel(
      id: '5',
      title: 'Emergency Contact',
      message: 'Emergency dental services available 24/7 at City Dental Hospital',
      date: DateTime.now().subtract(const Duration(days: 3)),
      type: NotificationType.emergency,
    ),
  ];

  List<NotificationModel> get notifications => _notifications;

  int get unreadCount => _notifications.where((notification) => !notification.isRead).length;

  void markAsRead(String id) {
    final index = _notifications.indexWhere((notification) => notification.id == id);
    if (index != -1) {
      _notifications[index] = _notifications[index].copyWith(isRead: true);
    }
  }

  void markAllAsRead() {
    for (int i = 0; i < _notifications.length; i++) {
      if (!_notifications[i].isRead) {
        _notifications[i] = _notifications[i].copyWith(isRead: true);
      }
    }
  }

  void addNotification(NotificationModel notification) {
    _notifications.insert(0, notification);
  }

  void deleteNotification(String id) {
    _notifications.removeWhere((notification) => notification.id == id);
  }
}

// Extension to create a copy of notification with updated fields
extension NotificationModelExtension on NotificationModel {
  NotificationModel copyWith({
    String? id,
    String? title,
    String? message,
    DateTime? date,
    bool? isRead,
    NotificationType? type,
  }) {
    return NotificationModel(
      id: id ?? this.id,
      title: title ?? this.title,
      message: message ?? this.message,
      date: date ?? this.date,
      isRead: isRead ?? this.isRead,
      type: type ?? this.type,
    );
  }
}