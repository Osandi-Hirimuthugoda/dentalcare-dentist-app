import 'package:equatable/equatable.dart';

abstract class AppointmentsEvent extends Equatable {
  const AppointmentsEvent();

  @override
  List<Object> get props => [];
}

class GetAppointmentsRequested extends AppointmentsEvent {}

class BookAppointmentRequested extends AppointmentsEvent {
  final String doctorId;
  final DateTime dateTime;
  final String service;
  final String? notes;

  const BookAppointmentRequested({
    required this.doctorId,
    required this.dateTime,
    required this.service,
    this.notes,
  });

  @override
  List<Object> get props => [doctorId, dateTime, service, notes ?? ''];
}