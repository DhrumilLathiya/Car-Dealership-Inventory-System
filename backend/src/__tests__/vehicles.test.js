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

// Helper to generate token
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
  } catch (error) {
    // Database might not be initialized yet
  }
  await mongoose.disconnect();
});

beforeEach(async () => {
  // Clear collections
  await User.deleteMany({});
  await Vehicle.deleteMany({});

  // Seed Users
  regularUser = await User.create({
    email: 'user@example.com',
    password: 'password123',
    role: 'user'
  });
  userToken = generateToken(regularUser._id);

  adminUser = await User.create({
    email: 'admin@example.com',
    password: 'password123',
    role: 'admin'
  });
  adminToken = generateToken(adminUser._id);

  // Seed one vehicle
  const vehicle = await Vehicle.create({
    make: 'Tesla',
    model: 'Model Y',
    category: 'Electric',
    price: 49999,
    quantity: 5
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
        { expiresIn: '-1s' } // already expired
      );

      const res = await request(app)
        .get('/api/vehicles')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(res.status).toBe(401);
    });

    it('should fail if the token was signed with a different secret', async () => {
      const forgedToken = jwt.sign({ id: regularUser._id }, 'a-completely-different-secret', {
        expiresIn: '1h'
      });

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

  describe('POST /api/vehicles', () => {
    const newVehicle = {
      make: 'Ford',
      model: 'Mustang',
      category: 'Sports',
      price: 36000,
      quantity: 3
    };

    it('should fail if user is not an admin', async () => {
      const res = await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${userToken}`)
        .send(newVehicle);
      
      expect(res.status).toBe(403);
    });

    it('should succeed if user is an admin', async () => {
      const res = await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newVehicle);
      
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('make', 'Ford');
      expect(res.body).toHaveProperty('_id');
    });

    it('should fail if data is invalid or fields are missing', async () => {
      const res = await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          make: 'Ford',
          price: -500 // Invalid price, quantity missing
        });
      
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/vehicles/search', () => {
    beforeEach(async () => {
      // Add extra vehicles to search
      await Vehicle.create([
        { make: 'Toyota', model: 'RAV4', category: 'SUV', price: 28000, quantity: 10 },
        { make: 'Toyota', model: 'Prius', category: 'Hybrid', price: 25000, quantity: 2 },
        { make: 'Ford', model: 'F-150', category: 'Truck', price: 45000, quantity: 4 }
      ]);
    });

    it('should filter vehicles by make', async () => {
      const res = await request(app)
        .get('/api/vehicles/search?make=Toyota')
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body.every(c => c.make === 'Toyota')).toBe(true);
    });

    it('should filter vehicles by price range', async () => {
      const res = await request(app)
        .get('/api/vehicles/search?minPrice=30000&maxPrice=50000')
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(res.status).toBe(200);
      // F-150 (45000) and Tesla (49999) should match
      expect(res.body.length).toBe(2);
    });

    it('should filter vehicles by category', async () => {
      const res = await request(app)
        .get('/api/vehicles/search?category=Hybrid')
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0]).toHaveProperty('model', 'Prius');
    });

    it('should apply make, category, and price filters together (combined filter)', async () => {
      const res = await request(app)
        .get('/api/vehicles/search?make=Ford&category=Truck&minPrice=40000&maxPrice=50000')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0]).toHaveProperty('model', 'F-150');
    });

    it('should return an empty array when combined filters match nothing', async () => {
      const res = await request(app)
        .get('/api/vehicles/search?make=Toyota&category=Truck')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });
  });

  describe('PUT /api/vehicles/:id', () => {
    it('should fail if user is not an admin', async () => {
      const res = await request(app)
        .put(`/api/vehicles/${sampleVehicleId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ price: 45000 });
      
      expect(res.status).toBe(403);
    });

    it('should return 400 for a malformed vehicle id', async () => {
      const res = await request(app)
        .put('/api/vehicles/not-a-valid-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ price: 45000 });

      expect(res.status).toBe(400);
    });

    it('should succeed if user is admin', async () => {
      const res = await request(app)
        .put(`/api/vehicles/${sampleVehicleId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ price: 45000, quantity: 8 });
      
      expect(res.status).toBe(200);
      expect(res.body.price).toBe(45000);
      expect(res.body.quantity).toBe(8);
    });
  });

  describe('DELETE /api/vehicles/:id', () => {
    it('should fail if user is not admin', async () => {
      const res = await request(app)
        .delete(`/api/vehicles/${sampleVehicleId}`)
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(res.status).toBe(403);
    });

    it('should return 400 for a malformed vehicle id', async () => {
      const res = await request(app)
        .delete('/api/vehicles/not-a-valid-id')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
    });

    it('should return 404 for a well-formed but nonexistent vehicle id', async () => {
      const nonexistentId = new mongoose.Types.ObjectId().toString();
      const res = await request(app)
        .delete(`/api/vehicles/${nonexistentId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });

    it('should delete vehicle if user is admin', async () => {
      const res = await request(app)
        .delete(`/api/vehicles/${sampleVehicleId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'Vehicle removed successfully');

      // Check if gone
      const check = await Vehicle.findById(sampleVehicleId);
      expect(check).toBeNull();
    });
  });

  describe('POST /api/vehicles/:id/purchase', () => {
    it('should return 400 for a malformed vehicle id', async () => {
      const res = await request(app)
        .post('/api/vehicles/not-a-valid-id/purchase')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(400);
    });

    it('should decrease quantity by 1 when purchased', async () => {
      const res = await request(app)
        .post(`/api/vehicles/${sampleVehicleId}/purchase`)
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.quantity).toBe(4);

      // Verify db quantity
      const updated = await Vehicle.findById(sampleVehicleId);
      expect(updated.quantity).toBe(4);
    });

    it('should fail to purchase if quantity is 0', async () => {
      // Manually set quantity to 0
      await Vehicle.findByIdAndUpdate(sampleVehicleId, { quantity: 0 });

      const res = await request(app)
        .post(`/api/vehicles/${sampleVehicleId}/purchase`)
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'Vehicle is out of stock');
    });
  });

  describe('POST /api/vehicles/:id/restock', () => {
    it('should fail if user is not admin', async () => {
      const res = await request(app)
        .post(`/api/vehicles/${sampleVehicleId}/restock`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ quantity: 10 });
      
      expect(res.status).toBe(403);
    });

    it('should return 400 for a malformed vehicle id', async () => {
      const res = await request(app)
        .post('/api/vehicles/not-a-valid-id/restock')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ quantity: 10 });

      expect(res.status).toBe(400);
    });

    it('should increase quantity by specifying amount if user is admin', async () => {
      const res = await request(app)
        .post(`/api/vehicles/${sampleVehicleId}/restock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ quantity: 10 });
      
      expect(res.status).toBe(200);
      expect(res.body.quantity).toBe(15); // 5 + 10 = 15

      // Verify database
      const updated = await Vehicle.findById(sampleVehicleId);
      expect(updated.quantity).toBe(15);
    });

    it('should fail if restock quantity is missing or negative', async () => {
      const res = await request(app)
        .post(`/api/vehicles/${sampleVehicleId}/restock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ quantity: -2 });
      
      expect(res.status).toBe(400);
    });
  });
});
