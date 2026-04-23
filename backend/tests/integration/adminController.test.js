import request from 'supertest';
import { app } from '../../server.js';
import { connectDB, closeDB, clearDB } from '../utils/dbSetup.js';
import Admin from '../../src/models/Admin.js';
import Doctor from '../../src/models/doctorModel.js';
import Patient from '../../src/models/Patient.js';
import Appointment from '../../src/models/Appointment.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

beforeAll(async () => {
  await connectDB();
});

afterEach(async () => {
  await clearDB();
});

afterAll(async () => {
  await closeDB();
});

describe('Admin API Endpoints', () => {
  let adminToken;
  let testAdmin;

  beforeEach(async () => {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    testAdmin = await new Admin({
      name: 'System Admin',
      email: 'admin@test.com',
      password: hashedPassword
    }).save();

    adminToken = jwt.sign({ id: testAdmin._id.toString(), role: 'admin' }, process.env.JWT_SECRET);

    // Seed supporting data
    const doc = await new Doctor({
      fullName: 'Dr. Test',
      email: 'doc@test.com',
      password: 'pass',
      phone: '0771112222',
      specialization: 'Dentist',
      licenseNumber: 'L1'
    }).save();

    const p = await new Patient({
      name: 'Test Patient',
      email: 'pat@test.com',
      phone: '0773334444',
      passwordHash: 'hashed_password_123'
    }).save();

    await new Appointment({
      patient: p._id,
      doctor: doc._id,
      startTime: new Date(),
      status: 'pending'
    }).save();
  });

  describe('GET /api/admins/dashboard/stats', () => {
    it('should return system statistics for admin dashboard', async () => {
      const res = await request(app)
        .get('/api/admins/dashboard/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('stats');
      expect(res.body.stats).toHaveProperty('totalDoctors');
      expect(res.body.stats.totalDoctors).toBeGreaterThanOrEqual(1);
    });
  });

  describe('POST /api/admins/login', () => {
    it('should login an existing admin', async () => {
      const res = await request(app)
        .post('/api/admins/login')
        .send({
          email: 'admin@test.com',
          password: 'admin123'
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('admin');
      expect(res.body.admin).toHaveProperty('token');
    });

    it('should fail with invalid credentials', async () => {
      const res = await request(app)
        .post('/api/admins/login')
        .send({
          email: 'admin@test.com',
          password: 'wrongpassword'
        });

      expect(res.statusCode).toEqual(401);
    });
  });
});
