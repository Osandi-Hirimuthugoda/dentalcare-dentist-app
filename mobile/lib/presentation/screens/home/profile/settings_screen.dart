import 'package:flutter/material.dart';
import 'package:flutter_application_1/core/constants/route_names.dart';
import 'package:flutter_application_1/core/themes/colors.dart';
import 'package:flutter_application_1/core/themes/text_styles.dart';
import 'package:flutter_application_1/core/utils/theme_notifier.dart';
import 'package:flutter_application_1/data/data_sources/remote/auth_remote_data_source.dart';
import 'package:flutter_application_1/injection_container.dart' as di;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:url_launcher/url_launcher.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  final ThemeNotifier _themeNotifier = ThemeNotifier();
  late final AuthRemoteDataSource _authDataSource;
  bool _isDarkMode = false;
  bool _isEyeComfortMode = false;
  bool _notificationsEnabled = true;
  bool _appointmentReminders = true;
  bool _healthTips = true;
  bool _promotionalOffers = false;
  String _language = 'English';
  bool _isChangingPassword = false;

  @override
  void initState() {
    super.initState();
    _authDataSource = di.getIt<AuthRemoteDataSource>();
    _loadSettings();
    _themeNotifier.addListener(_onThemeChanged);
  }

  @override
  void dispose() {
    _themeNotifier.removeListener(_onThemeChanged);
    super.dispose();
  }

  void _onThemeChanged() {
    setState(() {
      _isDarkMode = _themeNotifier.isDarkMode;
      _isEyeComfortMode = _themeNotifier.isEyeComfortMode;
    });
  }

  Future<void> _loadSettings() async {
    final prefs = await SharedPreferences.getInstance();
    await _themeNotifier.loadTheme();
    setState(() {
      _isDarkMode = _themeNotifier.isDarkMode;
      _isEyeComfortMode = _themeNotifier.isEyeComfortMode;
      _notificationsEnabled = prefs.getBool('notifications_enabled') ?? true;
      _appointmentReminders = prefs.getBool('appointment_reminders') ?? true;
      _healthTips = prefs.getBool('health_tips') ?? true;
      _promotionalOffers = prefs.getBool('promotional_offers') ?? false;
      _language = prefs.getString('language') ?? 'English';
    });
  }

  Future<void> _saveSetting(String key, dynamic value) async {
    final prefs = await SharedPreferences.getInstance();
    if (value is bool) {
      await prefs.setBool(key, value);
      // If dark mode changed, update theme immediately
      if (key == 'dark_mode') {
        await _themeNotifier.toggleTheme(value);
        _showSnackBar(value ? 'Dark mode enabled' : 'Light mode enabled');
      }
      // If eye comfort mode changed, update theme immediately
      if (key == 'eye_comfort_mode') {
        await _themeNotifier.toggleEyeComfortMode(value);
        _showSnackBar(value ? 'Eye comfort mode enabled' : 'Eye comfort mode disabled');
      }
    } else if (value is String) {
      await prefs.setString(key, value);
    }
  }

  void _showSnackBar(String message) {
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
            Navigator.pop(context);
          },
        ),
        title: const Text('Settings'),
        backgroundColor: AppColors.primary,
        foregroundColor: AppColors.white,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _buildSectionHeader('Appearance'),
          Card(
            child: Column(
              children: [
                SwitchListTile(
                  title: const Text('Dark Mode'),
                  subtitle: const Text('Switch between light and dark theme'),
                  value: _isDarkMode,
                  onChanged: (value) async {
                    await _saveSetting('dark_mode', value);
                  },
                  secondary: Icon(
                    _isDarkMode ? Icons.dark_mode : Icons.light_mode,
                    color: AppColors.primary,
                  ),
                ),
                const Divider(height: 1),
                SwitchListTile(
                  title: const Text('Eye Comfort Mode'),
                  subtitle: const Text('Warm colors for reduced eye strain'),
                  value: _isEyeComfortMode,
                  onChanged: (value) async {
                    await _saveSetting('eye_comfort_mode', value);
                  },
                  secondary: Icon(
                    Icons.visibility,
                    color: AppColors.primary,
                  ),
                ),
                ListTile(
                  leading: Icon(Icons.language, color: AppColors.primary),
                  title: const Text('Language'),
                  subtitle: Text(_language),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () => _showLanguageSelector(),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
          _buildSectionHeader('Notifications'),
          Card(
            child: Column(
              children: [
                ListTile(
                  leading: Icon(Icons.notifications, color: AppColors.primary),
                  title: const Text('View Notifications'),
                  subtitle: const Text('See all your notifications'),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () {
                    Navigator.pushNamed(context, RouteNames.notification);
                  },
                ),
                const Divider(height: 1),
                SwitchListTile(
                  title: const Text('Enable Notifications'),
                  subtitle: const Text('Receive push notifications'),
                  value: _notificationsEnabled,
                  onChanged: (value) {
                    setState(() {
                      _notificationsEnabled = value;
                    });
                    _saveSetting('notifications_enabled', value);
                  },
                  secondary: Icon(
                    Icons.notifications_active,
                    color: AppColors.primary,
                  ),
                ),
                if (_notificationsEnabled) ...[
                  const Divider(height: 1),
                  SwitchListTile(
                    title: const Text('Appointment Reminders'),
                    subtitle: const Text('Get reminders for upcoming appointments'),
                    value: _appointmentReminders,
                    onChanged: (value) {
                      setState(() {
                        _appointmentReminders = value;
                      });
                      _saveSetting('appointment_reminders', value);
                    },
                  ),
                  const Divider(height: 1),
                  SwitchListTile(
                    title: const Text('Health Tips'),
                    subtitle: const Text('Receive daily dental health tips'),
                    value: _healthTips,
                    onChanged: (value) {
                      setState(() {
                        _healthTips = value;
                      });
                      _saveSetting('health_tips', value);
                    },
                  ),
                  const Divider(height: 1),
                  SwitchListTile(
                    title: const Text('Promotional Offers'),
                    subtitle: const Text('Get notified about special offers'),
                    value: _promotionalOffers,
                    onChanged: (value) {
                      setState(() {
                        _promotionalOffers = value;
                      });
                      _saveSetting('promotional_offers', value);
                    },
                  ),
                ],
              ],
            ),
          ),
          const SizedBox(height: 24),
          _buildSectionHeader('Privacy & Security'),
          Card(
            child: Column(
              children: [
                ListTile(
                  leading: Icon(Icons.security, color: AppColors.primary),
                  title: const Text('Privacy & Security'),
                  subtitle: const Text('Manage your privacy settings'),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () => _showPrivacySecurity(),
                ),
                const Divider(height: 1),
                ListTile(
                  leading: Icon(Icons.lock, color: AppColors.primary),
                  title: const Text('Change Password'),
                  subtitle: const Text('Update your account password'),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () {
                    _showChangePasswordDialog();
                  },
                ),
                const Divider(height: 1),
                ListTile(
                  leading: Icon(Icons.fingerprint, color: AppColors.primary),
                  title: const Text('Biometric Authentication'),
                  subtitle: const Text('Use fingerprint or face ID to login'),
                  trailing: Switch(
                    value: false,
                    onChanged: (value) {
                      _showSnackBar('Biometric authentication coming soon!');
                    },
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
          _buildSectionHeader('Data & Storage'),
          Card(
            child: ListTile(
              leading: Icon(Icons.storage, color: AppColors.primary),
              title: const Text('Data & Storage'),
              subtitle: const Text('Manage storage and data settings'),
              trailing: const Icon(Icons.chevron_right),
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => const DataStorageScreen(),
                  ),
                );
              },
            ),
          ),
          const SizedBox(height: 24),
          _buildSectionHeader('About'),
          Card(
            child: ListTile(
              leading: Icon(Icons.info, color: AppColors.primary),
              title: const Text('About'),
              subtitle: const Text('App information and support'),
              trailing: const Icon(Icons.chevron_right),
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => const AboutScreen(),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8, top: 8),
      child: Text(
        title,
        style: TextStyles.heading4.copyWith(
          color: AppColors.textPrimary,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }

  void _showLanguageSelector() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Select Language'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            _buildLanguageOption('English', 'English'),
            _buildLanguageOption('සිංහල', 'Sinhala'),
            _buildLanguageOption('தமிழ்', 'Tamil'),
          ],
        ),
      ),
    );
  }

  Widget _buildLanguageOption(String label, String value) {
    return ListTile(
      title: Text(label),
      trailing: _language == value ? Icon(Icons.check, color: AppColors.primary) : null,
      onTap: () {
        setState(() {
          _language = value;
        });
        _saveSetting('language', value);
        Navigator.pop(context);
        _showSnackBar('Language changed to $label');
      },
    );
  }

  void _showPrivacySecurity() {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => PrivacySecurityScreen(),
      ),
    );
  }

  void _showChangePasswordDialog() {
    final oldPasswordController = TextEditingController();
    final newPasswordController = TextEditingController();
    final confirmPasswordController = TextEditingController();
    bool obscureOldPassword = true;
    bool obscureNewPassword = true;
    bool obscureConfirmPassword = true;

    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setState) => AlertDialog(
          title: Row(
            children: [
              const Icon(Icons.lock, color: AppColors.primary),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  'Change Password',
                  style: TextStyles.heading4,
                ),
              ),
            ],
          ),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(
                  controller: oldPasswordController,
                  obscureText: obscureOldPassword,
                  decoration: InputDecoration(
                    labelText: 'Current Password',
                    prefixIcon: const Icon(Icons.lock_outline),
                    suffixIcon: IconButton(
                      icon: Icon(obscureOldPassword ? Icons.visibility : Icons.visibility_off),
                      onPressed: () {
                        setState(() {
                          obscureOldPassword = !obscureOldPassword;
                        });
                      },
                    ),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: newPasswordController,
                  obscureText: obscureNewPassword,
                  decoration: InputDecoration(
                    labelText: 'New Password',
                    prefixIcon: const Icon(Icons.lock),
                    suffixIcon: IconButton(
                      icon: Icon(obscureNewPassword ? Icons.visibility : Icons.visibility_off),
                      onPressed: () {
                        setState(() {
                          obscureNewPassword = !obscureNewPassword;
                        });
                      },
                    ),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: confirmPasswordController,
                  obscureText: obscureConfirmPassword,
                  decoration: InputDecoration(
                    labelText: 'Confirm New Password',
                    prefixIcon: const Icon(Icons.lock),
                    suffixIcon: IconButton(
                      icon: Icon(obscureConfirmPassword ? Icons.visibility : Icons.visibility_off),
                      onPressed: () {
                        setState(() {
                          obscureConfirmPassword = !obscureConfirmPassword;
                        });
                      },
                    ),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Password must be at least 8 characters long',
                  style: TextStyle(fontSize: 12, color: AppColors.grey500),
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: _isChangingPassword ? null : () async {
                if (oldPasswordController.text.isEmpty ||
                    newPasswordController.text.isEmpty ||
                    confirmPasswordController.text.isEmpty) {
                  _showSnackBar('Please fill all fields');
                  return;
                }
                if (newPasswordController.text.length < 8) {
                  _showSnackBar('Password must be at least 8 characters');
                  return;
                }
                if (newPasswordController.text != confirmPasswordController.text) {
                  _showSnackBar('New passwords do not match');
                  return;
                }
                
                setState(() {
                  _isChangingPassword = true;
                });
                
                try {
                  await _authDataSource.changePassword(
                    oldPasswordController.text,
                    newPasswordController.text,
                  );
                  
                  if (mounted) {
                    Navigator.pop(context);
                    _showSnackBar('Password changed successfully');
                  }
                } catch (e) {
                  if (mounted) {
                    String errorMessage = 'Failed to change password';
                    if (e.toString().contains('Current password is incorrect')) {
                      errorMessage = 'Current password is incorrect';
                    } else if (e.toString().contains('Network')) {
                      errorMessage = 'Network error. Please check your connection.';
                    } else if (e.toString().contains('New password must be different')) {
                      errorMessage = 'New password must be different from current password';
                    }
                    _showSnackBar(errorMessage);
                  }
                } finally {
                  if (mounted) {
                    setState(() {
                      _isChangingPassword = false;
                    });
                  }
                }
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                disabledBackgroundColor: AppColors.grey400,
              ),
              child: _isChangingPassword
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        valueColor: AlwaysStoppedAnimation<Color>(AppColors.white),
                      ),
                    )
                  : const Text('Change Password'),
            ),
          ],
        ),
      ),
    );
  }

}

