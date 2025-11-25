import 'package:flutter/material.dart';
import 'package:flutter_application_1/core/themes/colors.dart';
import 'package:flutter_application_1/core/themes/text_styles.dart';
import 'package:url_launcher/url_launcher.dart';

class EmergencyHospitalsScreen extends StatefulWidget {
  const EmergencyHospitalsScreen({super.key});

  @override
  State<EmergencyHospitalsScreen> createState() => _EmergencyHospitalsScreenState();
}

class _EmergencyHospitalsScreenState extends State<EmergencyHospitalsScreen> {
  String? _currentLocation;
  bool _isLoadingLocation = true;
  bool _isSearchingHospitals = false;
  final TextEditingController _searchController = TextEditingController();
  List<Map<String, dynamic>> _filteredHospitals = [];
  List<Map<String, dynamic>> _hospitals = [];
  String _viewMode = 'list'; // 'list' or 'map'

  // Sample dental hospitals in Sri Lanka - will be replaced with Google Places API results
  final List<Map<String, dynamic>> _defaultHospitals = [
    {
      'name': 'National Hospital of Sri Lanka - Dental Unit',
      'address': 'Colombo 07, Sri Lanka',
      'phone': '+94 11 269 1111',
      'distance': '2.5 km',
      'latitude': 6.9271,
      'longitude': 79.8612,
      'is24Hours': true,
    },
    {
      'name': 'Lanka Hospitals - Dental Department',
      'address': 'Colombo 05, Sri Lanka',
      'phone': '+94 11 543 0000',
      'distance': '3.8 km',
      'latitude': 6.9018,
      'longitude': 79.8576,
      'is24Hours': true,
    },
    {
      'name': 'Asiri Central Hospital - Dental Clinic',
      'address': 'Colombo 05, Sri Lanka',
      'phone': '+94 11 452 2000',
      'distance': '4.2 km',
      'latitude': 6.9042,
      'longitude': 79.8601,
      'is24Hours': false,
    },
    {
      'name': 'Nawaloka Hospital - Dental Unit',
      'address': 'Colombo 02, Sri Lanka',
      'phone': '+94 11 577 7777',
      'distance': '5.1 km',
      'latitude': 6.9276,
      'longitude': 79.8442,
      'is24Hours': true,
    },
    {
      'name': 'Durdans Hospital - Dental Care',
      'address': 'Colombo 03, Sri Lanka',
      'phone': '+94 11 214 0000',
      'distance': '6.3 km',
      'latitude': 6.9102,
      'longitude': 79.8478,
      'is24Hours': true,
    },
  ];

