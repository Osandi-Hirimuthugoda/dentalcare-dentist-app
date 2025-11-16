// import 'package:dental_care/core/errors/failures.dart';
// import 'package:dental_care/domain/entities/appointment_entity.dart';
// import 'package:dental_care/domain/repositories/appointment_repository.dart';
import 'package:dartz/dartz.dart';
import 'package:flutter_application_1/core/errors/failures.dart';
import 'package:flutter_application_1/domain/entities/appoinment_entity.dart';
import 'package:flutter_application_1/domain/repositories/appointment_repository.dart';

class BookAppointmentUseCase {
  final AppointmentRepository repository;

  BookAppointmentUseCase({required this.repository});

  Future<Either<Failure, AppointmentEntity>> execute(AppointmentEntity appointment) {
    return repository.bookAppointment(appointment);
  }
}