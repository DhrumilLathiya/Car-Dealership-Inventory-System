import mongoose from 'mongoose';

/**
 * Validates that a route's `:id` param is a well-formed Mongo ObjectId
 * before it reaches the controller.
 */
const validateObjectId = (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: `Invalid vehicle ID: ${id}` });
  }

  next();
};

export default validateObjectId;