// Privacy & Security Screen
class PrivacySecurityScreen extends StatelessWidget {
  const PrivacySecurityScreen({super.key});

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
            Navigator.pop(context);
          },
        ),
        title: const Text('Privacy & Security'),
        backgroundColor: AppColors.primary,
        foregroundColor: AppColors.white,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _buildPrivacyItem(context, 'Data Privacy', 'How we use and protect your data', Icons.security),
          _buildPrivacyItem(context, 'Account Security', 'Two-factor authentication and security settings', Icons.lock),
          _buildPrivacyItem(context, 'Privacy Policy', 'Read our complete privacy policy', Icons.policy),
          _buildPrivacyItem(context, 'Terms of Service', 'Terms and conditions of using our app', Icons.description),
        ],
      ),
    );
  }

  Widget _buildPrivacyItem(BuildContext context, String title, String subtitle, IconData icon) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        leading: Icon(icon, color: AppColors.primary),
        title: Text(title),
        subtitle: Text(subtitle),
        trailing: const Icon(Icons.chevron_right),
        onTap: () {
          _handlePrivacyItemTap(context, title);
        },
      ),
    );
  }

  void _handlePrivacyItemTap(BuildContext context, String title) {
    switch (title) {
      case 'Data Privacy':
        _showDataPrivacy(context);
        break;
      case 'Account Security':
        _showAccountSecurity(context);
        break;
      case 'Privacy Policy':
        _showPrivacyPolicy(context);
        break;
      case 'Terms of Service':
        _showTermsOfService(context);
        break;
      default:
        _showSnackBar(context, 'Opening $title');
    }
  }

  void _showDataPrivacy(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Row(
          children: [
            const Icon(Icons.security, color: AppColors.primary),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                'Data Privacy',
                style: TextStyles.heading4,
              ),
            ),
          ],
        ),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'We are committed to protecting your personal information. Your data is encrypted and stored securely.',
                style: TextStyle(fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 16),
              const Text('How we protect your data:'),
              const SizedBox(height: 8),
              _buildPrivacyPoint('• End-to-end encryption for all sensitive data'),
              _buildPrivacyPoint('• Secure servers with regular security audits'),
              _buildPrivacyPoint('• Limited access to authorized personnel only'),
              _buildPrivacyPoint('• Regular backups to prevent data loss'),
              const SizedBox(height: 16),
              const Text('What data we collect:'),
              const SizedBox(height: 8),
              _buildPrivacyPoint('• Personal information (name, email, phone)'),
              _buildPrivacyPoint('• Medical records and appointment history'),
              _buildPrivacyPoint('• Payment information (encrypted)'),
              _buildPrivacyPoint('• App usage data for improvements'),
              const SizedBox(height: 16),
              const Text(
                'We never share your data with third parties without your explicit consent.',
                style: TextStyle(fontStyle: FontStyle.italic),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }

  void _showAccountSecurity(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Row(
          children: [
            const Icon(Icons.lock, color: AppColors.primary),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                'Account Security',
                style: TextStyles.heading4,
              ),
            ),
          ],
        ),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Your account is protected with secure authentication.',
                style: TextStyle(fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 16),
              const Text('Security recommendations:'),
              const SizedBox(height: 8),
              _buildPrivacyPoint('• Use a strong, unique password'),
              _buildPrivacyPoint('• Never share your login credentials'),
              _buildPrivacyPoint('• Log out when using shared devices'),
              _buildPrivacyPoint('• Enable two-factor authentication (coming soon)'),
              _buildPrivacyPoint('• Report any suspicious activity immediately'),
              const SizedBox(height: 16),
              const Text('Security features:'),
              const SizedBox(height: 8),
              _buildPrivacyPoint('• Secure password hashing'),
              _buildPrivacyPoint('• Session management'),
              _buildPrivacyPoint('• Automatic logout after inactivity'),
              _buildPrivacyPoint('• Login attempt monitoring'),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }

  void _showPrivacyPolicy(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Row(
          children: [
            const Icon(Icons.policy, color: AppColors.primary),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                'Privacy Policy',
                style: TextStyles.heading4,
              ),
            ),
          ],
        ),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Our Privacy Policy outlines how we collect, use, and protect your personal information.',
                style: TextStyle(fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 16),
              const Text('By using DentalCare+, you agree to our privacy practices.'),
              const SizedBox(height: 16),
              const Text('Key points:'),
              const SizedBox(height: 8),
              _buildPrivacyPoint('• We collect only necessary information'),
              _buildPrivacyPoint('• Your data is used solely for service provision'),
              _buildPrivacyPoint('• We implement industry-standard security measures'),
              _buildPrivacyPoint('• You can request data deletion at any time'),
              _buildPrivacyPoint('• We comply with data protection regulations'),
              const SizedBox(height: 16),
              const Text(
                'For the complete privacy policy, please visit our website or contact support.',
                style: TextStyle(fontStyle: FontStyle.italic),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }

  void _showTermsOfService(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Row(
          children: [
            const Icon(Icons.description, color: AppColors.primary),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                'Terms of Service',
                style: TextStyles.heading4,
              ),
            ),
          ],
        ),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'By using DentalCare+, you agree to our Terms of Service.',
                style: TextStyle(fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 16),
              const Text('These terms govern your use of our app and services.'),
              const SizedBox(height: 16),
              const Text('Important terms:'),
              const SizedBox(height: 8),
              _buildPrivacyPoint('• You must provide accurate information'),
              _buildPrivacyPoint('• You are responsible for account security'),
              _buildPrivacyPoint('• Appointments must be cancelled 24 hours in advance'),
              _buildPrivacyPoint('• We reserve the right to update these terms'),
              _buildPrivacyPoint('• Service availability is not guaranteed'),
              const SizedBox(height: 16),
              const Text(
                'For the complete terms, please visit our website or contact support.',
                style: TextStyle(fontStyle: FontStyle.italic),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }

  Widget _buildPrivacyPoint(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 4),
      child: Text(text, style: TextStyles.bodySmall),
    );
  }
}

