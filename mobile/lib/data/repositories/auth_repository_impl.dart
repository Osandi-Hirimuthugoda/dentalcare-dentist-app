import 'dart:convert';
import 'package:dartz/dartz.dart';
// import 'package:dental_care/core/errors/exceptions.dart';
// import 'package:dental_care/core/errors/failures.dart';
// import 'package:dental_care/data/data_sources/remote/auth_remote_data_source.dart';
// import 'package:dental_care/data/data_sources/local/shared_prefs.dart';
// import 'package:dental_care/data/models/user_model.dart';
// import 'package:dental_care/domain/entities/user_entity.dart';
// import 'package:dental_care/domain/repositories/auth_repository.dart';
import 'package:flutter_application_1/core/constants/app_constants.dart';
import 'package:flutter_application_1/core/errors/exceptions.dart';
import 'package:flutter_application_1/core/errors/failures.dart';
import 'package:flutter_application_1/data/data_sources/local/shared_prefs.dart';
import 'package:flutter_application_1/data/data_sources/remote/auth_remote_data_source.dart';
import 'package:flutter_application_1/data/models/user_model.dart';
import 'package:flutter_application_1/domain/entities/user_entity.dart';
import 'package:flutter_application_1/domain/repositories/auth_repository.dart';

class AuthRepositoryImpl implements AuthRepository {
  final AuthRemoteDataSource remoteDataSource;
  final LocalDataSource localDataSource;

  AuthRepositoryImpl({
    required this.remoteDataSource,
    required this.localDataSource,
  });

  @override
  Future<Either<Failure, UserEntity>> login(String email, String password) async {
    try {
      final response = await remoteDataSource.login(email, password);
      final userData = response['user'] as Map<String, dynamic>;
      final token = response['token'] as String?;
      
      final userModel = UserModel.fromJson(userData);
      
      // Save user data to local storage first
      // Use jsonEncode to properly convert Map to JSON string
      await localDataSource.setString(AppConstants.userKey, jsonEncode(userModel.toJson()));
      
      // Save token if available (save empty string if null to ensure consistency)
      if (token != null && token.isNotEmpty) {
        await localDataSource.setString(AppConstants.tokenKey, token);
      } else {
        // Save empty string to indicate no token, but user is still logged in
        await localDataSource.setString(AppConstants.tokenKey, '');
      }
      
      // Set login flag to true AFTER saving user data and token
      // This ensures all data is saved before marking as logged in
      await localDataSource.setBool(AppConstants.isLoggedInKey, true);
      
      final userEntity = UserEntity(
        id: userModel.id,
        name: userModel.name,
        email: userModel.email,
        phone: userModel.phone,
      );
      
      return Right(userEntity);
    } on InvalidCredentialsException {
      return const Left(InvalidCredentialsFailure());
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message, e.statusCode));
    } on NetworkException catch (e) {
      return Left(NetworkFailure(e.message));
    } on CacheException catch (e) {
      return Left(CacheFailure(e.message));
    } catch (e) {
      return Left(UnexpectedFailure());
    }
  }

  @override
  Future<Either<Failure, UserEntity>> register(UserEntity user, String password, {int? age, String? gender}) async {
    try {
      final userModel = UserModel(
        id: '',
        name: user.name,
        email: user.email,
        phone: user.phone,
        age: age,
        gender: gender,
      );
      
      final response = await remoteDataSource.register(userModel, password);
      
      // Validate response structure
      if (response['user'] == null) {
        return Left(ServerFailure('Invalid response from server: user data missing', 500));
      }
      
      final userData = response['user'] as Map<String, dynamic>;
      final token = response['token'] as String?;
      
      // Parse user data
      final registeredUser = UserModel.fromJson(userData);
      
      // Save token in background (don't await - user needs to login anyway)
      // This speeds up registration response
      if (token != null && token.isNotEmpty) {
        localDataSource.setString(AppConstants.tokenKey, token).catchError((_) {
          // Ignore errors - token will be saved on login
        });
      }
      
      final userEntity = UserEntity(
        id: registeredUser.id,
        name: registeredUser.name,
        email: registeredUser.email,
        phone: registeredUser.phone,
      );
      
      return Right(userEntity);
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message, e.statusCode));
    } on NetworkException catch (e) {
      return Left(NetworkFailure(e.message));
    } on AuthException catch (e) {
      return Left(ServerFailure(e.message, 400));
    } catch (e) {
      // Catch any other exceptions and provide a meaningful error
      return Left(ServerFailure('Registration failed: ${e.toString()}', 500));
    }
  }

  @override
  Future<Either<Failure, void>> forgotPassword(String email) async {
    try {
      await remoteDataSource.forgotPassword(email);
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
  Future<Either<Failure, void>> verifyEmail(String email, String otp) async {
    try {
      await remoteDataSource.verifyEmail(email, otp);
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
  Future<Either<Failure, void>> logout() async {
    try {
      await remoteDataSource.logout();
      await localDataSource.clear();
      return const Right(null);
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message, e.statusCode));
    } on NetworkException catch (e) {
      return Left(NetworkFailure(e.message));
    } on CacheException catch (e) {
      return Left(CacheFailure(e.message));
    } catch (e) {
      return Left(UnexpectedFailure());
    }
  }

  @override
  Future<Either<Failure, bool>> isUserLoggedIn() async {
    try {
      // Check login status flag first
      final isLoggedIn = await localDataSource.getBool(AppConstants.isLoggedInKey);
      
      // If login flag is not set or false, user is not logged in
      if (isLoggedIn != true) {
        return const Right(false);
      }
      
      // If login flag is true, check for user data to confirm authentication
      // User data is always saved on successful login
      final userData = await localDataSource.getString(AppConstants.userKey);
      
      // User is logged in if login flag is true AND user data exists
      final isAuthenticated = userData != null && userData.isNotEmpty;
      
      return Right(isAuthenticated);
    } on CacheException catch (e) {
      return Left(CacheFailure(e.message));
    } catch (e) {
      return Left(UnexpectedFailure());
    }
  }

  @override
  Future<Either<Failure, UserEntity?>> getCurrentUser() async {
    try {
      final userDataString = await localDataSource.getString(AppConstants.userKey);
      if (userDataString != null && userDataString.isNotEmpty) {
        // Parse JSON string back to Map and create UserModel
        final userDataMap = jsonDecode(userDataString) as Map<String, dynamic>;
        final userModel = UserModel.fromJson(userDataMap);
        
        final userEntity = UserEntity(
          id: userModel.id,
          name: userModel.name,
          email: userModel.email,
          phone: userModel.phone,
        );
        return Right(userEntity);
      }
      return const Right(null);
    } on CacheException catch (e) {
      return Left(CacheFailure(e.message));
    } catch (e) {
      return Left(UnexpectedFailure());
    }
  }
}