import 'package:dartz/dartz.dart';
// import 'package:dental_care/core/errors/failures.dart';
// import 'package:dental_care/domain/repositories/user_repository.dart';
import 'package:flutter_application_1/core/errors/failures.dart';
import 'package:flutter_application_1/domain/repositories/user_repository.dart';

class ChangePasswordUseCase {
  final UserRepository repository;

  ChangePasswordUseCase({required this.repository});

  Future<Either<Failure, void>> execute(String currentPassword, String newPassword) {
    return repository.changePassword(currentPassword, newPassword);
  }
}