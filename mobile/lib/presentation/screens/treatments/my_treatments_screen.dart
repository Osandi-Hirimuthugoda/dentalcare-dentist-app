import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_application_1/core/themes/colors.dart';
import 'package:flutter_application_1/core/themes/text_styles.dart';
import 'package:flutter_application_1/data/data_sources/remote/dental_remote_data_source.dart';
import 'package:flutter_application_1/injection_container.dart';
import 'package:flutter_application_1/presentation/screens/reports/pdf_viewer_screen.dart';
import 'package:intl/intl.dart';
import 'package:http/http.dart' as http;
import 'package:path_provider/path_provider.dart';
import 'package:flutter_application_1/core/constants/app_constants.dart';
import 'package:flutter_application_1/data/data_sources/local/shared_prefs.dart';
import 'package:url_launcher/url_launcher.dart';

class MyTreatmentsScreen extends StatefulWidget {
  const MyTreatmentsScreen({super.key});

  @override
  State<MyTreatmentsScreen> createState() => _MyTreatmentsScreenState();
}

class _MyTreatmentsScreenState extends State<MyTreatmentsScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  
  String _selectedFilter = 'All'; // 'All', 'Completed', 'Ongoing', 'Upcoming'
  String _selectedSummary = ''; // Track which summary item is selected

  // Treatments Data
  List<Map<String, dynamic>> _allTreatments = [];
  bool _isLoadingTreatments = true;
  String? _treatmentsError;

  // Doctor Sent Reports
  List<dynamic> _doctorReports = [];
  bool _loadingDoctor = true;
  String? _doctorReportsError;

  // Prescriptions
  List<dynamic> _prescriptions = [];
  bool _loadingPrescriptions = true;
  String? _prescriptionsError;

  // Downloading state for PDF
  final Map<String, bool> _downloading = {};

  late final DentalRemoteDataSource _dentalDataSource;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _dentalDataSource = getIt<DentalRemoteDataSource>();
    _loadAllData();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadAllData() async {
    _loadTreatments();
    _loadDoctorReports();
    _loadPrescriptions();
  }

  Future<void> _loadTreatments() async {
    setState(() {
      _isLoadingTreatments = true;
      _treatmentsError = null;
    });

    try {
      final treatments = await _dentalDataSource.getTreatments();
      if (mounted) {
        setState(() {
          _allTreatments = treatments.map<Map<String, dynamic>>((treatment) {
            Color statusColor = Colors.grey;
            if (treatment['status'] == 'Completed') {
              statusColor = Colors.green;
            } else if (treatment['status'] == 'Ongoing') {
              statusColor = Colors.orange;
            } else if (treatment['status'] == 'Upcoming') {
              statusColor = Colors.blue;
            } else if (treatment['status'] == 'Cancelled') {
              statusColor = Colors.red;
            }
            
            return {
              'title': treatment['title']?.toString() ?? 'Treatment',
              'doctor': treatment['doctor']?.toString() ?? 'Unknown Doctor',
              'date': treatment['date']?.toString() ?? '',
              'status': treatment['status']?.toString() ?? 'Upcoming',
              'cost': treatment['cost']?.toString() ?? 'LKR 0',
              'type': treatment['type']?.toString() ?? 'General',
              'color': statusColor,
              'id': treatment['id']?.toString() ?? treatment['_id']?.toString() ?? '',
            };
          }).toList();
          _isLoadingTreatments = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _treatmentsError = 'Failed to load treatments. Please try again.';
          _isLoadingTreatments = false;
          _allTreatments = [];
        });
      }
    }
  }

  Future<void> _loadDoctorReports() async {
    setState(() { _loadingDoctor = true; _doctorReportsError = null; });
    try {
      final reports = await _dentalDataSource.getDoctorSentReports();
      if (mounted) setState(() { _doctorReports = reports; _loadingDoctor = false; });
    } catch (e) {
      if (mounted) setState(() { _doctorReportsError = 'Failed to load reports'; _loadingDoctor = false; });
    }
  }

  Future<void> _loadPrescriptions() async {
    setState(() { _loadingPrescriptions = true; _prescriptionsError = null; });
    try {
      final res = await _dentalDataSource.getPrescriptions();
      if (mounted) setState(() { _prescriptions = res; _loadingPrescriptions = false; });
    } catch (e) {
      if (mounted) setState(() { _prescriptionsError = e.toString(); _loadingPrescriptions = false; });
    }
  }

  Future<void> _openDoctorReport(Map<String, dynamic> report) async {
    final scanId = report['scanId'] as String;
    setState(() => _downloading[scanId] = true);

    try {
      final localData = getIt<LocalDataSource>();
      final token = await localData.getString(AppConstants.tokenKey);

      final response = await http.get(
        Uri.parse('${AppConstants.baseUrl}/scan-qa/report-file/$scanId'),
        headers: token != null ? {'Authorization': 'Bearer $token'} : {},
      );

      if (response.statusCode == 200) {
        final dir = await getApplicationDocumentsDirectory();
        final file = File('${dir.path}/doctor_report_$scanId.pdf');
        await file.writeAsBytes(response.bodyBytes);

        if (mounted) {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (_) => PdfViewerScreen(
                filePath: file.path,
                title: 'Report from ${report['doctorName'] ?? 'Doctor'}',
              ),
            ),
          );
        }
      } else {
        if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Could not download report')));
      }
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Network error')));
    } finally {
      if (mounted) setState(() => _downloading.remove(scanId));
    }
  }

  Future<void> _downloadReportToDevice(String scanId) async {
    final url = Uri.parse('${AppConstants.baseUrl}/scan-qa/report-file/$scanId');
    try {
      if (await canLaunchUrl(url)) {
        await launchUrl(url, mode: LaunchMode.externalApplication);
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Could not open browser to download report')),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Error downloading file')),
        );
      }
    }
  }

  String _formatDate(String? iso) {
    if (iso == null) return '';
    try {
      final dt = DateTime.parse(iso).toLocal();
      return DateFormat('dd MMM yyyy, hh:mm a').format(dt);
    } catch (_) { return iso; }
  }

  List<Map<String, dynamic>> get _filteredTreatments {
    if (_selectedFilter == 'All') return _allTreatments;
    return _allTreatments.where((treatment) => treatment['status'] == _selectedFilter).toList();
  }

  int get _completedCount => _allTreatments.where((t) => t['status'] == 'Completed').length;
  int get _ongoingCount => _allTreatments.where((t) => t['status'] == 'Ongoing').length;
  int get _upcomingCount => _allTreatments.where((t) => t['status'] == 'Upcoming').length;

  void _onSummaryItemTap(String status) {
    setState(() {
      _selectedFilter = status;
      _selectedSummary = status;
    });
  }

  void _clearFilters() {
    setState(() {
      _selectedFilter = 'All';
      _selectedSummary = '';
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Treatments'),
        backgroundColor: AppColors.primary,
        foregroundColor: AppColors.white,
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: Colors.white,
          labelColor: Colors.white,
          unselectedLabelColor: Colors.white70,
          tabs: const [
            Tab(icon: Icon(Icons.history, size: 18), text: 'History'),
            Tab(icon: Icon(Icons.local_hospital, size: 18), text: 'Reports'),
            Tab(icon: Icon(Icons.medication, size: 18), text: 'Prescriptions'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildTreatmentsTab(),
          _buildDoctorReportsTab(),
          _buildPrescriptionsTab(),
        ],
      ),
    );
  }

  Widget _buildTreatmentsTab() {
    if (_isLoadingTreatments) return const Center(child: CircularProgressIndicator());
    if (_treatmentsError != null) return _buildErrorState(_treatmentsError!, _loadTreatments);
    if (_allTreatments.isEmpty) return _buildEmptyState('No treatments found', 'Your treatment history will appear here', Icons.medical_information);

    return RefreshIndicator(
      onRefresh: _loadTreatments,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _buildTreatmentSummary(),
          const SizedBox(height: 20),
          _buildFilterChips(),
          const SizedBox(height: 20),
          _buildTreatmentHistory(),
        ],
      ),
    );
  }

  Widget _buildTreatmentSummary() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Treatment Summary', style: TextStyles.heading4),
            const SizedBox(height: 15),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildSummaryItem('Completed', _completedCount.toString(), Colors.green, 'Completed'),
                _buildSummaryItem('Ongoing', _ongoingCount.toString(), Colors.orange, 'Ongoing'),
                _buildSummaryItem('Upcoming', _upcomingCount.toString(), Colors.blue, 'Upcoming'),
                _buildSummaryItem('Total', _allTreatments.length.toString(), AppColors.primary, 'All'),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSummaryItem(String title, String value, Color color, String status) {
    bool isSelected = _selectedSummary == status;
    return GestureDetector(
      onTap: () => _onSummaryItemTap(status),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: isSelected ? color : color.withValues(alpha: 0.1),
              shape: BoxShape.circle,
            ),
            child: Text(value, style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: isSelected ? Colors.white : color)),
          ),
          const SizedBox(height: 5),
          Text(title, style: TextStyles.caption.copyWith(color: isSelected ? color : AppColors.textSecondary, fontWeight: isSelected ? FontWeight.bold : FontWeight.normal)),
        ],
      ),
    );
  }

  Widget _buildFilterChips() {
    if (_selectedFilter == 'All') return const SizedBox();
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Row(
          children: [
            Icon(Icons.filter_alt, color: AppColors.primary, size: 16),
            const SizedBox(width: 8),
            Text('Showing: $_selectedFilter', style: TextStyles.bodyMedium.copyWith(fontWeight: FontWeight.w600, color: AppColors.primary)),
            const Spacer(),
            IconButton(icon: const Icon(Icons.clear, size: 16), onPressed: _clearFilters),
          ],
        ),
      ),
    );
  }

  Widget _buildTreatmentHistory() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Treatment History', style: TextStyles.heading4),
            const SizedBox(height: 15),
            if (_filteredTreatments.isEmpty) 
              const Center(child: Text('No treatments found for this filter'))
            else
              ..._filteredTreatments.map((treatment) => _buildTreatmentItem(treatment)),
          ],
        ),
      ),
    );
  }

  Widget _buildTreatmentItem(Map<String, dynamic> treatment) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(color: AppColors.grey50, borderRadius: BorderRadius.circular(10)),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(color: (treatment['color'] as Color).withValues(alpha: 0.1), borderRadius: BorderRadius.circular(8)),
            child: Icon(_getTreatmentIcon(treatment['type']), color: treatment['color'], size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(treatment['title'], style: TextStyles.bodyMedium.copyWith(fontWeight: FontWeight.w600)),
                Text(treatment['doctor'], style: TextStyles.bodySmall.copyWith(color: AppColors.textSecondary)),
                Text(treatment['date'], style: TextStyles.caption),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(color: (treatment['color'] as Color).withValues(alpha: 0.1), borderRadius: BorderRadius.circular(12)),
            child: Text(treatment['status'], style: TextStyles.caption.copyWith(color: treatment['color'], fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  IconData _getTreatmentIcon(String type) {
    switch (type) {
      case 'General': return Icons.medical_services;
      case 'Hygiene': return Icons.clean_hands;
      case 'Restorative': return Icons.build;
      default: return Icons.medical_services;
    }
  }

  Widget _buildDoctorReportsTab() {
    if (_loadingDoctor) return const Center(child: CircularProgressIndicator());
    if (_doctorReportsError != null) return _buildErrorState(_doctorReportsError!, _loadDoctorReports);
    if (_doctorReports.isEmpty) return _buildEmptyState('No reports from doctor', 'Reports sent by your doctor will appear here', Icons.local_hospital);

    return RefreshIndicator(
      onRefresh: _loadDoctorReports,
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: _doctorReports.length,
        itemBuilder: (ctx, i) => _buildDoctorReportCard(_doctorReports[i] as Map<String, dynamic>),
      ),
    );
  }

  Widget _buildDoctorReportCard(Map<String, dynamic> report) {
    final scanId = report['scanId'] as String;
    final isDownloading = _downloading[scanId] == true;

    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      decoration: BoxDecoration(
        color: const Color(0xFFF0FDF4),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: Colors.green.withOpacity(0.3)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(Icons.local_hospital, color: Colors.green, size: 22),
                const SizedBox(width: 12),
                Expanded(child: Text(report['doctorName'] ?? 'Your Doctor', style: const TextStyle(fontWeight: FontWeight.bold))),
                const Text('From Doctor', style: TextStyle(color: Colors.green, fontSize: 10, fontWeight: FontWeight.bold)),
              ],
            ),
            const SizedBox(height: 10),
            Text('Sent on ${_formatDate(report['sentAt'])}', style: TextStyle(fontSize: 12, color: Colors.grey[600])),
            if (report['doctorNote'] != null) Text(report['doctorNote'], style: const TextStyle(fontSize: 13, fontStyle: FontStyle.italic)),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: isDownloading ? null : () => _openDoctorReport(report),
                    icon: isDownloading 
                        ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white)) 
                        : const Icon(Icons.open_in_new, size: 16),
                    label: Text(isDownloading ? 'Opening...' : 'Open'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.green,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: () => _downloadReportToDevice(scanId),
                    icon: const Icon(Icons.download, size: 16),
                    label: const Text('Download'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.blue,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPrescriptionsTab() {
    if (_loadingPrescriptions) return const Center(child: CircularProgressIndicator());
    if (_prescriptionsError != null) return _buildErrorState(_prescriptionsError!, _loadPrescriptions);
    if (_prescriptions.isEmpty) return _buildEmptyState('No prescriptions', 'Prescriptions from your doctor will appear here', Icons.medication);

    return RefreshIndicator(
      onRefresh: _loadPrescriptions,
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: _prescriptions.length,
        itemBuilder: (ctx, i) {
          final p = _prescriptions[i] as Map<String, dynamic>;
          final meds = p['medications'] as List<dynamic>? ?? [];
          return Card(
            margin: const EdgeInsets.only(bottom: 16),
            child: ExpansionTile(
              leading: Icon(Icons.description, color: AppColors.primary),
              title: Text(p['diagnosis'] ?? 'Prescription', style: const TextStyle(fontWeight: FontWeight.bold)),
              subtitle: Text(_formatDate(p['createdAt'])),
              children: [
                Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Medications:', style: TextStyle(fontWeight: FontWeight.bold)),
                      ...meds.map((m) => ListTile(title: Text(m['name']), subtitle: Text('${m['dosage']} - ${m['frequency']}'))),
                      if (p['notes'] != null) Text('Notes: ${p['notes']}'),
                    ],
                  ),
                )
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildEmptyState(String title, String desc, IconData icon) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, size: 64, color: Colors.grey),
          const SizedBox(height: 16),
          Text(title, style: TextStyles.heading4),
          Text(desc, style: TextStyles.bodySmall.copyWith(color: Colors.grey)),
        ],
      ),
    );
  }

  Widget _buildErrorState(String message, VoidCallback onRetry) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.error_outline, size: 64, color: Colors.red),
          Text(message, textAlign: TextAlign.center),
          ElevatedButton(onPressed: onRetry, child: const Text('Retry')),
        ],
      ),
    );
  }
}