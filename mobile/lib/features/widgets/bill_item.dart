import 'package:flutter/material.dart';
import 'package:flutter_application_1/core/themes/colors.dart';
import 'package:flutter_application_1/core/themes/text_styles.dart';

class BillItem extends StatelessWidget {
  final Map<String, dynamic> bill;
  final bool isPayable;
  final VoidCallback onPayNow;
  final bool showBorder;

  const BillItem({
    super.key,
    required this.bill,
    required this.isPayable,
    required this.onPayNow,
    this.showBorder = false,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.grey50,
        borderRadius: BorderRadius.circular(10),
        border: showBorder ? Border.all(
          color: bill['color'].withOpacity(0.3),
          width: 1,
        ) : null,
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: bill['color'].withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(
              bill['icon'],
              color: bill['color'],
              size: 20,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  bill['treatment'],
                  style: TextStyles.bodyMedium.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    Icon(Icons.receipt, size: 12, color: AppColors.textSecondary),
                    const SizedBox(width: 4),
                    Text(
                      bill['id'],
                      style: TextStyles.caption,
                    ),
                    const SizedBox(width: 12),
                    Icon(Icons.calendar_today, size: 12, color: AppColors.textSecondary),
                    const SizedBox(width: 4),
                    Text(
                      bill['date'],
                      style: TextStyles.caption,
                    ),
                  ],
                ),
                if (isPayable) ...[
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      Icon(Icons.warning, size: 12, color: Colors.orange),
                      const SizedBox(width: 4),
                      Text(
                        'Due: ${bill['dueDate']}',
                        style: TextStyles.caption.copyWith(
                          color: Colors.orange,
                        ),
                      ),
                    ],
                  ),
                ],
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                bill['amount'],
                style: TextStyles.bodyMedium.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 4),
              if (isPayable)
                ElevatedButton(
                  onPressed: onPayNow,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: AppColors.white,
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    minimumSize: const Size(0, 0),
                  ),
                  child: Text(
                    'Pay Now',
                    style: TextStyles.caption.copyWith(
                      color: AppColors.white,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                )
              else
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: bill['color'].withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    bill['status'],
                    style: TextStyles.caption.copyWith(
                      color: bill['color'],
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
            ],
          ),
        ],
      ),
    );
  }
}