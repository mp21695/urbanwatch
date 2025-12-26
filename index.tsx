
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import "./index.css";

console.log("[UrbanWatch] Initializing application root...");

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error("[UrbanWatch] Critical: Could not find root element. Ensure index.html contains <div id='root'></div>");
} else {
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log("[UrbanWatch] Application mounted successfully.");
  } catch (err) {
    console.error("[UrbanWatch] Render error:", err);
  }
}
