import 'package:flutter/material.dart';

class QuickActionsGrid extends StatelessWidget {
  final BuildContext context;
  
  const QuickActionsGrid({super.key, required this.context});

  void _showSnackBar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        duration: const Duration(seconds: 2),
      ),
    );
  }

  void _handleAITeethScan() {
    Navigator.pushNamed(context, '/teeth-scan');
  }

  void _handleBookAppointment() {
    Navigator.pushNamed(context, '/book-appointment');
  }

  void _handleEmergencyHelp() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text("Emergency Help"),
        content: const Text("Do you want to call emergency dental services?"),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text("Cancel"),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              _showSnackBar("Calling emergency services...");
              // TODO: Implement actual emergency call
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red,
            ),
            child: const Text("Call Now"),
          ),
        ],
      ),
    );
  }

  void _handleMyTreatments() {
    Navigator.pushNamed(context, '/my-treatments');
  }

  void _handleMyBills() {
    Navigator.pushNamed(context, '/my-bills');
  }

  void _handleFindDentists() {
    Navigator.pushNamed(context, '/find-dentists');
  }

  @override
  Widget build(BuildContext context) {
    final List<Map<String, dynamic>> quickActions = [
      {
        'icon': Icons.camera_alt,
        'title': 'AI Teeth Scan',
        'color': Colors.blue,
        'subtitle': 'Scan your teeth',
        'onTap': _handleAITeethScan,
      },
      {
        'icon': Icons.calendar_month,
        'title': 'Book Appointment',
        'color': Colors.green,
        'subtitle': 'Schedule visit',
        'onTap': _handleBookAppointment,
      },
      {
        'icon': Icons.emergency,
        'title': 'Emergency Help',
        'color': Colors.red,
        'subtitle': 'Urgent care',
        'onTap': _handleEmergencyHelp,
      },
      {
        'icon': Icons.medical_services,
        'title': 'My Treatments',
        'color': Colors.orange,
        'subtitle': 'Treatment history',
        'onTap': _handleMyTreatments,
      },
      {
        'icon': Icons.receipt_long,
        'title': 'My Bills',
        'color': Colors.purple,
        'subtitle': 'Payment history',
        'onTap': _handleMyBills,
      },
      {
        'icon': Icons.local_hospital,
        'title': 'Find Dentists',
        'color': Colors.teal,
        'subtitle': 'Nearby clinics',
        'onTap': _handleFindDentists,
      },
    ];

    return Padding(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            "Quick Actions",
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: Colors.black87,
            ),
          ),
          const SizedBox(height: 15),
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 3,
              crossAxisSpacing: 15,
              mainAxisSpacing: 15,
              childAspectRatio: 0.9,
            ),
            itemCount: quickActions.length,
            itemBuilder: (context, index) {
              final action = quickActions[index];
              return GestureDetector(
                onTap: action['onTap'] as void Function(),
                child: Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(15),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.grey.withOpacity(0.1),
                        blurRadius: 10,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: action['color'].withOpacity(0.1),
                          shape: BoxShape.circle,
                        ),
                        child: Icon(
                          action['icon'],
                          color: action['color'],
                          size: 24,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        action['title'],
                        textAlign: TextAlign.center,
                        style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: Colors.black87,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        action['subtitle'],
                        style: TextStyle(
                          fontSize: 10,
                          color: Colors.grey[600],
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ],
      ),
    );
  }
}