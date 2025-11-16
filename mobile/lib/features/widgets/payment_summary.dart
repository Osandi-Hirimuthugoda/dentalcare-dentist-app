import 'package:flutter/material.dart';
import 'package:flutter_application_1/core/themes/colors.dart';
import 'package:flutter_application_1/core/themes/text_styles.dart';

class PaymentSummary extends StatelessWidget {
  final double totalPaid;
  final double totalPending;
  final double totalDue;

  const PaymentSummary({
    super.key,
    required this.totalPaid,
    required this.totalPending,
    required this.totalDue,
  });

  @override
  Widget build(BuildContext context) {
    double totalAmount = totalPaid + totalPending + totalDue;
    double paidPercentage = totalAmount > 0 ? totalPaid / totalAmount : 0;

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Payment Summary',
              style: TextStyles.heading4,
            ),
            const SizedBox(height: 15),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildSummaryItem('Total Paid', 'LKR ${totalPaid.toStringAsFixed(0)}', Colors.green),
                _buildSummaryItem('Pending', 'LKR ${totalPending.toStringAsFixed(0)}', Colors.orange),
                _buildSummaryItem('Due', 'LKR ${totalDue.toStringAsFixed(0)}', Colors.red),
              ],
            ),
            const SizedBox(height: 15),
            LinearProgressIndicator(
              value: paidPercentage,
              backgroundColor: AppColors.grey300,
              valueColor: const AlwaysStoppedAnimation<Color>(Colors.green),
            ),
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('${(paidPercentage * 100).toStringAsFixed(0)}% Paid'),
                Text('${((1 - paidPercentage) * 100).toStringAsFixed(0)}% Pending'),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSummaryItem(String title, String value, Color color) {
    return Column(
      children: [
        Text(
          value,
          style: TextStyles.bodyLarge.copyWith(
            fontWeight: FontWeight.bold,
            color: color,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          title,
          style: TextStyles.caption,
        ),
      ],
    );
  }
}