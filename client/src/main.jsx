import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import axios from 'axios'

// Prevent double slashes in API URLs (e.g., https://domain.com//latest-blogs -> https://domain.com/latest-blogs)
axios.interceptors.request.use((config) => {
  if (config.url) {
    config.url = config.url.replace(/([^:]\/)\/+/g, "$1");
  }
  return config;
});

ReactDOM.createRoot(document.getElementById('root')).render(
  // <React.StrictMode> 
  <BrowserRouter>
    <App />
  </BrowserRouter>
  // </React.StrictMode>
)