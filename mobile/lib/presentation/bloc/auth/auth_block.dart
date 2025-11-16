import 'package:flutter_application_1/domain/use_cases/auth/login_use_case.dart';
import 'package:flutter_application_1/domain/use_cases/auth/logout_use_case.dart';
import 'package:flutter_application_1/domain/use_cases/auth/register_use_case.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
// import 'package:dental_care/domain/use_cases/auth/login_use_case.dart';
// import 'package:dental_care/domain/use_cases/auth/register_use_case.dart';
// import 'package:dental_care/domain/use_cases/auth/logout_use_case.dart';
import 'auth_event.dart';
import 'auth_state.dart';

class AuthBloc extends Bloc<AuthEvent, AuthState> {
  final LoginUseCase loginUseCase;
  final RegisterUseCase registerUseCase;
  final LogoutUseCase logoutUseCase;

  AuthBloc({
    required this.loginUseCase,
    required this.registerUseCase,
    required this.logoutUseCase,
  }) : super(AuthInitial()) {
    on<LoginRequested>(_onLoginRequested);
    on<RegisterRequested>(_onRegisterRequested);
    on<LogoutRequested>(_onLogoutRequested);
  }

  Future<void> _onLoginRequested(LoginRequested event, Emitter<AuthState> emit) async {
    emit(AuthLoading());
    final result = await loginUseCase.execute(event.email, event.password);
    
    result.fold(
      (failure) => emit(AuthError(failure.message)),
      (user) => emit(AuthAuthenticated(user)),
    );
  }

  Future<void> _onRegisterRequested(RegisterRequested event, Emitter<AuthState> emit) async {
    emit(AuthLoading());
    final result = await registerUseCase.execute(event.user, event.password);
    
    result.fold(
      (failure) => emit(AuthError(failure.message)),
      (user) => emit(AuthAuthenticated(user)),
    );
  }

  Future<void> _onLogoutRequested(LogoutRequested event, Emitter<AuthState> emit) async {
    emit(AuthLoading());
    final result = await logoutUseCase.execute();
    
    result.fold(
      (failure) => emit(AuthError(failure.message)),
      (_) => emit(AuthUnauthenticated()),
    );
  }
}