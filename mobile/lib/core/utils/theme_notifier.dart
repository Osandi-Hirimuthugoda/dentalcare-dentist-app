import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ThemeNotifier extends ChangeNotifier {
  static final ThemeNotifier _instance = ThemeNotifier._internal();
  
  factory ThemeNotifier() {
    return _instance;
  }
  
  ThemeNotifier._internal() {
    _loadTheme();
  }

  bool _isDarkMode = false;
  bool _isEyeComfortMode = false;
  bool _isInitialized = false;

  bool get isDarkMode => _isDarkMode;
  bool get isEyeComfortMode => _isEyeComfortMode;

  Future<void> _loadTheme() async {
    if (_isInitialized) return;
    try {
      final prefs = await SharedPreferences.getInstance();
      _isDarkMode = prefs.getBool('dark_mode') ?? false;
      _isEyeComfortMode = prefs.getBool('eye_comfort_mode') ?? false;
      _isInitialized = true;
      notifyListeners();
    } catch (e) {
      _isDarkMode = false;
      _isEyeComfortMode = false;
      _isInitialized = true;
      notifyListeners();
    }
  }

  // Public method to reload theme
  Future<void> loadTheme() async {
    await _loadTheme();
  }

  Future<void> toggleTheme(bool isDark) async {
    _isDarkMode = isDark;
    if (isDark) {
      _isEyeComfortMode = false; // Disable eye comfort when dark mode is on
    }
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool('dark_mode', isDark);
      if (isDark) {
        await prefs.setBool('eye_comfort_mode', false);
      }
    } catch (e) {
      // Handle error silently
    }
    notifyListeners();
  }

  Future<void> toggleEyeComfortMode(bool isEyeComfort) async {
    _isEyeComfortMode = isEyeComfort;
    if (isEyeComfort) {
      _isDarkMode = false; // Disable dark mode when eye comfort is on
    }
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool('eye_comfort_mode', isEyeComfort);
      if (isEyeComfort) {
        await prefs.setBool('dark_mode', false);
      }
    } catch (e) {
      // Handle error silently
    }
    notifyListeners();
  }
}

