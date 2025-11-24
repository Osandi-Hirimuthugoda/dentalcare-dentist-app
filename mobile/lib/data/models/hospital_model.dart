class HospitalModel {
  final String id;
  final String name;
  final String district;
  final String address;
  final String? city;
  final String? phone;
  final String? email;
  final String? website;
  final String? description;
  final List<String> facilities;
  final bool isActive;

  HospitalModel({
    required this.id,
    required this.name,
    required this.district,
    required this.address,
    this.city,
    this.phone,
    this.email,
    this.website,
    this.description,
    this.facilities = const [],
    this.isActive = true,
  });

  factory HospitalModel.fromJson(Map<String, dynamic> json) {
    return HospitalModel(
      id: json['_id']?.toString() ?? json['id']?.toString() ?? '',
      name: json['name'] ?? '',
      district: json['district'] ?? '',
      address: json['address'] ?? '',
      city: json['city'],
      phone: json['phone'],
      email: json['email'],
      website: json['website'],
      description: json['description'],
      facilities: json['facilities'] != null
          ? List<String>.from(json['facilities'])
          : [],
      isActive: json['isActive'] ?? true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'district': district,
      'address': address,
      'city': city,
      'phone': phone,
      'email': email,
      'website': website,
      'description': description,
      'facilities': facilities,
      'isActive': isActive,
    };
  }
}

