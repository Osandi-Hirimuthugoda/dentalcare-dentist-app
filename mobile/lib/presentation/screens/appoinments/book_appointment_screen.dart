import 'package:flutter/material.dart';
import 'package:flutter_application_1/core/themes/colors.dart';
import 'package:flutter_application_1/core/themes/text_styles.dart';
import 'package:flutter_application_1/data/data_sources/remote/dental_remote_data_source.dart';
import 'package:flutter_application_1/domain/entities/appoinment_entity.dart';
import 'package:flutter_application_1/domain/use_cases/appointment/book_appointment_use_case.dart';
import 'package:flutter_application_1/injection_container.dart';
import 'package:intl/intl.dart';

class BookAppointmentScreen extends StatefulWidget {
  final Map<String, dynamic>? scanReportData; // optional AI scan results to attach
  final Map<String, dynamic>? preSelectedDentist; // optional pre-selected dentist from Find Dentists

  const BookAppointmentScreen({super.key, this.scanReportData, this.preSelectedDentist});

  @override
  State<BookAppointmentScreen> createState() => _BookAppointmentScreenState();
}

class _BookAppointmentScreenState extends State<BookAppointmentScreen> {
  List<Map<String, dynamic>> _dentists = [];
  bool _isLoadingDentists = true;
  String? _errorMessage;
  
  List<Map<String, dynamic>> _services = [];
  bool _isLoadingServices = true;
  
  Map<String, dynamic>? _selectedDentist;
  DateTime? _selectedDate;
  String? _selectedTime;
  String? _selectedService;
  String? _selectedCategory;
  final TextEditingController _symptomsController = TextEditingController();
  bool _isBooking = false;
  bool _attachScanReport = true; // default attach if scan data available

  late final DentalRemoteDataSource _dentalDataSource;
  late final BookAppointmentUseCase _bookAppointmentUseCase;

  @override
  void initState() {
    super.initState();
    _dentalDataSource = getIt<DentalRemoteDataSource>();
    _bookAppointmentUseCase = getIt<BookAppointmentUseCase>();
    _loadServices();
    _loadDentists();
    // Pre-select dentist if passed from Find Dentists screen
    if (widget.preSelectedDentist != null) {
      _selectedDentist = widget.preSelectedDentist;
      WidgetsBinding.instance.addPostFrameCallback((_) {
        final id = widget.preSelectedDentist!['id'] as String?;
        if (id != null && id.isNotEmpty) {
          _loadDoctorAvailability(id);
        }
      });
    }
  }

  Future<void> _loadServices() async {
    setState(() {
      _isLoadingServices = true;
    });

    try {
      final services = await _dentalDataSource.getServices();
      debugPrint('Services loaded: ${services.length} services');
      
      if (services.isNotEmpty) {
        setState(() {
          _services = services.map<Map<String, dynamic>>((service) {
            final serviceName = service['name']?.toString() ?? service.toString();
            debugPrint('  - Service: $serviceName');
            return {
              'name': serviceName,
              'description': service['description']?.toString() ?? '',
              'category': service['category']?.toString() ?? '',
            };
          }).toList();
          
          debugPrint('Total services in dropdown: ${_services.length}');
          
          // Set first service as default if available
          if (_services.isNotEmpty && _selectedService == null) {
            final firstServiceName = _services.first['name'] as String?;
            if (firstServiceName != null && firstServiceName.isNotEmpty) {
              _selectedService = firstServiceName;
              debugPrint('Default service selected: $_selectedService');
            }
          }
          _isLoadingServices = false;
        });
      } else {
        // If services list is empty, use fallback
        debugPrint(' No services received from server, using fallback');
        throw Exception('No services received from server');
      }
    } catch (e) {
      debugPrint('Error loading services: $e');
      // Fallback to default services if API fails
      setState(() {
        _services = <Map<String, dynamic>>[
          {'name': 'Dental Checkups & Consultations', 'description': 'Comprehensive dental examination and oral health assessment', 'category': 'General'},
          {'name': 'Teeth Cleaning (Scaling & Polishing)', 'description': 'Professional teeth cleaning, scaling, and plaque removal', 'category': 'General'},
          {'name': 'Cavity Filling', 'description': 'Dental filling for cavities and tooth restoration', 'category': 'General'},
          {'name': 'Tooth Extraction', 'description': 'Tooth removal surgery', 'category': 'Surgical'},
          {'name': 'Root Canal Treatment (RCT)', 'description': 'Endodontic treatment for infected tooth roots', 'category': 'Endodontic'},
          {'name': 'Braces & Teeth Alignment (Orthodontics)', 'description': 'Orthodontic treatment for teeth alignment and braces', 'category': 'Orthodontic'},
          {'name': 'Teeth Whitening', 'description': 'Professional teeth whitening treatment', 'category': 'Cosmetic'},
          {'name': 'Dental Crowns & Bridges', 'description': 'Dental crown and bridge installation and restoration', 'category': 'Restorative'},
          {'name': 'Dental Implants & Dentures', 'description': 'Dental implant surgery and denture fitting', 'category': 'Restorative'},
          {'name': 'Emergency Dental Care', 'description': 'Emergency dental treatment for urgent dental issues', 'category': 'Emergency'},
        ];
        if (_services.isNotEmpty && _selectedService == null) {
          final firstServiceName = _services.first['name'] as String?;
          if (firstServiceName != null && firstServiceName.isNotEmpty) {
            _selectedService = firstServiceName;
          }
        }
        _isLoadingServices = false;
      });
    }
  }

