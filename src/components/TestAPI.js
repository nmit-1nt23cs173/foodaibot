import React, { useState } from 'react';

const API_BASE = 'http://localhost:5000/api';

export default function TestAPI() {
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePing = async () => {
    setLoading(true);
    setResponse('');
    try {
      const res = await fetch(`${API_BASE}/ping`);
      const data = await res.text();
      setResponse(data || 'OK');
    } catch (error) {
      setResponse(error.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section-card">
      <h3>API health check</h3>
      <p>Use this helper to verify the backend is reachable from the frontend.</p>
      <button type="button" className="button button-primary" onClick={handlePing} disabled={loading}>
        {loading ? 'Checking...' : 'Ping backend'}
      </button>
      {response && <p className="status-message">{response}</p>}
    </div>
  );
}
