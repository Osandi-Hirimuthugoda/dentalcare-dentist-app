import 'package:flutter/material.dart';
import 'package:flutter_application_1/core/themes/colors.dart';
import 'package:flutter_application_1/core/themes/text_styles.dart';
import 'package:flutter_application_1/core/constants/route_names.dart';
import 'package:flutter_application_1/data/data_sources/remote/dental_remote_data_source.dart';
import 'package:flutter_application_1/injection_container.dart' as di;
import 'package:flutter_application_1/presentation/widgets/common/bottom_navigation_bar_widget.dart';
import 'package:url_launcher/url_launcher.dart';

class HealthScreen extends StatefulWidget {
  const HealthScreen({super.key});

  @override
  State<HealthScreen> createState() => _HealthScreenState();
}

class _HealthScreenState extends State<HealthScreen> {
  late final DentalRemoteDataSource _dentalDataSource;
  List<dynamic> _recentActivities = [];
  bool _isLoadingActivities = true;
  String? _errorMessage;
  int _healthScore = 85;

  @override
  void initState() {
    super.initState();
    _dentalDataSource = di.getIt<DentalRemoteDataSource>();
    _loadRecentActivities();
    _loadHealthScore();
  }

  Future<void> _loadHealthScore() async {
    try {
      final appointments = await _dentalDataSource.getAppointments();
      final completed = appointments.where((a) =>
          (a['status'] ?? '').toString().toLowerCase() == 'completed').length;
      final total = appointments.length;
      int score = 70;
      if (total > 0) {
        score = (70 + (completed / total * 30)).round().clamp(0, 100);
      }
      if (mounted) setState(() => _healthScore = score);
    } catch (_) {}
  }

  Future<void> _loadRecentActivities() async {
    setState(() {
      _isLoadingActivities = true;
      _errorMessage = null;
    });

    try {
      final activities = await _dentalDataSource.getRecentActivities();
      if (mounted) {
        setState(() {
          _recentActivities = activities;
          _isLoadingActivities = false;
        });
      }
    } catch (e) {
      debugPrint('❌ Error loading recent activities: $e');
      if (mounted) {
        setState(() {
          _errorMessage = 'Failed to load recent activities';
          _isLoadingActivities = false;
        });
      }
    }
  }

  Future<void> _callEmergency() async {
    final uri = Uri(scheme: 'tel', path: '1990'); // Sri Lanka dental emergency
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Could not launch phone dialer')),
        );
      }
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
        title: const Text('Dental Health'),
        backgroundColor: AppColors.primary,
        foregroundColor: AppColors.white,
      ),
      body: RefreshIndicator(
        onRefresh: _loadRecentActivities,
        child: ListView(
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
    final scoreColor = _healthScore >= 80
        ? AppColors.success
        : _healthScore >= 60
            ? AppColors.warning
            : AppColors.error;
    final scoreLabel = _healthScore >= 80
        ? 'Good'
        : _healthScore >= 60
            ? 'Fair'
            : 'Needs Attention';

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
                    value: _healthScore / 100,
                    strokeWidth: 10,
                    backgroundColor: AppColors.grey300,
                    valueColor: AlwaysStoppedAnimation<Color>(scoreColor),
                  ),
                ),
                Column(
                  children: [
                    Text(
                      '$_healthScore%',
                      style: TextStyles.heading1.copyWith(color: scoreColor),
                    ),
                    Text(
                      scoreLabel,
                      style: TextStyles.bodySmall.copyWith(color: AppColors.textSecondary),
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 16),
            Text(
              _healthScore >= 80
                  ? 'Keep up the good work! Your dental hygiene is excellent.'
                  : _healthScore >= 60
                      ? 'Good progress! Consider scheduling a checkup soon.'
                      : 'Please schedule a dental appointment as soon as possible.',
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
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Recent Activities',
                  style: TextStyles.heading4.copyWith(color: AppColors.textPrimary),
                ),
                if (_isLoadingActivities)
                  const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  ),
              ],
            ),
            const SizedBox(height: 16),
            if (_isLoadingActivities && _recentActivities.isEmpty)
              const Center(
                child: Padding(
                  padding: EdgeInsets.all(20.0),
                  child: CircularProgressIndicator(),
                ),
              )
            else if (_errorMessage != null)
              Center(
                child: Padding(
                  padding: const EdgeInsets.all(20.0),
                  child: Column(
                    children: [
                      Icon(Icons.error_outline, color: AppColors.error, size: 48),
                      const SizedBox(height: 8),
                      Text(
                        _errorMessage!,
                        style: TextStyles.bodySmall.copyWith(color: AppColors.error),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 8),
                      TextButton(
                        onPressed: _loadRecentActivities,
                        child: const Text('Retry'),
                      ),
                    ],
                  ),
                ),
              )
            else if (_recentActivities.isEmpty)
              Center(
                child: Padding(
                  padding: const EdgeInsets.all(20.0),
                  child: Column(
                    children: [
                      Icon(Icons.history, color: AppColors.grey400, size: 48),
                      const SizedBox(height: 8),
                      Text(
                        'No recent activities',
                        style: TextStyles.bodySmall.copyWith(color: AppColors.textSecondary),
                        textAlign: TextAlign.center,
                      ),
                    ],
                  ),
                ),
              )
            else
              ..._recentActivities.map((activity) {
                final title = activity['title']?.toString() ?? 'Dental Visit';
                final date = activity['date']?.toString() ?? '';
                final description = activity['description']?.toString() ?? 
                    (activity['doctor'] != null && activity['doctor']['name'] != null
                        ? activity['doctor']['name'].toString()
                        : 'Dental Care Center');
                return _buildActivityItem(title, date, description);
              }).toList(),
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
                onPressed: _callEmergency,
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