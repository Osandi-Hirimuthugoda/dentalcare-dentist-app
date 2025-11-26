// lib/features/bills/my_bills_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_application_1/core/constants/route_names.dart';
import 'package:flutter_application_1/core/themes/colors.dart';
import 'package:flutter_application_1/core/themes/text_styles.dart';
import 'package:flutter_application_1/features/widgets/bill_item.dart';
import 'package:flutter_application_1/features/widgets/payment_summary.dart';
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
  double _walletBalance = 0.0;
  bool _isLoadingWallet = false;

  late final DentalRemoteDataSource _dentalDataSource;

  @override
  void initState() {
    super.initState();
    _dentalDataSource = getIt<DentalRemoteDataSource>();
    _loadBills();
    _loadWalletBalance();
  }

  Future<void> _loadWalletBalance() async {
    setState(() {
      _isLoadingWallet = true;
    });

    try {
      final walletData = await _dentalDataSource.getWalletBalance();
      setState(() {
        _walletBalance = (walletData['balance'] ?? 0).toDouble();
        _isLoadingWallet = false;
      });
    } catch (e) {
      debugPrint('Error loading wallet balance: $e');
      setState(() {
        _walletBalance = 0.0;
        _isLoadingWallet = false;
      });
    }
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
          // Wallet Payment Option (always show, but highlight if sufficient balance)
          _buildPaymentMethodOption(
            'DentalCare+ Wallet',
            Icons.account_balance_wallet,
            Colors.teal,
            _walletBalance >= _parseAmount(bill['amount'])
                ? 'Pay from wallet (LKR ${_walletBalance.toStringAsFixed(0)} available)'
                : 'Insufficient balance (LKR ${_walletBalance.toStringAsFixed(0)} available)',
            _walletBalance >= _parseAmount(bill['amount'])
                ? () => _payWithWallet(bill)
                : () => _showInsufficientBalanceDialog(),
            isHighlighted: _walletBalance >= _parseAmount(bill['amount']),
          ),
          // Show card payment prominently if bill has a doctor
          if (hasDoctor)
            _buildPaymentMethodOption(
              'Credit/Debit Card (Online)',
              Icons.credit_card,
              Colors.blue,
              'Pay securely online with your card',
              () => _navigateToCardPayment(bill),
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

  Widget _buildPaymentMethodsSection() {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Icon(
                      Icons.payment,
                      color: AppColors.primary,
                      size: 24,
                    ),
                    const SizedBox(width: 12),
                    Text(
                      'Payment Methods',
                      style: TextStyles.heading4.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                IconButton(
                  onPressed: () => _showPaymentMethodsDialog(),
                  icon: Icon(
                    Icons.arrow_forward_ios,
                    color: AppColors.primary,
                    size: 18,
                  ),
                  tooltip: 'View All',
                ),
              ],
            ),
            const SizedBox(height: 16),
            _buildPaymentMethodCard(
              'Credit Card',
              '**** **** **** 1234',
              Icons.credit_card,
              AppColors.primary,
              () => _showAddCardDialog('Credit Card'),
            ),
            const SizedBox(height: 12),
            _buildPaymentMethodCard(
              'Debit Card',
              '**** **** **** 5678',
              Icons.credit_card,
              AppColors.primary,
              () => _showAddCardDialog('Debit Card'),
            ),
            const SizedBox(height: 12),
            _buildPaymentMethodCard(
              'DentalCare+ Wallet',
              'Rs ${_walletBalance.toStringAsFixed(2)} available',
              Icons.account_balance_wallet,
              AppColors.primary,
              () => _showTopUpDialog(),
            ),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              child: OutlinedButton.icon(
                onPressed: () => _showAddPaymentMethodDialog(),
                icon: const Icon(Icons.add),
                label: const Text('Add New Payment Method'),
                style: OutlinedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  side: BorderSide(color: AppColors.primary),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPaymentMethodCard(
    String title,
    String subtitle,
    IconData icon,
    Color color,
    VoidCallback onTap,
  ) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.05),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: color.withValues(alpha: 0.2),
            width: 1,
          ),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(icon, color: color, size: 24),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: TextStyles.bodyMedium.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    subtitle,
                    style: TextStyles.bodySmall.copyWith(
                      color: AppColors.textSecondary,
                    ),
                  ),
                ],
              ),
            ),
            Icon(
              Icons.chevron_right,
              color: AppColors.textSecondary,
            ),
          ],
        ),
      ),
    );
  }

  void _showPaymentMethodsDialog() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.only(
            topLeft: Radius.circular(24),
            topRight: Radius.circular(24),
          ),
        ),
        padding: const EdgeInsets.all(20),
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
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Payment Methods',
                  style: TextStyles.heading4.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                IconButton(
                  onPressed: () => Navigator.pop(context),
                  icon: const Icon(Icons.close),
                ),
              ],
            ),
            const SizedBox(height: 20),
            Expanded(
              child: ListView(
                shrinkWrap: true,
                children: [
                  _buildPaymentMethodCard(
                    'Credit Card',
                    '**** **** **** 1234',
                    Icons.credit_card,
                    AppColors.primary,
                    () {
                      Navigator.pop(context);
                      _showAddCardDialog('Credit Card');
                    },
                  ),
                  const SizedBox(height: 12),
                  _buildPaymentMethodCard(
                    'Debit Card',
                    '**** **** **** 5678',
                    Icons.credit_card,
                    AppColors.primary,
                    () {
                      Navigator.pop(context);
                      _showAddCardDialog('Debit Card');
                    },
                  ),
                  const SizedBox(height: 12),
                  _buildPaymentMethodCard(
                    'DentalCare+ Wallet',
                    'Rs ${_walletBalance.toStringAsFixed(2)} available',
                    Icons.account_balance_wallet,
                    AppColors.primary,
                    () {
                      Navigator.pop(context);
                      _showTopUpDialog();
                    },
                  ),
                  const SizedBox(height: 12),
                  _buildPaymentMethodCard(
                    'Bank Transfer',
                    'Commercial Bank - 1234567890',
                    Icons.account_balance,
                    AppColors.primary,
                    () {
                      Navigator.pop(context);
                      _showBankTransferDialog();
                    },
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: () {
                  Navigator.pop(context);
                  _showAddPaymentMethodDialog();
                },
                icon: const Icon(Icons.add),
                label: const Text('Add New Payment Method'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 10),
          ],
        ),
      ),
    );
  }

  void _showAddPaymentMethodDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Add Payment Method'),
        content: const Text('This feature will allow you to save payment methods for faster checkout. Coming soon!'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  void _showAddCardDialog(String cardType) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Add $cardType'),
        content: Text('To add a $cardType, please use it during checkout or top-up your wallet. Your card will be saved for future payments.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              _showTopUpDialog();
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
            ),
            child: const Text('Top Up Wallet'),
          ),
        ],
      ),
    );
  }

  void _showBankTransferDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Bank Transfer Details'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Please transfer the amount to:'),
            const SizedBox(height: 16),
            _buildBankDetail('Bank', 'Commercial Bank of Ceylon'),
            _buildBankDetail('Account Name', 'DentalCare+ Clinic'),
            _buildBankDetail('Account Number', '1234567890'),
            _buildBankDetail('Branch', 'Colombo Main'),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.primary.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                'After transfer, please contact us with the transaction reference.',
                style: TextStyles.bodySmall.copyWith(
                  color: AppColors.primary,
                ),
              ),
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
                  onRefresh: () async {
                    await _loadBills();
                    await _loadWalletBalance();
                  },
                  child: ListView(
                    padding: const EdgeInsets.all(16),
                    children: [
                      // Wallet Balance Card - Goway Style
                      Card(
                        elevation: 4,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: Container(
                          padding: const EdgeInsets.all(20),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Container(
                                    width: 50,
                                    height: 50,
                                    decoration: BoxDecoration(
                                      color: AppColors.primary.withValues(alpha: 0.1),
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                    child: Icon(
                                      Icons.account_balance_wallet,
                                      color: AppColors.primary,
                                      size: 28,
                                    ),
                                  ),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Row(
                                          children: [
                                            Image.asset(
                                              "assets/images/logo.png",
                                              height: 20,
                                              width: 20,
                                              fit: BoxFit.contain,
                                            ),
                                            const SizedBox(width: 6),
                                            Text(
                                              'DentalCare+ Customer Wallet',
                                              style: TextStyles.bodyMedium.copyWith(
                                                fontWeight: FontWeight.w600,
                                                color: AppColors.textPrimary,
                                              ),
                                            ),
                                          ],
                                        ),
                                        const SizedBox(height: 4),
                                        Text(
                                          'Current Balance',
                                          style: TextStyles.bodySmall.copyWith(
                                            color: AppColors.textSecondary,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 20),
                              _isLoadingWallet
                                  ? const SizedBox(
                                      height: 40,
                                      child: Center(
                                        child: CircularProgressIndicator(),
                                      ),
                                    )
                                  : Text(
                                      'Rs ${_walletBalance.toStringAsFixed(2)}',
                                      style: TextStyles.heading1.copyWith(
                                        color: AppColors.textPrimary,
                                        fontWeight: FontWeight.bold,
                                        fontSize: 32,
                                      ),
                                    ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 20),
                      
                      // Action Buttons - Goway Style
                      Row(
                        children: [
                          Expanded(
                            child: ElevatedButton.icon(
                              onPressed: () => _showTopUpDialog(),
                              icon: const Icon(Icons.credit_card, size: 20),
                              label: const Text('Add Card'),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppColors.primary,
                                foregroundColor: Colors.white,
                                padding: const EdgeInsets.symmetric(vertical: 16),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                elevation: 2,
                              ),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: ElevatedButton.icon(
                              onPressed: () => _showPayAppointmentsDialog(),
                              icon: const Icon(Icons.payment, size: 20),
                              label: const Text('Pay Bills'),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppColors.primary,
                                foregroundColor: Colors.white,
                                padding: const EdgeInsets.symmetric(vertical: 16),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                elevation: 2,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 24),
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
                      // Payment Methods Section - Goway Style
                      _buildPaymentMethodsSection(),
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

  Future<void> _payWithWallet(Map<String, dynamic> bill) async {
    Navigator.pop(context); // Close bottom sheet

    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Pay with Wallet'),
        content: Text('Pay ${bill['amount']} using your wallet?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
            ),
            child: const Text('Pay'),
          ),
        ],
      ),
    );

    if (confirmed != true) return;

    try {
      await _dentalDataSource.payBillWithWallet(bill['_id']);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Payment successful!'),
            backgroundColor: Colors.green,
          ),
        );
        _loadBills();
        _loadWalletBalance();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Payment failed: ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  void _showPayAppointmentsDialog() async {
    try {
      // Load appointments
      final appointments = await _dentalDataSource.getAppointments();
      
      // Filter appointments that need payment (pending, confirmed, or completed without payment)
      final unpaidAppointments = appointments.where((apt) {
        final status = apt['status']?.toString().toLowerCase() ?? '';
        return status == 'pending' || status == 'confirmed' || status == 'completed';
      }).toList();

      if (unpaidAppointments.isEmpty) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('No appointments available for payment'),
              backgroundColor: Colors.orange,
            ),
          );
        }
        return;
      }

      if (!mounted) return;

      showModalBottomSheet(
        context: context,
        isScrollControlled: true,
        backgroundColor: Colors.transparent,
        builder: (context) => Container(
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.only(
              topLeft: Radius.circular(24),
              topRight: Radius.circular(24),
            ),
          ),
          padding: const EdgeInsets.all(20),
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
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Pay for Appointments',
                    style: TextStyles.heading4.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  IconButton(
                    onPressed: () => Navigator.pop(context),
                    icon: const Icon(Icons.close),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Text(
                'Select an appointment to pay using your wallet',
                style: TextStyles.bodySmall.copyWith(
                  color: AppColors.textSecondary,
                ),
              ),
              const SizedBox(height: 16),
              Expanded(
                child: ListView.builder(
                  shrinkWrap: true,
                  itemCount: unpaidAppointments.length,
                  itemBuilder: (context, index) {
                    final appointment = unpaidAppointments[index];
                    final doctor = appointment['doctor'];
                    final doctorName = doctor != null 
                        ? (doctor['fullName'] ?? doctor['name'] ?? 'Unknown Doctor')
                        : 'No Doctor Assigned';
                    final startTime = appointment['startTime'] != null
                        ? DateTime.parse(appointment['startTime'])
                        : DateTime.now();
                    final status = appointment['status']?.toString() ?? 'pending';
                    final amount = 5000.0; // Default appointment fee, can be made dynamic

                    return Card(
                      margin: const EdgeInsets.only(bottom: 12),
                      child: ListTile(
                        leading: Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: AppColors.primary.withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Icon(
                            Icons.calendar_today,
                            color: AppColors.primary,
                            size: 24,
                          ),
                        ),
                        title: Text(
                          doctorName,
                          style: TextStyles.bodyMedium.copyWith(
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        subtitle: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const SizedBox(height: 4),
                            Text(
                              'Date: ${startTime.day}/${startTime.month}/${startTime.year}',
                              style: TextStyles.bodySmall,
                            ),
                            Text(
                              'Time: ${startTime.hour.toString().padLeft(2, '0')}:${startTime.minute.toString().padLeft(2, '0')}',
                              style: TextStyles.bodySmall,
                            ),
                            Text(
                              'Status: ${status.toUpperCase()}',
                              style: TextStyles.bodySmall.copyWith(
                                color: status == 'completed' ? Colors.green : AppColors.textSecondary,
                              ),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              'Amount: Rs ${amount.toStringAsFixed(2)}',
                              style: TextStyles.bodyMedium.copyWith(
                                fontWeight: FontWeight.bold,
                                color: AppColors.primary,
                              ),
                            ),
                          ],
                        ),
                        trailing: ElevatedButton(
                          onPressed: _walletBalance >= amount
                              ? () => _payAppointmentWithWallet(
                                    appointment['_id'] ?? appointment['id'],
                                    amount,
                                    doctorName,
                                  )
                              : () => _showInsufficientBalanceDialog(),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: _walletBalance >= amount
                                ? AppColors.primary
                                : Colors.grey,
                            foregroundColor: Colors.white,
                          ),
                          child: Text(
                            _walletBalance >= amount ? 'Pay' : 'Insufficient',
                          ),
                        ),
                      ),
                    );
                  },
                ),
              ),
            ],
          ),
        ),
      );
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error loading appointments: ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  Future<void> _payAppointmentWithWallet(String appointmentId, double amount, String doctorName) async {
    Navigator.pop(context); // Close appointments dialog

    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Pay Appointment with Wallet'),
        content: Text('Pay Rs ${amount.toStringAsFixed(2)} for appointment with $doctorName using your wallet?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
            ),
            child: const Text('Pay'),
          ),
        ],
      ),
    );

    if (confirmed != true) return;

    try {
      final result = await _dentalDataSource.payAppointmentWithWallet(appointmentId, amount);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Payment successful! New balance: Rs ${result['newBalance']?.toStringAsFixed(2) ?? '0.00'}'),
            backgroundColor: Colors.green,
          ),
        );
        _loadWalletBalance();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Payment failed: ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  void _showInsufficientBalanceDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Insufficient Balance'),
        content: Text(
          'Your wallet balance (LKR ${_walletBalance.toStringAsFixed(0)}) is insufficient to pay this bill.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              _showTopUpDialog();
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
            ),
            child: const Text('Top Up'),
          ),
        ],
      ),
    );
  }

  void _showTopUpDialog() {
    int? selectedAmount;
    final TextEditingController customAmountController = TextEditingController();
    final TextEditingController cardNumberController = TextEditingController();
    final TextEditingController cardHolderController = TextEditingController();
    final TextEditingController expiryController = TextEditingController();
    final TextEditingController cvvController = TextEditingController();
    bool useCustomAmount = false;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => StatefulBuilder(
        builder: (context, setDialogState) => Container(
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.only(
              topLeft: Radius.circular(24),
              topRight: Radius.circular(24),
            ),
          ),
          padding: EdgeInsets.only(
            bottom: MediaQuery.of(context).viewInsets.bottom,
            left: 20,
            right: 20,
            top: 20,
          ),
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Handle bar
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
                
                // Header with Back Button
                Row(
                  children: [
                    IconButton(
                      onPressed: () => Navigator.pop(context),
                      icon: Icon(
                        Icons.arrow_back,
                        color: AppColors.primary,
                      ),
                      style: IconButton.styleFrom(
                        backgroundColor: AppColors.primary.withValues(alpha: 0.1),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        'Top Up Wallet',
                        style: TextStyles.heading4.copyWith(
                          fontWeight: FontWeight.bold,
                          color: AppColors.textPrimary,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 24),
                
                // Card Visualization - Goway Style
                Container(
                  height: 200,
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [AppColors.primary, AppColors.primaryDark],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [
                      BoxShadow(
                        color: AppColors.primary.withValues(alpha: 0.3),
                        blurRadius: 10,
                        offset: const Offset(0, 5),
                      ),
                    ],
                  ),
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'VISA',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 2,
                            ),
                          ),
                          Icon(Icons.wifi, color: Colors.white, size: 24),
                        ],
                      ),
                      const Spacer(),
                      Text(
                        cardNumberController.text.isEmpty
                            ? '•••• •••• •••• ••••'
                            : cardNumberController.text.padRight(19, '•').substring(0, cardNumberController.text.length > 19 ? 19 : cardNumberController.text.length),
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 2,
                        ),
                      ),
                      const SizedBox(height: 20),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Exp. Date',
                                style: TextStyle(
                                  color: Colors.white.withValues(alpha: 0.8),
                                  fontSize: 12,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                expiryController.text.isEmpty
                                    ? 'MM/YY'
                                    : expiryController.text,
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Name',
                                style: TextStyle(
                                  color: Colors.white.withValues(alpha: 0.8),
                                  fontSize: 12,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                cardHolderController.text.isEmpty
                                    ? 'YOUR NAME'
                                    : cardHolderController.text.toUpperCase(),
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                          Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: Colors.white.withValues(alpha: 0.2),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: const Icon(
                              Icons.credit_card,
                              color: Colors.white,
                              size: 32,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),
                
                // Card Details Section
                Text(
                  'Card Details',
                  style: TextStyles.bodyMedium.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 12),
                
                // Card Input Fields
                TextField(
                  controller: cardNumberController,
                  keyboardType: TextInputType.number,
                  decoration: InputDecoration(
                    labelText: 'Card Number',
                    hintText: '1234 5678 9012 3456',
                    prefixIcon: const Icon(Icons.credit_card),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    filled: true,
                    fillColor: Colors.grey[50],
                    counterText: '', // Hide character counter
                  ),
                  maxLength: 19, // 16 digits + 3 spaces = 19 characters
                  onChanged: (value) {
                    setDialogState(() {});
                    // Remove spaces and non-digits, limit to 16 digits
                    String cleanValue = value.replaceAll(' ', '').replaceAll(RegExp(r'[^0-9]'), '');
                    if (cleanValue.length > 16) {
                      cleanValue = cleanValue.substring(0, 16);
                    }
                    
                    // Format with spaces every 4 digits
                    String formatted = '';
                    for (int i = 0; i < cleanValue.length; i += 4) {
                      if (i > 0) formatted += ' ';
                      final endIndex = (i + 4 > cleanValue.length) ? cleanValue.length : i + 4;
                      if (endIndex > i) {
                        formatted += cleanValue.substring(i, endIndex);
                      }
                    }
                    
                    // Only update if formatted value is different
                    if (formatted != value) {
                      final cursorPosition = cardNumberController.selection.baseOffset;
                      cardNumberController.value = TextEditingValue(
                        text: formatted,
                        selection: TextSelection.collapsed(
                          offset: cursorPosition > formatted.length ? formatted.length : cursorPosition,
                        ),
                      );
                    }
                  },
                ),
                const SizedBox(height: 12),
                
                TextField(
                  controller: cardHolderController,
                  decoration: InputDecoration(
                    labelText: 'Name on Card',
                    hintText: 'John Doe',
                    prefixIcon: const Icon(Icons.person),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    filled: true,
                    fillColor: Colors.grey[50],
                  ),
                  onChanged: (value) => setDialogState(() {}),
                ),
                const SizedBox(height: 12),
                
                TextField(
                  controller: expiryController,
                  keyboardType: TextInputType.number,
                  decoration: InputDecoration(
                    labelText: 'Expiration Date',
                    hintText: '12/28',
                    prefixIcon: const Icon(Icons.calendar_today),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    filled: true,
                    fillColor: Colors.grey[50],
                  ),
                  maxLength: 5,
                  onChanged: (value) {
                    setDialogState(() {});
                    final cleanValue = value.replaceAll(RegExp(r'[^0-9]'), '');
                    if (cleanValue.length >= 2) {
                      String formatted = cleanValue.substring(0, 2);
                      if (cleanValue.length > 2) {
                        formatted += '/${cleanValue.substring(2, cleanValue.length > 4 ? 4 : cleanValue.length)}';
                      }
                      if (formatted != value) {
                        expiryController.value = TextEditingValue(
                          text: formatted,
                          selection: TextSelection.collapsed(offset: formatted.length),
                        );
                      }
                    } else if (cleanValue.isNotEmpty) {
                      // Allow partial input (just month)
                      if (value != cleanValue) {
                        expiryController.value = TextEditingValue(
                          text: cleanValue,
                          selection: TextSelection.collapsed(offset: cleanValue.length),
                        );
                      }
                    }
                  },
                ),
                const SizedBox(height: 12),
                
                TextField(
                  controller: cvvController,
                  keyboardType: TextInputType.number,
                  decoration: InputDecoration(
                    labelText: 'CVV',
                    hintText: '123',
                    prefixIcon: const Icon(Icons.lock),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    filled: true,
                    fillColor: Colors.grey[50],
                  ),
                  maxLength: 4,
                  obscureText: true,
                  onChanged: (value) => setDialogState(() {}),
                ),
                const SizedBox(height: 24),
                
                // Amount Selection - Goway Style
                Text(
                  'Select or Enter Amount',
                  style: TextStyles.bodyMedium.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 12),
                
                Row(
                  children: [
                    Expanded(
                      child: _buildAmountButton(5000, selectedAmount, useCustomAmount, (amount) {
                        setDialogState(() {
                          selectedAmount = amount;
                          useCustomAmount = false;
                          customAmountController.clear();
                        });
                      }),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: _buildAmountButton(10000, selectedAmount, useCustomAmount, (amount) {
                        setDialogState(() {
                          selectedAmount = amount;
                          useCustomAmount = false;
                          customAmountController.clear();
                        });
                      }),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: _buildAmountButton(15000, selectedAmount, useCustomAmount, (amount) {
                        setDialogState(() {
                          selectedAmount = amount;
                          useCustomAmount = false;
                          customAmountController.clear();
                        });
                      }),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                
                TextField(
                  controller: customAmountController,
                  keyboardType: TextInputType.number,
                  decoration: InputDecoration(
                    labelText: 'Amount (LKR)',
                    hintText: 'Enter custom amount',
                    prefixIcon: const Icon(Icons.attach_money),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    filled: true,
                    fillColor: Colors.grey[50],
                  ),
                  onChanged: (value) {
                    setDialogState(() {
                      useCustomAmount = value.isNotEmpty;
                      if (useCustomAmount) {
                        selectedAmount = null;
                      }
                    });
                  },
                ),
                const SizedBox(height: 24),
                
                // Confirm Button - Goway Style
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: (selectedAmount != null || (useCustomAmount && customAmountController.text.isNotEmpty)) &&
                            cardNumberController.text.isNotEmpty &&
                            cardHolderController.text.isNotEmpty &&
                            expiryController.text.isNotEmpty &&
                            cvvController.text.isNotEmpty
                        ? () async {
                            final amount = useCustomAmount
                                ? int.tryParse(customAmountController.text) ?? 0
                                : selectedAmount!;
                            
                            if (amount < 100) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(
                                  content: Text('Minimum amount is LKR 100'),
                                  backgroundColor: Colors.red,
                                ),
                              );
                              return;
                            }

                            Navigator.pop(context);
                            await _processTopUp(
                              amount,
                              cardNumberController.text,
                              cardHolderController.text,
                              expiryController.text,
                              cvvController.text,
                            );
                            
                            customAmountController.dispose();
                            cardNumberController.dispose();
                            cardHolderController.dispose();
                            expiryController.dispose();
                            cvvController.dispose();
                          }
                        : null,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      elevation: 2,
                    ),
                    child: Text(
                      'CONFIRM TOP UP',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 1,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 20),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildAmountButton(int amount, int? selected, bool useCustom, Function(int) onTap) {
    final isSelected = selected == amount && !useCustom;
    return GestureDetector(
      onTap: () => onTap(amount),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primary : AppColors.primary.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? AppColors.primary : AppColors.primary.withValues(alpha: 0.3),
            width: isSelected ? 2 : 1,
          ),
        ),
        child: Center(
          child: Text(
            'Rs. ${amount.toStringAsFixed(0)}',
            style: TextStyle(
              color: isSelected ? Colors.white : AppColors.primary,
              fontWeight: FontWeight.bold,
              fontSize: 12,
            ),
            textAlign: TextAlign.center,
          ),
        ),
      ),
    );
  }

  Future<void> _processTopUp(int amount, String cardNumber, String cardHolder, String expiry, String cvv) async {
    try {
      // Extract last 4 digits
      final cleanCardNumber = cardNumber.replaceAll(RegExp(r'[^0-9]'), '');
      final last4Digits = cleanCardNumber.length >= 4 
          ? cleanCardNumber.substring(cleanCardNumber.length - 4)
          : cleanCardNumber;
      
      // Determine card type
      String cardType = 'Visa';
      if (cleanCardNumber.isNotEmpty) {
        if (cleanCardNumber.startsWith('4')) {
          cardType = 'Visa';
        } else if (cleanCardNumber.startsWith('5')) {
          cardType = 'MasterCard';
        } else if (cleanCardNumber.startsWith('3')) {
          cardType = 'American Express';
        }
      }

      final result = await _dentalDataSource.topUpWallet(
        amount,
        'card',
        {
          'cardType': cardType,
          'last4Digits': last4Digits,
          'cardHolder': cardHolder,
        },
      );

      if (mounted) {
        // Show success message with details
        final newBalance = result['newBalance'] ?? 0;
        final previousBalance = result['previousBalance'] ?? 0;
        final amountAdded = newBalance - previousBalance;
        
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '✅ Payment Successful!',
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),
                const SizedBox(height: 4),
                Text('Added: LKR ${amountAdded.toStringAsFixed(2)}'),
                Text('New Balance: LKR ${newBalance.toStringAsFixed(2)}'),
              ],
            ),
            backgroundColor: Colors.green,
            duration: const Duration(seconds: 4),
          ),
        );
        _loadWalletBalance();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Top-up failed: ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }
}