// Data & Storage Screen
class DataStorageScreen extends StatefulWidget {
  const DataStorageScreen({super.key});

  @override
  State<DataStorageScreen> createState() => _DataStorageScreenState();
}

class _DataStorageScreenState extends State<DataStorageScreen> {
  void _showSnackBar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        duration: const Duration(seconds: 2),
      ),
    );
  }

  void _showStorageInfo() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Storage Usage'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildStorageItem('App Data', '25.3 MB'),
            const SizedBox(height: 8),
            _buildStorageItem('Cache', '12.7 MB'),
            const SizedBox(height: 8),
            _buildStorageItem('Total', '38.0 MB'),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }

  Widget _buildStorageItem(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: TextStyles.bodyMedium),
        Text(value, style: TextStyles.bodyMedium.copyWith(fontWeight: FontWeight.w600)),
      ],
    );
  }

  void _clearCache() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Clear Cache'),
        content: const Text('This will clear all cached data. Are you sure?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              _showSnackBar('Cache cleared successfully');
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
            ),
            child: const Text('Clear'),
          ),
        ],
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
            Navigator.pop(context);
          },
        ),
        title: const Text('Data & Storage'),
        backgroundColor: AppColors.primary,
        foregroundColor: AppColors.white,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            child: ListTile(
              leading: Icon(Icons.storage, color: AppColors.primary),
              title: const Text('Storage Usage'),
              subtitle: const Text('View app storage and cache'),
              trailing: const Icon(Icons.chevron_right),
              onTap: _showStorageInfo,
            ),
          ),
          const SizedBox(height: 12),
          Card(
            child: ListTile(
              leading: Icon(Icons.delete_outline, color: AppColors.error),
              title: const Text('Clear Cache'),
              subtitle: const Text('Free up storage space'),
              trailing: const Icon(Icons.chevron_right),
              onTap: _clearCache,
            ),
          ),
          const SizedBox(height: 12),
          Card(
            child: ListTile(
              leading: Icon(Icons.download, color: AppColors.primary),
              title: const Text('Export Data'),
              subtitle: const Text('Download your personal data'),
              trailing: const Icon(Icons.chevron_right),
              onTap: () {
                _showSnackBar('Data export feature coming soon!');
              },
            ),
          ),
        ],
      ),
    );
  }
}

