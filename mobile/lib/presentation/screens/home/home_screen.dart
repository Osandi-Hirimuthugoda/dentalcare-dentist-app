import 'package:flutter/material.dart';
import 'package:flutter_application_1/core/constants/route_names.dart';
import 'package:flutter_application_1/core/services/notification_service.dart';
import 'package:flutter_application_1/core/utils/helpers.dart';
import 'package:flutter_application_1/presentation/widgets/home/appointments_section.dart';
import 'package:flutter_application_1/presentation/widgets/home/emergency_contact.dart';
import 'package:flutter_application_1/presentation/widgets/home/health_tips_carousel.dart.dart';
import 'package:flutter_application_1/presentation/widgets/home/quick_actions_grid.dart';
import 'package:flutter_application_1/presentation/widgets/home/welcome_section.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _currentIndex = 0;
  final NotificationService _notificationService = NotificationService();


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
        title: const Text(
          "DentalCare+",
          style: TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        backgroundColor: Colors.teal[700],
        elevation: 0,
        actions: [
          // Notification Icon with Badge
          Stack(
            children: [
              IconButton(
                icon: const Icon(Icons.notifications_none, color: Colors.white),
                onPressed: () {
                  // Check authentication before navigating
                  Helpers.navigateIfAuthenticated(context, RouteNames.notification);
                },
              ),
              if (_notificationService.unreadCount > 0)
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
                      _notificationService.unreadCount > 9 
                          ? '9+' 
                          : _notificationService.unreadCount.toString(),
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
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Welcome Section
            WelcomeSection(),
            
            // Quick Actions Grid
            const QuickActionsGrid(),
            
            // Upcoming Appointments
            AppointmentsSection(context: context),
            
            // Dental Health Tips
            HealthTipsCarousel(context: context),
            
            // Emergency Contact Section
            EmergencyContact(context: context),
          ],
        ),
      ),
      bottomNavigationBar: _buildBottomNavigationBar(context),
    );
  }
}