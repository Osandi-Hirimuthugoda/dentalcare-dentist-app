import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_application_1/core/constants/route_names.dart';
import 'package:flutter_application_1/core/utils/validators.dart';
import 'package:flutter_application_1/presentation/bloc/auth/auth_block.dart';
import 'package:flutter_application_1/presentation/bloc/auth/auth_event.dart';
import 'package:flutter_application_1/presentation/bloc/auth/auth_state.dart';
import 'package:flutter_application_1/domain/entities/user_entity.dart';
import 'package:flutter_application_1/injection_container.dart' as di;

class RegisterPage extends StatefulWidget {
  const RegisterPage({super.key});

  @override
  State<RegisterPage> createState() => _RegisterPageState();
}

class _RegisterPageState extends State<RegisterPage> {
  final _formKey = GlobalKey<FormState>();
  final nameController = TextEditingController();
  final emailController = TextEditingController();
  final phoneController = TextEditingController();
  final passwordController = TextEditingController();
  final ageController = TextEditingController();
  
  bool _obscurePassword = true;
  String? _selectedGender;
  
  final List<String> _genderOptions = ['male', 'female', 'other'];

  @override
  Widget build(BuildContext context) {
    // Wrap in try-catch to prevent crashes during build
    try {
      return BlocProvider(
        create: (context) {
          try {
            return AuthBloc(
              loginUseCase: di.getIt(),
              registerUseCase: di.getIt(),
              logoutUseCase: di.getIt(),
            );
          } catch (e) {
            debugPrint('Error creating AuthBloc: $e');
            // Return a default bloc if creation fails
            return AuthBloc(
              loginUseCase: di.getIt(),
              registerUseCase: di.getIt(),
              logoutUseCase: di.getIt(),
            );
          }
        },
        child: Scaffold(
          backgroundColor: Colors.white,
          body: BlocConsumer<AuthBloc, AuthState>(
            listener: (context, state) {
              if (state is AuthAuthenticated) {
                // Get email before navigation
                final email = emailController.text.trim();
                
                // Navigate safely using postFrameCallback
                WidgetsBinding.instance.addPostFrameCallback((_) {
                  if (!context.mounted) return;
                  
                  try {
                    // Navigate to login page with email pre-filled
                    Navigator.pushReplacementNamed(
                      context,
                      RouteNames.login,
                      arguments: email,
                    );
                  } catch (e) {
                    debugPrint('Navigation error: $e');
                  }
                });
              } else if (state is AuthError) {
                // Show detailed error message
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text(
                        state.message,
                        style: const TextStyle(fontSize: 14),
                      ),
                      backgroundColor: Colors.red,
                      duration: const Duration(seconds: 4),
                      action: SnackBarAction(
                        label: 'OK',
                        textColor: Colors.white,
                        onPressed: () {},
                      ),
                    ),
                  );
                }
              }
            },
          builder: (context, state) {
            final isLoading = state is AuthLoading;
            
            return Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 40),
              child: SingleChildScrollView(
                child: Form(
                  key: _formKey,
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const SizedBox(height: 40),
                      const Text("Welcome\nDentalCare+",
                          textAlign: TextAlign.center,
                          style: TextStyle(fontSize: 26, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 20),

                      TextFormField(
                        controller: nameController,
                        enabled: !isLoading,
                        textInputAction: TextInputAction.next,
                        validator: Validators.validateName,
                        decoration: const InputDecoration(
                          hintText: "Name",
                          border: OutlineInputBorder(),
                          prefixIcon: Icon(Icons.person),
                        ),
                      ),
                      const SizedBox(height: 12),

                      TextFormField(
                        controller: emailController,
                        enabled: !isLoading,
                        keyboardType: TextInputType.emailAddress,
                        textInputAction: TextInputAction.next,
                        validator: Validators.validateEmail,
                        decoration: const InputDecoration(
                          hintText: "Email",
                          border: OutlineInputBorder(),
                          prefixIcon: Icon(Icons.email),
                        ),
                      ),
                      const SizedBox(height: 12),

                      TextFormField(
                        controller: phoneController,
                        enabled: !isLoading,
                        keyboardType: TextInputType.phone,
                        textInputAction: TextInputAction.next,
                        validator: Validators.validatePhone,
                        decoration: const InputDecoration(
                          hintText: "Phone number (10 digits)",
                          border: OutlineInputBorder(),
                          prefixIcon: Icon(Icons.phone),
                        ),
                      ),
                      const SizedBox(height: 12),

                      TextFormField(
                        controller: passwordController,
                        enabled: !isLoading,
                        obscureText: _obscurePassword,
                        textInputAction: TextInputAction.next,
                        validator: Validators.validatePasswordStrength,
                        decoration: InputDecoration(
                          hintText: "Password (min 6 chars, with letter & number)",
                          border: const OutlineInputBorder(),
                          prefixIcon: const Icon(Icons.lock),
                          suffixIcon: IconButton(
                            icon: Icon(
                              _obscurePassword ? Icons.visibility : Icons.visibility_off,
                            ),
                            onPressed: () {
                              setState(() {
                                _obscurePassword = !_obscurePassword;
                              });
                            },
                          ),
                        ),
                      ),
                      const SizedBox(height: 12),

                      // Gender Dropdown
                      DropdownButtonFormField<String>(
                        value: _selectedGender,
                        decoration: const InputDecoration(
                          hintText: "Select Gender",
                          border: OutlineInputBorder(),
                          prefixIcon: Icon(Icons.person_outline),
                        ),
                        items: _genderOptions.map((String gender) {
                          return DropdownMenuItem<String>(
                            value: gender,
                            child: Text(gender.toUpperCase()),
                          );
                        }).toList(),
                        onChanged: isLoading ? null : (String? newValue) {
                          setState(() {
                            _selectedGender = newValue;
                          });
                        },
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return 'Gender is required';
                          }
                          return Validators.validateGender(value);
                        },
                      ),
                      const SizedBox(height: 12),

                      TextFormField(
                        controller: ageController,
                        enabled: !isLoading,
                        keyboardType: TextInputType.number,
                        textInputAction: TextInputAction.done,
                        validator: Validators.validateAge,
                        decoration: const InputDecoration(
                          hintText: "Age",
                          border: OutlineInputBorder(),
                          prefixIcon: Icon(Icons.calendar_today),
                        ),
                        onFieldSubmitted: (_) {
                          if (_formKey.currentState!.validate()) {
                            _handleRegister(context);
                          }
                        },
                      ),
                      const SizedBox(height: 20),

                    ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.teal,
                        padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 60),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(25),
                        ),
                        minimumSize: const Size(double.infinity, 50),
                      ),
                      onPressed: isLoading ? null : () {
                        try {
                          if (_formKey.currentState?.validate() ?? false) {
                            _handleRegister(context);
                          }
                        } catch (e) {
                          debugPrint('Error in register button: $e');
                          if (context.mounted) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                content: Text('Error: ${e.toString()}'),
                                backgroundColor: Colors.red,
                              ),
                            );
                          }
                        }
                      },
                      child: isLoading
                          ? const SizedBox(
                              height: 20,
                              width: 20,
                              child: Center(
                                child: SizedBox(
                                  width: 16,
                                  height: 16,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2.5,
                                    valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                                  ),
                                ),
                              ),
                            )
                          : const Text("Register"),
                    ),

                    const SizedBox(height: 15),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Text("Already have an account? "),
                        TextButton(
                          onPressed: isLoading ? null : () {
                            Navigator.pushReplacementNamed(context, RouteNames.login);
                          },
                          child: const Text("Login",
                              style: TextStyle(color: Colors.teal)),
                        ),
                      ],
                    ),

                      const SizedBox(height: 20),
                      // Logo - using Icon instead of image to prevent rendering crashes
                      // Image.asset causes Impeller texture mipmap issues on some emulators
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: const [
                          Icon(
                            Icons.health_and_safety,
                            size: 50,
                            color: Colors.teal,
                          ),
                          SizedBox(width: 10),
                          Text(
                            "DentalCare+",
                            style: TextStyle(
                              fontSize: 24,
                              fontWeight: FontWeight.bold,
                              color: Colors.teal,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            );
          },
        ),
      ),
    );
    } catch (e, stackTrace) {
      debugPrint('Error building RegisterPage: $e');
      debugPrint('Stack trace: $stackTrace');
      // Return a simple error page if build fails
      return Scaffold(
        backgroundColor: Colors.white,
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(20.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.error_outline, size: 64, color: Colors.red),
                const SizedBox(height: 20),
                const Text(
                  'Error loading registration page',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 10),
                const Text('Please try again'),
                const SizedBox(height: 20),
                ElevatedButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text('Go Back'),
                ),
              ],
            ),
          ),
        ),
      );
    }
  }

  void _handleRegister(BuildContext context) {
    try {
      if (!context.mounted) return;
      
      // Create user entity
      final user = UserEntity(
        id: '',
        name: nameController.text.trim(),
        email: emailController.text.trim(),
        phone: phoneController.text.trim(),
      );

      // Get age and gender from form
      final age = int.tryParse(ageController.text.trim());
      final gender = _selectedGender?.toLowerCase() ?? 'other';

      // Check if Bloc is available
      final bloc = context.read<AuthBloc>();
      if (bloc.isClosed) {
        debugPrint('AuthBloc is closed');
        return;
      }

      // Register user with age and gender
      bloc.add(
        RegisterRequested(
          user: user,
          password: passwordController.text,
          age: age,
          gender: gender,
        ),
      );
    } catch (e, stackTrace) {
      debugPrint('Error in _handleRegister: $e');
      debugPrint('Stack trace: $stackTrace');
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Registration failed: ${e.toString()}'),
            backgroundColor: Colors.red,
            duration: const Duration(seconds: 3),
          ),
        );
      }
    }
  }
}