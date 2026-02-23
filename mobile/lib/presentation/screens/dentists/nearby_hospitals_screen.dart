import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:geolocator/geolocator.dart';
import 'package:geocoding/geocoding.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:url_launcher/url_launcher.dart';

class NearbyHospitalsScreen extends StatefulWidget {
  const NearbyHospitalsScreen({Key? key}) : super(key: key);

  @override
  State<NearbyHospitalsScreen> createState() => _NearbyHospitalsScreenState();
}

class _NearbyHospitalsScreenState extends State<NearbyHospitalsScreen> {
  GoogleMapController? _mapController;
  Position? _currentPosition;
  List<dynamic> _hospitals = [];
  Set<Marker> _markers = {};
  bool _isLoading = true;
  String? _error;
  final String _baseUrl = 'http://10.0.2.2:4000'; // Android emulator (same as backend)
  final TextEditingController _searchController = TextEditingController();
  String _searchLocation = '';

  @override
  void initState() {
    super.initState();
    _getCurrentLocation();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _getCurrentLocation() async {
    try {
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        setState(() {
          _error = 'Location services are disabled';
          _isLoading = false;
        });
        return;
      }

      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          setState(() {
            _error = 'Location permission denied';
            _isLoading = false;
          });
          return;
        }
      }

      Position position = await Geolocator.getCurrentPosition();
      setState(() {
        _currentPosition = position;
      });
      
