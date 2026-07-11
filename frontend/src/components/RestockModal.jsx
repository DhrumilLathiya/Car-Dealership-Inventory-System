import React, { useState, useEffect } from 'react';
import { useInventory } from '../context/InventoryContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

const RestockModal = ({ isOpen, onClose, vehicle }) => {
  const { restockVehicle } = useInventory();
  const toast = useToast();

  const [quantity, setQuantity] = useState('5');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setQuantity('5');
    setError('');
  }, [vehicle, isOpen]);

  if (!isOpen || !vehicle) return null;

  const step = (delta) => {
    setQuantity((prev) => {
      const next = Math.max(1, (parseInt(prev, 10) || 0) + delta);
      return String(next);
    });
  };

  const qtyNum = parseInt(quantity, 10);
  const projected = !isNaN(qtyNum) && qtyNum > 0 ? vehicle.quantity + qtyNum : null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isNaN(qtyNum) || qtyNum <= 0) {
      setError('Enter a positive restock quantity.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await restockVehicle(vehicle._id, qtyNum);
      toast.success(`Restocked ${vehicle.make} ${vehicle.model} — now ${vehicle.quantity + qtyNum} units.`);
      onClose();
    } catch (err) {
      setError(err.message || 'Restocking failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-container modal-sm">
        <div className="modal-header">
          <h2>Restock Vehicle</h2>
          <button className="btn-close" onClick={onClose} aria-label="Close">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="restock-summary-box">
            <span className="restock-model-title">{vehicle.make} {vehicle.model}</span>
            <span className="restock-current-stock">
              Current stock: <strong className="mono">{vehicle.quantity} units</strong>
            </span>
          </div>

          {error && <div className="form-error-alert">{error}</div>}

          <div className="form-group">
            <label htmlFor="restock-quantity">Quantity to Add</label>
            <div className="stepper-row">
              <button type="button" className="stepper-btn" onClick={() => step(-1)} aria-label="Decrease">
                −
              </button>
              <input
                type="number"
                id="restock-quantity"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
              <button type="button" className="stepper-btn" onClick={() => step(1)} aria-label="Increase">
                +
              </button>
            </div>
          </div>

          {projected !== null && (
            <div className="restock-preview">
              <span className="mono">{vehicle.quantity}</span>
              <span className="arrow">→</span>
              <span className="after-value">{projected} units</span>
            </div>
          )}

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Updating…' : 'Add Stock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RestockModal;
