import 'package:flutter/material.dart';
import 'package:flutter_application_1/core/themes/colors.dart';

class AppTheme {
  static ThemeData get lightTheme {
    return ThemeData(
      primarySwatch: Colors.teal,
      scaffoldBackgroundColor: Colors.white,
      brightness: Brightness.light,
      appBarTheme: AppBarTheme(
        backgroundColor: Colors.teal[700],
        elevation: 0,
        titleTextStyle: const TextStyle(
          fontSize: 24,
          fontWeight: FontWeight.bold,
          color: Colors.white,
        ),
      ),
      cardTheme: CardTheme(
        color: Colors.white,
        elevation: 2,
      ),
      textTheme: const TextTheme(
        bodyLarge: TextStyle(color: AppColors.textPrimary),
        bodyMedium: TextStyle(color: AppColors.textPrimary),
        bodySmall: TextStyle(color: AppColors.textSecondary),
      ),
    );
  }

  static ThemeData get darkTheme {
    return ThemeData(
      primarySwatch: Colors.teal,
      scaffoldBackgroundColor: const Color(0xFF121212),
      brightness: Brightness.dark,
      appBarTheme: AppBarTheme(
        backgroundColor: const Color(0xFF1E1E1E),
        elevation: 0,
        titleTextStyle: const TextStyle(
          fontSize: 24,
          fontWeight: FontWeight.bold,
          color: Colors.white,
        ),
      ),
      cardTheme: CardTheme(
        color: const Color(0xFF1E1E1E),
        elevation: 2,
      ),
      textTheme: const TextTheme(
        displayLarge: TextStyle(color: Colors.white),
        displayMedium: TextStyle(color: Colors.white),
        displaySmall: TextStyle(color: Colors.white),
        headlineLarge: TextStyle(color: Colors.white),
        headlineMedium: TextStyle(color: Colors.white),
        headlineSmall: TextStyle(color: Colors.white),
        titleLarge: TextStyle(color: Colors.white),
        titleMedium: TextStyle(color: Colors.white),
        titleSmall: TextStyle(color: Colors.white),
        bodyLarge: TextStyle(color: Colors.white),
        bodyMedium: TextStyle(color: Colors.white70),
        bodySmall: TextStyle(color: Colors.grey),
        labelLarge: TextStyle(color: Colors.white),
        labelMedium: TextStyle(color: Colors.white70),
        labelSmall: TextStyle(color: Colors.grey),
      ),
      dividerColor: Colors.grey[700],
      dividerTheme: const DividerThemeData(
        color: Colors.grey,
        thickness: 0.5,
      ),
      iconTheme: const IconThemeData(
        color: Colors.white70,
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: const Color(0xFF2C2C2C),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: BorderSide(color: Colors.grey[700]!),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: BorderSide(color: Colors.grey[700]!),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: Colors.teal),
        ),
        labelStyle: const TextStyle(color: Colors.white70),
        hintStyle: TextStyle(color: Colors.grey[500]),
      ),
      switchTheme: SwitchThemeData(
        thumbColor: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return Colors.teal;
          }
          return Colors.grey;
        }),
        trackColor: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return Colors.teal.withValues(alpha: 0.5);
          }
          return Colors.grey.withValues(alpha: 0.3);
        }),
      ),
    );
  }

  static ThemeData get eyeComfortTheme {
    return ThemeData(
      primarySwatch: Colors.brown,
      scaffoldBackgroundColor: const Color(0xFFF5E6D3), // Warm beige
      brightness: Brightness.light,
      appBarTheme: AppBarTheme(
        backgroundColor: const Color(0xFF8B6F47), // Warm brown
        elevation: 0,
        titleTextStyle: const TextStyle(
          fontSize: 24,
          fontWeight: FontWeight.bold,
          color: Colors.white,
        ),
      ),
      cardTheme: CardTheme(
        color: const Color(0xFFFFF8F0), // Light warm white
        elevation: 2,
      ),
      textTheme: const TextTheme(
        displayLarge: TextStyle(color: Color(0xFF3E2723)),
        displayMedium: TextStyle(color: Color(0xFF3E2723)),
        displaySmall: TextStyle(color: Color(0xFF3E2723)),
        headlineLarge: TextStyle(color: Color(0xFF3E2723)),
        headlineMedium: TextStyle(color: Color(0xFF3E2723)),
        headlineSmall: TextStyle(color: Color(0xFF3E2723)),
        titleLarge: TextStyle(color: Color(0xFF3E2723)),
        titleMedium: TextStyle(color: Color(0xFF4E342E)),
        titleSmall: TextStyle(color: Color(0xFF4E342E)),
        bodyLarge: TextStyle(color: Color(0xFF4E342E)),
        bodyMedium: TextStyle(color: Color(0xFF5D4037)),
        bodySmall: TextStyle(color: Color(0xFF6D4C41)),
        labelLarge: TextStyle(color: Color(0xFF4E342E)),
        labelMedium: TextStyle(color: Color(0xFF5D4037)),
        labelSmall: TextStyle(color: Color(0xFF6D4C41)),
      ),
      dividerColor: const Color(0xFFD7CCC8),
      iconTheme: const IconThemeData(
        color: Color(0xFF5D4037),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: const Color(0xFFFFF8F0),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: Color(0xFFD7CCC8)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: Color(0xFFD7CCC8)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: Color(0xFF8B6F47)),
        ),
        labelStyle: const TextStyle(color: Color(0xFF5D4037)),
        hintStyle: const TextStyle(color: Color(0xFFA1887F)),
      ),
    );
  }
}