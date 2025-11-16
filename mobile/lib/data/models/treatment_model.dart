class TreatmentModel {
  final String id;
  final String name;
  final String description;
  final double cost;
  final int duration;
  final String category;
  final String? imageUrl;

  TreatmentModel({
    required this.id,
    required this.name,
    required this.description,
    required this.cost,
    required this.duration,
    required this.category,
    this.imageUrl,
  });

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'cost': cost,
      'duration': duration,
      'category': category,
      'image_url': imageUrl,
    };
  }

  static TreatmentModel fromJson(Map<String, dynamic> json) {
    return TreatmentModel(
      id: json['id'],
      name: json['name'],
      description: json['description'],
      cost: json['cost']?.toDouble() ?? 0.0,
      duration: json['duration'],
      category: json['category'],
      imageUrl: json['image_url'],
    );
  }
}