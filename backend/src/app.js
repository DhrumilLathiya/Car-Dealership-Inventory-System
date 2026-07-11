// app.js — Auth routes working, vehicle routes NOT yet registered
import express from 'express';
import cors from 'cors';
import './config/env.js';
import authRoutes from './routes/authRoutes.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes — only auth is wired up so far
app.use('/api/auth', authRoutes);

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
