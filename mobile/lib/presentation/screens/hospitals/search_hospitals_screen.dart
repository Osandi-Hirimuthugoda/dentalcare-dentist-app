import 'package:flutter/material.dart';
import 'package:flutter_application_1/core/themes/colors.dart';
import 'package:flutter_application_1/core/themes/text_styles.dart';
import 'package:flutter_application_1/data/data_sources/remote/dental_remote_data_source.dart';
import 'package:flutter_application_1/data/models/hospital_model.dart';
import 'package:flutter_application_1/injection_container.dart';

class SearchHospitalsScreen extends StatefulWidget {
  const SearchHospitalsScreen({super.key});

  @override
  State<SearchHospitalsScreen> createState() => _SearchHospitalsScreenState();
}

class _SearchHospitalsScreenState extends State<SearchHospitalsScreen> {
  final TextEditingController _searchController = TextEditingController();
  final DentalRemoteDataSource _dentalDataSource = getIt<DentalRemoteDataSource>();
  
  List<HospitalModel> _hospitals = [];
  List<HospitalModel> _filteredHospitals = [];
  bool _isLoading = false;
  String? _errorMessage;
  String? _selectedDistrict;
  List<Map<String, dynamic>> _districts = [];

  // Sri Lankan districts
  static const List<String> sriLankanDistricts = [
    "Colombo",
    "Gampaha",
    "Kalutara",
    "Kandy",
    "Matale",
    "Nuwara Eliya",
    "Galle",
    "Matara",
    "Hambantota",
    "Jaffna",
    "Kilinochchi",
    "Mannar",
    "Vavuniya",
    "Mullaitivu",
    "Batticaloa",
    "Ampara",
    "Trincomalee",
    "Kurunegala",
    "Puttalam",
    "Anuradhapura",
    "Polonnaruwa",
    "Badulla",
    "Moneragala",
    "Ratnapura",
    "Kegalle",
  ];

  @override
  void initState() {
    super.initState();
    _searchController.addListener(_onSearchChanged);
    _loadHospitals();
    _loadDistricts();
  }

  @override
  void dispose() {
    _searchController.removeListener(_onSearchChanged);
    _searchController.dispose();
    super.dispose();
  }

  void _onSearchChanged() {
    _filterHospitals();
  }

