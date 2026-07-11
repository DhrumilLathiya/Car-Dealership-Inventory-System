import Vehicle from '../models/Vehicle.js';

export const getVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({}).sort({ createdAt: -1 });
    return res.status(200).json(vehicles);
  } catch (error) {
    return res.status(500).json({ message: 'Server error retrieving vehicles', error: error.message });
  }
};

export const searchVehicles = async (req, res) => {
  const { make, model, category, minPrice, maxPrice } = req.query;
  try {
    const query = {};
    if (make) query.make = { $regex: make, $options: 'i' };
    if (model) query.model = { $regex: model, $options: 'i' };
    if (category) query.category = { $regex: category, $options: 'i' };
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

// @desc    Add a new vehicle
// @route   POST /api/vehicles
// @access  Protected (Admin only)
export const createVehicle = async (req, res) => {
  const { make, model, category, price, quantity } = req.body;

  if (!make || !model || !category || price === undefined || quantity === undefined) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }

  if (price < 0 || quantity < 0) {
    return res.status(400).json({ message: 'Price and quantity cannot be negative' });
  }

  try {
    const vehicle = await Vehicle.create({ make, model, category, price, quantity });
    return res.status(201).json(vehicle);
  } catch (error) {
    return res.status(400).json({ message: 'Invalid vehicle data', error: error.message });
  }
};
