import React, { useState, useEffect } from 'react';
import { useInventory } from '../context/InventoryContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

const VehicleFormModal = ({ isOpen, onClose, vehicle }) => {
  const { addVehicle, updateVehicle } = useInventory();
  const toast = useToast();

  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isEditMode = !!vehicle;

  useEffect(() => {
    if (vehicle) {
      setMake(vehicle.make);
      setModel(vehicle.model);
      setCategory(vehicle.category);
      setPrice(vehicle.price.toString());
      setQuantity(vehicle.quantity.toString());
    } else {
      setMake('');
      setModel('');
      setCategory('');
      setPrice('');
      setQuantity('');
    }
    setError('');
  }, [vehicle, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!make || !model || !category || price === '' || quantity === '') {
      setError('All fields are required.');
      return;
    }

    const priceNum = parseFloat(price);
    const qtyNum = parseInt(quantity, 10);

    if (isNaN(priceNum) || priceNum < 0) {
      setError('Price must be a positive number.');
      return;
    }
    if (isNaN(qtyNum) || qtyNum < 0) {
      setError('Quantity must be a positive whole number.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const payload = { make, model, category, price: priceNum, quantity: qtyNum };
      if (isEditMode) {
        await updateVehicle(vehicle._id, payload);
        toast.success(`Updated ${make} ${model}.`);
      } else {
        await addVehicle(payload);
        toast.success(`Added ${make} ${model} to inventory.`);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Operation failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-container">
        <div className="modal-header">
          <h2>{isEditMode ? 'Edit Vehicle Record' : 'Add New Vehicle'}</h2>
          <button className="btn-close" onClick={onClose} aria-label="Close">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && <div className="form-error-alert">{error}</div>}

          <div className="form-group">
            <label htmlFor="make">Make / Manufacturer</label>
            <input
              type="text"
              id="make"
              value={make}
              onChange={(e) => setMake(e.target.value)}
              placeholder="e.g. Tesla, Ford"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="model">Model Name</label>
            <input
              type="text"
              id="model"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="e.g. Model S, Mustang"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">Category</label>
            <input
              type="text"
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Electric, Sports, SUV"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group flex-1">
              <label htmlFor="price">Price (USD)</label>
              <input
                type="number"
                id="price"
                min="0"
                step="any"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="45000"
                required
              />
            </div>

            <div className="form-group flex-1">
              <label htmlFor="quantity">Stock Quantity</label>
              <input
                type="number"
                id="quantity"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="5"
                required
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving…' : isEditMode ? 'Save Changes' : 'Add Vehicle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VehicleFormModal;