  Future<void> _loadHospitals() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final hospitals = await _dentalDataSource.searchHospitals();
      setState(() {
        _hospitals = hospitals
            .map((h) => HospitalModel.fromJson(h))
            .toList();
        _filterHospitals();
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _errorMessage = 'Failed to load hospitals. Please try again.';
        _isLoading = false;
      });
      debugPrint(' Error loading hospitals: $e');
    }
  }

  Future<void> _loadDistricts() async {
    try {
      final districts = await _dentalDataSource.getDistrictsWithCounts();
      setState(() {
        _districts = districts.map((d) => {
          '_id': d['_id'] ?? '',
          'count': d['count'] ?? 0,
        }).toList();
      });
    } catch (e) {
      debugPrint(' Error loading districts: $e');
    }
  }

  void _filterHospitals() {
    final query = _searchController.text.toLowerCase().trim();
    
    setState(() {
      _filteredHospitals = _hospitals.where((hospital) {
        final matchesQuery = query.isEmpty ||
            hospital.name.toLowerCase().contains(query) ||
            hospital.district.toLowerCase().contains(query) ||
            hospital.address.toLowerCase().contains(query) ||
            (hospital.city?.toLowerCase().contains(query) ?? false);
        
        final matchesDistrict = _selectedDistrict == null ||
            hospital.district == _selectedDistrict;
        
        return matchesQuery && matchesDistrict;
      }).toList();
    });
  }

  Future<void> _searchHospitals() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final hospitals = await _dentalDataSource.searchHospitals(
        query: _searchController.text.trim().isEmpty 
            ? null 
            : _searchController.text.trim(),
        district: _selectedDistrict,
      );
      
      setState(() {
        _hospitals = hospitals
            .map((h) => HospitalModel.fromJson(h))
            .toList();
        _filterHospitals();
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _errorMessage = 'Failed to search hospitals. Please try again.';
        _isLoading = false;
      });
      debugPrint(' Error searching hospitals: $e');
    }
  }

  void _onDistrictSelected(String? district) {
    setState(() {
      _selectedDistrict = district;
    });
    _filterHospitals();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Search Hospitals'),
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.map),
            tooltip: 'View on Map',
            onPressed: () {
              Navigator.pushNamed(context, '/nearby-hospitals-map');
            },
          ),
        ],
      ),
      body: Column(
        children: [
          // Search and Filter Section
          Container(
            padding: const EdgeInsets.all(16),
            color: Colors.grey[50],
            child: Column(
              children: [
                // Search Bar
                TextField(
                  controller: _searchController,
                  decoration: InputDecoration(
                    hintText: 'Search hospitals by name, district, or address...',
                    prefixIcon: const Icon(Icons.search),
                    suffixIcon: _searchController.text.isNotEmpty
                        ? IconButton(
                            icon: const Icon(Icons.clear),
                            onPressed: () {
                              _searchController.clear();
                            },
                          )
                        : null,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    filled: true,
                    fillColor: Colors.white,
                  ),
                  onSubmitted: (_) => _searchHospitals(),
                ),
                const SizedBox(height: 12),
                // District Filter
                DropdownButtonFormField<String>(
                  value: _selectedDistrict,
                  decoration: InputDecoration(
                    labelText: 'Filter by District',
                    prefixIcon: const Icon(Icons.location_on),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    filled: true,
                    fillColor: Colors.white,
                  ),
                  items: [
                    const DropdownMenuItem<String>(
                      value: null,
                      child: Text('All Districts'),
                    ),
                    ...sriLankanDistricts.map((district) {
                      final districtData = _districts.firstWhere(
                        (d) => d['_id'] == district,
                        orElse: () => {'_id': district, 'count': 0},
                      );
                      return DropdownMenuItem<String>(
                        value: district,
                        child: Text('$district (${districtData['count']})'),
                      );
                    }),
                  ],
                  onChanged: _onDistrictSelected,
                ),
              ],
            ),
          ),
          // Results Section
          Expanded(
            child: _buildResults(),
          ),
        ],
      ),
    );
  }

  Widget _buildResults() {
    if (_isLoading) {
      return const Center(
        child: CircularProgressIndicator(),
      );
    }

    if (_errorMessage != null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.error_outline,
              size: 64,
              color: Colors.red[300],
            ),
            const SizedBox(height: 16),
            Text(
              _errorMessage!,
              style: TextStyles.bodyMedium.copyWith(
                color: Colors.red,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: _loadHospitals,
              child: const Text('Retry'),
            ),
          ],
        ),
      );
    }

    if (_filteredHospitals.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.local_hospital_outlined,
              size: 64,
              color: Colors.grey[400],
            ),
            const SizedBox(height: 16),
            Text(
              _searchController.text.isEmpty && _selectedDistrict == null
                  ? 'No hospitals found'
                  : 'No hospitals match your search',
              style: TextStyles.bodyMedium.copyWith(
                color: Colors.grey[600],
              ),
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _filteredHospitals.length,
      itemBuilder: (context, index) {
        final hospital = _filteredHospitals[index];
        return _buildHospitalCard(hospital);
      },
    );
  }

  Widget _buildHospitalCard(HospitalModel hospital) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(
                  Icons.local_hospital,
                  color: AppColors.primary,
                  size: 28,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        hospital.name,
                        style: TextStyles.heading4.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          Icon(
                            Icons.location_on,
                            size: 16,
                            color: Colors.grey[600],
                          ),
                          const SizedBox(width: 4),
                          Text(
                            hospital.district,
                            style: TextStyles.bodySmall.copyWith(
                              color: Colors.grey[600],
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            if (hospital.address.isNotEmpty) ...[
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Icon(
                    Icons.home,
                    size: 16,
                    color: Colors.grey[600],
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      hospital.address,
                      style: TextStyles.bodySmall,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
            ],
            if (hospital.city != null && hospital.city!.isNotEmpty) ...[
              Row(
                children: [
                  Icon(
                    Icons.location_city,
                    size: 16,
                    color: Colors.grey[600],
                  ),
                  const SizedBox(width: 8),
                  Text(
                    hospital.city!,
                    style: TextStyles.bodySmall,
                  ),
                ],
              ),
              const SizedBox(height: 8),
            ],
            if (hospital.phone != null && hospital.phone!.isNotEmpty) ...[
              Row(
                children: [
                  Icon(
                    Icons.phone,
                    size: 16,
                    color: Colors.grey[600],
                  ),
                  const SizedBox(width: 8),
                  Text(
                    hospital.phone!,
                    style: TextStyles.bodySmall,
                  ),
                ],
              ),
              const SizedBox(height: 8),
            ],
            if (hospital.facilities.isNotEmpty) ...[
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                runSpacing: 4,
                children: hospital.facilities.take(3).map((facility) {
                  return Chip(
                    label: Text(
                      facility,
                      style: const TextStyle(fontSize: 11),
                    ),
                    backgroundColor: AppColors.primary.withValues(alpha: 0.1),
                    padding: EdgeInsets.zero,
                  );
                }).toList(),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

