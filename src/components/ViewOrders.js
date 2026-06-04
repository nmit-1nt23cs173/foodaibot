import React, { useEffect, useState } from 'react';

const API_BASE = 'http://localhost:5000/api';

export default function ViewOrders({ token }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (!token) return;
    fetchOrders();
  }, [token]);

  const fetchOrders = async () => {
    setLoading(true);
    setStatus('Loading your orders...');

    try {
      const response = await fetch(`${API_BASE}/orders`, {
        headers: { Authorization: token ? `Bearer ${token}` : undefined },
      });
      if (!response.ok) throw new Error('Unable to load orders');
      const data = await response.json();
      setOrders(data || []);
      setStatus('');
    } catch (error) {
      setStatus(error.message || 'Failed to load orders.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section-card">
      <h2>Your orders</h2>
      {loading && <p className="status-message">Loading...</p>}
      {status && <p className="status-message">{status}</p>}
      {orders.length === 0 && !loading ? (
        <p className="status-message">No orders found yet.</p>
      ) : (
        orders.map((order) => (
          <div key={order.id} style={{ borderTop: '1px solid #e2e8f0', padding: '14px 0' }}>
            <strong>Order #{order.id}</strong>
            <p style={{ margin: 4 }}>{order.status || 'Pending'}</p>
            <p style={{ margin: 4, color: '#475569' }}>${Number(order.total || 0).toFixed(2)}</p>
          </div>
        ))
      )}
    </div>
  );
}
