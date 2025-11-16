// Base Failure
abstract class Failure {
  final String message;
  final StackTrace? stackTrace;

  const Failure(this.message, [this.stackTrace]);

  @override
  String toString() => 'Failure: $message';
}

// Network Failures
class NetworkFailure extends Failure {
  const NetworkFailure(super.message, [super.stackTrace]);
}

class ServerFailure extends Failure {
  final int statusCode;

  const ServerFailure(String message, this.statusCode, [StackTrace? stackTrace])
      : super(message, stackTrace);
}

// Data Failures
class DataParsingFailure extends Failure {
  const DataParsingFailure(super.message, [super.stackTrace]);
}

class CacheFailure extends Failure {
  const CacheFailure(super.message, [super.stackTrace]);
}

// Auth Failures
class AuthFailure extends Failure {
  const AuthFailure(super.message, [super.stackTrace]);
}

class InvalidCredentialsFailure extends AuthFailure {
  const InvalidCredentialsFailure([StackTrace? stackTrace])
      : super('Invalid email or password', stackTrace);
}

class UserNotFoundFailure extends AuthFailure {
  const UserNotFoundFailure([StackTrace? stackTrace])
      : super('User not found', stackTrace);
}

class EmailAlreadyExistsFailure extends AuthFailure {
  const EmailAlreadyExistsFailure([StackTrace? stackTrace])
      : super('Email already exists', stackTrace);
}

// Generic Failures
class UnexpectedFailure extends Failure {
  const UnexpectedFailure([StackTrace? stackTrace])
      : super('An unexpected error occurred', stackTrace);
}