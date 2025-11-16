import 'package:equatable/equatable.dart';
//import 'package:dental_care/domain/entities/user_entity.dart';
import 'package:flutter_application_1/domain/entities/user_entity.dart';

abstract class UserEvent extends Equatable {
  const UserEvent();

  @override
  List<Object> get props => [];
}

class GetUserProfileRequested extends UserEvent {
  final String userId;

  const GetUserProfileRequested(this.userId);

  @override
  List<Object> get props => [userId];
}

class UpdateUserProfileRequested extends UserEvent {
  final UserEntity user;

  const UpdateUserProfileRequested(this.user);

  @override
  List<Object> get props => [user];
}