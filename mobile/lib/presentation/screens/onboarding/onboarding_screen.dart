import 'package:flutter/material.dart';
import 'package:flutter_application_1/core/constants/route_names.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final PageController _controller = PageController();
  int _currentPage = 0;

  // Two images per page: top and bottom
  final List<Map<String, String>> _pages = [
    {
      "title": "Let's Get Started!",
      "subtitle": "Begin your dental care journey with smart AI-powered assistance.",
      "topImage": "assets/images/usermanual1.png",
      "bottomImage": "assets/images/logo.png",
    },
    {
      "title": "Scan Your Teeth with AI",
      "subtitle": "Use your phone's camera to scan your teeth and get instant feedback.",
      "topImage": "assets/images/usermanual2.png",
      "bottomImage": "assets/images/logo.png",
    },
    {
      "title": "Book Appointments Online",
      "subtitle": "Find and schedule visits with certified dentists or hospitals.",
      "topImage": "assets/images/usermanual4.png",
      "bottomImage": "assets/images/logo.png",
    },
    {
      "title": "Emergency Help",
      "subtitle": "Call emergency services, share your location, and find nearby hospitals instantly.",
      "topImage": "assets/images/usermanual5.png",
      "bottomImage": "assets/images/logo.png",
    },
    {
      "title": "See Your Future Smile",
      "subtitle": "Simulate new teeth/dental plates to visualize your perfect smile.",
      "topImage": "assets/images/usermanual6.png",
      "bottomImage": "assets/images/logo.png",
    },
  ];

  void _nextPage() {
    if (_currentPage < _pages.length - 1) {
      // Go to next page
      _controller.nextPage(duration: const Duration(milliseconds: 300), curve: Curves.easeIn);
    } else {
      // Last page - go to home
      _goToHome();
    }
  }
  
  void _onFinishPressed() {
    // Finish button on last page - go directly to home
    _goToHome();
  }

  void _goToHome() {
    // Always navigate to login page after onboarding
    // User must login to access the app
    if (mounted) {
      Navigator.pushReplacementNamed(context, RouteNames.login);
    }
  }

  Widget _buildDots() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: List.generate(_pages.length, (index) {
        return AnimatedContainer(
          duration: const Duration(milliseconds: 300),
          margin: const EdgeInsets.symmetric(horizontal: 5),
          height: 8,
          width: _currentPage == index ? 20 : 8,
          decoration: BoxDecoration(
            color: _currentPage == index ? Colors.teal : Colors.grey,
            borderRadius: BorderRadius.circular(5),
          ),
        );
      }),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        children: [
          Expanded(
            child: PageView.builder(
              controller: _controller,
              itemCount: _pages.length,
              onPageChanged: (index) {
                setState(() => _currentPage = index);
              },
              itemBuilder: (context, index) {
                final page = _pages[index];
                return Padding(
                  padding: const EdgeInsets.all(24.0),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      // Top image
                      Image.asset(page["topImage"]!, height: 220),
                      const SizedBox(height: 25),
                      // Title
                      Text(page["title"]!,
                          style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                          textAlign: TextAlign.center),
                      const SizedBox(height: 15),
                      // Subtitle
                      Text(page["subtitle"]!,
                          textAlign: TextAlign.center,
                          style: const TextStyle(fontSize: 16, color: Colors.grey)),
                      const SizedBox(height: 25),
                      // Bottom image
                      Image.asset(page["bottomImage"]!, height: 120),
                    ],
                  ),
                );
              },
            ),
          ),
          const SizedBox(height: 15),
          _buildDots(),
          const SizedBox(height: 20),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 15),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                // Skip
                TextButton(
                  onPressed: _goToHome,
                  child: const Text("Skip", style: TextStyle(fontSize: 16, color: Colors.grey)),
                ),
                // Next / Finish
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.teal,
                    padding: const EdgeInsets.symmetric(horizontal: 25, vertical: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                  ),
                  onPressed: _currentPage == _pages.length - 1 ? _onFinishPressed : _nextPage,
                  child: Text(_currentPage == _pages.length - 1 ? "Finish" : "Next",
                      style: const TextStyle(fontSize: 16)),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}