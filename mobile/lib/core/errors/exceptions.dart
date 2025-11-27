// Base Exception
abstract class AppException implements Exception {
  final String message;
  final StackTrace? stackTrace;

  const AppException(this.message, [this.stackTrace]);

  @override
  String toString() => 'AppException: $message';
}

// Network Exceptions
class NetworkException extends AppException {
  const NetworkException(super.message, [super.stackTrace]);
}

class ServerException extends AppException {
  final int statusCode;

  const ServerException(String message, this.statusCode, [StackTrace? stackTrace])
      : super(message, stackTrace);
}

// Data Exceptions
class DataParsingException extends AppException {
  const DataParsingException(super.message, [super.stackTrace]);
}

class CacheException extends AppException {
  const CacheException(super.message, [super.stackTrace]);
}

// Auth Exceptions
class AuthException extends AppException {
  const AuthException(super.message, [super.stackTrace]);
}

class InvalidCredentialsException extends AuthException {
  const InvalidCredentialsException([String? message, StackTrace? stackTrace])
      : super(message ?? 'Invalid email or password', stackTrace);
}

class UserNotFoundException extends AuthException {
  const UserNotFoundException([StackTrace? stackTrace])
      : super('User not found', stackTrace);
}

class EmailAlreadyExistsException extends AuthException {
  const EmailAlreadyExistsException([StackTrace? stackTrace])
      : super('Email already exists', stackTrace);
}