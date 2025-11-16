import 'package:flutter/material.dart';
import 'package:flutter_application_1/core/constants/route_names.dart';
import 'package:flutter_application_1/injection_container.dart' as di;
import 'package:flutter_application_1/domain/repositories/auth_repository.dart';

/// A widget that protects routes by checking if the user is authenticated.
/// If not authenticated, redirects to login page.
class ProtectedRoute extends StatefulWidget {
  final Widget child;

  const ProtectedRoute({
    super.key,
    required this.child,
  });

  @override
  State<ProtectedRoute> createState() => _ProtectedRouteState();
}

class _ProtectedRouteState extends State<ProtectedRoute> {
  bool _isChecking = true;
  bool _isAuthenticated = false;

  @override
  void initState() {
    super.initState();
    _checkAuthentication();
  }

  Future<void> _checkAuthentication() async {
    try {
      final authRepo = di.getIt<AuthRepository>();
      final result = await authRepo.isUserLoggedIn();

      result.fold(
        (failure) {
          // On error, user is not authenticated
          if (mounted) {
            setState(() {
              _isChecking = false;
              _isAuthenticated = false;
            });
            _showLoginRequiredMessage();
          }
        },
        (isLoggedIn) {
          if (mounted) {
            setState(() {
              _isChecking = false;
              _isAuthenticated = isLoggedIn;
            });
            if (!isLoggedIn) {
              // User is not authenticated, show message and redirect to login
              _showLoginRequiredMessage();
            }
          }
        },
      );
    } catch (e) {
      // On any error, show message and redirect to login
      if (mounted) {
        setState(() {
          _isChecking = false;
          _isAuthenticated = false;
        });
        _showLoginRequiredMessage();
      }
    }
  }

  void _showLoginRequiredMessage() {
    // Show message that login is required
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Please login first to access this page'),
        backgroundColor: Colors.orange,
        duration: Duration(seconds: 2),
      ),
    );
    
    // Navigate to login page after a short delay
    Future.delayed(const Duration(milliseconds: 500), () {
      if (mounted) {
        Navigator.pushReplacementNamed(context, RouteNames.login);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_isChecking) {
      // Show loading screen while checking authentication
      return const Scaffold(
        body: Center(
          child: CircularProgressIndicator(),
        ),
      );
    }

    if (!_isAuthenticated) {
      // Return empty container - navigation will happen in _checkAuthentication
      return const SizedBox.shrink();
    }

    // User is authenticated, show the protected widget
    return widget.child;
  }
}

