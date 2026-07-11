import express from 'express';
import cors from 'cors';
import './config/env.js'; // Validates required env vars at import time — fails fast if misconfigured
import authRoutes from './routes/authRoutes.js';
import vehicleRoutes from './routes/vehicleRoutes.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Car Dealership Inventory API is running' });
});

// 404 Route handler
app.use((req, res, next) => {
  res.status(404).json({ message: 'Endpoint not found' });
});

// Global Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error stack:', err.stack);
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode).json({
    message: err.message || 'Internal Server Error'
  });
});

export default app;
