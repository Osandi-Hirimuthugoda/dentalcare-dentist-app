import 'package:flutter/material.dart';
import 'package:flutter_application_1/core/themes/colors.dart';
import 'package:flutter_application_1/core/themes/text_styles.dart';
import 'package:image_picker/image_picker.dart';
import 'dart:io';

class TeethScanScreen extends StatefulWidget {
  const TeethScanScreen({super.key});

  @override
  State<TeethScanScreen> createState() => _TeethScanScreenState();
}

class _TeethScanScreenState extends State<TeethScanScreen> {
  File? _selectedImage;
  bool _isProcessing = false;
  bool _showQuestionnaire = false;
  bool _showResults = false;
  int _currentQuestion = 0;
  final ImagePicker _picker = ImagePicker();
  
  Map<String, dynamic> _userResponses = {};
  Map<String, dynamic> _analysisResults = {};

  final List<Map<String, dynamic>> _questions = [
    {
      'id': 'pain_level',
      'question': 'Do you experience tooth pain?',
      'options': ['No pain', 'Mild pain', 'Moderate pain', 'Severe pain']
    },
    {
      'id': 'bleeding_gums',
      'question': 'Do your gums bleed when brushing?',
      'options': ['Never', 'Occasionally', 'Frequently', 'Always']
    },
    {
      'id': 'sensitivity',
      'question': 'Do you have tooth sensitivity?',
      'options': ['No sensitivity', 'To cold only', 'To hot only', 'To both hot and cold']
    },
    {
      'id': 'bad_breath',
      'question': 'Do you experience bad breath?',
      'options': ['Never', 'Occasionally', 'Frequently', 'Always']
    },
    {
      'id': 'swelling',
      'question': 'Any swelling in gums or face?',
      'options': ['No swelling', 'Mild swelling', 'Moderate swelling', 'Severe swelling']
    }
  ];

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

  void _startProcessing() {
    if (_selectedImage == null) {
      _showSnackBar('Please select an image first');
      return;
    }

    setState(() {
      _isProcessing = true;
    });

    // Simulate processing delay
    Future.delayed(const Duration(seconds: 2), () {
      setState(() {
        _isProcessing = false;
        _showQuestionnaire = true;
      });
    });
  }

  void _selectAnswer(String answer) {
    setState(() {
      _userResponses[_questions[_currentQuestion]['id']] = answer;
    });

    // Move to next question or show results
    if (_currentQuestion < _questions.length - 1) {
      setState(() {
        _currentQuestion++;
      });
    } else {
      _generateResults();
    }
  }

  void _generateResults() {
    setState(() {
      _showQuestionnaire = false;
      _isProcessing = true;
    });

    // Simulate AI model processing with user responses
    Future.delayed(const Duration(seconds: 3), () {
      final results = _analyzeWithAI(_userResponses);
      setState(() {
        _analysisResults = results;
        _isProcessing = false;
        _showResults = true;
      });
    });
  }

  Map<String, dynamic> _analyzeWithAI(Map<String, dynamic> responses) {
    // Mock AI analysis based on user responses
    List<Map<String, dynamic>> detectedIssues = [];
    
    // Analyze based on responses
    if (responses['pain_level'] == 'Severe pain') {
      detectedIssues.add({
        'disease': 'Advanced Tooth Decay',
        'confidence': '92%',
        'severity': 'High',
        'description': 'Deep cavity requiring immediate attention',
        'recommendation': 'Urgent dental filling or root canal treatment'
      });
    }
    
    if (responses['bleeding_gums'] == 'Frequently' || responses['bleeding_gums'] == 'Always') {
      detectedIssues.add({
        'disease': 'Gingivitis/Periodontitis',
        'confidence': '88%',
        'severity': 'Moderate-High',
        'description': 'Gum inflammation and potential bone loss',
        'recommendation': 'Professional cleaning and improved oral hygiene'
      });
    }
    
    if (responses['sensitivity'] == 'To both hot and cold') {
      detectedIssues.add({
        'disease': 'Tooth Sensitivity',
        'confidence': '85%',
        'severity': 'Moderate',
        'description': 'Exposed dentin causing sensitivity',
        'recommendation': 'Use sensitivity toothpaste and avoid acidic foods'
      });
    }
    
    if (responses['bad_breath'] == 'Frequently' || responses['bad_breath'] == 'Always') {
      detectedIssues.add({
        'disease': 'Halitosis with Possible Infection',
        'confidence': '78%',
        'severity': 'Moderate',
        'description': 'Chronic bad breath indicating possible infection',
        'recommendation': 'Dental checkup and improved oral care routine'
      });
    }

    // Default result if no specific issues detected
    if (detectedIssues.isEmpty) {
      detectedIssues.add({
        'disease': 'Good Oral Health',
        'confidence': '95%',
        'severity': 'Low',
        'description': 'No major issues detected based on your responses',
        'recommendation': 'Continue regular dental checkups and maintain good oral hygiene'
      });
    }

    return {
      'issues': detectedIssues,
      'overall_health_score': _calculateHealthScore(detectedIssues),
      'recommended_doctors': _getRecommendedDoctors(detectedIssues),
      'user_responses': responses,
    };
  }

