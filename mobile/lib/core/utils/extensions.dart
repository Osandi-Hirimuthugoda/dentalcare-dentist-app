import 'package:flutter/material.dart';

// Context Extensions
extension ContextExtensions on BuildContext {
  double get screenWidth => MediaQuery.of(this).size.width;
  double get screenHeight => MediaQuery.of(this).size.height;
  
  void showSnackBar(String message, {bool isError = false}) {
    ScaffoldMessenger.of(this).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: isError ? Colors.red : Colors.green,
        duration: const Duration(seconds: 3),
      ),
    );
  }
  
  void hideKeyboard() {
    FocusScope.of(this).unfocus();
  }
}

// String Extensions
extension StringExtensions on String {
  String get capitalizeFirst {
    if (isEmpty) return this;
    return '${this[0].toUpperCase()}${substring(1)}';
  }
  
  String get capitalizeEachWord {
    if (isEmpty) return this;
    return split(' ').map((word) => word.capitalizeFirst).join(' ');
  }
  
  bool get isValidEmail {
    final emailRegex = RegExp(
      r'^[a-zA-Z0-9.]+@[a-zA-Z0-9]+\.[a-zA-Z]+',
    );
    return emailRegex.hasMatch(this);
  }
  
  bool get isValidPhone {
    final phoneRegex = RegExp(r'^[0-9]{10}$');
    return phoneRegex.hasMatch(this);
  }
}

// DateTime Extensions
extension DateTimeExtensions on DateTime {
  String get toReadableDate {
    return '${day.toString().padLeft(2, '0')}/${month.toString().padLeft(2, '0')}/$year';
  }
  
  String get toReadableTime {
    return '${hour.toString().padLeft(2, '0')}:${minute.toString().padLeft(2, '0')}';
  }
  
  String get toReadableDateTime {
    return '$toReadableDate at $toReadableTime';
  }
}