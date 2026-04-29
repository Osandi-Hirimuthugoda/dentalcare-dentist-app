import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_application_1/core/constants/app_constants.dart';
import 'package:flutter_application_1/core/services/socket_service.dart';
import 'package:flutter_application_1/core/themes/colors.dart';
import 'package:flutter_application_1/data/data_sources/local/shared_prefs.dart';
import 'package:flutter_application_1/data/data_sources/remote/dental_remote_data_source.dart';
import 'package:flutter_application_1/injection_container.dart';
import 'package:intl/intl.dart';

class ScanQAScreen extends StatefulWidget {
  const ScanQAScreen({super.key});

  @override
  State<ScanQAScreen> createState() => _ScanQAScreenState();
}

class _ScanQAScreenState extends State<ScanQAScreen> with SingleTickerProviderStateMixin {
  late final DentalRemoteDataSource _dataSource;
  late final SocketService _socketService;

  List<Map<String, dynamic>> _sessions = [];
  bool _loading = true;
  String? _error;

  Map<String, dynamic>? _selectedSession;
  final Map<String, TextEditingController> _answerControllers = {};
  final Map<String, bool> _submitting = {};

  Timer? _pollTimer;
  late AnimationController _animationController;

  @override
  void initState() {
    super.initState();
    _dataSource = getIt<DentalRemoteDataSource>();
    _socketService = getIt<SocketService>();
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
    );
    _loadSessions();

    _socketService.addScanQuestionListener(_onNewQuestion);

