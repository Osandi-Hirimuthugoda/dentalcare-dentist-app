import 'package:flutter/material.dart';
import 'package:flutter_application_1/core/themes/colors.dart';
import 'package:flutter_application_1/core/themes/text_styles.dart';
import 'package:flutter_application_1/core/constants/route_names.dart';
import 'package:flutter_application_1/data/data_sources/remote/dental_remote_data_source.dart';
import 'package:flutter_application_1/injection_container.dart';

class AnnouncementsSection extends StatefulWidget {
  const AnnouncementsSection({super.key});

  @override
  State<AnnouncementsSection> createState() => _AnnouncementsSectionState();
}

class _AnnouncementsSectionState extends State<AnnouncementsSection> {
  List<dynamic> _announcements = [];
  bool _isLoading = true;
  int _unreadMessageCount = 0;
  String? _selectedFilter = 'general';
  late final DentalRemoteDataSource _dentalDataSource;

  @override
  void initState() {
    super.initState();
    _dentalDataSource = getIt<DentalRemoteDataSource>();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() {
      _isLoading = true;
    });

    try {
      debugPrint('📥 Loading announcements and messages...');
      
      // Load announcements
      final announcements = await _dentalDataSource.getAnnouncements();
      debugPrint('✅ Loaded ${announcements.length} announcements');
      
      // Load messages (conversations) - only to check if there are unread messages
      int unreadCount = 0;
      try {
        final messages = await _dentalDataSource.getMessages();
        debugPrint('✅ Loaded ${messages.length} messages');
        // Count unread messages
        for (var msg in messages) {
          unreadCount += (msg['unreadCount'] as int? ?? 0);
        }
      } catch (e) {
        debugPrint('⚠️ Error loading messages (will continue without): $e');
      }
      
      setState(() {
        _announcements = announcements;
        _unreadMessageCount = unreadCount;
        _isLoading = false;
      });
      
      debugPrint('📊 Displaying: ${_announcements.length} announcements, unread messages: $unreadCount');
    } catch (e) {
      debugPrint('❌ Error loading announcements/messages: $e');
      debugPrint('   Error type: ${e.runtimeType}');
      setState(() {
        _isLoading = false;
        _announcements = [];
        _unreadMessageCount = 0;
      });
    }
  }


  Widget _buildTypeButton(String type, IconData icon, String label, Color color) {
    final isSelected = _selectedFilter == type;
    return GestureDetector(
      onTap: () {
        setState(() {
          _selectedFilter = type;
        });
        // Navigate to messages/chat screen with filter parameter
        Navigator.pushNamed(
          context, 
          RouteNames.messages,
          arguments: {'filter': type}, // Pass filter type as argument
        ).then((_) {
          // Refresh data when returning from messages screen
          _loadData();
        });
      },
      child: Container(
        height: 60,
        decoration: BoxDecoration(
          color: isSelected ? color : color.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: isSelected ? color : Colors.transparent,
            width: 2,
          ),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              icon,
              color: isSelected ? Colors.white : color,
              size: 20,
            ),
            const SizedBox(height: 4),
            Text(
              label,
              style: TextStyle(
                fontSize: 9,
                fontWeight: FontWeight.w600,
                color: isSelected ? Colors.white : color,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    // Always show the section, even if loading or empty (for debugging)
    if (_isLoading) {
      return Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        child: Row(
          children: [
            const SizedBox(
              width: 16,
              height: 16,
              child: CircularProgressIndicator(strokeWidth: 2),
            ),
            const SizedBox(width: 8),
            Text(
              'Loading doctor updates...',
              style: TextStyles.bodySmall.copyWith(
                color: AppColors.textSecondary,
              ),
            ),
          ],
        ),
      );
    }

    // Filter announcements by selected type
    List<dynamic> filteredAnnouncements = _announcements.where((announcement) {
      final type = announcement['announcementType'] as String?;
      // If filter is 'general', show announcements with type 'general' or null
      if (_selectedFilter == 'general') {
        return type == 'general' || type == null;
      }
      return type == _selectedFilter;
    }).toList();

    final hasAnnouncements = filteredAnnouncements.isNotEmpty;

    // Show section even if empty, with a message
    if (!hasAnnouncements && _announcements.isEmpty) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Stack(
                      children: [
                        Icon(Icons.announcement, color: AppColors.primary, size: 24),
                        if (_unreadMessageCount > 0)
                          Positioned(
                            right: 0,
                            top: 0,
                            child: Container(
                              width: 12,
                              height: 12,
                              decoration: BoxDecoration(
                                color: Colors.red,
                                shape: BoxShape.circle,
                                border: Border.all(color: Colors.white, width: 1.5),
                              ),
                            ),
                          ),
                      ],
                    ),
                    const SizedBox(width: 8),
                    Text(
                      'Doctor Updates',
                      style: TextStyles.heading3.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    if (_unreadMessageCount > 0) ...[
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(
                          color: Colors.red,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          _unreadMessageCount > 9 ? '9+' : _unreadMessageCount.toString(),
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Row(
                  children: [
                    Icon(Icons.info_outline, color: AppColors.textSecondary, size: 20),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'No doctor updates yet. Check back later!',
                        style: TextStyles.bodySmall.copyWith(
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Section Header
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Stack(
                    children: [
                      Icon(Icons.announcement, color: AppColors.primary, size: 24),
                      if (_unreadMessageCount > 0)
                        Positioned(
                          right: 0,
                          top: 0,
                          child: Container(
                            width: 12,
                            height: 12,
                            decoration: BoxDecoration(
                              color: Colors.red,
                              shape: BoxShape.circle,
                              border: Border.all(color: Colors.white, width: 1.5),
                            ),
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(width: 8),
                  Text(
                    'Doctor Updates',
                    style: TextStyles.heading3.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  if (_unreadMessageCount > 0) ...[
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(
                        color: Colors.red,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        _unreadMessageCount > 9 ? '9+' : _unreadMessageCount.toString(),
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                ],
              ),
              TextButton(
                onPressed: () {
                  Navigator.pushNamed(context, RouteNames.announcements);
                },
                child: const Text('View All'),
              ),
            ],
          ),
        ),

        // Announcement Type Filter Buttons
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          child: Row(
            children: [
              Expanded(
                child: _buildTypeButton('general', Icons.info_outline, 'General', AppColors.primary),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _buildTypeButton('important', Icons.priority_high, 'Important', Colors.red),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _buildTypeButton('reminder', Icons.notifications, 'Reminder', Colors.orange),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
