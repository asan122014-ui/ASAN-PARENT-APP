import {
  useEffect,
  useRef,
} from "react";

import {
  Capacitor,
} from "@capacitor/core";

import {
  PushNotifications,
} from "@capacitor/push-notifications";

import {
  App as CapacitorApp,
} from "@capacitor/app";

import {
  Toast,
} from "@capacitor/toast";

import AppRoutes from "./routes/AppRoutes";

import {
  generateToken,
} from "./firebase";

import {
  saveParentFcmToken,
} from "./api/parentApi";

/* =========================================================
   CONFIGURATION
========================================================= */

/*
  Add the route used by your actual Parent Home screen here.

  I have included the common possibilities below.

  The activeTab check further below also detects "home"
  when MainScreen uses tabs instead of separate URLs.
*/

const HOME_ROUTES = new Set([
  "/home",
  "/dashboard",
  "/main",
  "/mainscreen",
]);

/*
  Login/authentication pages.

  We never want Android back from the authenticated
  application to accidentally return to these pages.
*/

const AUTH_ROUTES = new Set([
  "/",
  "/login",
  "/forgot-password",
]);

/*
  Double-back time window.
*/

const EXIT_BACK_DELAY = 2000;

/* =========================================================
   NORMALIZE PATH
========================================================= */

const normalizePath = (
  path
) => {
  if (
    !path
  ) {
    return "/";
  }

  let normalized =
    String(
      path
    )
      .trim()
      .toLowerCase();

  /*
    Remove query/hash information if somehow included.
  */

  normalized =
    normalized.split("?")[0];

  normalized =
    normalized.split("#")[0];

  /*
    Remove trailing slash except root.
  */

  if (
    normalized.length >
      1 &&
    normalized.endsWith(
      "/"
    )
  ) {
    normalized =
      normalized.slice(
        0,
        -1
      );
  }

  return (
    normalized ||
    "/"
  );
};

/* =========================================================
   APP
========================================================= */

