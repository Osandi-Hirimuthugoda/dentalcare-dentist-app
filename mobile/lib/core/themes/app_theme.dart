import 'package:flutter/material.dart';

class AppTheme {
  static ThemeData get lightTheme {
    return ThemeData(
      primarySwatch: Colors.teal,
      scaffoldBackgroundColor: Colors.white,
      appBarTheme: AppBarTheme(
        backgroundColor: Colors.teal[700],
        elevation: 0,
        titleTextStyle: const TextStyle(
          fontSize: 24,
          fontWeight: FontWeight.bold,
          color: Colors.white,
        ),
      ),
    );
  }
}