  int _calculateHealthScore(List<Map<String, dynamic>> issues) {
    int baseScore = 100;
    for (var issue in issues) {
      if (issue['severity'] == 'High') baseScore -= 30;
      if (issue['severity'] == 'Moderate-High') baseScore -= 25;
      if (issue['severity'] == 'Moderate') baseScore -= 15;
      if (issue['severity'] == 'Low') baseScore -= 5;
    }
    return baseScore.clamp(0, 100);
  }

  List<String> _getRecommendedDoctors(List<Map<String, dynamic>> issues) {
    Set<String> specialists = {};
    
    for (var issue in issues) {
      if (issue['disease'].contains('Tooth Decay')) {
        specialists.add('General Dentist');
        specialists.add('Restorative Dentist');
      }
      if (issue['disease'].contains('Gingivitis') || issue['disease'].contains('Periodontitis')) {
        specialists.add('Periodontist');
      }
      if (issue['disease'].contains('Sensitivity')) {
        specialists.add('General Dentist');
      }
      if (issue['disease'].contains('Infection')) {
        specialists.add('Endodontist');
        specialists.add('General Dentist');
      }
    }
    
    if (specialists.isEmpty) {
      return ['General Dentist'];
    }
    
    return specialists.toList();
  }

  void _showDoctorRecommendation() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Recommended Specialists'),
        content: SizedBox(
          width: double.maxFinite,
          child: ListView(
            shrinkWrap: true,
            children: [
              const Text('Based on your analysis, we recommend consulting:'),
              const SizedBox(height: 15),
              ..._analysisResults['recommended_doctors'].map<Widget>((specialist) => 
                ListTile(
                  leading: const Icon(Icons.medical_services, color: Colors.teal),
                  title: Text(specialist),
                  subtitle: Text('Specialized in $specialist treatments'),
                )
              ).toList(),
              const SizedBox(height: 10),
              const Text('Please book an appointment for professional diagnosis.'),
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
            child: const Text('Book Appointment'),
          ),
        ],
      ),
    );
  }

  void _resetScan() {
    setState(() {
      _selectedImage = null;
      _isProcessing = false;
      _showQuestionnaire = false;
      _showResults = false;
      _currentQuestion = 0;
      _userResponses = {};
      _analysisResults = {};
    });
  }

  void _showSnackBar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        duration: const Duration(seconds: 2),
      ),
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
          if (_showResults || _showQuestionnaire)
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
    
    if (_showQuestionnaire) {
      return _buildQuestionnaire();
    }
    
    if (_showResults) {
      return _buildResultsScreen();
    }
    
    return _buildImageSelectionScreen();
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
          Text(
            _showQuestionnaire ? 'Analyzing Your Responses...' : 'Processing Your Image...',
            style: TextStyles.heading4,
          ),
          const SizedBox(height: 10),
          Text(
            _showQuestionnaire 
                ? 'Our AI model is analyzing your symptoms'
                : 'Preparing diagnostic questions based on your scan',
            style: TextStyles.bodySmall.copyWith(color: AppColors.textSecondary),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildQuestionnaire() {
    final currentQ = _questions[_currentQuestion];
    
    return Padding(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          LinearProgressIndicator(
            value: (_currentQuestion + 1) / _questions.length,
            backgroundColor: AppColors.grey300,
            valueColor: const AlwaysStoppedAnimation<Color>(AppColors.primary),
          ),
          const SizedBox(height: 20),
          Text(
            'Question ${_currentQuestion + 1} of ${_questions.length}',
            style: TextStyles.bodySmall.copyWith(color: AppColors.textSecondary),
          ),
          const SizedBox(height: 10),
          Text(
            currentQ['question'],
            style: TextStyles.heading4,
          ),
          const SizedBox(height: 30),
          ...(currentQ['options'] as List<String>).map((option) => 
            Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: ElevatedButton(
                onPressed: () => _selectAnswer(option),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.white,
                  foregroundColor: AppColors.textPrimary,
                  elevation: 2,
                  padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 20),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: Row(
                  children: [
                    Icon(
                      _userResponses[currentQ['id']] == option 
                          ? Icons.radio_button_checked 
                          : Icons.radio_button_off,
                      color: _userResponses[currentQ['id']] == option 
                          ? AppColors.primary 
                          : AppColors.grey400,
                    ),
                    const SizedBox(width: 15),
                    Expanded(
                      child: Text(
                        option,
                        style: TextStyles.bodyMedium,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
          const SizedBox(height: 20),
          if (_currentQuestion > 0)
            OutlinedButton(
              onPressed: () {
                setState(() {
                  _currentQuestion--;
                });
              },
              child: const Text('Previous Question'),
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
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            Text(
              'Your Dental Health Score',
              style: TextStyles.heading4,
            ),
            const SizedBox(height: 16),
            Stack(
              alignment: Alignment.center,
              children: [
                SizedBox(
                  width: 120,
                  height: 120,
                  child: CircularProgressIndicator(
                    value: _analysisResults['overall_health_score'] / 100,
                    strokeWidth: 8,
                    backgroundColor: AppColors.grey300,
                    valueColor: AlwaysStoppedAnimation<Color>(
                      _analysisResults['overall_health_score'] >= 80 ? Colors.green :
                      _analysisResults['overall_health_score'] >= 60 ? Colors.orange : Colors.red
                    ),
                  ),
                ),
                Column(
                  children: [
                    Text(
                      '${_analysisResults['overall_health_score']}%',
                      style: TextStyles.heading2.copyWith(
                        color: _analysisResults['overall_health_score'] >= 80 ? Colors.green :
                              _analysisResults['overall_health_score'] >= 60 ? Colors.orange : Colors.red
                      ),
                    ),
                    Text(
                      _analysisResults['overall_health_score'] >= 80 ? 'Excellent' :
                      _analysisResults['overall_health_score'] >= 60 ? 'Good' : 'Needs Attention',
                      style: TextStyles.bodySmall,
                    ),
                  ],
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDetectedIssues() {
    final issues = _analysisResults['issues'] as List<Map<String, dynamic>>;
    
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'AI Analysis Results',
              style: TextStyles.heading4,
            ),
            const SizedBox(height: 15),
            ...issues.map((issue) => 
              Container(
                margin: const EdgeInsets.only(bottom: 16),
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: _getSeverityColor(issue['severity']).withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: _getSeverityColor(issue['severity']).withOpacity(0.3)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                          decoration: BoxDecoration(
                            color: _getSeverityColor(issue['severity']),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Text(
                            issue['severity'],
                            style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                          ),
                        ),
                        const Spacer(),
                        Text(
                          'Confidence: ${issue['confidence']}',
                          style: TextStyles.caption.copyWith(fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    Text(
                      issue['disease'],
                      style: TextStyles.bodyMedium.copyWith(fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      issue['description'],
                      style: TextStyles.bodySmall,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      '💡 Recommendation: ${issue['recommendation']}',
                      style: TextStyles.bodySmall.copyWith(fontWeight: FontWeight.w500),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 10),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.blue.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                children: [
                  const Icon(Icons.info, color: Colors.blue, size: 20),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      'This analysis is based on AI assessment. Please consult a dental professional for accurate diagnosis.',
                      style: TextStyles.caption.copyWith(color: Colors.blue),
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
      case 'High': return Colors.red;
      case 'Moderate-High': return Colors.orange;
      case 'Moderate': return Colors.amber;
      case 'Low': return Colors.green;
      default: return Colors.grey;
    }
  }

  Widget _buildActionButtonsResults() {
    return Column(
      children: [
        SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            onPressed: _showDoctorRecommendation,
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: AppColors.white,
              padding: const EdgeInsets.symmetric(vertical: 16),
            ),
            child: const Text('Consult Recommended Doctor'),
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

  Widget _buildScanInstructions() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Scan Instructions',
              style: TextStyles.heading4,
            ),
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
            Text(
              'Teeth Image',
              style: TextStyles.heading4,
            ),
            const SizedBox(height: 15),
            Container(
              width: double.infinity,
              height: 200,
              decoration: BoxDecoration(
                color: AppColors.grey100,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.grey300),
              ),
              child: _selectedImage == null
                  ? const Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.camera_alt, size: 50, color: AppColors.grey400),
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