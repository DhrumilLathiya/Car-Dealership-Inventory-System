import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

// Helper function to generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
// Security fix: role Escalation Guard added
export const registerUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    // Check if user already exists
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Role lockdown to 'user' for safety
    const user = await User.create({
      email: email.toLowerCase(),
      password,
      role: 'user'
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
};

// @desc    Authenticate a user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Compare passwords using schema method
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error during login', error: error.message });
  }
};
