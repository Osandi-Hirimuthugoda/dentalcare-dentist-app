import request from 'supertest';
import { app } from '../../server.js';
import { connectDB, closeDB, clearDB } from '../utils/dbSetup.js';
import Doctor from '../../src/models/doctorModel.js';

beforeAll(async () => {
  await connectDB();
});

afterEach(async () => {
  await clearDB();
});

afterAll(async () => {
  await closeDB();
});

const makeDoctor = (overrides = {}) => ({
  fullName: 'Dr. Test Doctor',
  email: 'doctor@test.com',
  password: 'password123',
  phone: '0771234567',
  specialization: 'Orthodontist',
  licenseNumber: 'SLMC-12345',
  ...overrides,
});

describe('Doctor API Endpoints', () => {
  let testDoctor;

  beforeEach(async () => {
    testDoctor = await new Doctor(makeDoctor()).save();
  });

  describe('GET /api/doctors/all', () => {
    it('should return all doctors', async () => {
      const res = await request(app).get('/api/doctors/all');

      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(1);
      expect(res.body[0].fullName).toBe('Dr. Test Doctor');
    });
  });

  describe('GET /api/doctors/profile/:id', () => {
    it('should return doctor details by ID', async () => {
      const res = await request(app).get(`/api/doctors/profile/${testDoctor._id}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.fullName).toBe('Dr. Test Doctor');
    });

    it('should return 404 for non-existent doctor ID', async () => {
      const res = await request(app).get('/api/doctors/profile/60d5ec49f1b2c527088b4567');
      expect(res.statusCode).toEqual(404);
    });
  });

  describe('PUT /api/doctors/:doctorId/profile', () => {
    it('should update doctor profile', async () => {
      const res = await request(app)
        .put(`/api/doctors/${testDoctor._id}/profile`)
        .send({
          fullName: 'Dr. Updated Name',
          specialization: 'Surgeon'
        });

      expect(res.statusCode).toEqual(200);
      // Controller returns { message, doctor }
      expect(res.body.doctor.fullName).toBe('Dr. Updated Name');
    });
  });
});
