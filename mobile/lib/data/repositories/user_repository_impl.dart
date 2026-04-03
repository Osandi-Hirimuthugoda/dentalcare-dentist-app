import 'package:dartz/dartz.dart';
import 'package:flutter_application_1/core/errors/exceptions.dart';
import 'package:flutter_application_1/core/errors/failures.dart';
import 'package:flutter_application_1/data/data_sources/local/shared_prefs.dart';
import 'package:flutter_application_1/data/data_sources/remote/auth_remote_data_source.dart';
import 'package:flutter_application_1/domain/entities/user_entity.dart';
import 'package:flutter_application_1/domain/repositories/user_repository.dart';

class UserRepositoryImpl implements UserRepository {
  final AuthRemoteDataSource authRemoteDataSource;
  final LocalDataSource localDataSource;

  UserRepositoryImpl({
    required this.authRemoteDataSource,
    required this.localDataSource,
  });

  @override
  Future<Either<Failure, UserEntity>> getUserProfile(String userId) async {
    try {
      final userData = await authRemoteDataSource.getCurrentUser();
      final user = UserEntity(
        id: userData['id']?.toString() ?? userId,
        name: userData['name']?.toString() ?? '',
        email: userData['email']?.toString() ?? '',
        phone: userData['phone']?.toString() ?? '',
      );
      return Right(user);
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message, e.statusCode));
    } on NetworkException catch (e) {
      return Left(NetworkFailure(e.message));
    } catch (e) {
      return Left(UnexpectedFailure());
    }
  }

  @override
  Future<Either<Failure, UserEntity>> updateUserProfile(UserEntity user) async {
    try {
      final updated = await authRemoteDataSource.updateProfile({
        'name': user.name,
        'phone': user.phone,
      });
      final updatedUser = UserEntity(
        id: updated['id']?.toString() ?? user.id,
        name: updated['name']?.toString() ?? user.name,
        email: updated['email']?.toString() ?? user.email,
        phone: updated['phone']?.toString() ?? user.phone,
      );
      return Right(updatedUser);
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message, e.statusCode));
    } on NetworkException catch (e) {
      return Left(NetworkFailure(e.message));
    } catch (e) {
      return Left(UnexpectedFailure());
    }
  }

  @override
  Future<Either<Failure, void>> updateProfilePicture(String imagePath) async {
    try {
      // Profile picture upload not yet supported by backend
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
  Future<Either<Failure, void>> changePassword(
      String currentPassword, String newPassword) async {
    try {
      await authRemoteDataSource.changePassword(currentPassword, newPassword);
      return const Right(null);
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message, e.statusCode));
    } on NetworkException catch (e) {
      return Left(NetworkFailure(e.message));
    } catch (e) {
      return Left(UnexpectedFailure());
    }
  }
}
