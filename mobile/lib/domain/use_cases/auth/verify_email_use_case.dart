import 'package:dartz/dartz.dart';
// import 'package:dental_care/core/errors/failures.dart';
// import 'package:dental_care/domain/repositories/auth_repository.dart';
import 'package:flutter_application_1/core/errors/failures.dart';
import 'package:flutter_application_1/domain/repositories/auth_repository.dart';

class VerifyEmailUseCase {
  final AuthRepository repository;

  VerifyEmailUseCase({required this.repository});

  Future<Either<Failure, void>> execute(String email, String otp) {
    return repository.verifyEmail(email, otp);
  }
}