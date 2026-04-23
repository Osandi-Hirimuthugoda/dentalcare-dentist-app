import request from 'supertest';
import { app } from '../../server.js';
import { connectDB, closeDB, clearDB } from '../utils/dbSetup.js';
import ScanQA from '../../src/models/ScanQA.js';
import Doctor from '../../src/models/doctorModel.js';
import Patient from '../../src/models/Patient.js';
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
  fullName: 'Dr. Scan Tester',
  email: 'scan@test.com',
  password: 'pass',
  phone: '0770000000',
  specialization: 'Surgeon',
  licenseNumber: 'LIC999',
  ...overrides,
});

const makePatient = (overrides = {}) => ({
  name: 'John Scan Patient',
  email: 'johnscan@patient.com',
  phone: '0778889999',
  passwordHash: 'hashed_password_123',
  ...overrides,
});

describe('Scan QA API Endpoints', () => {
  let testDoctor;
  let testPatient;
  let doctorToken;

  beforeEach(async () => {
    testDoctor = await new Doctor(makeDoctor()).save();
    testPatient = await new Patient(makePatient()).save();
    doctorToken = jwt.sign({ id: testDoctor._id.toString(), role: 'doctor' }, process.env.JWT_SECRET);
  });

  describe('GET /api/scan-qa/pending', () => {
    it('should fetch pending scan QAs', async () => {
      await new ScanQA({
        scanId: uuidv4(),
        patientId: testPatient._id,
        doctorId: testDoctor._id,
        imageUrl: '/test-image.jpg',
        analysisResults: { prediction: 'Cavity', confidence: 95 },
        status: 'pending_qa'
      }).save();

      const res = await request(app)
        .get('/api/scan-qa/pending')
        .set('Authorization', `Bearer ${doctorToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.scans)).toBe(true);
    });
  });

  describe('POST /api/scan-qa/:scanId/question', () => {
    it('should allow doctor to add a question to a scan', async () => {
      const scanId = uuidv4();
      await new ScanQA({
        scanId: scanId,
        patientId: testPatient._id,
        doctorId: testDoctor._id,
        imageUrl: '/test-image.jpg',
        analysisResults: { prediction: 'Cavity' },
        status: 'pending_qa'
      }).save();

      const res = await request(app)
        .post(`/api/scan-qa/${scanId}/question`)
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          question: 'Is this serious?'
        });

      expect([200, 201]).toContain(res.statusCode);
      if (res.statusCode === 200 || res.statusCode === 201) {
        expect(res.body.success).toBe(true);
        expect(res.body.question.question).toBe('Is this serious?');
      }
    });
  });
});
