 import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:http/http.dart' as http;
import 'dart:io';
import 'dart:convert';

void main() {
  runApp(const ImagePredictionApp());
}

class ImagePredictionApp extends StatelessWidget {
  const ImagePredictionApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Oral Disease Classifier',
      theme: ThemeData(
        primarySwatch: Colors.blue,
        useMaterial3: true,
      ),
      home: const PredictionScreen(),
    );
  }
}

class PredictionScreen extends StatefulWidget {
  const PredictionScreen({super.key});

  @override
  State<PredictionScreen> createState() => _PredictionScreenState();
}

class _PredictionScreenState extends State<PredictionScreen> {
  File? _selectedImage;
  String? _prediction;  // Model class name (calculus, cancers, etc.)
  String? _diseaseName;  // Disease name (Dental Calculus, Oral Cancer, etc.)
  double? _confidence;
  List<dynamic>? _allClassDetails;  // All class details with disease names and probabilities
  bool _isProcessing = false;
  String? _errorMessage;
  
  // Q&A related state
  String? _scanId;
  String? _imageUrl;
  Map<String, dynamic>? _analysisResults;
  bool _isWaitingForQA = false;
  bool _isQACompleted = false;
  List<dynamic> _questions = [];
  Map<String, TextEditingController> _answerControllers = {};
  
  // Backend URL - Same as web app backend (port 4000)
  // Android Emulator: 10.0.2.2:4000 | Real device: YOUR_PC_IP:4000
  static const String backendUrl = 'http://10.0.2.2:4000/api';

  final ImagePicker _picker = ImagePicker();

