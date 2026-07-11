import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app.js';
import User from '../models/User.js';

const TEST_MONGODB_URI = 'mongodb://127.0.0.1:27017/car-dealership-test';

beforeAll(async () => {
  // Connect to the test database
  await mongoose.connect(TEST_MONGODB_URI);
});

afterAll(async () => {
  // Clean up database and close connection
  try {
    await mongoose.connection.db.dropDatabase();
  } catch (error) {
    // Database might not be initialized yet
  }
  await mongoose.disconnect();
});

beforeEach(async () => {
  // Clear the users collection before each test
  await User.deleteMany({});
});

describe('Auth Endpoints', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });
      
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('email', 'test@example.com');
      expect(res.body.user).not.toHaveProperty('password');
    });

    it('should fail registration if email is already registered', async () => {
      // First register
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      // Try registering again with same email
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password999'
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message');
    });

    it('should fail registration if email or password is missing', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'no-password@example.com'
        });

      expect(res.status).toBe(400);
    });

    it('should ignore a client-supplied role and always register as "user" (privilege-escalation regression)', async () => {
      // Regression test: registerUser previously trusted `role` straight
      // from the request body, so anyone could self-register as admin.
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'wannabe-admin@example.com',
          password: 'password123',
          role: 'admin'
        });

      expect(res.status).toBe(201);
      expect(res.body.user).toHaveProperty('role', 'user');

      const stored = await User.findOne({ email: 'wannabe-admin@example.com' });
      expect(stored.role).toBe('user');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Register a user directly to database or endpoint
      await User.create({
        email: 'login@example.com',
        password: 'securePassword123' // note: in implementation, this must be hashed
      });
    });

    it('should login successfully with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'securePassword123'
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('email', 'login@example.com');
    });

    it('should fail login with incorrect password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'wrongPassword'
        });

      expect(res.status).toBe(401);
      expect(res.body).not.toHaveProperty('token');
    });

    it('should fail login with non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'somePassword'
        });

      expect(res.status).toBe(401);
    });
  });
});
