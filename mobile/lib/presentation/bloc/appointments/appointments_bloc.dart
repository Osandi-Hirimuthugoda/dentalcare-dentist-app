import 'package:flutter_application_1/domain/use_cases/appointment/book_appointment_use_case.dart';
import 'package:flutter_application_1/domain/use_cases/appointment/get_appointments_use_case.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'appointments_event.dart';
import 'appointments_state.dart';

class AppointmentsBloc extends Bloc<AppointmentsEvent, AppointmentsState> {
  final GetAppointmentsUseCase getAppointmentsUseCase;
  final BookAppointmentUseCase bookAppointmentUseCase;

  AppointmentsBloc({
    required this.getAppointmentsUseCase,
    required this.bookAppointmentUseCase,
  }) : super(AppointmentsInitial()) {
    on<GetAppointmentsRequested>(_onGetAppointmentsRequested);
    on<BookAppointmentRequested>(_onBookAppointmentRequested);
  }

  Future<void> _onGetAppointmentsRequested(GetAppointmentsRequested event, Emitter<AppointmentsState> emit) async {
    emit(AppointmentsLoading());
    final result = await getAppointmentsUseCase.execute();
    
    result.fold(
      (failure) => emit(AppointmentsError(failure.message)),
      (appointments) => emit(AppointmentsLoaded(appointments)),
    );
  }

  Future<void> _onBookAppointmentRequested(BookAppointmentRequested event, Emitter<AppointmentsState> emit) async {
    emit(AppointmentsLoading());
    final result = await bookAppointmentUseCase.execute(
      doctorId: event.doctorId,
      dateTime: event.dateTime,
      service: event.service,
      notes: event.notes,
    );
    
    result.fold(
      (failure) => emit(AppointmentsError(failure.message)),
      (appointment) => emit(AppointmentBooked(appointment)),
    );
  }
}