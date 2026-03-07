import { initializeApp, getApps, getApp } from "firebase/app";
import { getMessaging, getToken, onMessage, Messaging } from "firebase/messaging";

const firebaseConfig = {
    apiKey: "AIzaSyBZQCO9q17Qnot9uT7uMpA7x5a4CUcuNQA",
    authDomain: "schedly-417f8.firebaseapp.com",
    projectId: "schedly-417f8",
    storageBucket: "schedly-417f8.firebasestorage.app",
    messagingSenderId: "842133140116",
    appId: "1:842133140116:web:8a0aedd1c650f7b2547a81",
    measurementId: "G-44SMCYPYZM"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const messaging: Messaging | null = typeof window !== 'undefined' ? getMessaging(app) : null;

export const requestFirebaseNotificationPermission = async () => {
    try {
        if (!messaging) return null;

        // Check if permission is already granted
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            const token = await getToken(messaging, {
                vapidKey: "BPvBpPNZeqY2cgGGlmFtlaUgqHEtKIn1yk0tiZ_xdp89FqW1SqEHbKxIch5nr2zm13Gg_bNkLvu-fnbWWpUMWgE"
            });
            console.log('Firebase Cloud Messaging Token:', token);
            return token;
        } else {
            console.warn('Firebase Cloud Messaging permission denied');
            return null;
        }
    } catch (error) {
        console.error('An error occurred while retrieving Firebase token. ', error);
        return null;
    }
};

export const onMessageListener = () =>
    new Promise((resolve) => {
        if (!messaging) return;
        onMessage(messaging, (payload) => {
            resolve(payload);
        });
    });

export { app };
