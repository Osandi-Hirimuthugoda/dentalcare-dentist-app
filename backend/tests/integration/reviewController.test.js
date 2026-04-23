import request from 'supertest';
import { app } from '../../server.js';
import { connectDB, closeDB, clearDB } from '../utils/dbSetup.js';
import Review from '../../src/models/Review.js';
import Doctor from '../../src/models/doctorModel.js';
import Patient from '../../src/models/Patient.js';
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
  fullName: 'Dr. Review Tester',
  email: 'review@test.com',
  password: 'pass',
  phone: '0770000000',
  specialization: 'Surgeon',
  licenseNumber: 'LIC999',
  ...overrides,
});

const makePatient = (overrides = {}) => ({
  name: 'John Review Patient',
  email: 'johnreview@patient.com',
  phone: '0778889999',
  passwordHash: 'hashed_password_123',
  ...overrides,
});

describe('Review API Endpoints', () => {
  let testDoctor;
  let testPatient;
  let patientToken;

  beforeEach(async () => {
    testDoctor = await new Doctor(makeDoctor()).save();
    testPatient = await new Patient(makePatient()).save();
    // Token with role 'patient' to pass the authenticatePatient middleware
    patientToken = jwt.sign({ id: testPatient._id.toString(), role: 'patient' }, process.env.JWT_SECRET);
  });

  describe('POST /api/reviews', () => {
    it('should submit a review for a doctor', async () => {
      const res = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${patientToken}`)
        .send({
          doctorId: testDoctor._id.toString(),
          rating: 5,
          comment: 'Excellent service!'
        });

      expect([200, 201]).toContain(res.statusCode);
      if ([200, 201].includes(res.statusCode)) {
        // The response shape is { message, review }
        const review = res.body.review;
        expect(review.rating).toBe(5);
        expect(review.comment).toBe('Excellent service!');
      }
    });

    it('should return 400 for rating below 1', async () => {
      const res = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${patientToken}`)
        .send({
          doctorId: testDoctor._id.toString(),
          rating: 0,
          comment: 'Zero star'
        });

      expect(res.statusCode).toBe(400);
    });

    it('should return 401 without auth token', async () => {
      const res = await request(app)
        .post('/api/reviews')
        .send({ doctorId: testDoctor._id.toString(), rating: 4 });

      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/reviews/doctor/:doctorId', () => {
    it('should fetch all reviews for a doctor', async () => {
      await new Review({
        patient: testPatient._id,
        doctor: testDoctor._id,
        rating: 4,
        comment: 'Very good'
      }).save();

      const res = await request(app).get(`/api/reviews/doctor/${testDoctor._id}`);

      expect(res.statusCode).toEqual(200);
      // Controller returns { reviews: [...], totalReviews, hasMore }
      expect(Array.isArray(res.body.reviews)).toBe(true);
      expect(res.body.reviews.length).toBe(1);
      expect(res.body.reviews[0].rating).toBe(4);
    });
  });
});