// About Screen
class AboutScreen extends StatelessWidget {
  const AboutScreen({super.key});

  void _showSnackBar(BuildContext context, String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        duration: const Duration(seconds: 2),
      ),
    );
  }

  void _showRateAppDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Row(
          children: [
            const Icon(Icons.star, color: Colors.amber),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                'Rate DentalCare+',
                style: TextStyles.heading4,
              ),
            ),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text(
              'We hope you\'re enjoying DentalCare+!',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 16),
            ),
            const SizedBox(height: 16),
            const Text(
              'Your feedback helps us improve. Please rate us on the app store.',
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 20),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(5, (index) {
                return Icon(
                  Icons.star,
                  color: Colors.amber,
                  size: 32,
                );
              }),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Maybe Later'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              // App store rating will be implemented when app is published
              // For Android: market://details?id=com.example.dentalcare
              // For iOS: itms-apps://itunes.apple.com/app/id123456789
              _showSnackBar(context, 'Thank you for your support! App store rating coming soon.');
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
            ),
            child: const Text('Rate Now'),
          ),
        ],
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
            Navigator.pop(context);
          },
        ),
        title: const Text('About'),
        backgroundColor: AppColors.primary,
        foregroundColor: AppColors.white,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            child: ListTile(
              leading: Icon(Icons.info, color: AppColors.primary),
              title: const Text('About App'),
              subtitle: const Text('Version 1.0.0'),
              trailing: const Icon(Icons.chevron_right),
              onTap: () {
                showAboutDialog(
                  context: context,
                  applicationName: 'DentalCare+',
                  applicationVersion: '1.0.0',
                  applicationIcon: const CircleAvatar(
                    backgroundColor: AppColors.primary,
                    child: Icon(Icons.health_and_safety, color: Colors.white),
                  ),
                  children: [
                    const SizedBox(height: 20),
                    const Text(
                      'Your comprehensive dental care companion. '
                      'Schedule appointments, track treatments, and maintain your oral health with AI-powered assistance.',
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 15),
                    const Text('Developed with love for better dental health'),
                  ],
                );
              },
            ),
          ),
          const SizedBox(height: 12),
          Card(
            child: ListTile(
              leading: Icon(Icons.help, color: AppColors.primary),
              title: const Text('Help & Support'),
              subtitle: const Text('Get help and contact support'),
              trailing: const Icon(Icons.chevron_right),
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => const HelpSupportScreen(),
                  ),
                );
              },
            ),
          ),
          const SizedBox(height: 12),
          Card(
            child: ListTile(
              leading: Icon(Icons.star, color: AppColors.primary),
              title: const Text('Rate App'),
              subtitle: const Text('Rate us on the app store'),
              trailing: const Icon(Icons.chevron_right),
              onTap: () {
                _showRateAppDialog(context);
              },
            ),
          ),
        ],
      ),
    );
  }
}

