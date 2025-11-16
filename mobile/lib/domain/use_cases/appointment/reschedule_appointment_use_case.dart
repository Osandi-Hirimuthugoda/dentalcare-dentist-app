import 'package:dartz/dartz.dart';
// import 'package:dental_care/core/errors/failures.dart';
// import 'package:dental_care/domain/repositories/appointment_repository.dart';
import 'package:flutter_application_1/core/errors/failures.dart';
import 'package:flutter_application_1/domain/repositories/appointment_repository.dart';

class RescheduleAppointmentUseCase {
  final AppointmentRepository repository;

  RescheduleAppointmentUseCase({required this.repository});

  Future<Either<Failure, void>> execute(String appointmentId, DateTime newDateTime) {
    return repository.rescheduleAppointment(appointmentId, newDateTime);
  }
}