  @override
  void initState() {
    super.initState();
    _getCurrentLocation();
    _hospitals = _defaultHospitals;
    _filteredHospitals = _hospitals;
    _searchController.addListener(_onSearchChanged);
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _onSearchChanged() {
    final query = _searchController.text.toLowerCase().trim();
    setState(() {
      if (query.isEmpty) {
        _filteredHospitals = _hospitals;
      } else {
        // Check if it's a location search (contains location keywords)
        if (_isLocationQuery(query)) {
          _searchHospitalsByLocation(query);
        } else {
          // Regular hospital name/address search
          _filteredHospitals = _hospitals.where((hospital) {
            final name = hospital['name'].toString().toLowerCase();
            final address = hospital['address'].toString().toLowerCase();
            return name.contains(query) || address.contains(query);
          }).toList();
        }
      }
    });
  }

  bool _isLocationQuery(String query) {
    // Check if query contains location-related keywords
    final locationKeywords = ['colombo', 'kandy', 'galle', 'jaffna', 'anuradhapura', 'kurunegala', 'ratnapura', 'badulla', 'matara', 'negombo', 'kalutara', 'batticaloa', 'trincomalee'];
    return locationKeywords.any((keyword) => query.contains(keyword));
  }

  Future<void> _searchHospitalsByLocation(String locationQuery) async {
    setState(() {
      _isSearchingHospitals = true;
    });

    try {
      // In real app, use Google Places API to search for dental hospitals
      // For now, filter by location in address
      await Future.delayed(const Duration(milliseconds: 500)); // Simulate API call
      
      // Filter hospitals by location
      final filtered = _defaultHospitals.where((hospital) {
        final address = hospital['address'].toString().toLowerCase();
        return address.contains(locationQuery);
      }).toList();

      // If no results, show hospitals for that location (simulated)
      if (filtered.isEmpty) {
        _hospitals = _getHospitalsForLocation(locationQuery);
      } else {
        _hospitals = filtered;
      }

      setState(() {
        _filteredHospitals = _hospitals;
        _isSearchingHospitals = false;
      });
    } catch (e) {
      setState(() {
        _isSearchingHospitals = false;
      });
      _showSnackBar('Error searching hospitals: $e');
    }
  }

  List<Map<String, dynamic>> _getHospitalsForLocation(String location) {
    // Simulated data for different locations
    // In real app, this would come from Google Places API
    final locationLower = location.toLowerCase();
    
    if (locationLower.contains('kandy')) {
      return [
        {
          'name': 'Kandy General Hospital - Dental Unit',
          'address': 'Kandy, Sri Lanka',
          'phone': '+94 81 223 3333',
          'distance': '1.2 km',
          'latitude': 7.2906,
          'longitude': 80.6337,
          'is24Hours': true,
        },
        {
          'name': 'Asiri Central Hospital Kandy',
          'address': 'Kandy, Sri Lanka',
          'phone': '+94 81 223 4444',
          'distance': '2.5 km',
          'latitude': 7.2950,
          'longitude': 80.6400,
          'is24Hours': false,
        },
      ];
    } else if (locationLower.contains('galle')) {
      return [
        {
          'name': 'Galle General Hospital - Dental Clinic',
          'address': 'Galle, Sri Lanka',
          'phone': '+94 91 223 5555',
          'distance': '0.8 km',
          'latitude': 6.0329,
          'longitude': 80.2170,
          'is24Hours': true,
        },
      ];
    }
    
    // Default: return Colombo hospitals
    return _defaultHospitals;
  }

  Future<void> _getCurrentLocation() async {
    // In a real app, use geolocator package to get actual location
    // For now, simulate getting location
    await Future.delayed(const Duration(seconds: 1));
    setState(() {
      _currentLocation = 'Colombo, Sri Lanka';
      _isLoadingLocation = false;
    });
  }

  void _showLocationSearchDialog() {
    final locationController = TextEditingController();
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Row(
          children: [
            const Icon(Icons.edit_location, color: AppColors.primary),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                'Search Location',
                style: TextStyles.heading4,
              ),
            ),
          ],
        ),
        content: TextField(
          controller: locationController,
          decoration: InputDecoration(
            hintText: 'Enter location (e.g., Colombo, Kandy, Galle)',
            prefixIcon: const Icon(Icons.location_on),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
            ),
          ),
          autofocus: true,
          onSubmitted: (value) {
            if (value.trim().isNotEmpty) {
              _updateLocationAndSearchHospitals(value.trim());
              Navigator.pop(context);
            }
          },
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              if (locationController.text.trim().isNotEmpty) {
                _updateLocationAndSearchHospitals(locationController.text.trim());
                Navigator.pop(context);
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
            ),
            child: const Text('Search'),
          ),
        ],
      ),
    );
  }

  Future<void> _updateLocationAndSearchHospitals(String location) async {
    setState(() {
      _currentLocation = location;
      _isSearchingHospitals = true;
    });

    // In real app, geocode the location to get lat/lng
    // For now, simulate geocoding
    await Future.delayed(const Duration(milliseconds: 500));
    
    // Get hospitals for this location
    final locationLower = location.toLowerCase();
    if (locationLower.contains('colombo')) {
      _hospitals = _defaultHospitals;
    } else if (locationLower.contains('kandy')) {
      _hospitals = _getHospitalsForLocation('kandy');
    } else if (locationLower.contains('galle')) {
      _hospitals = _getHospitalsForLocation('galle');
    } else {
      // Default to Colombo
      _hospitals = _defaultHospitals;
    }

    setState(() {
      _filteredHospitals = _hospitals;
      _isSearchingHospitals = false;
    });

    _showSnackBar('Found ${_hospitals.length} dental hospitals near $location');
  }

  Future<void> _openGoogleMaps(double lat, double lng, String name) async {
    try {
      // Open Google Maps with the hospital location
      final url = Uri.parse('https://www.google.com/maps/search/?api=1&query=$lat,$lng');
      if (await canLaunchUrl(url)) {
        await launchUrl(url, mode: LaunchMode.externalApplication);
      } else {
        _showSnackBar('Cannot open Google Maps');
      }
    } catch (e) {
      _showSnackBar('Error opening Google Maps: $e');
    }
  }

  Future<void> _makePhoneCall(String phoneNumber) async {
    try {
      final uri = Uri(scheme: 'tel', path: phoneNumber.replaceAll(' ', ''));
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri);
      } else {
        _showSnackBar('Cannot make phone call');
      }
    } catch (e) {
      _showSnackBar('Error making phone call: $e');
    }
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
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: AppColors.white),
          onPressed: () {
            Navigator.pop(context);
          },
        ),
        title: const Text('Nearby Dental Hospitals'),
        backgroundColor: AppColors.primary,
        foregroundColor: AppColors.white,
        actions: [
          IconButton(
            icon: Icon(_viewMode == 'map' ? Icons.list : Icons.map),
            onPressed: () {
              setState(() {
                _viewMode = _viewMode == 'list' ? 'map' : 'list';
              });
            },
            tooltip: _viewMode == 'list' ? 'Show Map' : 'Show List',
          ),
        ],
      ),
      body: _isLoadingLocation
          ? const Center(child: CircularProgressIndicator())
          : Column(
              children: [
                // Search Bar
                Container(
                  padding: const EdgeInsets.all(16),
                  child: TextField(
                    controller: _searchController,
                    decoration: InputDecoration(
                      hintText: 'Search hospitals or location (e.g., Colombo, Kandy)...',
                      prefixIcon: const Icon(Icons.search),
                      suffixIcon: _searchController.text.isNotEmpty
                          ? IconButton(
                              icon: const Icon(Icons.clear),
                              onPressed: () {
                                _searchController.clear();
                                setState(() {
                                  _hospitals = _defaultHospitals;
                                  _filteredHospitals = _hospitals;
                                  _currentLocation = 'Colombo, Sri Lanka';
                                });
                              },
                            )
                          : null,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      filled: true,
                      fillColor: Colors.grey[100],
                    ),
                    onSubmitted: (value) {
                      if (value.trim().isNotEmpty) {
                        _updateLocationAndSearchHospitals(value.trim());
                      }
                    },
                  ),
                ),
                // Current Location Card
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(16),
                  margin: const EdgeInsets.symmetric(horizontal: 16),
                  decoration: BoxDecoration(
                    color: AppColors.primaryLight.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppColors.primaryLight),
                  ),
                  child: Row(
                    children: [
                      Icon(Icons.location_on, color: AppColors.primary, size: 28),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Your Location',
                              style: TextStyles.bodySmall.copyWith(
                                color: AppColors.textSecondary,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              _currentLocation ?? 'Unknown',
                              style: TextStyles.bodyMedium.copyWith(
                                fontWeight: FontWeight.w600,
                                color: AppColors.primary,
                              ),
                            ),
                          ],
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.edit_location),
                        onPressed: () {
                          _showLocationSearchDialog();
                        },
                        tooltip: 'Change location',
                      ),
                    ],
                  ),
                ),
                // View Toggle and Results
                if (_isSearchingHospitals)
                  const Padding(
                    padding: EdgeInsets.all(16.0),
                    child: CircularProgressIndicator(),
                  )
                else if (_viewMode == 'map')
                  Expanded(
                    child: _buildMapView(),
                  )
                else
                  Expanded(
                    child: _filteredHospitals.isEmpty
                        ? Center(
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(
                                  Icons.search_off,
                                  size: 64,
                                  color: Colors.grey[400],
                                ),
                                const SizedBox(height: 16),
                                Text(
                                  'No hospitals found',
                                  style: TextStyles.bodyLarge.copyWith(
                                    color: Colors.grey[600],
                                  ),
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  'Try searching for a location (e.g., Colombo, Kandy)',
                                  style: TextStyles.bodySmall.copyWith(
                                    color: Colors.grey[500],
                                  ),
                                  textAlign: TextAlign.center,
                                ),
                                const SizedBox(height: 16),
                                ElevatedButton.icon(
                                  onPressed: () {
                                    _showLocationSearchDialog();
                                  },
                                  icon: const Icon(Icons.location_on),
                                  label: const Text('Search Location'),
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: AppColors.primary,
                                  ),
                                ),
                              ],
                            ),
                          )
                        : ListView.builder(
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                            itemCount: _filteredHospitals.length,
                            itemBuilder: (context, index) {
                              final hospital = _filteredHospitals[index];
                              return _buildHospitalCard(hospital);
                            },
                          ),
                  ),
              ],
            ),
    );
  }

  Widget _buildHospitalCard(Map<String, dynamic> hospital) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              hospital['name'],
                              style: TextStyles.heading4.copyWith(
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                          if (hospital['is24Hours'] == true)
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color: Colors.green.withValues(alpha: 0.2),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Icon(Icons.access_time, size: 14, color: Colors.green[700]),
                                  const SizedBox(width: 4),
                                  Text(
                                    '24/7',
                                    style: TextStyles.bodyXSmall.copyWith(
                                      color: Colors.green[700],
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          Icon(Icons.location_on, size: 16, color: AppColors.textSecondary),
                          const SizedBox(width: 4),
                          Expanded(
                            child: Text(
                              hospital['address'],
                              style: TextStyles.bodySmall,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          Icon(Icons.straighten, size: 16, color: AppColors.textSecondary),
                          const SizedBox(width: 4),
                          Text(
                            hospital['distance'],
                            style: TextStyles.bodySmall,
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () {
                      _openGoogleMaps(
                        hospital['latitude'],
                        hospital['longitude'],
                        hospital['name'],
                      );
                    },
                    icon: const Icon(Icons.map, size: 18),
                    label: const Text('View on Map'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppColors.primary,
                      side: BorderSide(color: AppColors.primary),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: () {
                      _makePhoneCall(hospital['phone']);
                    },
                    icon: const Icon(Icons.phone, size: 18),
                    label: const Text('Call'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      foregroundColor: AppColors.white,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            InkWell(
              onTap: () {
                _makePhoneCall(hospital['phone']);
              },
              child: Padding(
                padding: const EdgeInsets.symmetric(vertical: 8),
                child: Row(
                  children: [
                    Icon(Icons.phone, size: 16, color: AppColors.primary),
                    const SizedBox(width: 8),
                    Text(
                      hospital['phone'],
                      style: TextStyles.bodyMedium.copyWith(
                        color: AppColors.primary,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMapView() {
    // In real app, use google_maps_flutter package to show actual map
    // For now, show a placeholder with hospital markers
    return Stack(
      children: [
        // Placeholder for Google Maps
        Container(
          color: Colors.grey[200],
          child: Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  Icons.map,
                  size: 64,
                  color: Colors.grey[400],
                ),
                const SizedBox(height: 16),
                Text(
                  'Map View',
                  style: TextStyles.heading4.copyWith(
                    color: Colors.grey[600],
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  '${_filteredHospitals.length} hospitals found',
                  style: TextStyles.bodyMedium.copyWith(
                    color: Colors.grey[500],
                  ),
                ),
                const SizedBox(height: 24),
                ElevatedButton.icon(
                  onPressed: () {
                    // Open all hospitals in Google Maps
                    if (_filteredHospitals.isNotEmpty) {
                      final firstHospital = _filteredHospitals.first;
                      _openGoogleMaps(
                        firstHospital['latitude'],
                        firstHospital['longitude'],
                        'Dental Hospitals',
                      );
                    }
                  },
                  icon: const Icon(Icons.open_in_new),
                  label: const Text('Open in Google Maps'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                  ),
                ),
                const SizedBox(height: 16),
                const Text(
                  'Note: Full map integration requires Google Maps API key',
                  style: TextStyle(fontSize: 12, color: Colors.grey),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          ),
        ),
        // Hospital markers list overlay
        if (_filteredHospitals.isNotEmpty)
          Positioned(
            bottom: 16,
            left: 16,
            right: 16,
            child: Container(
              height: 150,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.1),
                    blurRadius: 10,
                    offset: const Offset(0, -2),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Padding(
                    padding: const EdgeInsets.all(12),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Nearby Hospitals',
                          style: TextStyles.heading4,
                        ),
                        Text(
                          '${_filteredHospitals.length} found',
                          style: TextStyles.bodySmall,
                        ),
                      ],
                    ),
                  ),
                  Expanded(
                    child: ListView.builder(
                      scrollDirection: Axis.horizontal,
                      padding: const EdgeInsets.symmetric(horizontal: 12),
                      itemCount: _filteredHospitals.length > 3 ? 3 : _filteredHospitals.length,
                      itemBuilder: (context, index) {
                        final hospital = _filteredHospitals[index];
                        return Container(
                          width: 200,
                          margin: const EdgeInsets.only(right: 8),
                          child: Card(
                            child: InkWell(
                              onTap: () {
                                _openGoogleMaps(
                                  hospital['latitude'],
                                  hospital['longitude'],
                                  hospital['name'],
                                );
                              },
                              child: Padding(
                                padding: const EdgeInsets.all(12),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Text(
                                      hospital['name'],
                                      style: TextStyles.bodyMedium.copyWith(
                                        fontWeight: FontWeight.bold,
                                      ),
                                      maxLines: 2,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      hospital['distance'],
                                      style: TextStyles.bodySmall,
                                    ),
                                    const SizedBox(height: 8),
                                    Row(
                                      children: [
                                        Expanded(
                                          child: OutlinedButton(
                                            onPressed: () {
                                              _openGoogleMaps(
                                                hospital['latitude'],
                                                hospital['longitude'],
                                                hospital['name'],
                                              );
                                            },
                                            style: OutlinedButton.styleFrom(
                                              padding: const EdgeInsets.symmetric(horizontal: 8),
                                            ),
                                            child: const Icon(Icons.map, size: 16),
                                          ),
                                        ),
                                        const SizedBox(width: 4),
                                        Expanded(
                                          child: ElevatedButton(
                                            onPressed: () {
                                              _makePhoneCall(hospital['phone']);
                                            },
                                            style: ElevatedButton.styleFrom(
                                              backgroundColor: AppColors.primary,
                                              padding: const EdgeInsets.symmetric(horizontal: 8),
                                            ),
                                            child: const Icon(Icons.phone, size: 16),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                ],
              ),
            ),
          ),
      ],
    );
  }
}

