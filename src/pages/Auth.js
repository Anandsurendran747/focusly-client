import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import './Auth.css';
import { loginUser, registerUser } from '../api';
import {useNavigate} from 'react-router-dom';

export default function Auth() {
  const navigate = useNavigate();
  const { login } = useApp();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!form.email || !form.password) {
      setError('Please fill in all fields.');
      return;
    }
    if (mode === 'signup' && !form.name) {
      setError('Please enter your name.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    if (mode === 'login') {
      loginUser({
        email: form.email,
        password: form.password
      }).then((data) => {
        setLoading(false);
        const userData = data.user ?? data;
        login(userData);
        navigate('/');
      }).catch((err) => {
        setLoading(false);
        setError('Invalid email or password.');
      });
    } else if (mode === 'signup') {
      registerUser({
        name: form.name,
        email: form.email,
        password: form.password
      }).then(() => {
        setLoading(false);
        alert('Account created successfully! Please sign in.'); // Simple feedback, can be improved
        setMode('login');
        navigate('/auth');
        // Handle successful registration (e.g., redirect to login)
      }).catch((err) => {
        setLoading(false);
        setError('Failed to create account.');
      });
    }

  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-orb auth-orb-1" />
        <div className="auth-orb auth-orb-2" />
        <div className="auth-orb auth-orb-3" />
      </div>

      <div className="auth-container animate-in">
        <div className="auth-brand">
          <span className="auth-logo">◈</span>
          <h1 className="auth-title">Focusly</h1>
          <p className="auth-tagline">Your personal productivity OS</p>
        </div>

        <div className="auth-card">
          <div className="auth-tabs">
            <button
              className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
              onClick={() => { setMode('login'); setError(''); }}
            >Sign In</button>
            <button
              className={`auth-tab ${mode === 'signup' ? 'active' : ''}`}
              onClick={() => { setMode('signup'); setError(''); }}
            >Sign Up</button>
            <div className={`auth-tab-indicator ${mode === 'signup' ? 'right' : ''}`} />
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {mode === 'signup' && (
              <div className="auth-field animate-in">
                <label>Your name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Jane Doe"
                  value={form.name}
                  onChange={handleChange}
                  autoComplete="name"
                />
              </div>
            )}

            <div className="auth-field">
              <label>Email address</label>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
              />
            </div>

            <div className="auth-field">
              <label>Password</label>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
            </div>

            {error && <p className="auth-error">{error}</p>}

            <button className="auth-submit" type="submit" disabled={loading}>
              {loading ? <span className="auth-spinner" /> : (mode === 'login' ? 'Sign In →' : 'Create Account →')}
            </button>
          </form>

          <p className="auth-hint">
            {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
            <button className="auth-switch" onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}>
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>

        <div className="auth-features">
          <span>✓ Todos & goals</span>
          <span>✓ Book tracker</span>
          <span>✓ Lessons learned</span>
        </div>
      </div>
    </div>
  );
}
