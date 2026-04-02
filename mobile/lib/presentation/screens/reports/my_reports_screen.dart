import 'dart:io';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_application_1/core/services/report_storage_service.dart';
import 'package:flutter_application_1/core/themes/colors.dart';
import 'package:flutter_application_1/data/data_sources/remote/dental_remote_data_source.dart';
import 'package:flutter_application_1/injection_container.dart';
import 'package:flutter_application_1/presentation/screens/reports/pdf_viewer_screen.dart';
import 'package:intl/intl.dart';
import 'package:http/http.dart' as http;
import 'package:path_provider/path_provider.dart';
import 'package:flutter_application_1/core/constants/app_constants.dart';
import 'package:flutter_application_1/data/data_sources/local/shared_prefs.dart';

class MyReportsScreen extends StatefulWidget {
  const MyReportsScreen({super.key});

  @override
  State<MyReportsScreen> createState() => _MyReportsScreenState();
}

class _MyReportsScreenState extends State<MyReportsScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  // My Scan Reports (locally saved)
  List<Map<String, dynamic>> _myReports = [];
  bool _loadingMy = true;

  // Doctor Sent Reports
  List<dynamic> _doctorReports = [];
  bool _loadingDoctor = true;
  String? _doctorReportsError;

  // Downloading state
  final Map<String, bool> _downloading = {};

  late final DentalRemoteDataSource _dentalDataSource;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _dentalDataSource = getIt<DentalRemoteDataSource>();
    _loadMyReports();
    _loadDoctorReports();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadMyReports() async {
    setState(() => _loadingMy = true);
    final reports = await ReportStorageService.loadReports();
    if (mounted) setState(() { _myReports = reports; _loadingMy = false; });
  }

  Future<void> _loadDoctorReports() async {
    setState(() { _loadingDoctor = true; _doctorReportsError = null; });
    try {
      final reports = await _dentalDataSource.getDoctorSentReports();
      if (mounted) setState(() { _doctorReports = reports; _loadingDoctor = false; });
    } catch (e) {
      if (mounted) setState(() { _doctorReportsError = 'Failed to load reports.'; _loadingDoctor = false; });
    }
  }

  // Download PDF from backend and open it
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
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Could not download report. Please try again.')),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Network error. Please check your connection.')),
        );
      }
    } finally {
      if (mounted) setState(() => _downloading.remove(scanId));
    }
  }

  Future<void> _openMyReport(Map<String, dynamic> report) async {
    final path = report['filePath'] as String;
    if (!await File(path).exists()) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('File not found. It may have been deleted.')),
        );
      }
      return;
    }
    if (mounted) {
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (_) => PdfViewerScreen(
            filePath: path,
            title: report['title'] as String? ?? 'Scan Report',
          ),
        ),
      );
    }
  }

  Future<void> _sendToDoctor(Map<String, dynamic> report) async {
    // 1. Load doctors list
    List<dynamic> doctors = [];
    bool loadingDoctors = true;

    await showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setSheet) {
          if (loadingDoctors) {
            _dentalDataSource.getDentists().then((list) {
              setSheet(() { doctors = list; loadingDoctors = false; });
            }).catchError((_) => setSheet(() => loadingDoctors = false));
          }
          return Container(
            decoration: const BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
            ),
            child: DraggableScrollableSheet(
              expand: false,
              initialChildSize: 0.6,
              maxChildSize: 0.9,
              builder: (_, sc) => Column(
                children: [
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
                          child: Icon(Icons.send, color: AppColors.primary, size: 20),
                        ),
                        const SizedBox(width: 12),
                        const Text('Send Report to Doctor',
                            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
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
                    child: loadingDoctors
                        ? const Center(child: CircularProgressIndicator())
                        : doctors.isEmpty
                            ? const Center(child: Text('No doctors available'))
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
                                  return ListTile(
                                    contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 4),
                                    leading: CircleAvatar(
                                      backgroundColor: AppColors.primary.withOpacity(0.12),
                                      child: Text(
                                        name.isNotEmpty ? name[0].toUpperCase() : 'D',
                                        style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold),
                                      ),
                                    ),
                                    title: Text(name, style: const TextStyle(fontWeight: FontWeight.w600)),
                                    subtitle: spec.isNotEmpty ? Text(spec, style: const TextStyle(fontSize: 12)) : null,
                                    trailing: Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                      decoration: BoxDecoration(
                                        color: AppColors.primary.withOpacity(0.1),
                                        borderRadius: BorderRadius.circular(20),
                                      ),
                                      child: Text('Send', style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.w600, fontSize: 13)),
                                    ),
                                    onTap: () async {
                                      Navigator.pop(ctx);
                                      await _uploadReportToDoctor(report, id, name);
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

  Future<void> _uploadReportToDoctor(Map<String, dynamic> report, String doctorId, String doctorName) async {
    final filePath = report['filePath'] as String?;
    if (filePath == null || !await File(filePath).exists()) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Report file not found.')),
      );
      return;
    }

    // Show sending indicator
    if (mounted) ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Sending report to $doctorName...'), duration: const Duration(seconds: 2)),
    );

    try {
      final localData = getIt<LocalDataSource>();
      final token = await localData.getString(AppConstants.tokenKey) ?? '';

      final uri = Uri.parse('${AppConstants.baseUrl}/scan-qa/send-report');
      final request = http.MultipartRequest('POST', uri)
        ..headers['Authorization'] = 'Bearer $token'
        ..fields['note'] = 'AI Scan Report from patient'
        ..fields['scanResults'] = jsonEncode(report['analysisResults'] ?? {})
        ..files.add(await http.MultipartFile.fromPath('report', filePath, filename: 'scan_report.pdf'));

      final response = await request.send();

      if (mounted) {
        if (response.statusCode == 201) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Report sent to $doctorName successfully!'),
              backgroundColor: Colors.green,
            ),
          );
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Failed to send report. Please try again.'), backgroundColor: Colors.red),
          );
        }
      }
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Network error. Please check your connection.'), backgroundColor: Colors.red),
      );
    }
  }

  Future<void> _deleteMyReport(Map<String, dynamic> report) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Delete Report?'),
        content: const Text('This will permanently delete this report.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red, foregroundColor: Colors.white),
            child: const Text('Delete'),
          ),
        ],
      ),
    );
    if (confirmed == true) {
      await ReportStorageService.deleteReport(report['id'] as String);
      _loadMyReports();
    }
  }

  String _formatDate(String? iso) {
    if (iso == null) return '';
    try {
      final dt = DateTime.parse(iso).toLocal();
      return DateFormat('dd MMM yyyy, hh:mm a').format(dt);
    } catch (_) {
      return iso;
    }
  }

  String _getSummary(Map<String, dynamic> report) {
    final results = report['analysisResults'] as Map<String, dynamic>? ?? {};
    final conditions = results['detectedConditions'] as List<dynamic>? ?? [];
    if (conditions.isEmpty) return 'No conditions detected';
    final names = conditions.map((c) {
      final cm = c as Map<String, dynamic>;
      return cm['name'] ?? cm['modelClassName'] ?? '';
    }).where((n) => n.isNotEmpty).join(', ');
    return names.isNotEmpty ? names : 'Scan completed';
  }

  bool _hasCancer(Map<String, dynamic> report) {
    final results = report['analysisResults'] as Map<String, dynamic>? ?? {};
    return results['hasOralCancer'] == true;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Reports'),
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: Colors.white,
          labelColor: Colors.white,
          unselectedLabelColor: Colors.white70,
          tabs: const [
            Tab(icon: Icon(Icons.phone_android, size: 18), text: 'My Scans'),
            Tab(icon: Icon(Icons.local_hospital, size: 18), text: 'From Doctor'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildMyScansTab(),
          _buildDoctorReportsTab(),
        ],
      ),
    );
  }

  Widget _buildMyScansTab() {
    if (_loadingMy) return const Center(child: CircularProgressIndicator());
    if (_myReports.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.description_outlined, size: 72, color: Colors.grey[400]),
            const SizedBox(height: 16),
            Text('No saved reports yet', style: TextStyle(fontSize: 18, color: Colors.grey[600])),
            const SizedBox(height: 8),
            Text('Run an AI Teeth Scan and save the report',
                style: TextStyle(fontSize: 13, color: Colors.grey[500])),
          ],
        ),
      );
    }
    return RefreshIndicator(
      onRefresh: _loadMyReports,
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: _myReports.length,
        itemBuilder: (ctx, i) => _buildMyReportCard(_myReports[i]),
      ),
    );
  }

  Widget _buildDoctorReportsTab() {
    if (_loadingDoctor) return const Center(child: CircularProgressIndicator());
    if (_doctorReportsError != null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.error_outline, size: 64, color: Colors.red[300]),
            const SizedBox(height: 16),
            Text(_doctorReportsError!, style: const TextStyle(color: Colors.red)),
            const SizedBox(height: 16),
            ElevatedButton(onPressed: _loadDoctorReports, child: const Text('Retry')),
          ],
        ),
      );
    }
    if (_doctorReports.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.inbox_outlined, size: 72, color: Colors.grey[400]),
            const SizedBox(height: 16),
            Text('No reports from doctor yet', style: TextStyle(fontSize: 18, color: Colors.grey[600])),
            const SizedBox(height: 8),
            Text('Reports sent by your doctor will appear here',
                style: TextStyle(fontSize: 13, color: Colors.grey[500])),
          ],
        ),
      );
    }
    return RefreshIndicator(
      onRefresh: _loadDoctorReports,
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: _doctorReports.length,
        itemBuilder: (ctx, i) => _buildDoctorReportCard(_doctorReports[i] as Map<String, dynamic>),
      ),
    );
  }

  Widget _buildMyReportCard(Map<String, dynamic> report) {
    final isCancer = _hasCancer(report);
    final borderColor = isCancer ? Colors.red : AppColors.primary;
    final bgColor = isCancer ? const Color(0xFFFEE2E2) : const Color(0xFFEFF6FF);

    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: borderColor.withOpacity(0.4)),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 8, offset: const Offset(0, 2))],
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(color: borderColor.withOpacity(0.15), borderRadius: BorderRadius.circular(8)),
                  child: Icon(Icons.picture_as_pdf, color: borderColor, size: 22),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(report['title'] as String? ?? 'Scan Report',
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                      const SizedBox(height: 2),
                      Text(_formatDate(report['createdAt'] as String?),
                          style: TextStyle(fontSize: 12, color: Colors.grey[600])),
                    ],
                  ),
                ),
                if (isCancer)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(color: Colors.red, borderRadius: BorderRadius.circular(20)),
                    child: const Text('URGENT', style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
                  ),
              ],
            ),
            const SizedBox(height: 10),
            Text(_getSummary(report), style: TextStyle(fontSize: 13, color: Colors.grey[700])),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () => _openMyReport(report),
                    icon: const Icon(Icons.open_in_new, size: 16),
                    label: const Text('Open'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: Colors.indigo,
                      side: const BorderSide(color: Colors.indigo),
                      padding: const EdgeInsets.symmetric(vertical: 8),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () => _sendToDoctor(report),
                    icon: const Icon(Icons.send, size: 16),
                    label: const Text('Send'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppColors.primary,
                      side: BorderSide(color: AppColors.primary),
                      padding: const EdgeInsets.symmetric(vertical: 8),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () => _deleteMyReport(report),
                    icon: const Icon(Icons.delete_outline, size: 16),
                    label: const Text('Delete'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: Colors.red,
                      side: const BorderSide(color: Colors.red),
                      padding: const EdgeInsets.symmetric(vertical: 8),
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

  Widget _buildDoctorReportCard(Map<String, dynamic> report) {
    final scanId = report['scanId'] as String;
    final isDownloading = _downloading[scanId] == true;

    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      decoration: BoxDecoration(
        color: const Color(0xFFF0FDF4),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: Colors.green.withOpacity(0.3)),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 8, offset: const Offset(0, 2))],
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(color: Colors.green.withOpacity(0.15), borderRadius: BorderRadius.circular(8)),
                  child: const Icon(Icons.local_hospital, color: Colors.green, size: 22),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        report['doctorName'] as String? ?? 'Your Doctor',
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                      ),
                      if ((report['doctorSpecialization'] as String?)?.isNotEmpty == true)
                        Text(report['doctorSpecialization'] as String,
                            style: TextStyle(fontSize: 12, color: Colors.grey[600])),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(color: Colors.green.withOpacity(0.15), borderRadius: BorderRadius.circular(20)),
                  child: const Text('From Doctor', style: TextStyle(color: Colors.green, fontSize: 10, fontWeight: FontWeight.bold)),
                ),
              ],
            ),
            const SizedBox(height: 10),
            Text(
              'Sent on ${_formatDate(report['sentAt'] as String?)}',
              style: TextStyle(fontSize: 12, color: Colors.grey[600]),
            ),
            if ((report['doctorNote'] as String?)?.isNotEmpty == true) ...[
              const SizedBox(height: 6),
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: Colors.green.withOpacity(0.08),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Icon(Icons.notes, size: 16, color: Colors.green),
                    const SizedBox(width: 6),
                    Expanded(
                      child: Text(
                        report['doctorNote'] as String,
                        style: const TextStyle(fontSize: 13, fontStyle: FontStyle.italic),
                      ),
                    ),
                  ],
                ),
              ),
            ],
            const SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: isDownloading ? null : () => _openDoctorReport(report),
                icon: isDownloading
                    ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                    : const Icon(Icons.open_in_new, size: 16),
                label: Text(isDownloading ? 'Opening...' : 'Open Report'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.green,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 10),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
