import { getAuthToken } from './session.js';

const API_URL = import.meta.env.VITE_API_URL || '';
const SW_PATH = '/sw.js';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));
}

let _registration = null;

export async function initPush(userId) {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

  try {
    // Register service worker
    _registration = await navigator.serviceWorker.register(SW_PATH);
    await navigator.serviceWorker.ready;

    // Check if already subscribed
    const existingSub = await _registration.pushManager.getSubscription();
    if (existingSub) {
      await sendSubToServer(userId, existingSub);
      return;
    }

    // Request permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return;

    // Fetch VAPID public key
    const keyRes = await fetch(`${API_URL}/api/push/vapid-public-key`);
    const { publicKey } = await keyRes.json();

    // Subscribe
    const subscription = await _registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });

    await sendSubToServer(userId, subscription);
  } catch (_) {}
}

async function sendSubToServer(userId, sub) {
  try {
    const token = getAuthToken();
    if (!token || !userId) return;

    const subJson = sub.toJSON();
    await fetch(`${API_URL}/api/push/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        endpoint: subJson.endpoint,
        p256dh: subJson.keys?.p256dh,
        auth: subJson.keys?.auth,
      }),
    });
  } catch (_) {}
}

export async function unsubscribePush(userId) {
  if (!_registration) return;
  try {
    const sub = await _registration.pushManager.getSubscription();
    if (sub) {
      const token = getAuthToken();
      if (token && userId) {
        await fetch(`${API_URL}/api/push/unsubscribe`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
      }
      await sub.unsubscribe();
    }
  } catch (_) {}
}

export function isPushSupported() {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

export function getPushPermission() {
  if (!('Notification' in window)) return 'unsupported';
  return Notification.permission;
}
