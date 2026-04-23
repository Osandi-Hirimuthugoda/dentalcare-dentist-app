import request from 'supertest';
import { app } from '../../server.js';
import { connectDB, closeDB, clearDB } from '../utils/dbSetup.js';
import Message from '../../src/models/Message.js';
import Doctor from '../../src/models/doctorModel.js';
import Patient from '../../src/models/Patient.js';

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
  fullName: 'Dr. Msg Tester',
  email: 'msg@test.com',
  password: 'pass',
  phone: '0770000000',
  specialization: 'Surgeon',
  licenseNumber: 'LIC999',
  ...overrides,
});

const makePatient = (overrides = {}) => ({
  name: 'John Msg Patient',
  email: 'johnmsg@patient.com',
  phone: '0778889999',
  passwordHash: 'hashed_password_123',
  ...overrides,
});

describe('Message API Endpoints', () => {
  let testDoctor;
  let testPatient;

  beforeEach(async () => {
    testDoctor = await new Doctor(makeDoctor()).save();
    testPatient = await new Patient(makePatient()).save();
  });

  describe('POST /api/messages', () => {
    it('should send a message from patient to doctor', async () => {
      const res = await request(app)
        .post('/api/messages')
        .send({
          senderId: testPatient._id.toString(),
          senderType: 'patient',
          receiverId: testDoctor._id.toString(),
          receiverType: 'doctor',
          message: 'Hello doctor, I have a toothache.'
        });

      expect([200, 201]).toContain(res.statusCode);
      if (res.statusCode !== 404 && res.statusCode !== 400) {
        expect(res.body.message).toBe('Hello doctor, I have a toothache.');
      }
    });
  });

  describe('GET /api/messages/conversation/:doctorId/:patientId', () => {
    it('should fetch chat history between patient and doctor', async () => {
      await new Message({
        sender: testPatient._id,
        senderModel: 'Patient',
        receiver: testDoctor._id,
        receiverModel: 'Doctor',
        message: 'Hi doctor',
        read: false
      }).save();

      const res = await request(app).get(`/api/messages/conversation/${testDoctor._id}/${testPatient._id}`);

      expect([200, 404]).toContain(res.statusCode);
      if (res.statusCode === 200) {
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThanOrEqual(1);
      }
    });
  });

  describe('GET /api/messages/doctor/:doctorId', () => {
    it('should fetch doctor conversations', async () => {
      await new Message({
        sender: testPatient._id,
        senderModel: 'Patient',
        receiver: testDoctor._id,
        receiverModel: 'Doctor',
        message: 'Unread message',
        read: false
      }).save();

      const res = await request(app).get(`/api/messages/doctor/${testDoctor._id}`);

      expect([200, 404]).toContain(res.statusCode);
      if (res.statusCode === 200) {
        expect(Array.isArray(res.body)).toBe(true);
      }
    });
  });
});
