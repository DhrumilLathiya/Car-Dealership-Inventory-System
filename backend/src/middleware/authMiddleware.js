import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { env } from '../config/env.js';

// Middleware to protect routes with JWT authentication
export const protect = async (req, res, next) => {
  let token;

  // Check if token exists in authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token against the validated, non-default secret
      const decoded = jwt.verify(token, env.JWT_SECRET);

      // Get user from the token, omit password field
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'User not found, authorization denied' });
      }

      next();
    } catch (error) {
      console.error('Auth token error:', error.message);
      return res.status(401).json({ message: 'Token is not valid' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }
};

// Middleware to check if user is admin
export const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ message: 'Access denied: Admin role required' });
  }
};
