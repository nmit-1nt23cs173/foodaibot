import React, { useState, useEffect } from 'react';
import './App.css';
import Register from './components/Register';
import ManualOrder from './components/ManualOrder';
import Chatbot from './components/Chatbot';

function App() {
  const [user, setUser] = useState({
    token: localStorage.getItem('token'),
    role: localStorage.getItem('role'),
    email: localStorage.getItem('email'),
    emailVerified: localStorage.getItem('emailVerified') === 'true',
  });

  useEffect(() => {
    if (user.token) {
      localStorage.setItem('token', user.token);
      localStorage.setItem('role', user.role);
      localStorage.setItem('email', user.email || '');
      localStorage.setItem('emailVerified', user.emailVerified ? 'true' : 'false');
    }
  }, [user]);

  const handleLogin = ({ token, role, email, emailVerified = false }) => {
    setUser({ token, role, email, emailVerified });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('email');
    setUser({ token: null, role: null, email: null });
  };

  return (
    <div className="App">
      {!user.token ? (
        <div className="app-login-shell">
          <Register onLogin={handleLogin} />
        </div>
      ) : (
        <div className="app-shell">
          <header className="app-header">
            <div>
              <h1>Food Ordering App</h1>
              <p className="app-subtitle">Order from hotels, manage menus, and chat with support.</p>
            </div>

            <div className="user-meta">
              <span className="user-auth-info">
                Signed in as <strong>{user.email}</strong> ({user.role}) • {user.emailVerified ? 'Email verified' : 'Email not verified'}
              </span>
              <button className="button logout-button" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </header>

          <main className="app-main">
            <ManualOrder token={user.token} role={user.role} />
          </main>

          <Chatbot />
        </div>
      )}
    </div>
  );
}

export default App;
