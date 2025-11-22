import 'package:flutter/material.dart';
import 'package:flutter_application_1/core/themes/colors.dart';
import 'package:flutter_application_1/core/themes/text_styles.dart';

class QuickPaymentMethods extends StatelessWidget {
  final VoidCallback onViewAllMethods;
  final VoidCallback onAddNewMethod;

  const QuickPaymentMethods({
    super.key,
    required this.onViewAllMethods,
    required this.onAddNewMethod,
  });

  @override
  Widget build(BuildContext context) {
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
                  'Payment Methods',
                  style: TextStyles.heading4,
                ),
                IconButton(
                  onPressed: onAddNewMethod,
                  icon: const Icon(Icons.add),
                  tooltip: 'Add Payment Method',
                ),
              ],
            ),
            const SizedBox(height: 15),
            _buildPaymentMethodItem(
              'Credit Card',
              '**** **** **** 1234',
              Icons.credit_card,
              Colors.blue,
            ),
            _buildPaymentMethodItem(
              'Debit Card',
              '**** **** **** 5678',
              Icons.credit_card,
              Colors.green,
            ),
            _buildPaymentMethodItem(
              'PayPal',
              'user@example.com',
              Icons.payment,
              Colors.blue[800]!,
            ),
            _buildPaymentMethodItem(
              'Bank Transfer',
              'Commercial Bank',
              Icons.account_balance,
              Colors.orange,
            ),
            const SizedBox(height: 10),
            SizedBox(
              width: double.infinity,
              child: OutlinedButton(
                onPressed: onViewAllMethods,
                child: const Text('View All Payment Methods'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPaymentMethodItem(String title, String subtitle, IconData icon, Color color) {
    return ListTile(
      leading: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.1),
          shape: BoxShape.circle,
        ),
        child: Icon(icon, color: color, size: 20),
      ),
      title: Text(title, style: TextStyles.bodyMedium),
      subtitle: Text(subtitle, style: TextStyles.bodySmall),
      trailing: Icon(Icons.chevron_right, color: AppColors.textSecondary),
      onTap: () {},
    );
  }
}