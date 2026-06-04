import React, { useEffect, useRef, useState } from 'react';

const API_BASE = 'http://localhost:5000/api';

export default function ChatbotPopup() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Hello! How can I help you with your order today?' },
  ]);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage = { from: 'user', text: input.trim() };
    setMessages((current) => [...current, userMessage]);
    setInput('');
    setSending(true);

    try {
      const response = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage.text }),
      });

      if (!response.ok) throw new Error('Chat service failed');
      const data = await response.json();
      setMessages((current) => [...current, { from: 'bot', text: data.reply || 'I am here to help.' }]);
    } catch (error) {
      setMessages((current) => [...current, { from: 'bot', text: 'Unable to connect to chat service.' }]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ position: 'fixed', right: 24, bottom: 24, zIndex: 999 }}>
      {open && (
        <div style={{ width: 320, background: 'white', borderRadius: 20, boxShadow: '0 24px 80px rgba(15,23,42,0.18)', overflow: 'hidden' }}>
          <div style={{ padding: 16, background: '#2563eb', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Chat Assistant</span>
            <button type="button" onClick={() => setOpen(false)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>
              ✕
            </button>
          </div>

          <div ref={scrollRef} style={{ maxHeight: 320, overflowY: 'auto', padding: 16, display: 'grid', gap: 12, background: '#f8fafc' }}>
            {messages.map((message, index) => (
              <div key={index} style={{ alignSelf: message.from === 'bot' ? 'start' : 'end', maxWidth: '85%' }}>
                <div style={{ background: message.from === 'bot' ? '#e2e8f0' : '#2563eb', color: message.from === 'bot' ? '#0f172a' : 'white', borderRadius: 16, padding: 12 }}>
                  {message.text}
                </div>
              </div>
            ))}
          </div>

          <div style={{ padding: 14, background: '#f8fafc', display: 'grid', gap: 10 }}>
            <input
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Type a message..."
              style={{ width: '100%', padding: 10, borderRadius: 12, border: '1px solid #cbd5e1' }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  sendMessage();
                }
              }}
            />
            <button type="button" className="button button-primary" onClick={sendMessage} disabled={sending}>
              {sending ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>
      )}

      {!open && (
        <button type="button" className="button button-primary" onClick={() => setOpen(true)} style={{ borderRadius: 999, width: 56, height: 56 }}>
          💬
        </button>
      )}
    </div>
  );
}
