import request from 'supertest';
import { app } from '../../server.js';
import { connectDB, closeDB, clearDB } from '../utils/dbSetup.js';
import Doctor from '../../src/models/doctorModel.js';
import Patient from '../../src/models/Patient.js';
import Appointment from '../../src/models/Appointment.js';
import jwt from 'jsonwebtoken';

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
  password: 'hashedpassword',
  phone: '0771234567',
  specialization: 'General Dentist',
  licenseNumber: 'LIC123',
  ...overrides,
});

const makePatient = (overrides = {}) => ({
  name: 'Test Patient',
  email: 'patient@test.com',
  phone: '0771111111',
  passwordHash: 'hashed_123',
  ...overrides,
});

describe('Appointment API Endpoints', () => {
  let testDoctor;
  let testPatient;

  beforeEach(async () => {
    testDoctor = await new Doctor(makeDoctor()).save();
    testPatient = await new Patient(makePatient()).save();
  });

  describe('POST /api/appointments', () => {
    it('should create a new appointment', async () => {
      const res = await request(app)
        .post('/api/appointments')
        .send({
          patient: testPatient._id,
          doctor: testDoctor._id,
          startTime: new Date(Date.now() + 86400000).toISOString(),
          notes: 'Regular checkup'
        });

      expect([200, 201]).toContain(res.statusCode);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.notes).toBe('Regular checkup');
    });

    it('should require patient and doctor fields', async () => {
      const res = await request(app)
        .post('/api/appointments')
        .send({ notes: 'Missing required fields' });

      expect([400, 422, 500]).toContain(res.statusCode);
    });
  });

  describe('GET /api/appointments/doctor/:doctorId', () => {
    it('should fetch all appointments for a doctor', async () => {
      await new Appointment({
        patient: testPatient._id,
        doctor: testDoctor._id,
        startTime: new Date(),
        status: 'pending'
      }).save();

      const res = await request(app).get(`/api/appointments/doctor/${testDoctor._id}`);

      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(1);
    });
  });

  describe('PUT /api/appointments/:id', () => {
    it('should update appointment status', async () => {
      const apt = await new Appointment({
        patient: testPatient._id,
        doctor: testDoctor._id,
        startTime: new Date(),
        status: 'pending'
      }).save();

      const res = await request(app)
        .put(`/api/appointments/${apt._id}`)
        .send({ status: 'confirmed' });

      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toBe('confirmed');
    });
  });
});
