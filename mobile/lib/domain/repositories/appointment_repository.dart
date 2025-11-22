import 'package:dartz/dartz.dart';
// import 'package:dental_care/core/errors/failures.dart';
// import 'package:dental_care/domain/entities/appointment_entity.dart';
import 'package:flutter_application_1/core/errors/failures.dart';
import 'package:flutter_application_1/domain/entities/appoinment_entity.dart';

abstract class AppointmentRepository {
  Future<Either<Failure, List<AppointmentEntity>>> getAppointments();
  Future<Either<Failure, AppointmentEntity>> bookAppointment({
    required String doctorId,
    required DateTime dateTime,
    required String service,
    String? notes,
  });
  Future<Either<Failure, void>> cancelAppointment(String appointmentId);
  Future<Either<Failure, void>> rescheduleAppointment(String appointmentId, DateTime newDateTime);
}