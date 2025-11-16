class Validators {
  static String? validateEmail(String? value) {
    if (value == null || value.isEmpty) {
      return 'Email is required';
    }
    
    final emailRegex = RegExp(
      r'^[a-zA-Z0-9.]+@[a-zA-Z0-9]+\.[a-zA-Z]+',
    );
    
    if (!emailRegex.hasMatch(value)) {
      return 'Please enter a valid email address';
    }
    
    return null;
  }
  
  static String? validatePassword(String? value) {
    if (value == null || value.isEmpty) {
      return 'Password is required';
    }
    
    if (value.length < 6) {
      return 'Password must be at least 6 characters long';
    }
    
    return null;
  }
  
  static String? validateName(String? value) {
    if (value == null || value.isEmpty) {
      return 'Name is required';
    }
    
    if (value.length < 2) {
      return 'Name must be at least 2 characters long';
    }
    
    return null;
  }
  
  static String? validatePhone(String? value) {
    if (value == null || value.isEmpty) {
      return 'Phone number is required';
    }
    
    final phoneRegex = RegExp(r'^[0-9]{10}$');
    
    if (!phoneRegex.hasMatch(value)) {
      return 'Please enter a valid 10-digit phone number';
    }
    
    return null;
  }
  
  static String? validateRequired(String? value, String fieldName) {
    if (value == null || value.isEmpty) {
      return '$fieldName is required';
    }
    
    return null;
  }
  
  static String? validateOTP(String? value) {
    if (value == null || value.isEmpty) {
      return 'OTP is required';
    }
    
    if (value.length != 6) {
      return 'OTP must be 6 digits';
    }
    
    return null;
  }
}