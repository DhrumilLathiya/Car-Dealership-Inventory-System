import dotenv from 'dotenv';

dotenv.config();

/**
 * Centralized environment configuration.
 *
 * Previously, JWT_SECRET had a hardcoded fallback string
 * ('super_secret_car_dealership_jwt_key_99') baked into both the auth
 * controller and the auth middleware. If the env var was ever missing in
 * a deployment, the app would silently sign and verify tokens with a
 * public, guessable secret instead of failing loudly.
 *
 * This module validates required configuration once, at startup, and
 * throws immediately if anything critical is missing — so a
 * misconfigured deployment fails fast instead of running insecurely.
 */

const required = ['JWT_SECRET'];

const missing = required.filter((key) => !process.env[key] || process.env[key].trim() === '');

if (missing.length > 0) {
  throw new Error(
    `Missing required environment variable(s): ${missing.join(', ')}. ` +
    'Set these in your .env file before starting the server (see .env.example).'
  );
}

export const env = {
  PORT: process.env.PORT || 5000,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/car-dealership',
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '30d',
  NODE_ENV: process.env.NODE_ENV || 'development'
};

export default env;
