import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'dart:io';
import 'package:flutter_application_1/core/constants/route_names.dart';
import 'package:flutter_application_1/core/themes/colors.dart';
import 'package:flutter_application_1/core/themes/text_styles.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  File? _profileImage;
  final ImagePicker _picker = ImagePicker();
  
  // User data
  String _name = 'Kasun Perera';
  String _email = 'kasun.perera@email.com';
  String _phone = '+94 77 123 4567';
  String _gender = 'Male';
  String _age = '32 years';
  String _bloodGroup = 'O+';
  String _address = '123 Main Street, Colombo';

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
                  _buildEditFormField('Email', emailController, Icons.email),
                  _buildEditFormField('Phone', phoneController, Icons.phone),
                  _buildEditFormField('Age', ageController, Icons.cake),
                  _buildEditFormField('Address', addressController, Icons.location_on),
                  
                  // Gender Dropdown
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    decoration: BoxDecoration(
                      border: Border.all(color: Colors.grey),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: DropdownButton<String>(
                      value: _gender,
                      isExpanded: true,
                      underline: const SizedBox(),
                      items: ['Male', 'Female', 'Other']
                          .map((gender) => DropdownMenuItem(
                                value: gender,
                                child: Text(gender),
                              ))
                          .toList(),
                      onChanged: (value) {
                        setState(() {
                          _gender = value!;
                        });
                      },
                    ),
                  ),
                  const SizedBox(height: 15),
                  
                  // Blood Group Dropdown
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    decoration: BoxDecoration(
                      border: Border.all(color: Colors.grey),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: DropdownButton<String>(
                      value: _bloodGroup,
                      isExpanded: true,
                      underline: const SizedBox(),
                      items: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
                          .map((blood) => DropdownMenuItem(
                                value: blood,
                                child: Text(blood),
                              ))
                          .toList(),
                      onChanged: (value) {
                        setState(() {
                          _bloodGroup = value!;
                        });
                      },
                    ),
                  ),
                  const SizedBox(height: 30),
                  
                  // Save Button
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: () {
                        setState(() {
                          _name = nameController.text;
                          _email = emailController.text;
                          _phone = phoneController.text;
                          _age = ageController.text;
                          _address = addressController.text;
                        });
                        Navigator.pop(context);
                        _showSnackBar('Profile updated successfully');
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

  Widget _buildEditFormField(String label, TextEditingController controller, IconData icon) {
    return Container(
      margin: const EdgeInsets.only(bottom: 15),
      child: TextField(
        controller: controller,
        decoration: InputDecoration(
          labelText: label,
          prefixIcon: Icon(icon),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
          ),
        ),
      ),
    );
  }

  void _showNotificationsSettings() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Notifications Settings'),
        content: SizedBox(
          width: double.maxFinite,
          child: ListView(
            shrinkWrap: true,
            children: [
              _buildNotificationSetting('Appointment Reminders', true),
              _buildNotificationSetting('Health Tips', true),
              _buildNotificationSetting('Promotional Offers', false),
              _buildNotificationSetting('Emergency Alerts', true),
              _buildNotificationSetting('New Features', true),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              _showSnackBar('Notification settings updated');
            },
            child: const Text('Save'),
          ),
        ],
      ),
    );
  }

  Widget _buildNotificationSetting(String title, bool value) {
    return StatefulBuilder(
      builder: (context, setState) => SwitchListTile(
        title: Text(title),
        value: value,
        onChanged: (newValue) {
          setState(() {});
        },
      ),
    );
  }

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
        }
      },
    );
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
        _showSnackBar('Opening $title');
      },
    );
  }

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
        const Text('Developed with ❤️ for better dental health'),
        const SizedBox(height: 10),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            TextButton(
              onPressed: () {
                _showSnackBar('Rate us on App Store');
              },
              child: const Text('Rate App'),
            ),
            TextButton(
              onPressed: () {
                _showSnackBar('Share with friends');
              },
              child: const Text('Share'),
            ),
          ],
        ),
      ],
    );
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
            onPressed: () {
              Navigator.pop(context);
              Navigator.pushReplacementNamed(context, RouteNames.login);
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
        title: const Text('My Profile'),
        backgroundColor: AppColors.primary,
        foregroundColor: AppColors.white,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _buildProfileHeader(),
          const SizedBox(height: 24),
          _buildProfileSection(),
          const SizedBox(height: 24),
          _buildSettingsSection(),
        ],
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
          _name,
          style: TextStyles.heading3.copyWith(color: AppColors.textPrimary),
        ),
        const SizedBox(height: 4),
        Text(
          _email,
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
            _buildInfoRow('Phone', _phone),
            _buildInfoRow('Gender', _gender),
            _buildInfoRow('Age', _age),
            _buildInfoRow('Blood Group', _bloodGroup),
            _buildInfoRow('Address', _address),
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
            icon: Icons.notifications,
            title: 'Notifications',
            onTap: _showNotificationsSettings,
          ),
          _buildSettingsItem(
            icon: Icons.security,
            title: 'Privacy & Security',
            onTap: _showPrivacySecurity,
          ),
          _buildSettingsItem(
            icon: Icons.help,
            title: 'Help & Support',
            onTap: _showHelpSupport,
          ),
          _buildSettingsItem(
            icon: Icons.info,
            title: 'About App',
            onTap: _showAboutApp,
          ),
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
      trailing: const Icon(Icons.chevron_right),
      onTap: onTap,
    );
  }
}