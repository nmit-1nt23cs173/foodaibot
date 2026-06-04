import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || '212060788024-ul79ddbpnli12nvld8ng47skpqhgif11.apps.googleusercontent.com';
const root = ReactDOM.createRoot(document.getElementById('root'));

const app = (
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

root.render(
  clientId ? <GoogleOAuthProvider clientId={clientId}>{app}</GoogleOAuthProvider> : app
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
