import 'package:flutter/material.dart';
import 'package:flutter_application_1/core/constants/route_names.dart';

class LoginPage extends StatelessWidget {
  const LoginPage({super.key});

  @override
  Widget build(BuildContext context) {
    final emailController = TextEditingController();
    final passwordController = TextEditingController();

    return Scaffold(
      body: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 40),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text("Welcome\nDentalCare+",
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold)),
            const SizedBox(height: 40),

            // Email
            TextField(
              controller: emailController,
              decoration: const InputDecoration(
                hintText: "Email",
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 15),

            // Password
            TextField(
              controller: passwordController,
              obscureText: true,
              decoration: const InputDecoration(
                hintText: "Password",
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 10),

            // Forgot password
            Align(
              alignment: Alignment.centerLeft,
              child: GestureDetector(
                onTap: () {
                  Navigator.pushNamed(context, RouteNames.forgotPassword);
                },
                child: const Text("Forgot Password?",
                    style: TextStyle(color: Colors.grey)),
              ),
            ),
            const SizedBox(height: 20),

            // Login button
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.teal,
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(25)),
                padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 80),
              ),
              onPressed: () {
                Navigator.pushReplacementNamed(context, RouteNames.home);
              },
              child: const Text("Log In", style: TextStyle(fontSize: 16)),
            ),

            const SizedBox(height: 15),
            const Text("Don't have an account?"),

            // Register
            TextButton(
              onPressed: () {
                Navigator.pushNamed(context, RouteNames.register);
              },
              child: const Text("Register",
                  style: TextStyle(color: Colors.teal, fontSize: 16)),
            ),

            const Spacer(),

            // Logo at bottom
            Image.asset("assets/images/logo.png", height: 100),
          ],
        ),
      ),
    );
  }
}