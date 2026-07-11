import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import ShowroomBlueprint from '../components/ShowroomBlueprint.jsx';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('user');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setSubmitting(true);

    try {
      await register(email, password, role);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed. That email might already be taken.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-visual-panel">
        <div className="auth-brand">
          <span className="logo-mark" aria-hidden="true"></span>
          <span className="logo-text">
            AutoVault
            <span className="logo-sub">Inventory Console</span>
          </span>
        </div>

        <div className="auth-gauge-stage">
          <ShowroomBlueprint />
        </div>

        <div className="auth-copy">
          <h2>Step into the showroom.</h2>
          <p>Browse and reserve from the current lineup as a customer, or register as an administrator to manage pricing, stock, and listings.</p>
        </div>
      </div>

      <div className="auth-form-panel">
        <div className="auth-card">
          <h1 className="auth-form-title">Create account</h1>
          <p className="auth-form-subtitle">Register to browse inventory or manage the dealership floor.</p>

          <form onSubmit={handleSubmit} className="auth-form">
            {error && <div className="form-error-alert">{error}</div>}

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                placeholder="name@dealership.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="role">Account Role</label>
              <select id="role" className="form-select" value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="user">Customer — purchase vehicles</option>
                <option value="admin">Administrator — full inventory control</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                placeholder="•••••••• (min. 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
              {submitting ? 'Registering…' : 'Create Account'}
            </button>
          </form>

          <div className="auth-footer">
            <p>Already have an account? <Link to="/login">Sign in here</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
