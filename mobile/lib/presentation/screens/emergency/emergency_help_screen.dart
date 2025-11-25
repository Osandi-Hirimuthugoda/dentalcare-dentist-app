import 'package:flutter/material.dart';
import 'package:flutter_application_1/core/themes/colors.dart';
import 'package:flutter_application_1/core/themes/text_styles.dart';
import 'package:flutter_application_1/core/constants/route_names.dart';
import 'package:url_launcher/url_launcher.dart';

class EmergencyHelpScreen extends StatefulWidget {
  const EmergencyHelpScreen({super.key});

  @override
  State<EmergencyHelpScreen> createState() => _EmergencyHelpScreenState();
}

class _EmergencyHelpScreenState extends State<EmergencyHelpScreen> {
  // Emergency contact numbers for Sri Lanka
  final List<Map<String, dynamic>> _emergencyContacts = [
    {
      'name': 'Emergency Services',
      'number': '110',
      'icon': Icons.emergency,
      'color': AppColors.primary,
      'description': 'Police, Fire, Ambulance',
    },
    {
      'name': 'Suwa Seriya',
      'number': '1990',
      'icon': Icons.local_hospital,
      'color': AppColors.success,
      'description': 'Free Ambulance Service',
    },
    {
      'name': 'National Hospital',
      'number': '+94 11 269 1111',
      'icon': Icons.medical_services,
      'color': AppColors.primary,
      'description': 'Colombo - 24/7 Emergency',
    },
    {
      'name': 'Lanka Hospitals',
      'number': '+94 11 543 0000',
      'icon': Icons.local_hospital,
      'color': AppColors.primary,
      'description': 'Emergency Dental Care',
    },
    {
      'name': 'Nawaloka Hospital',
      'number': '+94 11 577 7777',
      'icon': Icons.local_hospital,
      'color': AppColors.primary,
      'description': '24/7 Emergency Dental',
    },
    {
      'name': 'Durdans Hospital',
      'number': '+94 11 214 0000',
      'icon': Icons.local_hospital,
      'color': AppColors.primary,
      'description': 'Emergency Care',
    },
  ];

  final List<Map<String, dynamic>> _firstAidTips = [
    {
      'title': 'Tooth Knocked Out',
      'icon': Icons.warning_amber_rounded,
      'steps': [
        'Hold the tooth by the crown (top), not the root',
        'Rinse gently with water if dirty',
        'Try to place it back in socket if possible',
        'If not, keep it in milk or saliva',
        'See a dentist immediately (within 30 minutes)',
      ],
    },
    {
      'title': 'Severe Toothache',
      'icon': Icons.sick,
      'steps': [
        'Rinse mouth with warm salt water',
        'Use dental floss to remove any food particles',
        'Apply a cold compress to reduce swelling',
        'Take over-the-counter pain reliever',
        'See a dentist as soon as possible',
      ],
    },
    {
      'title': 'Broken Tooth',
      'icon': Icons.build,
      'steps': [
        'Rinse mouth with warm water',
        'Apply gauze to stop any bleeding',
        'Use a cold compress to reduce swelling',
        'Save any broken pieces if possible',
        'See a dentist immediately',
      ],
    },
    {
      'title': 'Bleeding Gums',
      'icon': Icons.bloodtype,
      'steps': [
        'Rinse mouth with warm salt water',
        'Apply gentle pressure with gauze',
        'Avoid aspirin (can increase bleeding)',
        'Use a cold compress if swelling',
        'See a dentist if bleeding persists',
      ],
    },
    {
      'title': 'Lost Filling or Crown',
      'icon': Icons.construction,
      'steps': [
        'Keep the area clean',
        'Avoid chewing on that side',
        'Use temporary dental cement if available',
        'Avoid very hot or cold foods',
        'See a dentist as soon as possible',
      ],
    },
    {
      'title': 'Abscess or Swelling',
      'icon': Icons.water_drop,
      'steps': [
        'Rinse with warm salt water',
        'Apply cold compress to reduce swelling',
        'Take pain reliever if needed',
        'Do not apply heat to the area',
        'See a dentist immediately - this is serious',
      ],
    },
  ];

