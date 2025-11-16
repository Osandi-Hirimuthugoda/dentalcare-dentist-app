import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

class Helpers {
  static void showLoadingDialog(BuildContext context, {String message = 'Loading...'}) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        content: Row(
          children: [
            const CircularProgressIndicator(),
            const SizedBox(width: 16),
            Text(message),
          ],
        ),
      ),
    );
  }
  
  static void hideLoadingDialog(BuildContext context) {
    Navigator.of(context, rootNavigator: true).pop();
  }
  
  static String formatDate(DateTime date, {String format = 'dd/MM/yyyy'}) {
    return DateFormat(format).format(date);
  }
  
  static String formatTime(TimeOfDay time) {
    return '${time.hour.toString().padLeft(2, '0')}:${time.minute.toString().padLeft(2, '0')}';
  }
  
  static double calculateBMI(double weight, double height) {
    // BMI = weight(kg) / (height(m) * height(m))
    return weight / ((height / 100) * (height / 100));
  }
  
  static String getBMIStatus(double bmi) {
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
  }
  
  static Future<void> showConfirmationDialog(
    BuildContext context, {
    required String title,
    required String content,
    required Function onConfirm,
  }) async {
    return showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(title),
        content: Text(content),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.of(context).pop();
              onConfirm();
            },
            child: const Text('Confirm'),
          ),
        ],
      ),
    );
  }
}