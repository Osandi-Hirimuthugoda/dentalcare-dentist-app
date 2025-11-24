 
import 'package:flutter/material.dart';
import 'package:flutter_application_1/core/themes/colors.dart';
import 'package:flutter_application_1/core/themes/text_styles.dart';
import 'package:flutter_application_1/core/constants/route_names.dart';
import 'package:flutter_application_1/presentation/widgets/common/appointment_card.dart';
import 'package:flutter_application_1/presentation/widgets/common/bottom_navigation_bar_widget.dart';
import 'package:flutter_application_1/data/data_sources/remote/dental_remote_data_source.dart';
import 'package:flutter_application_1/injection_container.dart' as di;
import 'package:flutter_application_1/core/utils/extensions.dart';

class AppointmentsScreen extends StatefulWidget {
  const AppointmentsScreen({super.key});

  @override
  State<AppointmentsScreen> createState() => _AppointmentsScreenState();
}

class _AppointmentsScreenState extends State<AppointmentsScreen> {
  late final DentalRemoteDataSource _dentalDataSource;
  bool _isLoading = true;
  String? _errorMessage;
  List<Map<String, dynamic>> _upcomingAppointments = [];
  List<Map<String, dynamic>> _pastAppointments = [];

  @override
  void initState() {
    super.initState();
    _dentalDataSource = di.getIt<DentalRemoteDataSource>();
    _loadAppointments();
  }

  Future<void> _loadAppointments() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final appointmentsData = await _dentalDataSource.getAppointments();
      
      // Convert to List<Map<String, dynamic>>
      final appointments = appointmentsData.map((item) {
        if (item is Map<String, dynamic>) {
          return item;
        } else if (item is Map) {
          return Map<String, dynamic>.from(item);
        } else {
          return <String, dynamic>{};
        }
      }).where((item) => item.isNotEmpty).toList();
      
      // Process appointments
      final now = DateTime.now();
      final upcoming = <Map<String, dynamic>>[];
      final past = <Map<String, dynamic>>[];

      for (var appointment in appointments) {
        try {
          // Extract appointment data
          final startTimeStr = appointment['startTime']?.toString();
          if (startTimeStr == null || startTimeStr.isEmpty) continue;

          final startTime = DateTime.parse(startTimeStr);
          
          // Extract doctor name from populated doctor object
          final doctor = appointment['doctor'];
          final dentistName = doctor != null 
              ? (doctor['fullName'] ?? doctor['name'] ?? 'Unknown Doctor')
              : 'No Doctor Assigned';

          // Extract title/notes
          final title = appointment['notes']?.toString().isNotEmpty == true
              ? appointment['notes']
              : appointment['service']?.toString() ?? 'Dental Appointment';

          // Extract status
          final status = appointment['status']?.toString().toLowerCase() ?? 'scheduled';

          final appointmentData = {
            'id': appointment['_id']?.toString() ?? appointment['id']?.toString() ?? '',
            'title': title,
            'dentistName': dentistName,
            'dateTime': startTime,
            'status': status,
          };

          // Separate upcoming and past appointments
          if (startTime.isAfter(now) && status != 'cancelled' && status != 'completed') {
            upcoming.add(appointmentData);
          } else {
            past.add(appointmentData);
          }
        } catch (e) {
          debugPrint('❌ Error parsing appointment: $e');
          continue;
        }
      }

      // Sort upcoming by date (earliest first)
      upcoming.sort((a, b) => (a['dateTime'] as DateTime).compareTo(b['dateTime'] as DateTime));
      
      // Sort past by date (most recent first)
      past.sort((a, b) => (b['dateTime'] as DateTime).compareTo(a['dateTime'] as DateTime));

