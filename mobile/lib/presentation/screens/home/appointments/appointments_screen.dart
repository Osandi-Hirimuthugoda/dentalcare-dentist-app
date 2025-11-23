 
import 'package:flutter/material.dart';
import 'package:flutter_application_1/core/themes/colors.dart';
import 'package:flutter_application_1/core/themes/text_styles.dart';
import 'package:flutter_application_1/core/constants/route_names.dart';
import 'package:flutter_application_1/presentation/widgets/common/appointment_card.dart';

class AppointmentsScreen extends StatelessWidget {
  const AppointmentsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: AppColors.white),
          onPressed: () {
            Navigator.pushReplacementNamed(context, RouteNames.home);
          },
        ),
        title: const Text('My Appointments'),
        backgroundColor: AppColors.primary,
        foregroundColor: AppColors.white,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _buildAppointmentSection('Upcoming Appointments', _getUpcomingAppointments()),
          const SizedBox(height: 24),
          _buildAppointmentSection('Past Appointments', _getPastAppointments()),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          _showSnackBar(context, "Book appointment feature coming soon");
        },
        backgroundColor: AppColors.primary,
        child: const Icon(Icons.add, color: AppColors.white),
      ),
    );
  }

  void _showSnackBar(BuildContext context, String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        duration: const Duration(seconds: 2),
      ),
    );
  }

  Widget _buildAppointmentSection(String title, List<Widget> appointments) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: TextStyles.heading4.copyWith(color: AppColors.textPrimary),
        ),
        const SizedBox(height: 16),
        ...appointments,
      ],
    );
  }

  List<Widget> _getUpcomingAppointments() {
    return [
      AppointmentCard(
        title: 'Dental Checkup',
        dentistName: 'Dr. Kamal Fernando',
        dateTime: DateTime.now().add(const Duration(days: 1)),
        status: 'scheduled',
        color: AppColors.primary,
        isNext: true,
        onTap: () {
          // Show appointment details
        },
      ),
      const SizedBox(height: 12),
      AppointmentCard(
        title: 'Teeth Cleaning',
        dentistName: 'Dr. Sameera Perera',
        dateTime: DateTime.now().add(const Duration(days: 7)),
        status: 'scheduled',
        color: AppColors.info,
        onTap: () {
          // Show appointment details
        },
      ),
    ];
  }

  List<Widget> _getPastAppointments() {
    return [
      AppointmentCard(
        title: 'Root Canal Treatment',
        dentistName: 'Dr. Nimal Silva',
        dateTime: DateTime.now().subtract(const Duration(days: 30)),
        status: 'completed',
        color: AppColors.success,
        onTap: () {
          // Show appointment details
        },
      ),
      const SizedBox(height: 12),
      AppointmentCard(
        title: 'Regular Checkup',
        dentistName: 'Dr. Kamal Fernando',
        dateTime: DateTime.now().subtract(const Duration(days: 60)),
        status: 'completed',
        color: AppColors.success,
        onTap: () {
          // Show appointment details
        },
      ),
    ];
  }
}