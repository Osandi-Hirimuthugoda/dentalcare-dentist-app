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
      
      // Convert data to entities - backend returns populated data
      final appointments = appointmentsData.map((data) {
        // Backend returns _id, convert to id
        final id = data['_id']?.toString() ?? data['id']?.toString() ?? '';
        
        // Extract doctor name from populated doctor object
        final doctor = data['doctor'];
        final dentistName = doctor != null 
            ? (doctor['fullName'] ?? doctor['name'] ?? 'Unknown Doctor')
            : 'No Doctor Assigned';
        
        // Extract startTime and convert to DateTime
        final startTime = data['startTime'] != null
            ? DateTime.parse(data['startTime'])
            : DateTime.now();
        
        return AppointmentEntity(
          id: id,
          title: data['notes']?.isNotEmpty == true 
              ? data['notes'] 
              : 'Dental Appointment',
          dentistName: dentistName,
          dateTime: startTime,
          status: data['status'] ?? 'pending',
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
  Future<Either<Failure, AppointmentEntity>> bookAppointment({
    required String doctorId,
    required DateTime dateTime,
    required String service,
    String? notes,
  }) async {
    try {
      // Calculate endTime (typically 30 minutes after start)
      final endTime = dateTime.add(const Duration(minutes: 30));
      
      // Backend expects: doctor (ID), startTime, endTime, status, notes
      // Patient ID will be extracted from token in the backend
      final appointmentData = {
        'doctor': doctorId,
        'startTime': dateTime.toUtc().toIso8601String(),
        'endTime': endTime.toUtc().toIso8601String(),
        'status': 'pending',
        'notes': notes ?? service,
        'teleconsult': false,
      };
      
      final result = await remoteDataSource.bookAppointment(appointmentData);
      
      // Convert response to entity
      final id = result['_id']?.toString() ?? result['id']?.toString() ?? '';
      final doctor = result['doctor'];
      final dentistName = doctor != null 
          ? (doctor['fullName'] ?? doctor['name'] ?? 'Unknown Doctor')
          : 'No Doctor Assigned';
      final startTimeResult = result['startTime'] != null
          ? DateTime.parse(result['startTime'])
          : dateTime;
      
      final bookedAppointment = AppointmentEntity(
        id: id,
        title: result['notes'] ?? service,
        dentistName: dentistName,
        dateTime: startTimeResult,
        status: result['status'] ?? 'pending',
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
      await remoteDataSource.cancelAppointment(appointmentId);
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