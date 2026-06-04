import React from 'react';

export default function OrderForm({ cart, onPlaceOrder, loading, total }) {
  return (
    <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', borderRadius: 12, background: '#f8fafc' }}>
        <span>Order total</span>
        <strong>${total.toFixed(2)}</strong>
      </div>
      <button type="button" className="button button-primary" onClick={onPlaceOrder} disabled={loading || cart.length === 0}>
        {loading ? 'Placing order...' : 'Place order'}
      </button>
    </div>
  );
}
