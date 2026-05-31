import { getToken } from "firebase/messaging";
import { messaging } from "./firebase";

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
      vapidKey: "YOUR_VAPID_KEY"
    }
  );

  console.log(token);

  return token;
}