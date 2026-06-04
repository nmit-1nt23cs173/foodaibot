import React, { useState } from 'react';

export default function AddOrder({ onAdd }) {
  const [itemName, setItemName] = useState('');
  const [price, setPrice] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!itemName.trim() || !price) return;
    onAdd({ name: itemName.trim(), price: Number(price) });
    setItemName('');
    setPrice('');
  };

  return (
    <div className="section-card">
      <h3>Add menu item</h3>
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label>Item name</label>
          <input value={itemName} onChange={(event) => setItemName(event.target.value)} placeholder="e.g. Burger" />
        </div>
        <div className="input-group">
          <label>Price</label>
          <input type="number" min="0" step="0.01" value={price} onChange={(event) => setPrice(event.target.value)} />
        </div>
        <button type="submit" className="button button-primary">Add item</button>
      </form>
    </div>
  );
}
