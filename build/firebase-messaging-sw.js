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

// ─── PWA Caching (merged here) ───────────────────────────
const CACHE_NAME = 'focusly-v1';
const urlsToCache = ['/', '/index.html'];

self.addEventListener('install', (e) => {
  console.log('SW installing...');
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  console.log('SW activated');
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // Skip API calls, Firebase, and non-GET requests
  if (
    e.request.method !== 'GET' ||
    url.origin !== location.origin ||
    url.pathname.startsWith('/api/')
  ) {
    return;
  }

  e.respondWith(
    caches.match(e.request).then(res => res || fetch(e.request))
  );
});