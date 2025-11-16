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
      
      // Save user data and token to local storage
      await localDataSource.setString('user_data', userModel.toJson().toString());
      await localDataSource.setBool(AppConstants.isLoggedInKey, true);
      
      // Save token if available
      if (token != null && token.isNotEmpty) {
        await localDataSource.setString(AppConstants.tokenKey, token);
      }
      
      final userEntity = UserEntity(
        id: userModel.id,
        name: userModel.name,
        email: userModel.email,
        phone: userModel.phone,
      );
      
      return Right(userEntity);
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
      final userData = response['user'] as Map<String, dynamic>;
      final token = response['token'] as String?;
      
      final registeredUser = UserModel.fromJson(userData);
      
      // Save token if available (but don't set is_logged_in yet - user needs to login)
      if (token != null && token.isNotEmpty) {
        await localDataSource.setString(AppConstants.tokenKey, token);
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
    } catch (e) {
      return Left(UnexpectedFailure());
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
      // Check both login status and token to ensure user is truly logged in
      final isLoggedIn = await localDataSource.getBool(AppConstants.isLoggedInKey);
      final token = await localDataSource.getString(AppConstants.tokenKey);
      
      // User is logged in only if both flag is true AND token exists
      final isAuthenticated = (isLoggedIn == true) && (token != null && token.isNotEmpty);
      
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
      final userData = await localDataSource.getString('user_data');
      if (userData != null) {
        // Parse user data and return UserEntity
        // This is simplified - you'd need proper parsing
        final userEntity = UserEntity(
          id: '1',
          name: 'Current User',
          email: 'user@example.com',
          phone: '1234567890',
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