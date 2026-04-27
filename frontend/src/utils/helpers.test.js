import {
  formatDate,
  formatTime,
  formatCurrency,
  truncateText,
  getInitials,
  isValidEmail,
  isValidPhone,
  getErrorMessage,
  deepClone,
} from './helpers';

// ── formatDate ──────────────────────────────────────────────
describe('formatDate', () => {
  test('returns empty string for null', () => {
    expect(formatDate(null)).toBe('');
  });

  test('returns empty string for undefined', () => {
    expect(formatDate(undefined)).toBe('');
  });

  test('formats a valid date string', () => {
    const result = formatDate('2026-04-05');
    expect(result).toContain('2026');
    expect(result).toContain('April');
  });

  test('formats a Date object', () => {
    const result = formatDate(new Date('2026-01-15'));
    expect(result).toContain('2026');
    expect(result).toContain('January');
  });
});

// ── formatTime ──────────────────────────────────────────────
describe('formatTime', () => {
  test('returns empty string for null', () => {
    expect(formatTime(null)).toBe('');
  });

  test('returns empty string for undefined', () => {
    expect(formatTime(undefined)).toBe('');
  });

  test('formats a valid time', () => {
    const result = formatTime('2026-04-05T09:30:00');
    expect(result).toMatch(/\d{1,2}:\d{2}/);
  });
});

// ── formatCurrency ──────────────────────────────────────────
describe('formatCurrency', () => {
  test('returns $0.00 for null', () => {
    expect(formatCurrency(null)).toBe('$0.00');
  });

  test('returns $0.00 for 0', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  test('formats positive amount', () => {
    const result = formatCurrency(1500);
    expect(result).toContain('1,500');
  });

  test('formats decimal amount', () => {
    const result = formatCurrency(9.99);
    expect(result).toContain('9.99');
  });
});

// ── truncateText ────────────────────────────────────────────
describe('truncateText', () => {
  test('returns empty string for null', () => {
    expect(truncateText(null)).toBe('');
  });

  test('returns text unchanged if within limit', () => {
    expect(truncateText('Hello', 10)).toBe('Hello');
  });

  test('truncates text exceeding limit', () => {
    const result = truncateText('This is a very long text', 10);
    expect(result).toBe('This is a ...');
  });

  test('uses default maxLength of 50', () => {
    const long = 'a'.repeat(60);
    const result = truncateText(long);
    expect(result.length).toBe(53); // 50 + '...'
  });

  test('returns exact text at limit boundary', () => {
    expect(truncateText('Hello', 5)).toBe('Hello');
  });
});

// ── getInitials ─────────────────────────────────────────────
describe('getInitials', () => {
  test('returns empty string for null', () => {
    expect(getInitials(null)).toBe('');
  });

  test('returns empty string for empty string', () => {
    expect(getInitials('')).toBe('');
  });

  test('returns initials for full name', () => {
    expect(getInitials('John Doe')).toBe('JD');
  });

  test('returns single initial for single name', () => {
    expect(getInitials('John')).toBe('J');
  });

  test('returns uppercase initials', () => {
    expect(getInitials('alice bob')).toBe('AB');
  });

  test('returns max 2 initials', () => {
    expect(getInitials('John Michael Doe')).toBe('JM');
  });
});

// ── isValidEmail ────────────────────────────────────────────
describe('isValidEmail', () => {
  test('returns true for valid email', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
  });

  test('returns false for missing @', () => {
    expect(isValidEmail('testexample.com')).toBe(false);
  });

  test('returns false for missing domain', () => {
    expect(isValidEmail('test@')).toBe(false);
  });

  test('returns false for empty string', () => {
    expect(isValidEmail('')).toBe(false);
  });

  test('returns true for email with subdomain', () => {
    expect(isValidEmail('user@mail.example.com')).toBe(true);
  });
});

// ── isValidPhone ────────────────────────────────────────────
describe('isValidPhone', () => {
  test('returns true for valid phone number', () => {
    expect(isValidPhone('0771234567')).toBe(true);
  });

  test('returns true for phone with +', () => {
    expect(isValidPhone('+94771234567')).toBe(true);
  });

  test('returns true for phone with spaces', () => {
    expect(isValidPhone('077 123 4567')).toBe(true);
  });

  test('returns false for letters in phone', () => {
    expect(isValidPhone('077abc4567')).toBe(false);
  });
});

// ── getErrorMessage ─────────────────────────────────────────
describe('getErrorMessage', () => {
  test('returns string directly', () => {
    expect(getErrorMessage('Something went wrong')).toBe('Something went wrong');
  });

  test('returns message from Error object', () => {
    expect(getErrorMessage(new Error('Network error'))).toBe('Network error');
  });

  test('returns API response message', () => {
    const err = { response: { data: { message: 'Unauthorized' } } };
    expect(getErrorMessage(err)).toBe('Unauthorized');
  });

  test('returns default message for unknown error', () => {
    expect(getErrorMessage({})).toBe('An unexpected error occurred');
  });
});

// ── deepClone ───────────────────────────────────────────────
describe('deepClone', () => {
  test('clones a simple object', () => {
    const obj = { name: 'John', age: 30 };
    const clone = deepClone(obj);
    expect(clone).toEqual(obj);
    expect(clone).not.toBe(obj);
  });

  test('clones nested object', () => {
    const obj = { user: { name: 'John', address: { city: 'Colombo' } } };
    const clone = deepClone(obj);
    clone.user.address.city = 'Kandy';
    expect(obj.user.address.city).toBe('Colombo');
  });

  test('clones array', () => {
    const arr = [1, 2, { a: 3 }];
    const clone = deepClone(arr);
    expect(clone).toEqual(arr);
    expect(clone).not.toBe(arr);
  });
});
