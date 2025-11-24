import 'package:flutter/material.dart';
import 'package:flutter_application_1/core/themes/colors.dart';
import 'package:flutter_application_1/core/themes/text_styles.dart';
import 'package:flutter_application_1/data/data_sources/remote/dental_remote_data_source.dart';
import 'package:flutter_application_1/injection_container.dart';
import 'package:flutter_application_1/presentation/widgets/reviews/add_review_dialog.dart';
import 'package:flutter_application_1/presentation/widgets/reviews/reviews_list_dialog.dart';

class FindDentistsScreen extends StatefulWidget {
  const FindDentistsScreen({super.key});

  @override
  State<FindDentistsScreen> createState() => _FindDentistsScreenState();
}

class _FindDentistsScreenState extends State<FindDentistsScreen> {
  String _selectedFilter = 'All';
  final TextEditingController _searchController = TextEditingController();
  
  Map<String, List<Map<String, dynamic>>> _categorizedDentists = {};
  bool _isLoading = true;
  String? _errorMessage;
  
  late final DentalRemoteDataSource _dentalDataSource;
  
  @override
  void initState() {
    super.initState();
    _dentalDataSource = getIt<DentalRemoteDataSource>();
    _searchController.addListener(_onSearchChanged);
    _loadDentists();
  }
  
  @override
  void dispose() {
    _searchController.removeListener(_onSearchChanged);
    _searchController.dispose();
    super.dispose();
  }
  
  void _onSearchChanged() {
    setState(() {});
  }
  
  Future<void> _loadDentists() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });
    
    try {
      final dentists = await _dentalDataSource.getDentists();
      
      // Convert to list of maps with ratings
      final dentistsList = dentists.map((dentist) {
        final id = dentist['_id']?.toString() ?? dentist['id']?.toString() ?? '';
        final rating = dentist['averageRating'] != null 
            ? (dentist['averageRating'] as num).toDouble() 
            : 0.0;
        final reviews = dentist['totalReviews'] != null 
            ? (dentist['totalReviews'] as num).toInt() 
            : 0;
        return {
          'id': id,
          'name': dentist['fullName'] ?? dentist['name'] ?? 'Unknown Doctor',
          'specialty': dentist['specialization'] ?? dentist['specialty'] ?? 'General Dentistry',
          'hospital': dentist['hospital'] ?? 'Dental Clinic',
          'rating': rating > 0 ? rating : 0.0, // Use actual rating from backend
          'reviews': reviews,
          'experience': dentist['experience'] != null 
              ? '${dentist['experience']} years' 
              : 'N/A',
          'distance': 'N/A',
          'fee': 'Contact for pricing',
          'availability': 'Available',
        'isFavorite': false,
          'services': dentist['services'] ?? [],
        };
      }).toList();
      
      // Sort by rating (highest first), then by number of reviews
      dentistsList.sort((a, b) {
        final ratingA = a['rating'] as double;
        final ratingB = b['rating'] as double;
        final reviewsA = a['reviews'] as int;
        final reviewsB = b['reviews'] as int;
        
        // First sort by rating (descending)
        if (ratingA != ratingB) {
          return ratingB.compareTo(ratingA);
        }
        // If same rating, sort by number of reviews (descending)
        return reviewsB.compareTo(reviewsA);
      });
      
      // Categorize dentists by specialization
      final categorized = <String, List<Map<String, dynamic>>>{};
      for (var dentist in dentistsList) {
        final specialty = dentist['specialty'] as String;
        if (!categorized.containsKey(specialty)) {
          categorized[specialty] = [];
        }
        categorized[specialty]!.add(dentist);
      }
      
      setState(() {
        _categorizedDentists = categorized;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _errorMessage = 'Failed to load dentists. Please try again.';
        _isLoading = false;
      });
      debugPrint('❌ Error loading dentists: $e');
    }
  }
  
  // Get filters list dynamically from loaded categories
  List<String> get _filters {
    final categories = ['All', ..._categorizedDentists.keys];
    return categories;
  }

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

  void _bookAppointment(Map<String, dynamic> dentist) {
    // Navigate to book appointment screen with selected dentist
    Navigator.pushNamed(
      context,
      '/book-appointment',
      arguments: dentist,
    );
  }

  void _showAddReviewDialog(Map<String, dynamic> dentist) {
    showDialog(
      context: context,
      builder: (context) => AddReviewDialog(
        doctorId: dentist['id'] as String,
        doctorName: dentist['name'] as String,
              ),
    ).then((success) {
      if (success == true) {
        // Refresh dentist data to show updated ratings
        _loadDentists();
        
        // Show success message - check if widget is still mounted
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Review added successfully!'),
              backgroundColor: Colors.green,
              duration: Duration(seconds: 2),
            ),
          );
        }
      }
    });
  }

  void _showReviewsDialog(Map<String, dynamic> dentist) {
    showDialog(
      context: context,
      builder: (context) => ReviewsListDialog(
        doctorId: dentist['id'] as String,
        doctorName: dentist['name'] as String,
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
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadDentists,
            tooltip: 'Refresh',
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _errorMessage != null
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        _errorMessage!,
                        style: TextStyles.bodyMedium.copyWith(
                          color: Colors.red,
                        ),
                      ),
                      const SizedBox(height: 16),
                      ElevatedButton(
                        onPressed: _loadDentists,
                        child: const Text('Retry'),
                      ),
                    ],
                  ),
                )
              : Column(
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
                  color: AppColors.primary.withValues(alpha: 0.1),
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
            color: AppColors.textSecondary.withValues(alpha: 0.5),
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
                  backgroundColor: AppColors.primary.withValues(alpha: 0.1),
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
                      GestureDetector(
                        onTap: () => _showReviewsDialog(dentist),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.star, size: 16, color: Colors.amber),
                            Flexible(
                              child: Text(
                                ' ${dentist['rating'] > 0 ? dentist['rating'].toStringAsFixed(1) : 'N/A'}',
                                style: const TextStyle(fontWeight: FontWeight.bold),
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                            if (dentist['reviews'] > 0) ...[
                              Flexible(
                                child: Text(
                                  ' (${dentist['reviews']} reviews)',
                                  overflow: TextOverflow.ellipsis,
                                  style: TextStyle(
                                    color: AppColors.primary,
                                    decoration: TextDecoration.underline,
                                  ),
                                ),
                              ),
                            ] else ...[
                              const Flexible(
                                child: Text(
                                  ' (No reviews yet)',
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                            ],
                          ],
                        ),
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
                    color: Colors.green.withValues(alpha: 0.1),
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
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () => _showAddReviewDialog(dentist),
                    icon: const Icon(Icons.rate_review, size: 18),
                    label: const Text('Review'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppColors.primary,
                      side: BorderSide(color: AppColors.primary),
                      padding: const EdgeInsets.symmetric(vertical: 12),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  flex: 2,
              child: ElevatedButton(
                onPressed: () => _bookAppointment(dentist),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: AppColors.white,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                ),
                child: const Text('Book Appointment'),
              ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoItem(IconData icon, String text) {
    return Expanded(
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 16, color: AppColors.textSecondary),
          const SizedBox(width: 4),
          Flexible(
            child: Text(
            text,
            style: TextStyles.caption,
              overflow: TextOverflow.ellipsis,
              maxLines: 1,
            ),
          ),
        ],
      ),
    );
  }
}