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

// @desc    Search and filter vehicles
// @route   GET /api/vehicles/search
// @access  Protected (Authenticated users)
export const searchVehicles = async (req, res) => {
  const { make, model, category, minPrice, maxPrice } = req.query;

  try {
    const query = {};

    if (make) {
      query.make = { $regex: make, $options: 'i' };
    }
    if (model) {
      query.model = { $regex: model, $options: 'i' };
    }
    if (category) {
      query.category = { $regex: category, $options: 'i' };
    }
    
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const vehicles = await Vehicle.find(query).sort({ createdAt: -1 });
    return res.status(200).json(vehicles);
  } catch (error) {
    return res.status(500).json({ message: 'Server error during search', error: error.message });
  }
};
