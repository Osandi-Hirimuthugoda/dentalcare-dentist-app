class TreatmentEntity {
  final String id;
  final String name;
  final String description;
  final double cost;
  final int duration; // in minutes
  final String category;

  TreatmentEntity({
    required this.id,
    required this.name,
    required this.description,
    required this.cost,
    required this.duration,
    required this.category,
  });

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
  
    return other is TreatmentEntity &&
        other.id == id &&
        other.name == name &&
        other.description == description &&
        other.cost == cost &&
        other.duration == duration &&
        other.category == category;
  }

  @override
  int get hashCode {
    return id.hashCode ^
        name.hashCode ^
        description.hashCode ^
        cost.hashCode ^
        duration.hashCode ^
        category.hashCode;
  }

  @override
  String toString() {
    return 'TreatmentEntity(id: $id, name: $name, description: $description, cost: $cost, duration: $duration, category: $category)';
  }
}