/* =========================================================
   FIREBASE MESSAGING SERVICE WORKER
========================================================= */

importScripts(
  "https://www.gstatic.com/firebasejs/9.22.2/firebase-app-compat.js"
);

importScripts(
  "https://www.gstatic.com/firebasejs/9.22.2/firebase-messaging-compat.js"
);

/* =========================================================
   FIREBASE CONFIG
========================================================= */

firebase.initializeApp({
  apiKey: "PUT_THE_SAME_API_KEY_USED_BY_VITE_FIREBASE_API_KEY_HERE",

  authDomain:
    "asan-app-4b7ea.firebaseapp.com",

  projectId:
    "asan-app-4b7ea",

  messagingSenderId:
    "802587778210",

  appId:
    "1:802587778210:web:9210b7fcede1f7f3708bfb",
});

/* =========================================================
   FIREBASE MESSAGING
========================================================= */

const messaging =
  firebase.messaging();

/* =========================================================
   BACKGROUND NOTIFICATIONS
========================================================= */

messaging.onBackgroundMessage(
  (payload) => {
    console.log(
      "Background notification received:",
      payload
    );

    const notification =
      payload?.notification || {};

    const title =
      notification.title ||
      "ASANRIDES";

    const options = {
      body:
        notification.body ||
        "You have a new notification.",

      icon:
        "/Icon.png",

      badge:
        "/Icon.png",

      data:
        payload?.data || {},
    };

    self.registration.showNotification(
      title,
      options
    );
  }
);