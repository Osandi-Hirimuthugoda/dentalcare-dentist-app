import 'package:flutter/material.dart';
import 'package:flutter_application_1/core/constants/route_names.dart';

class ForgotPasswordPage extends StatelessWidget {
  const ForgotPasswordPage({super.key});

  @override
  Widget build(BuildContext context) {
    final emailController = TextEditingController();

    return Scaffold(
      body: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 40),
        child: Column(
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                IconButton(
                  icon: const Icon(Icons.close),
                  onPressed: () => Navigator.pop(context),
                )
              ],
            ),
            const SizedBox(height: 30),
            const Text("Forgot password?",
                style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
            const SizedBox(height: 10),
            const Text(
              "Enter the email associated with your account and we'll send reset instructions.",
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.grey),
            ),
            const SizedBox(height: 30),

            TextField(
              controller: emailController,
              decoration: const InputDecoration(
                hintText: "Email",
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 20),

            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.teal,
                padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 40),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(25)),
              ),
              onPressed: () {
                Navigator.pushNamed(context, RouteNames.verifyEmail);
              },
              child: const Text("Send reset instructions"),
            ),

            const Spacer(),
            Image.asset("assets/images/logo.png", height: 100),
          ],
        ),
      ),
    );
  }
}