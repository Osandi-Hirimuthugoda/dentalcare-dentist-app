import 'dart:convert';
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:path_provider/path_provider.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ReportStorageService {
  static const _reportsKey = 'saved_scan_reports';

  /// Save a report: copies PDF bytes to app documents dir and stores metadata
  static Future<void> saveReport({
    required String title,
    required List<int> pdfBytes,
    required Map<String, dynamic> analysisResults,
  }) async {
    final dir = await getApplicationDocumentsDirectory();
    final reportsDir = Directory('${dir.path}/scan_reports');
    if (!await reportsDir.exists()) await reportsDir.create(recursive: true);

    final timestamp = DateTime.now().millisecondsSinceEpoch;
    final fileName = 'report_$timestamp.pdf';
    final filePath = '${reportsDir.path}/$fileName';

    await File(filePath).writeAsBytes(pdfBytes);

    final prefs = await SharedPreferences.getInstance();
    final existing = prefs.getStringList(_reportsKey) ?? [];

    final meta = {
      'id': timestamp.toString(),
      'title': title,
      'filePath': filePath,
      'createdAt': DateTime.now().toIso8601String(),
      'analysisResults': analysisResults,
    };

    existing.add(jsonEncode(meta));
    await prefs.setStringList(_reportsKey, existing);
    debugPrint('Report saved: $filePath');
  }

  /// Load all saved report metadata
  static Future<List<Map<String, dynamic>>> loadReports() async {
    final prefs = await SharedPreferences.getInstance();
    final list = prefs.getStringList(_reportsKey) ?? [];
    final reports = <Map<String, dynamic>>[];

    for (final item in list) {
      try {
        final meta = jsonDecode(item) as Map<String, dynamic>;
        // Only include if file still exists
        if (await File(meta['filePath'] as String).exists()) {
          reports.add(meta);
        }
      } catch (_) {}
    }

    // Sort newest first
    reports.sort((a, b) => (b['createdAt'] as String).compareTo(a['createdAt'] as String));
    return reports;
  }

  /// Delete a report by id
  static Future<void> deleteReport(String id) async {
    final prefs = await SharedPreferences.getInstance();
    final list = prefs.getStringList(_reportsKey) ?? [];
    final updated = <String>[];

    for (final item in list) {
      try {
        final meta = jsonDecode(item) as Map<String, dynamic>;
        if (meta['id'] == id) {
          final file = File(meta['filePath'] as String);
          if (await file.exists()) await file.delete();
        } else {
          updated.add(item);
        }
      } catch (_) {
        updated.add(item);
      }
    }

    await prefs.setStringList(_reportsKey, updated);
  }
}
