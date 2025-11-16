class UserModel {
  final String id;
  final String name;
  final String email;
  final String phone;
  final String? gender;
  final int? age;

  UserModel({
    required this.id,
    required this.name,
    required this.email,
    required this.phone,
    this.gender,
    this.age,
  });

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'phone': phone,
      'gender': gender,
      'age': age,
    };
  }

  static UserModel fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'],
      name: json['name'],
      email: json['email'],
      phone: json['phone'],
      gender: json['gender'],
      age: json['age'],
    );
  }
}