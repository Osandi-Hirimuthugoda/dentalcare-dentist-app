import 'package:flutter/material.dart';
import 'package:flutter_application_1/core/constants/route_names.dart';
import 'package:flutter_application_1/core/utils/helpers.dart';
import 'package:flutter_application_1/data/data_sources/remote/dental_remote_data_source.dart';
import 'package:flutter_application_1/injection_container.dart' as di;
import 'package:flutter_application_1/presentation/widgets/home/appointments_section.dart';
import 'package:flutter_application_1/presentation/widgets/home/emergency_contact.dart';
import 'package:flutter_application_1/presentation/widgets/home/health_tips_carousel.dart.dart';
import 'package:flutter_application_1/presentation/widgets/home/quick_actions_grid.dart';
import 'package:flutter_application_1/presentation/widgets/home/welcome_section.dart';
import 'package:flutter_application_1/core/themes/colors.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _currentIndex = 0;
  late final DentalRemoteDataSource _dentalDataSource;
  int _unreadNotificationCount = 0;
  Map<String, dynamic> _stats = {
    'upcomingAppointments': 0,
    'totalAppointments': 0,
    'pendingBills': 0,
    'healthScore': 85,
  };
  bool _isLoadingStats = true;

  @override
  void initState() {
    super.initState();
    _dentalDataSource = di.getIt<DentalRemoteDataSource>();
    _loadNotificationCount();
    _loadStats();
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    // Reload notification count when returning to home screen
    _loadNotificationCount();
  }

  Future<void> _loadNotificationCount() async {
    try {
      final notifications = await _dentalDataSource.getNotifications();
      final unreadCount = notifications.where((n) => !(n['isRead'] ?? false)).length;
      if (mounted) {
        setState(() {
          _unreadNotificationCount = unreadCount;
        });
      }
    } catch (e) {
      debugPrint('❌ Error loading notification count: $e');
      // Don't show error to user, just keep count at 0
    }
  }

  Future<void> _loadStats() async {
    setState(() {
      _isLoadingStats = true;
    });

    try {
      final appointments = await _dentalDataSource.getAppointments();
      final bills = await _dentalDataSource.getBills();
      final now = DateTime.now();

      final upcoming = appointments.where((apt) {
        final status = apt['status'] as String? ?? '';
        if (status != 'pending' && status != 'confirmed') return false;
        final startTime = apt['startTime'] != null 
            ? DateTime.parse(apt['startTime'].toString()).toLocal()
            : null;
        return startTime != null && startTime.isAfter(now);
      }).length;

      final pendingBills = bills.where((bill) {
        final status = bill['status'] as String? ?? '';
        return status != 'paid';
      }).length;

      if (mounted) {
        setState(() {
          _stats = {
            'upcomingAppointments': upcoming,
            'totalAppointments': appointments.length,
            'pendingBills': pendingBills,
            'healthScore': 85, // Can be calculated from health data
          };
          _isLoadingStats = false;
        });
      }
    } catch (e) {
      debugPrint('Error loading stats: $e');
      if (mounted) {
        setState(() {
          _isLoadingStats = false;
        });
      }
    }
  }

  Future<void> _onRefresh() async {
    await Future.wait([
      _loadNotificationCount(),
      _loadStats(),
    ]);

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Dashboard refreshed'),
          duration: Duration(seconds: 1),
          backgroundColor: AppColors.primary,
        ),
      );
    }
  }


  void _onItemTapped(int index, BuildContext context) {
    setState(() {
      _currentIndex = index;
    });

    switch (index) {
      case 0: // Home
        // Already on home screen, do nothing
        break;
      case 1: // Appointments
        // Check authentication before navigating
        Helpers.navigateIfAuthenticated(context, RouteNames.appointments);
        break;
      case 2: // Health
        // Check authentication before navigating
        Helpers.navigateIfAuthenticated(context, RouteNames.health);
        break;
      case 3: // Profile
        // Check authentication before navigating
        Helpers.navigateIfAuthenticated(context, RouteNames.profile);
        break;
    }
  }

  Widget _buildBottomNavigationBar(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withValues(alpha: 0.3),
            blurRadius: 10,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: BottomNavigationBar(
        currentIndex: _currentIndex,
        type: BottomNavigationBarType.fixed,
        backgroundColor: Colors.white,
        selectedItemColor: Colors.teal[700],
        unselectedItemColor: Colors.grey[600],
        selectedLabelStyle: const TextStyle(fontWeight: FontWeight.w600),
        onTap: (index) => _onItemTapped(index, context),
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.home),
            label: 'Home',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.calendar_today),
            label: 'Appointments',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.health_and_safety),
            label: 'Health',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.person),
            label: 'Profile',
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[50],
      appBar: AppBar(
        title: Row(
          children: [
            const Icon(
              Icons.health_and_safety,
              color: Colors.white,
              size: 28,
            ),
            const SizedBox(width: 12),
            const Text(
              "DentalCare+",
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
          ],
        ),
        backgroundColor: Colors.teal[700],
        elevation: 0,
        actions: [
          // Notification Icon with Badge
          Stack(
            children: [
              IconButton(
                icon: const Icon(Icons.notifications_none, color: Colors.white),
                tooltip: 'Notifications',
                onPressed: () async {
                  try {
                    // Check authentication before navigating
                    await Helpers.navigateIfAuthenticated(context, RouteNames.notification);
                    // Reload notification count when returning
                    if (mounted) {
                      _loadNotificationCount();
                    }
                  } catch (e) {
                    debugPrint('Error navigating to notifications: $e');
                  }
                },
              ),
              if (_unreadNotificationCount > 0)
                Positioned(
                  right: 8,
                  top: 8,
                  child: Container(
                    padding: const EdgeInsets.all(2),
                    decoration: BoxDecoration(
                      color: Colors.red,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    constraints: const BoxConstraints(
                      minWidth: 16,
                      minHeight: 16,
                    ),
                    child: Text(
                      _unreadNotificationCount > 9 
                          ? '9+' 
                          : _unreadNotificationCount.toString(),
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ),
                ),
            ],
          ),
          IconButton(
            icon: const Icon(Icons.logout, color: Colors.white),
            onPressed: () {
              Navigator.pushReplacementNamed(context, RouteNames.login);
            },
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _onRefresh,
        color: AppColors.primary,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Welcome Section
              WelcomeSection(),
              
              // Statistics Cards
              _buildStatsSection(),
              
              // Quick Actions Grid
              const QuickActionsGrid(),
              
              // Upcoming Appointments
              AppointmentsSection(context: context),
              
              // Dental Health Tips
              HealthTipsCarousel(context: context),
              
              // Emergency Contact Section
              EmergencyContact(context: context),
              
              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
      bottomNavigationBar: _buildBottomNavigationBar(context),
    );
  }

  Widget _buildStatsSection() {
    if (_isLoadingStats) {
      return Padding(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
        child: Row(
          children: List.generate(2, (index) => Expanded(
            child: Container(
              height: 100,
              margin: EdgeInsets.only(right: index == 0 ? 10 : 0),
              decoration: BoxDecoration(
                color: Colors.grey[200],
                borderRadius: BorderRadius.circular(15),
              ),
            ),
          )),
        ),
      );
    }

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
      child: Row(
        children: [
          Expanded(
            child: _buildStatCard(
              icon: Icons.calendar_today,
              title: 'Upcoming',
              value: _stats['upcomingAppointments'].toString(),
              color: AppColors.primary,
              onTap: () {
                _onItemTapped(1, context);
              },
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: _buildStatCard(
              icon: Icons.receipt_long,
              title: 'Pending Bills',
              value: _stats['pendingBills'].toString(),
              color: Colors.orange,
              onTap: () {
                Helpers.navigateIfAuthenticated(context, RouteNames.myBills);
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatCard({
    required IconData icon,
    required String title,
    required String value,
    required Color color,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(15),
          boxShadow: [
            BoxShadow(
              color: Colors.grey.withValues(alpha: 0.1),
              blurRadius: 10,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(icon, color: color, size: 20),
            ),
            const SizedBox(height: 12),
            Text(
              value,
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              title,
              style: TextStyle(
                fontSize: 12,
                color: Colors.grey[600],
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
    );
  }
}