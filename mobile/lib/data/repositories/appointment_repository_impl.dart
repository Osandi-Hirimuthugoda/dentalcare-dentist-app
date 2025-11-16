import 'package:dartz/dartz.dart';
import 'package:flutter_application_1/core/errors/exceptions.dart';
import 'package:flutter_application_1/core/errors/failures.dart';
import 'package:flutter_application_1/data/data_sources/remote/dental_remote_data_source.dart';
import 'package:flutter_application_1/domain/entities/appoinment_entity.dart';
import 'package:flutter_application_1/domain/repositories/appointment_repository.dart';

class AppointmentRepositoryImpl implements AppointmentRepository {
  final DentalRemoteDataSource remoteDataSource;

  AppointmentRepositoryImpl({required this.remoteDataSource});

  @override
  Future<Either<Failure, List<AppointmentEntity>>> getAppointments() async {
    try {
      final appointmentsData = await remoteDataSource.getAppointments();
      
      // Convert data to entities
      final appointments = appointmentsData.map((data) {
        return AppointmentEntity(
          id: data['id'] ?? '',
          title: data['title'] ?? '',
          dentistName: data['dentist_name'] ?? '',
          dateTime: DateTime.parse(data['date_time'] ?? DateTime.now().toString()),
          status: data['status'] ?? 'scheduled',
        );
      }).toList();
      
      return Right(appointments);
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message, e.statusCode));
    } on NetworkException catch (e) {
      return Left(NetworkFailure(e.message));
    } catch (e) {
      return Left(UnexpectedFailure());
    }
  }

  @override
  Future<Either<Failure, AppointmentEntity>> bookAppointment(AppointmentEntity appointment) async {
    try {
      final appointmentData = {
        'title': appointment.title,
        'dentist_name': appointment.dentistName,
        'date_time': appointment.dateTime.toIso8601String(),
        'status': 'scheduled',
      };
      
      final result = await remoteDataSource.bookAppointment(appointmentData);
      
      final bookedAppointment = AppointmentEntity(
        id: result['id'] ?? '',
        title: result['title'] ?? appointment.title,
        dentistName: result['dentist_name'] ?? appointment.dentistName,
        dateTime: DateTime.parse(result['date_time'] ?? appointment.dateTime.toIso8601String()),
        status: result['status'] ?? 'scheduled',
      );
      
      return Right(bookedAppointment);
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message, e.statusCode));
    } on NetworkException catch (e) {
      return Left(NetworkFailure(e.message));
    } catch (e) {
      return Left(UnexpectedFailure());
    }
  }

  @override
  Future<Either<Failure, void>> cancelAppointment(String appointmentId) async {
    try {
      // This would typically call cancel appointment API
      await Future.delayed(const Duration(milliseconds: 500));
      return const Right(null);
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message, e.statusCode));
    } on NetworkException catch (e) {
      return Left(NetworkFailure(e.message));
    } catch (e) {
      return Left(UnexpectedFailure());
    }
  }

  @override
  Future<Either<Failure, void>> rescheduleAppointment(String appointmentId, DateTime newDateTime) async {
    try {
      // This would typically call reschedule appointment API
      await Future.delayed(const Duration(milliseconds: 500));
      return const Right(null);
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message, e.statusCode));
    } on NetworkException catch (e) {
      return Left(NetworkFailure(e.message));
    } catch (e) {
      return Left(UnexpectedFailure());
    }
  }
}