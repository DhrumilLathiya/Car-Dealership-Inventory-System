import Vehicle from '../models/Vehicle.js';

// @desc    Get all vehicles
// @route   GET /api/vehicles
// @access  Protected (Authenticated users)
export const getVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({}).sort({ createdAt: -1 });
    return res.status(200).json(vehicles);
  } catch (error) {
    return res.status(500).json({ message: 'Server error retrieving vehicles', error: error.message });
  }
};