function App() {
  /* =======================================================
     PUSH TOKEN
  ======================================================= */

  const latestPushToken =
    useRef(null);

  /* =======================================================
     BACK BUTTON REFS
  ======================================================= */

  const lastBackPressRef =
    useRef(0);

  const backProcessingRef =
    useRef(false);

  /* =======================================================
     CHECK ASAN PARENT SESSION
  ======================================================= */

  const hasParentSession =
    () => {
      const accessToken =
        localStorage.getItem(
          "accessToken"
        );

      const parent =
        localStorage.getItem(
          "parent"
        );

      return Boolean(
        accessToken &&
        parent
      );
    };

  /* =======================================================
     CHECK HOME SCREEN
  ======================================================= */

  const isHomeScreen =
    () => {
      const pathname =
        normalizePath(
          window.location
            .pathname
        );

      /*
        Case 1:
        Home has its own URL.
      */

      if (
        HOME_ROUTES.has(
          pathname
        )
      ) {
        return true;
      }

      /*
        Case 2:
        MainScreen uses internal tabs and keeps
        something like:

        localStorage.activeTab = "home"
      */

      const activeTab =
        String(
          localStorage.getItem(
            "activeTab"
          ) || ""
        )
          .trim()
          .toLowerCase();

      if (
        activeTab ===
        "home"
      ) {
        return true;
      }

      /*
        Root "/" is login in your Parent app,
        so DON'T treat it as Home when there is
        no authenticated Parent session.

        If MainScreen happens to stay on "/" after
        login and activeTab is unavailable, an
        authenticated session identifies it as
        application Home.
      */

      if (
        pathname === "/" &&
        hasParentSession()
      ) {
        return true;
      }

      return false;
    };

  /* =======================================================
     CHECK AUTH PAGE
  ======================================================= */

  const isAuthScreen =
    () => {
      const pathname =
        normalizePath(
          window.location
            .pathname
        );

      return (
        AUTH_ROUTES.has(
          pathname
        ) &&
        !hasParentSession()
      );
    };

  /* =======================================================
     SHOW EXIT TOAST
  ======================================================= */

  const showExitToast =
    async () => {
      try {
        await Toast.show({
          text:
            "Press back again to exit",

          duration:
            "short",

          position:
            "bottom",
        });
      } catch (
        error
      ) {
        console.warn(
          "Unable to show exit toast:",
          error
        );
      }
    };

  /* =======================================================
     EXIT OR WAIT FOR SECOND BACK
  ======================================================= */

  const handleExitBack =
    async () => {
      const now =
        Date.now();

      const elapsed =
        now -
        lastBackPressRef.current;

      if (
        elapsed <
        EXIT_BACK_DELAY
      ) {
        lastBackPressRef.current =
          0;

        try {
          await CapacitorApp
            .exitApp();
        } catch (
          error
        ) {
          console.error(
            "Unable to exit app:",
            error
          );
        }

        return;
      }

      lastBackPressRef.current =
        now;

      await showExitToast();
    };

  /* =======================================================
     SAVE FCM TOKEN
  ======================================================= */

  const saveTokenToBackend =
    async (
      token
    ) => {
      if (
        !token ||
        !hasParentSession()
      ) {
        return;
      }

      try {
        await saveParentFcmToken(
          token
        );
      } catch (
        error
      ) {
        console.error(
          "Failed to save push notification token:",
          error?.response
            ?.data
            ?.message ||
            error?.message ||
            error
        );
      }
    };

  /* =======================================================
     PARENT AUTH EVENT
  ======================================================= */

  useEffect(() => {
    const handleParentAuthenticated =
      async () => {
        if (
          !latestPushToken.current
        ) {
          return;
        }

        await saveTokenToBackend(
          latestPushToken.current
        );
      };

    window.addEventListener(
      "asan:parent-authenticated",
      handleParentAuthenticated
    );

    return () => {
      window.removeEventListener(
        "asan:parent-authenticated",
        handleParentAuthenticated
      );
    };
  }, []);

  /* =======================================================
     PUSH NOTIFICATIONS
  ======================================================= */

  useEffect(() => {
    let registrationListener =
      null;

    let registrationErrorListener =
      null;

    let receivedListener =
      null;

    let actionListener =
      null;

    let cancelled =
      false;

    const setupPushNotifications =
      async () => {
        /* =================================================
           NATIVE ANDROID / IOS
        ================================================= */

        if (
          Capacitor.isNativePlatform()
        ) {
          try {
            let permission =
              await PushNotifications
                .checkPermissions();

            if (
              permission.receive ===
              "prompt"
            ) {
              permission =
                await PushNotifications
                  .requestPermissions();
            }

            if (
              permission.receive !==
              "granted"
            ) {
              return;
            }

            /* ===============================================
               ANDROID CHANNEL
            =============================================== */

            try {
              await PushNotifications
                .createChannel({
                  id:
                    "default",

                  name:
                    "ASAN Notifications",

                  description:
                    "Parent trip and safety notifications",

                  importance:
                    5,

                  visibility:
                    1,

                  sound:
                    "default",
                });
            } catch (
              error
            ) {
              /*
                Channel creation is
                Android-specific.
              */

              console.debug(
                "Notification channel:",
                error
              );
            }

            /* ===============================================
               REGISTRATION LISTENER
            =============================================== */

            registrationListener =
              await PushNotifications
                .addListener(
                  "registration",

                  async (
                    token
                  ) => {
                    if (
                      cancelled
                    ) {
                      return;
                    }

                    const tokenValue =
                      token?.value
                        ?.trim();

                    if (
                      !tokenValue
                    ) {
                      return;
                    }

                    latestPushToken.current =
                      tokenValue;

                    localStorage.setItem(
                      "push_token",
                      tokenValue
                    );

                    if (
                      hasParentSession()
                    ) {
                      await saveTokenToBackend(
                        tokenValue
                      );
                    }
                  }
                );

            /* ===============================================
               REGISTRATION ERROR
            =============================================== */

            registrationErrorListener =
              await PushNotifications
                .addListener(
                  "registrationError",

                  (
                    error
                  ) => {
                    console.error(
                      "Push notification registration failed:",
                      error
                    );
                  }
                );

            /* ===============================================
               FOREGROUND NOTIFICATION
            =============================================== */

            receivedListener =
              await PushNotifications
                .addListener(
                  "pushNotificationReceived",

                  (
                    notification
                  ) => {
                    window.dispatchEvent(
                      new CustomEvent(
                        "asan:notification",
                        {
                          detail:
                            notification,
                        }
                      )
                    );
                  }
                );

            /* ===============================================
               NOTIFICATION CLICK
            =============================================== */

            actionListener =
              await PushNotifications
                .addListener(
                  "pushNotificationActionPerformed",

                  (
                    action
                  ) => {
                    window.dispatchEvent(
                      new CustomEvent(
                        "asan:notification-click",
                        {
                          detail:
                            action,
                        }
                      )
                    );
                  }
                );

            /* ===============================================
               REGISTER DEVICE
            =============================================== */

            await PushNotifications
              .register();
          } catch (
            error
          ) {
            console.error(
              "Native push setup failed:",
              error
            );
          }

          return;
        }

        /* =================================================
           WEB PUSH
        ================================================= */

        try {
          const token =
            await generateToken();

          if (
            cancelled ||
            !token
          ) {
            return;
          }

          latestPushToken.current =
            token;

          localStorage.setItem(
            "push_token",
            token
          );

          if (
            hasParentSession()
          ) {
            await saveTokenToBackend(
              token
            );
          }
        } catch (
          error
        ) {
          console.error(
            "Web push setup failed:",
            error
          );
        }
      };

    setupPushNotifications();

    return () => {
      cancelled =
        true;

      registrationListener
        ?.remove?.();

      registrationErrorListener
        ?.remove?.();

      receivedListener
        ?.remove?.();

      actionListener
        ?.remove?.();
    };
  }, []);

  /* =======================================================
     ANDROID HARDWARE / GESTURE BACK BUTTON

     BEHAVIOUR:

     Child page
          ↓
     previous page
          ↓
     previous page
          ↓
     Home
          ↓
     "Press back again to exit"
          ↓
     second back
          ↓
     Exit
  ======================================================= */

  useEffect(() => {
    if (
      !Capacitor.isNativePlatform()
    ) {
      return;
    }

    let listenerHandle =
      null;

    let cancelled =
      false;

    const registerBackButton =
      async () => {
        try {
          listenerHandle =
            await CapacitorApp
              .addListener(
                "backButton",

                async () => {
                  /*
                    Avoid two back operations executing
                    simultaneously when Android sends
                    rapid events.
                  */

                  if (
                    backProcessingRef.current
                  ) {
                    return;
                  }

                  backProcessingRef.current =
                    true;

                  try {
                    /* =====================================
                       1. ALLOW CURRENT SCREEN/MODAL
                          TO CONSUME BACK FIRST
                    ===================================== */

                    let handledByScreen =
                      false;

                    const backEvent =
                      new CustomEvent(
                        "asan:android-back",
                        {
                          cancelable:
                            true,

                          detail: {
                            handle: () => {
                              handledByScreen =
                                true;
                            },
                          },
                        }
                      );

                    window.dispatchEvent(
                      backEvent
                    );

                    if (
                      handledByScreen ||
                      backEvent
                        .defaultPrevented
                    ) {
                      lastBackPressRef.current =
                        0;

                      return;
                    }

                    /* =====================================
                       2. HOME SCREEN
                    ===================================== */

                    if (
                      isHomeScreen()
                    ) {
                      await handleExitBack();

                      return;
                    }

                    /* =====================================
                       3. LOGIN / AUTH SCREEN

                       At login there normally isn't a
                       previous application page.

                       So use double-back-to-exit.
                    ===================================== */

                    if (
                      isAuthScreen()
                    ) {
                      await handleExitBack();

                      return;
                    }

                    /*
                      We moved away from Home, so a prior
                      first-back press must no longer count.
                    */

                    lastBackPressRef.current =
                      0;

                    /* =====================================
                       4. REACT ROUTER HISTORY INDEX
                    ===================================== */

                    const historyState =
                      window.history
                        .state;

                    const historyIndex =
                      Number(
                        historyState
                          ?.idx
                      );

                    if (
                      Number.isFinite(
                        historyIndex
                      ) &&
                      historyIndex >
                        0
                    ) {
                      window.history.back();

                      return;
                    }

                    /* =====================================
                       5. GENERIC BROWSER HISTORY
                    ===================================== */

                    if (
                      window.history
                        .length >
                      1
                    ) {
                      window.history.back();

                      return;
                    }

                    /* =====================================
                       6. NO HISTORY AVAILABLE

                       If the authenticated app was opened
                       directly on a child page, send it
                       back to the Home/Main screen instead
                       of exiting immediately.
                    ===================================== */

                    if (
                      hasParentSession()
                    ) {
                      /*
                        Your MainScreen appears to use tabs.

                        Set home so that the app knows which
                        tab should be selected.
                      */

                      localStorage.setItem(
                        "activeTab",
                        "home"
                      );

                      /*
                        Components can listen for this event
                        and switch to Home without requiring
                        a full reload.
                      */

                      window.dispatchEvent(
                        new CustomEvent(
                          "asan:navigate-home"
                        )
                      );

                      /*
                        If your Parent Home uses /home,
                        uncomment the following line:

                        window.location.replace("/home");

                        If it uses /dashboard:

                        window.location.replace("/dashboard");

                        We don't force one here because your
                        MainScreen is tab-based.
                      */

                      return;
                    }

                    /* =====================================
                       7. FINAL FALLBACK
                    ===================================== */

                    await handleExitBack();
                  } catch (
                    error
                  ) {
                    console.error(
                      "Android back button error:",
                      error
                    );
                  } finally {
                    /*
                      Small delay prevents Android from
                      producing duplicate back events during
                      navigation animation.
                    */

                    window.setTimeout(
                      () => {
                        backProcessingRef.current =
                          false;
                      },
                      120
                    );
                  }
                }
              );
        } catch (
          error
        ) {
          console.error(
            "Unable to register Android back button:",
            error
          );
        }
      };

    registerBackButton();

    return () => {
      cancelled =
        true;

      if (
        listenerHandle
          ?.remove
      ) {
        listenerHandle.remove();
      }
    };
  }, []);

  /* =======================================================
     RESET DOUBLE-BACK WHEN NAVIGATION OCCURS
  ======================================================= */

  useEffect(() => {
    const resetBackPress =
      () => {
        if (
          !isHomeScreen()
        ) {
          lastBackPressRef.current =
            0;
        }
      };

    window.addEventListener(
      "popstate",
      resetBackPress
    );

    return () => {
      window.removeEventListener(
        "popstate",
        resetBackPress
      );
    };
  }, []);

  /* =======================================================
     ROUTES
  ======================================================= */

  return (
    <AppRoutes />
  );
}

export default App;