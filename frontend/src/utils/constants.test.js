import { USER_ROLES, ROUTES, STORAGE_KEYS, API_BASE_URL } from './constants';

// ── USER_ROLES ──────────────────────────────────────────────
describe('USER_ROLES', () => {
  test('has ADMIN role', () => {
    expect(USER_ROLES.ADMIN).toBe('admin');
  });

  test('has DOCTOR role', () => {
    expect(USER_ROLES.DOCTOR).toBe('doctor');
  });

  test('has PATIENT role', () => {
    expect(USER_ROLES.PATIENT).toBe('patient');
  });

  test('has exactly 3 roles', () => {
    expect(Object.keys(USER_ROLES)).toHaveLength(3);
  });
});

// ── ROUTES ──────────────────────────────────────────────────
describe('ROUTES', () => {
  test('HOME is /', () => {
    expect(ROUTES.HOME).toBe('/');
  });

  test('ADMIN_LOGIN defined', () => {
    expect(ROUTES.ADMIN_LOGIN).toBeDefined();
    expect(ROUTES.ADMIN_LOGIN).toContain('admin');
  });

  test('DOCTOR_LOGIN defined', () => {
    expect(ROUTES.DOCTOR_LOGIN).toBeDefined();
    expect(ROUTES.DOCTOR_LOGIN).toContain('doctor');
  });

  test('DOCTOR_DASHBOARD defined', () => {
    expect(ROUTES.DOCTOR_DASHBOARD).toBeDefined();
  });

  test('all routes start with /', () => {
    Object.values(ROUTES).forEach(route => {
      expect(route).toMatch(/^\//);
    });
  });

  test('has admin routes', () => {
    expect(ROUTES.ADMIN_DASHBOARD).toBeDefined();
    expect(ROUTES.ADMIN_DOCTORS).toBeDefined();
    expect(ROUTES.ADMIN_PATIENTS).toBeDefined();
  });

  test('has doctor routes', () => {
    expect(ROUTES.DOCTOR_APPOINTMENTS).toBeDefined();
    expect(ROUTES.DOCTOR_MESSAGES).toBeDefined();
    expect(ROUTES.DOCTOR_PROFILE).toBeDefined();
  });

  test('has patient routes', () => {
    expect(ROUTES.PATIENT_HEALTH).toBeDefined();
    expect(ROUTES.PATIENT_BILLS).toBeDefined();
  });
});

// ── STORAGE_KEYS ────────────────────────────────────────────
describe('STORAGE_KEYS', () => {
  test('has TOKEN key', () => {
    expect(STORAGE_KEYS.TOKEN).toBe('token');
  });

  test('has USER key', () => {
    expect(STORAGE_KEYS.USER).toBeDefined();
  });

  test('has THEME key', () => {
    expect(STORAGE_KEYS.THEME).toBeDefined();
  });

  test('all keys are strings', () => {
    Object.values(STORAGE_KEYS).forEach(key => {
      expect(typeof key).toBe('string');
    });
  });
});

// ── API_BASE_URL ────────────────────────────────────────────
describe('API_BASE_URL', () => {
  test('is defined', () => {
    expect(API_BASE_URL).toBeDefined();
  });

  test('is a string', () => {
    expect(typeof API_BASE_URL).toBe('string');
  });

  test('contains api', () => {
    expect(API_BASE_URL.toLowerCase()).toContain('api');
  });
});
