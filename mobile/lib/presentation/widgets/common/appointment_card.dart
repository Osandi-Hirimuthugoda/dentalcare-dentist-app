import 'package:flutter/material.dart';
// import 'package:dental_care/core/themes/colors.dart';
// import 'package:dental_care/core/themes/text_styles.dart';
// import 'package:dental_care/core/utils/extensions.dart';
import 'package:flutter_application_1/core/themes/colors.dart';
import 'package:flutter_application_1/core/themes/text_styles.dart';
import 'package:flutter_application_1/core/utils/extensions.dart';

class AppointmentCard extends StatelessWidget {
  final String title;
  final String dentistName;
  final DateTime dateTime;
  final String status;
  final Color color;
  final bool isNext;
  final VoidCallback? onTap;

  const AppointmentCard({
    super.key,
    required this.title,
    required this.dentistName,
    required this.dateTime,
    required this.status,
    required this.color,
    this.isNext = false,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: ListTile(
        leading: Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: color.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(
            Icons.calendar_today,
            color: color,
            size: 20,
          ),
        ),
        title: Text(
          title,
          style: TextStyles.bodyMedium.copyWith(
            fontWeight: FontWeight.w600,
          ),
        ),
        subtitle: Text(
          dentistName,
          style: TextStyles.bodySmall.copyWith(
            color: AppColors.textSecondary,
          ),
        ),
        trailing: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Text(
              dateTime.toReadableDate,
              style: TextStyles.bodySmall.copyWith(
                fontWeight: FontWeight.w600,
                color: isNext ? AppColors.primary : AppColors.textPrimary,
              ),
            ),
            Text(
              dateTime.toReadableTime,
              style: TextStyles.caption.copyWith(
                color: AppColors.textSecondary,
              ),
            ),
            if (isNext)
              Container(
                margin: const EdgeInsets.only(top: 4),
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: AppColors.primary.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(
                  "Next",
                  style: TextStyles.overline.copyWith(
                    color: AppColors.primary,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
          ],
        ),
        onTap: onTap,
      ),
    );
  }
}