import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import ShowroomBlueprint from '../components/ShowroomBlueprint.jsx';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please try again.');
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
          <h2>Welcome back to the collection.</h2>
          <p>Sign in to browse the current lineup, track availability, and pick up right where you left off.</p>
        </div>
      </div>

      <div className="auth-form-panel">
        <div className="auth-card">
          <h1 className="auth-form-title">Sign in</h1>
          <p className="auth-form-subtitle">Enter your credentials to access the dealership console.</p>

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
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
              {submitting ? 'Authenticating…' : 'Sign In'}
            </button>
          </form>

          <div className="auth-footer">
            <p>Don't have an account? <Link to="/register">Register here</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
