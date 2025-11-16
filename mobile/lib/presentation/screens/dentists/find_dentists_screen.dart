import 'package:flutter/material.dart';
import 'package:flutter_application_1/core/themes/colors.dart';
import 'package:flutter_application_1/core/themes/text_styles.dart';

class FindDentistsScreen extends StatefulWidget {
  const FindDentistsScreen({super.key});

  @override
  State<FindDentistsScreen> createState() => _FindDentistsScreenState();
}

class _FindDentistsScreenState extends State<FindDentistsScreen> {
  String _selectedFilter = 'All';
  final TextEditingController _searchController = TextEditingController();
  
  // Original data保持不变
  final Map<String, List<Map<String, dynamic>>> _categorizedDentists = {
    'General Dentistry': [
      {
        'id': '1',
        'name': 'Dr. Kamal Fernando',
        'specialty': 'General Dentistry',
        'hospital': 'Dental Care Center - Colombo',
        'rating': 4.8,
        'reviews': 127,
        'experience': '15 years',
        'distance': '2.5 km',
        'fee': 'LKR 2,500',
        'availability': 'Available Today',
        'image': 'assets/images/doctor1.png',
        'isFavorite': true,
      },
    ],
    'Orthodontist': [
      {
        'id': '2',
        'name': 'Dr. Sameera Perera',
        'specialty': 'Orthodontist',
        'hospital': 'City Dental Hospital',
        'rating': 4.9,
        'reviews': 89,
        'experience': '12 years',
        'distance': '3.1 km',
        'fee': 'LKR 3,000',
        'availability': 'Available Tomorrow',
        'image': 'assets/images/doctor2.png',
        'isFavorite': false,
      },
    ],
    'Oral Surgery': [
      {
        'id': '3',
        'name': 'Dr. Nimal Silva',
        'specialty': 'Oral Surgery',
        'hospital': 'National Dental Institute',
        'rating': 4.7,
        'reviews': 203,
        'experience': '20 years',
        'distance': '4.2 km',
        'fee': 'LKR 4,000',
        'availability': 'Available Today',
        'image': 'assets/images/doctor3.png',
        'isFavorite': true,
      },
    ],
    'Pediatric Dentistry': [
      {
        'id': '4',
        'name': 'Dr. Anoma Rajapaksa',
        'specialty': 'Pediatric Dentistry',
        'hospital': 'Kids Dental Care',
        'rating': 4.9,
        'reviews': 67,
        'experience': '10 years',
        'distance': '1.8 km',
        'fee': 'LKR 2,800',
        'availability': 'Available Today',
        'image': 'assets/images/doctor4.png',
        'isFavorite': false,
      },
    ],
    'Cosmetic Dentistry': [
      {
        'id': '5',
        'name': 'Dr. Sanjay Perera',
        'specialty': 'Cosmetic Dentistry',
        'hospital': 'Smile Design Clinic',
        'rating': 4.8,
        'reviews': 145,
        'experience': '8 years',
        'distance': '5.0 km',
        'fee': 'LKR 5,000',
        'availability': 'Available Tomorrow',
        'image': 'assets/images/doctor5.png',
        'isFavorite': false,
      },
    ],
  };

  final List<String> _filters = [
    'All',
    'General Dentistry',
    'Orthodontist',
    'Oral Surgery',
    'Pediatric Dentistry',
    'Cosmetic Dentistry',
  ];

  // Get filtered dentists based on search query and selected filter
  Map<String, List<Map<String, dynamic>>> get _filteredDentists {
    final searchQuery = _searchController.text.toLowerCase().trim();
    
    // If search query is empty and filter is 'All', return all dentists
    if (searchQuery.isEmpty && _selectedFilter == 'All') {
      return _categorizedDentists;
    }
    
    Map<String, List<Map<String, dynamic>>> result = {};
    
    for (var category in _categorizedDentists.keys) {
      // Skip categories that don't match the filter (unless filter is 'All')
      if (_selectedFilter != 'All' && category != _selectedFilter) {
        continue;
      }
      
      final categoryDentists = _categorizedDentists[category]!;
      final filteredDentists = categoryDentists.where((dentist) {
        // If search query is empty, include all dentists in the category
        if (searchQuery.isEmpty) {
          return true;
        }
        
        // Search in name, specialty, and hospital
        final name = dentist['name'].toString().toLowerCase();
        final specialty = dentist['specialty'].toString().toLowerCase();
        final hospital = dentist['hospital'].toString().toLowerCase();
        
        return name.contains(searchQuery) ||
               specialty.contains(searchQuery) ||
               hospital.contains(searchQuery);
      }).toList();
      
      // Only add category if it has dentists after filtering
      if (filteredDentists.isNotEmpty) {
        result[category] = filteredDentists;
      }
    }
    
    return result;
  }

  // Get all dentists as a flat list for counting
  List<Map<String, dynamic>> get _allFilteredDentists {
    return _filteredDentists.values.expand((list) => list).toList();
  }

