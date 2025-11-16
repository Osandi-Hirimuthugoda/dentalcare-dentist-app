// lib/features/payment/card_payment_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_application_1/core/themes/colors.dart';
import 'package:flutter_application_1/core/themes/text_styles.dart';

class CardPaymentScreen extends StatefulWidget {
  final Map<String, dynamic> bill;
  final VoidCallback onPaymentSuccess;

  const CardPaymentScreen({
    super.key,
    required this.bill,
    required this.onPaymentSuccess,
  });

  @override
  State<CardPaymentScreen> createState() => _CardPaymentScreenState();
}

class _CardPaymentScreenState extends State<CardPaymentScreen> {
  final _formKey = GlobalKey<FormState>();
  final TextEditingController _cardNumberController = TextEditingController();
  final TextEditingController _cardHolderController = TextEditingController();
  final TextEditingController _expiryController = TextEditingController();
  final TextEditingController _cvvController = TextEditingController();
  
  bool _isProcessing = false;
  bool _saveCard = false;
  String _cardType = 'Unknown';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Card Payment'),
        backgroundColor: AppColors.primary,
        foregroundColor: AppColors.white,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Bill Summary
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Row(
                  children: [
                    Icon(Icons.receipt, color: AppColors.primary, size: 40),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            widget.bill['treatment'],
                            style: TextStyles.bodyMedium.copyWith(
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          Text(
                            widget.bill['id'],
                            style: TextStyles.caption,
                          ),
                        ],
                      ),
                    ),
                    Text(
                      widget.bill['amount'],
                      style: TextStyles.heading4.copyWith(
                        color: AppColors.primary,
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 30),
            
            // Card Preview
            Container(
              height: 200,
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: _getCardColors(),
                ),
                borderRadius: BorderRadius.circular(15),
              ),
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        _cardType,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 16,
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.all(6),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.2),
                          borderRadius: BorderRadius.circular(5),
                        ),
                        child: Text(
                          _getCardTypeText(),
                          style: const TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                            fontSize: 12,
                          ),
                        ),
                      ),
                    ],
                  ),
                  Text(
                    _cardNumberController.text.isEmpty 
                        ? '•••• •••• •••• ••••'
                        : _formatCardNumber(_cardNumberController.text),
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 20,
                      letterSpacing: 2,
                      fontFamily: 'Courier',
                    ),
                  ),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Card Holder',
                            style: TextStyle(
                              color: Colors.white70,
                              fontSize: 12,
                            ),
                          ),
                          Text(
                            _cardHolderController.text.isEmpty 
                                ? 'YOUR NAME'
                                : _cardHolderController.text.toUpperCase(),
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 14,
                            ),
                          ),
                        ],
                      ),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Expires',
                            style: TextStyle(
                              color: Colors.white70,
                              fontSize: 12,
                            ),
                          ),
                          Text(
                            _expiryController.text.isEmpty 
                                ? 'MM/YY'
                                : _expiryController.text,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 14,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 30),
            
            // Payment Form
            Text(
              'Enter Card Details',
              style: TextStyles.heading4,
            ),
            const SizedBox(height: 20),
            
            Form(
              key: _formKey,
              child: Column(
                children: [
                  // Card Number
                  TextFormField(
                    controller: _cardNumberController,
                    decoration: const InputDecoration(
                      labelText: 'Card Number',
                      hintText: '1234 5678 9012 3456',
                      prefixIcon: Icon(Icons.credit_card),
                      border: OutlineInputBorder(),
                    ),
                    keyboardType: TextInputType.number,
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Please enter card number';
                      }
                      final cleanedValue = value.replaceAll(' ', '');
                      if (cleanedValue.length != 16) {
                        return 'Please enter valid 16-digit card number';
                      }
                      if (!_isValidCardNumber(cleanedValue)) {
                        return 'Please enter valid card number';
                      }
                      return null;
                    },
                    onChanged: (value) {
                      setState(() {
                        _detectCardType(value.replaceAll(' ', ''));
                      });
                    },
                  ),
                  const SizedBox(height: 20),
                  
                  // Card Holder Name
                  TextFormField(
                    controller: _cardHolderController,
                    decoration: const InputDecoration(
                      labelText: 'Card Holder Name',
                      hintText: 'John Doe',
                      prefixIcon: Icon(Icons.person),
                      border: OutlineInputBorder(),
                    ),
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Please enter card holder name';
                      }
                      if (value.length < 3) {
                        return 'Name must be at least 3 characters';
                      }
                      return null;
                    },
                    onChanged: (value) => setState(() {}),
                  ),
                  const SizedBox(height: 20),
                  
                  // Expiry Date and CVV
                  Row(
                    children: [
                      Expanded(
                        child: TextFormField(
                          controller: _expiryController,
                          decoration: const InputDecoration(
                            labelText: 'Expiry Date',
                            hintText: 'MM/YY',
                            prefixIcon: Icon(Icons.calendar_today),
                            border: OutlineInputBorder(),
                          ),
                          keyboardType: TextInputType.number,
                          validator: (value) {
                            if (value == null || value.isEmpty) {
                              return 'Please enter expiry date';
                            }
                            if (!RegExp(r'^\d{2}/\d{2}$').hasMatch(value)) {
                              return 'Please enter valid expiry date (MM/YY)';
                            }
                            final parts = value.split('/');
                            final month = int.tryParse(parts[0]);
                            final year = int.tryParse(parts[1]);
                            
                            if (month == null || year == null) {
                              return 'Invalid date format';
                            }
                            if (month < 1 || month > 12) {
                              return 'Invalid month';
                            }
                            
                            final now = DateTime.now();
                            final currentYear = now.year % 100;
                            final currentMonth = now.month;
                            
                            if (year < currentYear || (year == currentYear && month < currentMonth)) {
                              return 'Card has expired';
                            }
                            
                            return null;
                          },
                          onChanged: (value) {
                            setState(() {});
                            if (value.length == 2 && !value.contains('/')) {
                              _expiryController.text = '$value/';
                              _expiryController.selection = TextSelection.fromPosition(
                                TextPosition(offset: _expiryController.text.length),
                              );
                            }
                          },
                        ),
                      ),
                      const SizedBox(width: 20),
                      Expanded(
                        child: TextFormField(
                          controller: _cvvController,
                          decoration: const InputDecoration(
                            labelText: 'CVV',
                            hintText: '123',
                            prefixIcon: Icon(Icons.lock),
                            border: OutlineInputBorder(),
                          ),
                          keyboardType: TextInputType.number,
                          obscureText: true,
                          validator: (value) {
                            if (value == null || value.isEmpty) {
                              return 'Please enter CVV';
                            }
                            if (value.length != 3) {
                              return 'CVV must be 3 digits';
                            }
                            if (!RegExp(r'^\d{3}$').hasMatch(value)) {
                              return 'Please enter valid CVV';
                            }
                            return null;
                          },
                        ),
                      ),
                    ],
                  ),
                  
                  const SizedBox(height: 20),
                  
                  // Save Card Option
                  CheckboxListTile(
                    title: const Text('Save card for future payments'),
                    value: _saveCard,
                    onChanged: (value) {
                      setState(() {
                        _saveCard = value ?? false;
                      });
                    },
                    secondary: Icon(
                      _saveCard ? Icons.check_box : Icons.check_box_outline_blank,
                      color: AppColors.primary,
                    ),
                  ),
                  
                  const SizedBox(height: 30),
                  
                  // Pay Button
                  SizedBox(
                    width: double.infinity,
                    height: 50,
                    child: ElevatedButton(
                      onPressed: _isProcessing ? null : _processPayment,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        foregroundColor: AppColors.white,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10),
                        ),
                      ),
                      child: _isProcessing
                          ? const SizedBox(
                              height: 20,
                              width: 20,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                              ),
                            )
                          : Text(
                              'Pay ${widget.bill['amount']}',
                              style: TextStyles.bodyLarge.copyWith(
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                    ),
                  ),
                  
                  const SizedBox(height: 20),
                  
                  // Test Card Numbers
                  _buildTestCardsInfo(),
                  
                  const SizedBox(height: 20),
                  
                  // Security Info
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.green[50],
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: Colors.green[100]!),
                    ),
                    child: Row(
                      children: [
                        Icon(Icons.security, color: Colors.green, size: 20),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Secure Payment',
                                style: TextStyles.bodySmall.copyWith(
                                  fontWeight: FontWeight.bold,
                                  color: Colors.green[800],
                                ),
                              ),
                              Text(
                                'Your payment information is encrypted and secure',
                                style: TextStyles.caption.copyWith(
                                  color: Colors.green[700],
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTestCardsInfo() {
    return ExpansionTile(
      title: Text('Test Card Numbers', style: TextStyles.bodyMedium),
      children: [
        _buildTestCardItem('Visa', '4111 1111 1111 1111'),
        _buildTestCardItem('MasterCard', '5500 0000 0000 0004'),
        _buildTestCardItem('American Express', '3400 0000 0000 009'),
        _buildTestCardItem('Discover', '6011 0000 0000 0004'),
      ],
    );
  }

  Widget _buildTestCardItem(String type, String number) {
    return ListTile(
      dense: true,
      leading: Icon(Icons.credit_card, size: 20, color: AppColors.primary),
      title: Text(type, style: TextStyles.caption),
      subtitle: Text(number, style: TextStyles.caption),
      trailing: IconButton(
        icon: Icon(Icons.content_copy, size: 16),
        onPressed: () {
          _cardNumberController.text = number;
          setState(() {
            _detectCardType(number.replaceAll(' ', ''));
          });
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('$type card number copied!'),
              duration: const Duration(seconds: 2),
            ),
          );
        },
      ),
    );
  }

  void _detectCardType(String cardNumber) {
    if (cardNumber.isEmpty) {
      setState(() {
        _cardType = 'Credit Card';
      });
      return;
    }

    // Visa
    if (cardNumber.startsWith('4')) {
      setState(() {
        _cardType = 'Visa';
      });
      return;
    }
    
    // MasterCard
    if (cardNumber.startsWith('5')) {
      setState(() {
        _cardType = 'MasterCard';
      });
      return;
    }
    
    // American Express
    if (cardNumber.startsWith('3')) {
      setState(() {
        _cardType = 'American Express';
      });
      return;
    }
    
    // Discover
    if (cardNumber.startsWith('6')) {
      setState(() {
        _cardType = 'Discover';
      });
      return;
    }
    
    setState(() {
      _cardType = 'Credit Card';
    });
  }

  String _getCardTypeText() {
    switch (_cardType) {
      case 'Visa': return 'VISA';
      case 'MasterCard': return 'MC';
      case 'American Express': return 'AMEX';
      case 'Discover': return 'DISC';
      default: return 'CARD';
    }
  }

  List<Color> _getCardColors() {
    switch (_cardType) {
      case 'Visa':
        return [Colors.blue[800]!, Colors.blue[600]!];
      case 'MasterCard':
        return [Colors.red[800]!, Colors.orange[600]!];
      case 'American Express':
        return [Colors.green[800]!, Colors.teal[600]!];
      case 'Discover':
        return [Colors.orange[800]!, Colors.deepOrange[600]!];
      default:
        return [Colors.blue[800]!, Colors.blue[600]!];
    }
  }

  String _formatCardNumber(String input) {
    final cleaned = input.replaceAll(' ', '');
    final buffer = StringBuffer();
    for (int i = 0; i < cleaned.length; i++) {
      if (i > 0 && i % 4 == 0) {
        buffer.write(' ');
      }
      buffer.write(cleaned[i]);
    }
    return buffer.toString();
  }

  bool _isValidCardNumber(String number) {
    // Luhn algorithm for card validation
    int sum = 0;
    bool isEven = false;
    
    for (int i = number.length - 1; i >= 0; i--) {
      int digit = int.parse(number[i]);
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    return sum % 10 == 0;
  }

  void _processPayment() {
    if (_formKey.currentState!.validate()) {
      setState(() {
        _isProcessing = true;
      });
      
      // Simulate API call for payment processing
      _simulatePaymentProcess();
    }
  }

  void _simulatePaymentProcess() {
    // Step 1: Validating card
    Future.delayed(const Duration(seconds: 1), () {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Validating card details...'),
            duration: Duration(seconds: 1),
          ),
        );
      }
    });

    // Step 2: Processing payment
    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Processing payment...'),
            duration: Duration(seconds: 1),
          ),
        );
      }
    });

    // Step 3: Finalizing transaction
    Future.delayed(const Duration(seconds: 3), () {
      if (mounted) {
        setState(() {
          _isProcessing = false;
        });
        
        // Simulate random success/failure for demo
        final randomSuccess = DateTime.now().millisecond % 10 > 2; // 70% success rate
        
        if (randomSuccess) {
          _showPaymentSuccess();
        } else {
          _showPaymentFailure();
        }
      }
    });
  }

  void _showPaymentSuccess() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        title: const Row(
          children: [
            Icon(Icons.check_circle, color: Colors.green, size: 30),
            SizedBox(width: 10),
            Text('Payment Successful'),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              widget.bill['amount'],
              style: TextStyles.heading3.copyWith(
                color: AppColors.primary,
              ),
            ),
            const SizedBox(height: 10),
            Text(
              'Payment completed successfully!',
              style: TextStyles.bodyMedium,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 15),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.green[50],
                borderRadius: BorderRadius.circular(8),
              ),
              child: Column(
                children: [
                  _buildReceiptItem('Transaction ID', _generateTransactionId()),
                  _buildReceiptItem('Date', _getCurrentDateTime()),
                  _buildReceiptItem('Card Type', _cardType),
                  _buildReceiptItem('Card Number', '•••• ${_cardNumberController.text.substring(_cardNumberController.text.length - 4)}'),
                  if (_saveCard) 
                    _buildReceiptItem('Card Saved', 'Yes', isHighlighted: true),
                ],
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(context); // Close dialog
              widget.onPaymentSuccess();
              Navigator.pop(context); // Go back to bills screen
            },
            child: const Text('Done'),
          ),
        ],
      ),
    );
  }

  void _showPaymentFailure() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Row(
          children: [
            Icon(Icons.error_outline, color: Colors.red, size: 30),
            SizedBox(width: 10),
            Text('Payment Failed'),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              widget.bill['amount'],
              style: TextStyles.heading3.copyWith(
                color: Colors.red,
              ),
            ),
            const SizedBox(height: 10),
            Text(
              'Sorry, your payment could not be processed.',
              style: TextStyles.bodyMedium,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 5),
            Text(
              'Please check your card details and try again.',
              style: TextStyles.caption,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 15),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.red[50],
                borderRadius: BorderRadius.circular(8),
              ),
              child: Column(
                children: [
                  _buildReceiptItem('Transaction ID', _generateTransactionId()),
                  _buildReceiptItem('Status', 'Failed'),
                  _buildReceiptItem('Reason', 'Insufficient funds'),
                ],
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Try Again'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context); // Close dialog
              Navigator.pop(context); // Go back
            },
            child: const Text('Cancel'),
          ),
        ],
      ),
    );
  }

  Widget _buildReceiptItem(String label, String value, {bool isHighlighted = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: TextStyles.caption.copyWith(
              color: AppColors.textSecondary,
            ),
          ),
          Text(
            value,
            style: TextStyles.caption.copyWith(
              fontWeight: FontWeight.bold,
              color: isHighlighted ? Colors.green : null,
            ),
          ),
        ],
      ),
    );
  }

  String _generateTransactionId() {
    final now = DateTime.now();
    return 'TXN${now.millisecondsSinceEpoch}'.substring(0, 12);
  }

  String _getCurrentDateTime() {
    final now = DateTime.now();
    return '${now.day}/${now.month}/${now.year} ${now.hour}:${now.minute.toString().padLeft(2, '0')}';
  }

  @override
  void dispose() {
    _cardNumberController.dispose();
    _cardHolderController.dispose();
    _expiryController.dispose();
    _cvvController.dispose();
    super.dispose();
  }
}