  final List<Map<String, dynamic>> _emergencySymptoms = [
    {
      'symptom': 'Severe pain that doesn\'t stop',
      'urgency': 'High',
      'action': 'Call emergency or visit hospital immediately',
    },
    {
      'symptom': 'Swelling in face or jaw',
      'urgency': 'High',
      'action': 'Seek immediate medical attention',
    },
    {
      'symptom': 'Bleeding that won\'t stop',
      'urgency': 'High',
      'action': 'Apply pressure and call emergency',
    },
    {
      'symptom': 'Tooth knocked out',
      'urgency': 'Critical',
      'action': 'See dentist within 30 minutes',
    },
    {
      'symptom': 'Broken jaw',
      'urgency': 'Critical',
      'action': 'Go to emergency room immediately',
    },
  ];

  final List<String> _quickTips = [
    'Keep emergency dental contacts saved',
    'Have a dental first aid kit at home',
    'Know your nearest 24/7 dental clinic',
    'Don\'t ignore persistent tooth pain',
    'Regular check-ups prevent emergencies',
  ];

  @override
  void initState() {
    super.initState();
  }

  Future<void> _makeEmergencyCall(String phoneNumber) async {
    try {
      final uri = Uri(scheme: 'tel', path: phoneNumber.replaceAll(' ', ''));
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri);
      } else {
        _showSnackBar('Cannot make phone call');
      }
    } catch (e) {
      _showSnackBar('Error making phone call: $e');
    }
  }

  void _navigateToNearbyHospitals() {
    Navigator.pushNamed(context, RouteNames.nearbyHospitalsMap);
  }

  void _shareLocation() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Share Location'),
        content: const Text('This feature will share your current location with emergency contacts.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              _showSnackBar('Location sharing feature coming soon');
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
            ),
            child: const Text('Share'),
          ),
        ],
      ),
    );
  }

  void _showEmergencyChecklist() {
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
            Text(
              'Emergency Preparedness Checklist',
              style: TextStyles.heading3.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            ..._quickTips.map((tip) => Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Icon(
                    Icons.check_circle,
                    color: AppColors.success,
                    size: 20,
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      tip,
                      style: TextStyles.bodyMedium,
                    ),
                  ),
                ],
              ),
            )),
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

  void _showSnackBar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        duration: const Duration(seconds: 2),
        backgroundColor: AppColors.primary,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[50],
      appBar: AppBar(
        title: const Text('Emergency Help'),
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            // Emergency Banner
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [
                    AppColors.primary,
                    AppColors.primaryDark,
                  ],
                ),
              ),
              child: Column(
                children: [
                  const Icon(
                    Icons.emergency,
                    size: 64,
                    color: Colors.white,
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Dental Emergency?',
                    style: TextStyles.heading2.copyWith(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Get immediate help and find nearby hospitals',
                    style: TextStyles.bodyMedium.copyWith(
                      color: Colors.white.withValues(alpha: 0.9),
                    ),
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
            ),

            // Quick Actions
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Quick Actions',
                    style: TextStyles.heading3.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: _buildQuickActionCard(
                          icon: Icons.map,
                          title: 'Find Hospitals',
                          subtitle: 'Nearby on Map',
                          color: AppColors.primary,
                          onTap: _navigateToNearbyHospitals,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: _buildQuickActionCard(
                          icon: Icons.local_hospital,
                          title: 'Emergency',
                          subtitle: 'Call 110',
                          color: AppColors.primary,
                          onTap: () => _makeEmergencyCall('110'),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: _buildQuickActionCard(
                          icon: Icons.share_location,
                          title: 'Share Location',
                          subtitle: 'Send to contact',
                          color: AppColors.info,
                          onTap: _shareLocation,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: _buildQuickActionCard(
                          icon: Icons.checklist,
                          title: 'Checklist',
                          subtitle: 'Emergency prep',
                          color: AppColors.warning,
                          onTap: _showEmergencyChecklist,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            // Emergency Contacts
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Emergency Contacts',
                    style: TextStyles.heading3.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 12),
                  ..._emergencyContacts.map((contact) => _buildContactCard(contact)),
                ],
              ),
            ),

            // Emergency Symptoms
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Emergency Symptoms',
                    style: TextStyles.heading3.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 12),
                  ..._emergencySymptoms.map((symptom) => _buildSymptomCard(symptom)),
                ],
              ),
            ),

            // First Aid Tips
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'First Aid Tips',
                    style: TextStyles.heading3.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 12),
                  ..._firstAidTips.map((tip) => _buildFirstAidCard(tip)),
                ],
              ),
            ),

            // Quick Tips
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Quick Tips',
                    style: TextStyles.heading3.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: AppColors.dentalGreen,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: AppColors.primary.withValues(alpha: 0.3),
                      ),
                    ),
                    child: Column(
                      children: _quickTips.map((tip) => Padding(
                        padding: const EdgeInsets.only(bottom: 8),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Icon(
                              Icons.lightbulb_outline,
                              color: AppColors.primary,
                              size: 20,
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Text(
                                tip,
                                style: TextStyles.bodySmall,
                              ),
                            ),
                          ],
                        ),
                      )).toList(),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }

  Widget _buildQuickActionCard({
    required IconData icon,
    required String title,
    required String subtitle,
    required Color color,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.05),
              blurRadius: 10,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(
                icon,
                color: color,
                size: 28,
              ),
            ),
            const SizedBox(height: 12),
            Text(
              title,
              style: TextStyles.bodyMedium.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              subtitle,
              style: TextStyles.bodySmall.copyWith(
                color: AppColors.textSecondary,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildContactCard(Map<String, dynamic> contact) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        leading: Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: (contact['color'] as Color).withValues(alpha: 0.1),
            shape: BoxShape.circle,
          ),
          child: Icon(
            contact['icon'],
            color: contact['color'],
            size: 24,
          ),
        ),
        title: Text(
          contact['name'],
          style: TextStyles.bodyMedium.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 4),
            Text(
              contact['description'],
              style: TextStyles.bodySmall,
            ),
            const SizedBox(height: 8),
            Text(
              contact['number'],
              style: TextStyles.bodyMedium.copyWith(
                color: contact['color'],
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
        trailing: IconButton(
          icon: Icon(
            Icons.phone,
            color: contact['color'],
          ),
          onPressed: () => _makeEmergencyCall(contact['number']),
        ),
      ),
    );
  }

  Widget _buildFirstAidCard(Map<String, dynamic> tip) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: ExpansionTile(
        leading: Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: AppColors.warning.withValues(alpha: 0.1),
            shape: BoxShape.circle,
          ),
          child: Icon(
            tip['icon'],
            color: AppColors.warning,
            size: 24,
          ),
        ),
        title: Text(
          tip['title'],
          style: TextStyles.bodyMedium.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: (tip['steps'] as List<String>).map((step) {
                return Padding(
                  padding: const EdgeInsets.only(bottom: 8),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        margin: const EdgeInsets.only(top: 4, right: 12),
                        width: 6,
                        height: 6,
                        decoration: BoxDecoration(
                          color: AppColors.primary,
                          shape: BoxShape.circle,
                        ),
                      ),
                      Expanded(
                        child: Text(
                          step,
                          style: TextStyles.bodySmall,
                        ),
                      ),
                    ],
                  ),
                );
              }).toList(),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSymptomCard(Map<String, dynamic> symptom) {
    final urgency = symptom['urgency'] as String;
    Color urgencyColor;
    IconData urgencyIcon;
    
    if (urgency == 'Critical') {
      urgencyColor = AppColors.error;
      urgencyIcon = Icons.priority_high;
    } else if (urgency == 'High') {
      urgencyColor = AppColors.warning;
      urgencyIcon = Icons.warning;
    } else {
      urgencyColor = AppColors.info;
      urgencyIcon = Icons.info;
    }

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        leading: Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: urgencyColor.withValues(alpha: 0.1),
            shape: BoxShape.circle,
          ),
          child: Icon(
            urgencyIcon,
            color: urgencyColor,
            size: 24,
          ),
        ),
        title: Text(
          symptom['symptom'],
          style: TextStyles.bodyMedium.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        subtitle: Padding(
          padding: const EdgeInsets.only(top: 8),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: urgencyColor.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  urgency,
                  style: TextStyles.bodySmall.copyWith(
                    color: urgencyColor,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
              const SizedBox(height: 8),
              Text(
                symptom['action'],
                style: TextStyles.bodySmall.copyWith(
                  color: AppColors.textSecondary,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

