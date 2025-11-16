import 'package:flutter_application_1/domain/use_cases/user/get_user_profile_use_case.dart';
import 'package:flutter_application_1/domain/use_cases/user/update_user_profile_use_case.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
// import 'package:dental_care/domain/use_cases/user/get_user_profile_use_case.dart';
// import 'package:dental_care/domain/use_cases/user/update_user_profile_use_case.dart';
import 'user_event.dart';
import 'user_state.dart';

class UserBloc extends Bloc<UserEvent, UserState> {
  final GetUserProfileUseCase getUserProfileUseCase;
  final UpdateUserProfileUseCase updateUserProfileUseCase;

  UserBloc({
    required this.getUserProfileUseCase,
    required this.updateUserProfileUseCase,
  }) : super(UserInitial()) {
    on<GetUserProfileRequested>(_onGetUserProfileRequested);
    on<UpdateUserProfileRequested>(_onUpdateUserProfileRequested);
  }

  Future<void> _onGetUserProfileRequested(GetUserProfileRequested event, Emitter<UserState> emit) async {
    emit(UserLoading());
    final result = await getUserProfileUseCase.execute(event.userId);
    
    result.fold(
      (failure) => emit(UserError(failure.message)),
      (user) => emit(UserLoaded(user)),
    );
  }

  Future<void> _onUpdateUserProfileRequested(UpdateUserProfileRequested event, Emitter<UserState> emit) async {
    emit(UserLoading());
    final result = await updateUserProfileUseCase.execute(event.user);
    
    result.fold(
      (failure) => emit(UserError(failure.message)),
      (user) => emit(UserLoaded(user)),
    );
  }
}