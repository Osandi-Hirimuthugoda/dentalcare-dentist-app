import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'dart:io';
import 'package:flutter_application_1/core/constants/route_names.dart';
import 'package:flutter_application_1/core/themes/colors.dart';
import 'package:flutter_application_1/core/themes/text_styles.dart';
import 'package:flutter_application_1/core/utils/extensions.dart';
import 'package:flutter_application_1/data/data_sources/remote/auth_remote_data_source.dart';
import 'package:flutter_application_1/domain/repositories/auth_repository.dart';
import 'package:flutter_application_1/injection_container.dart' as di;
import 'package:flutter_application_1/presentation/screens/home/profile/settings_screen.dart';
import 'package:flutter_application_1/presentation/widgets/common/bottom_navigation_bar_widget.dart';
import 'package:url_launcher/url_launcher.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  File? _profileImage;
  final ImagePicker _picker = ImagePicker();
  late final AuthRemoteDataSource _authDataSource;
  late final AuthRepository _authRepository;
  
  // User data
  String _name = '';
  String _email = '';
  String _phone = '';
  String _gender = '';
  String _age = '';
  String _bloodGroup = '';
  String _address = '';
  
  bool _isLoading = true;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _authDataSource = di.getIt<AuthRemoteDataSource>();
    _authRepository = di.getIt<AuthRepository>();
    _loadUserProfile();
  }

  Future<void> _loadUserProfile() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final userData = await _authDataSource.getCurrentUser();
      
      setState(() {
        _name = userData['name']?.toString() ?? '';
        _email = userData['email']?.toString() ?? '';
        _phone = userData['phone']?.toString() ?? '';
        _gender = userData['gender']?.toString() ?? '';
        if (userData['age'] != null) {
          _age = '${userData['age']} years';
        } else {
          _age = '';
        }
        _bloodGroup = userData['bloodGroup']?.toString() ?? '';
        _address = userData['address']?.toString() ?? '';
        _isLoading = false;
      });
    } catch (e) {
      debugPrint('❌ Error loading user profile: $e');
      setState(() {
        _errorMessage = 'Failed to load profile. Please try again.';
        _isLoading = false;
      });
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

  Future<void> _pickImageFromGallery() async {
    final XFile? image = await _picker.pickImage(
      source: ImageSource.gallery,
      maxWidth: 800,
      maxHeight: 800,
      imageQuality: 80,
    );

    if (image != null) {
      setState(() {
        _profileImage = File(image.path);
      });
      _showSnackBar('Profile picture updated');
    }
  }

  Future<void> _pickImageFromCamera() async {
    final XFile? image = await _picker.pickImage(
      source: ImageSource.camera,
      maxWidth: 800,
      maxHeight: 800,
      imageQuality: 80,
    );

    if (image != null) {
      setState(() {
        _profileImage = File(image.path);
      });
      _showSnackBar('Profile picture updated');
    }
  }

  void _showImagePickerOptions() {
    showModalBottomSheet(
      context: context,
      builder: (context) => Container(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text(
              'Choose Profile Picture',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 20),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                _buildImageOption(Icons.camera_alt, 'Camera', _pickImageFromCamera),
                _buildImageOption(Icons.photo_library, 'Gallery', _pickImageFromGallery),
              ],
            ),
            const SizedBox(height: 20),
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildImageOption(IconData icon, String label, VoidCallback onTap) {
    return Column(
      children: [
        CircleAvatar(
          radius: 30,
          backgroundColor: AppColors.primary.withValues(alpha: 0.1),
          child: IconButton(
            icon: Icon(icon, color: AppColors.primary),
            onPressed: () {
              Navigator.pop(context);
              onTap();
            },
          ),
        ),
        const SizedBox(height: 8),
        Text(label),
      ],
    );
  }

  void _editProfile() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (context) => _buildEditProfileSheet(),
    );
  }

  Widget _buildEditProfileSheet() {
    final TextEditingController nameController = TextEditingController(text: _name);
    final TextEditingController emailController = TextEditingController(text: _email);
    final TextEditingController phoneController = TextEditingController(text: _phone);
    final TextEditingController ageController = TextEditingController(text: _age);
    final TextEditingController addressController = TextEditingController(text: _address);

    return Container(
      padding: const EdgeInsets.all(20),
      height: MediaQuery.of(context).size.height * 0.9,
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Edit Profile',
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
              ),
              IconButton(
                icon: const Icon(Icons.close),
                onPressed: () => Navigator.pop(context),
              ),
            ],
          ),
          const SizedBox(height: 20),
          Expanded(
            child: SingleChildScrollView(
              child: Column(
                children: [
                  // Profile Picture Edit
                  GestureDetector(
                    onTap: _showImagePickerOptions,
                    child: Stack(
                      children: [
                        CircleAvatar(
                          radius: 60,
                          backgroundColor: AppColors.primaryLight,
                          backgroundImage: _profileImage != null 
                              ? FileImage(_profileImage!) 
                              : null,
                          child: _profileImage == null
                              ? const Icon(
                                  Icons.person,
                                  size: 60,
                                  color: AppColors.primary,
                                )
                              : null,
                        ),
                        Positioned(
                          bottom: 0,
                          right: 0,
                          child: Container(
                            padding: const EdgeInsets.all(6),
                            decoration: BoxDecoration(
                              color: AppColors.primary,
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(
                              Icons.camera_alt,
                              color: Colors.white,
                              size: 20,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),
                  
                  // Edit Form
                  _buildEditFormField('Full Name', nameController, Icons.person),
                  _buildEditFormField('Email', emailController, Icons.email, enabled: false),
                  _buildEditFormField('Phone', phoneController, Icons.phone),
                  _buildEditFormField('Age', ageController, Icons.cake),
                  _buildEditFormField('Address', addressController, Icons.location_on),
                  
                  // Gender Dropdown
                  Container(
                    margin: const EdgeInsets.only(bottom: 15),
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    decoration: BoxDecoration(
                      border: Border.all(color: Colors.grey),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: DropdownButton<String>(
                      value: _gender.isNotEmpty 
                          ? _gender.capitalizeFirst 
                          : null,
                      isExpanded: true,
                      underline: const SizedBox(),
                      hint: const Text('Select Gender'),
                      items: ['Male', 'Female', 'Other']
                          .map((gender) => DropdownMenuItem(
                                value: gender,
                                child: Text(gender),
                              ))
                          .toList(),
                      onChanged: (value) {
                        setState(() {
                          _gender = value?.toLowerCase() ?? '';
                        });
                      },
                    ),
                  ),
                  const SizedBox(height: 15),
                  
                  // Blood Group Dropdown
                  Container(
                    margin: const EdgeInsets.only(bottom: 15),
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    decoration: BoxDecoration(
                      border: Border.all(color: Colors.grey),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: DropdownButton<String>(
                      value: _bloodGroup.isNotEmpty ? _bloodGroup : null,
                      isExpanded: true,
                      underline: const SizedBox(),
                      hint: const Text('Select Blood Group'),
                      items: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
                          .map((blood) => DropdownMenuItem(
                                value: blood,
                                child: Text(blood),
                              ))
                          .toList(),
                      onChanged: (value) {
                        setState(() {
                          _bloodGroup = value ?? '';
                        });
                      },
                    ),
                  ),
                  const SizedBox(height: 30),
                  
                  // Save Button
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: () async {
                        try {
                          // Extract age number from string
                          int? ageValue;
                          if (ageController.text.isNotEmpty) {
                            final ageMatch = RegExp(r'\d+').firstMatch(ageController.text);
                            if (ageMatch != null) {
                              ageValue = int.tryParse(ageMatch.group(0) ?? '');
                            }
                          }
                          
                          // Update profile via API
                          final updatedUser = await _authDataSource.updateProfile({
                            'name': nameController.text.trim(),
                            'phone': phoneController.text.trim(),
                            'age': ageValue,
                            'gender': _gender.toLowerCase(),
                            'bloodGroup': _bloodGroup.isNotEmpty ? _bloodGroup : null,
                            'address': addressController.text.trim(),
                          });
                          
                          // Update local state
                          setState(() {
                            _name = updatedUser['name']?.toString() ?? nameController.text;
                            _phone = updatedUser['phone']?.toString() ?? phoneController.text;
                            if (updatedUser['age'] != null) {
                              _age = '${updatedUser['age']} years';
                            } else {
                              _age = ageController.text;
                            }
                            _gender = updatedUser['gender']?.toString() ?? _gender;
                            _bloodGroup = updatedUser['bloodGroup']?.toString() ?? _bloodGroup;
                            _address = updatedUser['address']?.toString() ?? addressController.text;
                          });
                          
                          if (mounted) {
                            Navigator.pop(context);
                            _showSnackBar('Profile updated successfully');
                          }
                        } catch (e) {
                          debugPrint(' Error updating profile: $e');
                          if (mounted) {
                            _showSnackBar('Failed to update profile. Please try again.');
                          }
                        }
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        foregroundColor: AppColors.white,
                        padding: const EdgeInsets.symmetric(vertical: 15),
                      ),
                      child: const Text('Save Changes'),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEditFormField(String label, TextEditingController controller, IconData icon, {bool enabled = true}) {
    return Container(
      margin: const EdgeInsets.only(bottom: 15),
      child: TextField(
        controller: controller,
        enabled: enabled,
        decoration: InputDecoration(
          labelText: label,
          prefixIcon: Icon(icon),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
          ),
          filled: !enabled,
          fillColor: enabled ? null : Colors.grey.withValues(alpha: 0.1),
        ),
      ),
    );
  }

  // Removed - now handled in SettingsScreen
  // Unused methods - kept for potential future use
  // ignore: unused_element
  void _showPrivacySecurity() {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => Scaffold(
          appBar: AppBar(
            title: const Text('Privacy & Security'),
            backgroundColor: AppColors.primary,
            foregroundColor: AppColors.white,
          ),
          body: ListView(
            padding: const EdgeInsets.all(16),
            children: [
              _buildPrivacyItem(
                'Data Privacy',
                'How we use and protect your data',
                Icons.security,
              ),
              _buildPrivacyItem(
                'Account Security',
                'Two-factor authentication and security settings',
                Icons.lock,
              ),
              _buildPrivacyItem(
                'Privacy Policy',
                'Read our complete privacy policy',
                Icons.policy,
              ),
              _buildPrivacyItem(
                'Terms of Service',
                'Terms and conditions of using our app',
                Icons.description,
              ),
              _buildPrivacyItem(
                'Data Export',
                'Download your personal data',
                Icons.download,
              ),
              _buildPrivacyItem(
                'Delete Account',
                'Permanently delete your account',
                Icons.delete,
                isDelete: true,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPrivacyItem(String title, String subtitle, IconData icon, {bool isDelete = false}) {
    return ListTile(
      leading: Icon(
        icon,
        color: isDelete ? AppColors.error : AppColors.primary,
      ),
      title: Text(
        title,
        style: TextStyle(
          color: isDelete ? AppColors.error : AppColors.textPrimary,
        ),
      ),
      subtitle: Text(subtitle),
      trailing: const Icon(Icons.chevron_right),
      onTap: () {
        if (isDelete) {
          _showDeleteConfirmation();
        } else {
          _showPrivacyContent(title, subtitle);
        }
      },
    );
  }

  void _showPrivacyContent(String title, String subtitle) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(title),
        content: SingleChildScrollView(
          child: Text(
            _getPrivacyContent(title),
            style: TextStyles.bodyMedium,
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

  String _getPrivacyContent(String title) {
    switch (title) {
      case 'Data Privacy':
        return 'We are committed to protecting your personal information. Your data is encrypted and stored securely. We only use your information to provide dental care services and improve your experience. We never share your data with third parties without your consent.';
      case 'Account Security':
        return 'Your account is protected with secure authentication. We recommend:\n\n• Use a strong password\n• Never share your login credentials\n• Log out when using shared devices\n• Report any suspicious activity immediately';
      case 'Privacy Policy':
        return 'Our Privacy Policy outlines how we collect, use, and protect your personal information. By using DentalCare+, you agree to our privacy practices. For the complete privacy policy, please visit our website or contact support.';
      case 'Terms of Service':
        return 'By using DentalCare+, you agree to our Terms of Service. These terms govern your use of our app and services. Please read them carefully. For the complete terms, please visit our website or contact support.';
      case 'Data Export':
        return 'You can request a copy of all your personal data stored in our system. To export your data:\n\n1. Contact our support team\n2. Verify your identity\n3. Receive your data in a secure format\n\nThis process may take up to 7 business days.';
      default:
        return 'Information about $title';
    }
  }

  void _showDeleteConfirmation() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Account'),
        content: const Text('Are you sure you want to delete your account? This action cannot be undone.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              _showSnackBar('Account deletion requested');
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.error,
            ),
            child: const Text('Delete'),
          ),
        ],
      ),
    );
  }

  // ignore: unused_element
  void _showHelpSupport() {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => Scaffold(
          appBar: AppBar(
            title: const Text('Help & Support'),
            backgroundColor: AppColors.primary,
            foregroundColor: AppColors.white,
          ),
          body: ListView(
            padding: const EdgeInsets.all(16),
            children: [
              _buildHelpItem('FAQs', 'Frequently asked questions', Icons.help_outline),
              _buildHelpItem('Contact Support', 'Get in touch with our team', Icons.support_agent),
              _buildHelpItem('User Guide', 'How to use the app', Icons.book),
              _buildHelpItem('Report Issue', 'Report bugs or problems', Icons.bug_report),
              _buildHelpItem('Feature Request', 'Suggest new features', Icons.lightbulb),
              _buildHelpItem('Emergency Contact', 'Emergency dental services', Icons.emergency),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHelpItem(String title, String subtitle, IconData icon) {
    return ListTile(
      leading: Icon(icon, color: AppColors.primary),
      title: Text(title),
      subtitle: Text(subtitle),
      trailing: const Icon(Icons.chevron_right),
      onTap: () {
        _showHelpContent(title, subtitle, icon);
      },
    );
  }

  void _showHelpContent(String title, String subtitle, IconData icon) {
    if (title == 'Contact Support') {
      _showContactSupport();
    } else if (title == 'Emergency Contact') {
      _showEmergencyContact();
    } else {
      showDialog(
        context: context,
        builder: (context) => AlertDialog(
          title: Row(
            children: [
              Icon(icon, color: AppColors.primary),
              const SizedBox(width: 8),
              Expanded(child: Text(title)),
            ],
          ),
          content: SingleChildScrollView(
            child: Text(
              _getHelpContent(title, subtitle),
              style: TextStyles.bodyMedium,
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
  }

  String _getHelpContent(String title, String subtitle) {
    switch (title) {
      case 'FAQs':
        return 'Frequently Asked Questions:\n\nQ: How do I book an appointment?\nA: Go to Book Appointment, select a doctor, date, and time.\n\nQ: How do I view my bills?\nA: Navigate to My Bills section from the home screen.\n\nQ: Can I cancel an appointment?\nA: Yes, you can cancel appointments from the Appointments section.\n\nQ: How do I contact my doctor?\nA: Use the Messages section to chat with your doctor.\n\nQ: Is my data secure?\nA: Yes, we use encryption and follow strict security protocols.';
      case 'User Guide':
        return 'Welcome to DentalCare+!\n\nGetting Started:\n1. Complete your profile\n2. Book your first appointment\n3. Explore features like AI Teeth Scan\n4. Track your treatments\n5. Manage your bills\n\nFeatures:\n• Book appointments with your preferred doctor\n• Chat with doctors via Messages\n• View treatment history\n• Pay bills online\n• Get health tips and reminders\n\nFor more help, contact our support team.';
      case 'Report Issue':
        return 'Found a bug or issue? We\'d love to help!\n\nPlease provide:\n• Description of the issue\n• Steps to reproduce\n• Screenshots if possible\n• Device information\n\nContact us at:\nEmail: support@dentalcare.com\nPhone: +94 11 234 5678\n\nWe typically respond within 24 hours.';
      case 'Feature Request':
        return 'Have an idea for a new feature? We\'re all ears!\n\nShare your suggestions:\n• What feature would you like?\n• How would it help you?\n• Any specific requirements?\n\nContact us at:\nEmail: feedback@dentalcare.com\n\nWe review all suggestions and implement the most requested features.';
      default:
        return subtitle;
    }
  }

  void _showContactSupport() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Contact Support'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Get in touch with our support team:'),
            const SizedBox(height: 16),
            _buildContactOption(Icons.email, 'Email', 'support@dentalcare.com', () {
              _launchEmail('support@dentalcare.com');
            }),
            const SizedBox(height: 12),
            _buildContactOption(Icons.phone, 'Phone', '+94 11 234 5678', () {
              _makePhoneCall('+94112345678');
            }),
            const SizedBox(height: 12),
            _buildContactOption(Icons.chat, 'Live Chat', 'Available 9 AM - 6 PM', () {
              _showSnackBar('Live chat feature coming soon!');
            }),
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

  Widget _buildContactOption(IconData icon, String label, String value, VoidCallback onTap) {
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

  void _showEmergencyContact() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Row(
          children: [
            Icon(Icons.emergency, color: Colors.red),
            SizedBox(width: 8),
            Text('Emergency Contact'),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('For dental emergencies, contact:'),
            const SizedBox(height: 16),
            _buildContactOption(Icons.local_hospital, 'Emergency Line', '1990', () {
              _makePhoneCall('1990');
            }),
            const SizedBox(height: 12),
            _buildContactOption(Icons.phone, '24/7 Dental Hotline', '+94 11 234 5678', () {
              _makePhoneCall('+94112345678');
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

  Future<void> _launchEmail(String email) async {
    final Uri emailUri = Uri(
      scheme: 'mailto',
      path: email,
      query: 'subject=DentalCare+ Support Request',
    );
    if (await canLaunchUrl(emailUri)) {
      await launchUrl(emailUri);
    } else {
      _showSnackBar('Cannot open email app');
    }
  }

  Future<void> _makePhoneCall(String phoneNumber) async {
    final Uri phoneUri = Uri(scheme: 'tel', path: phoneNumber);
    if (await canLaunchUrl(phoneUri)) {
      await launchUrl(phoneUri);
    } else {
      _showSnackBar('Cannot make phone call');
    }
  }

  // ignore: unused_element
  void _showAboutApp() {
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
        const Text('Developed with Love for better dental health'),
        const SizedBox(height: 10),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            TextButton.icon(
              onPressed: () {
                // Open app store rating page
                _showSnackBar('Thank you for your interest! Rating feature coming soon.');
              },
              icon: const Icon(Icons.star),
              label: const Text('Rate App'),
            ),
            TextButton.icon(
              onPressed: () {
                _shareApp();
              },
              icon: const Icon(Icons.share),
              label: const Text('Share'),
            ),
          ],
        ),
      ],
    );
  }

  Future<void> _shareApp() async {
    const String shareText = 'Check out DentalCare+ - Your comprehensive dental care companion! Download now.';
    // In a real app, you would use share_plus package
    _showSnackBar('Share: $shareText');
  }

  void _logout() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Logout'),
        content: const Text('Are you sure you want to logout?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () async {
              Navigator.pop(context);
              try {
                // Clear authentication data
                final result = await _authRepository.logout();
                result.fold(
                  (failure) {
                    // Even if logout fails, clear local data and navigate
                    debugPrint('Logout error: ${failure.message}');
                  },
                  (_) {
                    debugPrint('Logout successful');
                  },
                );
                // Navigate to login screen
                if (mounted && context.mounted) {
                  Navigator.pushNamedAndRemoveUntil(
                    context,
                    RouteNames.login,
                    (route) => false,
                  );
                }
              } catch (e) {
                debugPrint('Logout error: $e');
                // Navigate anyway
                if (mounted && context.mounted) {
                  Navigator.pushNamedAndRemoveUntil(
                    context,
                    RouteNames.login,
                    (route) => false,
                  );
                }
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
            ),
            child: const Text('Logout'),
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
            Navigator.pushReplacementNamed(context, RouteNames.home);
          },
        ),
        title: const Text('My Profile'),
        backgroundColor: AppColors.primary,
        foregroundColor: AppColors.white,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _errorMessage != null
              ? Center(
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
                        onPressed: _loadUserProfile,
                        child: const Text('Retry'),
                      ),
                    ],
                  ),
                )
              : RefreshIndicator(
                  onRefresh: _loadUserProfile,
                  child: ListView(
                    padding: const EdgeInsets.all(16),
                    children: [
                      _buildProfileHeader(),
                      const SizedBox(height: 24),
                      _buildProfileSection(),
                      const SizedBox(height: 24),
                      _buildSettingsSection(),
                    ],
                  ),
                ),
      bottomNavigationBar: BottomNavigationBarWidget(
        currentIndex: 3, // Profile tab
        onTap: (index) {
          BottomNavigationBarWidget.navigateToScreen(context, index);
        },
      ),
    );
  }

  Widget _buildProfileHeader() {
    return Column(
      children: [
        GestureDetector(
          onTap: _showImagePickerOptions,
          child: Stack(
            children: [
              CircleAvatar(
                radius: 50,
                backgroundColor: AppColors.primaryLight,
                backgroundImage: _profileImage != null 
                    ? FileImage(_profileImage!) 
                    : null,
                child: _profileImage == null
                    ? const Icon(
                        Icons.person,
                        size: 60,
                        color: AppColors.primary,
                      )
                    : null,
              ),
              Positioned(
                bottom: 0,
                right: 0,
                child: Container(
                  padding: const EdgeInsets.all(6),
                  decoration: const BoxDecoration(
                    color: AppColors.primary,
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    Icons.camera_alt,
                    color: Colors.white,
                    size: 20,
                  ),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        Text(
          _name.isNotEmpty ? _name : 'User',
          style: TextStyles.heading3.copyWith(color: AppColors.textPrimary),
        ),
        const SizedBox(height: 4),
        Text(
          _email.isNotEmpty ? _email : 'No email',
          style: TextStyles.bodySmall.copyWith(color: AppColors.textSecondary),
        ),
        const SizedBox(height: 16),
        ElevatedButton(
          onPressed: _editProfile,
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.primary,
            foregroundColor: AppColors.white,
          ),
          child: const Text('Edit Profile'),
        ),
      ],
    );
  }

  Widget _buildProfileSection() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Personal Information',
              style: TextStyles.heading4.copyWith(color: AppColors.textPrimary),
            ),
            const SizedBox(height: 16),
            if (_phone.isNotEmpty) _buildInfoRow('Phone', _phone),
            if (_gender.isNotEmpty) _buildInfoRow('Gender', _gender.capitalizeFirst),
            if (_age.isNotEmpty) _buildInfoRow('Age', _age),
            _buildInfoRow('Blood Group', _bloodGroup.isNotEmpty ? _bloodGroup : 'Not set'),
            _buildInfoRow('Address', _address.isNotEmpty ? _address : 'Not set'),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: TextStyles.bodyMedium.copyWith(
              color: AppColors.textSecondary,
              fontWeight: FontWeight.w500,
            ),
          ),
          Text(
            value,
            style: TextStyles.bodyMedium.copyWith(color: AppColors.textPrimary),
          ),
        ],
      ),
    );
  }

  Widget _buildSettingsSection() {
    return Card(
      child: Column(
        children: [
          _buildSettingsItem(
            icon: Icons.settings,
            title: 'Settings',
            subtitle: 'App settings and preferences',
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => const SettingsScreen(),
                ),
              );
            },
          ),
          const Divider(height: 1),
          _buildSettingsItem(
            icon: Icons.logout,
            title: 'Logout',
            onTap: _logout,
            isLogout: true,
          ),
        ],
      ),
    );
  }

  Widget _buildSettingsItem({
    required IconData icon,
    required String title,
    required VoidCallback onTap,
    String? subtitle,
    bool isLogout = false,
  }) {
    return ListTile(
      leading: Icon(
        icon,
        color: isLogout ? AppColors.error : AppColors.primary,
      ),
      title: Text(
        title,
        style: TextStyles.bodyMedium.copyWith(
          color: isLogout ? AppColors.error : AppColors.textPrimary,
        ),
      ),
      subtitle: subtitle != null
          ? Text(
              subtitle,
              style: TextStyles.bodySmall.copyWith(
                color: AppColors.textSecondary,
              ),
            )
          : null,
      trailing: const Icon(Icons.chevron_right),
      onTap: onTap,
    );
  }
}