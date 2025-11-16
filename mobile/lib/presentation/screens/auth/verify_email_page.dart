import 'package:flutter/material.dart';
//import 'package:dental_care/core/constants/route_names.dart';
import 'package:flutter_application_1/core/constants/route_names.dart';

class VerifyEmailPage extends StatelessWidget {
  const VerifyEmailPage({super.key});

  @override
  Widget build(BuildContext context) {
    final otpController = List.generate(6, (_) => TextEditingController());

    return Scaffold(
      body: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 40),
        child: Column(
          children: [
            const Text("Verify your email",
                style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
            const SizedBox(height: 10),
            const Text(
              "We've sent a verification code to your email. Please enter it below.",
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.grey),
            ),
            const SizedBox(height: 30),

            // OTP fields
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: List.generate(
                6,
                (index) => SizedBox(
                  width: 40,
                  child: TextField(
                    controller: otpController[index],
                    textAlign: TextAlign.center,
                    maxLength: 1,
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(
                      counterText: "",
                      border: OutlineInputBorder(),
                    ),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 20),

            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.teal,
                padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 60),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(25)),
              ),
              onPressed: () {
                Navigator.pushReplacementNamed(context, RouteNames.login);
              },
              child: const Text("Verify"),
            ),

            const Spacer(),
            Image.asset("assets/images/logo.png", height: 100),
          ],
        ),
      ),
    );
  }
}