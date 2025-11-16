import 'package:equatable/equatable.dart';
//import 'package:dental_care/domain/entities/user_entity.dart';
import 'package:flutter_application_1/domain/entities/user_entity.dart';

abstract class AuthEvent extends Equatable {
  const AuthEvent();

  @override
  List<Object> get props => [];
}

class LoginRequested extends AuthEvent {
  final String email;
  final String password;

  const LoginRequested({required this.email, required this.password});

  @override
  List<Object> get props => [email, password];
}

class RegisterRequested extends AuthEvent {
  final UserEntity user;
  final String password;
  final int? age;
  final String? gender;

  const RegisterRequested({
    required this.user,
    required this.password,
    this.age,
    this.gender,
  });

  @override
  List<Object?> get props => [user, password, age, gender];
}

class LogoutRequested extends AuthEvent {}