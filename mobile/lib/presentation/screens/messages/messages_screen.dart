import 'package:flutter/material.dart';
import 'package:flutter_application_1/core/services/socket_service.dart';
import 'package:flutter_application_1/core/themes/colors.dart';
import 'package:flutter_application_1/core/themes/text_styles.dart';
import 'package:flutter_application_1/data/data_sources/remote/dental_remote_data_source.dart';
import 'package:flutter_application_1/injection_container.dart';
import 'conversation_screen.dart';

class MessagesScreen extends StatefulWidget {
  final String? filterType;
  const MessagesScreen({super.key, this.filterType});

  @override
  State<MessagesScreen> createState() => _MessagesScreenState();
}

class _MessagesScreenState extends State<MessagesScreen>
    with SingleTickerProviderStateMixin {
  late final DentalRemoteDataSource _dentalDataSource;
  late final SocketService _socketService;
  late final TabController _tabController;

  List<Map<String, dynamic>> _conversations = [];
  List<dynamic> _announcements = [];
  bool _isLoading = true;
  bool _isLoadingAnnouncements = true;

  @override
  void initState() {
    super.initState();
    _dentalDataSource = getIt<DentalRemoteDataSource>();
    _socketService = getIt<SocketService>();
    _tabController = TabController(length: 2, vsync: this);
    _socketService.addMessageListener(_onSocketMessage);
    _loadMessages();
    _loadAnnouncements();
  }

  @override
  void dispose() {
    _socketService.removeMessageListener(_onSocketMessage);
    _tabController.dispose();
    super.dispose();
  }

  void _onSocketMessage(Map<String, dynamic> msg) {
    // Refresh conversation list when a new message arrives
    _loadMessages();
  }

  Future<void> _loadMessages() async {
    if (!mounted) return;
    setState(() => _isLoading = true);
    try {
      final convs = await _dentalDataSource.getMessages();
      if (mounted) {
        setState(() {
          _conversations = convs.map<Map<String, dynamic>>((c) => {
            'doctorId': c['doctorId']?.toString() ?? '',
            'doctorName': c['doctorName']?.toString() ?? 'Doctor',
            'doctorEmail': c['doctorEmail']?.toString() ?? '',
            'lastMessage': c['lastMessage']?.toString() ?? '',
            'lastMessageTime': c['lastMessageTime']?.toString() ?? '',
            'unreadCount': (c['unreadCount'] as num?)?.toInt() ?? 0,
          }).toList();
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _loadAnnouncements() async {
    if (!mounted) return;
    setState(() => _isLoadingAnnouncements = true);
    try {
      final list = await _dentalDataSource.getAnnouncements();
      if (mounted) setState(() { _announcements = list; _isLoadingAnnouncements = false; });
    } catch (_) {
      if (mounted) setState(() => _isLoadingAnnouncements = false);
    }
  }

  Future<void> _openNewConversation() async {
    List<dynamic> doctors = [];
    bool loading = true;

    await showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setSheet) {
          if (loading) {
            _dentalDataSource.getDentists().then((list) {
              setSheet(() { doctors = list; loading = false; });
            }).catchError((_) => setSheet(() => loading = false));
          }
          return Container(
            decoration: const BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
            ),
            child: DraggableScrollableSheet(
              expand: false,
              initialChildSize: 0.65,
              maxChildSize: 0.92,
              builder: (_, sc) => Column(
                children: [
                  // Handle
                  Container(
                    margin: const EdgeInsets.only(top: 12, bottom: 4),
                    width: 40, height: 4,
                    decoration: BoxDecoration(color: Colors.grey[300], borderRadius: BorderRadius.circular(2)),
                  ),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                    child: Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: AppColors.primary.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Icon(Icons.chat, color: AppColors.primary, size: 20),
                        ),
                        const SizedBox(width: 12),
                        Text('New Message', style: TextStyles.heading3.copyWith(fontWeight: FontWeight.bold)),
                        const Spacer(),
                        IconButton(
                          icon: const Icon(Icons.close),
                          onPressed: () => Navigator.pop(ctx),
                          padding: EdgeInsets.zero,
                        ),
                      ],
                    ),
                  ),
                  const Divider(height: 1),
                  Expanded(
                    child: loading
                        ? const Center(child: CircularProgressIndicator())
                        : doctors.isEmpty
                            ? Center(
                                child: Column(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Icon(Icons.person_search, size: 56, color: Colors.grey[300]),
                                    const SizedBox(height: 12),
                                    Text('No doctors available', style: TextStyles.bodyMedium.copyWith(color: AppColors.textSecondary)),
                                  ],
                                ),
                              )
                            : ListView.separated(
                                controller: sc,
                                padding: const EdgeInsets.symmetric(vertical: 8),
                                itemCount: doctors.length,
                                separatorBuilder: (_, __) => const Divider(height: 1, indent: 72),
                                itemBuilder: (_, i) {
                                  final doc = doctors[i];
                                  final id = doc['_id']?.toString() ?? doc['id']?.toString() ?? '';
                                  final name = doc['fullName']?.toString() ?? doc['name']?.toString() ?? 'Doctor';
                                  final spec = doc['specialization']?.toString() ?? '';
                                  final hospital = doc['hospital']?.toString() ?? '';
                                  return ListTile(
                                    contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 4),
                                    leading: CircleAvatar(
                                      radius: 24,
                                      backgroundColor: AppColors.primary.withOpacity(0.12),
                                      child: Text(
                                        name.isNotEmpty ? name[0].toUpperCase() : 'D',
                                        style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold, fontSize: 18),
                                      ),
                                    ),
                                    title: Text(name, style: TextStyles.bodyMedium.copyWith(fontWeight: FontWeight.w600)),
                                    subtitle: Text(
                                      [spec, hospital].where((s) => s.isNotEmpty).join(' · '),
                                      style: TextStyles.caption,
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                    trailing: Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                      decoration: BoxDecoration(
                                        color: AppColors.primary.withOpacity(0.1),
                                        borderRadius: BorderRadius.circular(20),
                                      ),
                                      child: Text('Chat', style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.w600, fontSize: 13)),
                                    ),
                                    onTap: () {
                                      Navigator.pop(ctx);
                                      _openConversation(id, name);
                                    },
                                  );
                                },
                              ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  void _openConversation(String doctorId, String doctorName) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => ConversationScreen(doctorId: doctorId, doctorName: doctorName),
      ),
    ).then((_) => _loadMessages());
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[50],
      appBar: AppBar(
        title: const Text('Messages'),
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        elevation: 0,
        actions: [
          IconButton(icon: const Icon(Icons.refresh), onPressed: () { _loadMessages(); _loadAnnouncements(); }),
        ],
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: Colors.white,
          labelColor: Colors.white,
          unselectedLabelColor: Colors.white70,
          tabs: [
            Tab(
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.chat_bubble_outline, size: 18),
                  const SizedBox(width: 6),
                  const Text('Chats'),
                  if (_conversations.any((c) => (c['unreadCount'] as int? ?? 0) > 0)) ...[
                    const SizedBox(width: 6),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(color: Colors.red, borderRadius: BorderRadius.circular(10)),
                      child: Text(
                        _conversations.fold<int>(0, (s, c) => s + (c['unreadCount'] as int? ?? 0)).toString(),
                        style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                      ),
                    ),
                  ],
                ],
              ),
            ),
            const Tab(icon: Icon(Icons.campaign_outlined, size: 18), text: 'Announcements'),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _openNewConversation,
        backgroundColor: AppColors.primary,
        child: const Icon(Icons.edit, color: Colors.white),
        tooltip: 'New Message',
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildChatsTab(),
          _buildAnnouncementsTab(),
        ],
      ),
    );
  }

  Widget _buildChatsTab() {
    if (_isLoading) return const Center(child: CircularProgressIndicator());
    if (_conversations.isEmpty) {
      return RefreshIndicator(
        onRefresh: _loadMessages,
        child: ListView(
          children: [
            SizedBox(height: MediaQuery.of(context).size.height * 0.25),
            Column(
              children: [
                Icon(Icons.chat_bubble_outline, size: 72, color: Colors.grey[300]),
                const SizedBox(height: 16),
                Text('No conversations yet', style: TextStyles.bodyMedium.copyWith(color: AppColors.textSecondary)),
                const SizedBox(height: 8),
                Text('Tap the edit button to start chatting', style: TextStyles.caption.copyWith(color: Colors.grey[400])),
                const SizedBox(height: 24),
                ElevatedButton.icon(
                  onPressed: _openNewConversation,
                  icon: const Icon(Icons.add),
                  label: const Text('Start a Conversation'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
                  ),
                ),
              ],
            ),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _loadMessages,
      child: ListView.separated(
        padding: const EdgeInsets.symmetric(vertical: 8),
        itemCount: _conversations.length,
        separatorBuilder: (_, __) => const Divider(height: 1, indent: 80),
        itemBuilder: (_, i) => _buildConversationTile(_conversations[i]),
      ),
    );
  }

  Widget _buildConversationTile(Map<String, dynamic> conv) {
    final name = conv['doctorName'] as String? ?? 'Doctor';
    final lastMsg = conv['lastMessage'] as String? ?? '';
    final time = _formatTime(conv['lastMessageTime'] as String? ?? '');
    final unread = conv['unreadCount'] as int? ?? 0;
    final doctorId = conv['doctorId'] as String? ?? '';

    return InkWell(
      onTap: () => _openConversation(doctorId, name),
      child: Container(
        color: unread > 0 ? AppColors.primary.withOpacity(0.03) : Colors.white,
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: Row(
          children: [
            // Avatar
            Stack(
              children: [
                CircleAvatar(
                  radius: 28,
                  backgroundColor: AppColors.primary.withOpacity(0.15),
                  child: Text(
                    name.isNotEmpty ? name[0].toUpperCase() : 'D',
                    style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold, fontSize: 20),
                  ),
                ),
                Positioned(
                  right: 0, bottom: 0,
                  child: Container(
                    width: 14, height: 14,
                    decoration: BoxDecoration(
                      color: Colors.green,
                      shape: BoxShape.circle,
                      border: Border.all(color: Colors.white, width: 2),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(width: 14),
            // Content
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          name,
                          style: TextStyles.bodyMedium.copyWith(
                            fontWeight: unread > 0 ? FontWeight.bold : FontWeight.w600,
                          ),
                        ),
                      ),
                      Text(
                        time,
                        style: TextStyles.caption.copyWith(
                          color: unread > 0 ? AppColors.primary : AppColors.textSecondary,
                          fontWeight: unread > 0 ? FontWeight.w600 : FontWeight.normal,
                          fontSize: 11,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          lastMsg.isEmpty ? 'Tap to start chatting' : lastMsg,
                          style: TextStyles.caption.copyWith(
                            color: unread > 0 ? AppColors.textPrimary : AppColors.textSecondary,
                            fontWeight: unread > 0 ? FontWeight.w500 : FontWeight.normal,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      if (unread > 0) ...[
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                          decoration: BoxDecoration(
                            color: AppColors.primary,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            unread > 99 ? '99+' : unread.toString(),
                            style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                          ),
                        ),
                      ],
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAnnouncementsTab() {
    if (_isLoadingAnnouncements) return const Center(child: CircularProgressIndicator());
    if (_announcements.isEmpty) {
      return RefreshIndicator(
        onRefresh: _loadAnnouncements,
        child: ListView(
          children: [
            SizedBox(height: MediaQuery.of(context).size.height * 0.3),
            Column(
              children: [
                Icon(Icons.campaign_outlined, size: 72, color: Colors.grey[300]),
                const SizedBox(height: 16),
                Text('No announcements', style: TextStyles.bodyMedium.copyWith(color: AppColors.textSecondary)),
              ],
            ),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _loadAnnouncements,
      child: ListView.builder(
        padding: const EdgeInsets.all(12),
        itemCount: _announcements.length,
        itemBuilder: (_, i) => _buildAnnouncementCard(_announcements[i]),
      ),
    );
  }

  Widget _buildAnnouncementCard(dynamic ann) {
    final doctor = ann['sender'] as Map<String, dynamic>?;
    final doctorId = doctor?['_id']?.toString() ?? '';
    final doctorName = doctor?['fullName']?.toString() ?? 'Doctor';
    final message = ann['message']?.toString() ?? '';
    final type = ann['announcementType']?.toString();
    final createdAt = ann['createdAt']?.toString();

    Color typeColor;
    IconData typeIcon;
    switch (type) {
      case 'important':
        typeColor = Colors.red;
        typeIcon = Icons.priority_high;
        break;
      case 'reminder':
        typeColor = Colors.orange;
        typeIcon = Icons.notifications;
        break;
      default:
        typeColor = AppColors.primary;
        typeIcon = Icons.info_outline;
    }

    String dateStr = '';
    if (createdAt != null) {
      try {
        final dt = DateTime.parse(createdAt).toLocal();
        dateStr = '${dt.day}/${dt.month}/${dt.year}';
      } catch (_) {}
    }

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
      elevation: 1,
      child: InkWell(
        borderRadius: BorderRadius.circular(14),
        onTap: doctorId.isNotEmpty ? () => _openConversation(doctorId, doctorName) : null,
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(6),
                    decoration: BoxDecoration(
                      color: typeColor.withOpacity(0.12),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Icon(typeIcon, color: typeColor, size: 16),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    type == 'important' ? 'Important' : type == 'reminder' ? 'Reminder' : 'General',
                    style: TextStyle(color: typeColor, fontWeight: FontWeight.w600, fontSize: 12),
                  ),
                  const Spacer(),
                  Text(dateStr, style: TextStyles.caption.copyWith(color: AppColors.textSecondary)),
                ],
              ),
              const SizedBox(height: 10),
              Row(
                children: [
                  CircleAvatar(
                    radius: 16,
                    backgroundColor: AppColors.primary.withOpacity(0.12),
                    child: Text(
                      doctorName.isNotEmpty ? doctorName[0].toUpperCase() : 'D',
                      style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold, fontSize: 13),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Text(doctorName, style: TextStyles.bodySmall.copyWith(fontWeight: FontWeight.w600)),
                ],
              ),
              const SizedBox(height: 10),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.grey[50],
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: Colors.grey[200]!),
                ),
                child: Text(message, style: TextStyles.bodySmall),
              ),
              if (doctorId.isNotEmpty) ...[
                const SizedBox(height: 10),
                Align(
                  alignment: Alignment.centerRight,
                  child: TextButton.icon(
                    onPressed: () => _openConversation(doctorId, doctorName),
                    icon: const Icon(Icons.reply, size: 16),
                    label: const Text('Reply'),
                    style: TextButton.styleFrom(foregroundColor: AppColors.primary),
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  String _formatTime(String dateTime) {
    if (dateTime.isEmpty) return '';
    try {
      final dt = DateTime.parse(dateTime).toUtc().add(const Duration(hours: 5, minutes: 30));
      final now = DateTime.now();
      final diff = now.difference(dt);
      if (diff.inDays == 0) return '${dt.hour.toString().padLeft(2, '0')}:${dt.minute.toString().padLeft(2, '0')}';
      if (diff.inDays == 1) return 'Yesterday';
      if (diff.inDays < 7) return '${diff.inDays}d ago';
      return '${dt.day}/${dt.month}/${dt.year}';
    } catch (_) {
      return '';
    }
  }
}
