import 'package:flutter/material.dart';
import 'dart:ui';

/// A widget that displays a blurred representation of the home page
/// This is used as a background for the login page
class BlurredHomeBackground extends StatelessWidget {
  const BlurredHomeBackground({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [
            Colors.teal[700]!.withValues(alpha: 0.9),
            Colors.teal[500]!.withValues(alpha: 0.8),
            Colors.grey[50]!,
          ],
        ),
      ),
      child: Stack(
        children: [
          // Blurred content that represents home page elements
          Positioned.fill(
            child: ClipRect(
              child: BackdropFilter(
                filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
                child: Container(
                  color: Colors.white.withValues(alpha: 0.1),
                  child: _buildHomePageElements(),
                ),
              ),
            ),
          ),
          // Dark overlay for better text readability
          Container(
            decoration: BoxDecoration(
              color: Colors.black.withValues(alpha: 0.3),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHomePageElements() {
    return Column(
      children: [
        // App Bar representation
        Container(
          height: 100,
          color: Colors.teal[700]!.withValues(alpha: 0.5),
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                "DentalCare+",
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: Colors.white.withValues(alpha: 0.7),
                ),
              ),
              Row(
                children: [
                  Icon(
                    Icons.notifications_none,
                    color: Colors.white.withValues(alpha: 0.7),
                  ),
                  const SizedBox(width: 10),
                  Icon(
                    Icons.logout,
                    color: Colors.white.withValues(alpha: 0.7),
                  ),
                ],
              ),
            ],
          ),
        ),
        // Welcome section
        Padding(
          padding: const EdgeInsets.all(20),
          child: Container(
            height: 80,
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.2),
              borderRadius: BorderRadius.circular(15),
            ),
          ),
        ),
        // Quick actions grid representation
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          child: GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 3,
              crossAxisSpacing: 10,
              mainAxisSpacing: 10,
              childAspectRatio: 1,
            ),
            itemCount: 6,
            itemBuilder: (context, index) {
              return Container(
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(12),
                ),
              );
            },
          ),
        ),
        const SizedBox(height: 20),
        // Appointments section representation
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          child: Container(
            height: 150,
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.2),
              borderRadius: BorderRadius.circular(15),
            ),
          ),
        ),
        const SizedBox(height: 20),
        // Health tips representation
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          child: Container(
            height: 120,
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.2),
              borderRadius: BorderRadius.circular(15),
            ),
          ),
        ),
      ],
    );
  }
}

