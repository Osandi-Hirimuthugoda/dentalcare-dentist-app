import 'package:dartz/dartz.dart';
// import 'package:dental_care/core/errors/failures.dart';
// import 'package:dental_care/domain/entities/user_entity.dart';
// import 'package:dental_care/domain/repositories/auth_repository.dart';
import 'package:flutter_application_1/core/errors/failures.dart';
import 'package:flutter_application_1/domain/entities/user_entity.dart';
import 'package:flutter_application_1/domain/repositories/auth_repository.dart';

class LoginUseCase {
  final AuthRepository repository;

  LoginUseCase({required this.repository});

  Future<Either<Failure, UserEntity>> execute(String email, String password) {
    return repository.login(email, password);
  }
}