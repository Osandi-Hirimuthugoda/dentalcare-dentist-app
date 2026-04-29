import 'package:flutter/material.dart';
import 'package:flutter_application_1/core/themes/colors.dart';
import 'package:flutter_application_1/data/data_sources/remote/dental_remote_data_source.dart';
import 'package:flutter_application_1/injection_container.dart';
import 'package:flutter_application_1/features/payment/card_payment_screen.dart';

class MyBillsScreen extends StatefulWidget {
  const MyBillsScreen({super.key});

  @override
  State<MyBillsScreen> createState() => _MyBillsScreenState();
}

class _MyBillsScreenState extends State<MyBillsScreen>
    with SingleTickerProviderStateMixin {
  TabController? _tabController;
  List<Map<String, dynamic>> _allBills = [];
  List<Map<String, dynamic>> _transactions = [];
  bool _isLoading = true;
  bool _isLoadingWallet = false;
  double _walletBalance = 0.0;
  String _filterStatus = 'All';
  late final DentalRemoteDataSource _ds;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _ds = getIt<DentalRemoteDataSource>();
    _loadAll();
  }

  @override
  void dispose() {
    _tabController?.dispose();
    super.dispose();
  }

  Future<void> _loadAll() async {
    await Future.wait([_loadBills(), _loadWallet(), _loadTransactions()]);
  }

  Future<void> _loadBills() async {
    setState(() => _isLoading = true);
    try {
      final bills = await _ds.getBills();
      setState(() {
        _allBills = bills.map<Map<String, dynamic>>((b) {
          final status = b['status']?.toString().toLowerCase() ?? 'pending';
          return {
            'id': b['id']?.toString() ?? b['_id']?.toString() ?? '',
            '_id': b['_id']?.toString() ?? '',
            'treatment': b['treatment']?.toString() ?? 'Treatment',
            'date': b['date']?.toString() ?? '',
            'amount': b['amount']?.toString() ?? 'LKR 0',
            'status': b['status']?.toString() ?? 'Pending',
            'dueDate': b['dueDate']?.toString() ?? '',
            'doctorName': b['doctorName']?.toString() ?? '',
            'statusColor': status == 'paid'
                ? Colors.green
                : status == 'overdue'
                    ? Colors.red
                    : Colors.orange,
          };
        }).toList();
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _loadWallet() async {
    setState(() => _isLoadingWallet = true);
    try {
      final data = await _ds.getWalletBalance();
      setState(() {
        _walletBalance = (data['balance'] ?? 0).toDouble();
        _isLoadingWallet = false;
      });
    } catch (_) {
      setState(() => _isLoadingWallet = false);
    }
  }

  Future<void> _loadTransactions() async {
    try {
      final txns = await _ds.getWalletTransactions();
      setState(() {
        _transactions = txns.map<Map<String, dynamic>>((t) => {
              'type': t['type']?.toString() ?? 'topup',
              'amount': (t['amount'] ?? 0).toDouble(),
              'description': t['description']?.toString() ?? '',
              'status': t['status']?.toString() ?? 'completed',
              'createdAt': t['createdAt']?.toString() ?? '',
              'transactionId': t['transactionId']?.toString() ?? '',
            }).toList();
      });
    } catch (_) {}
  }

  List<Map<String, dynamic>> get _filteredBills {
    if (_filterStatus == 'All') return _allBills;
    return _allBills
        .where((b) =>
            b['status']?.toString().toLowerCase() ==
            _filterStatus.toLowerCase())
        .toList();
  }

  double get _totalPending => _allBills
      .where((b) => b['status']?.toString().toLowerCase() == 'pending')
      .fold(0.0, (sum, b) {
    final amt = b['amount']?.toString().replaceAll(RegExp(r'[^0-9.]'), '') ?? '0';
    return sum + (double.tryParse(amt) ?? 0);
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey.shade50,
      appBar: AppBar(
        title: const Text('Bills & Payments'),
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadAll,
          ),
        ],
        bottom: TabBar(
          controller: _tabController!,
          indicatorColor: Colors.white,
          labelColor: Colors.white,
          unselectedLabelColor: Colors.white70,
          tabs: const [
            Tab(icon: Icon(Icons.receipt_long, size: 18), text: 'Bills'),
            Tab(icon: Icon(Icons.account_balance_wallet, size: 18), text: 'Wallet'),
            Tab(icon: Icon(Icons.history, size: 18), text: 'History'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController!,
        children: [
          _buildBillsTab(),
          _buildWalletTab(),
          _buildHistoryTab(),
        ],
      ),
    );
  }

  // ── BILLS TAB ──────────────────────────────────────────────
  Widget _buildBillsTab() {
    return RefreshIndicator(
      onRefresh: _loadBills,
      child: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : CustomScrollView(
              slivers: [
                SliverToBoxAdapter(child: _buildBillStats()),
                SliverToBoxAdapter(child: _buildFilterChips()),
                _filteredBills.isEmpty
                    ? SliverFillRemaining(child: _buildEmpty('No bills found'))
                    : SliverList(
                        delegate: SliverChildBuilderDelegate(
                          (ctx, i) => _buildBillCard(_filteredBills[i]),
                          childCount: _filteredBills.length,
                        ),
                      ),
              ],
            ),
    );
  }

  Widget _buildBillStats() {
    final paid = _allBills.where((b) => b['status']?.toString().toLowerCase() == 'paid').length;
    final pending = _allBills.where((b) => b['status']?.toString().toLowerCase() == 'pending').length;
    final overdue = _allBills.where((b) => b['status']?.toString().toLowerCase() == 'overdue').length;

    return Padding(
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
          _statCard('Total', '${_allBills.length}', Colors.blue, Icons.receipt),
          const SizedBox(width: 8),
          _statCard('Paid', '$paid', Colors.green, Icons.check_circle),
          const SizedBox(width: 8),
          _statCard('Pending', '$pending', Colors.orange, Icons.pending),
          const SizedBox(width: 8),
          _statCard('Overdue', '$overdue', Colors.red, Icons.warning),
        ],
      ),
    );
  }

  Widget _statCard(String label, String value, Color color, IconData icon) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 4)],
        ),
        child: Column(
          children: [
            Icon(icon, color: color, size: 20),
            const SizedBox(height: 4),
            Text(value, style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: color)),
            Text(label, style: const TextStyle(fontSize: 10, color: Colors.grey)),
          ],
        ),
      ),
    );
  }

  Widget _buildFilterChips() {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      child: Row(
        children: ['All', 'Pending', 'Paid', 'Overdue'].map((f) {
          final isSelected = _filterStatus == f;
          return Padding(
            padding: const EdgeInsets.only(right: 8),
            child: FilterChip(
              label: Text(f),
              selected: isSelected,
              onSelected: (_) => setState(() => _filterStatus = f),
              selectedColor: AppColors.primary.withOpacity(0.2),
              checkmarkColor: AppColors.primary,
              labelStyle: TextStyle(
                color: isSelected ? AppColors.primary : Colors.grey.shade700,
                fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
              ),
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildBillCard(Map<String, dynamic> bill) {
    final statusColor = bill['statusColor'] as Color? ?? Colors.orange;
    final status = bill['status']?.toString() ?? 'Pending';
    final isPending = status.toLowerCase() == 'pending';

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 6)],
        border: Border(left: BorderSide(color: statusColor, width: 4)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    bill['treatment']?.toString() ?? 'Treatment',
                    style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 15),
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: statusColor.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    status,
                    style: TextStyle(color: statusColor, fontSize: 12, fontWeight: FontWeight.w600),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                Icon(Icons.person_outline, size: 14, color: Colors.grey.shade500),
                const SizedBox(width: 4),
                Text(bill['doctorName']?.toString() ?? '', style: TextStyle(fontSize: 12, color: Colors.grey.shade600)),
                const Spacer(),
                Text(
                  bill['amount']?.toString() ?? '',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.primary),
                ),
              ],
            ),
            const SizedBox(height: 4),
            Row(
              children: [
                Icon(Icons.calendar_today, size: 12, color: Colors.grey.shade400),
                const SizedBox(width: 4),
                Text(bill['date']?.toString() ?? '', style: TextStyle(fontSize: 11, color: Colors.grey.shade500)),
                if (bill['dueDate']?.toString().isNotEmpty == true) ...[
                  const SizedBox(width: 12),
                  Icon(Icons.schedule, size: 12, color: Colors.grey.shade400),
                  const SizedBox(width: 4),
                  Text('Due: ${bill['dueDate']}', style: TextStyle(fontSize: 11, color: Colors.grey.shade500)),
                ],
              ],
            ),
            if (isPending) ...[
              const SizedBox(height: 10),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () => _payWithWallet(bill),
                      icon: const Icon(Icons.account_balance_wallet, size: 16),
                      label: const Text('Pay with Wallet'),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: AppColors.primary,
                        side: BorderSide(color: AppColors.primary),
                        padding: const EdgeInsets.symmetric(vertical: 8),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: () => _openCardPayment(bill),
                      icon: const Icon(Icons.credit_card, size: 16),
                      label: const Text('Pay by Card'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 8),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }

  // ── WALLET TAB ─────────────────────────────────────────────
  Widget _buildWalletTab() {
    return RefreshIndicator(
      onRefresh: _loadWallet,
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            _buildWalletCard(),
            const SizedBox(height: 20),
            _buildQuickTopUp(),
            const SizedBox(height: 20),
            if (_totalPending > 0) _buildPendingAlert(),
          ],
        ),
      ),
    );
  }

  Widget _buildWalletCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [AppColors.primary, AppColors.primary.withOpacity(0.7)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(color: AppColors.primary.withOpacity(0.3), blurRadius: 12, offset: const Offset(0, 6)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.account_balance_wallet, color: Colors.white70, size: 20),
              const SizedBox(width: 8),
              const Text('DentalCare+ Wallet', style: TextStyle(color: Colors.white70, fontSize: 13)),
              const Spacer(),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: const Text('Active', style: TextStyle(color: Colors.white, fontSize: 11)),
              ),
            ],
          ),
          const SizedBox(height: 16),
          _isLoadingWallet
              ? const CircularProgressIndicator(color: Colors.white)
              : Text(
                  'LKR ${_walletBalance.toStringAsFixed(2)}',
                  style: const TextStyle(color: Colors.white, fontSize: 32, fontWeight: FontWeight.bold),
                ),
          const SizedBox(height: 4),
          const Text('Available Balance', style: TextStyle(color: Colors.white60, fontSize: 12)),
          const SizedBox(height: 20),
          Row(
            children: [
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: _showTopUpDialog,
                  icon: const Icon(Icons.add, size: 18),
                  label: const Text('Top Up'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.white,
                    foregroundColor: AppColors.primary,
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: () => _tabController?.animateTo(2),
                  icon: const Icon(Icons.history, size: 18),
                  label: const Text('History'),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: Colors.white,
                    side: const BorderSide(color: Colors.white60),
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildQuickTopUp() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Quick Top-Up', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 15)),
        const SizedBox(height: 12),
        GridView.count(
          crossAxisCount: 3,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          crossAxisSpacing: 10,
          mainAxisSpacing: 10,
          childAspectRatio: 2,
          children: [500, 1000, 2000, 5000, 10000, 20000].map((amt) {
            return GestureDetector(
              onTap: () => _quickTopUp(amt.toDouble()),
              child: Container(
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: AppColors.primary.withOpacity(0.3)),
                  boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 4)],
                ),
                child: Center(
                  child: Text(
                    'LKR ${amt >= 1000 ? '${amt ~/ 1000}K' : '$amt'}',
                    style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.w600, fontSize: 13),
                  ),
                ),
              ),
            );
          }).toList(),
        ),
      ],
    );
  }

  Widget _buildPendingAlert() {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.orange.shade50,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.orange.shade200),
      ),
      child: Row(
        children: [
          const Icon(Icons.warning_amber, color: Colors.orange),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Pending Bills', style: TextStyle(fontWeight: FontWeight.w600, color: Colors.orange)),
                Text(
                  'You have LKR ${_totalPending.toStringAsFixed(0)} in pending bills',
                  style: const TextStyle(fontSize: 12, color: Colors.orange),
                ),
              ],
            ),
          ),
          TextButton(
            onPressed: () => _tabController?.animateTo(0),
            child: const Text('View'),
          ),
        ],
      ),
    );
  }

  // ── HISTORY TAB ────────────────────────────────────────────
  Widget _buildHistoryTab() {
    return RefreshIndicator(
      onRefresh: _loadTransactions,
      child: _transactions.isEmpty
          ? _buildEmpty('No transactions yet')
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _transactions.length,
              itemBuilder: (ctx, i) => _buildTransactionCard(_transactions[i]),
            ),
    );
  }

  Widget _buildTransactionCard(Map<String, dynamic> txn) {
    final type = txn['type']?.toString() ?? 'topup';
    final isTopup = type == 'topup' || type == 'refund';
    final amount = txn['amount'] as double? ?? 0;
    final color = isTopup ? Colors.green : Colors.red;
    final icon = isTopup ? Icons.arrow_downward : Icons.arrow_upward;

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 4)],
      ),
      child: Row(
        children: [
          Container(
            width: 42,
            height: 42,
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: color, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  txn['description']?.toString() ?? type.toUpperCase(),
                  style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 13),
                ),
                Text(
                  txn['transactionId']?.toString() ?? '',
                  style: TextStyle(fontSize: 11, color: Colors.grey.shade500),
                ),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                '${isTopup ? '+' : '-'} LKR ${amount.toStringAsFixed(0)}',
                style: TextStyle(fontWeight: FontWeight.bold, color: color, fontSize: 14),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: Colors.green.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  txn['status']?.toString() ?? 'completed',
                  style: const TextStyle(fontSize: 10, color: Colors.green),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildEmpty(String msg) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.receipt_long, size: 64, color: Colors.grey.shade300),
          const SizedBox(height: 12),
          Text(msg, style: TextStyle(color: Colors.grey.shade500, fontSize: 15)),
        ],
      ),
    );
  }

  // ── ACTIONS ────────────────────────────────────────────────
  void _openCardPayment(Map<String, dynamic> bill) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => CardPaymentScreen(
          bill: bill,
          onPaymentSuccess: () {
            _loadBills();
            _loadWallet();
          },
        ),
      ),
    );
  }

  Future<void> _payWithWallet(Map<String, dynamic> bill) async {
    final billId = bill['_id']?.toString() ?? '';
    if (billId.isEmpty) {
      _showSnack('Bill ID not found', isError: true);
      return;
    }

    // Parse amount - handle "LKR 2,500" or "2500" or numeric
    double amt = 0;
    final rawAmt = bill['amount'];
    if (rawAmt is num) {
      amt = rawAmt.toDouble();
    } else {
      final cleaned = rawAmt?.toString().replaceAll(RegExp(r'[^0-9.]'), '') ?? '0';
      amt = double.tryParse(cleaned) ?? 0;
    }

    if (_walletBalance < amt) {
      _showSnack('Insufficient wallet balance. Please top up first.', isError: true);
      _tabController?.animateTo(1);
      return;
    }

    final confirm = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Pay with Wallet'),
        content: Text('Pay ${bill['amount']} for ${bill['treatment']}?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary),
            child: const Text('Confirm', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );

    if (confirm != true) return;

    try {
      await _ds.payBillWithWallet(billId);
      _showSnack('Payment successful!');
      _loadAll();
    } catch (e) {
      _showSnack('Payment failed: $e', isError: true);
    }
  }

  void _showTopUpDialog() {
    final controller = TextEditingController();
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (_) => Padding(
        padding: EdgeInsets.only(
          left: 20, right: 20, top: 20,
          bottom: MediaQuery.of(context).viewInsets.bottom + 20,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Top Up Wallet', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            TextField(
              controller: controller,
              keyboardType: TextInputType.number,
              decoration: InputDecoration(
                labelText: 'Amount (LKR)',
                prefixText: 'LKR ',
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                hintText: 'Min: 100',
              ),
            ),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {
                  final amt = double.tryParse(controller.text) ?? 0;
                  Navigator.pop(context);
                  if (amt >= 100) _processTopUp(amt);
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
                child: const Text('Proceed to Payment', style: TextStyle(color: Colors.white, fontSize: 15)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _quickTopUp(double amount) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Quick Top-Up'),
        content: Text('Add LKR ${amount.toStringAsFixed(0)} to your wallet?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary),
            child: const Text('Confirm', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
    if (confirm == true) _processTopUp(amount);
  }

  Future<void> _processTopUp(double amount) async {
    // Navigate to card payment screen for top-up
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => CardPaymentScreen(
          bill: const {},
          topUpAmount: amount,
          onPaymentSuccess: () {
            _showSnack('LKR ${amount.toStringAsFixed(0)} added to wallet!');
            _loadWallet();
            _loadTransactions();
          },
        ),
      ),
    );
  }

  void _showSnack(String msg, {bool isError = false}) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Text(msg),
      backgroundColor: isError ? Colors.red : Colors.green,
      behavior: SnackBarBehavior.floating,
    ));
  }
}
