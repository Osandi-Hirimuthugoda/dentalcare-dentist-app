import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_application_1/core/services/report_storage_service.dart';
import 'package:flutter_application_1/core/themes/colors.dart';
import 'package:flutter_application_1/core/themes/text_styles.dart';
import 'package:flutter_application_1/data/data_sources/remote/dental_remote_data_source.dart';
import 'package:flutter_application_1/injection_container.dart' as di;
import 'package:image_picker/image_picker.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:path_provider/path_provider.dart';
import 'dart:io';
import 'dart:typed_data';

class TeethScanScreen extends StatefulWidget {
  const TeethScanScreen({super.key});

  @override
  State<TeethScanScreen> createState() => _TeethScanScreenState();
}

class _TeethScanScreenState extends State<TeethScanScreen> {
  File? _selectedImage;
  bool _isProcessing = false;
  bool _showResults = false;
  final ImagePicker _picker = ImagePicker();
  late final DentalRemoteDataSource _dentalDataSource;

  Map<String, dynamic> _analysisResults = {};
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _dentalDataSource = di.getIt<DentalRemoteDataSource>();
  }

  Future<void> _pickImageFromCamera() async {
    final XFile? image = await _picker.pickImage(
      source: ImageSource.camera,
      maxWidth: 800,
      maxHeight: 600,
      imageQuality: 85,
    );

    if (image != null) {
      setState(() {
        _selectedImage = File(image.path);
      });
    }
  }

  Future<void> _pickImageFromGallery() async {
    final XFile? image = await _picker.pickImage(
      source: ImageSource.gallery,
      maxWidth: 800,
      maxHeight: 600,
      imageQuality: 85,
    );

    if (image != null) {
      setState(() {
        _selectedImage = File(image.path);
      });
    }
  }

  Future<void> _startProcessing() async {
    if (_selectedImage == null) {
      _showSnackBar('Please select an image first');
      return;
    }

    setState(() {
      _isProcessing = true;
      _showResults = false;
      _errorMessage = null;
    });

    try {
      // Upload image to backend and get CNN model results
      final result = await _dentalDataSource.uploadTeethScan(
        _selectedImage!.path,
      );

      debugPrint('📥 Received result from backend: ${result.keys}');
      debugPrint('📥 Analysis data: ${result['analysis']?.keys}');

      if (mounted) {
        final analysis = result['analysis'] ?? {};
        final detectedConditions =
            analysis['detectedConditions'] as List<dynamic>? ?? [];

        debugPrint(
          '📊 Detected conditions count: ${detectedConditions.length}',
        );
        if (detectedConditions.isNotEmpty) {
          final firstCondition = detectedConditions[0] as Map<String, dynamic>;
          debugPrint(
            '📊 First condition class: ${firstCondition['modelClassName']}',
          );
          debugPrint('📊 First condition name: ${firstCondition['name']}');
        }

        setState(() {
          _analysisResults = analysis;
          _isProcessing = false;
          _showResults = true;
        });

        // Automatically create a Scan QA session for the doctor to review
        if (result['imageUrl'] != null) {
          try {
            // Generate a temporary scanId or use one if provided by backend
            final String scanId = 'SCAN_${DateTime.now().millisecondsSinceEpoch}';
            
            await _dentalDataSource.createScanQA(
              result['imageUrl'],
              analysis,
              scanId: scanId,
            );
            debugPrint('✅ Automatically created Scan QA session with ID: $scanId');
          } catch (qaErr) {
            debugPrint(
              '⚠️ Failed to automatically create Scan QA session: $qaErr',
            );
          }
        }
      }
    } catch (e) {
      debugPrint('❌ Error processing teeth scan: $e');
      if (mounted) {
        setState(() {
          _isProcessing = false;
          _errorMessage =
              e.toString().contains('Network')
                  ? 'Network error. Please check your connection.'
                  : 'Failed to process image. Please try again.';
        });
        _showSnackBar(_errorMessage ?? 'Failed to process image');
      }
    }
  }

  void _showDoctorRecommendation() {
    final hasOralCancer = _analysisResults['hasOralCancer'] ?? false;
    final conditions =
        _analysisResults['detectedConditions'] as List<dynamic>? ?? [];

    List<String> recommendedSpecialists = [];

    // If cancer detected, suggest oncologists/specialists
    if (hasOralCancer) {
      recommendedSpecialists.add('Oral Oncologist (URGENT)');
      recommendedSpecialists.add('Oral Surgeon');
      recommendedSpecialists.add('Oncologist');
    } else {
      // For normal diseases (calculus, gingivitis, ulcers, olp), suggest normal dentists
      conditions.forEach((condition) {
        final conditionMap = condition as Map<String, dynamic>;
        final modelClassName = conditionMap['modelClassName']?.toString() ?? '';

        // Check for the 5 diseases from the model
        if (modelClassName == 'calculus' ||
            modelClassName == 'gingivitis' ||
            modelClassName == 'ulcers' ||
            modelClassName == 'olp') {
          // Map diseases to appropriate dentists
          if (modelClassName == 'gingivitis') {
            if (!recommendedSpecialists.contains('Periodontist')) {
              recommendedSpecialists.add('Periodontist');
            }
          }
          if (modelClassName == 'calculus') {
            if (!recommendedSpecialists.contains('General Dentist')) {
              recommendedSpecialists.add('General Dentist');
            }
          }
          if (modelClassName == 'ulcers' || modelClassName == 'olp') {
            if (!recommendedSpecialists.contains('Oral Medicine Specialist')) {
              recommendedSpecialists.add('Oral Medicine Specialist');
            }
          }
        }
      });

      // If no specific specialist found, add general dentist
      if (recommendedSpecialists.isEmpty) {
        recommendedSpecialists.add('General Dentist');
      }
    }

    showDialog(
      context: context,
      builder:
          (context) => AlertDialog(
            title: Row(
              children: [
                Icon(
                  hasOralCancer ? Icons.emergency : Icons.medical_services,
                  color: hasOralCancer ? AppColors.error : AppColors.primary,
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    hasOralCancer
                        ? 'Urgent: See Specialist'
                        : 'Recommended Specialists',
                    style: TextStyles.heading4,
                  ),
                ),
              ],
            ),
            content: SizedBox(
              width: double.maxFinite,
              child: ListView(
                shrinkWrap: true,
                children: [
                  if (hasOralCancer)
                    Container(
                      padding: const EdgeInsets.all(12),
                      margin: const EdgeInsets.only(bottom: 15),
                      decoration: BoxDecoration(
                        color: AppColors.error.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        'Oral cancer detected. Immediate consultation required!',
                        style: TextStyles.bodyMedium.copyWith(
                          color: AppColors.error,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  const Text('Based on AI analysis, we recommend consulting:'),
                  const SizedBox(height: 15),
                  ...recommendedSpecialists
                      .map<Widget>(
                        (specialist) => ListTile(
                          leading: Icon(
                            Icons.medical_services,
                            color:
                                specialist.contains('URGENT')
                                    ? AppColors.error
                                    : AppColors.primary,
                          ),
                          title: Text(
                            specialist,
                            style: TextStyle(
                              fontWeight:
                                  specialist.contains('URGENT')
                                      ? FontWeight.bold
                                      : FontWeight.normal,
                              color:
                                  specialist.contains('URGENT')
                                      ? AppColors.error
                                      : AppColors.textPrimary,
                            ),
                          ),
                          subtitle: Text(
                            'Specialized in ${specialist.replaceAll(' (URGENT)', '')} treatments',
                          ),
                        ),
                      )
                      .toList(),
                  const SizedBox(height: 10),
                  const Text(
                    'Please book an appointment for professional diagnosis.',
                  ),
                ],
              ),
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context),
                child: const Text('Cancel'),
              ),
              ElevatedButton(
                onPressed: () {
                  Navigator.pop(context);
                  Navigator.pushNamed(context, '/book-appointment');
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor:
                      hasOralCancer ? AppColors.error : AppColors.primary,
                ),
                child: Text(
                  hasOralCancer
                      ? 'Book Urgent Appointment'
                      : 'Book Appointment',
                ),
              ),
            ],
          ),
    );
  }

  void _resetScan() {
    setState(() {
      _selectedImage = null;
      _isProcessing = false;
      _showResults = false;
      _analysisResults = {};
      _errorMessage = null;
    });
  }

  void _showSnackBar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message), duration: const Duration(seconds: 2)),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('AI Teeth Scan'),
        backgroundColor: AppColors.primary,
        foregroundColor: AppColors.white,
        actions: [
          if (_showResults || _isProcessing)
            IconButton(
              icon: const Icon(Icons.refresh),
              onPressed: _resetScan,
              tooltip: 'Start New Scan',
            ),
        ],
      ),
      body: _buildCurrentScreen(),
    );
  }

  Widget _buildCurrentScreen() {
    if (_isProcessing) {
      return _buildProcessingScreen();
    }

    if (_showResults) {
      return _buildResultsScreen();
    }

    if (_errorMessage != null) {
      return _buildErrorScreen();
    }

    return _buildImageSelectionScreen();
  }

  Widget _buildErrorScreen() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.error_outline, color: AppColors.error, size: 64),
            const SizedBox(height: 16),
            Text(
              'Processing Failed',
              style: TextStyles.heading4.copyWith(color: AppColors.error),
            ),
            const SizedBox(height: 8),
            Text(
              _errorMessage ?? 'Unknown error occurred',
              style: TextStyles.bodyMedium,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: _resetScan,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: AppColors.white,
              ),
              child: const Text('Try Again'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildImageSelectionScreen() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        children: [
          _buildScanInstructions(),
          const SizedBox(height: 20),
          _buildImageSection(),
          const SizedBox(height: 20),
          _buildActionButtons(),
        ],
      ),
    );
  }

  Widget _buildProcessingScreen() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const CircularProgressIndicator(),
          const SizedBox(height: 20),
          Text('Processing Your Image with AI...', style: TextStyles.heading4),
          const SizedBox(height: 10),
          Text(
            'Our CNN model is analyzing your image for oral cancer and diseases',
            style: TextStyles.bodySmall.copyWith(
              color: AppColors.textSecondary,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 20),
          if (_selectedImage != null)
            Container(
              margin: const EdgeInsets.symmetric(horizontal: 40),
              height: 150,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.grey300),
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(12),
                child: Image.file(_selectedImage!, fit: BoxFit.cover),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildResultsScreen() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildHealthScore(),
          const SizedBox(height: 20),
          _buildDetectedIssues(),
          const SizedBox(height: 20),
          _buildActionButtonsResults(),
        ],
      ),
    );
  }

  Widget _buildHealthScore() {
    final conditions =
        _analysisResults['detectedConditions'] as List<dynamic>? ?? [];
    final hasOralCancer = _analysisResults['hasOralCancer'] ?? false;

    if (conditions.isEmpty) {
      return const SizedBox.shrink();
    }

    final conditionMap = conditions[0] as Map<String, dynamic>;

    // Get the model's detected class name - THIS IS FROM THE 5 CLASSES
    final detectedClassName = conditionMap['modelClassName']?.toString() ?? '';

    debugPrint('🔍 Detected class name from model: $detectedClassName');

    // Verify it's one of the 5 classes
    final validClasses = ['calculus', 'cancers', 'gingivitis', 'ulcers', 'olp'];
    if (detectedClassName.isNotEmpty &&
        !validClasses.contains(detectedClassName.toLowerCase())) {
      debugPrint(
        '⚠️  Warning: Detected class "$detectedClassName" is not in valid classes: $validClasses',
      );
    }

    // Get disease name from class name if name is not available
    final diseaseName =
        conditionMap['name']?.toString() ??
        (detectedClassName.isNotEmpty
            ? _getDiseaseNameFromClass(detectedClassName)
            : 'Unknown Disease');
    final isCancer =
        hasOralCancer || detectedClassName.toLowerCase() == 'cancers';

    debugPrint('📋 Disease name: $diseaseName');
    debugPrint('📋 Is cancer: $isCancer');

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            // Show detected disease name prominently
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color:
                    isCancer
                        ? AppColors.error.withValues(alpha: 0.1)
                        : AppColors.primary.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: isCancer ? AppColors.error : AppColors.primary,
                  width: 2,
                ),
              ),
              child: Column(
                children: [
                  Icon(
                    isCancer ? Icons.warning : Icons.medical_services,
                    color: isCancer ? AppColors.error : AppColors.primary,
                    size: 48,
                  ),
                  const SizedBox(height: 12),
                  Text(
                    'Detected Disease:',
                    style: TextStyles.bodyMedium.copyWith(
                      color: AppColors.textSecondary,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    diseaseName,
                    style: TextStyles.heading3.copyWith(
                      color: isCancer ? AppColors.error : AppColors.primary,
                      fontWeight: FontWeight.bold,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 8),
                  // Show the model's detected class name (one of 5 classes)
                  if (detectedClassName.isNotEmpty)
                    Text(
                      'Model Detected Class: ${_getClassDisplayName(detectedClassName)}',
                      style: TextStyles.bodySmall.copyWith(
                        color: AppColors.textSecondary,
                        fontStyle: FontStyle.italic,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  if (detectedClassName.isEmpty)
                    Text(
                      'Class: Unknown',
                      style: TextStyles.bodySmall.copyWith(
                        color: AppColors.error,
                        fontStyle: FontStyle.italic,
                      ),
                    ),
                ],
              ),
            ),
            // Cancer warning
            if (isCancer) ...[
              const SizedBox(height: 16),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.error.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.error, width: 2),
                ),
                child: Column(
                  children: [
                    Row(
                      children: [
                        Icon(Icons.emergency, color: AppColors.error, size: 24),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Text(
                            'URGENT: Immediate Medical Attention Required',
                            style: TextStyles.bodyMedium.copyWith(
                              color: AppColors.error,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Please consult an oral oncologist immediately for further evaluation and biopsy.',
                      style: TextStyles.bodySmall.copyWith(
                        color: AppColors.error,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildDetectedIssues() {
    final conditions =
        _analysisResults['detectedConditions'] as List<dynamic>? ?? [];

    if (conditions.isEmpty) {
      return const SizedBox.shrink();
    }

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 10),
            ...conditions.map((condition) {
              final conditionMap = condition as Map<String, dynamic>;
              final type = conditionMap['type']?.toString() ?? '';
              final isCancer = type == 'oral_cancer';
              final isDisease = type == 'oral_disease';
              return Container(
                margin: const EdgeInsets.only(bottom: 16),
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: _getSeverityColor(
                    conditionMap['severity']?.toString() ?? 'Low',
                  ).withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color:
                        isCancer
                            ? AppColors.error
                            : _getSeverityColor(
                              conditionMap['severity']?.toString() ?? 'Low',
                            ).withValues(alpha: 0.3),
                    width: isCancer ? 2 : 1,
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        // Type badge
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 10,
                            vertical: 6,
                          ),
                          decoration: BoxDecoration(
                            color:
                                isCancer
                                    ? AppColors.error
                                    : isDisease
                                    ? AppColors.warning
                                    : AppColors.success,
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Text(
                            isCancer
                                ? 'CANCER'
                                : isDisease
                                ? 'DISEASE'
                                : 'HEALTHY',
                            style: const TextStyle(
                              color: AppColors.white,
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        // Severity badge
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 10,
                            vertical: 6,
                          ),
                          decoration: BoxDecoration(
                            color: _getSeverityColor(
                              conditionMap['severity']?.toString() ?? 'Low',
                            ),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Text(
                            conditionMap['severity']?.toString() ?? 'Low',
                            style: const TextStyle(
                              color: AppColors.white,
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Text(
                      conditionMap['name']?.toString() ??
                          (conditionMap['modelClassName'] != null
                              ? _getDiseaseNameFromClass(
                                conditionMap['modelClassName']?.toString() ??
                                    '',
                              )
                              : 'Unknown Condition'),
                      style: TextStyles.bodyMedium.copyWith(
                        fontWeight: FontWeight.bold,
                        fontSize: 18,
                        color:
                            isCancer ? AppColors.error : AppColors.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      conditionMap['description']?.toString() ?? '',
                      style: TextStyles.bodySmall,
                    ),
                    const SizedBox(height: 8),
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: AppColors.info.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Icon(
                            Icons.lightbulb_outline,
                            color: AppColors.info,
                            size: 18,
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              conditionMap['recommendation']?.toString() ??
                                  'Consult a dental professional.',
                              style: TextStyles.bodySmall.copyWith(
                                fontWeight: FontWeight.w500,
                                color: AppColors.info,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    if (isCancer) ...[
                      const SizedBox(height: 8),
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: AppColors.error.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Row(
                          children: [
                            Icon(
                              Icons.emergency,
                              color: AppColors.error,
                              size: 18,
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                'URGENT: Please consult an oral oncologist immediately for biopsy and further evaluation.',
                                style: TextStyles.bodySmall.copyWith(
                                  fontWeight: FontWeight.bold,
                                  color: AppColors.error,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ],
                ),
              );
            }).toList(),
            const SizedBox(height: 10),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.info.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                children: [
                  Icon(Icons.info_outline, color: AppColors.info, size: 20),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      'This analysis is based on CNN AI model assessment. Please consult a dental professional for accurate diagnosis and treatment.',
                      style: TextStyles.caption.copyWith(color: AppColors.info),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Color _getSeverityColor(String severity) {
    switch (severity) {
      case 'High':
      case 'Critical':
        return AppColors.error;
      case 'Moderate-High':
        return AppColors.warning;
      case 'Moderate':
        return AppColors.warning;
      case 'Low-Moderate':
      case 'Low':
        return AppColors.success;
      default:
        return AppColors.grey500;
    }
  }

  String _getClassDisplayName(String className) {
    // Map model class names to user-friendly display names for the 5 classes
    switch (className.toLowerCase()) {
      case 'calculus':
        return 'Calculus';
      case 'cancers':
        return 'Cancers';
      case 'gingivitis':
        return 'Gingivitis';
      case 'ulcers':
        return 'Ulcers';
      case 'olp':
        return 'OLP (Oral Lichen Planus)';
      default:
        return className.isNotEmpty ? className.toUpperCase() : 'Unknown';
    }
  }

  String _getDiseaseNameFromClass(String className) {
    // Map class names to disease names for the 5 classes
    switch (className.toLowerCase()) {
      case 'calculus':
        return 'Dental Calculus (Tartar)';
      case 'cancers':
        return 'Oral Cancer';
      case 'gingivitis':
        return 'Gingivitis';
      case 'ulcers':
        return 'Oral Ulcers';
      case 'olp':
        return 'Oral Lichen Planus (OLP)';
      default:
        return className.isNotEmpty ? className : 'Unknown Disease';
    }
  }

  Widget _buildActionButtonsResults() {
    return Column(
      children: [
        SizedBox(
          width: double.infinity,
          child: ElevatedButton.icon(
            onPressed: _generateAndDownloadReport,
            icon: const Icon(Icons.picture_as_pdf),
            label: const Text('Download PDF Report'),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.success,
              foregroundColor: AppColors.white,
              padding: const EdgeInsets.symmetric(vertical: 14),
            ),
          ),
        ),
        const SizedBox(height: 10),
        SizedBox(
          width: double.infinity,
          child: ElevatedButton.icon(
            onPressed: _sendReportToDoctor,
            icon: const Icon(Icons.send),
            label: const Text('Send Report to Doctor'),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: AppColors.white,
              padding: const EdgeInsets.symmetric(vertical: 14),
            ),
          ),
        ),
        const SizedBox(height: 10),
        SizedBox(
          width: double.infinity,
          child: OutlinedButton.icon(
            onPressed: () {
              Navigator.pushNamed(
                context,
                '/book-appointment',
                arguments: {'scanReportData': _analysisResults},
              );
            },
            icon: const Icon(Icons.calendar_today),
            label: const Text('Book Appointment with Report'),
          ),
        ),
        const SizedBox(height: 10),
        SizedBox(
          width: double.infinity,
          child: OutlinedButton.icon(
            onPressed: _showDoctorRecommendation,
            icon: const Icon(Icons.medical_services),
            label: const Text('Consult Recommended Doctor'),
          ),
        ),
        const SizedBox(height: 10),
        OutlinedButton(
          onPressed: _resetScan,
          child: const Text('Start New Scan'),
        ),
      ],
    );
  }

  Future<Uint8List> _buildPdfBytes() async {
    final pdf = pw.Document();
    final conditions =
        _analysisResults['detectedConditions'] as List<dynamic>? ?? [];
    final hasOralCancer = _analysisResults['hasOralCancer'] ?? false;
    final now = DateTime.now();
    final dateStr = '${now.day}/${now.month}/${now.year}';

    // Load scan image bytes
    Uint8List? imageBytes;
    if (_selectedImage != null) {
      imageBytes = await _selectedImage!.readAsBytes();
    }

    pdf.addPage(
      pw.MultiPage(
        pageFormat: PdfPageFormat.a4,
        margin: const pw.EdgeInsets.all(32),
        build:
            (pw.Context context) => [
              // Header
              pw.Container(
                padding: const pw.EdgeInsets.all(16),
                decoration: pw.BoxDecoration(
                  color: PdfColor.fromHex('1E3A8A'),
                  borderRadius: pw.BorderRadius.circular(8),
                ),
                child: pw.Row(
                  mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                  children: [
                    pw.Column(
                      crossAxisAlignment: pw.CrossAxisAlignment.start,
                      children: [
                        pw.Text(
                          'DentalCare+',
                          style: pw.TextStyle(
                            color: PdfColors.white,
                            fontSize: 22,
                            fontWeight: pw.FontWeight.bold,
                          ),
                        ),
                        pw.Text(
                          'AI Teeth Scan Report',
                          style: const pw.TextStyle(
                            color: PdfColors.white,
                            fontSize: 13,
                          ),
                        ),
                      ],
                    ),
                    pw.Column(
                      crossAxisAlignment: pw.CrossAxisAlignment.end,
                      children: [
                        pw.Text(
                          'Date: $dateStr',
                          style: const pw.TextStyle(
                            color: PdfColors.white,
                            fontSize: 11,
                          ),
                        ),
                        pw.Text(
                          'Generated by AI Model',
                          style: const pw.TextStyle(
                            color: PdfColors.white,
                            fontSize: 10,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              pw.SizedBox(height: 20),

              // Scan image
              if (imageBytes != null) ...[
                pw.Text(
                  'Scanned Image',
                  style: pw.TextStyle(
                    fontSize: 14,
                    fontWeight: pw.FontWeight.bold,
                  ),
                ),
                pw.SizedBox(height: 8),
                pw.Center(
                  child: pw.Image(
                    pw.MemoryImage(imageBytes),
                    height: 180,
                    fit: pw.BoxFit.contain,
                  ),
                ),
                pw.SizedBox(height: 20),
              ],

              // Diagnosis summary
              pw.Container(
                padding: const pw.EdgeInsets.all(14),
                decoration: pw.BoxDecoration(
                  color:
                      hasOralCancer
                          ? PdfColor.fromHex('FEE2E2')
                          : PdfColor.fromHex('DBEAFE'),
                  borderRadius: pw.BorderRadius.circular(8),
                  border: pw.Border.all(
                    color:
                        hasOralCancer
                            ? PdfColor.fromHex('EF4444')
                            : PdfColor.fromHex('3B82F6'),
                  ),
                ),
                child: pw.Column(
                  crossAxisAlignment: pw.CrossAxisAlignment.start,
                  children: [
                    pw.Text(
                      'Diagnosis Summary',
                      style: pw.TextStyle(
                        fontSize: 14,
                        fontWeight: pw.FontWeight.bold,
                        color:
                            hasOralCancer
                                ? PdfColor.fromHex('991B1B')
                                : PdfColor.fromHex('1E3A8A'),
                      ),
                    ),
                    pw.SizedBox(height: 8),
                    if (hasOralCancer)
                      pw.Text(
                        '⚠ URGENT: Oral cancer indicators detected. Immediate specialist consultation required.',
                        style: pw.TextStyle(
                          color: PdfColor.fromHex('DC2626'),
                          fontWeight: pw.FontWeight.bold,
                        ),
                      ),
                    ...conditions.map((c) {
                      final cm = c as Map<String, dynamic>;
                      return pw.Padding(
                        padding: const pw.EdgeInsets.only(top: 6),
                        child: pw.Column(
                          crossAxisAlignment: pw.CrossAxisAlignment.start,
                          children: [
                            pw.Text(
                              '• ${cm['name'] ?? _getDiseaseNameFromClass(cm['modelClassName']?.toString() ?? '')}',
                              style: pw.TextStyle(
                                fontWeight: pw.FontWeight.bold,
                                fontSize: 13,
                              ),
                            ),
                            pw.Text(
                              '  Severity: ${cm['severity'] ?? 'N/A'}',
                              style: const pw.TextStyle(fontSize: 11),
                            ),
                            pw.Text(
                              '  ${cm['description'] ?? ''}',
                              style: const pw.TextStyle(fontSize: 11),
                            ),
                            pw.Text(
                              '  Recommendation: ${cm['recommendation'] ?? ''}',
                              style: const pw.TextStyle(
                                fontSize: 11,
                                color: PdfColors.blueGrey700,
                              ),
                            ),
                          ],
                        ),
                      );
                    }),
                  ],
                ),
              ),
              pw.SizedBox(height: 20),

              // Disclaimer
              pw.Container(
                padding: const pw.EdgeInsets.all(10),
                decoration: pw.BoxDecoration(
                  color: PdfColor.fromHex('F3F4F6'),
                  borderRadius: pw.BorderRadius.circular(6),
                ),
                child: pw.Text(
                  'Disclaimer: This report is generated by an AI model for preliminary screening purposes only. '
                  'It does not replace professional medical diagnosis. Please consult a qualified dental professional '
                  'for accurate diagnosis and treatment.',
                  style: const pw.TextStyle(
                    fontSize: 9,
                    color: PdfColors.grey700,
                  ),
                ),
              ),
            ],
      ),
    );

    return pdf.save();
  }

  static const _shareChannel = MethodChannel('com.dentalcare.share');

  Future<void> _generateAndDownloadReport() async {
    try {
      _showSnackBar('Generating PDF report...');
      final bytes = await _buildPdfBytes();

      // Save to app documents directory (persistent)
      final conditions =
          _analysisResults['detectedConditions'] as List<dynamic>? ?? [];
      final firstName =
          conditions.isNotEmpty
              ? ((conditions[0] as Map<String, dynamic>)['name'] ??
                  (conditions[0] as Map<String, dynamic>)['modelClassName'] ??
                  'Scan')
              : 'Scan';
      final title =
          '$firstName Report - ${DateTime.now().day}/${DateTime.now().month}/${DateTime.now().year}';

      await ReportStorageService.saveReport(
        title: title,
        pdfBytes: bytes,
        analysisResults: _analysisResults,
      );

      // Also share via Android share sheet
      final tempDir = await getTemporaryDirectory();
      final fileName =
          'DentalCare_Report_${DateTime.now().millisecondsSinceEpoch}.pdf';
      final file = File('${tempDir.path}/$fileName');
      await file.writeAsBytes(bytes);

      try {
        await _shareChannel.invokeMethod('sharePdf', {'path': file.path});
      } on MissingPluginException {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Report saved to My Reports'),
              backgroundColor: Colors.green,
              duration: Duration(seconds: 3),
            ),
          );
        }
      }
    } catch (e) {
      _showSnackBar('Failed to generate report: $e');
    }
  }

  Future<void> _sendReportToDoctor() async {
    final conditions =
        _analysisResults['detectedConditions'] as List<dynamic>? ?? [];
    if (conditions.isEmpty) {
      _showSnackBar('No scan results to send.');
      return;
    }

    // Show confirmation dialog with note option
    final noteController = TextEditingController();
    final confirmed = await showDialog<bool>(
      context: context,
      builder:
          (ctx) => AlertDialog(
            title: const Row(
              children: [
                Icon(Icons.send, color: Color(0xFF2563EB)),
                SizedBox(width: 8),
                Text('Send Report to Doctor'),
              ],
            ),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'This will attach your AI scan report to your next appointment and notify your doctor.',
                  style: TextStyle(fontSize: 13),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: noteController,
                  maxLines: 3,
                  decoration: const InputDecoration(
                    labelText: 'Add a note (optional)',
                    border: OutlineInputBorder(),
                    hintText: 'e.g. I have been experiencing pain...',
                  ),
                ),
              ],
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(ctx, false),
                child: const Text('Cancel'),
              ),
              ElevatedButton(
                onPressed: () => Navigator.pop(ctx, true),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF2563EB),
                  foregroundColor: Colors.white,
                ),
                child: const Text('Send'),
              ),
            ],
          ),
    );

    if (confirmed != true) return;

    try {
      _showSnackBar('Generating and sending report...');
      final pdfBytes = await _buildPdfBytes();

      // Save PDF to temp file
      final tempDir = await getTemporaryDirectory();
      final pdfFile = File(
        '${tempDir.path}/dental_report_${DateTime.now().millisecondsSinceEpoch}.pdf',
      );
      await pdfFile.writeAsBytes(pdfBytes);

      // Send to backend
      await _dentalDataSource.sendScanReportToDoctor(
        doctorId:
            '', // TODO: Replace with actual doctor ID from booking or user selection
        pdfPath: pdfFile.path,
        scanResults: _analysisResults,
        note: noteController.text.trim(),
      );

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Report sent to your doctor successfully!'),
            backgroundColor: Colors.green,
            duration: Duration(seconds: 3),
          ),
        );
      }
    } catch (e) {
      _showSnackBar(
        'Failed to send report: ${e.toString().replaceAll('Exception: ', '')}',
      );
    }
  }

  Widget _buildScanInstructions() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Scan Instructions', style: TextStyles.heading4),
            const SizedBox(height: 10),
            const Text('• Ensure good lighting'),
            const Text('• Open mouth wide'),
            const Text('• Focus camera on teeth'),
            const Text('• Avoid blurry images'),
            const Text('• Capture front and side views'),
          ],
        ),
      ),
    );
  }

  Widget _buildImageSection() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Text('Teeth Image', style: TextStyles.heading4),
            const SizedBox(height: 15),
            Container(
              width: double.infinity,
              height: 200,
              decoration: BoxDecoration(
                color: AppColors.grey100,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.grey300),
              ),
              child:
                  _selectedImage == null
                      ? const Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.camera_alt,
                            size: 50,
                            color: AppColors.grey400,
                          ),
                          SizedBox(height: 10),
                          Text('No image selected'),
                        ],
                      )
                      : ClipRRect(
                        borderRadius: BorderRadius.circular(12),
                        child: Image.file(_selectedImage!, fit: BoxFit.cover),
                      ),
            ),
            if (_selectedImage != null) ...[
              const SizedBox(height: 15),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _startProcessing,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: AppColors.white,
                    padding: const EdgeInsets.symmetric(vertical: 15),
                  ),
                  child: const Text('Process Image'),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildActionButtons() {
    return Row(
      children: [
        Expanded(
          child: ElevatedButton.icon(
            onPressed: _pickImageFromCamera,
            icon: const Icon(Icons.camera_alt),
            label: const Text('Take Photo'),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: AppColors.white,
              padding: const EdgeInsets.symmetric(vertical: 15),
            ),
          ),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: OutlinedButton.icon(
            onPressed: _pickImageFromGallery,
            icon: const Icon(Icons.photo_library),
            label: const Text('From Gallery'),
            style: OutlinedButton.styleFrom(
              padding: const EdgeInsets.symmetric(vertical: 15),
            ),
          ),
        ),
      ],
    );
  }
}
