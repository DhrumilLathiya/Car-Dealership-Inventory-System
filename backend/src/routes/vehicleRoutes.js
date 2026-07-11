import express from 'express';
import { getVehicles, searchVehicles } from '../controllers/vehicleController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getVehicles);
router.get('/search', protect, searchVehicles);

export default router;
