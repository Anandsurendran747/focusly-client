// src/index.js

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// ✅ Capture install prompt early
window.__installPrompt = null;
window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    window.__installPrompt = e;
    console.log("✅ Install prompt captured early!");
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<React.StrictMode><App /></React.StrictMode>);

// ✅ Register Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker
            .register('/firebase-messaging-sw.js')
            .then(reg => {
                console.log('✅ SW registered:', reg);

                const handleNewWorker = (worker) => {
                    worker.onstatechange = () => {
                        if (worker.state === 'activated') {
                            console.log('🔄 New SW activated, reloading...');
                            window.location.reload();
                        }
                    };
                };

                // ✅ Case 1: update found after registration
                reg.onupdatefound = () => {
                    handleNewWorker(reg.installing);
                };

                // ✅ Case 2: new SW already waiting (page was open during deploy)
                if (reg.waiting) {
                    reg.waiting.postMessage({ type: 'SKIP_WAITING' });
                    handleNewWorker(reg.waiting);
                }

                // ✅ Case 3: check for updates every 60 seconds
                setInterval(() => reg.update(), 60 * 1000);
            })
            .catch(err => console.error('❌ SW failed:', err));
    });
}