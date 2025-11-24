import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:geolocator/geolocator.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:flutter_application_1/core/themes/colors.dart';
import 'package:flutter_application_1/core/themes/text_styles.dart';
import 'package:flutter_application_1/core/constants/app_constants.dart';
import 'package:url_launcher/url_launcher.dart';

class NearbyHospitalsMapScreen extends StatefulWidget {
  const NearbyHospitalsMapScreen({super.key});

  @override
  State<NearbyHospitalsMapScreen> createState() => _NearbyHospitalsMapScreenState();
}

class _NearbyHospitalsMapScreenState extends State<NearbyHospitalsMapScreen> {
  GoogleMapController? _mapController;
  Position? _currentPosition;
  bool _isLoading = true;
  String? _errorMessage;
  Set<Marker> _markers = {};
  List<Map<String, dynamic>> _nearbyHospitals = [];
  String? _selectedHospitalId;
  final TextEditingController _searchController = TextEditingController();
  
  // Use API key from constants
  static const double _searchRadius = 10000; // 10km radius for better coverage

  @override
  void initState() {
    super.initState();
    _getCurrentLocation();
  }

  Future<void> _getCurrentLocation() async {
    try {
      setState(() {
        _isLoading = true;
        _errorMessage = null;
      });

      // Check location permission
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        setState(() {
          _errorMessage = 'Location services are disabled. Please enable location services.';
          _isLoading = false;
        });
        return;
      }

      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          setState(() {
            _errorMessage = 'Location permissions are denied. Please enable location permissions in settings.';
            _isLoading = false;
          });
          return;
        }
      }

      if (permission == LocationPermission.deniedForever) {
        setState(() {
          _errorMessage = 'Location permissions are permanently denied. Please enable them in app settings.';
          _isLoading = false;
        });
        return;
      }

      // Get current position
      Position position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );

      setState(() {
        _currentPosition = position;
      });

      // Find nearby dental hospitals
      await _findNearbyHospitals(position.latitude, position.longitude);
    } catch (e) {
      setState(() {
        _errorMessage = 'Error getting location: ${e.toString()}';
        _isLoading = false;
      });
      debugPrint('❌ Error getting location: $e');
    }
  }

  Future<void> _findNearbyHospitals(double lat, double lng) async {
    try {
      // Check if API key is configured
      if (AppConstants.googlePlacesApiKey == 'YOUR_GOOGLE_PLACES_API_KEY') {
        // Fallback: Show sample hospitals if API key not configured
        _showSampleHospitals(lat, lng);
        return;
      }

      // Search for dental clinics/hospitals using Google Places API
      // Multiple searches to get comprehensive results
      final List<Map<String, dynamic>> allHospitals = [];
      
      // Search 1: Dentist type
      final dentistUrl = Uri.parse(
        'https://maps.googleapis.com/maps/api/place/nearbysearch/json?'
        'location=$lat,$lng&'
        'radius=$_searchRadius&'
        'type=dentist&'
        'key=${AppConstants.googlePlacesApiKey}',
      );
      
      // Search 2: Hospital type with dental keyword
      final hospitalUrl = Uri.parse(
        'https://maps.googleapis.com/maps/api/place/nearbysearch/json?'
        'location=$lat,$lng&'
        'radius=$_searchRadius&'
        'type=hospital&'
        'keyword=dental|dentist|dental clinic|dental hospital|dental care&'
        'key=${AppConstants.googlePlacesApiKey}',
      );
      
      // Search 3: Doctor type with dental keyword
      final doctorUrl = Uri.parse(
        'https://maps.googleapis.com/maps/api/place/nearbysearch/json?'
        'location=$lat,$lng&'
        'radius=$_searchRadius&'
        'type=doctor&'
        'keyword=dental|dentist|orthodontist|oral surgeon&'
        'key=${AppConstants.googlePlacesApiKey}',
      );

      // Execute all searches
      final responses = await Future.wait([
        http.get(dentistUrl),
        http.get(hospitalUrl),
        http.get(doctorUrl),
      ]);

      // Process all responses
      final Set<String> seenPlaceIds = {};
      
      for (var response in responses) {
        if (response.statusCode == 200) {
          final data = jsonDecode(response.body);
          
          if (data['status'] == 'OK' && data['results'] != null) {
            for (var place in data['results']) {
              final placeId = place['place_id'];
              
              // Skip duplicates
              if (seenPlaceIds.contains(placeId)) continue;
              seenPlaceIds.add(placeId);
              
              final name = place['name'] ?? 'Unknown';
              final location = place['geometry']?['location'];
              final lat = location?['lat'];
              final lng = location?['lng'];
              final rating = place['rating']?.toDouble() ?? 0.0;
              final address = place['vicinity'] ?? place['formatted_address'] ?? 'Address not available';
              final isOpen = place['opening_hours']?['open_now'] ?? false;
              
              // Filter to only include dental-related places
              final nameLower = name.toLowerCase();
              if (nameLower.contains('dental') || 
                  nameLower.contains('dentist') ||
                  nameLower.contains('orthodont') ||
                  nameLower.contains('oral') ||
                  place['types']?.any((type) => 
                    type.toString().toLowerCase().contains('dental') ||
                    type.toString().toLowerCase().contains('dentist')
                  ) == true) {
                
                if (lat != null && lng != null) {
                  allHospitals.add({
                    'place_id': placeId,
                    'name': name,
                    'latitude': lat,
                    'longitude': lng,
                    'rating': rating,
                    'address': address,
                    'isOpen': isOpen,
                    'phone': place['formatted_phone_number'],
                    'website': place['website'],
                  });
                }
              }
            }
          }
        }
      }

      // If no results from API, show helpful message
      if (allHospitals.isEmpty) {
        setState(() {
          _errorMessage = 'No dental hospitals found nearby. Try expanding your search area or check your location.';
          _isLoading = false;
        });
        return;
      }

      // Process results
      List<Map<String, dynamic>> hospitals = [];
      Set<Marker> markers = {};

      for (var hospital in allHospitals) {
        final placeId = hospital['place_id'];
        final name = hospital['name'];
        final lat = hospital['latitude'];
        final lng = hospital['longitude'];
        final address = hospital['address'];
        final isOpen = hospital['isOpen'];

        hospitals.add(hospital);

        // Add marker with different color for 24/7 or emergency services
        final isEmergency = isOpen || 
                           name.toLowerCase().contains('emergency') || 
                           name.toLowerCase().contains('24') ||
                           name.toLowerCase().contains('urgent');
        
        markers.add(
          Marker(
            markerId: MarkerId(placeId),
            position: LatLng(lat, lng),
            infoWindow: InfoWindow(
              title: name,
              snippet: isEmergency ? '🟢 Open Now - Emergency Available' : address,
              onTap: () {
                setState(() {
                  _selectedHospitalId = placeId;
                });
              },
            ),
            icon: BitmapDescriptor.defaultMarkerWithHue(
              isEmergency ? BitmapDescriptor.hueGreen : BitmapDescriptor.hueRed,
            ),
          ),
        );
      }

      // Sort hospitals: emergency/24/7 services first, then by rating
      hospitals.sort((a, b) {
        final aIsEmergency = a['isOpen'] == true || 
                             (a['name'] as String).toLowerCase().contains('emergency') ||
                             (a['name'] as String).toLowerCase().contains('24');
        final bIsEmergency = b['isOpen'] == true || 
                             (b['name'] as String).toLowerCase().contains('emergency') ||
                             (b['name'] as String).toLowerCase().contains('24');
        
        if (aIsEmergency && !bIsEmergency) return -1;
        if (!aIsEmergency && bIsEmergency) return 1;
        
        // If both are emergency or both are not, sort by rating
        final aRating = a['rating'] as double;
        final bRating = b['rating'] as double;
        return bRating.compareTo(aRating);
      });

      setState(() {
        _nearbyHospitals = hospitals;
        _markers = markers;
        _isLoading = false;
      });

      // Move camera to show all markers with bounds
      if (_mapController != null && hospitals.isNotEmpty) {
        if (hospitals.length == 1) {
          // Single hospital - center on it
          _mapController!.animateCamera(
            CameraUpdate.newLatLngZoom(
              LatLng(hospitals[0]['latitude'], hospitals[0]['longitude']),
              15.0,
            ),
          );
        } else {
          // Multiple hospitals - fit bounds
          double minLat = hospitals[0]['latitude'];
          double maxLat = hospitals[0]['latitude'];
          double minLng = hospitals[0]['longitude'];
          double maxLng = hospitals[0]['longitude'];
          
          for (var hospital in hospitals) {
            final lat = hospital['latitude'];
            final lng = hospital['longitude'];
            if (lat < minLat) minLat = lat;
            if (lat > maxLat) maxLat = lat;
            if (lng < minLng) minLng = lng;
            if (lng > maxLng) maxLng = lng;
          }
          
          _mapController!.animateCamera(
            CameraUpdate.newLatLngBounds(
              LatLngBounds(
                southwest: LatLng(minLat - 0.01, minLng - 0.01),
                northeast: LatLng(maxLat + 0.01, maxLng + 0.01),
              ),
              100.0,
            ),
          );
        }
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'Error searching for hospitals: ${e.toString()}';
        _isLoading = false;
      });
      debugPrint('❌ Error finding nearby hospitals: $e');
    }
  }

  void _showSnackBar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        duration: const Duration(seconds: 2),
        backgroundColor: AppColors.primary,
      ),
    );
  }

  // Fallback: Show sample hospitals when API key is not configured
  void _showSampleHospitals(double lat, double lng) {
    // Sample dental hospitals in Sri Lanka (Colombo area)
    final sampleHospitals = [
      {
        'place_id': 'sample_1',
        'name': 'National Hospital - Dental Unit',
        'latitude': 6.9271,
        'longitude': 79.8612,
        'rating': 4.5,
        'address': 'Colombo 07, Sri Lanka',
        'isOpen': true,
        'phone': '+94 11 269 1111',
      },
      {
        'place_id': 'sample_2',
        'name': 'Lanka Hospitals - Dental Department',
        'latitude': 6.9018,
        'longitude': 79.8576,
        'rating': 4.3,
        'address': 'Colombo 05, Sri Lanka',
        'isOpen': true,
        'phone': '+94 11 543 0000',
      },
      {
        'place_id': 'sample_3',
        'name': 'Asiri Central Hospital - Dental Clinic',
        'latitude': 6.9042,
        'longitude': 79.8601,
        'rating': 4.2,
        'address': 'Colombo 05, Sri Lanka',
        'isOpen': false,
        'phone': '+94 11 452 2000',
      },
      {
        'place_id': 'sample_4',
        'name': 'Nawaloka Hospital - Dental Unit',
        'latitude': 6.9276,
        'longitude': 79.8442,
        'rating': 4.4,
        'address': 'Colombo 02, Sri Lanka',
        'isOpen': true,
        'phone': '+94 11 577 7777',
      },
      {
        'place_id': 'sample_5',
        'name': 'Durdans Hospital - Dental Care',
        'latitude': 6.9102,
        'longitude': 79.8478,
        'rating': 4.1,
        'address': 'Colombo 03, Sri Lanka',
        'isOpen': true,
        'phone': '+94 11 214 0000',
      },
    ];

    // Calculate distances from user location
    final hospitalsWithDistance = sampleHospitals.map((hospital) {
      final hospitalLat = hospital['latitude'] as double;
      final hospitalLng = hospital['longitude'] as double;
      final distance = Geolocator.distanceBetween(
        lat, lng, hospitalLat, hospitalLng,
      ) / 1000; // Convert to km
      
      return {
        ...hospital,
        'distance': '${distance.toStringAsFixed(1)} km',
      };
    }).toList();

    // Sort by distance
    hospitalsWithDistance.sort((a, b) {
      final distA = double.parse((a['distance'] as String).replaceAll(' km', ''));
      final distB = double.parse((b['distance'] as String).replaceAll(' km', ''));
      return distA.compareTo(distB);
    });

    // Create markers
    Set<Marker> markers = {};
    for (var hospital in hospitalsWithDistance) {
      final placeId = hospital['place_id'] as String;
      final name = hospital['name'] as String;
      final hospitalLat = hospital['latitude'] as double;
      final hospitalLng = hospital['longitude'] as double;
      final isOpen = hospital['isOpen'] as bool;
      final address = hospital['address'] as String;

      markers.add(
        Marker(
          markerId: MarkerId(placeId),
          position: LatLng(hospitalLat, hospitalLng),
          infoWindow: InfoWindow(
            title: name,
            snippet: isOpen ? '🟢 Open Now' : address,
            onTap: () {
              setState(() {
                _selectedHospitalId = placeId;
              });
              _showSampleHospitalDetails(hospital);
            },
          ),
          icon: BitmapDescriptor.defaultMarkerWithHue(
            isOpen ? BitmapDescriptor.hueGreen : BitmapDescriptor.hueRed,
          ),
        ),
      );
    }

    setState(() {
      _nearbyHospitals = hospitalsWithDistance;
      _markers = markers;
      _isLoading = false;
    });

    // Show info banner
    _showSnackBar('Showing sample hospitals. Configure API key for real-time results.');

    // Move camera to show all markers
    if (_mapController != null && hospitalsWithDistance.isNotEmpty) {
      if (hospitalsWithDistance.length == 1) {
        _mapController!.animateCamera(
          CameraUpdate.newLatLngZoom(
            LatLng(
              hospitalsWithDistance[0]['latitude'] as double,
              hospitalsWithDistance[0]['longitude'] as double,
            ),
            15.0,
          ),
        );
      } else {
        double minLat = hospitalsWithDistance[0]['latitude'] as double;
        double maxLat = hospitalsWithDistance[0]['latitude'] as double;
        double minLng = hospitalsWithDistance[0]['longitude'] as double;
        double maxLng = hospitalsWithDistance[0]['longitude'] as double;
        
        for (var hospital in hospitalsWithDistance) {
          final hospitalLat = hospital['latitude'] as double;
          final hospitalLng = hospital['longitude'] as double;
          if (hospitalLat < minLat) minLat = hospitalLat;
          if (hospitalLat > maxLat) maxLat = hospitalLat;
          if (hospitalLng < minLng) minLng = hospitalLng;
          if (hospitalLng > maxLng) maxLng = hospitalLng;
        }
        
        _mapController!.animateCamera(
          CameraUpdate.newLatLngBounds(
            LatLngBounds(
              southwest: LatLng(minLat - 0.01, minLng - 0.01),
              northeast: LatLng(maxLat + 0.01, maxLng + 0.01),
            ),
            100.0,
          ),
        );
      }
    }
  }

  void _showSampleHospitalDetails(Map<String, dynamic> hospital) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => Container(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(
                    hospital['name'] ?? 'Unknown',
                    style: TextStyles.heading4.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.orange.withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    'Sample Data',
                    style: TextStyles.bodySmall.copyWith(
                      color: Colors.orange[700],
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            if (hospital['rating'] != null) ...[
              Row(
                children: [
                  const Icon(Icons.star, color: Colors.amber, size: 20),
                  const SizedBox(width: 4),
                  Text(
                    '${hospital['rating']}',
                    style: TextStyles.bodyMedium,
                  ),
                ],
              ),
              const SizedBox(height: 8),
            ],
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Icon(Icons.location_on, size: 20, color: Colors.grey),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    hospital['address'] ?? 'Address not available',
                    style: TextStyles.bodySmall,
                  ),
                ),
              ],
            ),
            if (hospital['distance'] != null) ...[
              const SizedBox(height: 8),
              Row(
                children: [
                  const Icon(Icons.straighten, size: 20, color: Colors.grey),
                  const SizedBox(width: 8),
                  Text(
                    hospital['distance'],
                    style: TextStyles.bodySmall,
                  ),
                ],
              ),
            ],
            if (hospital['phone'] != null) ...[
              const SizedBox(height: 8),
              InkWell(
                onTap: () async {
                  final phone = hospital['phone'];
                  final uri = Uri.parse('tel:$phone');
                  if (await canLaunchUrl(uri)) {
                    await launchUrl(uri);
                  }
                },
                child: Row(
                  children: [
                    const Icon(Icons.phone, size: 20, color: Colors.grey),
                    const SizedBox(width: 8),
                    Text(
                      hospital['phone'],
                      style: TextStyles.bodySmall.copyWith(
                        color: AppColors.primary,
                      ),
                    ),
                  ],
                ),
              ),
            ],
            if (hospital['isOpen'] != null) ...[
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: (hospital['isOpen'] as bool)
                      ? Colors.green.withValues(alpha: 0.2)
                      : Colors.red.withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      (hospital['isOpen'] as bool) ? Icons.check_circle : Icons.cancel,
                      size: 16,
                      color: (hospital['isOpen'] as bool) ? Colors.green[700] : Colors.red[700],
                    ),
                    const SizedBox(width: 4),
                    Text(
                      (hospital['isOpen'] as bool) ? '🟢 Open Now' : 'Closed',
                      style: TextStyles.bodySmall.copyWith(
                        color: (hospital['isOpen'] as bool) ? Colors.green[700] : Colors.red[700],
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
            ],
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.dentalGreen,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                children: [
                  Icon(Icons.info_outline, size: 20, color: AppColors.primary),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'This is sample data. Configure Google Places API key for real-time hospital locations.',
                      style: TextStyles.bodySmall.copyWith(
                        color: AppColors.primary,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {
                  Navigator.pop(context);
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  padding: const EdgeInsets.symmetric(vertical: 12),
                ),
                child: const Text('Close'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _getPlaceDetails(String placeId) async {
    try {
      if (AppConstants.googlePlacesApiKey == 'YOUR_GOOGLE_PLACES_API_KEY') {
        _showSnackBar('API key not configured');
        return;
      }
      
      final url = Uri.parse(
        'https://maps.googleapis.com/maps/api/place/details/json?'
        'place_id=$placeId&'
        'fields=name,formatted_address,formatted_phone_number,website,rating,opening_hours&'
        'key=${AppConstants.googlePlacesApiKey}',
      );

      final response = await http.get(url);
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['status'] == 'OK' && data['result'] != null) {
          _showHospitalDetails(data['result']);
        }
      }
    } catch (e) {
      debugPrint('❌ Error getting place details: $e');
    }
  }

  void _showHospitalDetails(Map<String, dynamic> details) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => Container(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              details['name'] ?? 'Unknown',
              style: TextStyles.heading4.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 12),
            if (details['rating'] != null) ...[
              Row(
                children: [
                  const Icon(Icons.star, color: Colors.amber, size: 20),
                  const SizedBox(width: 4),
                  Text(
                    '${details['rating']}',
                    style: TextStyles.bodyMedium,
                  ),
                ],
              ),
              const SizedBox(height: 8),
            ],
            if (details['formatted_address'] != null) ...[
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Icon(Icons.location_on, size: 20, color: Colors.grey),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      details['formatted_address'],
                      style: TextStyles.bodySmall,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
            ],
            if (details['formatted_phone_number'] != null) ...[
              InkWell(
                onTap: () async {
                  final phone = details['formatted_phone_number'];
                  final uri = Uri.parse('tel:$phone');
                  if (await canLaunchUrl(uri)) {
                    await launchUrl(uri);
                  }
                },
                child: Row(
                  children: [
                    const Icon(Icons.phone, size: 20, color: Colors.grey),
                    const SizedBox(width: 8),
                    Text(
                      details['formatted_phone_number'],
                      style: TextStyles.bodySmall.copyWith(
                        color: AppColors.primary,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 8),
            ],
            if (details['website'] != null) ...[
              InkWell(
                onTap: () async {
                  final website = details['website'];
                  final uri = Uri.parse(website);
                  if (await canLaunchUrl(uri)) {
                    await launchUrl(uri, mode: LaunchMode.externalApplication);
                  }
                },
                child: Row(
                  children: [
                    const Icon(Icons.language, size: 20, color: Colors.grey),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'Visit Website',
                        style: TextStyles.bodySmall.copyWith(
                          color: AppColors.primary,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
            const SizedBox(height: 20),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {
                  Navigator.pop(context);
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  padding: const EdgeInsets.symmetric(vertical: 12),
                ),
                child: const Text('Close'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Find Dental Hospitals'),
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () {
              if (_currentPosition != null) {
                _findNearbyHospitals(
                  _currentPosition!.latitude,
                  _currentPosition!.longitude,
                );
              } else {
                _getCurrentLocation();
              }
            },
            tooltip: 'Refresh',
          ),
        ],
      ),
      body: _buildBody(),
      floatingActionButton: _currentPosition != null
          ? Column(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                FloatingActionButton(
                  heroTag: "refresh",
                  onPressed: () {
                    if (_currentPosition != null) {
                      _findNearbyHospitals(
                        _currentPosition!.latitude,
                        _currentPosition!.longitude,
                      );
                    }
                  },
                  backgroundColor: AppColors.primary,
                  child: const Icon(Icons.refresh),
                ),
                const SizedBox(height: 12),
                FloatingActionButton(
                  heroTag: "location",
                  onPressed: () {
                    _mapController?.animateCamera(
                      CameraUpdate.newCameraPosition(
                        CameraPosition(
                          target: LatLng(
                            _currentPosition!.latitude,
                            _currentPosition!.longitude,
                          ),
                          zoom: 15.0,
                        ),
                      ),
                    );
                  },
                  backgroundColor: AppColors.primary,
                  child: const Icon(Icons.my_location),
                ),
              ],
            )
          : null,
    );
  }

  Widget _buildBody() {
    if (_isLoading) {
      return const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            CircularProgressIndicator(),
            SizedBox(height: 16),
            Text('Getting your location...'),
          ],
        ),
      );
    }

    if (_errorMessage != null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.error_outline,
                size: 64,
                color: AppColors.error,
              ),
              const SizedBox(height: 16),
              Text(
                _errorMessage!,
                style: TextStyles.bodyMedium.copyWith(
                  color: AppColors.error,
                ),
                textAlign: TextAlign.center,
              ),
              if (_errorMessage!.contains('API key')) ...[
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppColors.dentalGreen,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Setup Instructions:',
                        style: TextStyles.bodyMedium.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        '1. Get API key from Google Cloud Console\n'
                        '2. Enable Places API\n'
                        '3. Add key to app_constants.dart\n'
                        '4. Restart the app',
                        style: TextStyles.bodySmall,
                      ),
                    ],
                  ),
                ),
              ],
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: _getCurrentLocation,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                ),
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
      );
    }

    if (_currentPosition == null) {
      return const Center(
        child: Text('Unable to get your location'),
      );
    }

    return Stack(
      children: [
        GoogleMap(
          initialCameraPosition: CameraPosition(
            target: LatLng(
              _currentPosition!.latitude,
              _currentPosition!.longitude,
            ),
            zoom: 13.0,
          ),
          onMapCreated: (GoogleMapController controller) {
            _mapController = controller;
          },
          markers: _markers,
          myLocationEnabled: true,
          myLocationButtonEnabled: false,
          mapType: MapType.normal,
          onTap: (LatLng position) {
            setState(() {
              _selectedHospitalId = null;
            });
          },
        ),
        // Search Bar
        Positioned(
          top: 16,
          left: 16,
          right: 16,
          child: Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.1),
                  blurRadius: 10,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: 'Search hospitals...',
                prefixIcon: const Icon(Icons.search, color: AppColors.primary),
                suffixIcon: _searchController.text.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear, color: Colors.grey),
                        onPressed: () {
                          _searchController.clear();
                          setState(() {});
                          if (_currentPosition != null) {
                            _findNearbyHospitals(
                              _currentPosition!.latitude,
                              _currentPosition!.longitude,
                            );
                          }
                        },
                      )
                    : null,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide.none,
                ),
                filled: true,
                fillColor: Colors.white,
                contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              ),
              onSubmitted: (value) {
                _searchHospitals(value);
              },
              onChanged: (value) {
                setState(() {});
              },
            ),
          ),
        ),
        if (_nearbyHospitals.isNotEmpty)
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: Container(
              height: 200,
              decoration: BoxDecoration(
                color: Colors.white,
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.1),
                    blurRadius: 10,
                    offset: const Offset(0, -5),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Nearby Hospitals (${_nearbyHospitals.length})',
                          style: TextStyles.heading4.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        if (_nearbyHospitals.any((h) => h['isOpen'] == true))
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
                                  '24/7 Available',
                                  style: TextStyles.bodySmall.copyWith(
                                    color: Colors.green[700],
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ],
                            ),
                          ),
                      ],
                    ),
                  ),
                  Expanded(
                    child: ListView.builder(
                      scrollDirection: Axis.horizontal,
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      itemCount: _nearbyHospitals.length,
                      itemBuilder: (context, index) {
                        final hospital = _nearbyHospitals[index];
                        return _buildHospitalCard(hospital);
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

  Widget _buildHospitalCard(Map<String, dynamic> hospital) {
    return Container(
      width: 280,
      margin: const EdgeInsets.only(right: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: _selectedHospitalId == hospital['place_id']
              ? AppColors.primary
              : Colors.grey[300]!,
          width: _selectedHospitalId == hospital['place_id'] ? 2 : 1,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.1),
            blurRadius: 5,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: InkWell(
        onTap: () {
          setState(() {
            _selectedHospitalId = hospital['place_id'];
          });
          _getPlaceDetails(hospital['place_id']);
          _mapController?.animateCamera(
            CameraUpdate.newLatLng(
              LatLng(
                hospital['latitude'],
                hospital['longitude'],
              ),
            ),
          );
        },
        child: Padding(
          padding: const EdgeInsets.all(12.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                hospital['name'],
                style: TextStyles.bodyMedium.copyWith(
                  fontWeight: FontWeight.bold,
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 8),
              if (hospital['rating'] > 0) ...[
                Row(
                  children: [
                    const Icon(Icons.star, color: Colors.amber, size: 16),
                    const SizedBox(width: 4),
                    Text(
                      '${hospital['rating']}',
                      style: TextStyles.bodySmall,
                    ),
                  ],
                ),
                const SizedBox(height: 8),
              ],
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Icon(
                    Icons.location_on,
                    size: 16,
                    color: Colors.grey[600],
                  ),
                  const SizedBox(width: 4),
                  Expanded(
                    child: Text(
                      hospital['address'],
                      style: TextStyles.bodySmall.copyWith(
                        color: Colors.grey[600],
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
              if (hospital['isOpen'] != null) ...[
                const SizedBox(height: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: hospital['isOpen'] 
                        ? Colors.green.withValues(alpha: 0.2) 
                        : Colors.red.withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        hospital['isOpen'] ? Icons.check_circle : Icons.cancel,
                        size: 16,
                        color: hospital['isOpen'] ? Colors.green[700] : Colors.red[700],
                      ),
                      const SizedBox(width: 4),
                      Text(
                        hospital['isOpen'] ? '🟢 Open Now - Emergency Available' : 'Closed',
                        style: TextStyles.bodySmall.copyWith(
                          color: hospital['isOpen'] ? Colors.green[700] : Colors.red[700],
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _searchHospitals(String query) async {
    if (query.trim().isEmpty) {
      // If search is empty, show nearby hospitals
      if (_currentPosition != null) {
        _findNearbyHospitals(
          _currentPosition!.latitude,
          _currentPosition!.longitude,
        );
      }
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      if (AppConstants.googlePlacesApiKey == 'YOUR_GOOGLE_PLACES_API_KEY') {
        // Fallback: Search in sample hospitals
        _searchSampleHospitals(query);
        return;
      }

      // Use Google Places Text Search API
      final searchUrl = Uri.parse(
        'https://maps.googleapis.com/maps/api/place/textsearch/json?'
        'query=$query dental hospital sri lanka&'
        'key=${AppConstants.googlePlacesApiKey}',
      );

      final response = await http.get(searchUrl);
      
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        
        if (data['status'] == 'OK' && data['results'] != null) {
          final List<Map<String, dynamic>> searchResults = [];
          final Set<String> seenPlaceIds = {};
          final Set<Marker> newMarkers = {};

          for (var place in data['results']) {
            final placeId = place['place_id'];
            
            // Skip duplicates
            if (seenPlaceIds.contains(placeId)) continue;
            seenPlaceIds.add(placeId);

            final name = place['name'] ?? 'Unknown';
            final location = place['geometry']?['location'];
            final lat = location?['lat'];
            final lng = location?['lng'];
            final rating = place['rating']?.toDouble() ?? 0.0;
            final address = place['formatted_address'] ?? place['vicinity'] ?? 'Address not available';
            final isOpen = place['opening_hours']?['open_now'] ?? false;

            // Filter to only include dental-related places
            final nameLower = name.toLowerCase();
            if (nameLower.contains('dental') || 
                nameLower.contains('dentist') ||
                nameLower.contains('orthodont') ||
                nameLower.contains('oral') ||
                place['types']?.any((type) => 
                  type.toString().toLowerCase().contains('dental') ||
                  type.toString().toLowerCase().contains('dentist')
                ) == true) {
              
              if (lat != null && lng != null) {
                // Calculate distance if we have current position
                double? distance;
                if (_currentPosition != null) {
                  distance = Geolocator.distanceBetween(
                    _currentPosition!.latitude,
                    _currentPosition!.longitude,
                    lat,
                    lng,
                  ) / 1000; // Convert to km
                }

                searchResults.add({
                  'place_id': placeId,
                  'name': name,
                  'latitude': lat,
                  'longitude': lng,
                  'rating': rating,
                  'address': address,
                  'isOpen': isOpen,
                  'phone': place['formatted_phone_number'],
                  'website': place['website'],
                  'distance': distance != null ? '${distance.toStringAsFixed(1)} km' : null,
                });

                // Create marker
                newMarkers.add(
                  Marker(
                    markerId: MarkerId(placeId),
                    position: LatLng(lat, lng),
                    infoWindow: InfoWindow(
                      title: name,
                      snippet: isOpen ? '🟢 Open Now' : address,
                      onTap: () {
                        setState(() {
                          _selectedHospitalId = placeId;
                        });
                        _getPlaceDetails(placeId);
                      },
                    ),
                    icon: BitmapDescriptor.defaultMarkerWithHue(
                      isOpen ? BitmapDescriptor.hueGreen : BitmapDescriptor.hueRed,
                    ),
                  ),
                );
              }
            }
          }

          // Sort by distance if available
          if (_currentPosition != null) {
            searchResults.sort((a, b) {
              final distA = a['distance'] != null 
                  ? double.parse((a['distance'] as String).replaceAll(' km', ''))
                  : double.infinity;
              final distB = b['distance'] != null
                  ? double.parse((b['distance'] as String).replaceAll(' km', ''))
                  : double.infinity;
              return distA.compareTo(distB);
            });
          }

          setState(() {
            _nearbyHospitals = searchResults;
            _markers = newMarkers;
            _isLoading = false;
          });

          // Move camera to show all markers
          if (_mapController != null && searchResults.isNotEmpty) {
            if (searchResults.length == 1) {
              _mapController!.animateCamera(
                CameraUpdate.newLatLngZoom(
                  LatLng(
                    searchResults[0]['latitude'] as double,
                    searchResults[0]['longitude'] as double,
                  ),
                  15.0,
                ),
              );
            } else {
              double minLat = searchResults[0]['latitude'] as double;
              double maxLat = searchResults[0]['latitude'] as double;
              double minLng = searchResults[0]['longitude'] as double;
              double maxLng = searchResults[0]['longitude'] as double;
              
              for (var hospital in searchResults) {
                final hospitalLat = hospital['latitude'] as double;
                final hospitalLng = hospital['longitude'] as double;
                if (hospitalLat < minLat) minLat = hospitalLat;
                if (hospitalLat > maxLat) maxLat = hospitalLat;
                if (hospitalLng < minLng) minLng = hospitalLng;
                if (hospitalLng > maxLng) maxLng = hospitalLng;
              }
              
              _mapController!.animateCamera(
                CameraUpdate.newLatLngBounds(
                  LatLngBounds(
                    southwest: LatLng(minLat - 0.01, minLng - 0.01),
                    northeast: LatLng(maxLat + 0.01, maxLng + 0.01),
                  ),
                  100.0,
                ),
              );
            }
          }

          if (searchResults.isEmpty) {
            _showSnackBar('No dental hospitals found for "$query"');
          } else {
            _showSnackBar('Found ${searchResults.length} hospital(s)');
          }
        } else {
          setState(() {
            _errorMessage = 'No results found for "$query"';
            _isLoading = false;
          });
        }
      } else {
        setState(() {
            _errorMessage = 'Error searching hospitals. Please try again.';
            _isLoading = false;
          });
      }
    } catch (e) {
      debugPrint('❌ Error searching hospitals: $e');
      setState(() {
        _errorMessage = 'Error searching hospitals: $e';
        _isLoading = false;
      });
    }
  }

  void _searchSampleHospitals(String query) {
    final queryLower = query.toLowerCase();
    final sampleHospitals = [
      {
        'place_id': 'sample_1',
        'name': 'National Hospital - Dental Unit',
        'latitude': 6.9271,
        'longitude': 79.8612,
        'rating': 4.5,
        'address': 'Colombo 07, Sri Lanka',
        'isOpen': true,
        'phone': '+94 11 269 1111',
      },
      {
        'place_id': 'sample_2',
        'name': 'Lanka Hospitals - Dental Department',
        'latitude': 6.9018,
        'longitude': 79.8576,
        'rating': 4.3,
        'address': 'Colombo 05, Sri Lanka',
        'isOpen': true,
        'phone': '+94 11 543 0000',
      },
      {
        'place_id': 'sample_3',
        'name': 'Asiri Central Hospital - Dental Clinic',
        'latitude': 6.9042,
        'longitude': 79.8601,
        'rating': 4.2,
        'address': 'Colombo 05, Sri Lanka',
        'isOpen': false,
        'phone': '+94 11 452 2000',
      },
      {
        'place_id': 'sample_4',
        'name': 'Nawaloka Hospital - Dental Unit',
        'latitude': 6.9276,
        'longitude': 79.8442,
        'rating': 4.4,
        'address': 'Colombo 02, Sri Lanka',
        'isOpen': true,
        'phone': '+94 11 577 7777',
      },
      {
        'place_id': 'sample_5',
        'name': 'Durdans Hospital - Dental Care',
        'latitude': 6.9102,
        'longitude': 79.8478,
        'rating': 4.1,
        'address': 'Colombo 03, Sri Lanka',
        'isOpen': true,
        'phone': '+94 11 214 0000',
      },
    ];

    // Filter hospitals based on search query
    final filteredHospitals = sampleHospitals.where((hospital) {
      final name = (hospital['name'] as String).toLowerCase();
      final address = (hospital['address'] as String).toLowerCase();
      return name.contains(queryLower) || address.contains(queryLower);
    }).toList();

    if (filteredHospitals.isEmpty) {
      setState(() {
        _errorMessage = 'No hospitals found for "$query"';
        _isLoading = false;
      });
      return;
    }

    // Calculate distances
    final hospitalsWithDistance = filteredHospitals.map((hospital) {
      final hospitalLat = hospital['latitude'] as double;
      final hospitalLng = hospital['longitude'] as double;
      double? distance;
      if (_currentPosition != null) {
        distance = Geolocator.distanceBetween(
          _currentPosition!.latitude,
          _currentPosition!.longitude,
          hospitalLat,
          hospitalLng,
        ) / 1000;
      }
      
      return {
        ...hospital,
        'distance': distance != null ? '${distance.toStringAsFixed(1)} km' : null,
      };
    }).toList();

    // Sort by distance
    if (_currentPosition != null) {
      hospitalsWithDistance.sort((a, b) {
        final distA = a['distance'] != null
            ? double.parse((a['distance'] as String).replaceAll(' km', ''))
            : double.infinity;
        final distB = b['distance'] != null
            ? double.parse((b['distance'] as String).replaceAll(' km', ''))
            : double.infinity;
        return distA.compareTo(distB);
      });
    }

    // Create markers
    Set<Marker> markers = {};
    for (var hospital in hospitalsWithDistance) {
      final placeId = hospital['place_id'] as String;
      final name = hospital['name'] as String;
      final hospitalLat = hospital['latitude'] as double;
      final hospitalLng = hospital['longitude'] as double;
      final isOpen = hospital['isOpen'] as bool;
      final address = hospital['address'] as String;

      markers.add(
        Marker(
          markerId: MarkerId(placeId),
          position: LatLng(hospitalLat, hospitalLng),
          infoWindow: InfoWindow(
            title: name,
            snippet: isOpen ? '🟢 Open Now' : address,
            onTap: () {
              setState(() {
                _selectedHospitalId = placeId;
              });
              _showSampleHospitalDetails(hospital);
            },
          ),
          icon: BitmapDescriptor.defaultMarkerWithHue(
            isOpen ? BitmapDescriptor.hueGreen : BitmapDescriptor.hueRed,
          ),
        ),
      );
    }

    setState(() {
      _nearbyHospitals = hospitalsWithDistance;
      _markers = markers;
      _isLoading = false;
    });

    // Move camera to show all markers
    if (_mapController != null && hospitalsWithDistance.isNotEmpty) {
      if (hospitalsWithDistance.length == 1) {
        _mapController!.animateCamera(
          CameraUpdate.newLatLngZoom(
            LatLng(
              hospitalsWithDistance[0]['latitude'] as double,
              hospitalsWithDistance[0]['longitude'] as double,
            ),
            15.0,
          ),
        );
      } else {
        double minLat = hospitalsWithDistance[0]['latitude'] as double;
        double maxLat = hospitalsWithDistance[0]['latitude'] as double;
        double minLng = hospitalsWithDistance[0]['longitude'] as double;
        double maxLng = hospitalsWithDistance[0]['longitude'] as double;
        
        for (var hospital in hospitalsWithDistance) {
          final hospitalLat = hospital['latitude'] as double;
          final hospitalLng = hospital['longitude'] as double;
          if (hospitalLat < minLat) minLat = hospitalLat;
          if (hospitalLat > maxLat) maxLat = hospitalLat;
          if (hospitalLng < minLng) minLng = hospitalLng;
          if (hospitalLng > maxLng) maxLng = hospitalLng;
        }
        
        _mapController!.animateCamera(
          CameraUpdate.newLatLngBounds(
            LatLngBounds(
              southwest: LatLng(minLat - 0.01, minLng - 0.01),
              northeast: LatLng(maxLat + 0.01, maxLng + 0.01),
            ),
            100.0,
          ),
        );
      }
    }

    _showSnackBar('Found ${hospitalsWithDistance.length} hospital(s) (Sample Data)');
  }

  @override
  void dispose() {
    _mapController?.dispose();
    _searchController.dispose();
    super.dispose();
  }
}

