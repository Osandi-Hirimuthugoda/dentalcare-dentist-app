// lib/features/bills/my_bills_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_application_1/core/constants/route_names.dart';
import 'package:flutter_application_1/core/themes/colors.dart';
import 'package:flutter_application_1/core/themes/text_styles.dart';
import 'package:flutter_application_1/features/widgets/bill_item.dart';
import 'package:flutter_application_1/features/widgets/payment_summary.dart';
import 'package:flutter_application_1/features/widgets/quick_payment_methods.dart';
import 'package:flutter_application_1/data/data_sources/remote/dental_remote_data_source.dart';
import 'package:flutter_application_1/injection_container.dart';

class MyBillsScreen extends StatefulWidget {
  const MyBillsScreen({super.key});

  @override
  State<MyBillsScreen> createState() => _MyBillsScreenState();
}

class _MyBillsScreenState extends State<MyBillsScreen> {
  String _selectedFilter = 'All';
  List<Map<String, dynamic>> _allBills = [];
  bool _isLoading = true;
  String? _errorMessage;

  late final DentalRemoteDataSource _dentalDataSource;

  @override
  void initState() {
    super.initState();
    _dentalDataSource = getIt<DentalRemoteDataSource>();
    _loadBills();
  }

  Future<void> _loadBills() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final bills = await _dentalDataSource.getBills();
      debugPrint('Bills loaded: ${bills.length} bills');
      
