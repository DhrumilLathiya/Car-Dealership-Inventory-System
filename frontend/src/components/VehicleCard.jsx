import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useInventory } from '../context/InventoryContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import AvailabilityMeter from './AvailabilityMeter.jsx';
import VehicleGlyph from './VehicleGlyph.jsx';
import ConfirmDialog from './ConfirmDialog.jsx';

const VehicleCard = ({ vehicle, onEdit, onRestock }) => {
  const { user } = useAuth();
  const { purchaseVehicle, deleteVehicle } = useInventory();
  const toast = useToast();

  const [buying, setBuying] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const isAdmin = user?.role === 'admin';
  const isOutOfStock = vehicle.quantity <= 0;

  const formatPrice = (price) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(price);

  const handlePurchase = async () => {
    if (isOutOfStock || buying) return;
    setBuying(true);
    try {
      await purchaseVehicle(vehicle._id);
      toast.success(`You've purchased the ${vehicle.make} ${vehicle.model}.`);
    } catch (err) {
      toast.error(err.message || 'Purchase failed. Please try again.');
    } finally {
      setBuying(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteVehicle(vehicle._id);
      toast.success(`Removed ${vehicle.make} ${vehicle.model} from the collection.`);
    } catch (err) {
      toast.error(err.message || 'Deletion failed. Please try again.');
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
    }
  };

  return (
    <div className={`vehicle-card ${isOutOfStock ? 'out-of-stock-card' : ''}`}>
      <div className="card-plate">
        {isOutOfStock && <div className="out-of-stock-badge">Sold Out</div>}
        <div className="price-tag">{formatPrice(vehicle.price)}</div>
        <VehicleGlyph category={vehicle.category} />
      </div>

      <div className="card-header">
        <span className="vehicle-category-label">{vehicle.category}</span>
        <h3 className="vehicle-title">
          {vehicle.make} <span className="model-name">{vehicle.model}</span>
        </h3>
      </div>

      <div className="card-body">
        <hr className="card-divider" />
        <AvailabilityMeter quantity={vehicle.quantity} />
      </div>

      <div className="card-actions">
        {/* Core requirement: Purchase button disabled when quantity is zero */}
        <button
          className="btn btn-primary btn-purchase"
          onClick={handlePurchase}
          disabled={isOutOfStock || buying}
        >
          {buying ? 'Processing…' : isOutOfStock ? 'Out of Stock' : 'Purchase This Vehicle'}
        </button>

        {isAdmin && (
          <div className="admin-actions-grid">
            <button className="btn btn-secondary btn-sm" onClick={() => onRestock(vehicle)}>
              Restock
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => onEdit(vehicle)}>
              Edit
            </button>
            <button className="btn btn-danger btn-sm" onClick={() => setConfirmOpen(true)} disabled={deleting}>
              Remove
            </button>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={confirmOpen}
        title="Remove this listing?"
        message={`This permanently removes the ${vehicle.make} ${vehicle.model} from the showroom directory. This can't be undone.`}
        confirmLabel="Remove listing"
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
        busy={deleting}
      />
    </div>
  );
};

export default VehicleCard;
