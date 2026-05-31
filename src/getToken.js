import { getToken } from "firebase/messaging";
import { messaging } from "./firebase";
import { saveFcmToken } from "./api";

export async function getFCMToken() {
  const permission =
    await Notification.requestPermission();

  if (permission !== "granted") {
    alert("Notification permission denied");
    return;
  }

  const token = await getToken(
    messaging,
    {
      vapidKey: process.env.REACT_APP_VAPID_KEY,
    }
  );

  const ttoken = await saveFcmToken(token);

  return token;
}