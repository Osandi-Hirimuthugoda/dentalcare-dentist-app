import 'package:flutter/material.dart';
import 'package:flutter_application_1/core/constants/route_names.dart';
import 'package:flutter_application_1/core/utils/helpers.dart';
import 'package:flutter_application_1/injection_container.dart' as di;
import 'package:flutter_application_1/domain/repositories/auth_repository.dart';
import 'package:url_launcher/url_launcher.dart';

class _InteractiveActionCard extends StatefulWidget {
  final Map<String, dynamic> action;
  final VoidCallback onTap;

  const _InteractiveActionCard({
    required this.action,
    required this.onTap,
  });

  @override
  State<_InteractiveActionCard> createState() => _InteractiveActionCardState();
}

class _InteractiveActionCardState extends State<_InteractiveActionCard> {
  bool _isPressed = false;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTapDown: (_) => setState(() => _isPressed = true),
      onTapUp: (_) {
        setState(() => _isPressed = false);
        widget.onTap();
      },
      onTapCancel: () => setState(() => _isPressed = false),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        curve: Curves.easeInOut,
        transform: Matrix4.identity()..scale(_isPressed ? 0.95 : 1.0),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(15),
          boxShadow: [
            BoxShadow(
              color: Colors.grey.withValues(alpha: _isPressed ? 0.05 : 0.1),
              blurRadius: _isPressed ? 5 : 10,
              offset: Offset(0, _isPressed ? 1 : 2),
            ),
          ],
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: (widget.action['color'] as Color).withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(
                widget.action['icon'],
                color: widget.action['color'],
                size: 24,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              widget.action['title'],
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: Colors.black87,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              widget.action['subtitle'],
              style: TextStyle(
                fontSize: 10,
                color: Colors.grey[600],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class QuickActionsGrid extends StatelessWidget {
  const QuickActionsGrid({super.key});

  void _showSnackBar(BuildContext context, String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        duration: const Duration(seconds: 2),
      ),
    );
  }

  Future<void> _makeEmergencyCall(BuildContext context) async {
    const emergencyNumber = 'tel:1990'; // Sri Lanka emergency number
    final uri = Uri.parse(emergencyNumber);
    
    try {
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri);
        if (context.mounted) {
          _showSnackBar(context, "Calling emergency services...");
        }
      } else {
        if (context.mounted) {
          _showSnackBar(context, "Unable to make emergency call. Please dial 1990 manually.");
        }
      }
    } catch (e) {
      if (context.mounted) {
        _showSnackBar(context, "Error: Unable to make emergency call. Please dial 1990 manually.");
      }
    }
  }

  Future<void> _handleAITeethScan(BuildContext context) async {
    // Check authentication before navigating
    await Helpers.navigateIfAuthenticated(context, RouteNames.teethScan);
  }

  Future<void> _handleBookAppointment(BuildContext context) async {
    // Check authentication before navigating
    await Helpers.navigateIfAuthenticated(context, RouteNames.bookAppointment);
  }

  Future<void> _handleEmergencyHelp(BuildContext context) async {
    // Check authentication before showing emergency help dialog
    if (!context.mounted) return;
    
    try {
      final authRepo = di.getIt<AuthRepository>();
      final result = await authRepo.isUserLoggedIn();
      
      result.fold(
        (failure) {
          // On error, user is not authenticated
          if (context.mounted) {
            Helpers.showLoginRequiredMessage(context);
          }
        },
        (isLoggedIn) {
          if (isLoggedIn == true) {
            // User is authenticated, show emergency help dialog
            if (context.mounted) {
              showDialog(
                context: context,
                builder: (dialogContext) => AlertDialog(
                  title: const Text("Emergency Help"),
                  content: const Text("Do you want to call emergency dental services?"),
                  actions: [
                    TextButton(
                      onPressed: () => Navigator.pop(dialogContext),
                      child: const Text("Cancel"),
                    ),
                    ElevatedButton(
                      onPressed: () async {
                        Navigator.pop(dialogContext);
                        await _makeEmergencyCall(context);
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.red,
                      ),
                      child: const Text("Call Now"),
                    ),
                  ],
                ),
              );
            }
          } else {
            // User is not authenticated, show message and redirect to login
            if (context.mounted) {
              Helpers.showLoginRequiredMessage(context);
            }
          }
        },
      );
    } catch (e) {
      // On any error, show message and redirect to login
      debugPrint('Error in _handleEmergencyHelp: $e');
      if (context.mounted) {
        Helpers.showLoginRequiredMessage(context);
      }
    }
  }

  Future<void> _handleMyTreatments(BuildContext context) async {
    // Check authentication before navigating
    await Helpers.navigateIfAuthenticated(context, RouteNames.myTreatments);
  }

  Future<void> _handleMyBills(BuildContext context) async {
    await Helpers.navigateIfAuthenticated(context, RouteNames.myBills);
  }

  Future<void> _handleMyReports(BuildContext context) async {
    await Helpers.navigateIfAuthenticated(context, RouteNames.myReports);
  }

  Future<void> _handleWallet(BuildContext context) async {
    await Helpers.navigateIfAuthenticated(context, RouteNames.wallet);
  }


  Future<void> _handleScanQA(BuildContext context) async {
    await Helpers.navigateIfAuthenticated(context, '/scan-qa');
  }

  Future<void> _handleMessages(BuildContext context) async {
    await Helpers.navigateIfAuthenticated(context, '/messages');
  }

  Future<void> _handleFindDentists(BuildContext context) async {
    // Check authentication before navigating
    await Helpers.navigateIfAuthenticated(context, RouteNames.findDentists);
  }

  Future<void> _handleNearbyHospitals(BuildContext context) async {
    // Check authentication before navigating
    await Helpers.navigateIfAuthenticated(context, RouteNames.nearbyHospitals);
  }

  Future<void> _handleNearbyDoctors(BuildContext context) async {
    // Check authentication before navigating
    await Helpers.navigateIfAuthenticated(context, RouteNames.nearbyDoctors);
  }

  @override
  Widget build(BuildContext context) {
    final List<Map<String, dynamic>> quickActions = [
      {
        'icon': Icons.camera_alt,
        'title': 'AI Teeth Scan',
        'color': Colors.blue,
        'subtitle': 'Scan your teeth',
      },
      {
        'icon': Icons.calendar_month,
        'title': 'Book Appointment',
        'color': Colors.green,
        'subtitle': 'Schedule visit',
      },
      {
        'icon': Icons.medical_services,
        'title': 'My Treatments',
        'color': Colors.orange,
        'subtitle': 'Treatment history',
      },
      {
        'icon': Icons.receipt_long,
        'title': 'My Bills',
        'color': Colors.purple,
        'subtitle': 'Payment history',
      },
      {
        'icon': Icons.chat_bubble_outline,
        'title': 'Messages',
        'color': Colors.teal,
        'subtitle': 'Chat with doctor',
      },
      {
        'icon': Icons.account_balance_wallet,
        'title': 'Wallet',
        'color': Colors.pink,
        'subtitle': 'Manage funds',
      },
    ];


    return Padding(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            "Quick Actions",
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: Colors.black87,
            ),
          ),
          const SizedBox(height: 15),
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 3,
              crossAxisSpacing: 15,
              mainAxisSpacing: 15,
              childAspectRatio: 0.9,
            ),
            itemCount: quickActions.length,
            itemBuilder: (context, index) {
              final action = quickActions[index];
              // Determine which handler to call based on index
              Future<void> Function(BuildContext) handler;
              switch (index) {
                case 0:
                  handler = _handleAITeethScan;
                  break;
                case 1:
                  handler = _handleBookAppointment;
                  break;
                case 2:
                  handler = _handleMyTreatments;
                  break;
                case 3:
                  handler = _handleMyBills;
                  break;
                case 4:
                  handler = _handleMessages;
                  break;
                case 5:
                  handler = _handleWallet;
                  break;
                default:
                  handler = _handleAITeethScan;

              }
              
              return _InteractiveActionCard(
                action: action,
                onTap: () async {
                  try {
                    await handler(context);
                  } catch (error) {
                    debugPrint('Error in button handler: $error');
                  }
                },
              );
            },
          ),
        ],
      ),
    );
  }
}