      setState(() {
        _allBills = bills.map<Map<String, dynamic>>((bill) {
          // Map status to color and icon
          Color statusColor = Colors.grey;
          IconData icon = Icons.receipt;
          
          final status = bill['status']?.toString().toLowerCase() ?? 'pending';
          if (status == 'paid') {
            statusColor = Colors.green;
            icon = Icons.receipt;
          } else if (status == 'pending') {
            statusColor = Colors.orange;
            icon = Icons.pending_actions;
          } else if (status == 'overdue') {
            statusColor = Colors.red;
            icon = Icons.error;
          } else {
            statusColor = Colors.blue;
            icon = Icons.schedule;
          }
          
          return {
            'id': bill['id']?.toString() ?? bill['_id']?.toString() ?? '',
            'treatment': bill['treatment']?.toString() ?? 'Treatment',
            'date': bill['date']?.toString() ?? '',
            'amount': bill['amount']?.toString() ?? 'LKR 0',
            'status': bill['status']?.toString() ?? 'Pending',
            'color': statusColor,
            'icon': icon,
            'dueDate': bill['dueDate']?.toString() ?? '',
            '_id': bill['_id']?.toString() ?? '',
            'doctorName': bill['doctorName']?.toString() ?? '',
            'appointmentId': bill['appointmentId']?.toString() ?? '',
          };
        }).toList();
        _isLoading = false;
      });
    } catch (e) {
      debugPrint('Error loading bills: $e');
      setState(() {
        _errorMessage = 'Failed to load bills. Please try again.';
        _isLoading = false;
        _allBills = [];
      });
    }
  }

  List<Map<String, dynamic>> get _filteredBills {
    if (_selectedFilter == 'All') return _allBills;
    
    // Case-insensitive status comparison
    final filterStatus = _selectedFilter.toLowerCase();
    return _allBills.where((bill) {
      final billStatus = bill['status']?.toString().toLowerCase() ?? '';
      return billStatus == filterStatus;
    }).toList();
  }

  double get _totalPaid {
    return _allBills
        .where((bill) => bill['status']?.toString().toLowerCase() == 'paid')
        .fold(0, (sum, bill) => sum + _parseAmount(bill['amount']));
  }

  double get _totalPending {
    return _allBills
        .where((bill) {
          final status = bill['status']?.toString().toLowerCase() ?? '';
          return status == 'pending' || status == 'overdue';
        })
        .fold(0, (sum, bill) => sum + _parseAmount(bill['amount']));
  }

  double get _totalDue {
    // Total due includes pending and overdue bills
    return _allBills
        .where((bill) {
          final status = bill['status']?.toString().toLowerCase() ?? '';
          return status == 'pending' || status == 'overdue';
        })
        .fold(0, (sum, bill) => sum + _parseAmount(bill['amount']));
  }

  double _parseAmount(String amount) {
    return double.parse(amount.replaceAll('LKR', '').replaceAll(',', '').trim());
  }

  void _onPayNow(Map<String, dynamic> bill) {
    _showPaymentOptions(context, bill);
  }

  void _showPaymentOptions(BuildContext context, Map<String, dynamic> bill) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => _buildPaymentBottomSheet(bill),
    );
  }

  Widget _buildPaymentBottomSheet(Map<String, dynamic> bill) {
    final hasDoctor = bill['doctorName'] != null && bill['doctorName'].toString().isNotEmpty;
    
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.only(
          topLeft: Radius.circular(20),
          topRight: Radius.circular(20),
        ),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Center(
            child: Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: Colors.grey[300],
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          const SizedBox(height: 20),
          Text(
            'Pay Bill',
            style: TextStyles.heading4,
          ),
          const SizedBox(height: 10),
          Text(
            '${bill['treatment']} - ${bill['id']}',
            style: TextStyles.bodyMedium.copyWith(
              color: AppColors.textSecondary,
            ),
          ),
          if (hasDoctor) ...[
            const SizedBox(height: 5),
            Row(
              children: [
                Icon(Icons.person, size: 16, color: AppColors.primary),
                const SizedBox(width: 6),
                Text(
                  'Doctor: ${bill['doctorName']}',
                  style: TextStyles.bodySmall.copyWith(
                    color: AppColors.primary,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ],
          const SizedBox(height: 5),
          Text(
            bill['amount'],
            style: TextStyles.heading3.copyWith(
              color: AppColors.primary,
            ),
          ),
          const SizedBox(height: 20),
          Text(
            'Select Payment Method',
            style: TextStyles.bodyMedium.copyWith(
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 15),
          // Show card payment prominently if bill has a doctor
          if (hasDoctor)
            _buildPaymentMethodOption(
              'Credit/Debit Card (Online)',
              Icons.credit_card,
              Colors.blue,
              'Pay securely online with your card',
              () => _navigateToCardPayment(bill),
              isHighlighted: true,
            )
          else
            _buildPaymentMethodOption(
              'Credit/Debit Card',
              Icons.credit_card,
              Colors.blue,
              'Pay securely with your card',
              () => _navigateToCardPayment(bill),
            ),
          _buildPaymentMethodOption(
            'Bank Transfer',
            Icons.account_balance,
            Colors.green,
            'Transfer directly from your bank',
            () => _processBankTransfer(bill),
          ),
          _buildPaymentMethodOption(
            'Cash',
            Icons.money,
            Colors.orange,
            'Pay in cash at the clinic',
            () => _processCashPayment(bill),
          ),
          const SizedBox(height: 20),
          SizedBox(
            width: double.infinity,
            child: TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel'),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPaymentMethodOption(String title, IconData icon, Color color, String description, VoidCallback onTap, {bool isHighlighted = false}) {
    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      elevation: isHighlighted ? 4 : 1,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: isHighlighted ? BorderSide(color: color, width: 2) : BorderSide.none,
      ),
      child: ListTile(
        leading: Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: color.withValues(alpha: isHighlighted ? 0.2 : 0.1),
            shape: BoxShape.circle,
          ),
          child: Icon(icon, color: color),
        ),
        title: Row(
          children: [
            Expanded(
              child: Text(
                title,
                style: TextStyles.bodyMedium.copyWith(
                  fontWeight: isHighlighted ? FontWeight.bold : FontWeight.normal,
                ),
              ),
            ),
            if (isHighlighted)
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: Colors.green,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  'RECOMMENDED',
                  style: TextStyles.caption.copyWith(
                    color: Colors.white,
                    fontSize: 9,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
          ],
        ),
        subtitle: Text(description, style: TextStyles.caption),
        trailing: const Icon(Icons.chevron_right),
        onTap: onTap,
      ),
    );
  }

  void _navigateToCardPayment(Map<String, dynamic> bill) {
    Navigator.pop(context); // Close bottom sheet
    Navigator.pushNamed(
      context,
      RouteNames.cardPayment,
      arguments: {
        'bill': bill,
      },
    ).then((_) {
      // Reload bills after returning from payment screen
      _loadBills();
    });
  }

  void _processBankTransfer(Map<String, dynamic> bill) {
    Navigator.pop(context);
    _showBankTransferDetails(bill);
  }

  void _processCashPayment(Map<String, dynamic> bill) {
    Navigator.pop(context);
    _showCashPaymentInstructions(bill);
  }

  void _showBankTransferDetails(Map<String, dynamic> bill) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Bank Transfer Instructions'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Please transfer ${bill['amount']} to:'),
            const SizedBox(height: 15),
            _buildBankDetail('Bank', 'Commercial Bank'),
            _buildBankDetail('Account Name', 'Dental Care Clinic'),
            _buildBankDetail('Account Number', '1234567890'),
            _buildBankDetail('Branch', 'Colombo Main'),
            _buildBankDetail('Reference', bill['id']),
            const SizedBox(height: 15),
            Text(
              'Send the receipt to payments@dentalcare.com',
              style: TextStyles.caption,
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }

  Widget _buildBankDetail(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          SizedBox(
            width: 100,
            child: Text(
              '$label:',
              style: TextStyles.caption.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
          Text(value, style: TextStyles.caption),
        ],
      ),
    );
  }

  void _showCashPaymentInstructions(Map<String, dynamic> bill) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Cash Payment'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.money, size: 50, color: Colors.orange),
            const SizedBox(height: 15),
            Text(
              'Please visit our clinic to pay ${bill['amount']} in cash.',
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 10),
            Text(
              'Bring this bill reference: ${bill['id']}',
              style: TextStyles.caption,
              textAlign: TextAlign.center,
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  void _navigateToPaymentMethods() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Payment methods management coming soon!'),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Bills & Payments'),
        backgroundColor: AppColors.primary,
        foregroundColor: AppColors.white,
        actions: [
          PopupMenuButton<String>(
            onSelected: (value) {
              setState(() {
                _selectedFilter = value;
              });
            },
            itemBuilder: (context) => [
              const PopupMenuItem(value: 'All', child: Text('All Bills')),
              const PopupMenuItem(value: 'Paid', child: Text('Paid')),
              const PopupMenuItem(value: 'Pending', child: Text('Pending')),
              const PopupMenuItem(value: 'Overdue', child: Text('Overdue')),
            ],
            icon: const Icon(Icons.filter_list),
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _errorMessage != null
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.error_outline, size: 64, color: AppColors.grey300),
                      const SizedBox(height: 16),
                      Text(
                        _errorMessage!,
                        style: TextStyles.bodyMedium.copyWith(
                          color: AppColors.textSecondary,
                        ),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 16),
                      ElevatedButton(
                        onPressed: _loadBills,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.primary,
                          foregroundColor: AppColors.white,
                        ),
                        child: const Text('Retry'),
                      ),
                    ],
                  ),
                )
              : RefreshIndicator(
                  onRefresh: _loadBills,
                  child: ListView(
                    padding: const EdgeInsets.all(16),
                    children: [
                      PaymentSummary(
                        totalPaid: _totalPaid,
                        totalPending: _totalPending,
                        totalDue: _totalDue,
                      ),
                      const SizedBox(height: 20),
                      if (_selectedFilter != 'All') _buildFilterChips(),
                      if (_selectedFilter != 'All') const SizedBox(height: 10),
                      _buildRecentBills(),
                      const SizedBox(height: 20),
                      QuickPaymentMethods(
                        onViewAllMethods: _navigateToPaymentMethods,
                        onAddNewMethod: _navigateToPaymentMethods,
                      ),
                    ],
                  ),
                ),
    );
  }

  Widget _buildFilterChips() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Row(
          children: [
            Icon(
              Icons.filter_alt,
              color: AppColors.primary,
              size: 16,
            ),
            const SizedBox(width: 8),
            Text(
              'Showing: $_selectedFilter Bills',
              style: TextStyles.bodyMedium.copyWith(
                fontWeight: FontWeight.w600,
                color: AppColors.primary,
              ),
            ),
            const Spacer(),
            GestureDetector(
              onTap: () {
                setState(() {
                  _selectedFilter = 'All';
                });
              },
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.grey100,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  children: [
                    Icon(Icons.clear, size: 14, color: AppColors.textSecondary),
                    const SizedBox(width: 4),
                    Text(
                      'Clear',
                      style: TextStyles.caption,
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRecentBills() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Recent Bills',
                  style: TextStyles.heading4,
                ),
                TextButton(
                  onPressed: () {},
                  child: const Text('View All'),
                ),
              ],
            ),
            const SizedBox(height: 15),
            if (_filteredBills.isEmpty)
              _buildEmptyState()
            else
              ..._filteredBills.map((bill) => BillItem(
                    bill: bill,
                    isPayable: bill['status'] == 'Pending' || bill['status'] == 'Upcoming',
                    onPayNow: () => _onPayNow(bill),
                    showBorder: _selectedFilter != 'All',
                  )),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Container(
      padding: const EdgeInsets.all(40),
      child: Column(
        children: [
          Icon(
            Icons.receipt_long,
            size: 64,
            color: AppColors.grey300,
          ),
          const SizedBox(height: 16),
          Text(
            'No bills found',
            style: TextStyles.bodyMedium.copyWith(
              color: AppColors.textSecondary,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Try selecting a different filter',
            style: TextStyles.caption,
          ),
        ],
      ),
    );
  }
}