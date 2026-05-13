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
import 'package:http_parser/http_parser.dart';
import 'package:path_provider/path_provider.dart';
import 'package:flutter_application_1/core/constants/app_constants.dart';
import 'package:flutter_application_1/data/data_sources/local/shared_prefs.dart';
import 'package:url_launcher/url_launcher.dart';

class MyReportsScreen extends StatefulWidget {
  const MyReportsScreen({super.key});

  @override
  State<MyReportsScreen> createState() => _MyReportsScreenState();
}

class _MyReportsScreenState extends State<MyReportsScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  // Doctor Sent Reports
  List<dynamic> _doctorReports = [];
  bool _loadingDoctor = true;
  String? _doctorReportsError;

  // Prescriptions
  List<dynamic> _prescriptions = [];
  bool _loadingPrescriptions = true;
  String? _prescriptionsError;


  // Downloading state
  final Map<String, bool> _downloading = {};

  late final DentalRemoteDataSource _dentalDataSource;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _dentalDataSource = getIt<DentalRemoteDataSource>();
    _loadDoctorReports();
    _loadPrescriptions();
  }


  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }



  Future<void> _loadDoctorReports() async {
    setState(() { _loadingDoctor = true; _doctorReportsError = null; });
    try {
      final reports = await _dentalDataSource.getDoctorSentReports();
      if (mounted) setState(() { _doctorReports = reports; _loadingDoctor = false; });
    } catch (e) {
      debugPrint('❌ getDoctorSentReports error: $e');
      if (mounted) setState(() { _doctorReportsError = 'Failed to load reports: ${e.toString()}'; _loadingDoctor = false; });
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
    } catch (_) {
      return iso;
    }
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
            Tab(icon: Icon(Icons.local_hospital, size: 18), text: 'From Doctor'),
            Tab(icon: Icon(Icons.medication, size: 18), text: 'Prescriptions'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildDoctorReportsTab(),
          _buildPrescriptionsTab(),
        ],
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
                      padding: const EdgeInsets.symmetric(vertical: 10),
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
                      padding: const EdgeInsets.symmetric(vertical: 10),
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
    if (_prescriptionsError != null) return Center(child: Text('Error: $_prescriptionsError'));
    if (_prescriptions.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.medication_outlined, size: 72, color: Colors.grey[400]),
            const SizedBox(height: 16),
            const Text('No prescriptions found', style: TextStyle(fontSize: 18, color: Colors.grey)),
          ],
        ),
      );
    }
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
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
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
                      const Text('Medications:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                      const SizedBox(height: 8),
                      ...meds.map((m) => ListTile(
                        dense: true,
                        title: Text(m['name'], style: const TextStyle(fontWeight: FontWeight.bold)),
                        subtitle: Text('${m['dosage']} - ${m['frequency']} (${m['duration']})'),
                        trailing: m['instructions'] != null ? Icon(Icons.info_outline, size: 18, color: Colors.grey[400]) : null,
                      )),
                      if (p['notes'] != null && p['notes'].toString().isNotEmpty) ...[
                        const Divider(),
                        const Text('Doctor Notes:', style: TextStyle(fontWeight: FontWeight.bold)),
                        Text(p['notes']),
                      ]
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
}


