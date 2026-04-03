import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_application_1/core/utils/validators.dart';

void main() {
  group('Validators', () {
    group('validateEmail', () {
      test('valid email returns null', () {
        expect(Validators.validateEmail('test@example.com'), isNull);
      });

      test('empty email returns error', () {
        expect(Validators.validateEmail(''), isNotNull);
      });

      test('invalid email returns error', () {
        expect(Validators.validateEmail('notanemail'), isNotNull);
      });
    });

    group('validatePassword', () {
      test('valid password returns null', () {
        expect(Validators.validatePassword('password123'), isNull);
      });

      test('short password returns error', () {
        expect(Validators.validatePassword('abc'), isNotNull);
      });

      test('empty password returns error', () {
        expect(Validators.validatePassword(''), isNotNull);
      });
    });

    group('validatePhone', () {
      test('valid 10-digit phone returns null', () {
        expect(Validators.validatePhone('0771234567'), isNull);
      });

      test('short phone returns error', () {
        expect(Validators.validatePhone('077123'), isNotNull);
      });

      test('empty phone returns error', () {
        expect(Validators.validatePhone(''), isNotNull);
      });
    });

    group('validateName', () {
      test('valid name returns null', () {
        expect(Validators.validateName('John'), isNull);
      });

      test('single character name returns error', () {
        expect(Validators.validateName('J'), isNotNull);
      });

      test('empty name returns error', () {
        expect(Validators.validateName(''), isNotNull);
      });
    });

    group('validateAge', () {
      test('valid age returns null', () {
        expect(Validators.validateAge('25'), isNull);
      });

      test('age 0 returns error', () {
        expect(Validators.validateAge('0'), isNotNull);
      });

      test('non-numeric age returns error', () {
        expect(Validators.validateAge('abc'), isNotNull);
      });
    });
  });
}