// Help & Support Screen
class HelpSupportScreen extends StatelessWidget {
  const HelpSupportScreen({super.key});

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
            Navigator.pop(context);
          },
        ),
        title: const Text('Help & Support'),
        backgroundColor: AppColors.primary,
        foregroundColor: AppColors.white,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _buildHelpItem(context, 'FAQs', 'Frequently asked questions', Icons.help_outline),
          _buildHelpItem(context, 'Contact Support', 'Get in touch with our team', Icons.support_agent),
          _buildHelpItem(context, 'User Guide', 'How to use the app', Icons.book),
          _buildHelpItem(context, 'Report Issue', 'Report bugs or problems', Icons.bug_report),
          _buildHelpItem(context, 'Feature Request', 'Suggest new features', Icons.lightbulb),
          _buildHelpItem(context, 'Emergency Contact', 'Emergency dental services', Icons.emergency),
        ],
      ),
    );
  }

  Widget _buildHelpItem(BuildContext context, String title, String subtitle, IconData icon) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        leading: Icon(icon, color: AppColors.primary),
        title: Text(title),
        subtitle: Text(subtitle),
        trailing: const Icon(Icons.chevron_right),
        onTap: () {
          _handleHelpItemTap(context, title);
        },
      ),
    );
  }

  void _handleHelpItemTap(BuildContext context, String title) {
    switch (title) {
      case 'FAQs':
        _showFAQs(context);
        break;
      case 'Contact Support':
        _showContactSupport(context);
        break;
      case 'User Guide':
        _showUserGuide(context);
        break;
      case 'Report Issue':
        _showReportIssue(context);
        break;
      case 'Feature Request':
        _showFeatureRequest(context);
        break;
      case 'Emergency Contact':
        _showEmergencyContact(context);
        break;
      default:
        _showSnackBar(context, 'Opening $title');
    }
  }

  void _showFAQs(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Row(
          children: [
            const Icon(Icons.help_outline, color: AppColors.primary),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                'Frequently Asked Questions',
                style: TextStyles.heading4,
              ),
            ),
          ],
        ),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildFAQItem('How do I book an appointment?', 'Go to Book Appointment, select a doctor, date, and time. You can also call our clinic directly.'),
              const SizedBox(height: 16),
              _buildFAQItem('How do I view my bills?', 'Navigate to My Bills section from the home screen to view all your invoices and payment history.'),
              const SizedBox(height: 16),
              _buildFAQItem('Can I cancel an appointment?', 'Yes, you can cancel appointments from the Appointments section. Please cancel at least 24 hours in advance.'),
              const SizedBox(height: 16),
              _buildFAQItem('How do I contact my doctor?', 'Use the Messages section to chat with your doctor directly. You can also call the clinic.'),
              const SizedBox(height: 16),
              _buildFAQItem('Is my data secure?', 'Yes, we use encryption and follow strict security protocols to protect your personal information.'),
              const SizedBox(height: 16),
              _buildFAQItem('How do I update my profile?', 'Go to Profile section and tap Edit Profile to update your personal information.'),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }

  Widget _buildFAQItem(String question, String answer) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          question,
          style: TextStyles.bodyMedium.copyWith(
            fontWeight: FontWeight.bold,
            color: AppColors.primary,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          answer,
          style: TextStyles.bodySmall,
        ),
      ],
    );
  }

  void _showContactSupport(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Row(
          children: [
            const Icon(Icons.support_agent, color: AppColors.primary),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                'Contact Support',
                style: TextStyles.heading4,
              ),
            ),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Get in touch with our support team:'),
            const SizedBox(height: 16),
            _buildContactOption(context, Icons.email, 'Email', 'support@dentalcare.com', () {
              _launchEmail(context, 'support@dentalcare.com');
            }),
            const SizedBox(height: 12),
            _buildContactOption(context, Icons.phone, 'Phone', '+94 11 234 5678', () {
              _makePhoneCall(context, '+94112345678');
            }),
            const SizedBox(height: 12),
            _buildContactOption(context, Icons.chat, 'Live Chat', 'Available 9 AM - 6 PM', () {
              _showSnackBar(context, 'Live chat feature coming soon!');
            }),
            const SizedBox(height: 12),
            _buildContactOption(context, Icons.access_time, 'Business Hours', 'Mon-Fri: 9 AM - 6 PM\nSat: 9 AM - 1 PM', () {}),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }

  Widget _buildContactOption(BuildContext context, IconData icon, String label, String value, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 8),
        child: Row(
          children: [
            Icon(icon, color: AppColors.primary, size: 20),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(label, style: TextStyles.bodyMedium.copyWith(fontWeight: FontWeight.w600)),
                  Text(value, style: TextStyles.bodySmall),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showUserGuide(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Row(
          children: [
            const Icon(Icons.book, color: AppColors.primary),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                'User Guide',
                style: TextStyles.heading4,
              ),
            ),
          ],
        ),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Welcome to DentalCare+!',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
              ),
              const SizedBox(height: 12),
              const Text('Getting Started:', style: TextStyle(fontWeight: FontWeight.w600)),
              const SizedBox(height: 8),
              _buildGuideStep('1. Complete your profile with personal information'),
              _buildGuideStep('2. Book your first appointment with a doctor'),
              _buildGuideStep('3. Explore features like AI Teeth Scan'),
              _buildGuideStep('4. Track your treatments and history'),
              _buildGuideStep('5. Manage your bills and payments'),
              const SizedBox(height: 12),
              const Text('Key Features:', style: TextStyle(fontWeight: FontWeight.w600)),
              const SizedBox(height: 8),
              _buildGuideStep('• Book appointments with your preferred doctor'),
              _buildGuideStep('• Chat with doctors via Messages'),
              _buildGuideStep('• View treatment history'),
              _buildGuideStep('• Pay bills online'),
              _buildGuideStep('• Get health tips and reminders'),
              _buildGuideStep('• Receive appointment notifications'),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }

  Widget _buildGuideStep(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 4),
      child: Text(text, style: TextStyles.bodySmall),
    );
  }

  void _showReportIssue(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Row(
          children: [
            const Icon(Icons.bug_report, color: AppColors.primary),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                'Report Issue',
                style: TextStyles.heading4,
              ),
            ),
          ],
        ),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Found a bug or issue? We\'d love to help!'),
              const SizedBox(height: 16),
              const Text('Please provide:', style: TextStyle(fontWeight: FontWeight.w600)),
              const SizedBox(height: 8),
              _buildGuideStep('• Description of the issue'),
              _buildGuideStep('• Steps to reproduce'),
              _buildGuideStep('• Screenshots if possible'),
              _buildGuideStep('• Device information'),
              _buildGuideStep('• App version'),
              const SizedBox(height: 16),
              const Text('Contact us at:', style: TextStyle(fontWeight: FontWeight.w600)),
              const SizedBox(height: 8),
              _buildContactOption(context, Icons.email, 'Email', 'support@dentalcare.com', () {
                Navigator.pop(context);
                _launchEmail(context, 'support@dentalcare.com', subject: 'Bug Report');
              }),
              const SizedBox(height: 8),
              _buildContactOption(context, Icons.phone, 'Phone', '+94 11 234 5678', () {
                Navigator.pop(context);
                _makePhoneCall(context, '+94112345678');
              }),
              const SizedBox(height: 8),
              const Text(
                'We typically respond within 24 hours.',
                style: TextStyle(fontStyle: FontStyle.italic),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }

  void _showFeatureRequest(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Row(
          children: [
            const Icon(Icons.lightbulb, color: AppColors.primary),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                'Feature Request',
                style: TextStyles.heading4,
              ),
            ),
          ],
        ),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Have an idea for a new feature? We\'re all ears!'),
              const SizedBox(height: 16),
              const Text('Share your suggestions:', style: TextStyle(fontWeight: FontWeight.w600)),
              const SizedBox(height: 8),
              _buildGuideStep('• What feature would you like?'),
              _buildGuideStep('• How would it help you?'),
              _buildGuideStep('• Any specific requirements?'),
              _buildGuideStep('• Use cases or examples'),
              const SizedBox(height: 16),
              const Text('Contact us at:', style: TextStyle(fontWeight: FontWeight.w600)),
              const SizedBox(height: 8),
              _buildContactOption(context, Icons.email, 'Email', 'feedback@dentalcare.com', () {
                Navigator.pop(context);
                _launchEmail(context, 'feedback@dentalcare.com', subject: 'Feature Request');
              }),
              const SizedBox(height: 8),
              const Text(
                'We review all suggestions and implement the most requested features.',
                style: TextStyle(fontStyle: FontStyle.italic),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }

  void _showEmergencyContact(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Row(
          children: [
            const Icon(Icons.emergency, color: Colors.red),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                'Emergency Contact',
                style: TextStyles.heading4,
              ),
            ),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('For dental emergencies, contact:'),
            const SizedBox(height: 16),
            _buildContactOption(context, Icons.local_hospital, 'Emergency Line', '1990', () {
              _makePhoneCall(context, '1990');
            }),
            const SizedBox(height: 12),
            _buildContactOption(context, Icons.phone, '24/7 Dental Hotline', '+94 11 234 5678', () {
              _makePhoneCall(context, '+94112345678');
            }),
            const SizedBox(height: 12),
            _buildContactOption(context, Icons.medical_services, 'Emergency Clinic', 'Available 24/7', () {
              _showSnackBar(context, 'Emergency clinic available 24/7');
            }),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.red.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Text(
                'For life-threatening emergencies, call 1990 immediately.',
                style: TextStyle(color: Colors.red, fontWeight: FontWeight.w600),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }

  Future<void> _launchEmail(BuildContext context, String email, {String? subject}) async {
    try {
      final Uri emailUri = Uri(
        scheme: 'mailto',
        path: email,
        query: subject != null ? 'subject=${Uri.encodeComponent(subject)}' : 'subject=DentalCare+ Support Request',
      );
      if (await canLaunchUrl(emailUri)) {
        await launchUrl(emailUri);
      } else {
        if (context.mounted) {
          _showSnackBar(context, 'Cannot open email app');
        }
      }
    } catch (e) {
      if (context.mounted) {
        _showSnackBar(context, 'Cannot open email app');
      }
    }
  }

  Future<void> _makePhoneCall(BuildContext context, String phoneNumber) async {
    try {
      final Uri phoneUri = Uri(scheme: 'tel', path: phoneNumber);
      if (await canLaunchUrl(phoneUri)) {
        await launchUrl(phoneUri);
      } else {
        if (context.mounted) {
          _showSnackBar(context, 'Cannot make phone call');
        }
      }
    } catch (e) {
      if (context.mounted) {
        _showSnackBar(context, 'Cannot make phone call');
      }
    }
  }
}

