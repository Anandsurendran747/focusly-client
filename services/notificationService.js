// src/services/notificationService.js

import { getToken, onMessage } from 'firebase/messaging';
import { messaging } from '../firebase';

export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('Permission denied');
      return null;
    }

    // ✅ Wait for SW to be ready
    const swRegistration = await navigator.serviceWorker.ready;

    console.log('SW ready:', swRegistration);

    const token = await getToken(messaging, {
      vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: swRegistration
    });

    console.log('✅ FCM Token:', token);
    return token;

  } catch (err) {
    console.error('❌ Notification error:', err);
    throw err;
  }
};

export const onMessageListener = () => {
  return new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });
};