import 'package:flutter_application_1/core/constants/app_constants.dart';
import 'package:flutter_application_1/core/errors/exceptions.dart';
import 'package:shared_preferences/shared_preferences.dart';

abstract class LocalDataSource {
  Future<void> setString(String key, String value);
  Future<String?> getString(String key);
  Future<void> setBool(String key, bool value);
  Future<bool?> getBool(String key);
  Future<void> setInt(String key, int value);
  Future<int?> getInt(String key);
  Future<void> remove(String key);
  Future<void> clear();
}

class SharedPrefsDataSource implements LocalDataSource {
  final SharedPreferences sharedPreferences;

  SharedPrefsDataSource({required this.sharedPreferences});

  @override
  Future<void> setString(String key, String value) async {
    try {
      await sharedPreferences.setString(key, value);
    } catch (e) {
      throw CacheException('Failed to save string: $e');
    }
  }

  @override
  Future<String?> getString(String key) async {
    try {
      return sharedPreferences.getString(key);
    } catch (e) {
      throw CacheException('Failed to get string: $e');
    }
  }

  @override
  Future<void> setBool(String key, bool value) async {
    try {
      await sharedPreferences.setBool(key, value);
    } catch (e) {
      throw CacheException('Failed to save bool: $e');
    }
  }

  @override
  Future<bool?> getBool(String key) async {
    try {
      return sharedPreferences.getBool(key);
    } catch (e) {
      throw CacheException('Failed to get bool: $e');
    }
  }

  @override
  Future<void> setInt(String key, int value) async {
    try {
      await sharedPreferences.setInt(key, value);
    } catch (e) {
      throw CacheException('Failed to save int: $e');
    }
  }

  @override
  Future<int?> getInt(String key) async {
    try {
      return sharedPreferences.getInt(key);
    } catch (e) {
      throw CacheException('Failed to get int: $e');
    }
  }

  @override
  Future<void> remove(String key) async {
    try {
      await sharedPreferences.remove(key);
    } catch (e) {
      throw CacheException('Failed to remove: $e');
    }
  }

  @override
  Future<void> clear() async {
    try {
      await sharedPreferences.clear();
    } catch (e) {
      throw CacheException('Failed to clear: $e');
    }
  }

  // Convenience methods for app-specific data
  Future<void> saveAuthToken(String token) async {
    await setString(AppConstants.tokenKey, token);
  }

  Future<String?> getAuthToken() async {
    return getString(AppConstants.tokenKey);
  }

  Future<void> saveUserData(String userData) async {
    await setString(AppConstants.userKey, userData);
  }

  Future<String?> getUserData() async {
    return getString(AppConstants.userKey);
  }

  Future<void> setLoggedIn(bool isLoggedIn) async {
    await setBool(AppConstants.isLoggedInKey, isLoggedIn);
  }

  Future<bool?> isLoggedIn() async {
    return getBool(AppConstants.isLoggedInKey);
  }
}