import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_application_1/core/utils/validators.dart';

void main() {
  group('Validators', () {

    // ── Email ──────────────────────────────────────────────
    group('validateEmail', () {
      test('valid email returns null', () {
        expect(Validators.validateEmail('test@example.com'), isNull);
      });
      test('empty email returns error', () {
        expect(Validators.validateEmail(''), isNotNull);
      });
      test('null email returns error', () {
        expect(Validators.validateEmail(null), isNotNull);
      });
      test('missing @ returns error', () {
        expect(Validators.validateEmail('notanemail'), isNotNull);
      });
      test('missing domain returns error', () {
        expect(Validators.validateEmail('test@'), isNotNull);
      });
    });

    // ── Password ───────────────────────────────────────────
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
      test('null password returns error', () {
        expect(Validators.validatePassword(null), isNotNull);
      });
      test('exactly 6 chars is valid', () {
        expect(Validators.validatePassword('abc123'), isNull);
      });
    });

    // ── Password Strength ──────────────────────────────────
    group('validatePasswordStrength', () {
      test('strong password returns null', () {
        expect(Validators.validatePasswordStrength('Pass123'), isNull);
      });
      test('only letters returns error', () {
        expect(Validators.validatePasswordStrength('password'), isNotNull);
      });
      test('only numbers returns error', () {
        expect(Validators.validatePasswordStrength('123456'), isNotNull);
      });
      test('too short returns error', () {
        expect(Validators.validatePasswordStrength('Ab1'), isNotNull);
      });
      test('empty returns error', () {
        expect(Validators.validatePasswordStrength(''), isNotNull);
      });
    });

    // ── Phone ──────────────────────────────────────────────
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
      test('null phone returns error', () {
        expect(Validators.validatePhone(null), isNotNull);
      });
      test('letters in phone returns error', () {
        expect(Validators.validatePhone('077abc4567'), isNotNull);
      });
    });

    // ── Name ───────────────────────────────────────────────
    group('validateName', () {
      test('valid name returns null', () {
        expect(Validators.validateName('John'), isNull);
      });
      test('single character returns error', () {
        expect(Validators.validateName('J'), isNotNull);
      });
      test('empty name returns error', () {
        expect(Validators.validateName(''), isNotNull);
      });
      test('null name returns error', () {
        expect(Validators.validateName(null), isNotNull);
      });
      test('two characters is valid', () {
        expect(Validators.validateName('Jo'), isNull);
      });
    });

    // ── Age ────────────────────────────────────────────────
    group('validateAge', () {
      test('valid age returns null', () {
        expect(Validators.validateAge('25'), isNull);
      });
      test('age 0 returns error', () {
        expect(Validators.validateAge('0'), isNotNull);
      });
      test('age 151 returns error', () {
        expect(Validators.validateAge('151'), isNotNull);
      });
      test('non-numeric returns error', () {
        expect(Validators.validateAge('abc'), isNotNull);
      });
      test('empty returns error', () {
        expect(Validators.validateAge(''), isNotNull);
      });
      test('age 1 is valid', () {
        expect(Validators.validateAge('1'), isNull);
      });
      test('age 150 is valid', () {
        expect(Validators.validateAge('150'), isNull);
      });
    });

    // ── OTP ────────────────────────────────────────────────
    group('validateOTP', () {
      test('valid 6-digit OTP returns null', () {
        expect(Validators.validateOTP('123456'), isNull);
      });
      test('short OTP returns error', () {
        expect(Validators.validateOTP('123'), isNotNull);
      });
      test('long OTP returns error', () {
        expect(Validators.validateOTP('1234567'), isNotNull);
      });
      test('empty OTP returns error', () {
        expect(Validators.validateOTP(''), isNotNull);
      });
      test('null OTP returns error', () {
        expect(Validators.validateOTP(null), isNotNull);
      });
    });

    // ── Gender ─────────────────────────────────────────────
    group('validateGender', () {
      test('male is valid', () {
        expect(Validators.validateGender('male'), isNull);
      });
      test('female is valid', () {
        expect(Validators.validateGender('female'), isNull);
      });
      test('other is valid', () {
        expect(Validators.validateGender('other'), isNull);
      });
      test('invalid gender returns error', () {
        expect(Validators.validateGender('unknown'), isNotNull);
      });
      test('empty returns error', () {
        expect(Validators.validateGender(''), isNotNull);
      });
    });

    // ── Required ───────────────────────────────────────────
    group('validateRequired', () {
      test('non-empty value returns null', () {
        expect(Validators.validateRequired('some value', 'Field'), isNull);
      });
      test('empty value returns error', () {
        expect(Validators.validateRequired('', 'Field'), isNotNull);
      });
      test('null value returns error', () {
        expect(Validators.validateRequired(null, 'Field'), isNotNull);
      });
    });

  });
}
