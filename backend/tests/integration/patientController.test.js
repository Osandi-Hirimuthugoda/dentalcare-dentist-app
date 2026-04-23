import request from 'supertest';
import { app } from '../../server.js';
import { connectDB, closeDB, clearDB } from '../utils/dbSetup.js';
import Patient from '../../src/models/Patient.js';
import Doctor from '../../src/models/doctorModel.js';
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

// Reusable factory helpers that satisfy model validation
const makePatient = (overrides = {}) => ({
  name: 'John Doe',
  email: 'john@test.com',
  phone: '0771234567',
  passwordHash: 'hashed_password_123',
  ...overrides,
});

const makeDoctor = (overrides = {}) => ({
  _id: '60d0fe4f5311236168a109ca',
  fullName: 'Dr. Test Doctor',
  email: 'doctor@test.com',
  password: 'hashedpassword',
  phone: '0771234567',
  specialization: 'General Dentist',
  licenseNumber: 'LIC123',
  ...overrides,
});

describe('Patient API Endpoints', () => {
  const doctorToken = jwt.sign({ id: '60d0fe4f5311236168a109ca', role: 'doctor' }, process.env.JWT_SECRET);

  let testDoctor;

  beforeEach(async () => {
    testDoctor = new Doctor(makeDoctor());
    await testDoctor.save();
  });

  describe('POST /api/patients', () => {
    it('should create a new patient', async () => {
      const res = await request(app)
        .post('/api/patients')
        .send({
          name: 'John Doe',
          email: 'john@test.com',
          phone: '0771234567',
          password: 'password123',
          age: 30,
          gender: 'male'
        });

      expect([200, 201]).toContain(res.statusCode);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.name).toEqual('John Doe');
    });

    it('should not create a patient with duplicate email', async () => {
      await new Patient(makePatient({ email: 'jane@test.com', phone: '0779876543' })).save();

      const res = await request(app)
        .post('/api/patients')
        .send({
          name: 'Jane Clone',
          email: 'jane@test.com',
          phone: '0771111111',
          password: 'password123'
        });

      expect([400, 409]).toContain(res.statusCode);
    });
  });

  describe('GET /api/patients/doctor/:doctorId', () => {
    it('should return patients associated with a specific doctor', async () => {
      const patient = new Patient(makePatient());
      await patient.save();

      await new Appointment({
        patient: patient._id,
        doctor: testDoctor._id,
        startTime: new Date(),
        status: 'completed'
      }).save();

      const res = await request(app)
        .get(`/api/patients/doctor/${testDoctor._id}`)
        .set('Authorization', `Bearer ${doctorToken}`);

      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(1);
    });

    it('should return unique patients even with multiple appointments', async () => {
      const patient = new Patient(makePatient());
      await patient.save();

      await new Appointment({ patient: patient._id, doctor: testDoctor._id, startTime: new Date(), status: 'completed' }).save();
      await new Appointment({ patient: patient._id, doctor: testDoctor._id, startTime: new Date(Date.now() + 86400000), status: 'pending' }).save();

      const res = await request(app)
        .get(`/api/patients/doctor/${testDoctor._id}`)
        .set('Authorization', `Bearer ${doctorToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toBe(1); // Still 1 unique patient
    });
  });

  describe('GET /api/patients', () => {
    it('should return all patients', async () => {
      await new Patient(makePatient({ email: 'p1@test.com', phone: '0770000001' })).save();
      await new Patient(makePatient({ email: 'p2@test.com', phone: '0770000002', name: 'Jane' })).save();

      const res = await request(app).get('/api/patients');

      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('PUT /api/patients/:id', () => {
    it('should update patient details', async () => {
      const patient = new Patient(makePatient());
      await patient.save();

      const res = await request(app)
        .put(`/api/patients/${patient._id}`)
        .send({
          diagnosis: 'Cavity detected',
          doctorNotes: 'Needs filling next week'
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.diagnosis).toBe('Cavity detected');
    });
  });
});
