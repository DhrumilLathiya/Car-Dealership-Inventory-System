import express from 'express';
import { getVehicles } from '../controllers/vehicleController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// General vehicle listing
router.get('/', protect, getVehicles);

export default router;
