import 'package:flutter/material.dart';
import 'package:flutter_application_1/core/constants/route_names.dart';
import 'package:flutter_application_1/core/services/socket_service.dart';
import 'package:flutter_application_1/core/utils/helpers.dart';
import 'package:flutter_application_1/core/utils/theme_notifier.dart';
import 'package:flutter_application_1/data/data_sources/local/shared_prefs.dart';
import 'package:flutter_application_1/data/data_sources/remote/dental_remote_data_source.dart';
import 'package:flutter_application_1/injection_container.dart' as di;
import 'package:flutter_application_1/presentation/widgets/home/appointments_section.dart';
import 'package:flutter_application_1/presentation/widgets/home/emergency_contact.dart';
import 'package:flutter_application_1/presentation/widgets/home/health_tips_carousel.dart';
import 'package:flutter_application_1/presentation/widgets/home/quick_actions_grid.dart';
import 'package:flutter_application_1/presentation/widgets/home/welcome_section.dart';
import 'package:flutter_application_1/core/themes/colors.dart';
import 'package:flutter_application_1/presentation/screens/home/profile/settings_screen.dart';
import 'package:shared_preferences/shared_preferences.dart';

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
    _initSocket();
  }

  void _initSocket() {
    final socketService = di.getIt<SocketService>();
    final localData = di.getIt<LocalDataSource>();
    socketService.connect(localData);
    socketService.addNotificationListener(_onSocketNotification);
  }

  void _onSocketNotification(Map<String, dynamic> notif) {
    if (!mounted) return;
    setState(() => _unreadNotificationCount++);
    final title = notif['title']?.toString() ?? 'New notification';
    final message = notif['message']?.toString() ?? '';
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const Text('💬 ', style: TextStyle(fontSize: 18)),
            Expanded(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
                  if (message.isNotEmpty)
                    Text(message, style: const TextStyle(fontSize: 12, color: Colors.white70),
                        maxLines: 1, overflow: TextOverflow.ellipsis),
                ],
              ),
            ),
          ],
        ),
        backgroundColor: AppColors.primary,
        duration: const Duration(seconds: 4),
        action: SnackBarAction(
          label: 'View',
          textColor: Colors.white,
          onPressed: () => Navigator.pushNamed(context, '/messages'),
        ),
      ),
    );
  }

  @override
  void dispose() {
    di.getIt<SocketService>().removeNotificationListener(_onSocketNotification);
    super.dispose();
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
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    return Container(
      decoration: BoxDecoration(
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: isDark ? 0.5 : 0.1),
            blurRadius: 10,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: BottomNavigationBar(
        currentIndex: _currentIndex,
        type: BottomNavigationBarType.fixed,
        backgroundColor: theme.colorScheme.surface,
        selectedItemColor: theme.colorScheme.primary,
        unselectedItemColor: theme.colorScheme.onSurface.withValues(alpha: 0.6),
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

  void _showThemePicker() {
    final themeNotifier = ThemeNotifier();
    final isDark = themeNotifier.isDarkMode;
    final isEyeComfort = themeNotifier.isEyeComfortMode;
    
    showModalBottomSheet(
      context: context,
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
                Text(
                  'Choose Theme',
                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.close),
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),
            const SizedBox(height: 20),
            _buildThemeOption(
              context,
              'Light Mode',
              'Default light theme',
              Icons.light_mode,
              false,
              false,
              isDark == false && isEyeComfort == false,
            ),
            const SizedBox(height: 12),
            _buildThemeOption(
              context,
              'Dark Mode',
              'Dark theme for low light',
              Icons.dark_mode,
              true,
              false,
              isDark == true,
            ),
            const SizedBox(height: 12),
            _buildThemeOption(
              context,
              'Eye Comfort Mode',
              'Warm colors for reduced eye strain',
              Icons.visibility,
              false,
              true,
              isEyeComfort == true,
            ),
            const SizedBox(height: 20),
            TextButton(
              onPressed: () {
                Navigator.pop(context);
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => const SettingsScreen(),
                  ),
                );
              },
              child: const Text('More Settings'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildThemeOption(
    BuildContext context,
    String title,
    String subtitle,
    IconData icon,
    bool isDark,
    bool isEyeComfort,
    bool isSelected,
  ) {
    final theme = Theme.of(context);
    return InkWell(
      onTap: () async {
        final themeNotifier = ThemeNotifier();
        if (isDark) {
          await themeNotifier.toggleTheme(true);
        } else if (isEyeComfort) {
          await themeNotifier.toggleEyeComfortMode(true);
        } else {
          await themeNotifier.toggleTheme(false);
          await themeNotifier.toggleEyeComfortMode(false);
        }
        if (context.mounted) {
          Navigator.pop(context);
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('$title enabled'),
              duration: const Duration(seconds: 1),
            ),
          );
        }
      },
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: isSelected
              ? theme.colorScheme.primary.withValues(alpha: 0.1)
              : theme.colorScheme.surface,
          border: Border.all(
            color: isSelected
                ? theme.colorScheme.primary
                : theme.colorScheme.outline.withValues(alpha: 0.2),
            width: isSelected ? 2 : 1,
          ),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(
          children: [
            Icon(
              icon,
              color: isSelected
                  ? theme.colorScheme.primary
                  : theme.colorScheme.onSurface,
              size: 28,
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: theme.textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w600,
                      color: isSelected
                          ? theme.colorScheme.primary
                          : theme.colorScheme.onSurface,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    subtitle,
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: theme.colorScheme.onSurface.withValues(alpha: 0.7),
                    ),
                  ),
                ],
              ),
            ),
            if (isSelected)
              Icon(
                Icons.check_circle,
                color: theme.colorScheme.primary,
              ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      backgroundColor: theme.scaffoldBackgroundColor,
      appBar: AppBar(
        title: Row(
          children: [
            Icon(
              Icons.health_and_safety,
              color: theme.colorScheme.onPrimary,
              size: 28,
            ),
            const SizedBox(width: 12),
            Text(
              "DentalCare+",
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: theme.colorScheme.onPrimary,
              ),
            ),
          ],
        ),
        backgroundColor: theme.colorScheme.primary,
        elevation: 0,
        actions: [
          // Theme Picker Button
          IconButton(
            icon: Icon(
              theme.brightness == Brightness.dark
                  ? Icons.dark_mode
                  : Icons.light_mode,
              color: theme.colorScheme.onPrimary,
            ),
            tooltip: 'Change Theme',
            onPressed: _showThemePicker,
          ),
          // Notification Icon with Badge
          Stack(
            children: [
              IconButton(
                icon: Icon(
                  Icons.notifications_none,
                  color: theme.colorScheme.onPrimary,
                ),
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
                      color: AppColors.error,
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
                      style: TextStyle(
                        color: theme.colorScheme.onError,
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
            icon: Icon(
              Icons.logout,
              color: theme.colorScheme.onPrimary,
            ),
            onPressed: () async {
              final sp = await SharedPreferences.getInstance();
              await sp.remove('auth_token');
              await sp.remove('user_data');
              await sp.remove('is_logged_in');
              if (mounted) {
                Navigator.pushNamedAndRemoveUntil(
                  context,
                  RouteNames.login,
                  (route) => false,
                );
              }
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
    final theme = Theme.of(context);
    if (_isLoadingStats) {
      return Padding(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
        child: Row(
          children: List.generate(2, (index) => Expanded(
            child: Container(
              height: 100,
              margin: EdgeInsets.only(right: index == 0 ? 10 : 0),
              decoration: BoxDecoration(
                color: theme.colorScheme.surface.withValues(alpha: 0.5),
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
    final theme = Theme.of(context);
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: theme.colorScheme.surface,
          borderRadius: BorderRadius.circular(15),
          boxShadow: [
            BoxShadow(
              color: theme.brightness == Brightness.dark
                  ? Colors.black.withValues(alpha: 0.3)
                  : Colors.grey.withValues(alpha: 0.1),
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
                color: theme.colorScheme.onSurface.withValues(alpha: 0.6),
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
    );
  }
}