      setState(() {
        _upcomingAppointments = upcoming;
        _pastAppointments = past;
        _isLoading = false;
      });
    } catch (e) {
      debugPrint('❌ Error loading appointments: $e');
      setState(() {
        _errorMessage = 'Failed to load appointments. Please try again.';
        _isLoading = false;
      });
    }
  }

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'scheduled':
      case 'confirmed':
        return AppColors.primary;
      case 'completed':
        return AppColors.success;
      case 'cancelled':
        return AppColors.error;
      default:
        return AppColors.info;
    }
  }

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
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: AppColors.white),
            onPressed: _loadAppointments,
            tooltip: 'Refresh',
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _errorMessage != null
              ? Center(
                  child: Padding(
                    padding: const EdgeInsets.all(24.0),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.error_outline,
                          size: 64,
                          color: Colors.red.withValues(alpha: 0.5),
                        ),
                        const SizedBox(height: 16),
                        Text(
                          _errorMessage!,
                          style: TextStyles.bodyMedium,
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 16),
                        ElevatedButton(
                          onPressed: _loadAppointments,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.primary,
                          ),
                          child: const Text('Retry'),
                        ),
                      ],
                    ),
                  ),
                )
              : RefreshIndicator(
                  onRefresh: _loadAppointments,
                  child: ListView(
                    padding: const EdgeInsets.all(16),
                    children: [
                      _buildAppointmentSection(
                        'Upcoming Appointments',
                        _upcomingAppointments,
                        isUpcoming: true,
                      ),
                      const SizedBox(height: 24),
                      _buildAppointmentSection(
                        'Past Appointments',
                        _pastAppointments,
                        isUpcoming: false,
                      ),
                    ],
                  ),
                ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          Navigator.pushNamed(context, RouteNames.bookAppointment);
        },
        backgroundColor: AppColors.primary,
        child: const Icon(Icons.add, color: AppColors.white),
      ),
      bottomNavigationBar: BottomNavigationBarWidget(
        currentIndex: 1, // Appointments tab
        onTap: (index) {
          BottomNavigationBarWidget.navigateToScreen(context, index);
        },
      ),
    );
  }

  Widget _buildAppointmentSection(
    String title,
    List<Map<String, dynamic>> appointments, {
    required bool isUpcoming,
  }) {
    if (appointments.isEmpty) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: TextStyles.heading4.copyWith(color: AppColors.textPrimary),
          ),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: AppColors.grey100,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Center(
              child: Column(
                children: [
                  Icon(
                    Icons.calendar_today_outlined,
                    size: 48,
                    color: AppColors.textSecondary,
                  ),
                  const SizedBox(height: 12),
                  Text(
                    isUpcoming
                        ? 'No upcoming appointments'
                        : 'No past appointments',
                    style: TextStyles.bodyMedium.copyWith(
                      color: AppColors.textSecondary,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: TextStyles.heading4.copyWith(color: AppColors.textPrimary),
        ),
        const SizedBox(height: 16),
        ...appointments.asMap().entries.map((entry) {
          final index = entry.key;
          final appointment = entry.value;
          final isNext = isUpcoming && index == 0; // First upcoming is "next"
          
          return Padding(
            padding: EdgeInsets.only(bottom: index < appointments.length - 1 ? 12 : 0),
            child: AppointmentCard(
              title: appointment['title'] ?? 'Dental Appointment',
              dentistName: appointment['dentistName'] ?? 'Unknown Doctor',
              dateTime: appointment['dateTime'] as DateTime,
              status: appointment['status'] ?? 'scheduled',
              color: _getStatusColor(appointment['status'] ?? 'scheduled'),
              isNext: isNext,
              onTap: () {
                // Show appointment details
                _showAppointmentDetails(appointment);
              },
            ),
          );
        }),
      ],
    );
  }

  void _showAppointmentDetails(Map<String, dynamic> appointment) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => Container(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(
                    appointment['title'] ?? 'Dental Appointment',
                    style: TextStyles.heading4.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.close),
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),
            const SizedBox(height: 16),
            _buildDetailRow(Icons.person, 'Doctor', appointment['dentistName'] ?? 'Unknown'),
            const SizedBox(height: 12),
            _buildDetailRow(
              Icons.calendar_today,
              'Date',
              (appointment['dateTime'] as DateTime).toReadableDate,
            ),
            const SizedBox(height: 12),
            _buildDetailRow(
              Icons.access_time,
              'Time',
              (appointment['dateTime'] as DateTime).toReadableTime,
            ),
            const SizedBox(height: 12),
            _buildDetailRow(
              Icons.info_outline,
              'Status',
              (appointment['status'] ?? 'scheduled').toString().toUpperCase(),
            ),
            const SizedBox(height: 20),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () => Navigator.pop(context),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  padding: const EdgeInsets.symmetric(vertical: 12),
                ),
                child: const Text('Close'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDetailRow(IconData icon, String label, String value) {
    return Row(
      children: [
        Icon(icon, size: 20, color: AppColors.textSecondary),
        const SizedBox(width: 12),
        Text(
          '$label: ',
          style: TextStyles.bodyMedium.copyWith(
            color: AppColors.textSecondary,
            fontWeight: FontWeight.w500,
          ),
        ),
        Expanded(
          child: Text(
            value,
            style: TextStyles.bodyMedium.copyWith(
              color: AppColors.textPrimary,
            ),
          ),
        ),
      ],
    );
  }
}