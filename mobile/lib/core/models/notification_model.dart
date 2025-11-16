class NotificationModel {
  final String id;
  final String title;
  final String message;
  final DateTime date;
  final bool isRead;
  final NotificationType type;

  NotificationModel({
    required this.id,
    required this.title,
    required this.message,
    required this.date,
    this.isRead = false,
    required this.type,
  });

  String get timeAgo {
    final now = DateTime.now();
    final difference = now.difference(date);

    if (difference.inMinutes < 1) {
      return 'Just now';
    } else if (difference.inHours < 1) {
      return '${difference.inMinutes}m ago';
    } else if (difference.inDays < 1) {
      return '${difference.inHours}h ago';
    } else if (difference.inDays < 7) {
      return '${difference.inDays}d ago';
    } else {
      return '${date.day}/${date.month}/${date.year}';
    }
  }
}

enum NotificationType {
  appointment,
  reminder,
  general,
  emergency,
  promotion,
}