import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <span className="logo-mark" aria-hidden="true"></span>
          <span className="logo-text">
            AutoVault
            <span className="logo-sub">Inventory Console</span>
          </span>
        </div>

        {isAuthenticated && user && (
          <div className="navbar-user-panel">
            <div className="user-info">
              <span className="user-email">{user.email}</span>
              <span className={`user-role-badge ${user.role}`}>
                {user.role.toUpperCase()}
              </span>
            </div>
            <button className="btn btn-outline btn-sm" onClick={logout}>
              Sign Out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
