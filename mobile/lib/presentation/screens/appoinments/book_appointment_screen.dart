import 'package:flutter/material.dart';
import 'package:flutter_application_1/core/themes/colors.dart';
import 'package:flutter_application_1/core/themes/text_styles.dart';

class BookAppointmentScreen extends StatefulWidget {
  const BookAppointmentScreen({super.key});

  @override
  State<BookAppointmentScreen> createState() => _BookAppointmentScreenState();
}

class _BookAppointmentScreenState extends State<BookAppointmentScreen> {
  final List<Map<String, dynamic>> _dentists = [
    {
      'id': '1',
      'name': 'Dr. Kamal Fernando',
      'specialty': 'General Dentistry',
      'hospital': 'Dental Care Center - Colombo',
      'rating': 4.8,
      'experience': '15 years',
      'image': 'assets/images/doctor1.png',
      'availableSlots': ['09:00 AM', '10:30 AM', '02:00 PM', '03:30 PM']
    },
    {
      'id': '2',
      'name': 'Dr. Sameera Perera',
      'specialty': 'Orthodontist',
      'hospital': 'City Dental Hospital',
      'rating': 4.9,
      'experience': '12 years',
      'image': 'assets/images/doctor2.png',
      'availableSlots': ['10:00 AM', '11:30 AM', '04:00 PM']
    },
    {
      'id': '3',
      'name': 'Dr. Nimal Silva',
      'specialty': 'Oral Surgery',
      'hospital': 'National Dental Institute',
      'rating': 4.7,
      'experience': '20 years',
      'image': 'assets/images/doctor3.png',
      'availableSlots': ['08:30 AM', '01:00 PM', '02:30 PM', '04:00 PM']
    },
    {
      'id': '4',
      'name': 'Dr. Anoma Rajapaksa',
      'specialty': 'Pediatric Dentistry',
      'hospital': 'Kids Dental Care',
      'rating': 4.9,
      'experience': '10 years',
      'image': 'assets/images/doctor4.png',
      'availableSlots': ['09:30 AM', '11:00 AM', '03:00 PM']
    },
  ];

  Map<String, dynamic>? _selectedDentist;
  String? _selectedDate;
  String? _selectedTime;
  String _selectedService = 'Dental Checkup';
  final TextEditingController _symptomsController = TextEditingController();

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

  void _selectDate() async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: DateTime.now().add(const Duration(days: 1)),
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 60)),
    );

    if (picked != null) {
      setState(() {
        _selectedDate = "${picked.day}/${picked.month}/${picked.year}";
      });
    }
  }

  void _bookAppointment() {
    if (_selectedDentist == null || _selectedDate == null || _selectedTime == null) {
      _showSnackBar('Please fill all required fields');
      return;
    }

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Confirm Appointment'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Doctor: ${_selectedDentist!['name']}'),
            Text('Date: $_selectedDate'),
            Text('Time: $_selectedTime'),
            Text('Service: $_selectedService'),
            if (_symptomsController.text.isNotEmpty)
              Text('Symptoms: ${_symptomsController.text}'),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              _showSuccessDialog();
            },
            child: const Text('Confirm'),
          ),
        ],
      ),
    );
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
            Text('Date: $_selectedDate'),
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
      color: isSelected ? AppColors.primary.withOpacity(0.1) : null,
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
                    label: Text(_selectedDate ?? 'Select Date'),
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
        onPressed: _bookAppointment,
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: AppColors.white,
          padding: const EdgeInsets.symmetric(vertical: 15),
        ),
        child: const Text(
          'Book Appointment',
          style: TextStyle(fontSize: 16),
        ),
      ),
    );
  }
}