import express from 'express';
import { getVehicles, searchVehicles, createVehicle } from '../controllers/vehicleController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getVehicles);
router.get('/search', protect, searchVehicles);
router.post('/', protect, admin, createVehicle);

export default router;
