importScripts(
  "https://www.gstatic.com/firebasejs/12.14.0/firebase-app-compat.js"
);

importScripts(
  "https://www.gstatic.com/firebasejs/12.14.0/firebase-messaging-compat.js"
);

const firebaseConfig = {
  apiKey: "AIzaSyAgNyEOSSj25eMR09YefVJTv-U1l76WJFM",
  authDomain: "focusly-anand.firebaseapp.com",
  projectId: "focusly-anand",
  storageBucket: "focusly-anand.firebasestorage.app",
  messagingSenderId: "804864668187",
  appId: "1:804864668187:web:f9187ed9e9319e12b03ebe",
  measurementId: "G-2XSE4WCNDY"
};

const messaging = firebase.messaging();