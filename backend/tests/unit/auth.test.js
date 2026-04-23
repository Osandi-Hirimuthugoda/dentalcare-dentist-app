/**
 * Backend Unit Tests - Auth & Validation Logic
 * Tests pure functions without database connection
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'test_secret_key';

// ── bcrypt password hashing ─────────────────────────────────
describe('Password Hashing', () => {
  test('hashes a password', async () => {
    const hash = await bcrypt.hash('password123', 10);
    expect(hash).toBeDefined();
    expect(hash).not.toBe('password123');
    expect(hash.length).toBeGreaterThan(20);
  });

  test('verifies correct password', async () => {
    const hash = await bcrypt.hash('password123', 10);
    const match = await bcrypt.compare('password123', hash);
    expect(match).toBe(true);
  });

  test('rejects wrong password', async () => {
    const hash = await bcrypt.hash('password123', 10);
    const match = await bcrypt.compare('wrongpassword', hash);
    expect(match).toBe(false);
  });

  test('different hashes for same password', async () => {
    const hash1 = await bcrypt.hash('password123', 10);
    const hash2 = await bcrypt.hash('password123', 10);
    expect(hash1).not.toBe(hash2);
  });
});

// ── JWT token generation ────────────────────────────────────
describe('JWT Token', () => {
  test('generates a valid token', () => {
    const token = jwt.sign({ id: '123', role: 'doctor' }, JWT_SECRET, { expiresIn: '7d' });
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3);
  });

  test('verifies a valid token', () => {
    const token = jwt.sign({ id: '123', role: 'doctor' }, JWT_SECRET);
    const decoded = jwt.verify(token, JWT_SECRET);
    expect(decoded.id).toBe('123');
    expect(decoded.role).toBe('doctor');
  });

  test('throws on invalid token', () => {
    expect(() => jwt.verify('invalid.token.here', JWT_SECRET)).toThrow();
  });

  test('throws on expired token', () => {
    const token = jwt.sign({ id: '123' }, JWT_SECRET, { expiresIn: '-1s' });
    expect(() => jwt.verify(token, JWT_SECRET)).toThrow();
  });

  test('token contains correct payload', () => {
    const payload = { id: 'abc123', role: 'patient', email: 'test@test.com' };
    const token = jwt.sign(payload, JWT_SECRET);
    const decoded = jwt.verify(token, JWT_SECRET);
    expect(decoded.id).toBe('abc123');
    expect(decoded.role).toBe('patient');
  });
});

// ── Input validation logic ──────────────────────────────────
describe('Input Validation', () => {
  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidPhone = (phone) => /^[0-9]{10}$/.test(phone);
  const isValidPassword = (pwd) => typeof pwd === 'string' && pwd.length >= 6;

  test('validates correct email', () => {
    expect(isValidEmail('doctor@test.com')).toBe(true);
  });

  test('rejects invalid email', () => {
    expect(isValidEmail('notanemail')).toBe(false);
    expect(isValidEmail('missing@')).toBe(false);
  });

  test('validates 10-digit phone', () => {
    expect(isValidPhone('0771234567')).toBe(true);
  });

  test('rejects short phone', () => {
    expect(isValidPhone('077123')).toBe(false);
  });

  test('validates password length', () => {
    expect(isValidPassword('abc123')).toBe(true);
    expect(isValidPassword('abc')).toBe(false);
    expect(isValidPassword('')).toBe(false);
    expect(isValidPassword(null)).toBe(false);
  });
});

// ── Data formatting ─────────────────────────────────────────
describe('Data Formatting', () => {
  test('formats doctor response object', () => {
    const doctor = {
      _id: 'doc123',
      fullName: 'Dr. John',
      email: 'john@test.com',
      password: 'hashed_password',
      licenseNumber: 'LIC001',
    };

    // Simulate response formatting (exclude password)
    const { password, ...safeDoctor } = doctor;
    expect(safeDoctor.password).toBeUndefined();
    expect(safeDoctor.fullName).toBe('Dr. John');
    expect(safeDoctor._id).toBe('doc123');
  });

  test('normalizes email to lowercase', () => {
    const email = 'Doctor@Test.COM';
    expect(email.toLowerCase()).toBe('doctor@test.com');
  });

  test('trims whitespace from name', () => {
    const name = '  Dr. John  ';
    expect(name.trim()).toBe('Dr. John');
  });
});
