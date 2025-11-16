// import 'package:dental_care/core/errors/failures.dart';
// import 'package:dental_care/domain/entities/user_entity.dart';
// import 'package:dental_care/domain/repositories/user_repository.dart';
import 'package:dartz/dartz.dart';
import 'package:flutter_application_1/core/errors/failures.dart';
import 'package:flutter_application_1/domain/entities/user_entity.dart';
import 'package:flutter_application_1/domain/repositories/user_repository.dart';

class UpdateUserProfileUseCase {
  final UserRepository repository;

  UpdateUserProfileUseCase({required this.repository});

  Future<Either<Failure, UserEntity>> execute(UserEntity user) {
    return repository.updateUserProfile(user);
  }
}