  Future<void> _pickImage(ImageSource source) async {
    try {
      final XFile? image = await _picker.pickImage(
        source: source,
        maxWidth: 800,
        maxHeight: 600,
        imageQuality: 85,
      );

      if (image != null) {
        setState(() {
          _selectedImage = File(image.path);
          _prediction = null;
          _diseaseName = null;
          _confidence = null;
          _errorMessage = null;
          _isWaitingForQA = false;
          _isQACompleted = false;
          _questions = [];
          _answerControllers.clear();
          _scanId = null;
          _imageUrl = null;
          _analysisResults = null;
        });
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'Error picking image: $e';
      });
    }
  }

  Future<void> _processImage() async {
    if (_selectedImage == null) {
      setState(() {
        _errorMessage = 'Please select an image first';
      });
      return;
    }

    setState(() {
      _isProcessing = true;
      _prediction = null;
      _confidence = null;
      _errorMessage = null;
      _isWaitingForQA = false;
      _isQACompleted = false;
      _questions = [];
      _answerControllers.clear();
    });

    try {
      // Create multipart request to upload and process image
      var request = http.MultipartRequest(
        'POST',
        Uri.parse('$backendUrl/ai-scan/teeth-scan'),
      );

      // Add image file
      var fileStream = http.ByteStream(_selectedImage!.openRead());
      var fileLength = await _selectedImage!.length();
      var multipartFile = http.MultipartFile(
        'image',
        fileStream,
        fileLength,
        filename: _selectedImage!.path.split('/').last,
      );
      request.files.add(multipartFile);

      // Send request
      var streamedResponse = await request.send();
      var response = await http.Response.fromStream(streamedResponse);

      if (response.statusCode == 200) {
        var data = jsonDecode(response.body);
        
        // Store analysis results (but don't show yet - wait for Q&A)
        _analysisResults = data['analysis'] as Map<String, dynamic>?;
        _imageUrl = data['imageUrl'] as String?;
        
        // Don't set prediction yet - wait for Q&A completion
        // _prediction = data['detectedClass'] as String?;
        // _diseaseName = data['diseaseName'] as String?;
        
        if (_analysisResults != null) {
          final detectedConditions = _analysisResults!['detectedConditions'] as List?;
          if (detectedConditions != null && detectedConditions.isNotEmpty) {
            // Store confidence but don't show results yet
            _confidence = double.tryParse(
              detectedConditions[0]['confidence']?.toString().replaceAll('%', '') ?? '0'
            );
          }
        }
        
        // Create scan Q&A session
        final qaCreated = await _createScanQASession();
        
        if (qaCreated) {
          setState(() {
            _isProcessing = false;
            _isWaitingForQA = true;
            // Clear prediction to ensure results don't show before Q&A
            _prediction = null;
            _diseaseName = null;
          });
          
          // Start polling for questions
          _startPollingForQuestions();
        } else {
          // If Q&A session creation failed, show error
          setState(() {
            _errorMessage = 'Failed to create Q&A session. Please try again.';
            _isProcessing = false;
          });
        }
      } else {
        var errorData = jsonDecode(response.body);
        setState(() {
          _errorMessage = errorData['message'] ?? 'Failed to process image';
          _isProcessing = false;
        });
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'Network error: $e\n\nMake sure:\n1. Backend is running\n2. Correct IP address in backendUrl\n3. Device and computer are on same network';
        _isProcessing = false;
      });
    }
  }

  Future<bool> _createScanQASession() async {
    if (_imageUrl == null || _analysisResults == null) {
      print('❌ Cannot create Q&A session: missing imageUrl or analysisResults');
      return false;
    }
    
    try {
      print('📝 Creating scan Q&A session...');
      var request = http.Request(
        'POST',
        Uri.parse('$backendUrl/scan-qa'),
      );
      request.headers['Content-Type'] = 'application/json';
      request.body = jsonEncode({
        'imageUrl': _imageUrl,
        'analysisResults': _analysisResults,
      });

      var streamedResponse = await request.send();
      var response = await http.Response.fromStream(streamedResponse);

      if (response.statusCode == 200 || response.statusCode == 201) {
        var data = jsonDecode(response.body);
        _scanId = data['scanId'] as String?;
        print('✅ Q&A session created: $_scanId');
        return true;
      } else {
        print('❌ Failed to create Q&A session: ${response.statusCode}');
        print('Response: ${response.body}');
        return false;
      }
    } catch (e) {
      print('❌ Error creating scan QA session: $e');
      return false;
    }
  }

  void _startPollingForQuestions() {
    if (_scanId == null) {
      print('❌ Cannot start polling: scanId is null');
      return;
    }
    
    print('🔄 Starting to poll for questions...');
    // Poll every 3 seconds for questions
    Future.delayed(Duration(seconds: 3), () {
      if (mounted && _isWaitingForQA && !_isQACompleted) {
        _checkForQuestions();
      }
    });
  }

  Future<void> _checkForQuestions() async {
    if (_scanId == null) {
      print('❌ Cannot check questions: scanId is null');
      return;
    }
    
    try {
      print('🔍 Checking for questions... (scanId: $_scanId)');
      var request = http.Request(
        'GET',
        Uri.parse('$backendUrl/scan-qa/$_scanId/patient'),
      );
      request.headers['Content-Type'] = 'application/json';

      var streamedResponse = await request.send();
      var response = await http.Response.fromStream(streamedResponse);

      if (response.statusCode == 200) {
        var data = jsonDecode(response.body);
        var scanQA = data['scanQA'] as Map<String, dynamic>?;
        
        if (scanQA != null) {
          var questions = scanQA['questions'] as List? ?? [];
          var status = scanQA['status'] as String?;
          
          print('📊 Q&A Status: $status, Questions: ${questions.length}');
          
          setState(() {
            _questions = questions;
            _isQACompleted = status == 'qa_completed';
            
            // Initialize answer controllers for unanswered questions
            for (var q in questions) {
              var questionId = q['_id']?.toString() ?? '';
              if (questionId.isNotEmpty && 
                  (q['answer'] == null || (q['answer'] as String).isEmpty) &&
                  !_answerControllers.containsKey(questionId)) {
                _answerControllers[questionId] = TextEditingController();
              }
            }
          });
          
          // Continue polling if still waiting
          if (_isWaitingForQA && !_isQACompleted) {
            print('⏳ Still waiting for Q&A completion...');
            _startPollingForQuestions();
          } else if (_isQACompleted) {
            print('✅ Q&A completed! Showing results...');
            // Show results after Q&A is completed
            _showResults();
          }
        } else {
          print('⚠️ No scanQA data in response');
        }
      } else {
        print('❌ Failed to get Q&A: ${response.statusCode}');
        print('Response: ${response.body}');
      }
    } catch (e) {
      print('❌ Error checking for questions: $e');
      // Continue polling on error
      if (mounted && _isWaitingForQA && !_isQACompleted) {
        _startPollingForQuestions();
      }
    }
  }

  Future<void> _submitAnswer(String questionId, String answer) async {
    if (_scanId == null || answer.trim().isEmpty) return;
    
    try {
      var request = http.Request(
        'POST',
        Uri.parse('$backendUrl/scan-qa/$_scanId/question/$questionId/answer'),
      );
      request.headers['Content-Type'] = 'application/json';
      request.body = jsonEncode({
        'answer': answer.trim(),
      });

      var streamedResponse = await request.send();
      var response = await http.Response.fromStream(streamedResponse);

      if (response.statusCode == 200) {
        // Refresh questions
        await _checkForQuestions();
      }
    } catch (e) {
      print('Error submitting answer: $e');
    }
  }

  Future<void> _showResults() async {
    if (_scanId == null) return;
    
    try {
      var request = http.Request(
        'POST',
        Uri.parse('$backendUrl/scan-qa/$_scanId/mark-shown'),
      );
      request.headers['Content-Type'] = 'application/json';

      await request.send();
    } catch (e) {
      print('Error marking results as shown: $e');
    }
    
    setState(() {
      _isWaitingForQA = false;
      // Extract prediction details from analysis results
      if (_analysisResults != null) {
        final detectedConditions = _analysisResults!['detectedConditions'] as List?;
        if (detectedConditions != null && detectedConditions.isNotEmpty) {
          _prediction = detectedConditions[0]['modelClassName'] as String?;
          _diseaseName = detectedConditions[0]['name'] as String?;
        }
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Oral Disease Classifier'),
        backgroundColor: Colors.blue,
        foregroundColor: Colors.white,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Instructions
            Card(
              color: Colors.blue.shade50,
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Instructions:',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    const Text('1. Upload an image of oral cavity'),
                    const Text('2. Click "Process Image" button'),
                    const Text('3. Wait for dentist review and answer questions'),
                    const Text('4. View the predicted disease class'),
                    const SizedBox(height: 8),
                    Text(
                      'Backend: $backendUrl',
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.grey.shade700,
                        fontStyle: FontStyle.italic,
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 20),

            // Image selection buttons
            Row(
              children: [
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: () => _pickImage(ImageSource.camera),
                    icon: const Icon(Icons.camera_alt),
                    label: const Text('Camera'),
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 12),
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: () => _pickImage(ImageSource.gallery),
                    icon: const Icon(Icons.photo_library),
                    label: const Text('Gallery'),
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 12),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),

            // Selected image preview
            if (_selectedImage != null) ...[
              Container(
                height: 300,
                decoration: BoxDecoration(
                  border: Border.all(color: Colors.grey.shade300),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(8),
                  child: Image.file(
                    _selectedImage!,
                    fit: BoxFit.cover,
                    width: double.infinity,
                  ),
                ),
              ),
              const SizedBox(height: 20),

              // Process button
              ElevatedButton(
                onPressed: _isProcessing ? null : _processImage,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.green,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
                child: _isProcessing
                    ? const Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                            ),
                          ),
                          SizedBox(width: 12),
                          Text('Processing...'),
                        ],
                      )
                    : const Text(
                        'Process Image',
                        style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                      ),
              ),
              const SizedBox(height: 20),
            ],

            // Error message
            if (_errorMessage != null) ...[
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.red.shade50,
                  border: Border.all(color: Colors.red.shade300),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(Icons.error, color: Colors.red.shade700),
                        const SizedBox(width: 8),
                        const Text(
                          'Error',
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 16,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text(
                      _errorMessage!,
                      style: TextStyle(color: Colors.red.shade700),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),
            ],

            // Q&A Waiting Screen
            if (_isWaitingForQA && !_isQACompleted) ...[
              Card(
                color: Colors.orange.shade50,
                child: Padding(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    children: [
                      const Icon(
                        Icons.medical_services,
                        color: Colors.orange,
                        size: 48,
                      ),
                      const SizedBox(height: 16),
                      const Text(
                        'Waiting for Dentist Review',
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 12),
                      const Text(
                        'Your scan is being reviewed by a dentist. They may ask you some questions before providing the results.',
                        textAlign: TextAlign.center,
                        style: TextStyle(fontSize: 14),
                      ),
                      const SizedBox(height: 20),
                      const CircularProgressIndicator(),
                      const SizedBox(height: 20),
                      if (_questions.isNotEmpty) ...[
                        const Divider(),
                        const SizedBox(height: 12),
                        const Text(
                          'Dentist Questions:',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 12),
                        ..._questions.map((q) {
                          final questionId = q['_id']?.toString() ?? '';
                          final question = q['question'] as String? ?? '';
                          final answer = q['answer'] as String? ?? '';
                          final hasAnswer = answer.isNotEmpty;
                          
                          return Container(
                            margin: const EdgeInsets.only(bottom: 12),
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: hasAnswer ? Colors.green.shade50 : Colors.orange.shade50,
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(
                                color: hasAnswer ? Colors.green.shade300 : Colors.orange.shade300,
                              ),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    Icon(
                                      Icons.question_answer,
                                      size: 20,
                                      color: Colors.orange.shade700,
                                    ),
                                    const SizedBox(width: 8),
                                    Expanded(
                                      child: Text(
                                        question,
                                        style: const TextStyle(
                                          fontWeight: FontWeight.bold,
                                          fontSize: 14,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                                if (hasAnswer) ...[
                                  const SizedBox(height: 8),
                                  Container(
                                    padding: const EdgeInsets.all(8),
                                    decoration: BoxDecoration(
                                      color: Colors.white,
                                      borderRadius: BorderRadius.circular(4),
                                    ),
                                    child: Text(
                                      answer,
                                      style: TextStyle(color: Colors.green.shade900),
                                    ),
                                  ),
                                ] else ...[
                                  const SizedBox(height: 8),
                                  TextField(
                                    controller: _answerControllers[questionId] ?? TextEditingController(),
                                    decoration: InputDecoration(
                                      hintText: 'Type your answer...',
                                      border: OutlineInputBorder(
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                      contentPadding: const EdgeInsets.all(12),
                                    ),
                                    maxLines: 3,
                                    onChanged: (value) {
                                      if (!_answerControllers.containsKey(questionId)) {
                                        _answerControllers[questionId] = TextEditingController(text: value);
                                      }
                                    },
                                  ),
                                  const SizedBox(height: 8),
                                  SizedBox(
                                    width: double.infinity,
                                    child: ElevatedButton(
                                      onPressed: () {
                                        final answer = _answerControllers[questionId]?.text ?? '';
                                        if (answer.trim().isNotEmpty) {
                                          _submitAnswer(questionId, answer);
                                        }
                                      },
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor: Colors.orange,
                                        foregroundColor: Colors.white,
                                      ),
                                      child: const Text('Submit Answer'),
                                    ),
                                  ),
                                ],
                              ],
                            ),
                          );
                        }).toList(),
                      ],
                    ],
                  ),
                ),
              ),
            ],

            // Prediction result (shown after Q&A is completed)
            if (_prediction != null && _isQACompleted) ...[
              Card(
                color: Colors.green.shade50,
                child: Padding(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    children: [
                      const Icon(
                        Icons.check_circle,
                        color: Colors.green,
                        size: 48,
                      ),
                      const SizedBox(height: 16),
                      const Text(
                        'Detected Disease:',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 12),
                      // Show Disease Name (from model class)
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 24,
                          vertical: 16,
                        ),
                        decoration: BoxDecoration(
                          color: Colors.green.shade100,
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: Colors.green.shade300, width: 2),
                        ),
                        child: Column(
                          children: [
                            Text(
                              _diseaseName ?? _prediction!.toUpperCase(),
                              style: TextStyle(
                                fontSize: 22,
                                fontWeight: FontWeight.bold,
                                color: Colors.green.shade900,
                              ),
                              textAlign: TextAlign.center,
                            ),
                            if (_prediction != null && _diseaseName != _prediction) ...[
                              const SizedBox(height: 8),
                              Text(
                                'Class: ${_prediction!.toUpperCase()}',
                                style: TextStyle(
                                  fontSize: 14,
                                  color: Colors.grey.shade600,
                                  fontStyle: FontStyle.italic,
                                ),
                              ),
                            ],
                          ],
                        ),
                      ),
                      if (_confidence != null) ...[
                        const SizedBox(height: 16),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.analytics, color: Colors.grey.shade700, size: 20),
                            const SizedBox(width: 8),
                            Text(
                              'Confidence: ${_confidence!.toStringAsFixed(2)}%',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w500,
                                color: Colors.grey.shade700,
                              ),
                            ),
                          ],
                        ),
                      ],
                      
                      // Show all class probabilities
                      if (_allClassDetails != null && _allClassDetails!.isNotEmpty) ...[
                        const SizedBox(height: 24),
                        const Divider(),
                        const SizedBox(height: 12),
                        const Text(
                          'All Class Probabilities:',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 12),
                        ..._allClassDetails!.map((classDetail) {
                          final isDetected = classDetail['is_detected'] == true;
                          final className = classDetail['class_name']?.toString() ?? '';
                          final diseaseName = classDetail['disease_name']?.toString() ?? '';
                          final probability = (classDetail['probability'] as num?)?.toDouble() ?? 0.0;
                          
                          return Container(
                            margin: const EdgeInsets.only(bottom: 8),
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: isDetected 
                                  ? Colors.green.shade50 
                                  : Colors.grey.shade50,
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(
                                color: isDetected 
                                    ? Colors.green.shade300 
                                    : Colors.grey.shade300,
                                width: isDetected ? 2 : 1,
                              ),
                            ),
                            child: Row(
                              children: [
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        diseaseName,
                                        style: TextStyle(
                                          fontSize: 14,
                                          fontWeight: isDetected 
                                              ? FontWeight.bold 
                                              : FontWeight.normal,
                                          color: isDetected 
                                              ? Colors.green.shade900 
                                              : Colors.grey.shade800,
                                        ),
                                      ),
                                      Text(
                                        'Class: ${className.toUpperCase()}',
                                        style: TextStyle(
                                          fontSize: 12,
                                          color: Colors.grey.shade600,
                                          fontStyle: FontStyle.italic,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 12,
                                    vertical: 6,
                                  ),
                                  decoration: BoxDecoration(
                                    color: isDetected 
                                        ? Colors.green.shade200 
                                        : Colors.grey.shade200,
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: Text(
                                    '${probability.toStringAsFixed(1)}%',
                                    style: TextStyle(
                                      fontSize: 14,
                                      fontWeight: FontWeight.bold,
                                      color: isDetected 
                                          ? Colors.green.shade900 
                                          : Colors.grey.shade700,
                                    ),
                                  ),
                                ),
                                if (isDetected) ...[
                                  const SizedBox(width: 8),
                                  Icon(
                                    Icons.check_circle,
                                    color: Colors.green.shade700,
                                    size: 20,
                                  ),
                                ],
                              ],
                            ),
                          );
                        }).toList(),
                      ],
                    ],
                  ),
                ),
              ),
            ],

            // Empty state
            if (_selectedImage == null && _prediction == null && _errorMessage == null)
              Container(
                padding: const EdgeInsets.all(40),
                child: Column(
                  children: [
                    Icon(
                      Icons.image,
                      size: 64,
                      color: Colors.grey.shade400,
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'No image selected',
                      style: TextStyle(
                        fontSize: 18,
                        color: Colors.grey.shade600,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Please select an image to get started',
                      style: TextStyle(
                        color: Colors.grey.shade500,
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
}

