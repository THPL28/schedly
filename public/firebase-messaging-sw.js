importScripts('https://www.gstatic.com/firebasejs/10.9.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.9.0/firebase-messaging-compat.js');

const firebaseConfig = {
    apiKey: "AIzaSyBZQCO9q17Qnot9uT7uMpA7x5a4CUcuNQA",
    authDomain: "schedly-417f8.firebaseapp.com",
    projectId: "schedly-417f8",
    storageBucket: "schedly-417f8.firebasestorage.app",
    messagingSenderId: "842133140116",
    appId: "1:842133140116:web:8a0aedd1c650f7b2547a81",
    measurementId: "G-44SMCYPYZM"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    const notificationTitle = payload.notification?.title || 'Novo aviso';
    const notificationOptions = {
        body: payload.notification?.body,
        icon: '/icon-192x192.png'
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
