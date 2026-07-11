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
    const vehicle = await Vehicle.create({
      make,
      model,
      category,
      price,
      quantity
    });
    return res.status(201).json(vehicle);
  } catch (error) {
    return res.status(400).json({ message: 'Invalid vehicle data', error: error.message });
  }
};

// @desc    Update a vehicle's details
// @route   PUT /api/vehicles/:id
// @access  Protected (Admin only)
export const updateVehicle = async (req, res) => {
  const { make, model, category, price, quantity } = req.body;

  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    // Check bounds if inputs exist
    if (price !== undefined && price < 0) {
      return res.status(400).json({ message: 'Price cannot be negative' });
    }
    if (quantity !== undefined && quantity < 0) {
      return res.status(400).json({ message: 'Quantity cannot be negative' });
    }

    // Update fields
    if (make) vehicle.make = make;
    if (model) vehicle.model = model;
    if (category) vehicle.category = category;
    if (price !== undefined) vehicle.price = price;
    if (quantity !== undefined) vehicle.quantity = quantity;

    const updatedVehicle = await vehicle.save();
    return res.status(200).json(updatedVehicle);
  } catch (error) {
    return res.status(500).json({ message: 'Server error updating vehicle', error: error.message });
  }
};

// @desc    Delete a vehicle
// @route   DELETE /api/vehicles/:id
// @access  Protected (Admin only)
export const deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    await Vehicle.deleteOne({ _id: req.params.id });
    return res.status(200).json({ message: 'Vehicle removed successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Server error deleting vehicle', error: error.message });
  }
};

// @desc    Purchase a vehicle (decrease stock by 1)
// @route   POST /api/vehicles/:id/purchase
// @access  Protected (Authenticated users)
export const purchaseVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    if (vehicle.quantity <= 0) {
      return res.status(400).json({ message: 'Vehicle is out of stock' });
    }

    vehicle.quantity -= 1;
    const updatedVehicle = await vehicle.save();
    return res.status(200).json(updatedVehicle);
  } catch (error) {
    return res.status(500).json({ message: 'Server error during purchase', error: error.message });
  }
};

// @desc    Restock a vehicle (increase stock by specified count)
// @route   POST /api/vehicles/:id/restock
// @access  Protected (Admin only)
export const restockVehicle = async (req, res) => {
  const { quantity } = req.body;

  if (quantity === undefined || quantity <= 0) {
    return res.status(400).json({ message: 'Please provide a valid restock quantity greater than 0' });
  }

  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    vehicle.quantity += Number(quantity);
    const updatedVehicle = await vehicle.save();
    return res.status(200).json(updatedVehicle);
  } catch (error) {
    return res.status(500).json({ message: 'Server error during restocking', error: error.message });
  }
};
