import 'package:flutter/material.dart';
import 'package:flutter_application_1/core/constants/route_names.dart';

class RegisterPage extends StatelessWidget {
  const RegisterPage({super.key});

  @override
  Widget build(BuildContext context) {
    final nameController = TextEditingController();
    final emailController = TextEditingController();
    final phoneController = TextEditingController();
    final passwordController = TextEditingController();
    final genderController = TextEditingController();
    final ageController = TextEditingController();

    return Scaffold(
      body: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 40),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text("Welcome\nDentalCare+",
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 26, fontWeight: FontWeight.bold)),
            const SizedBox(height: 20),

            TextField(controller: nameController, decoration: const InputDecoration(hintText: "Name", border: OutlineInputBorder())),
            const SizedBox(height: 12),

            TextField(controller: emailController, decoration: const InputDecoration(hintText: "Email", border: OutlineInputBorder())),
            const SizedBox(height: 12),

            TextField(controller: phoneController, decoration: const InputDecoration(hintText: "Phone number", border: OutlineInputBorder())),
            const SizedBox(height: 12),

            TextField(controller: passwordController, obscureText: true, decoration: const InputDecoration(hintText: "Password", border: OutlineInputBorder())),
            const SizedBox(height: 12),

            TextField(controller: genderController, decoration: const InputDecoration(hintText: "Gender", border: OutlineInputBorder())),
            const SizedBox(height: 12),

            TextField(controller: ageController, decoration: const InputDecoration(hintText: "Age", border: OutlineInputBorder())),
            const SizedBox(height: 20),

            ElevatedButton(
              style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.teal,
                  padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 60),
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(25))),
              onPressed: () {
                Navigator.pushReplacementNamed(context, RouteNames.home);
              },
              child: const Text("Register"),
            ),

            const Spacer(),
            Image.asset("assets/images/logo.png", height: 100),
          ],
        ),
      ),
    );
  }
}