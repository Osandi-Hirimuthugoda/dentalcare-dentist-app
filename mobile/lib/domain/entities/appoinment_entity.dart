class AppointmentEntity {
  final String id;
  final String title;
  final String dentistName;
  final DateTime dateTime;
  final String status; // scheduled, completed, cancelled

  AppointmentEntity({
    required this.id,
    required this.title,
    required this.dentistName,
    required this.dateTime,
    required this.status,
  });

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
  
    return other is AppointmentEntity &&
        other.id == id &&
        other.title == title &&
        other.dentistName == dentistName &&
        other.dateTime == dateTime &&
        other.status == status;
  }

  @override
  int get hashCode {
    return id.hashCode ^
        title.hashCode ^
        dentistName.hashCode ^
        dateTime.hashCode ^
        status.hashCode;
  }

  @override
  String toString() {
    return 'AppointmentEntity(id: $id, title: $title, dentistName: $dentistName, dateTime: $dateTime, status: $status)';
  }
}