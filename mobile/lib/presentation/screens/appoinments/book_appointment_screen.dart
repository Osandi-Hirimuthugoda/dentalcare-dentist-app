import 'package:flutter/material.dart';
import 'package:flutter_application_1/core/themes/colors.dart';
import 'package:flutter_application_1/core/themes/text_styles.dart';
import 'package:flutter_application_1/data/data_sources/remote/dental_remote_data_source.dart';
import 'package:flutter_application_1/domain/entities/appoinment_entity.dart';
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
  
  List<Map<String, dynamic>> _services = [];
  bool _isLoadingServices = true;
  
  Map<String, dynamic>? _selectedDentist;
  DateTime? _selectedDate;
  String? _selectedTime;
  String? _selectedService;
  String? _selectedCategory;
  final TextEditingController _symptomsController = TextEditingController();
  bool _isBooking = false;

  late final DentalRemoteDataSource _dentalDataSource;
  late final BookAppointmentUseCase _bookAppointmentUseCase;

  @override
  void initState() {
    super.initState();
    _dentalDataSource = getIt<DentalRemoteDataSource>();
    _bookAppointmentUseCase = getIt<BookAppointmentUseCase>();
    _loadServices();
    _loadDentists();
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
          _selectedDentist!['availableDates'] = slotsByDate.keys.toList();
        }
        
        // Also update in dentists list
        final index = _dentists.indexWhere((d) => d['id'] == doctorId);
        if (index != -1) {
          _dentists[index]['availableSlots'] = slotsByDate;
          _dentists[index]['availableDates'] = slotsByDate.keys.toList();
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
      // If no availability set, use default slots
      return _generateTimeSlots();
    }
    
    return availableSlots[dateStr] ?? [];
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
        notes: _symptomsController.text.isNotEmpty 
            ? '${_selectedService!}: ${_symptomsController.text}'
            : _selectedService!,
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
  Widget build(BuildContext context) {
    // Get unique categories from services
    final Set<String> categories = {};
    for (var service in _services) {
      final category = service['category']?.toString() ?? 'General';
      categories.add(category);
    }
    final sortedCategories = categories.toList()..sort();
    
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
            // Category filter dropdown
            if (sortedCategories.length > 1) ...[
              _buildCategoryFilter(sortedCategories),
              const SizedBox(height: 20),
            ],
            _buildServiceSelection(),
            const SizedBox(height: 20),
            _buildDoctorSelection(),
            const SizedBox(height: 20),
            _buildDateTimeSelection(),
            const SizedBox(height: 20),
            _buildSymptomsInput(),
            const SizedBox(height: 30),
            _buildBookButton(),
          ],
        ),
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

  // Get filtered dentists based on selected service
  List<Map<String, dynamic>> get _filteredDentists {
    if (_selectedService == null || _selectedService!.isEmpty) {
      return _dentists;
    }
    
    // Filter dentists who offer the selected service
    return _dentists.where((dentist) {
      // Check if doctor's services array includes the selected service
      final doctorServices = dentist['services'] as List<dynamic>?;
      if (doctorServices != null && doctorServices.isNotEmpty) {
        return doctorServices.any((service) => 
          service.toString().toLowerCase() == _selectedService!.toLowerCase()
        );
      }
      
      // Fallback: Check specialization match if services not available
      final dentistSpecialty = (dentist['specialty'] ?? '').toString().toLowerCase();
      final serviceName = _selectedService!.toLowerCase();
      
      // Basic matching logic based on service name and specialization
      if (serviceName.contains('orthodont') || serviceName.contains('braces')) {
        return dentistSpecialty.contains('orthodont');
      } else if (serviceName.contains('extraction') || serviceName.contains('surgery')) {
        return dentistSpecialty.contains('surgeon') || dentistSpecialty.contains('surgery');
      } else if (serviceName.contains('root canal') || serviceName.contains('endodontic')) {
        return dentistSpecialty.contains('endodont');
      } else if (serviceName.contains('crown') || serviceName.contains('prosthodont')) {
        return dentistSpecialty.contains('prosthodont');
      } else if (serviceName.contains('whitening') || serviceName.contains('cosmetic')) {
        return dentistSpecialty.contains('cosmetic');
      } else if (serviceName.contains('cleaning') || serviceName.contains('periodont')) {
        return dentistSpecialty.contains('periodont') || dentistSpecialty.contains('general');
      } else {
        // For general services, show all dentists with general specialties
        return dentistSpecialty.contains('general') || dentistSpecialty.isEmpty;
      }
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
                      hint: const Text('Select Date First'),
                      items: [],
                      onChanged: null,
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