      await _fetchNearbyHospitals();
    } catch (e) {
      setState(() {
        _error = 'Error getting location: $e';
        _isLoading = false;
      });
    }
  }

  Future<void> _fetchNearbyHospitals() async {
    if (_currentPosition == null) return;

    try {
      final response = await http.get(
        Uri.parse(
          '$_baseUrl/api/hospitals/nearby?latitude=${_currentPosition!.latitude}&longitude=${_currentPosition!.longitude}&maxDistance=50000'
        ),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        setState(() {
          _hospitals = data['hospitals'] ?? [];
          _isLoading = false;
          _searchLocation = 'Your Location';
          _createMarkers();
        });
      } else {
        setState(() {
          _error = 'Failed to load hospitals';
          _isLoading = false;
        });
      }
    } catch (e) {
      setState(() {
        _error = 'Error: $e';
        _isLoading = false;
      });
    }
  }

  Future<void> _searchByLocation(String locationName) async {
    if (locationName.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter a location')),
      );
      return;
    }

    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      // Geocode the location name to get coordinates
      List<Location> locations = await locationFromAddress(locationName);
      
      if (locations.isEmpty) {
        setState(() {
          _error = 'Location not found';
          _isLoading = false;
        });
        return;
      }

      final location = locations.first;
      
      // Update current position to searched location
      setState(() {
        _currentPosition = Position(
          latitude: location.latitude,
          longitude: location.longitude,
          timestamp: DateTime.now(),
          accuracy: 0,
          altitude: 0,
          heading: 0,
          speed: 0,
          speedAccuracy: 0,
          altitudeAccuracy: 0,
          headingAccuracy: 0,
        );
      });

      // Fetch hospitals near the searched location
      final response = await http.get(
        Uri.parse(
          '$_baseUrl/api/hospitals/nearby?latitude=${location.latitude}&longitude=${location.longitude}&maxDistance=50000'
        ),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        setState(() {
          _hospitals = data['hospitals'] ?? [];
          _isLoading = false;
          _searchLocation = locationName;
          _createMarkers();
        });

        // Move camera to searched location
        if (_mapController != null) {
          _mapController!.animateCamera(
            CameraUpdate.newLatLngZoom(
              LatLng(location.latitude, location.longitude),
              12,
            ),
          );
        }

        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Found ${_hospitals.length} hospitals near $locationName')),
        );
      } else {
        setState(() {
          _error = 'Failed to load hospitals';
          _isLoading = false;
        });
      }
    } catch (e) {
      setState(() {
        _error = 'Error searching location: $e';
        _isLoading = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Could not find location: $locationName')),
      );
    }
  }

  void _createMarkers() {
    Set<Marker> markers = {};
    
    // Add search location marker (blue)
    if (_currentPosition != null) {
      markers.add(
        Marker(
          markerId: const MarkerId('search_location'),
          position: LatLng(_currentPosition!.latitude, _currentPosition!.longitude),
          icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueBlue),
          infoWindow: InfoWindow(
            title: _searchLocation.isEmpty ? 'Your Location' : _searchLocation,
            snippet: 'Search center',
          ),
        ),
      );
    }

    // Add hospital markers (red)
    for (var hospital in _hospitals) {
      final coords = hospital['location']['coordinates'];
      markers.add(
        Marker(
          markerId: MarkerId(hospital['_id']),
          position: LatLng(coords[1], coords[0]),
          icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueRed),
          infoWindow: InfoWindow(
            title: hospital['name'],
            snippet: '${hospital['distance']} km away',
          ),
          onTap: () => _showHospitalDetails(hospital),
        ),
      );
    }

    setState(() {
      _markers = markers;
    });
  }

  void _showHospitalDetails(dynamic hospital) {
    showModalBottomSheet(
      context: context,
      builder: (context) => Container(
        padding: const EdgeInsets.all(16),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              hospital['name'],
              style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Text('${hospital['distance']} km away'),
            Text('${hospital['address']}, ${hospital['district']}'),
            if (hospital['phone'] != null) Text('Phone: ${hospital['phone']}'),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: () => _openDirections(hospital),
                    icon: const Icon(Icons.directions),
                    label: const Text('Directions'),
                  ),
                ),
                const SizedBox(width: 8),
                if (hospital['phone'] != null)
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: () => _makeCall(hospital['phone']),
                      icon: const Icon(Icons.phone),
                      label: const Text('Call'),
                    ),
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _openDirections(dynamic hospital) async {
    final coords = hospital['location']['coordinates'];
    final url = 'https://www.google.com/maps/dir/?api=1&destination=${coords[1]},${coords[0]}';
    if (await canLaunchUrl(Uri.parse(url))) {
      await launchUrl(Uri.parse(url));
    }
  }

  Future<void> _makeCall(String phone) async {
    final url = 'tel:$phone';
    if (await canLaunchUrl(Uri.parse(url))) {
      await launchUrl(Uri.parse(url));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Nearby Hospitals'),
        actions: [
          IconButton(
            icon: const Icon(Icons.my_location),
            tooltip: 'Use My Location',
            onPressed: () {
              setState(() {
                _isLoading = true;
              });
              _getCurrentLocation();
            },
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(_error!),
                      const SizedBox(height: 16),
                      ElevatedButton(
                        onPressed: () {
                          setState(() {
                            _isLoading = true;
                          });
                          _getCurrentLocation();
                        },
                        child: const Text('Retry'),
                      ),
                    ],
                  ),
                )
              : Column(
                  children: [
                    // Search Bar
                    Container(
                      padding: const EdgeInsets.all(16),
                      color: Colors.white,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Searching near: $_searchLocation',
                            style: TextStyle(
                              fontSize: 12,
                              color: Colors.grey[600],
                            ),
                          ),
                          const SizedBox(height: 8),
                          Row(
                            children: [
                              Expanded(
                                child: TextField(
                                  controller: _searchController,
                                  decoration: InputDecoration(
                                    hintText: 'Search location (e.g., Kandy, Galle)',
                                    prefixIcon: const Icon(Icons.search),
                                    border: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(10),
                                    ),
                                    contentPadding: const EdgeInsets.symmetric(
                                      horizontal: 16,
                                      vertical: 12,
                                    ),
                                  ),
                                  onSubmitted: _searchByLocation,
                                ),
                              ),
                              const SizedBox(width: 8),
                              ElevatedButton(
                                onPressed: () {
                                  _searchByLocation(_searchController.text);
                                },
                                style: ElevatedButton.styleFrom(
                                  padding: const EdgeInsets.all(16),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(10),
                                  ),
                                ),
                                child: const Icon(Icons.search),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    Expanded(
                      flex: 2,
                      child: GoogleMap(
                        initialCameraPosition: CameraPosition(
                          target: LatLng(
                            _currentPosition?.latitude ?? 6.9271,
                            _currentPosition?.longitude ?? 79.8612,
                          ),
                          zoom: 12,
                        ),
                        markers: _markers,
                        myLocationEnabled: true,
                        myLocationButtonEnabled: true,
                        onMapCreated: (controller) {
                          _mapController = controller;
                        },
                      ),
                    ),
                    Expanded(
                      flex: 1,
                      child: Container(
                        decoration: BoxDecoration(
                          color: Colors.white,
                          boxShadow: [
                            BoxShadow(
                              color: Colors.grey.withOpacity(0.2),
                              blurRadius: 10,
                              offset: const Offset(0, -2),
                            ),
                          ],
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Padding(
                              padding: const EdgeInsets.all(16),
                              child: Text(
                                'Found ${_hospitals.length} hospitals',
                                style: const TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                            Expanded(
                              child: ListView.builder(
                                itemCount: _hospitals.length,
                                itemBuilder: (context, index) {
                                  final hospital = _hospitals[index];
                                  return ListTile(
                                    leading: const Icon(Icons.local_hospital, color: Colors.red),
                                    title: Text(hospital['name']),
                                    subtitle: Text('${hospital['distance']} km • ${hospital['district']}'),
                                    trailing: IconButton(
                                      icon: const Icon(Icons.directions),
                                      onPressed: () => _openDirections(hospital),
                                    ),
                                    onTap: () => _showHospitalDetails(hospital),
                                  );
                                },
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
    );
  }
}
