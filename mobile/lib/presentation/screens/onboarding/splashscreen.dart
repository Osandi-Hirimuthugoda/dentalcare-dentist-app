import 'package:flutter/material.dart';
import 'package:flutter_application_1/core/constants/route_names.dart';

class SplashScreen extends StatelessWidget {
  const SplashScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          // Top Image
          Image.asset(
            "assets/images/splashscreen1.png",
            height: 220,
            fit: BoxFit.contain,
          ),
          const SizedBox(height: 25),
          // App Title
          const Text(
            "DentalCare+",
            style: TextStyle(fontSize: 26, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 15),
          // Subtitle / Description
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 30),
            child: Text(
              "Your smile, our priority.\nSchedule appointments, track treatments, and stay connected with your dental health journey.",
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.black54, fontSize: 14),
            ),
          ),
          const SizedBox(height: 25),
          // Bottom Image (logo or decoration)
          Image.asset(
            "assets/images/splashscreen2.png",
            height: 120,
            fit: BoxFit.contain,
          ),
          const SizedBox(height: 30),
          // Get Started Button
          ElevatedButton(
            onPressed: () {
              Navigator.pushReplacementNamed(context, RouteNames.onboarding);
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.teal,
              padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 12),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
            child: const Text(
              "Get Started",
              style: TextStyle(fontSize: 16),
            ),
          ),
        ],
      ),
    );
  }
}