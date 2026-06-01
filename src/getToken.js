// src/getToken.js

import { getToken } from "firebase/messaging";
import { messaging } from "./firebase";
import { saveFcmToken } from "./api";

export async function getFCMToken() {
  const permission = await Notification.requestPermission();

  if (permission !== "granted") {
    alert("Notification permission denied");
    return;
  }

  // ✅ Wait for SW to be fully ready
  const swRegistration = await navigator.serviceWorker.ready;
  console.log("SW ready:", swRegistration.scope);

  const token = await getToken(messaging, {
    vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY,
    serviceWorkerRegistration: swRegistration, // ✅ THIS was missing
  });

  await saveFcmToken(token);

  return token;
}