  void _toggleFavorite(String dentistId) {
    setState(() {
      for (var category in _categorizedDentists.values) {
        for (var dentist in category) {
          if (dentist['id'] == dentistId) {
            dentist['isFavorite'] = !dentist['isFavorite'];
            break;
          }
        }
      }
    });
  }

  void _clearSearch() {
    setState(() {
      _searchController.clear();
    });
  }

  @override
  void initState() {
    super.initState();
    _searchController.addListener(_onSearchChanged);
  }

  void _onSearchChanged() {
    setState(() {
      // Rebuild the UI when search text changes
    });
  }

  @override
  void dispose() {
    _searchController.removeListener(_onSearchChanged);
    _searchController.dispose();
    super.dispose();
  }

  void _bookAppointment(Map<String, dynamic> dentist) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (context) => Container(
        padding: const EdgeInsets.all(20),
        height: MediaQuery.of(context).size.height * 0.7,
        child: Column(
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Book Appointment',
                  style: TextStyles.heading4,
                ),
                IconButton(
                  icon: const Icon(Icons.close),
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),
            const SizedBox(height: 20),
            _buildDentistInfo(dentist),
            const SizedBox(height: 20),
            _buildAppointmentForm(dentist),
          ],
        ),
      ),
    );
  }

  Widget _buildDentistInfo(Map<String, dynamic> dentist) {
    return Row(
      children: [
        CircleAvatar(
          radius: 30,
          backgroundColor: AppColors.primary.withOpacity(0.1),
          child: Text(
            dentist['name'].split(' ').map((e) => e[0]).join(),
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: AppColors.primary,
            ),
          ),
        ),
        const SizedBox(width: 15),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                dentist['name'],
                style: TextStyles.bodyMedium.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
              Text(
                dentist['specialty'],
                style: TextStyles.bodySmall,
              ),
              Text(
                dentist['hospital'],
                style: TextStyles.caption,
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildAppointmentForm(Map<String, dynamic> dentist) {
    return Expanded(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Select Date:'),
          const SizedBox(height: 10),
          OutlinedButton.icon(
            onPressed: () {
              // Date picker
            },
            icon: const Icon(Icons.calendar_today),
            label: const Text('Choose Date'),
          ),
          const SizedBox(height: 20),
          const Text('Select Time:'),
          const SizedBox(height: 10),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: ['09:00 AM', '10:30 AM', '02:00 PM', '03:30 PM']
                .map((time) => FilterChip(
                      label: Text(time),
                      selected: false,
                      onSelected: (bool value) {},
                    ))
                .toList(),
          ),
          const SizedBox(height: 20),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: () {
                Navigator.pop(context);
                _showBookingConfirmation(dentist);
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: AppColors.white,
              ),
              child: const Text('Confirm Appointment'),
            ),
          ),
        ],
      ),
    );
  }

  void _showBookingConfirmation(Map<String, dynamic> dentist) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Appointment Booked!'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.check_circle, size: 60, color: Colors.green),
            const SizedBox(height: 15),
            Text('Appointment with ${dentist['name']} has been confirmed.'),
            const SizedBox(height: 10),
            const Text('You will receive a confirmation message shortly.'),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Find Dentists'),
        backgroundColor: AppColors.primary,
        foregroundColor: AppColors.white,
      ),
      body: Column(
        children: [
          _buildSearchBar(),
          _buildFilterChips(),
          _buildResultsCount(),
          Expanded(
            child: _buildDentistsView(),
          ),
        ],
      ),
    );
  }

  Widget _buildSearchBar() {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: TextField(
        controller: _searchController,
        decoration: InputDecoration(
          hintText: 'Search dentists, specialties, hospitals...',
          prefixIcon: const Icon(Icons.search),
          suffixIcon: _searchController.text.isNotEmpty
              ? IconButton(
                  icon: const Icon(Icons.clear),
                  onPressed: _clearSearch,
                )
              : null,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide(color: AppColors.primary),
          ),
        ),
        onChanged: (value) {
          setState(() {}); // Rebuild when text changes
        },
      ),
    );
  }

  Widget _buildFilterChips() {
    return SizedBox(
      height: 50,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        itemCount: _filters.length,
        itemBuilder: (context, index) {
          final filter = _filters[index];
          return Padding(
            padding: const EdgeInsets.only(right: 8),
            child: FilterChip(
              label: Text(filter),
              selected: _selectedFilter == filter,
              onSelected: (bool selected) {
                setState(() {
                  _selectedFilter = selected ? filter : 'All';
                });
              },
            ),
          );
        },
      ),
    );
  }

  Widget _buildResultsCount() {
    final totalResults = _allFilteredDentists.length;
    final hasSearch = _searchController.text.isNotEmpty;
    
    if (totalResults == 0) {
      return Padding(
        padding: const EdgeInsets.all(16),
        child: Text(
          'No dentists found${hasSearch ? ' for "${_searchController.text}"' : ''}',
          style: TextStyles.bodyMedium.copyWith(
            color: AppColors.textSecondary,
          ),
        ),
      );
    }
    
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Row(
        children: [
          Text(
            '$totalResults dentist${totalResults > 1 ? 's' : ''} found',
            style: TextStyles.bodySmall.copyWith(
              color: AppColors.textSecondary,
            ),
          ),
          if (hasSearch) ...[
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                'for "${_searchController.text}"',
                style: TextStyles.bodySmall.copyWith(
                  color: AppColors.primary,
                  fontWeight: FontWeight.bold,
                ),
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildDentistsView() {
    final filteredDentists = _filteredDentists;
    
    if (filteredDentists.isEmpty) {
      return _buildEmptyState();
    }
    
    if (_selectedFilter == 'All') {
      return _buildCategorizedView(filteredDentists);
    } else {
      return _buildCategoryDentistsList(_selectedFilter, filteredDentists[_selectedFilter] ?? []);
    }
  }

  Widget _buildCategorizedView(Map<String, List<Map<String, dynamic>>> dentists) {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: dentists.length,
      itemBuilder: (context, index) {
        final category = dentists.keys.elementAt(index);
        final categoryDentists = dentists[category]!;
        
        return _buildCategorySection(category, categoryDentists);
      },
    );
  }

  Widget _buildCategorySection(String category, List<Map<String, dynamic>> dentists) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(vertical: 16),
          child: Row(
            children: [
              Text(
                category,
                style: TextStyles.heading1.copyWith(
                  fontWeight: FontWeight.bold,
                  color: AppColors.primary,
                ),
              ),
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: AppColors.primary.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  '${dentists.length}',
                  style: TextStyles.caption.copyWith(
                    color: AppColors.primary,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
        ),
        ...dentists.map((dentist) => 
          Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: _buildDentistCard(dentist),
          )
        ),
        const SizedBox(height: 8),
      ],
    );
  }

  Widget _buildCategoryDentistsList(String category, List<Map<String, dynamic>> dentists) {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: dentists.length,
      itemBuilder: (context, index) {
        final dentist = dentists[index];
        return Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: _buildDentistCard(dentist),
        );
      },
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.search_off,
            size: 80,
            color: AppColors.textSecondary.withOpacity(0.5),
          ),
          const SizedBox(height: 16),
          Text(
            'No dentists found',
            style: TextStyles.heading1,
          ),
          const SizedBox(height: 8),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 32),
            child: Text(
              _searchController.text.isEmpty
                  ? 'Try selecting a different category'
                  : 'Try adjusting your search or filters',
              textAlign: TextAlign.center,
              style: TextStyles.bodyMedium.copyWith(
                color: AppColors.textSecondary,
              ),
            ),
          ),
          const SizedBox(height: 16),
          if (_searchController.text.isNotEmpty)
            ElevatedButton(
              onPressed: _clearSearch,
              child: const Text('Clear Search'),
            ),
        ],
      ),
    );
  }

  Widget _buildDentistCard(Map<String, dynamic> dentist) {
    return Card(
      margin: EdgeInsets.zero,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Row(
              children: [
                CircleAvatar(
                  radius: 25,
                  backgroundColor: AppColors.primary.withOpacity(0.1),
                  child: Text(
                    dentist['name'].split(' ').map((e) => e[0]).join(),
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: AppColors.primary,
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        dentist['name'],
                        style: TextStyles.bodyMedium.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Text(
                        dentist['specialty'],
                        style: TextStyles.bodySmall,
                      ),
                      Row(
                        children: [
                          Icon(Icons.star, size: 16, color: Colors.amber),
                          Text(' ${dentist['rating']} (${dentist['reviews']} reviews)'),
                        ],
                      ),
                    ],
                  ),
                ),
                IconButton(
                  icon: Icon(
                    dentist['isFavorite'] ? Icons.favorite : Icons.favorite_border,
                    color: dentist['isFavorite'] ? Colors.red : AppColors.textSecondary,
                  ),
                  onPressed: () => _toggleFavorite(dentist['id']),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                _buildInfoItem(Icons.location_on, dentist['distance']),
                _buildInfoItem(Icons.work, dentist['experience']),
                _buildInfoItem(Icons.attach_money, dentist['fee']),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: Text(
                    dentist['hospital'],
                    style: TextStyles.caption,
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.green.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    dentist['availability'],
                    style: TextStyles.caption.copyWith(
                      color: Colors.green,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () => _bookAppointment(dentist),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: AppColors.white,
                ),
                child: const Text('Book Appointment'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoItem(IconData icon, String text) {
    return Expanded(
      child: Row(
        children: [
          Icon(icon, size: 16, color: AppColors.textSecondary),
          const SizedBox(width: 4),
          Text(
            text,
            style: TextStyles.caption,
          ),
        ],
      ),
    );
  }
}