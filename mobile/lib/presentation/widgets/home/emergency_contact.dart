import 'package:flutter/material.dart';

class EmergencyContact extends StatelessWidget {
  final BuildContext context;
  
  const EmergencyContact({super.key, required this.context});

  void _showSnackBar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        duration: const Duration(seconds: 2),
      ),
    );
  }

  void _handleEmergencyCall() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text("Emergency Call"),
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

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(20),
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              Colors.red[50]!,
              Colors.orange[50]!,
            ],
          ),
          borderRadius: BorderRadius.circular(15),
          border: Border.all(color: Colors.red[100]!),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.red[100],
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.emergency,
                color: Colors.red,
                size: 24,
              ),
            ),
            const SizedBox(width: 15),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    "Dental Emergency",
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: Colors.red,
                    ),
                  ),
                  const SizedBox(height: 5),
                  Text(
                    "Need immediate help?",
                    style: TextStyle(
                      fontSize: 14,
                      color: Colors.red[800],
                    ),
                  ),
                  const SizedBox(height: 10),
                  ElevatedButton.icon(
                    onPressed: _handleEmergencyCall,
                    icon: const Icon(Icons.call, size: 16),
                    label: const Text("Call Emergency"),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.red,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}