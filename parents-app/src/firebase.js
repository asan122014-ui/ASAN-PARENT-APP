import {
  initializeApp,
} from "firebase/app";

import {
  getMessaging,
  getToken,
  isSupported,
  onMessage,
} from "firebase/messaging";

/* =========================================================
   FIREBASE CONFIGURATION
========================================================= */

const firebaseConfig = {
  apiKey:
    import.meta.env
      .VITE_FIREBASE_API_KEY,

  authDomain:
    import.meta.env
      .VITE_FIREBASE_AUTH_DOMAIN,

  projectId:
    import.meta.env
      .VITE_FIREBASE_PROJECT_ID,

  messagingSenderId:
    import.meta.env
      .VITE_FIREBASE_MESSAGING_SENDER_ID,

  appId:
    import.meta.env
      .VITE_FIREBASE_APP_ID,
};

/* =========================================================
   VALIDATE CONFIG
========================================================= */

const requiredFirebaseConfig = [
  "apiKey",
  "projectId",
  "messagingSenderId",
  "appId",
];

for (
  const key of
  requiredFirebaseConfig
) {
  if (
    !firebaseConfig[key]
  ) {
    console.error(
      `Missing Firebase environment variable for: ${key}`
    );
  }
}

/* =========================================================
   INITIALIZE FIREBASE
========================================================= */

const app =
  initializeApp(
    firebaseConfig
  );

/* =========================================================
   FIREBASE MESSAGING
========================================================= */

let messagingInstance =
  null;

/* =========================================================
   GET MESSAGING INSTANCE
========================================================= */

export const getMessagingInstance =
  async () => {
    try {
      const supported =
        await isSupported();

      if (
        !supported
      ) {
        console.warn(
          "Firebase Messaging is not supported in this browser."
        );

        return null;
      }

      if (
        !messagingInstance
      ) {
        messagingInstance =
          getMessaging(
            app
          );
      }

      return messagingInstance;
    } catch (
      error
    ) {
      console.error(
        "Firebase Messaging initialization failed:",
        error?.message ||
          error
      );

      return null;
    }
  };

/* =========================================================
   REGISTER FCM SERVICE WORKER
========================================================= */

const registerMessagingServiceWorker =
  async () => {
    if (
      !(
        "serviceWorker" in
        navigator
      )
    ) {
      console.warn(
        "Service workers are not supported in this browser."
      );

      return null;
    }

    try {
      const registration =
        await navigator
          .serviceWorker
          .register(
            "/firebase-messaging-sw.js"
          );

      await navigator
        .serviceWorker
        .ready;

      return registration;
    } catch (
      error
    ) {
      console.error(
        "Firebase messaging service worker registration failed:",
        error?.message ||
          error
      );

      return null;
    }
  };

/* =========================================================
   GENERATE FCM TOKEN
========================================================= */

export const generateToken =
  async () => {
    try {
      /* =====================================================
         NOTIFICATION SUPPORT
      ===================================================== */

      if (
        !(
          "Notification" in
          window
        )
      ) {
        console.warn(
          "Browser notifications are not supported."
        );

        return null;
      }

      /* =====================================================
         FIREBASE MESSAGING
      ===================================================== */

      const messaging =
        await getMessagingInstance();

      if (
        !messaging
      ) {
        return null;
      }

      /* =====================================================
         NOTIFICATION PERMISSION
      ===================================================== */

      let permission =
        Notification.permission;

      if (
        permission ===
        "default"
      ) {
        permission =
          await Notification
            .requestPermission();
      }

      if (
        permission !==
        "granted"
      ) {
        console.warn(
          "Notification permission was not granted."
        );

        return null;
      }

      /* =====================================================
         VAPID KEY
      ===================================================== */

      const vapidKey =
        import.meta.env
          .VITE_FIREBASE_VAPID_KEY;

      if (
        !vapidKey
      ) {
        console.error(
          "VITE_FIREBASE_VAPID_KEY is missing."
        );

        return null;
      }

      /* =====================================================
         SERVICE WORKER
      ===================================================== */

      const serviceWorkerRegistration =
        await registerMessagingServiceWorker();

      if (
        !serviceWorkerRegistration
      ) {
        return null;
      }

      /* =====================================================
         GET FCM TOKEN
      ===================================================== */

      const token =
        await getToken(
          messaging,
          {
            vapidKey,

            serviceWorkerRegistration,
          }
        );

      if (
        !token
      ) {
        console.warn(
          "FCM token was not returned."
        );

        return null;
      }

      console.log(
        "FCM token generated successfully."
      );

      return token;
    } catch (
      error
    ) {
      console.error(
        "FCM token generation failed:",
        error?.message ||
          error
      );

      return null;
    }
  };

/* =========================================================
   FOREGROUND NOTIFICATIONS
========================================================= */

export const onMessageListener =
  async () => {
    const messaging =
      await getMessagingInstance();

    if (
      !messaging
    ) {
      return null;
    }

    return new Promise(
      (
        resolve
      ) => {
        onMessage(
          messaging,
          (
            payload
          ) => {
            resolve(
              payload
            );
          }
        );
      }
    );
  };

/* =========================================================
   EXPORT APP
========================================================= */

export default app;