  Future<void> _loadDentists() async {
    setState(() {
      _isLoadingDentists = true;
      _errorMessage = null;
    });

    try {
      final dentists = await _dentalDataSource.getDentists();
      setState(() {
        _dentists = dentists.map((dentist) {
          // Backend returns _id, convert to id
          final id = dentist['_id']?.toString() ?? dentist['id']?.toString() ?? '';
          return {
            'id': id,
            'name': dentist['fullName'] ?? dentist['name'] ?? 'Unknown Doctor',
            'specialty': dentist['specialization'] ?? dentist['specialty'] ?? 'General Dentistry',
            'hospital': dentist['hospital'] ?? 'Dental Clinic',
            'rating': 4.5, // Default rating if not available
            'experience': dentist['experience'] ?? 'N/A',
            'services': dentist['services'] ?? [], // Services doctor offers
            'availableSlots': _generateTimeSlots(), // Default slots until availability is loaded
          };
        }).toList();
        
        // If a dentist was pre-selected, make sure it's in the list and selected
        if (widget.preSelectedDentist != null) {
          final preId = widget.preSelectedDentist!['id']?.toString() ?? '';
          final exists = _dentists.any((d) => d['id'] == preId);
          if (!exists && preId.isNotEmpty) {
            _dentists.insert(0, widget.preSelectedDentist!);
          }
          _selectedDentist = _dentists.firstWhere(
            (d) => d['id'] == preId,
            orElse: () => widget.preSelectedDentist!,
          );
        }
        
        _isLoadingDentists = false;
      });
    } catch (e) {
      setState(() {
        _errorMessage = 'Failed to load dentists. Please try again.';
        _isLoadingDentists = false;
      });
    }
  }

  Future<void> _loadDoctorAvailability(String doctorId) async {
    try {
      debugPrint('Loading availability for doctor: $doctorId');
      final availability = await _dentalDataSource.getDoctorAvailability(doctorId);
      
      final availableSlots = availability['availableSlots'] as List<dynamic>? ?? [];
      debugPrint('Available slots: ${availableSlots.length}');
      
      // Group slots by date
      final slotsByDate = <String, List<String>>{};
      for (var slot in availableSlots) {
        final date = slot['date']?.toString() ?? '';
        final time = slot['time']?.toString() ?? slot['display']?.toString() ?? '';
        if (date.isNotEmpty && time.isNotEmpty) {
          if (!slotsByDate.containsKey(date)) {
            slotsByDate[date] = [];
          }
          slotsByDate[date]!.add(time);
        }
      }
      
      // Update selected dentist with availability
      setState(() {
        if (_selectedDentist != null && _selectedDentist!['id'] == doctorId) {
          _selectedDentist!['availableSlots'] = slotsByDate;
          final dates = slotsByDate.keys.toList()..sort();
          _selectedDentist!['availableDates'] = dates;
        }
        
        // Also update in dentists list
        final index = _dentists.indexWhere((d) => d['id'] == doctorId);
        if (index != -1) {
          _dentists[index]['availableSlots'] = slotsByDate;
          final dates = slotsByDate.keys.toList()..sort();
          _dentists[index]['availableDates'] = dates;
        }
      });
    } catch (e) {
      debugPrint('Error loading doctor availability: $e');
      // Continue with default slots if availability load fails
    }
  }

  List<String> _generateTimeSlots() {
    // Generate default time slots from 9 AM to 5 PM
    final slots = <String>[];
    for (int hour = 9; hour < 17; hour++) {
      for (int minute = 0; minute < 60; minute += 30) {
        final time = DateTime(2000, 1, 1, hour, minute);
        slots.add(DateFormat('hh:mm a').format(time));
      }
    }
    return slots;
  }

  Future<List<String>> _getAvailableTimesForDate(DateTime date) async {
    if (_selectedDentist == null) return [];
    
    final dateStr = date.toIso8601String().split('T')[0]; // YYYY-MM-DD
    final availableSlots = _selectedDentist!['availableSlots'] as Map<String, List<String>>?;
    
    if (availableSlots == null || availableSlots.isEmpty) {
      // If doctor hasn't set up availability, show no slots (strict mode)
      return [];
    }
    
    return availableSlots[dateStr] ?? [];
  }

