import request from 'supertest';
import { app } from '../../server.js';
import { connectDB, closeDB, clearDB } from '../utils/dbSetup.js';
import Bill from '../../src/models/Bill.js';
import Doctor from '../../src/models/doctorModel.js';
import Patient from '../../src/models/Patient.js';
import Appointment from '../../src/models/Appointment.js';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

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
  fullName: 'Dr. Billing Tester',
  email: 'bill@test.com',
  password: 'pass',
  phone: '0770000000',
  specialization: 'Surgeon',
  licenseNumber: 'LIC999',
  ...overrides,
});

const makePatient = (overrides = {}) => ({
  name: 'John Patient',
  email: 'john@patient.com',
  phone: '0778889999',
  passwordHash: 'hashed_password_123',
  ...overrides,
});

describe('Bill API Endpoints', () => {
  let testDoctor;
  let testPatient;
  let doctorToken;
  let patientToken;

  beforeEach(async () => {
    testDoctor = await new Doctor(makeDoctor()).save();
    testPatient = await new Patient(makePatient()).save();
    
    doctorToken = jwt.sign({ id: testDoctor._id.toString(), role: 'doctor' }, process.env.JWT_SECRET);
    patientToken = jwt.sign({ id: testPatient._id.toString(), role: 'patient' }, process.env.JWT_SECRET);
  });

  describe('POST /api/bills/from-appointment', () => {
    it('should create a new bill from an appointment', async () => {
      const appointment = await new Appointment({
        patient: testPatient._id,
        doctor: testDoctor._id,
        startTime: new Date(),
        status: 'pending',
        notes: 'Tooth Extraction: Procedure went well'
      }).save();

      const res = await request(app)
        .post('/api/bills/from-appointment')
        .set('Authorization', `Bearer ${patientToken}`)
        .send({
          appointmentId: appointment._id.toString()
        });

      expect([200, 201]).toContain(res.statusCode);
      if (res.statusCode === 201 || res.statusCode === 200) {
        expect(res.body).toHaveProperty('_id');
        expect(res.body.amount).toBe(5000); // Cost for Tooth Extraction
      }
    });
  });

  describe('GET /api/bills/doctor/bills', () => {
    it('should fetch bills for the logged-in doctor', async () => {
      await new Bill({
        billNumber: uuidv4(),
        patient: testPatient._id,
        doctor: testDoctor._id,
        service: 'Consultation',
        amount: 3000,
        total: 3000,
        dueDate: new Date(Date.now() + 86400000),
        status: 'pending'
      }).save();

      const res = await request(app)
        .get('/api/bills/doctor/bills')
        .set('Authorization', `Bearer ${doctorToken}`);

      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(1);
    });
  });
});