    _pollTimer = Timer.periodic(const Duration(seconds: 15), (_) {
      if (_selectedSession != null) _refreshSelected();
    });
  }

  @override
  void dispose() {
    _socketService.removeScanQuestionListener(_onNewQuestion);
    _pollTimer?.cancel();
    _animationController.dispose();
    for (final c in _answerControllers.values) c.dispose();
    super.dispose();
  }

  void _onNewQuestion(Map<String, dynamic> event) {
    final scanId = event['scanId']?.toString();
    if (!mounted) return;
    if (_selectedSession?['scanId'] == scanId) {
      _refreshSelected();
    } else {
      _loadSessions();
    }
  }

  Future<void> _loadSessions() async {
    setState(() { _loading = true; _error = null; });
    try {
      final response = await _dataSource.getPatientScanSessions();
      if (mounted) {
        setState(() {
          _sessions = List<Map<String, dynamic>>.from(response);
          _loading = false;
        });
        _animationController.forward(from: 0);
      }
    } catch (e) {
      if (mounted) setState(() { _error = e.toString(); _loading = false; });
    }
  }

  Future<void> _refreshSelected() async {
    if (_selectedSession == null) return;
    final scanId = _selectedSession!['scanId']?.toString() ?? '';
    try {
      final result = await _dataSource.getScanQAForPatient(scanId);
      final qa = result['scanQA'] as Map<String, dynamic>?;
      if (qa != null && mounted) {
        setState(() {
          _selectedSession = qa;
          final questions = qa['questions'] as List<dynamic>? ?? [];
          for (final q in questions) {
            final qm = q as Map<String, dynamic>;
            final id = qm['_id']?.toString() ?? '';
            final answer = qm['answer']?.toString() ?? '';
            if (id.isNotEmpty && answer.isEmpty && !_answerControllers.containsKey(id)) {
              _answerControllers[id] = TextEditingController();
            }
          }
        });
      }
    } catch (_) {}
  }

  Future<void> _openSession(Map<String, dynamic> session) async {
    final scanId = session['scanId']?.toString() ?? '';
    setState(() => _selectedSession = null);
    try {
      final result = await _dataSource.getScanQAForPatient(scanId);
      final qa = result['scanQA'] as Map<String, dynamic>?;
      if (qa != null && mounted) {
        final questions = qa['questions'] as List<dynamic>? ?? [];
        for (final q in questions) {
          final qm = q as Map<String, dynamic>;
          final id = qm['_id']?.toString() ?? '';
          final answer = qm['answer']?.toString() ?? '';
          if (id.isNotEmpty && answer.isEmpty) {
            _answerControllers[id] = TextEditingController();
          }
        }
        setState(() => _selectedSession = qa);
      }
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: $e'), backgroundColor: Colors.red),
      );
    }
  }

  Future<void> _submitAnswer(String scanId, String questionId) async {
    final controller = _answerControllers[questionId];
    if (controller == null || controller.text.trim().isEmpty) return;

    setState(() => _submitting[questionId] = true);
    try {
      await _dataSource.addAnswerToQuestion(scanId, questionId, controller.text.trim());
      controller.clear();
      await _refreshSelected();
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Answer sent to doctor!'), backgroundColor: Colors.green),
      );
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed: $e'), backgroundColor: Colors.red),
      );
    } finally {
      if (mounted) setState(() => _submitting.remove(questionId));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: Text(
          _selectedSession != null ? 'Scan Consultation' : 'Doctor Q&A',
          style: const TextStyle(fontWeight: FontWeight.bold, letterSpacing: 0.5),
        ),
        centerTitle: true,
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        elevation: 0,
        leading: _selectedSession != null
            ? IconButton(
                icon: const Icon(Icons.arrow_back_ios_new, size: 20),
                onPressed: () => setState(() => _selectedSession = null),
              )
            : null,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded),
            onPressed: _selectedSession != null ? _refreshSelected : _loadSessions,
          ),
        ],
      ),
      body: _selectedSession != null
          ? _buildDetailView()
          : _buildListView(),
    );
  }

  Widget _buildListView() {
    if (_loading) return const Center(child: CircularProgressIndicator());
    if (_error != null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.cloud_off_rounded, size: 80, color: Colors.redAccent),
              const SizedBox(height: 16),
              Text('Connection Issue', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.grey[800])),
              const SizedBox(height: 8),
              Text(_error!, textAlign: TextAlign.center, style: TextStyle(color: Colors.grey[600])),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: _loadSessions,
                style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary, padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 12)),
                child: const Text('Try Again', style: TextStyle(color: Colors.white)),
              ),
            ],
          ),
        ),
      );
    }
    if (_sessions.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Image.asset('assets/images/logo.png', height: 100, color: Colors.grey.withOpacity(0.3)),
            const SizedBox(height: 24),
            Text('No active consultations', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.grey[700])),
            const SizedBox(height: 8),
            const Text('AI scan results requiring doctor input will appear here.', style: TextStyle(color: Colors.grey)),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _loadSessions,
      child: ListView.builder(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
        itemCount: _sessions.length,
        itemBuilder: (_, i) => FadeTransition(
          opacity: _animationController,
          child: _buildSessionCard(_sessions[i]),
        ),
      ),
    );
  }

  Widget _buildSessionCard(Map<String, dynamic> session) {
    final questions = session['questions'] as List<dynamic>? ?? [];
    final pending = questions.where((q) => (q['answer']?.toString() ?? '').isEmpty).length;
    final date = DateTime.tryParse(session['createdAt']?.toString() ?? '')?.toLocal();
    final formattedDate = date != null ? DateFormat('MMM dd, yyyy • hh:mm a').format(date) : 'Recent';

    return GestureDetector(
      onTap: () => _openSession(session),
      child: Container(
        margin: const EdgeInsets.only(bottom: 16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          boxShadow: [
            BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 10, offset: const Offset(0, 4)),
          ],
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(20),
          child: IntrinsicHeight(
            child: Row(
              children: [
                Container(
                  width: 6,
                  color: pending > 0 ? Colors.orangeAccent : AppColors.primary,
                ),
                Expanded(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: (pending > 0 ? Colors.orangeAccent : AppColors.primary).withOpacity(0.1),
                            shape: BoxShape.circle,
                          ),
                          child: Icon(
                            pending > 0 ? Icons.notification_important_rounded : Icons.check_circle_rounded,
                            color: pending > 0 ? Colors.orangeAccent : AppColors.primary,
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('Teeth Analysis #${session['scanId']?.toString().substring(0, 6) ?? ''}',
                                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                              const SizedBox(height: 4),
                              Text(formattedDate, style: TextStyle(color: Colors.grey[600], fontSize: 12)),
                              const SizedBox(height: 8),
                              Row(
                                children: [
                                  _infoChip('${questions.length} Questions', Colors.blueGrey),
                                  const SizedBox(width: 8),
                                  if (pending > 0)
                                    _infoChip('$pending Action Required', Colors.orange)
                                  else
                                    _infoChip('Up to date', Colors.green),
                                ],
                              ),
                            ],
                          ),
                        ),
                        const Icon(Icons.arrow_forward_ios_rounded, size: 16, color: Colors.grey),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _infoChip(String label, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(8)),
      child: Text(label, style: TextStyle(color: color, fontSize: 10, fontWeight: FontWeight.bold)),
    );
  }

  Widget _buildDetailView() {
    final session = _selectedSession!;
    final questions = session['questions'] as List<dynamic>? ?? [];
    final scanId = session['scanId']?.toString() ?? '';
    final doctor = session['doctor'] as Map<String, dynamic>?;
    final doctorName = doctor?['fullName']?.toString() ?? 'Consultant';

    return Column(
      children: [
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: AppColors.primary,
            borderRadius: const BorderRadius.vertical(bottom: Radius.circular(32)),
          ),
          child: Row(
            children: [
              CircleAvatar(
                radius: 28,
                backgroundColor: Colors.white.withOpacity(0.2),
                child: const Icon(Icons.person, color: Colors.white, size: 32),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Dr. $doctorName', style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
                    const Text('Case Review Specialist', style: TextStyle(color: Colors.white70, fontSize: 13)),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(color: Colors.white24, borderRadius: BorderRadius.circular(20)),
                child: const Text('Official Consult', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w600)),
              ),
            ],
          ),
        ),
        Expanded(
          child: questions.isEmpty
              ? _buildEmptyQuestions()
              : ListView.builder(
                  padding: const EdgeInsets.all(20),
                  itemCount: questions.length,
                  itemBuilder: (_, i) => _buildQuestionCard(questions[i] as Map<String, dynamic>, scanId),
                ),
        ),
      ],
    );
  }

  Widget _buildEmptyQuestions() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(color: Colors.blue.withOpacity(0.1), shape: BoxShape.circle),
            child: const Icon(Icons.history_edu_rounded, size: 64, color: Colors.blue),
          ),
          const SizedBox(height: 24),
          const Text('Analyzing Scan Data...', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 40),
            child: Text('The doctor is currently reviewing your results. New questions will appear here automatically.',
                textAlign: TextAlign.center, style: TextStyle(color: Colors.grey)),
          ),
        ],
      ),
    );
  }

  Widget _buildQuestionCard(Map<String, dynamic> q, String scanId) {
    final id = q['_id']?.toString() ?? '';
    final question = q['question']?.toString() ?? '';
    final answer = q['answer']?.toString() ?? '';
    final hasAnswer = answer.isNotEmpty;
    final isSubmitting = _submitting[id] == true;

    return Container(
      margin: const EdgeInsets.only(bottom: 20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 10, offset: const Offset(0, 4))],
      ),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: hasAnswer ? Colors.green.withOpacity(0.05) : Colors.orange.withOpacity(0.05),
              borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Icon(Icons.help_center_rounded, color: hasAnswer ? Colors.green : Colors.orange, size: 24),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Question from Consultant', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: hasAnswer ? Colors.green : Colors.orange, letterSpacing: 1)),
                      const SizedBox(height: 4),
                      Text(question, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600, height: 1.4)),
                    ],
                  ),
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(20),
            child: hasAnswer
                ? Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(color: Colors.grey[50], borderRadius: BorderRadius.circular(16), border: Border.all(color: Colors.grey[200]!)),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Icon(Icons.check_circle_rounded, color: Colors.green, size: 20),
                        const SizedBox(width: 12),
                        Expanded(child: Text(answer, style: TextStyle(color: Colors.grey[800], height: 1.4))),
                      ],
                    ),
                  )
                : Column(
                    children: [
                      TextField(
                        controller: _answerControllers[id],
                        maxLines: 4,
                        decoration: InputDecoration(
                          hintText: 'Enter your response...',
                          filled: true,
                          fillColor: Colors.grey[50],
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide(color: Colors.grey[300]!)),
                          enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide(color: Colors.grey[200]!)),
                          focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide(color: AppColors.primary)),
                        ),
                      ),
                      const SizedBox(height: 16),
                      SizedBox(
                        width: double.infinity,
                        height: 50,
                        child: ElevatedButton(
                          onPressed: isSubmitting ? null : () => _submitAnswer(scanId, id),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.primary,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                            elevation: 0,
                          ),
                          child: isSubmitting
                              ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                              : const Text('Submit Response', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                        ),
                      ),
                    ],
                  ),
          ),
        ],
      ),
    );
  }
}

