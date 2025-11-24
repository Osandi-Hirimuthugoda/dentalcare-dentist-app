import 'package:flutter/material.dart';
import 'package:flutter_application_1/core/constants/route_names.dart';
import 'package:flutter_application_1/core/themes/colors.dart';
import 'package:flutter_application_1/core/themes/text_styles.dart';
import 'package:flutter_application_1/core/utils/helpers.dart';
import 'package:flutter_application_1/data/data_sources/remote/dental_remote_data_source.dart';
import 'package:flutter_application_1/injection_container.dart';
import 'package:intl/intl.dart';

class AppointmentsSection extends StatefulWidget {
  final BuildContext context;

  const AppointmentsSection({super.key, required this.context});

  @override
  State<AppointmentsSection> createState() => _AppointmentsSectionState();
}

class _AppointmentsSectionState extends State<AppointmentsSection> {
  late final DentalRemoteDataSource _dentalDataSource;
  List<Map<String, dynamic>> _appointments = [];
  bool _isLoading = true;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _dentalDataSource = getIt<DentalRemoteDataSource>();
    _loadAppointments();
  }

  Future<void> _loadAppointments() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final appointments = await _dentalDataSource.getAppointments();
      
      // Filter upcoming appointments (status: pending, confirmed, and startTime in future)
      final now = DateTime.now();
      final upcoming = appointments.where((apt) {
        final status = apt['status'] as String? ?? '';
        final startTime = apt['startTime'] != null 
            ? DateTime.parse(apt['startTime'].toString()).toLocal()
            : null;
        
        return (status == 'pending' || status == 'confirmed') &&
               startTime != null &&
               startTime.isAfter(now);
      }).toList();

      // Sort by startTime (earliest first)
      upcoming.sort((a, b) {
        final aTime = a['startTime'] != null 
            ? DateTime.parse(a['startTime'].toString()).toLocal()
            : DateTime.now();
        final bTime = b['startTime'] != null 
            ? DateTime.parse(b['startTime'].toString()).toLocal()
            : DateTime.now();
        return aTime.compareTo(bTime);
      });

      // Take only the first 3 upcoming appointments
      final limitedAppointments = upcoming.take(3).map((apt) {
        final startTime = apt['startTime'] != null 
            ? DateTime.parse(apt['startTime'].toString()).toLocal()
            : DateTime.now();
        
        // Extract service name from notes
        String serviceName = 'Dental Checkup';
        if (apt['notes'] != null && apt['notes'].toString().isNotEmpty) {
          final notes = apt['notes'].toString();
          final parts = notes.split(':');
          if (parts.isNotEmpty) {
            serviceName = parts[0].trim();
          }
        }

        // Get doctor name
        String doctorName = 'Unknown Doctor';
        if (apt['doctor'] != null) {
          if (apt['doctor'] is Map) {
            doctorName = apt['doctor']['fullName'] ?? 'Unknown Doctor';
          } else {
            doctorName = apt['doctor'].toString();
          }
        }

        // Format date
        final dateFormat = DateFormat('MMM d, yyyy');
        final timeFormat = DateFormat('h:mm a');
        final dateStr = dateFormat.format(startTime);
        final timeStr = timeFormat.format(startTime);

        // Determine relative date
        String relativeDate = dateStr;
        final today = DateTime.now();
        final tomorrow = today.add(const Duration(days: 1));
        if (startTime.year == today.year &&
            startTime.month == today.month &&
            startTime.day == today.day) {
          relativeDate = 'Today';
        } else if (startTime.year == tomorrow.year &&
                   startTime.month == tomorrow.month &&
                   startTime.day == tomorrow.day) {
          relativeDate = 'Tomorrow';
        }

        // Determine color and icon based on service
        Color appointmentColor = Colors.blue;
        IconData appointmentIcon = Icons.medical_services;
        final serviceLower = serviceName.toLowerCase();
        if (serviceLower.contains('cleaning') || serviceLower.contains('scaling')) {
          appointmentColor = Colors.green;
          appointmentIcon = Icons.clean_hands;
        } else if (serviceLower.contains('checkup') || serviceLower.contains('consultation')) {
          appointmentColor = Colors.blue;
          appointmentIcon = Icons.medical_services;
        } else if (serviceLower.contains('follow') || serviceLower.contains('follow-up')) {
          appointmentColor = Colors.orange;
          appointmentIcon = Icons.assignment;
        } else if (serviceLower.contains('emergency')) {
          appointmentColor = Colors.red;
          appointmentIcon = Icons.emergency;
        }

        return {
          'id': apt['_id']?.toString() ?? '',
          'title': serviceName,
          'date': relativeDate,
          'fullDate': dateStr,
          'doctor': doctorName,
          'time': timeStr,
          'color': appointmentColor,
          'icon': appointmentIcon,
        };
      }).toList();

      if (mounted) {
        setState(() {
          _appointments = limitedAppointments;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _errorMessage = 'Failed to load appointments';
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withValues(alpha: 0.2),
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
                  // Check authentication before navigating to appointments screen
                  Helpers.navigateIfAuthenticated(widget.context, RouteNames.appointments);
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

          // Loading State
          if (_isLoading)
            const Center(
              child: Padding(
                padding: EdgeInsets.all(20.0),
                child: CircularProgressIndicator(),
              ),
            )
          // Error State
          else if (_errorMessage != null)
            Center(
              child: Padding(
                padding: const EdgeInsets.all(20.0),
                child: Column(
                  children: [
                    Text(
                      _errorMessage!,
                      style: TextStyles.bodyMedium.copyWith(
                        color: Colors.red,
                      ),
                    ),
                    const SizedBox(height: 8),
                    TextButton(
                      onPressed: _loadAppointments,
                      child: const Text('Retry'),
                    ),
                  ],
                ),
              ),
            )
          // Empty State
          else if (_appointments.isEmpty)
            Center(
              child: Padding(
                padding: const EdgeInsets.all(20.0),
                child: Text(
                  'No upcoming appointments',
                  style: TextStyles.bodyMedium.copyWith(
                    color: AppColors.textSecondary,
                  ),
                ),
              ),
            )
          // Appointments List
          else
          Column(
              children: _appointments.map((appointment) {
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
              color: (appointment['color'] as Color).withValues(alpha: 0.1),
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
                        color: (appointment['color'] as Color).withValues(alpha: 0.1),
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
              color: AppColors.primary.withValues(alpha: 0.1),
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