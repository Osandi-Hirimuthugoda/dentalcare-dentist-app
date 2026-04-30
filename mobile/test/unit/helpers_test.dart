import 'package:flutter_test/flutter_test.dart';
import 'package:flutter/material.dart';
import 'package:flutter_application_1/core/utils/helpers.dart';

void main() {
  group('Helpers - formatDate', () {

    test('formats date with default format dd/MM/yyyy', () {
      final date = DateTime(2026, 4, 5);
      expect(Helpers.formatDate(date), '05/04/2026');
    });

    test('formats date with custom format', () {
      final date = DateTime(2026, 4, 5);
      expect(Helpers.formatDate(date, format: 'yyyy-MM-dd'), '2026-04-05');
    });

    test('formats date with month name format', () {
      final date = DateTime(2026, 4, 5);
      expect(Helpers.formatDate(date, format: 'dd MMM yyyy'), '05 Apr 2026');
    });

    test('formats first day of year', () {
      final date = DateTime(2026, 1, 1);
      expect(Helpers.formatDate(date), '01/01/2026');
    });

    test('formats last day of year', () {
      final date = DateTime(2026, 12, 31);
      expect(Helpers.formatDate(date), '31/12/2026');
    });

  });

  group('Helpers - formatTime', () {

    test('formats time with leading zeros', () {
      const time = TimeOfDay(hour: 9, minute: 5);
      expect(Helpers.formatTime(time), '09:05');
    });

    test('formats noon correctly', () {
      const time = TimeOfDay(hour: 12, minute: 0);
      expect(Helpers.formatTime(time), '12:00');
    });

    test('formats midnight correctly', () {
      const time = TimeOfDay(hour: 0, minute: 0);
      expect(Helpers.formatTime(time), '00:00');
    });

    test('formats end of day correctly', () {
      const time = TimeOfDay(hour: 23, minute: 59);
      expect(Helpers.formatTime(time), '23:59');
    });

  });

  group('Helpers - calculateBMI', () {

    test('calculates BMI correctly for normal weight', () {
      // 70kg, 175cm -> BMI = 70 / (1.75 * 1.75) = 22.86
      final bmi = Helpers.calculateBMI(70, 175);
      expect(bmi, closeTo(22.86, 0.1));
    });

    test('calculates BMI for underweight', () {
      // 45kg, 170cm -> BMI = 15.57
      final bmi = Helpers.calculateBMI(45, 170);
      expect(bmi, closeTo(15.57, 0.1));
    });

    test('calculates BMI for overweight', () {
      // 90kg, 170cm -> BMI = 31.14
      final bmi = Helpers.calculateBMI(90, 170);
      expect(bmi, closeTo(31.14, 0.1));
    });

  });

  group('Helpers - getBMIStatus', () {

    test('returns Underweight for BMI < 18.5', () {
      expect(Helpers.getBMIStatus(17.0), 'Underweight');
    });

    test('returns Normal for BMI 18.5-24.9', () {
      expect(Helpers.getBMIStatus(22.0), 'Normal');
    });

    test('returns Overweight for BMI 25-29.9', () {
      expect(Helpers.getBMIStatus(27.0), 'Overweight');
    });

    test('returns Obese for BMI >= 30', () {
      expect(Helpers.getBMIStatus(32.0), 'Obese');
    });

    test('boundary: 18.5 is Normal', () {
      expect(Helpers.getBMIStatus(18.5), 'Normal');
    });

    test('boundary: 25.0 is Overweight', () {
      expect(Helpers.getBMIStatus(25.0), 'Overweight');
    });

    test('boundary: 30.0 is Obese', () {
      expect(Helpers.getBMIStatus(30.0), 'Obese');
    });

  });
}
