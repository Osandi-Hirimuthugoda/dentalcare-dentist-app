import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:flutter_application_1/core/constants/route_names.dart';
import 'package:flutter_application_1/injection_container.dart' as di;
import 'package:flutter_application_1/domain/repositories/auth_repository.dart';

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

  /// Checks if user is authenticated before navigating to a protected route.
  /// If not authenticated, shows a message and redirects to login page.
  /// If authenticated, navigates to the specified route.
  static Future<void> navigateIfAuthenticated(
    BuildContext context,
    String routeName, {
    Object? arguments,
  }) async {
    // Check if context is still mounted before proceeding
    if (!context.mounted) {
      debugPrint('Helpers.navigateIfAuthenticated: Context not mounted');
      return;
    }
    
    try {
      final authRepo = di.getIt<AuthRepository>();
      final result = await authRepo.isUserLoggedIn();

      result.fold(
        (failure) {
          // On error, user is not authenticated
          debugPrint('Helpers.navigateIfAuthenticated: Auth check failed - ${failure.toString()}');
          if (context.mounted) {
            showLoginRequiredMessage(context);
          }
        },
        (isLoggedIn) {
          debugPrint('Helpers.navigateIfAuthenticated: isLoggedIn = $isLoggedIn, route = $routeName');
          if (isLoggedIn == true) {
            // User is authenticated, navigate to the route
            if (context.mounted) {
              Navigator.pushNamed(
                context,
                routeName,
                arguments: arguments,
              );
            }
          } else {
            // User is not authenticated, show message and redirect to login
            debugPrint('Helpers.navigateIfAuthenticated: User not logged in, redirecting to login');
            if (context.mounted) {
              showLoginRequiredMessage(context);
            }
          }
        },
      );
    } catch (e, stackTrace) {
      // On any error, show message and redirect to login
      debugPrint('Helpers.navigateIfAuthenticated: Exception caught - $e');
      debugPrint('StackTrace: $stackTrace');
      if (context.mounted) {
        showLoginRequiredMessage(context);
      }
    }
  }

  /// Shows a message that login is required and redirects to login page
  static void showLoginRequiredMessage(BuildContext context) {
    debugPrint('Helpers.showLoginRequiredMessage: Showing login required message');
    
    if (!context.mounted) {
      debugPrint('Helpers.showLoginRequiredMessage: Context not mounted');
      return;
    }

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('කරුණාකර මුලින්ම login වන්න / Please login first to access this page'),
        backgroundColor: Colors.orange,
        duration: Duration(seconds: 2),
      ),
    );

    // Navigate to login page after a short delay
    // Use pushReplacementNamed so user can't go back to protected content
    Future.delayed(const Duration(milliseconds: 500), () {
      if (context.mounted) {
        debugPrint('Helpers.showLoginRequiredMessage: Navigating to login page');
        Navigator.pushReplacementNamed(context, RouteNames.login);
      } else {
        debugPrint('Helpers.showLoginRequiredMessage: Context not mounted after delay');
      }
    });
  }
}