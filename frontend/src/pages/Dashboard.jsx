import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useInventory } from '../context/InventoryContext.jsx';
import Navbar from '../components/Navbar.jsx';
import VehicleCard from '../components/VehicleCard.jsx';
import VehicleFormModal from '../components/VehicleFormModal.jsx';
import RestockModal from '../components/RestockModal.jsx';
import VehicleGlyph from '../components/VehicleGlyph.jsx';

const Dashboard = () => {
  const { user } = useAuth();
  const { vehicles, loading, error, fetchVehicles, searchVehicles } = useInventory();

  // Search/filter state
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [category, setCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  // Modal state
  const [formOpen, setFormOpen] = useState(false);
  const [restockOpen, setRestockOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  const isAdmin = user?.role === 'admin';
  const hasActiveFilters = !!(make || model || category || minPrice || maxPrice);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const handleSearch = (e) => {
    e.preventDefault();
    searchVehicles({ make, model, category, minPrice, maxPrice });
  };

  const handleClearFilters = () => {
    setMake('');
    setModel('');
    setCategory('');
    setMinPrice('');
    setMaxPrice('');
    fetchVehicles();
  };

  const handleOpenAdd = () => {
    setSelectedVehicle(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (vehicle) => {
    setSelectedVehicle(vehicle);
    setFormOpen(true);
  };

  const handleOpenRestock = (vehicle) => {
    setSelectedVehicle(vehicle);
    setRestockOpen(true);
  };

  // Fleet health summary — aggregate readout for the signature gauge concept
  const summary = useMemo(() => {
    const totalUnits = vehicles.reduce((sum, v) => sum + v.quantity, 0);
    const lowStock = vehicles.filter((v) => v.quantity > 0 && v.quantity <= 2).length;
    const outOfStock = vehicles.filter((v) => v.quantity <= 0).length;
    return { models: vehicles.length, totalUnits, lowStock, outOfStock };
  }, [vehicles]);

  return (
    <div className="dashboard-layout">
      <Navbar />

      <main className="dashboard-content">
        <header className="dashboard-header">
          <div className="header-titles">
            <span className="eyebrow">AutoVault Presents</span>
            <h1>The Collection</h1>
            <p>Browse the current lineup, check availability, and reserve your next vehicle.</p>
          </div>
          {isAdmin && (
            <button className="btn btn-primary" onClick={handleOpenAdd}>
              <span className="btn-icon">+</span> Add New Vehicle
            </button>
          )}
        </header>

        {!loading && vehicles.length > 0 && (
          <section className="fleet-summary">
            <div className="summary-cell">
              <span className="eyebrow">Models Listed</span>
              <span className="summary-value mono">{summary.models}</span>
            </div>
            <div className="summary-cell">
              <span className="eyebrow">Units In Stock</span>
              <span className="summary-value mono teal-value">{summary.totalUnits}</span>
            </div>
            <div className="summary-cell">
              <span className="eyebrow">Low Stock (≤2)</span>
              <span className="summary-value mono accent-value">{summary.lowStock}</span>
            </div>
            <div className="summary-cell">
              <span className="eyebrow">Sold Out</span>
              <span className="summary-value mono danger-value">{summary.outOfStock}</span>
            </div>
          </section>
        )}

        <section className="search-filter-card">
          <form onSubmit={handleSearch} className="filter-form">
            <h2 className="filter-heading">Find Your Car</h2>
            <div className="filter-grid">
              <div className="filter-group">
                <label>Make</label>
                <input type="text" placeholder="e.g. Tesla" value={make} onChange={(e) => setMake(e.target.value)} />
              </div>

              <div className="filter-group">
                <label>Model</label>
                <input type="text" placeholder="e.g. Model Y" value={model} onChange={(e) => setModel(e.target.value)} />
              </div>

              <div className="filter-group">
                <label>Category</label>
                <input type="text" placeholder="e.g. Electric" value={category} onChange={(e) => setCategory(e.target.value)} />
              </div>

              <div className="filter-group">
                <label>Price Range</label>
                <div className="range-inputs">
                  <input type="number" placeholder="Min ($)" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
                  <span className="range-separator">to</span>
                  <input type="number" placeholder="Max ($)" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
                </div>
              </div>
            </div>

            <div className="filter-actions">
              <button type="button" className="btn btn-outline" onClick={handleClearFilters}>
                Reset
              </button>
              <button type="submit" className="btn btn-primary">
                Search Inventory
              </button>
            </div>
          </form>
        </section>

        {error && <div className="dashboard-error-alert">{error}</div>}

        {loading ? (
          <div className="skeleton-grid" aria-label="Loading inventory" aria-busy="true">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton-card" />
            ))}
          </div>
        ) : vehicles.length === 0 ? (
          <div className="empty-inventory">
            <span className="empty-mark"><VehicleGlyph category="sedan" /></span>
            <h3>No vehicles match this search</h3>
            <p>Try widening your filters, or add a new vehicle to the directory.</p>
            {hasActiveFilters && (
              <button className="btn btn-outline" onClick={handleClearFilters}>
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          <section className="vehicles-grid">
            {vehicles.map((vehicle) => (
              <VehicleCard
                key={vehicle._id}
                vehicle={vehicle}
                onEdit={handleOpenEdit}
                onRestock={handleOpenRestock}
              />
            ))}
          </section>
        )}
      </main>

      <VehicleFormModal isOpen={formOpen} onClose={() => setFormOpen(false)} vehicle={selectedVehicle} />
      <RestockModal isOpen={restockOpen} onClose={() => setRestockOpen(false)} vehicle={selectedVehicle} />
    </div>
  );
};

export default Dashboard;
