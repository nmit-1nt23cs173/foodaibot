import React, { useEffect, useState } from 'react';
import OrderForm from './OrderForm';

const API_BASE = 'http://localhost:5000/api';

export default function ManualOrder({ token, role }) {
  const [hotels, setHotels] = useState([]);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (role !== 'hotel') {
      fetchHotels();
    }
  }, [role]);

  const fetchHotels = async () => {
    setLoading(true);
    setStatus('Loading hotels...');

    try {
      const response = await fetch(`${API_BASE}/hotels`);
      if (!response.ok) throw new Error('Unable to fetch hotel list');
      const data = await response.json();
      setHotels(data || []);
      setStatus('Select a hotel to browse its menu.');
    } catch (error) {
      setStatus(error.message || 'Failed to load hotels.');
    } finally {
      setLoading(false);
    }
  };

  const selectHotel = async (hotel) => {
    const hotelId = hotel.id || hotel._id;
    setSelectedHotel(hotel);
    setMenu([]);
    setStatus('Loading menu...');

    try {
      if (!hotelId) throw new Error('Selected hotel has no id');
      const response = await fetch(`${API_BASE}/hotels/${hotelId}/menu`);
      if (!response.ok) throw new Error('Unable to load menu');
      const data = await response.json();
      setMenu(data || []);
      setStatus('Tap menu items to add them to the cart.');
    } catch (error) {
      setStatus(error.message || 'Failed to load menu.');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (item) => {
    setCart((current) => {
      const existing = current.find((entry) => entry.id === item.id);
      if (existing) {
        return current.map((entry) =>
          entry.id === item.id ? { ...entry, quantity: entry.quantity + 1 } : entry
        );
      }
      return [...current, { ...item, quantity: 1 }];
    });
  };

  const updateCartQuantity = (itemId, delta) => {
    setCart((current) =>
      current
        .map((entry) =>
          entry.id === itemId ? { ...entry, quantity: Math.max(1, entry.quantity + delta) } : entry
        )
        .filter((entry) => entry.quantity > 0)
    );
  };

  const placeOrder = async () => {
    if (!selectedHotel || cart.length === 0) {
      setStatus('Please select a hotel and add at least one item to the cart.');
      return;
    }

    setLoading(true);
    setStatus('Placing your order...');

    try {
      const response = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : undefined,
        },
        body: JSON.stringify({ hotelId: selectedHotel.id, items: cart }),
      });

      if (!response.ok) throw new Error('Order submission failed');
      const data = await response.json();
      setCart([]);
      setStatus(`Order placed successfully! Order id: ${data.orderId || 'N/A'}`);
    } catch (error) {
      setStatus(error.message || 'Unable to place order.');
    } finally {
      setLoading(false);
    }
  };

  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (role === 'hotel') {
    return (
      <div className="section-card">
        <h2>Hotel dashboard</h2>
        <p>
          Hotel users can register menu items during sign up. This dashboard is the hotel shell for managing menu and order requests.
        </p>
      </div>
    );
  }

  return (
    <div className="manual-order-shell">
      <div className="section-card">
        <h2>Available hotels</h2>
        {loading && <p className="status-message">Loading hotels...</p>}
        <div className="card-grid" style={{ marginTop: 16 }}>
          {hotels.length === 0 && !loading ? (
            <p className="status-message">No hotels found.</p>
          ) : (
            hotels.map((hotel) => (
              <div key={hotel.id ?? hotel._id} className="card-item">
                <button
                  type="button"
                  className={
                    (selectedHotel?.id ?? selectedHotel?._id) === (hotel.id ?? hotel._id)
                      ? 'button button-primary'
                      : 'button button-secondary'
                  }
                  onClick={() => selectHotel(hotel)}
                  style={{ width: '100%' }}
                >
                  {hotel.name}
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {selectedHotel && (
        <div className="section-card">
          <h2>{selectedHotel.name}</h2>
          <p>{selectedHotel.description || 'Browse the menu and add items to your cart.'}</p>

          {menu.length === 0 ? (
            <p className="status-message">No menu items available for this hotel.</p>
          ) : (
            <div className="card-grid" style={{ marginTop: 20 }}>
              {menu.map((item) => (
                  <div key={item.id ?? item._id ?? index} className="card-item">
                  <div>
                    <h3>{item.name}</h3>
                    <p style={{ margin: '8px 0 14px', color: '#475569' }}>{item.description || 'Delicious choice'}</p>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong>${Number(item.price).toFixed(2)}</strong>
                    <button type="button" className="button button-primary" onClick={() => addToCart(item)}>
                      Add to cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="section-card">
        <h2>Your cart</h2>
        {cart.length === 0 ? (
          <p className="status-message">Add items to your cart to place an order.</p>
        ) : (
          <div className="card-grid">
            {cart.map((item) => (
              <div key={item.id ?? item._id} className="card-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>{item.name}</strong>
                  <div style={{ color: '#64748b', fontSize: '0.95rem' }}>${Number(item.price).toFixed(2)} × {item.quantity}</div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button type="button" className="button button-secondary" onClick={() => updateCartQuantity(item.id, -1)}>-</button>
                  <button type="button" className="button button-secondary" onClick={() => updateCartQuantity(item.id, 1)}>+</button>
                </div>
              </div>
            ))}

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16, alignItems: 'center' }}>
              <strong>Total</strong>
              <strong>${totalPrice.toFixed(2)}</strong>
            </div>

            <OrderForm cart={cart} onPlaceOrder={placeOrder} loading={loading} total={totalPrice} />
          </div>
        )}
        {status && <p className="status-message">{status}</p>}
      </div>
    </div>
  );
}
