// Stub: Vehicle model – schema exists but empty
import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema({
  make: { type: String },
  model: { type: String },
  category: { type: String },
  price: { type: Number },
  quantity: { type: Number }
}, { timestamps: true });

const Vehicle = mongoose.model('Vehicle', vehicleSchema);
export default Vehicle;
