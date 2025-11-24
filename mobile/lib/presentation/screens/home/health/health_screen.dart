import 'package:flutter/material.dart';
import 'package:flutter_application_1/core/themes/colors.dart';
import 'package:flutter_application_1/core/themes/text_styles.dart';
import 'package:flutter_application_1/core/constants/route_names.dart';
import 'package:flutter_application_1/presentation/widgets/common/bottom_navigation_bar_widget.dart';

class HealthScreen extends StatelessWidget {
  const HealthScreen({super.key});

  void _showSnackBar(BuildContext context, String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        duration: const Duration(seconds: 2),
      ),
    );
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
        title: const Text('Dental Health'),
        backgroundColor: AppColors.primary,
        foregroundColor: AppColors.white,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _buildHealthScore(),
          const SizedBox(height: 24),
          _buildHealthTips(),
          const SizedBox(height: 24),
          _buildRecentActivities(),
          const SizedBox(height: 24),
          _buildEmergencySection(context),
        ],
      ),
      bottomNavigationBar: BottomNavigationBarWidget(
        currentIndex: 2, // Health tab
        onTap: (index) {
          BottomNavigationBarWidget.navigateToScreen(context, index);
        },
      ),
    );
  }

  Widget _buildHealthScore() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            Text(
              'Your Dental Health Score',
              style: TextStyles.heading4.copyWith(color: AppColors.textPrimary),
            ),
            const SizedBox(height: 16),
            Stack(
              alignment: Alignment.center,
              children: [
                SizedBox(
                  width: 150,
                  height: 150,
                  child: CircularProgressIndicator(
                    value: 0.85,
                    strokeWidth: 10,
                    backgroundColor: AppColors.grey300,
                    valueColor: const AlwaysStoppedAnimation<Color>(AppColors.success),
                  ),
                ),
                Column(
                  children: [
                    Text(
                      '85%',
                      style: TextStyles.heading1.copyWith(color: AppColors.success),
                    ),
                    Text(
                      'Good',
                      style: TextStyles.bodySmall.copyWith(color: AppColors.textSecondary),
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 16),
            Text(
              'Keep up the good work! Your dental hygiene is excellent.',
              textAlign: TextAlign.center,
              style: TextStyles.bodySmall.copyWith(color: AppColors.textSecondary),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHealthTips() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Daily Health Tips',
              style: TextStyles.heading4.copyWith(color: AppColors.textPrimary),
            ),
            const SizedBox(height: 16),
            _buildTipItem('🦷', 'Brush twice daily', 'Morning and night for 2 minutes'),
            _buildTipItem('🧵', 'Floss regularly', 'Remove food particles between teeth'),
            _buildTipItem('🍎', 'Healthy diet', 'Limit sugary foods and drinks'),
            _buildTipItem('👨‍⚕️', 'Regular checkups', 'Visit dentist every 6 months'),
          ],
        ),
      ),
    );
  }

  Widget _buildTipItem(String emoji, String title, String subtitle) {
    return ListTile(
      leading: Text(emoji, style: const TextStyle(fontSize: 24)),
      title: Text(title, style: TextStyles.bodyMedium),
      subtitle: Text(subtitle, style: TextStyles.bodySmall),
    );
  }

  Widget _buildRecentActivities() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Recent Activities',
              style: TextStyles.heading4.copyWith(color: AppColors.textPrimary),
            ),
            const SizedBox(height: 16),
            _buildActivityItem('Last Checkup', 'Dec 15, 2023', 'Dr. Kamal Fernando'),
            _buildActivityItem('Teeth Cleaning', 'Nov 20, 2023', 'Dr. Sameera Perera'),
            _buildActivityItem('X-Ray Scan', 'Oct 10, 2023', 'Dental Care Center'),
          ],
        ),
      ),
    );
  }

  Widget _buildActivityItem(String title, String date, String description) {
    return ListTile(
      leading: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: AppColors.primary.withValues(alpha: 0.1),
          shape: BoxShape.circle,
        ),
        child: Icon(Icons.medical_services, color: AppColors.primary, size: 20),
      ),
      title: Text(title, style: TextStyles.bodyMedium),
      subtitle: Text(description, style: TextStyles.bodySmall),
      trailing: Text(date, style: TextStyles.caption),
    );
  }

  Widget _buildEmergencySection(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Emergency Contact',
              style: TextStyles.heading4.copyWith(color: AppColors.textPrimary),
            ),
            const SizedBox(height: 16),
            ListTile(
              leading: Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: AppColors.error.withValues(alpha: 0.1),
                  shape: BoxShape.circle,
                ),
                child: Icon(Icons.emergency, color: AppColors.error, size: 24),
              ),
              title: Text('Emergency Dental Care', style: TextStyles.bodyMedium),
              subtitle: Text('24/7 emergency service', style: TextStyles.bodySmall),
              trailing: ElevatedButton(
                onPressed: () {
                  _showSnackBar(context, "Emergency call feature coming soon");
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.error,
                  foregroundColor: AppColors.white,
                ),
                child: const Text('Call Now'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}