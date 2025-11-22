import 'package:flutter/material.dart';
import 'package:flutter_application_1/core/themes/colors.dart';
import 'package:flutter_application_1/core/themes/text_styles.dart';
import 'package:flutter_application_1/data/data_sources/remote/dental_remote_data_source.dart';
import 'package:flutter_application_1/domain/use_cases/appointment/book_appointment_use_case.dart';
import 'package:flutter_application_1/injection_container.dart';
import 'package:intl/intl.dart';

class BookAppointmentScreen extends StatefulWidget {
  const BookAppointmentScreen({super.key});

  @override
  State<BookAppointmentScreen> createState() => _BookAppointmentScreenState();
}

class _BookAppointmentScreenState extends State<BookAppointmentScreen> {
  List<Map<String, dynamic>> _dentists = [];
  bool _isLoadingDentists = true;
  String? _errorMessage;
  
  Map<String, dynamic>? _selectedDentist;
  DateTime? _selectedDate;
  String? _selectedTime;
  String _selectedService = 'Dental Checkup';
  final TextEditingController _symptomsController = TextEditingController();
  bool _isBooking = false;

  late final DentalRemoteDataSource _dentalDataSource;
  late final BookAppointmentUseCase _bookAppointmentUseCase;

  final List<String> _services = [
    'Dental Checkup',
    'Teeth Cleaning',
    'Tooth Filling',
    'Root Canal Treatment',
    'Dental Crown',
    'Tooth Extraction',
    'Braces Consultation',
    'Teeth Whitening',
  ];

  @override
  void initState() {
    super.initState();
    _dentalDataSource = getIt<DentalRemoteDataSource>();
    _bookAppointmentUseCase = getIt<BookAppointmentUseCase>();
    _loadDentists();
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
            'availableSlots': _generateTimeSlots(), // Generate default time slots
          };
        }).toList();
        _isLoadingDentists = false;
      });
    } catch (e) {
      setState(() {
        _errorMessage = 'Failed to load dentists. Please try again.';
        _isLoadingDentists = false;
      });
    }
  }

  List<String> _generateTimeSlots() {
    // Generate time slots from 9 AM to 5 PM
    final slots = <String>[];
    for (int hour = 9; hour < 17; hour++) {
      for (int minute = 0; minute < 60; minute += 30) {
        final time = DateTime(2000, 1, 1, hour, minute);
        slots.add(DateFormat('hh:mm a').format(time));
      }
    }
    return slots;
  }

  void _selectDate() async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: DateTime.now().add(const Duration(days: 1)),
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 60)),
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
      
      // Combine date and time
      return DateTime(
        _selectedDate!.year,
        _selectedDate!.month,
        _selectedDate!.day,
        time.hour,
        time.minute,
      );
    } catch (e) {
      return null;
    }
  }

  Future<void> _bookAppointment() async {
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
            Text('Service: $_selectedService'),
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
        service: _selectedService,
        notes: _symptomsController.text.isNotEmpty 
            ? '$_selectedService: ${_symptomsController.text}'
            : _selectedService,
      );

      result.fold(
        (failure) {
          _showSnackBar('Failed to book appointment: ${failure.message}');
        },
        (appointment) {
          _showSuccessDialog();
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

  void _showSuccessDialog() {
    showDialog(
      context: context,
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
            const Text('You will receive a confirmation SMS and email.'),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              Navigator.pop(context);
            },
            child: const Text('OK'),
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
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Book Appointment'),
        backgroundColor: AppColors.primary,
        foregroundColor: AppColors.white,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildDoctorSelection(),
            const SizedBox(height: 20),
            _buildDateTimeSelection(),
            const SizedBox(height: 20),
            _buildServiceSelection(),
            const SizedBox(height: 20),
            _buildSymptomsInput(),
            const SizedBox(height: 30),
            _buildBookButton(),
          ],
        ),
      ),
    );
  }

  Widget _buildDoctorSelection() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Select Dentist',
              style: TextStyles.heading4,
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
            else if (_dentists.isEmpty)
              const Padding(
                padding: EdgeInsets.all(16.0),
                child: Text('No dentists available'),
              )
            else
              ..._dentists.map((dentist) => _buildDentistCard(dentist)),
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
            dentist['name'].split(' ').map((e) => e[0]).join(),
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
            _selectedTime = null;
          });
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
                if (_selectedDentist != null) ...[
                  Expanded(
                    child: DropdownButtonFormField<String>(
                      value: _selectedTime,
                      hint: const Text('Select Time'),
                      items: (_selectedDentist!['availableSlots'] as List<String>)
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
                        contentPadding: EdgeInsets.symmetric(horizontal: 12),
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
            DropdownButtonFormField<String>(
              value: _selectedService,
              items: _services
                  .map((service) => DropdownMenuItem(
                        value: service,
                        child: Text(service),
                      ))
                  .toList(),
              onChanged: (value) {
                setState(() {
                  _selectedService = value!;
                });
              },
              decoration: const InputDecoration(
                border: OutlineInputBorder(),
                hintText: 'Select Service',
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSymptomsInput() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Symptoms (Optional)',
              style: TextStyles.heading4,
            ),
            const SizedBox(height: 15),
            TextField(
              controller: _symptomsController,
              maxLines: 3,
              decoration: const InputDecoration(
                border: OutlineInputBorder(),
                hintText: 'Describe your symptoms or concerns...',
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBookButton() {
    return SizedBox(
      width: double.infinity,
      child: ElevatedButton(
        onPressed: _isBooking ? null : _bookAppointment,
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: AppColors.white,
          padding: const EdgeInsets.symmetric(vertical: 15),
        ),
        child: _isBooking
            ? const SizedBox(
                height: 20,
                width: 20,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                ),
              )
            : const Text(
                'Book Appointment',
                style: TextStyle(fontSize: 16),
              ),
      ),
    );
  }
}