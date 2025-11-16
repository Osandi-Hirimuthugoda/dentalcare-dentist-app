import 'package:dartz/dartz.dart';
// import 'package:dental_care/core/errors/failures.dart';
// import 'package:dental_care/domain/entities/user_entity.dart';
import 'package:flutter_application_1/core/errors/failures.dart';
import 'package:flutter_application_1/domain/entities/user_entity.dart';

abstract class AuthRepository {
  Future<Either<Failure, UserEntity>> login(String email, String password);
  Future<Either<Failure, UserEntity>> register(UserEntity user, String password, {int? age, String? gender});
  Future<Either<Failure, void>> forgotPassword(String email);
  Future<Either<Failure, void>> verifyEmail(String email, String otp);
  Future<Either<Failure, void>> logout();
  Future<Either<Failure, bool>> isUserLoggedIn();
  Future<Either<Failure, UserEntity?>> getCurrentUser();
}