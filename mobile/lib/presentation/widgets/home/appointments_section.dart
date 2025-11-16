import 'package:flutter/material.dart';
import 'package:flutter_application_1/core/themes/colors.dart';
import 'package:flutter_application_1/core/themes/text_styles.dart';

class AppointmentsSection extends StatelessWidget {
  final BuildContext context;

  const AppointmentsSection({super.key, required this.context});

  @override
  Widget build(BuildContext context) {
    final List<Map<String, dynamic>> appointments = [
      {
        'id': '1',
        'title': 'Dental Checkup',
        'date': 'Tomorrow',
        'doctor': 'Dr. Kamal Fernando',
        'time': '10:30 AM',
        'color': Colors.blue,
        'icon': Icons.medical_services,
      },
      {
        'id': '2',
        'title': 'Teeth Cleaning',
        'date': 'Dec 13',
        'doctor': 'Dr. Sameera Perera',
        'time': '2:00 PM',
        'color': Colors.green,
        'icon': Icons.clean_hands,
      },
      {
        'id': '3',
        'title': 'Follow-up Visit',
        'date': 'Dec 20',
        'doctor': 'Dr. Nimal Silva',
        'time': '11:00 AM',
        'color': Colors.orange,
        'icon': Icons.assignment,
      },
    ];

    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.2),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Upcoming Appointments',
                style: TextStyles.heading1.copyWith(
                  fontWeight: FontWeight.bold,
                  color: AppColors.textPrimary,
                  fontSize: 22, 
                ),
              ),
              TextButton(
                onPressed: () {
                  // Navigate to appointments screen
                },
                child: Text(
                  'View All',
                  style: TextStyles.bodySmall.copyWith(
                    color: AppColors.primary,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Appointments List
          Column(
            children: appointments.map((appointment) {
              return _buildAppointmentCard(appointment);
            }).toList(),
          ),
        ],
      ),
    );
  }

  Widget _buildAppointmentCard(Map<String, dynamic> appointment) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.grey[50],
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: Colors.grey[200]!,
        ),
      ),
      child: Row(
        children: [
          // Circle Icon
          Container(
            width: 50,
            height: 50,
            decoration: BoxDecoration(
              color: appointment['color'].withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(
              appointment['icon'],
              color: appointment['color'],
              size: 24,
            ),
          ),
          const SizedBox(width: 12),

          // Appointment Details
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  appointment['title'],
                  style: TextStyles.bodyMedium.copyWith(
                    fontWeight: FontWeight.bold,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: appointment['color'].withOpacity(0.1),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        appointment['date'],
                        style: TextStyles.caption.copyWith(
                          color: appointment['color'],
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  appointment['doctor'],
                  style: TextStyles.bodySmall.copyWith(
                    color: AppColors.textSecondary,
                  ),
                ),
              ],
            ),
          ),

          // Time
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: AppColors.primary.withOpacity(0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Text(
              appointment['time'],
              style: TextStyles.caption.copyWith(
                color: AppColors.primary,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }
}