import 'package:flutter/material.dart';
import 'package:flutter_application_1/domain/repositories/auth_repository.dart';
import 'package:flutter_application_1/injection_container.dart' as di;
import 'package:flutter_application_1/data/data_sources/remote/dental_remote_data_source.dart';
import 'package:flutter_application_1/injection_container.dart';
import 'package:intl/intl.dart';
import 'package:flutter_application_1/core/themes/colors.dart';

class WelcomeSection extends StatefulWidget {
  const WelcomeSection({super.key});

  @override
  State<WelcomeSection> createState() => _WelcomeSectionState();
}

class _WelcomeSectionState extends State<WelcomeSection> {
  String _userName = "User";
  bool _isLoading = true;
  String? _nextAppointmentDate;
  String? _nextAppointmentTime;
  bool _hasNextAppointment = false;

  late final DentalRemoteDataSource _dentalDataSource;

  @override
  void initState() {
    super.initState();
    _dentalDataSource = getIt<DentalRemoteDataSource>();
    _loadUserData();
    _loadNextAppointment();
  }

  Future<void> _loadUserData() async {
    try {
      final authRepo = di.getIt<AuthRepository>();
      final result = await authRepo.getCurrentUser();
      
      result.fold(
        (failure) {
          // If error, keep default "User"
          if (mounted) {
            setState(() {
              _userName = "User";
              _isLoading = false;
            });
          }
        },
        (user) {
          if (mounted) {
            setState(() {
              _userName = user?.name ?? "User";
              _isLoading = false;
            });
          }
        },
      );
    } catch (e) {
      if (mounted) {
        setState(() {
          _userName = "User";
          _isLoading = false;
        });
      }
    }
  }

  Future<void> _loadNextAppointment() async {
    try {
      final appointments = await _dentalDataSource.getAppointments();
      
      // Find the next upcoming appointment
      final now = DateTime.now();
      DateTime? nextAppointmentTime;
      
      for (var apt in appointments) {
        final status = apt['status'] as String? ?? '';
        if (status != 'pending' && status != 'confirmed') continue;
        
        final startTime = apt['startTime'] != null 
            ? DateTime.parse(apt['startTime'].toString()).toLocal()
            : null;
        
        if (startTime != null && startTime.isAfter(now)) {
          if (nextAppointmentTime == null || startTime.isBefore(nextAppointmentTime)) {
            nextAppointmentTime = startTime;
          }
        }
      }

      if (mounted) {
        setState(() {
          if (nextAppointmentTime != null) {
            final dateFormat = DateFormat('MMM d, yyyy');
            final timeFormat = DateFormat('h:mm a');
            _nextAppointmentDate = dateFormat.format(nextAppointmentTime);
            _nextAppointmentTime = timeFormat.format(nextAppointmentTime);
            _hasNextAppointment = true;
          } else {
            _hasNextAppointment = false;
          }
        });
      }
    } catch (e) {
      // Silently fail - don't show error for next appointment
      if (mounted) {
        setState(() {
          _hasNextAppointment = false;
        });
      }
    }
  }

  String _getGreeting() {
    final hour = DateTime.now().hour;
    if (hour < 12) {
      return "Good Morning!";
    } else if (hour < 17) {
      return "Good Afternoon!";
    } else {
      return "Good Evening!";
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            AppColors.primary,
            AppColors.primaryDark,
          ],
        ),
        borderRadius: const BorderRadius.only(
          bottomLeft: Radius.circular(30),
          bottomRight: Radius.circular(30),
        ),
        boxShadow: [
          BoxShadow(
            color: AppColors.primary.withValues(alpha: 0.3),
            blurRadius: 15,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            _getGreeting(),
            style: const TextStyle(
              fontSize: 18,
              color: Colors.white70,
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 5),
          _isLoading
              ? const SizedBox(
                  height: 24,
                  width: 24,
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                  ),
                )
              : Text(
                  _userName,
                  style: const TextStyle(
                    fontSize: 24,
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                  ),
                ),
          const SizedBox(height: 15),
          Container(
            padding: const EdgeInsets.all(15),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.2),
              borderRadius: BorderRadius.circular(15),
            ),
            child: Row(
              children: [
                const Icon(Icons.health_and_safety, color: Colors.white, size: 20),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        "Your Dental Health",
                        style: TextStyle(
                          color: Colors.white70,
                          fontSize: 14,
                        ),
                      ),
                      Text(
                        _hasNextAppointment && _nextAppointmentDate != null && _nextAppointmentTime != null
                            ? "Next Checkup: $_nextAppointmentDate, $_nextAppointmentTime"
                            : "No upcoming appointments",
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: Colors.green,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: const Text(
                    "Good",
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}