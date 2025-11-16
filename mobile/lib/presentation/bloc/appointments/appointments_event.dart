import 'package:equatable/equatable.dart';
import 'package:flutter_application_1/domain/entities/appoinment_entity.dart';

abstract class AppointmentsEvent extends Equatable {
  const AppointmentsEvent();

  @override
  List<Object> get props => [];
}

class GetAppointmentsRequested extends AppointmentsEvent {}

class BookAppointmentRequested extends AppointmentsEvent {
  final AppointmentEntity appointment;

  const BookAppointmentRequested(this.appointment);

  @override
  List<Object> get props => [appointment];
}