import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Vehicle from './models/Vehicle.js';

dotenv.config();

const sampleVehicles = [
  {
    make: 'Tesla',
    model: 'Model S',
    category: 'Electric',
    price: 89990,
    quantity: 3
  },
  {
    make: 'Ford',
    model: 'Mustang GT',
    category: 'Sports',
    price: 45000,
    quantity: 5
  },
  {
    make: 'Toyota',
    model: 'RAV4',
    category: 'SUV',
    price: 32000,
    quantity: 10
  },
  {
    make: 'Honda',
    model: 'Civic',
    category: 'Sedan',
    price: 25000,
    quantity: 8
  },
  {
    make: 'Jeep',
    model: 'Wrangler',
    category: 'Offroad',
    price: 42000,
    quantity: 0 // Out of stock to test UI disabled state
  }
];

const seedDatabase = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/car-dealership';
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Vehicle.deleteMany({});
    console.log('Cleared existing collections.');

    // Seed Users
    await User.create([
      {
        email: 'user@example.com',
        password: 'password123', // Will be hashed by pre-save hook
        role: 'user'
      },
      {
        email: 'admin@example.com',
        password: 'password123', // Will be hashed by pre-save hook
        role: 'admin'
      }
    ]);
    console.log('Seeded Users: user@example.com (user), admin@example.com (admin)');

    // Seed Vehicles
    await Vehicle.create(sampleVehicles);
    console.log('Seeded sample vehicles.');

    console.log('Database Seeding Completed Successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error.message);
    process.exit(1);
  }
};

seedDatabase();
