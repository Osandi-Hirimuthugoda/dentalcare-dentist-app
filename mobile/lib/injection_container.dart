import 'package:flutter_application_1/data/data_sources/local/shared_prefs.dart';
import 'package:flutter_application_1/data/data_sources/remote/auth_remote_data_source.dart';
import 'package:flutter_application_1/data/data_sources/remote/dental_remote_data_source.dart';
import 'package:flutter_application_1/data/repositories/appointment_repository_impl.dart';
import 'package:flutter_application_1/data/repositories/auth_repository_impl.dart';
import 'package:flutter_application_1/data/repositories/user_repository_impl.dart';
import 'package:flutter_application_1/domain/repositories/appointment_repository.dart';
import 'package:flutter_application_1/domain/repositories/auth_repository.dart';
import 'package:flutter_application_1/domain/repositories/user_repository.dart';
import 'package:flutter_application_1/domain/use_cases/appointment/book_appointment_use_case.dart';
import 'package:flutter_application_1/domain/use_cases/appointment/get_appointments_use_case.dart';
import 'package:flutter_application_1/domain/use_cases/auth/login_use_case.dart';
import 'package:flutter_application_1/domain/use_cases/auth/logout_use_case.dart';
import 'package:flutter_application_1/domain/use_cases/auth/register_use_case.dart';
import 'package:flutter_application_1/domain/use_cases/auth/verify_email_use_case.dart';
import 'package:flutter_application_1/domain/use_cases/user/get_user_profile_use_case.dart';
import 'package:flutter_application_1/domain/use_cases/user/update_user_profile_use_case.dart';
import 'package:get_it/get_it.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

final getIt = GetIt.instance;

Future<void> init() async {
  // External
  final sharedPreferences = await SharedPreferences.getInstance();
  getIt.registerLazySingleton(() => sharedPreferences);
  getIt.registerLazySingleton(() => http.Client());

  // Data sources
  getIt.registerLazySingleton<AuthRemoteDataSource>(
    () => AuthRemoteDataSourceImpl(
      client: getIt(),
      localDataSource: getIt(),
    ),
  );
  getIt.registerLazySingleton<DentalRemoteDataSource>(
    () => DentalRemoteDataSourceImpl(
      client: getIt(),
      localDataSource: getIt(),
    ),
  );
  getIt.registerLazySingleton<LocalDataSource>(
    () => SharedPrefsDataSource(sharedPreferences: getIt()),
  );

  // Repositories
  getIt.registerLazySingleton<AuthRepository>(
    () => AuthRepositoryImpl(
      remoteDataSource: getIt(),
      localDataSource: getIt(),
    ),
  );
  getIt.registerLazySingleton<UserRepository>(
    () => UserRepositoryImpl(
      remoteDataSource: getIt(),
      localDataSource: getIt(),
    ),
  );
  getIt.registerLazySingleton<AppointmentRepository>(
    () => AppointmentRepositoryImpl(remoteDataSource: getIt()),
  );

  // Use cases
  getIt.registerLazySingleton(() => LoginUseCase(repository: getIt()));
  getIt.registerLazySingleton(() => RegisterUseCase(repository: getIt()));
  getIt.registerLazySingleton(() => LogoutUseCase(repository: getIt()));
  getIt.registerLazySingleton(() => VerifyEmailUseCase(repository: getIt()));
  getIt.registerLazySingleton(() => GetUserProfileUseCase(repository: getIt()));
  getIt.registerLazySingleton(() => UpdateUserProfileUseCase(repository: getIt()));
  getIt.registerLazySingleton(() => GetAppointmentsUseCase(repository: getIt()));
  getIt.registerLazySingleton(() => BookAppointmentUseCase(repository: getIt()));
}