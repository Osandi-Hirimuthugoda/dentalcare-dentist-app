import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:flutter_application_1/core/constants/app_constants.dart';
import 'package:flutter_application_1/core/themes/colors.dart';
import 'package:flutter_application_1/core/themes/text_styles.dart';
import 'package:flutter_application_1/data/data_sources/remote/dental_remote_data_source.dart';
import 'package:flutter_application_1/injection_container.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class NearbyHospitalsScreen extends StatefulWidget {
  const NearbyHospitalsScreen({super.key});

  @override
  State<NearbyHospitalsScreen> createState() => _NearbyHospitalsScreenState();
}

class _NearbyHospitalsScreenState extends State<NearbyHospitalsScreen>
    with SingleTickerProviderStateMixin {
  late final DentalRemoteDataSource _dentalDataSource;
  late final TabController _tabController;

  // GPS / Map state
  GoogleMapController? _mapController;
  Position? _currentPosition;
  Set<Marker> _markers = {};
  bool _gpsLoading = false;
  bool _gpsAvailable = false;
  String? _gpsError;

  // List / Search state
  List<dynamic> _hospitals = [];
  bool _listLoading = true;
  String? _listError;
  String? _selectedDistrict;
  final TextEditingController _searchController = TextEditingController();

  static const LatLng _colombo = LatLng(6.9271, 79.8612);

  static const List<String> _districts = [
    'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
    'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
    'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee',
    'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
    'Moneragala', 'Ratnapura', 'Kegalle',
  ];

  @override
  void initState() {
    super.initState();
    _dentalDataSource = getIt<DentalRemoteDataSource>();
    _tabController = TabController(length: 2, vsync: this);
    _loadAllHospitals();
    _tryGPS();
  }

  @override
  void dispose() {
    _tabController.dispose();
    _searchController.dispose();
    _mapController?.dispose();
    super.dispose();
  }

  // ── GPS ──────────────────────────────────────────────────────────────────

  Future<void> _tryGPS() async {
    setState(() { _gpsLoading = true; _gpsError = null; });
    try {
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        setState(() { _gpsLoading = false; _gpsError = 'Location services are disabled.'; });
        return;
      }
      LocationPermission perm = await Geolocator.checkPermission();
      if (perm == LocationPermission.denied) {
        perm = await Geolocator.requestPermission();
      }
      if (perm == LocationPermission.denied || perm == LocationPermission.deniedForever) {
        setState(() { _gpsLoading = false; _gpsError = 'Location permission denied.'; });
        return;
      }
      final pos = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.medium,
      ).timeout(const Duration(seconds: 12));

      setState(() {
        _currentPosition = pos;
        _gpsAvailable = true;
        _gpsLoading = false;
      });
      await _fetchNearbyHospitals(pos.latitude, pos.longitude);
    } catch (e) {
      setState(() {
        _gpsLoading = false;
        _gpsError = 'Could not get location. Using search instead.';
      });
    }
  }

  Future<void> _fetchNearbyHospitals(double lat, double lng) async {
    try {
      final baseUrl = AppConstants.baseUrl.replaceAll('/api', '');
      final response = await http.get(
        Uri.parse('$baseUrl/api/hospitals/nearby?latitude=$lat&longitude=$lng&maxDistance=50000'),
      ).timeout(const Duration(seconds: 15));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final list = data['hospitals'] as List<dynamic>? ?? [];
        setState(() {
          _hospitals = list;
          _listLoading = false;
        });
        _buildMarkers(lat, lng);
      } else {
        // fallback to all hospitals
        await _loadAllHospitals();
      }
    } catch (_) {
      await _loadAllHospitals();
    }
  }

  void _buildMarkers(double myLat, double myLng) {
    if (!mounted) return;

    // District center coordinates fallback
    const districtCoords = {
      'Colombo': [6.9271, 79.8612], 'Gampaha': [7.0840, 80.0000],
      'Kalutara': [6.5854, 79.9597], 'Kandy': [7.2906, 80.6350],
      'Matale': [7.4675, 80.6237], 'Nuwara Eliya': [6.9497, 80.7820],
      'Galle': [6.0535, 80.2170], 'Matara': [5.9549, 80.5353],
      'Hambantota': [6.1241, 81.1197], 'Jaffna': [9.6615, 80.0137],
      'Kilinochchi': [9.3803, 80.4037], 'Mannar': [8.9810, 79.9044],
      'Vavuniya': [8.7514, 80.4982], 'Mullaitivu': [9.2671, 80.8142],
      'Batticaloa': [7.7170, 81.6924], 'Ampara': [7.2913, 81.6747],
      'Trincomalee': [8.5874, 81.2335], 'Kurunegala': [7.4818, 80.3647],
      'Puttalam': [8.0362, 79.8283], 'Anuradhapura': [8.3114, 80.4037],
      'Polonnaruwa': [7.9403, 81.0003], 'Badulla': [6.9934, 81.0550],
      'Moneragala': [6.8728, 81.3497], 'Ratnapura': [6.6828, 80.3849],
      'Kegalle': [7.2513, 80.3464],
    };

    final markers = <Marker>{};
    markers.add(Marker(
      markerId: const MarkerId('me'),
      position: LatLng(myLat, myLng),
      icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueBlue),
      infoWindow: const InfoWindow(title: 'Your Location'),
    ));

    for (final h in _hospitals) {
      double? lat, lng;

      // Try location.coordinates first [lng, lat]
      final coords = h['location']?['coordinates'];
      if (coords != null && coords.length >= 2) {
        final rawLng = (coords[0] as num).toDouble();
        final rawLat = (coords[1] as num).toDouble();
        // Validate — default Colombo coords mean no real data
        if (rawLat != 6.9271 || rawLng != 79.8612) {
          lat = rawLat;
          lng = rawLng;
        }
      }

      // Fallback: district center
      if (lat == null) {
        final district = h['district']?.toString() ?? '';
        final dc = districtCoords[district];
        if (dc != null) {
          lat = dc[0];
          lng = dc[1];
        }
      }

      if (lat == null || lng == null) continue;

      markers.add(Marker(
        markerId: MarkerId(h['_id']?.toString() ?? h['name']),
        position: LatLng(lat, lng),
        icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueRed),
        infoWindow: InfoWindow(
          title: h['name']?.toString() ?? 'Hospital',
          snippet: h['district']?.toString() ?? '',
        ),
        onTap: () => _showDetails(h),
      ));
    }

    if (mounted) {
      setState(() => _markers = markers);
      try {
        _mapController?.animateCamera(
          CameraUpdate.newLatLngZoom(LatLng(myLat, myLng), 12),
        );
      } catch (_) {}
    }
  }

  // ── Backend search ────────────────────────────────────────────────────────

  Future<void> _loadAllHospitals() async {
    setState(() { _listLoading = true; _listError = null; });
    try {
      final list = await _dentalDataSource.searchHospitals(
        query: _searchController.text.trim().isEmpty ? null : _searchController.text.trim(),
        district: _selectedDistrict,
      );
      setState(() { _hospitals = list; _listLoading = false; });
      // Build markers using current position or Sri Lanka center
      final lat = _currentPosition?.latitude ?? 7.8731;
      final lng = _currentPosition?.longitude ?? 80.7718;
      _buildMarkers(lat, lng);
    } catch (e) {
      setState(() { _listError = 'Failed to load hospitals.'; _listLoading = false; });
    }
  }

  Future<void> _search() async {
    FocusScope.of(context).unfocus();
    await _loadAllHospitals();
  }

  // ── Details / Actions ─────────────────────────────────────────────────────

  void _showDetails(dynamic h) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (_) => Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: AppColors.primary.withValues(alpha: 0.1),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(Icons.local_hospital, color: AppColors.primary),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    h['name']?.toString() ?? 'Hospital',
                    style: TextStyles.heading4.copyWith(fontWeight: FontWeight.bold),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            if (h['district'] != null)
              _detailRow(Icons.location_on, h['district'].toString()),
            if (h['address'] != null)
              _detailRow(Icons.home, h['address'].toString()),
            if (h['phone'] != null)
              _detailRow(Icons.phone, h['phone'].toString()),
            if (h['distance'] != null)
              _detailRow(Icons.near_me, '${h['distance']} km away'),
            const SizedBox(height: 20),
            Row(
              children: [
                if (h['phone'] != null)
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () => _call(h['phone'].toString()),
                      icon: const Icon(Icons.phone),
                      label: const Text('Call'),
                    ),
                  ),
                if (h['phone'] != null) const SizedBox(width: 10),
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: () => _directions(h),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      foregroundColor: Colors.white,
                    ),
                    icon: const Icon(Icons.directions),
                    label: const Text('Directions'),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _detailRow(IconData icon, String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        children: [
          Icon(icon, size: 18, color: AppColors.textSecondary),
          const SizedBox(width: 10),
          Expanded(
            child: Text(text, style: TextStyles.bodySmall),
          ),
        ],
      ),
    );
  }

  Future<void> _call(String phone) async {
    final uri = Uri(scheme: 'tel', path: phone);
    if (await canLaunchUrl(uri)) await launchUrl(uri);
  }

  Future<void> _directions(dynamic h) async {
    final coords = h['location']?['coordinates'];
    String dest;
    if (coords != null && coords.length >= 2) {
      dest = '${coords[1]},${coords[0]}';
    } else {
      dest = Uri.encodeComponent(h['name']?.toString() ?? '');
    }
    final uri = Uri.parse('https://www.google.com/maps/dir/?api=1&destination=$dest');
    if (await canLaunchUrl(uri)) await launchUrl(uri, mode: LaunchMode.externalApplication);
  }

  // ── Build ─────────────────────────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Nearby Hospitals'),
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.my_location),
            tooltip: 'Refresh GPS',
            onPressed: _tryGPS,
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: Colors.white,
          labelColor: Colors.white,
          unselectedLabelColor: Colors.white70,
          tabs: const [
            Tab(icon: Icon(Icons.map), text: 'Map'),
            Tab(icon: Icon(Icons.list), text: 'List'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildMapTab(),
          _buildListTab(),
        ],
      ),
    );
  }

  // ── Map Tab ───────────────────────────────────────────────────────────────

  Widget _buildMapTab() {
    return Stack(
      children: [
        GoogleMap(
          initialCameraPosition: CameraPosition(
            target: _currentPosition != null
                ? LatLng(_currentPosition!.latitude, _currentPosition!.longitude)
                : _colombo,
            zoom: 12,
          ),
          markers: _markers,
          myLocationEnabled: _gpsAvailable,
          myLocationButtonEnabled: _gpsAvailable,
          onMapCreated: (c) {
            _mapController = c;
            // If hospitals already loaded, build markers
            if (_hospitals.isNotEmpty) {
              final lat = _currentPosition?.latitude ?? _colombo.latitude;
              final lng = _currentPosition?.longitude ?? _colombo.longitude;
              _buildMarkers(lat, lng);
            }
          },
          liteModeEnabled: false,
        ),
        // GPS status banner
        if (_gpsLoading)
          Positioned(
            top: 12,
            left: 16,
            right: 16,
            child: _banner(
              Icons.gps_fixed,
              'Getting your location...',
              AppColors.primary,
            ),
          ),
        if (!_gpsLoading && _gpsError != null)
          Positioned(
            top: 12,
            left: 16,
            right: 16,
            child: _banner(
              Icons.gps_off,
              _gpsError!,
              Colors.orange,
              action: TextButton(
                onPressed: _tryGPS,
                child: const Text('Retry', style: TextStyle(color: Colors.white)),
              ),
            ),
          ),
        if (!_gpsLoading && _gpsAvailable)
          Positioned(
            top: 12,
            left: 16,
            right: 16,
            child: _banner(
              Icons.gps_fixed,
              'Showing ${_hospitals.length} hospitals near you',
              Colors.green,
            ),
          ),
        // Hospital count chip bottom
        if (_hospitals.isNotEmpty)
          Positioned(
            bottom: 16,
            left: 0,
            right: 0,
            child: Center(
              child: GestureDetector(
                onTap: () => _tabController.animateTo(1),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                  decoration: BoxDecoration(
                    color: AppColors.primary,
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.2),
                        blurRadius: 8,
                      ),
                    ],
                  ),
                  child: Text(
                    '${_hospitals.length} hospitals found — tap to see list',
                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600),
                  ),
                ),
              ),
            ),
          ),
      ],
    );
  }

  Widget _banner(IconData icon, String msg, Color color, {Widget? action}) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(10),
        boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.15), blurRadius: 6)],
      ),
      child: Row(
        children: [
          Icon(icon, color: Colors.white, size: 18),
          const SizedBox(width: 8),
          Expanded(child: Text(msg, style: const TextStyle(color: Colors.white, fontSize: 13))),
          if (action != null) action,
        ],
      ),
    );
  }

  // ── List Tab ──────────────────────────────────────────────────────────────

  Widget _buildListTab() {
    return Column(
      children: [
        // Search bar + district filter
        Container(
          color: Colors.grey[50],
          padding: const EdgeInsets.all(12),
          child: Column(
            children: [
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _searchController,
                      decoration: InputDecoration(
                        hintText: 'Search by name or address...',
                        prefixIcon: const Icon(Icons.search),
                        suffixIcon: _searchController.text.isNotEmpty
                            ? IconButton(
                                icon: const Icon(Icons.clear),
                                onPressed: () {
                                  _searchController.clear();
                                  _loadAllHospitals();
                                },
                              )
                            : null,
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(10),
                        ),
                        contentPadding: const EdgeInsets.symmetric(vertical: 10),
                        filled: true,
                        fillColor: Colors.white,
                      ),
                      onSubmitted: (_) => _search(),
                    ),
                  ),
                  const SizedBox(width: 8),
                  ElevatedButton(
                    onPressed: _search,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.all(14),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                    child: const Icon(Icons.search),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              DropdownButtonFormField<String>(
                value: _selectedDistrict,
                decoration: InputDecoration(
                  labelText: 'Filter by District',
                  prefixIcon: const Icon(Icons.location_on),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                  filled: true,
                  fillColor: Colors.white,
                ),
                items: [
                  const DropdownMenuItem(value: null, child: Text('All Districts')),
                  ..._districts.map((d) => DropdownMenuItem(value: d, child: Text(d))),
                ],
                onChanged: (val) {
                  setState(() => _selectedDistrict = val);
                  _loadAllHospitals();
                },
              ),
            ],
          ),
        ),

        // Results
        Expanded(child: _buildListBody()),
      ],
    );
  }

  Widget _buildListBody() {
    if (_listLoading) {
      return const Center(child: CircularProgressIndicator());
    }
    if (_listError != null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.error_outline, size: 56, color: Colors.red[300]),
            const SizedBox(height: 12),
            Text(_listError!, style: TextStyles.bodyMedium),
            const SizedBox(height: 12),
            ElevatedButton(onPressed: _loadAllHospitals, child: const Text('Retry')),
          ],
        ),
      );
    }
    if (_hospitals.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.local_hospital_outlined, size: 64, color: Colors.grey[400]),
            const SizedBox(height: 12),
            Text('No hospitals found', style: TextStyles.bodyMedium.copyWith(color: Colors.grey)),
          ],
        ),
      );
    }
    return RefreshIndicator(
      onRefresh: _loadAllHospitals,
      child: ListView.builder(
        padding: const EdgeInsets.all(12),
        itemCount: _hospitals.length,
        itemBuilder: (_, i) => _hospitalCard(_hospitals[i]),
      ),
    );
  }

  Widget _hospitalCard(dynamic h) {
    final name = h['name']?.toString() ?? 'Hospital';
    final district = h['district']?.toString() ?? '';
    final address = h['address']?.toString() ?? '';
    final phone = h['phone']?.toString();
    final distance = h['distance'];

    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        leading: Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: AppColors.primary.withValues(alpha: 0.1),
            shape: BoxShape.circle,
          ),
          child: Icon(Icons.local_hospital, color: AppColors.primary),
        ),
        title: Text(name, style: TextStyles.bodyMedium.copyWith(fontWeight: FontWeight.bold)),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (district.isNotEmpty)
              Row(children: [
                Icon(Icons.location_on, size: 13, color: AppColors.textSecondary),
                const SizedBox(width: 4),
                Text(district, style: TextStyles.caption),
              ]),
            if (address.isNotEmpty)
              Text(address, style: TextStyles.caption, maxLines: 1, overflow: TextOverflow.ellipsis),
            if (distance != null)
              Text('${distance} km away',
                  style: TextStyles.caption.copyWith(color: AppColors.primary)),
          ],
        ),
        trailing: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (phone != null)
              IconButton(
                icon: const Icon(Icons.phone, size: 20),
                color: AppColors.primary,
                onPressed: () => _call(phone),
                tooltip: 'Call',
              ),
            IconButton(
              icon: const Icon(Icons.directions, size: 20),
              color: AppColors.primary,
              onPressed: () => _directions(h),
              tooltip: 'Directions',
            ),
          ],
        ),
        onTap: () => _showDetails(h),
      ),
    );
  }
}
