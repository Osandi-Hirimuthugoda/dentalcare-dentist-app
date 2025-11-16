import 'package:equatable/equatable.dart';
import 'package:flutter_application_1/domain/entities/appoinment_entity.dart';

abstract class AppointmentsState extends Equatable {
  const AppointmentsState();

  @override
  List<Object> get props => [];
}

class AppointmentsInitial extends AppointmentsState {}

class AppointmentsLoading extends AppointmentsState {}

class AppointmentsLoaded extends AppointmentsState {
  final List<AppointmentEntity> appointments;

  const AppointmentsLoaded(this.appointments);

  @override
  List<Object> get props => [appointments];
}

class AppointmentBooked extends AppointmentsState {
  final AppointmentEntity appointment;

  const AppointmentBooked(this.appointment);

  @override
  List<Object> get props => [appointment];
}

class AppointmentsError extends AppointmentsState {
  final String message;

  const AppointmentsError(this.message);

  @override
  List<Object> get props => [message];
}