import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';
const emptyMenuItem = { name: '', price: '', imageUrl: '' };
const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || '212060788024-ul79ddbpnli12nvld8ng47skpqhgif11.apps.googleusercontent.com';

export default function Register({ onLogin }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [hotelName, setHotelName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [menuItems, setMenuItems] = useState([emptyMenuItem]);
  const [status, setStatus] = useState('');
  const [googleStatus, setGoogleStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const updateMenuItem = (index, field, value) => {
    const nextItems = [...menuItems];
    nextItems[index] = { ...nextItems[index], [field]: value };
    setMenuItems(nextItems);
  };

  const addMenuItem = () => setMenuItems([...menuItems, emptyMenuItem]);
  const removeMenuItem = (index) => setMenuItems(menuItems.filter((_, idx) => idx !== index));

  const verifyLoginResponse = (data) => {
    onLogin({
      token: data.token,
      role: data.role || role,
      email: data.email || email,
      emailVerified: data.emailVerified ?? false,
    });
    if (data.emailVerified === false) {
      setStatus('Email verification pending.');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus('');
    setLoading(true);

    const endpoint = mode === 'login' ? 'api/users/login' : 'api/users/register';
    const payload = { email, password, role };

    if (mode === 'register' && role === 'hotel') {
      payload.hotelName = hotelName;
      payload.logoUrl = logoUrl;
      payload.menuItems = menuItems.filter((item) => item.name.trim());
    }

    try {
      const response = await fetch(`${API_BASE}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Backend endpoint not found: ${API_BASE}/${endpoint}`);
        }
        const errorBody = await response.json();
        throw new Error(errorBody.message || 'Failed to authenticate');
      }

      const data = await response.json();
      verifyLoginResponse(data);
      setStatus('Login successful!');
    } catch (error) {
      setStatus(error.message || 'Unable to connect to backend.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setStatus('');
    setGoogleStatus('');
    const credential = credentialResponse?.credential;
    if (!credential) {
      setGoogleStatus('Google login returned no credential. Please try again.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/users/google-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential }),
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Backend endpoint not found: ${API_BASE}/api/users/google-login`);
        }
        const errorBody = await response.json();
        throw new Error(errorBody.message || 'Google authentication failed');
      }

      const data = await response.json();
      verifyLoginResponse(data);
      setGoogleStatus('Google sign in successful!');
    } catch (error) {
      setGoogleStatus(error.message || 'Unable to authenticate with Google.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setGoogleStatus('Google sign in failed. Please try again.');
  };

  return (
    <div className="section-card flashcard" style={{ maxWidth: 560, margin: '40px auto' }}>
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <button
          type="button"
          className={`button ${mode === 'login' ? 'button-primary' : 'button-secondary'}`}
          onClick={() => setMode('login')}
        >
          Login
        </button>
        <button
          type="button"
          className={`button ${mode === 'register' ? 'button-primary' : 'button-secondary'}`}
          onClick={() => setMode('register')}
        >
          Register
        </button>
      </div>

      <h2>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>

        <div className="input-group">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>

        <div className="input-group">
          <label>Role</label>
          <select value={role} onChange={(event) => setRole(event.target.value)}>
            <option value="user">User</option>
            <option value="hotel">Hotel</option>
          </select>
        </div>

        {mode === 'register' && role === 'hotel' && (
          <>
            <div className="input-group">
              <label>Hotel Name</label>
              <input
                type="text"
                value={hotelName}
                onChange={(event) => setHotelName(event.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label>Logo URL</label>
              <input
                type="url"
                value={logoUrl}
                onChange={(event) => setLogoUrl(event.target.value)}
                placeholder="https://example.com/logo.png"
              />
            </div>

            <div className="section-card" style={{ padding: 18, marginBottom: 24 }}>
              <h3>Menu Items</h3>
              {menuItems.map((item, index) => (
                <div key={index} style={{ display: 'grid', gap: 12, marginBottom: 12 }}>
                  <div className="input-group">
                    <label>Item name</label>
                    <input
                      type="text"
                      value={item.name}
                      onChange={(event) => updateMenuItem(index, 'name', event.target.value)}
                      placeholder="Burger, pasta, etc."
                    />
                  </div>
                  <div className="input-group">
                    <label>Price</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.price}
                      onChange={(event) => updateMenuItem(index, 'price', event.target.value)}
                      placeholder="Price"
                    />
                  </div>
                  <div className="input-group">
                    <label>Image URL</label>
                    <input
                      type="url"
                      value={item.imageUrl}
                      onChange={(event) => updateMenuItem(index, 'imageUrl', event.target.value)}
                      placeholder="https://example.com/item.jpg"
                    />
                  </div>
                  <button
                    type="button"
                    className="button button-secondary"
                    onClick={() => removeMenuItem(index)}
                  >
                    Remove item
                  </button>
                </div>
              ))}
              <button type="button" className="button button-primary" onClick={addMenuItem}>
                Add another menu item
              </button>
            </div>
          </>
        )}

        <button type="submit" className="button button-primary" disabled={loading}>
          {loading ? 'Sending...' : mode === 'login' ? 'Sign in' : 'Create account'}
        </button>
      </form>

      <div style={{ marginTop: 24, textAlign: 'center' }}>
        <span className="status-message" style={{ marginBottom: 10, display: 'block' }}>
          Or continue with
        </span>
        {googleClientId ? (
          <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleError} />
        ) : (
          <p className="status-message inverse-message" style={{ margin: 0 }}>
            Google sign in is disabled. Set REACT_APP_GOOGLE_CLIENT_ID in your environment.
          </p>
        )}
      </div>

      {googleStatus && <p className="status-message">{googleStatus}</p>}
      {status && <p className="status-message inverse-message">{status}</p>}
    </div>
  );
}
