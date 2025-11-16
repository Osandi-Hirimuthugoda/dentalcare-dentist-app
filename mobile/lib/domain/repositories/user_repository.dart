import 'package:dartz/dartz.dart';
// import 'package:dental_care/core/errors/failures.dart';
// import 'package:dental_care/domain/entities/user_entity.dart';
import 'package:flutter_application_1/core/errors/failures.dart';
import 'package:flutter_application_1/domain/entities/user_entity.dart';

abstract class UserRepository {
  Future<Either<Failure, UserEntity>> getUserProfile(String userId);
  Future<Either<Failure, UserEntity>> updateUserProfile(UserEntity user);
  Future<Either<Failure, void>> updateProfilePicture(String imagePath);
  Future<Either<Failure, void>> changePassword(String currentPassword, String newPassword);
}