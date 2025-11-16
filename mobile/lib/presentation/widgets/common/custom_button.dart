import 'package:flutter/material.dart';
// import 'package:dental_care/core/themes/colors.dart';
// import 'package:dental_care/core/themes/text_styles.dart';
import 'package:flutter_application_1/core/themes/colors.dart';
import 'package:flutter_application_1/core/themes/text_styles.dart';

class CustomButton extends StatelessWidget {
  final String text;
  final VoidCallback onPressed;
  final bool isLoading;
  final bool isEnabled;
  final Color? backgroundColor;
  final Color? textColor;
  final double? width;
  final double? height;
  final double borderRadius;
  final Widget? prefixIcon;

  const CustomButton({
    super.key,
    required this.text,
    required this.onPressed,
    this.isLoading = false,
    this.isEnabled = true,
    this.backgroundColor,
    this.textColor,
    this.width,
    this.height,
    this.borderRadius = 25,
    this.prefixIcon,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: width ?? double.infinity,
      height: height ?? 50,
      child: ElevatedButton(
        onPressed: isEnabled && !isLoading ? onPressed : null,
        style: ElevatedButton.styleFrom(
          backgroundColor: backgroundColor ?? AppColors.primary,
          disabledBackgroundColor: AppColors.grey300,
          foregroundColor: AppColors.white,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(borderRadius),
          ),
          elevation: 0,
        ),
        child: isLoading
            ? const SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  valueColor: AlwaysStoppedAnimation<Color>(AppColors.white),
                ),
              )
            : Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  if (prefixIcon != null) ...[
                    prefixIcon!,
                    const SizedBox(width: 8),
                  ],
                  Text(
                    text,
                    style: TextStyles.buttonMedium.copyWith(
                      color: textColor ?? AppColors.white,
                    ),
                  ),
                ],
              ),
      ),
    );
  }
}