  void _selectDate() async {
    if (_selectedDentist == null) {
      _showSnackBar('Please select a dentist first');
      return;
    }

    final availableDates = _selectedDentist!['availableDates'] as List<String>? ?? [];
    
    if (availableDates.isEmpty) {
      _showSnackBar('This doctor has no available dates for appointments at the moment.');
      return;
    }

    // Predicate to check if a day is available
    bool isDayAvailable(DateTime day) {
      final dateStr = DateFormat('yyyy-MM-dd').format(day);
      return availableDates.contains(dateStr);
    }

    // Determine initial date
    DateTime initialDate = DateTime.now().add(const Duration(days: 1));
    if (!isDayAvailable(initialDate)) {
      // Find first available date that is not in the past
      try {
        for (var dateStr in availableDates) {
          final date = DateTime.parse(dateStr);
          if (date.isAfter(DateTime.now().subtract(const Duration(days: 1)))) {
            initialDate = date;
            break;
          }
        }
      } catch (e) {
        // Fallback
      }
    }

    // Double check initial date satisfies predicate
    if (!isDayAvailable(initialDate)) {
       _showSnackBar('No upcoming available dates found for this doctor.');
       return;
    }

    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: initialDate,
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 60)),
      selectableDayPredicate: isDayAvailable,
    );

    if (picked != null) {
      setState(() {
        _selectedDate = picked;
        _selectedTime = null; // Reset time when date changes
      });
    }
  }

  DateTime? _parseDateTime() {
    if (_selectedDate == null || _selectedTime == null) return null;
    
    try {
      // Parse time string (e.g., "09:00 AM")
      final timeFormat = DateFormat('hh:mm a');
      final time = timeFormat.parse(_selectedTime!);
      
      // Create a date string in YYYY-MM-DD format
      final dateStr = DateFormat('yyyy-MM-dd').format(_selectedDate!);
      // Create a time string in HH:mm:ss format
      final timeStr = '${time.hour.toString().padLeft(2, '0')}:${time.minute.toString().padLeft(2, '0')}:00';
      
      // Construct ISO 8601 string with Asia/Colombo offset (+05:30)
      // This ensures the backend receives the exact time intended for the doctor's office
      final isoString = '${dateStr}T${timeStr}.000+05:30';
      
      // Parse it back to a DateTime object. Since it has an offset, 
      // DateTime.parse will return it correctly.
      return DateTime.parse(isoString);
    } catch (e) {
      debugPrint('Error parsing date/time: $e');
      return null;
    }
  }

  Future<void> _bookAppointment() async {
    if (_selectedService == null || _selectedService!.isEmpty) {
      _showSnackBar('Please select a service');
      return;
    }
    
    if (_selectedDentist == null || _selectedDate == null || _selectedTime == null) {
      _showSnackBar('Please fill all required fields');
      return;
    }

    final dateTime = _parseDateTime();
    if (dateTime == null) {
      _showSnackBar('Invalid date or time selected');
      return;
    }

    // Show confirmation dialog
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Confirm Appointment'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Doctor: ${_selectedDentist!['name']}'),
            Text('Date: ${DateFormat('dd/MM/yyyy').format(_selectedDate!)}'),
            Text('Time: $_selectedTime'),
            Text('Service: ${_selectedService ?? "Not selected"}'),
            if (_symptomsController.text.isNotEmpty)
              Text('Symptoms: ${_symptomsController.text}'),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Confirm'),
          ),
        ],
      ),
    );

    if (confirmed != true) return;

    setState(() {
      _isBooking = true;
    });

    try {
      final result = await _bookAppointmentUseCase.execute(
        doctorId: _selectedDentist!['id'],
        dateTime: dateTime,
        service: _selectedService!,
        notes: _buildNotesWithReport(),
      );

      result.fold(
        (failure) {
          _showSnackBar('Failed to book appointment: ${failure.message}');
        },
        (appointment) async {
          // Create bill from appointment
          try {
            final appointmentId = appointment.id;
            if (appointmentId.isNotEmpty) {
              await _dentalDataSource.createBillFromAppointment(appointmentId);
              debugPrint('Bill created for appointment: $appointmentId');
            }
          } catch (e) {
            debugPrint('Failed to create bill: $e');
            // Continue even if bill creation fails
          }
          _showSuccessDialog(appointment);
        },
      );
    } catch (e) {
      _showSnackBar('An error occurred: $e');
    } finally {
      setState(() {
        _isBooking = false;
      });
    }
  }

  void _showSuccessDialog([AppointmentEntity? appointment]) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        title: const Text('Appointment Booked!'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.check_circle, size: 60, color: Colors.green),
            const SizedBox(height: 15),
            Text('Your appointment with ${_selectedDentist!['name']} has been confirmed.'),
            const SizedBox(height: 10),
            Text('Date: ${DateFormat('dd/MM/yyyy').format(_selectedDate!)}'),
            Text('Time: $_selectedTime'),
            const SizedBox(height: 10),
            const Text('A bill has been generated for this appointment.'),
            const SizedBox(height: 5),
            const Text('You will receive a confirmation SMS and email.'),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(context); // Close dialog
              Navigator.pop(context); // Close book appointment screen
              // Navigate to Bills page
              Navigator.pushNamed(context, '/my-bills');
            },
            child: const Text('View Bill'),
          ),
        ],
      ),
    );
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
  void dispose() {
    _symptomsController.dispose();
    _pageController.dispose();
    super.dispose();
  }

  // Step wizard state
  int _currentStep = 0;
  final PageController _pageController = PageController();

  static const List<Map<String, dynamic>> _steps = [
    {'title': 'Condition', 'icon': Icons.medical_information},
    {'title': 'Service', 'icon': Icons.medical_services},
    {'title': 'Doctor', 'icon': Icons.person},
    {'title': 'Date & Time', 'icon': Icons.calendar_today},
    {'title': 'Confirm', 'icon': Icons.check_circle},
  ];

  void _nextStep() {
    if (_currentStep < _steps.length - 1) {
      setState(() => _currentStep++);
      _pageController.animateToPage(_currentStep,
          duration: const Duration(milliseconds: 300), curve: Curves.easeInOut);
    }
  }

  void _prevStep() {
    if (_currentStep > 0) {
      setState(() => _currentStep--);
      _pageController.animateToPage(_currentStep,
          duration: const Duration(milliseconds: 300), curve: Curves.easeInOut);
    }
  }

  bool _canProceed() {
    switch (_currentStep) {
      case 0: return true; // condition optional
      case 1: return _selectedService != null;
      case 2: return _selectedDentist != null;
      case 3: return _selectedDate != null && _selectedTime != null;
      case 4: return true;
      default: return false;
    }
  }

  @override
  Widget build(BuildContext context) {
    final Set<String> categories = {};
    for (var service in _services) {
      final category = service['category']?.toString() ?? 'General';
      categories.add(category);
    }
    final sortedCategories = categories.toList()..sort();

    return Scaffold(
      backgroundColor: Colors.grey.shade50,
      appBar: AppBar(
        title: const Text('Book Appointment'),
        backgroundColor: AppColors.primary,
        foregroundColor: AppColors.white,
        elevation: 0,
      ),
      body: Column(
        children: [
          // Step indicator
          _buildStepIndicator(),

          // Page content
          Expanded(
            child: PageView(
              controller: _pageController,
              physics: const NeverScrollableScrollPhysics(),
              children: [
                _buildStepPage(
                  step: 0,
                  child: _buildSymptomsInput(),
                ),
                _buildStepPage(
                  step: 1,
                  child: Column(
                    children: [
                      if (sortedCategories.length > 1) ...[
                        _buildCategoryFilter(sortedCategories),
                        const SizedBox(height: 16),
                      ],
                      _buildServiceSelection(),
                    ],
                  ),
                ),
                _buildStepPage(
                  step: 2,
                  child: _buildDoctorSelection(),
                ),
                _buildStepPage(
                  step: 3,
                  child: _buildDateTimeSelection(),
                ),
                _buildStepPage(
                  step: 4,
                  child: _buildConfirmationSummary(),
                ),
              ],
            ),
          ),

          // Navigation buttons
          _buildNavigationBar(),
        ],
      ),
    );
  }

  Widget _buildStepIndicator() {
    return Container(
      color: AppColors.primary,
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
      child: Column(
        children: [
          // Step dots
          Row(
            children: List.generate(_steps.length, (i) {
              final isActive = i == _currentStep;
              final isDone = i < _currentStep;
              return Expanded(
                child: Row(
                  children: [
                    Expanded(
                      child: Column(
                        children: [
                          AnimatedContainer(
                            duration: const Duration(milliseconds: 200),
                            width: isActive ? 36 : 28,
                            height: isActive ? 36 : 28,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: isDone
                                  ? Colors.white
                                  : isActive
                                      ? Colors.white
                                      : Colors.white.withOpacity(0.3),
                            ),
                            child: Center(
                              child: isDone
                                  ? Icon(Icons.check, size: 16, color: AppColors.primary)
                                  : Icon(
                                      _steps[i]['icon'] as IconData,
                                      size: isActive ? 18 : 14,
                                      color: isActive
                                          ? AppColors.primary
                                          : Colors.white.withOpacity(0.7),
                                    ),
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            _steps[i]['title'] as String,
                            style: TextStyle(
                              fontSize: 10,
                              color: isActive || isDone
                                  ? Colors.white
                                  : Colors.white.withOpacity(0.5),
                              fontWeight: isActive ? FontWeight.bold : FontWeight.normal,
                            ),
                          ),
                        ],
                      ),
                    ),
                    if (i < _steps.length - 1)
                      Expanded(
                        child: Container(
                          height: 2,
                          margin: const EdgeInsets.only(bottom: 20),
                          color: i < _currentStep
                              ? Colors.white
                              : Colors.white.withOpacity(0.3),
                        ),
                      ),
                  ],
                ),
              );
            }),
          ),
        ],
      ),
    );
  }

  Widget _buildStepPage({required int step, required Widget child}) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Step header
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              color: AppColors.primary.withOpacity(0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(
              children: [
                Icon(_steps[step]['icon'] as IconData,
                    color: AppColors.primary, size: 18),
                const SizedBox(width: 8),
                Text(
                  'Step ${step + 1} of ${_steps.length}: ${_steps[step]['title']}',
                  style: TextStyle(
                    color: AppColors.primary,
                    fontWeight: FontWeight.w600,
                    fontSize: 13,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          child,
        ],
      ),
    );
  }

  Widget _buildNavigationBar() {
    final canProceed = _canProceed();
    final isLast = _currentStep == _steps.length - 1;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.08),
            blurRadius: 8,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: Row(
        children: [
          if (_currentStep > 0)
            Expanded(
              child: OutlinedButton.icon(
                onPressed: _prevStep,
                icon: const Icon(Icons.arrow_back),
                label: const Text('Back'),
                style: OutlinedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  side: BorderSide(color: AppColors.primary),
                  foregroundColor: AppColors.primary,
                ),
              ),
            ),
          if (_currentStep > 0) const SizedBox(width: 12),
          Expanded(
            flex: 2,
            child: ElevatedButton.icon(
              onPressed: isLast
                  ? (_isBooking ? null : _bookAppointment)
                  : (canProceed ? _nextStep : null),
              icon: _isBooking
                  ? const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(
                          strokeWidth: 2, color: Colors.white),
                    )
                  : Icon(isLast ? Icons.check_circle : Icons.arrow_forward),
              label: Text(
                _isBooking
                    ? 'Booking...'
                    : isLast
                        ? 'Confirm Booking'
                        : 'Next',
                style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600),
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: canProceed || isLast
                    ? AppColors.primary
                    : Colors.grey.shade300,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 14),
                elevation: canProceed ? 2 : 0,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildConfirmationSummary() {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(Icons.check_circle, color: Color(0xFF00897B), size: 24),
                const SizedBox(width: 8),
                Text('Appointment Summary',
                    style: TextStyles.heading4.copyWith(color: const Color(0xFF00897B))),
              ],
            ),
            const Divider(height: 24),
            _summaryRow(Icons.medical_services, 'Service', _selectedService ?? '-'),
            _summaryRow(Icons.person, 'Doctor',
                _selectedDentist?['name']?.toString() ?? '-'),
            _summaryRow(Icons.local_hospital, 'Hospital',
                _selectedDentist?['hospital']?.toString() ?? '-'),
            _summaryRow(
                Icons.calendar_today,
                'Date',
                _selectedDate != null
                    ? DateFormat('EEEE, dd MMM yyyy').format(_selectedDate!)
                    : '-'),
            _summaryRow(Icons.access_time, 'Time', _selectedTime ?? '-'),
            if (_selectedDiseases.isNotEmpty)
              _summaryRow(Icons.medical_information, 'Conditions',
                  _selectedDiseases.join(', ')),
            if (_symptomsController.text.isNotEmpty)
              _summaryRow(Icons.notes, 'Notes', _symptomsController.text),
            if (widget.scanReportData != null && _attachScanReport) ...[
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: Colors.orange.shade50,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Colors.orange.shade200),
                ),
                child: const Row(
                  children: [
                    Icon(Icons.attach_file, color: Colors.orange, size: 16),
                    SizedBox(width: 6),
                    Text('AI Scan Report will be attached',
                        style: TextStyle(fontSize: 12, color: Colors.orange)),
                  ],
                ),
              ),
            ],
            const SizedBox(height: 16),
            _buildScanReportAttachment(),
          ],
        ),
      ),
    );
  }

  Widget _summaryRow(IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 16, color: Colors.grey.shade600),
          const SizedBox(width: 8),
          SizedBox(
            width: 80,
            child: Text(label,
                style: TextStyle(
                    fontSize: 13,
                    color: Colors.grey.shade600,
                    fontWeight: FontWeight.w500)),
          ),
          Expanded(
            child: Text(value,
                style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
          ),
        ],
      ),
    );
  }
  
  Widget _buildCategoryFilter(List<String> categories) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Filter by Category',
              style: TextStyles.heading4,
            ),
            const SizedBox(height: 15),
            DropdownButtonFormField<String>(
              value: _selectedCategory,
              hint: const Text('All Categories'),
              isExpanded: true,
              items: [
                const DropdownMenuItem<String>(
                  value: null,
                  child: Text('All Categories'),
                ),
                ...categories.map((category) => DropdownMenuItem<String>(
                      value: category,
                      child: Text(category),
                    )),
              ],
              onChanged: (value) {
                setState(() {
                  _selectedCategory = value;
                  _selectedService = null;
                  _selectedDentist = null;
                  _selectedTime = null;
                });
              },
              decoration: const InputDecoration(
                border: OutlineInputBorder(),
                hintText: 'Select Category',
                contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 16),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // Get filtered dentists based on selected service AND category
  List<Map<String, dynamic>> get _filteredDentists {
    if (_selectedService == null && _selectedCategory == null) {
      return _dentists;
    }

    return _dentists.where((dentist) {
      final doctorServices = (dentist['services'] as List<dynamic>? ?? [])
          .map((s) => s.toString().toLowerCase())
          .toList();
      final dentistSpecialty = (dentist['specialty'] ?? '').toString().toLowerCase();

      // 1. If service selected, try exact match in doctor's services list first
      if (_selectedService != null && _selectedService!.isNotEmpty) {
        final svcLower = _selectedService!.toLowerCase();

        // Exact match in services array
        if (doctorServices.any((s) => s == svcLower || s.contains(svcLower) || svcLower.contains(s))) {
          return true;
        }

        // Get the category of the selected service
        final svcCategory = _services
            .firstWhere((s) => s['name'] == _selectedService, orElse: () => {})['category']
            ?.toString()
            .toLowerCase() ?? '';

        // Match by category → specialization
        final categorySpecMap = {
          'orthodontic': ['orthodont'],
          'surgical':    ['surgeon', 'surgery', 'oral'],
          'endodontic':  ['endodont'],
          'restorative': ['prosthodont', 'restorat', 'general'],
          'cosmetic':    ['cosmetic', 'general'],
          'periodontic': ['periodont', 'general'],
          'pediatric':   ['pediatric', 'paediatric', 'general'],
          'emergency':   ['general', 'emergency'],
          'general':     ['general'],
        };

        final matchSpecs = categorySpecMap[svcCategory] ?? ['general'];
        if (matchSpecs.any((spec) => dentistSpecialty.contains(spec))) return true;

        // If doctor has no services set, show them for general/fallback
        if (doctorServices.isEmpty) return true;

        return false;
      }

      // 2. If only category selected (no service), filter by category → specialization
      if (_selectedCategory != null) {
        final catLower = _selectedCategory!.toLowerCase();
        final categorySpecMap = {
          'orthodontic': ['orthodont'],
          'surgical':    ['surgeon', 'surgery', 'oral'],
          'endodontic':  ['endodont'],
          'restorative': ['prosthodont', 'restorat', 'general'],
          'cosmetic':    ['cosmetic', 'general'],
          'periodontic': ['periodont', 'general'],
          'pediatric':   ['pediatric', 'paediatric', 'general'],
          'emergency':   ['general', 'emergency'],
          'general':     ['general'],
        };
        final matchSpecs = categorySpecMap[catLower] ?? ['general'];
        return matchSpecs.any((spec) => dentistSpecialty.contains(spec)) || doctorServices.isEmpty;
      }

      return true;
    }).toList();
  }

  Widget _buildDoctorSelection() {
    final filteredDentists = _filteredDentists;
    
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Select Dentist',
                  style: TextStyles.heading4,
                ),
                if (_selectedService != null && _selectedService!.isNotEmpty)
                  Text(
                    '${filteredDentists.length} available',
                    style: TextStyles.caption.copyWith(
                      color: AppColors.primary,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
              ],
            ),
            if (_selectedService == null || _selectedService!.isEmpty)
              Padding(
                padding: const EdgeInsets.only(top: 8.0),
                child: Text(
                  'Please select a service first to see relevant doctors',
                  style: TextStyles.caption.copyWith(
                    color: Colors.orange,
                    fontStyle: FontStyle.italic,
                  ),
                ),
              ),
            const SizedBox(height: 15),
            if (_isLoadingDentists)
              const Center(child: CircularProgressIndicator())
            else if (_errorMessage != null)
              Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  children: [
                    Text(_errorMessage!, style: const TextStyle(color: Colors.red)),
                    const SizedBox(height: 10),
                    ElevatedButton(
                      onPressed: _loadDentists,
                      child: const Text('Retry'),
                    ),
                  ],
                ),
              )
            else if (filteredDentists.isEmpty && _dentists.isNotEmpty)
              Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  children: [
                    const Icon(Icons.search_off, size: 48, color: Colors.grey),
                    const SizedBox(height: 10),
                    Text(
                      'No doctors available for "$_selectedService"',
                      style: TextStyles.bodyMedium.copyWith(
                        color: Colors.grey,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 5),
                    Text(
                      'Try selecting a different service',
                      style: TextStyles.caption.copyWith(
                        color: Colors.grey,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ],
                ),
              )
            else if (filteredDentists.isEmpty)
              const Padding(
                padding: EdgeInsets.all(16.0),
                child: Text('No dentists available'),
              )
            else
              ...filteredDentists.map((dentist) => _buildDentistCard(dentist)),
          ],
        ),
      ),
    );
  }

  Widget _buildDentistCard(Map<String, dynamic> dentist) {
    bool isSelected = _selectedDentist?['id'] == dentist['id'];
    
    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      color: isSelected ? AppColors.primary.withValues(alpha: 0.1) : null,
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: AppColors.primary,
          child: Text(
            dentist['name']
                .toString()
                .split(' ')
                .where((e) => e.isNotEmpty)
                .map((e) => e[0])
                .take(2)
                .join(),
            style: const TextStyle(color: Colors.white),
          ),
        ),
        title: Text(dentist['name'], style: TextStyles.bodyMedium),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(dentist['specialty']),
            Text(dentist['hospital']),
            Row(
              children: [
                Icon(Icons.star, size: 16, color: Colors.amber),
                Text(' ${dentist['rating']} • ${dentist['experience']}'),
              ],
            ),
          ],
        ),
        trailing: isSelected ? const Icon(Icons.check_circle, color: Colors.green) : null,
        onTap: () {
          setState(() {
            _selectedDentist = dentist;
            _selectedDate = null;
            _selectedTime = null;
          });
          // Load doctor availability when selected
          _loadDoctorAvailability(dentist['id'] as String);
        },
      ),
    );
  }

  Widget _buildDateTimeSelection() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Date & Time',
              style: TextStyles.heading4,
            ),
            const SizedBox(height: 15),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: _selectDate,
                    icon: const Icon(Icons.calendar_today),
                    label: Text(
                      _selectedDate != null
                          ? DateFormat('dd/MM/yyyy').format(_selectedDate!)
                          : 'Select Date',
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                if (_selectedDentist != null && _selectedDate != null) ...[
                  Expanded(
                    child: FutureBuilder<List<String>>(
                      future: _getAvailableTimesForDate(_selectedDate!),
                      builder: (context, snapshot) {
                        if (snapshot.connectionState == ConnectionState.waiting) {
                          return DropdownButtonFormField<String>(
                            isExpanded: true,
                            hint: const Text('Loading times...'),
                            items: const [],
                            onChanged: null,
                            decoration: const InputDecoration(
                              border: OutlineInputBorder(),
                              contentPadding: EdgeInsets.symmetric(horizontal: 10, vertical: 12),
                              isDense: true,
                            ),
                          );
                        }
                        
                        final availableTimes = snapshot.data ?? [];
                        
                        if (availableTimes.isEmpty) {
                          return DropdownButtonFormField<String>(
                            isExpanded: true,
                            hint: const Text('No slots available'),
                            items: [],
                            onChanged: null,
                            decoration: const InputDecoration(
                              border: OutlineInputBorder(),
                              contentPadding: EdgeInsets.symmetric(horizontal: 10, vertical: 12),
                              isDense: true,
                            ),
                          );
                        }
                        
                        return DropdownButtonFormField<String>(
                          isExpanded: true,
                          value: _selectedTime,
                          hint: const Text('Select Time'),
                          items: availableTimes
                              .map((time) => DropdownMenuItem(
                                    value: time,
                                    child: Text(time),
                                  ))
                              .toList(),
                          onChanged: (value) {
                            setState(() {
                              _selectedTime = value;
                            });
                          },
                          decoration: const InputDecoration(
                            border: OutlineInputBorder(),
                            contentPadding: EdgeInsets.symmetric(horizontal: 10, vertical: 12),
                            isDense: true,
                          ),
                        );
                      },
                    ),
                  ),
                ] else if (_selectedDentist != null) ...[
                  Expanded(
                    child: DropdownButtonFormField<String>(
                      isExpanded: true,
                      hint: const Text(
                        'Select Date First',
                        overflow: TextOverflow.ellipsis,
                      ),
                      items: [],
                      onChanged: null,
                      decoration: const InputDecoration(
                        border: OutlineInputBorder(),
                        contentPadding: EdgeInsets.symmetric(horizontal: 10),
                        isDense: true,
                      ),
                    ),
                  ),
                ],
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildServiceSelection() {
    // Filter services by selected category
    final filteredServices = _selectedCategory == null
        ? _services
        : _services.where((service) {
            final category = service['category']?.toString() ?? 'General';
            return category == _selectedCategory;
          }).toList();
    
    // Group filtered services by category
    final Map<String, List<Map<String, dynamic>>> servicesByCategory = {};
    for (var service in filteredServices) {
      final category = service['category']?.toString() ?? 'General';
      if (!servicesByCategory.containsKey(category)) {
        servicesByCategory[category] = [];
      }
      servicesByCategory[category]!.add(service);
    }
    
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Service Required',
              style: TextStyles.heading4,
            ),
            const SizedBox(height: 15),
            if (_isLoadingServices)
              const Center(child: CircularProgressIndicator())
            else if (filteredServices.isEmpty)
              Padding(
                padding: const EdgeInsets.all(8.0),
                child: Text(
                  _selectedCategory == null
                      ? 'No services available. Please check your connection.'
                      : 'No services available in "$_selectedCategory" category.',
                  style: const TextStyle(color: Colors.grey),
                ),
              )
            else if (servicesByCategory.length == 1)
              // Single category - show simple dropdown
              DropdownButtonFormField<String>(
                value: _selectedService,
                hint: const Text('Select Service'),
                isExpanded: true,
                items: _services
                    .map((service) {
                      final serviceName = service['name'] as String? ?? '';
                      return DropdownMenuItem<String>(
                        value: serviceName,
                        child: Text(
                          serviceName,
                          overflow: TextOverflow.ellipsis,
                        ),
                      );
                    })
                    .toList(),
                onChanged: (value) {
                  if (value != null) {
                    setState(() {
                      _selectedService = value;
                      _selectedDentist = null;
                      _selectedTime = null;
                    });
                  }
                },
                decoration: const InputDecoration(
                  border: OutlineInputBorder(),
                  hintText: 'Select Service',
                  contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 16),
                ),
              )
            else
              // Multiple categories - show categorized view
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Category selector
                  DropdownButtonFormField<String>(
                    value: _selectedCategory ?? servicesByCategory.keys.first,
                    hint: const Text('Select Category'),
                    isExpanded: true,
                    items: servicesByCategory.keys
                        .map((category) => DropdownMenuItem<String>(
                              value: category,
                              child: Text(category),
                            ))
                        .toList(),
                    onChanged: (value) {
                      if (value != null) {
                        setState(() {
                          _selectedCategory = value;
                          _selectedService = null;
                          _selectedDentist = null;
                          _selectedTime = null;
                        });
                      }
                    },
                    decoration: const InputDecoration(
                      border: OutlineInputBorder(),
                      hintText: 'Select Category',
                      contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 16),
                    ),
                  ),
                  const SizedBox(height: 15),
                  // Service selector for selected category
                  DropdownButtonFormField<String>(
                    value: _selectedService,
                    hint: Text(_selectedCategory == null 
                        ? 'Select Category First' 
                        : 'Select Service'),
                    isExpanded: true,
                    items: (_selectedCategory != null 
                        ? servicesByCategory[_selectedCategory] ?? []
                        : [])
                        .map((service) {
                          final serviceName = service['name'] as String? ?? '';
                          return DropdownMenuItem<String>(
                            value: serviceName,
                            child: Text(
                              serviceName,
                              overflow: TextOverflow.ellipsis,
                            ),
                          );
                        })
                        .toList(),
                    onChanged: _selectedCategory != null
                        ? (value) {
                            if (value != null) {
                              setState(() {
                                _selectedService = value;
                                _selectedDentist = null;
                                _selectedTime = null;
                              });
                            }
                          }
                        : null,
                    decoration: const InputDecoration(
                      border: OutlineInputBorder(),
                      hintText: 'Select Service',
                      contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 16),
                    ),
                  ),
                ],
              ),
          ],
        ),
      ),
    );
  }

  String _buildNotesWithReport() {
    final parts = <String>[];

    // Add selected dental diseases
    if (_selectedDiseases.isNotEmpty) {
      parts.add('Dental Conditions: ${_selectedDiseases.join(', ')}');
    }

    if (_symptomsController.text.isNotEmpty) {
      parts.add(_symptomsController.text);
    }
    if (_attachScanReport && widget.scanReportData != null) {
      final conditions = widget.scanReportData!['detectedConditions'] as List<dynamic>? ?? [];
      final hasOralCancer = widget.scanReportData!['hasOralCancer'] ?? false;
      final summary = StringBuffer('[AI Scan Report Attached]\n');
      if (hasOralCancer) summary.write('⚠ Oral cancer indicators detected.\n');
      for (final c in conditions) {
        final cm = c as Map<String, dynamic>;
        final name = cm['name'] ?? cm['modelClassName'] ?? '';
        final severity = cm['severity'] ?? '';
        if (name.isNotEmpty) summary.write('• $name (Severity: $severity)\n');
      }
      parts.add(summary.toString().trim());
    }
    return parts.isNotEmpty ? parts.join('\n\n') : _selectedService ?? '';
  }

  Widget _buildScanReportAttachment() {
    if (widget.scanReportData == null) return const SizedBox.shrink();
    final conditions = widget.scanReportData!['detectedConditions'] as List<dynamic>? ?? [];
    final hasOralCancer = widget.scanReportData!['hasOralCancer'] ?? false;

    return Card(
      color: hasOralCancer
          ? const Color(0xFFFEE2E2)
          : const Color(0xFFEFF6FF),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(
          color: hasOralCancer ? const Color(0xFFEF4444) : const Color(0xFF3B82F6),
        ),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(
                  Icons.document_scanner,
                  color: hasOralCancer ? const Color(0xFFEF4444) : const Color(0xFF2563EB),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'AI Scan Report',
                    style: TextStyles.heading4.copyWith(
                      color: hasOralCancer ? const Color(0xFF991B1B) : const Color(0xFF1E3A8A),
                    ),
                  ),
                ),
                Switch(
                  value: _attachScanReport,
                  onChanged: (v) => setState(() => _attachScanReport = v),
                  activeColor: const Color(0xFF2563EB),
                ),
              ],
            ),
            const SizedBox(height: 4),
            Text(
              _attachScanReport
                  ? 'Scan report will be attached to this appointment'
                  : 'Scan report will NOT be attached',
              style: TextStyle(
                fontSize: 12,
                color: _attachScanReport
                    ? const Color(0xFF1D4ED8)
                    : Colors.grey,
              ),
            ),
            if (_attachScanReport && conditions.isNotEmpty) ...[
              const SizedBox(height: 10),
              ...conditions.map((c) {
                final cm = c as Map<String, dynamic>;
                final name = cm['name'] ?? cm['modelClassName'] ?? 'Unknown';
                final severity = cm['severity'] ?? '';
                return Padding(
                  padding: const EdgeInsets.only(bottom: 4),
                  child: Row(
                    children: [
                      const Icon(Icons.circle, size: 8, color: Color(0xFF6B7280)),
                      const SizedBox(width: 6),
                      Expanded(
                        child: Text(
                          '$name${severity.isNotEmpty ? ' — $severity' : ''}',
                          style: const TextStyle(fontSize: 13),
                        ),
                      ),
                    ],
                  ),
                );
              }),
            ],
          ],
        ),
      ),
    );
  }

  // Common dental diseases list
  static const List<Map<String, dynamic>> _dentalDiseases = [
    {'name': 'Tooth Decay (Dental Caries)', 'emoji': '🦷', 'description': 'Cavities caused by bacteria'},
    {'name': 'Gum Disease (Gingivitis)', 'emoji': '🩸', 'description': 'Inflammation of the gums'},
    {'name': 'Periodontitis', 'emoji': '⚠️', 'description': 'Advanced gum disease affecting bone'},
    {'name': 'Tooth Sensitivity', 'emoji': '❄️', 'description': 'Pain from hot/cold foods'},
    {'name': 'Toothache', 'emoji': '😣', 'description': 'Severe tooth pain'},
    {'name': 'Cracked or Broken Tooth', 'emoji': '💔', 'description': 'Fractured tooth'},
    {'name': 'Tooth Abscess', 'emoji': '🔴', 'description': 'Bacterial infection with pus'},
    {'name': 'Dry Mouth (Xerostomia)', 'emoji': '💧', 'description': 'Insufficient saliva production'},
    {'name': 'Bad Breath (Halitosis)', 'emoji': '💨', 'description': 'Persistent bad breath'},
    {'name': 'Teeth Grinding (Bruxism)', 'emoji': '😬', 'description': 'Grinding or clenching teeth'},
    {'name': 'Oral Thrush (Candidiasis)', 'emoji': '🍄', 'description': 'Fungal infection in mouth'},
    {'name': 'Mouth Ulcers (Canker Sores)', 'emoji': '🔵', 'description': 'Painful sores in mouth'},
    {'name': 'Impacted Wisdom Tooth', 'emoji': '🦷', 'description': 'Wisdom tooth stuck in jaw'},
    {'name': 'Dental Erosion', 'emoji': '🧪', 'description': 'Acid wearing away enamel'},
    {'name': 'Temporomandibular Disorder (TMD)', 'emoji': '🦴', 'description': 'Jaw joint pain'},
    {'name': 'Oral Cancer', 'emoji': '🏥', 'description': 'Cancer in mouth or throat'},
    {'name': 'Discolored Teeth', 'emoji': '🟡', 'description': 'Stained or yellowed teeth'},
    {'name': 'Missing Teeth (Edentulism)', 'emoji': '🕳️', 'description': 'One or more missing teeth'},
    {'name': 'Malocclusion (Misaligned Teeth)', 'emoji': '↔️', 'description': 'Improper bite alignment'},
    {'name': 'Other / Not Listed', 'emoji': '📝', 'description': 'Describe in notes below'},
  ];

  List<String> _selectedDiseases = [];

  Widget _buildSymptomsInput() {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(Icons.medical_information, color: Color(0xFF00897B)),
                const SizedBox(width: 8),
                Text('Dental Condition', style: TextStyles.heading4),
              ],
            ),
            const SizedBox(height: 6),
            const Text(
              'Select your condition(s) — helps the doctor prepare',
              style: TextStyle(fontSize: 12, color: Colors.grey),
            ),
            const SizedBox(height: 12),

            // Disease chips
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: _dentalDiseases.map((disease) {
                final name = disease['name'] as String;
                final emoji = disease['emoji'] as String;
                final isSelected = _selectedDiseases.contains(name);
                return GestureDetector(
                  onTap: () {
                    setState(() {
                      if (isSelected) {
                        _selectedDiseases.remove(name);
                      } else {
                        _selectedDiseases.add(name);
                      }
                    });
                  },
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 150),
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    decoration: BoxDecoration(
                      color: isSelected ? const Color(0xFF00897B) : Colors.grey.shade100,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(
                        color: isSelected ? const Color(0xFF00897B) : Colors.grey.shade300,
                      ),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(emoji, style: const TextStyle(fontSize: 14)),
                        const SizedBox(width: 5),
                        Text(
                          name,
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
                            color: isSelected ? Colors.white : Colors.black87,
                          ),
                        ),
                        if (isSelected) ...[
                          const SizedBox(width: 4),
                          const Icon(Icons.check, size: 14, color: Colors.white),
                        ],
                      ],
                    ),
                  ),
                );
              }).toList(),
            ),

            if (_selectedDiseases.isNotEmpty) ...[
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: const Color(0xFFE0F2F1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.check_circle, color: Color(0xFF00897B), size: 16),
                    const SizedBox(width: 6),
                    Expanded(
                      child: Text(
                        '${_selectedDiseases.length} condition(s) selected',
                        style: const TextStyle(
                          fontSize: 12,
                          color: Color(0xFF00695C),
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],

            const SizedBox(height: 16),
            const Divider(),
            const SizedBox(height: 8),

            Row(
              children: [
                const Icon(Icons.notes, color: Color(0xFF00897B), size: 18),
                const SizedBox(width: 6),
                Text('Additional Notes (Optional)', style: TextStyles.heading4),
              ],
            ),
            const SizedBox(height: 10),
            TextField(
              controller: _symptomsController,
              maxLines: 3,
              decoration: InputDecoration(
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                hintText: 'Describe any additional symptoms or concerns...',
                filled: true,
                fillColor: Colors.grey.shade50,
              ),
            ),
          ],
        ),
      ),
    );
  }

}
