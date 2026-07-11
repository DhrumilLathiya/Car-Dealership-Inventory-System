import React, { createContext, useState, useContext, useCallback } from 'react';
import { useAuth } from './AuthContext.jsx';

const InventoryContext = createContext();

export const InventoryProvider = ({ children }) => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { token } = useAuth();

  // Helper for requests
  const apiFetch = useCallback(async (url, options = {}) => {
    setLoading(true);
    setError(null);
    try {
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers
      };

      const res = await fetch(url, { ...options, headers });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      setLoading(false);
      return data;
    } catch (err) {
      setLoading(false);
      setError(err.message);
      throw err;
    }
  }, [token]);

  // Fetch all vehicles
  const fetchVehicles = useCallback(async () => {
    try {
      const data = await apiFetch('/api/vehicles');
      setVehicles(data);
    } catch (err) {
      // Error handled in apiFetch
    }
  }, [apiFetch]);

  // Search/filter vehicles
  const searchVehicles = useCallback(async (filters) => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.make) queryParams.append('make', filters.make);
      if (filters.model) queryParams.append('model', filters.model);
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.minPrice) queryParams.append('minPrice', filters.minPrice);
      if (filters.maxPrice) queryParams.append('maxPrice', filters.maxPrice);

      const url = `/api/vehicles/search?${queryParams.toString()}`;
      const data = await apiFetch(url);
      setVehicles(data);
    } catch (err) {
      // Error handled in apiFetch
    }
  }, [apiFetch]);

  // Add new vehicle (Admin)
  const addVehicle = async (vehicleData) => {
    try {
      const data = await apiFetch('/api/vehicles', {
        method: 'POST',
        body: JSON.stringify(vehicleData)
      });
      // Add to local state (prepend so it shows at the top)
      setVehicles(prev => [data, ...prev]);
      return data;
    } catch (err) {
      throw err;
    }
  };

  // Update vehicle details (Admin)
  const updateVehicle = async (id, vehicleData) => {
    try {
      const data = await apiFetch(`/api/vehicles/${id}`, {
        method: 'PUT',
        body: JSON.stringify(vehicleData)
      });
      // Update local state
      setVehicles(prev => prev.map(v => v._id === id ? data : v));
      return data;
    } catch (err) {
      throw err;
    }
  };

  // Delete vehicle (Admin only)
  const deleteVehicle = async (id) => {
    try {
      await apiFetch(`/api/vehicles/${id}`, {
        method: 'DELETE'
      });
      // Remove from local state
      setVehicles(prev => prev.filter(v => v._id !== id));
    } catch (err) {
      throw err;
    }
  };

  // Purchase vehicle (Customer/User) - decreases stock quantity by 1
  const purchaseVehicle = async (id) => {
    try {
      const data = await apiFetch(`/api/vehicles/${id}/purchase`, {
        method: 'POST'
      });
      // Update local state
      setVehicles(prev => prev.map(v => v._id === id ? data : v));
      return data;
    } catch (err) {
      throw err;
    }
  };

  // Restock vehicle (Admin only) - increases quantity by specified amount
  const restockVehicle = async (id, quantity) => {
    try {
      const data = await apiFetch(`/api/vehicles/${id}/restock`, {
        method: 'POST',
        body: JSON.stringify({ quantity })
      });
      // Update local state
      setVehicles(prev => prev.map(v => v._id === id ? data : v));
      return data;
    } catch (err) {
      throw err;
    }
  };

  return (
    <InventoryContext.Provider value={{
      vehicles,
      loading,
      error,
      fetchVehicles,
      searchVehicles,
      addVehicle,
      updateVehicle,
      deleteVehicle,
      purchaseVehicle,
      restockVehicle
    }}>
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => useContext(InventoryContext);
export default InventoryContext;
