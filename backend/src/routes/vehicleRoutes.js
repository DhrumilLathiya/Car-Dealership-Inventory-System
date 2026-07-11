import express from 'express';
import {
  getVehicles,
  searchVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  purchaseVehicle,
  restockVehicle
} from '../controllers/vehicleController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import validateObjectId from '../middleware/validateObjectId.js';

const router = express.Router();

// General vehicle listing & search
router.get('/', protect, getVehicles);
router.get('/search', protect, searchVehicles);

// CRUD operations on vehicles
router.post('/', protect, admin, createVehicle);
router.put('/:id', protect, admin, validateObjectId, updateVehicle);
router.delete('/:id', protect, admin, validateObjectId, deleteVehicle);

// Inventory transactions
router.post('/:id/purchase', protect, validateObjectId, purchaseVehicle);
router.post('/:id/restock', protect, admin, validateObjectId, restockVehicle); // Restock is admin only

export default router;
