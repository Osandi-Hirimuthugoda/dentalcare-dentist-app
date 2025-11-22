import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_application_1/core/constants/route_names.dart';
import 'package:flutter_application_1/core/utils/validators.dart';
import 'package:flutter_application_1/presentation/bloc/auth/auth_block.dart';
import 'package:flutter_application_1/presentation/bloc/auth/auth_event.dart';
import 'package:flutter_application_1/presentation/bloc/auth/auth_state.dart';
import 'package:flutter_application_1/injection_container.dart' as di;
import 'package:flutter_application_1/presentation/widgets/auth/blurred_home_background.dart';

class LoginPage extends StatefulWidget {
  final String? preFilledEmail;
  
  const LoginPage({super.key, this.preFilledEmail});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final _formKey = GlobalKey<FormState>();
  final emailController = TextEditingController();
  final passwordController = TextEditingController();
  bool _obscurePassword = true;

  @override
  void initState() {
    super.initState();
    // Pre-fill email if provided
    if (widget.preFilledEmail != null) {
      emailController.text = widget.preFilledEmail!;
    }
  }

  @override
  Widget build(BuildContext context) {
    // Check if email was passed from registration
    final emailFromArgs = ModalRoute.of(context)?.settings.arguments as String?;
    if (emailFromArgs != null && emailController.text.isEmpty) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        setState(() {
          emailController.text = emailFromArgs;
        });
      });
    }
    return BlocProvider(
      create: (context) => AuthBloc(
        loginUseCase: di.getIt(),
        registerUseCase: di.getIt(),
        logoutUseCase: di.getIt(),
      ),
      child: Scaffold(
        body: Stack(
          children: [
            // Blurred home page background
            const BlurredHomeBackground(),
            // Login form on top
            BlocConsumer<AuthBloc, AuthState>(
              listener: (context, state) {
                if (state is AuthAuthenticated) {
                  // Use postFrameCallback for safe navigation
                  WidgetsBinding.instance.addPostFrameCallback((_) {
                    if (!context.mounted) return;
                    
                    try {
                      // Navigate to home after successful login
                      Navigator.pushReplacementNamed(context, RouteNames.home);
                    } catch (e) {
                      debugPrint('Navigation error: $e');
                    }
                  });
                } else if (state is AuthError) {
                  // Show error message
                  if (context.mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text(state.message),
                        backgroundColor: Colors.red,
                        duration: const Duration(seconds: 3),
                      ),
                    );
                  }
                }
              },
              builder: (context, state) {
                final isLoading = state is AuthLoading;
                
                return Container(
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.95),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 40),
                    child: Form(
                      key: _formKey,
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                    const Text("Welcome\nDentalCare+",
                        textAlign: TextAlign.center,
                        style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 40),

                    // Email
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
                    const SizedBox(height: 15),

                    // Password
                    TextFormField(
                      controller: passwordController,
                      enabled: !isLoading,
                      obscureText: _obscurePassword,
                      textInputAction: TextInputAction.done,
                      validator: Validators.validatePassword,
                      decoration: InputDecoration(
                        hintText: "Password",
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
                      onFieldSubmitted: (_) {
                        if (_formKey.currentState!.validate()) {
                          context.read<AuthBloc>().add(
                            LoginRequested(
                              email: emailController.text.trim(),
                              password: passwordController.text,
                            ),
                          );
                        }
                      },
                    ),
                    const SizedBox(height: 10),

                    // Forgot password
                    Align(
                      alignment: Alignment.centerLeft,
                      child: GestureDetector(
                        onTap: isLoading ? null : () {
                          Navigator.pushNamed(context, RouteNames.forgotPassword);
                        },
                        child: const Text("Forgot Password?",
                            style: TextStyle(color: Colors.grey)),
                      ),
                    ),
                    const SizedBox(height: 20),

                    // Login button
                    ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.teal,
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(25)),
                        padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 80),
                        minimumSize: const Size(double.infinity, 50),
                      ),
                      onPressed: isLoading ? null : () {
                        if (_formKey.currentState!.validate()) {
                          context.read<AuthBloc>().add(
                            LoginRequested(
                              email: emailController.text.trim(),
                              password: passwordController.text,
                            ),
                          );
                        }
                      },
                    child: isLoading
                        ? const SizedBox(
                            height: 20,
                            width: 20,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                            ),
                          )
                        : const Text("Log In", style: TextStyle(fontSize: 16)),
                  ),

                  const SizedBox(height: 15),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Text("Don't have an account? "),
                      TextButton(
                        onPressed: isLoading ? null : () {
                          // Navigate to register page using named route
                          if (!context.mounted) return;
                          
                          Navigator.pushNamed(
                            context,
                            RouteNames.register,
                          ).catchError((error) {
                            debugPrint('Navigation error: $error');
                            if (context.mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(
                                  content: Text('Unable to open registration page. Please try again.'),
                                  backgroundColor: Colors.red,
                                ),
                              );
                            }
                            return null;
                          });
                        },
                        child: const Text(
                          "Register",
                          style: TextStyle(
                            color: Colors.teal,
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ],
                  ),

                  const Spacer(),

                  // Logo - using Icon instead to prevent texture rendering crashes
                  // Image.asset causes Impeller texture mipmap issues on emulators
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
          ],
        ),
      ),
    );
  }
}