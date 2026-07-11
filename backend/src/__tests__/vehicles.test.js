import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app.js';
import User from '../models/User.js';
import Vehicle from '../models/Vehicle.js';
import jwt from 'jsonwebtoken';

const TEST_MONGODB_URI = 'mongodb://127.0.0.1:27017/car-dealership-test';

let userToken, adminToken;
let regularUser, adminUser;
let sampleVehicleId;

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'super_secret_car_dealership_jwt_key_99', {
    expiresIn: '1h'
  });
};

beforeAll(async () => {
  await mongoose.connect(TEST_MONGODB_URI);
});

afterAll(async () => {
  try {
    await mongoose.connection.db.dropDatabase();
  } catch (error) {}
  await mongoose.disconnect();
});

beforeEach(async () => {
  await User.deleteMany({});
  await Vehicle.deleteMany({});

  regularUser = await User.create({ email: 'user@example.com', password: 'password123', role: 'user' });
  userToken = generateToken(regularUser._id);

  adminUser = await User.create({ email: 'admin@example.com', password: 'password123', role: 'admin' });
  adminToken = generateToken(adminUser._id);

  const vehicle = await Vehicle.create({
    make: 'Tesla', model: 'Model Y', category: 'Electric', price: 49999, quantity: 5
  });
  sampleVehicleId = vehicle._id.toString();
});

describe('Vehicle Endpoints', () => {

  describe('GET /api/vehicles', () => {
    it('should fail if no token is provided', async () => {
      const res = await request(app).get('/api/vehicles');
      expect(res.status).toBe(401);
    });

    it('should fail if the token is malformed', async () => {
      const res = await request(app)
        .get('/api/vehicles')
        .set('Authorization', 'Bearer not-a-real-token');
      expect(res.status).toBe(401);
    });

    it('should fail if the token is expired', async () => {
      const expiredToken = jwt.sign(
        { id: regularUser._id },
        process.env.JWT_SECRET,
        { expiresIn: '-1s' }
      );
      const res = await request(app)
        .get('/api/vehicles')
        .set('Authorization', `Bearer ${expiredToken}`);
      expect(res.status).toBe(401);
    });

    it('should fail if the token was signed with a different secret', async () => {
      const forgedToken = jwt.sign({ id: regularUser._id }, 'a-completely-different-secret', { expiresIn: '1h' });
      const res = await request(app)
        .get('/api/vehicles')
        .set('Authorization', `Bearer ${forgedToken}`);
      expect(res.status).toBe(401);
    });

    it('should return all vehicles if user is authenticated', async () => {
      const res = await request(app)
        .get('/api/vehicles')
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body).toBeInstanceOf(Array);
      expect(res.body.length).toBe(1);
      expect(res.body[0]).toHaveProperty('make', 'Tesla');
    });
  });
});
