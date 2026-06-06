// public/firebase-messaging-sw.js

importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

// ─── Firebase Init ───────────────────────────────────────
firebase.initializeApp({
  apiKey: "AIzaSyAgNyEOSSj25eMR09YefVJTv-U1l76WJFM",
  authDomain: "focusly-anand.firebaseapp.com",
  projectId: "focusly-anand",
  storageBucket: "focusly-anand.firebasestorage.app",
  messagingSenderId: "804864668187",
  appId: "1:804864668187:web:f9187ed9e9319e12b03ebe",
  measurementId: "G-2XSE4WCNDY"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('Background message received:', payload);
  self.registration.showNotification(
    payload.notification?.title || 'New Message',
    {
      body: payload.notification?.body || '',
      icon: '/logo192.png'
    }
  );
});

// ─── PWA Caching ─────────────────────────────────────────
const CACHE_NAME = 'focusly-v3';

self.addEventListener('message', (e) => {
  if (e.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('install', (e) => {
  console.log('SW installing...');
  // ✅ No precaching at all — avoid addAll errors
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  console.log('SW activated');
  e.waitUntil(
    // ✅ Nuke ALL old caches unconditionally
    caches.keys().then(keys => {
      console.log('Clearing caches:', keys);
      return Promise.all(keys.map(k => caches.delete(k)));
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // ✅ Always fetch fresh — no caching at all
  if (
    e.request.method !== 'GET' ||
    url.origin !== location.origin
  ) {
    return;
  }

  // ✅ Network first for everything — no stale cache ever
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});