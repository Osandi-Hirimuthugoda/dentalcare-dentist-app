class AppointmentModel {
  final String id;
  final String title;
  final String dentistName;
  final DateTime dateTime;
  final String status;
  final String? description;
  final String? location;

  AppointmentModel({
    required this.id,
    required this.title,
    required this.dentistName,
    required this.dateTime,
    required this.status,
    this.description,
    this.location,
  });

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'dentist_name': dentistName,
      'date_time': dateTime.toIso8601String(),
      'status': status,
      'description': description,
      'location': location,
    };
  }

  static AppointmentModel fromJson(Map<String, dynamic> json) {
    return AppointmentModel(
      id: json['id'],
      title: json['title'],
      dentistName: json['dentist_name'],
      dateTime: DateTime.parse(json['date_time']),
      status: json['status'],
      description: json['description'],
      location: json['location'],
    );
  }
}