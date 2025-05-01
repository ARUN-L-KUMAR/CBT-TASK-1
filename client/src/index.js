import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './NewApp';
import reportWebVitals from './reportWebVitals';
import { AppProvider } from './context/AppContext';

// Contract address
const CONTRACT_ADDRESS = '0x5D2d4849A8B37F86228607446F0152176bB3Ae5D';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AppProvider contractAddress={CONTRACT_ADDRESS}>
      <App />
    </AppProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
