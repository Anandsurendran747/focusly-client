// src/index.js — ADD THIS at the very top before anything else

window.__installPrompt = null; // global store

window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    window.__installPrompt = e;
    console.log("✅ Install prompt captured early!");
});



import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';




const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<React.StrictMode><App /></React.StrictMode>);

// src/index.js

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // ✅ Register only ONE service worker
        navigator.serviceWorker
            .register('/firebase-messaging-sw.js')
            .then(reg => console.log('✅ SW registered:', reg))
            .catch(err => console.error('❌ SW failed:', err));
    });
}