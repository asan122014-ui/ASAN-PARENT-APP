import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  motion,
  AnimatePresence,
} from "framer-motion";

import Home from "./Home";
import Tracking from "./Tracking";
import Trips from "./Trips";
import Children from "./Children";
import Billing from "./Billing";
import Profile from "./Profile";
import Notifications from "./Notifications";
import Privacy from "./Privacy";
import Support from "./Support";

import BottomNav from "../../components/layout/BottomNav";

/* =========================================================
   ALL TABS
========================================================= */

const tabs = [
  "home",
  "tracking",
  "trips",
  "children",
  "billing",
  "profile",
  "notifications",
  "privacy",
  "support",
];

/* =========================================================
   TAB VALIDATION
========================================================= */

const isValidTab = (
  value
) => {
  return tabs.includes(
    value
  );
};

/* =========================================================
   MAIN SCREEN
========================================================= */

function MainScreen() {
  /* =======================================================
     INITIAL TAB
  ======================================================= */

  const getInitialTab =
    () => {
      const savedTab =
        localStorage.getItem(
          "activeTab"
        );

      if (
        isValidTab(
          savedTab
        )
      ) {
        return savedTab;
      }

      return "home";
    };

  /* =======================================================
     TAB STATE
  ======================================================= */

  const [
    tab,
    setTab,
  ] =
    useState(
      getInitialTab
    );

  const [
    previousTab,
    setPreviousTab,
  ] =
    useState(() => {
      const savedPrevious =
        localStorage.getItem(
          "previousTab"
        );

      if (
        isValidTab(
          savedPrevious
        )
      ) {
        return savedPrevious;
      }

      return "home";
    });

  /* =======================================================
     TAB HISTORY
  ======================================================= */

  const tabHistoryRef =
    useRef([]);

  /* =======================================================
     CURRENT TAB REF
  ======================================================= */

  const currentTabRef =
    useRef(
      tab
    );

  /* =======================================================
     PREVIOUS TAB REF
  ======================================================= */

  const previousTabRef =
    useRef(
      previousTab
    );

  /* =======================================================
     KEEP CURRENT TAB REF UPDATED
  ======================================================= */

  useEffect(() => {
    currentTabRef.current =
      tab;
  }, [
    tab,
  ]);

  /* =======================================================
     KEEP PREVIOUS TAB REF UPDATED
  ======================================================= */

  useEffect(() => {
    previousTabRef.current =
      previousTab;
  }, [
    previousTab,
  ]);

  /* =======================================================
     SCROLL TO TOP WHENEVER SCREEN CHANGES

     This fixes:

     Profile -> Support
     Support -> Privacy
     Children -> Billing
     Trips -> Home
     etc.

     Every newly opened tab starts from the top.
  ======================================================= */

  useEffect(() => {
    const scrollToTop =
      () => {
        /* Window scroll */

        window.scrollTo({
          top: 0,
          left: 0,
          behavior: "instant",
        });

        /* HTML scroll */

        if (
          document.documentElement
        ) {
          document.documentElement.scrollTop =
            0;

          document.documentElement.scrollLeft =
            0;
        }

        /* Body scroll */

        if (
          document.body
        ) {
          document.body.scrollTop =
            0;

          document.body.scrollLeft =
            0;
        }
      };

    /*
      Run immediately.
    */

    scrollToTop();

    /*
      Run again after React has painted
      the newly selected page.

      This is useful in Android WebView
      and animated tab transitions.
    */

    const frame =
      requestAnimationFrame(
        scrollToTop
      );

    const timeout =
      window.setTimeout(
        scrollToTop,
        50
      );

    return () => {
      cancelAnimationFrame(
        frame
      );

      window.clearTimeout(
        timeout
      );
    };
  }, [
    tab,
  ]);

  /* =======================================================
     SAVE ACTIVE TAB
  ======================================================= */

  useEffect(() => {
    localStorage.setItem(
      "activeTab",
      tab
    );
  }, [
    tab,
  ]);

  /* =======================================================
     SAVE PREVIOUS TAB
  ======================================================= */

  useEffect(() => {
    localStorage.setItem(
      "previousTab",
      previousTab
    );
  }, [
    previousTab,
  ]);

  /* =======================================================
     CHANGE TAB
  ======================================================= */

  const changeTab =
    useCallback(
      (
        nextTab
      ) => {
        if (
          !isValidTab(
            nextTab
          )
        ) {
          return;
        }

        const currentTab =
          currentTabRef.current;

        if (
          nextTab ===
          currentTab
        ) {
          /*
            If the user taps the currently active
            bottom-navigation item again,
            scroll that page back to the top.
          */

          window.scrollTo({
            top: 0,
            left: 0,
            behavior: "smooth",
          });

          return;
        }

        /* =================================================
           STORE CURRENT TAB IN HISTORY
        ================================================= */

        tabHistoryRef.current.push(
          currentTab
        );

        /*
          Prevent endlessly growing history.
        */

        if (
          tabHistoryRef.current
            .length >
          30
        ) {
          tabHistoryRef.current =
            tabHistoryRef.current.slice(
              -30
            );
        }

        /* =================================================
           PREVIOUS TAB
        ================================================= */

        setPreviousTab(
          currentTab
        );

        previousTabRef.current =
          currentTab;

        /* =================================================
           NEXT TAB
        ================================================= */

        setTab(
          nextTab
        );

        currentTabRef.current =
          nextTab;
      },
      []
    );

  /* =======================================================
     CHANGE TAB WITHOUT ADDING HISTORY
  ======================================================= */

  const goBackToTab =
    useCallback(
      (
        targetTab
      ) => {
        if (
          !isValidTab(
            targetTab
          )
        ) {
          targetTab =
            "home";
        }

        const currentTab =
          currentTabRef.current;

        setPreviousTab(
          currentTab
        );

        previousTabRef.current =
          currentTab;

        setTab(
          targetTab
        );

        currentTabRef.current =
          targetTab;
      },
      []
    );

  /* =======================================================
     FIND PREVIOUS TAB
  ======================================================= */

  const getPreviousTab =
    useCallback(
      () => {
        const currentTab =
          currentTabRef.current;

        /* =================================================
           NOTIFICATIONS
        ================================================= */

        if (
          currentTab ===
          "notifications"
        ) {
          const notificationPrevious =
            previousTabRef.current;

          if (
            isValidTab(
              notificationPrevious
            ) &&
            notificationPrevious !==
              "notifications"
          ) {
            const stack =
              tabHistoryRef.current;

            if (
              stack.length >
                0 &&
              stack[
                stack.length -
                  1
              ] ===
                notificationPrevious
            ) {
              stack.pop();
            }

            return notificationPrevious;
          }
        }

        /* =================================================
           NORMAL TAB HISTORY
        ================================================= */

        while (
          tabHistoryRef.current
            .length >
          0
        ) {
          const previous =
            tabHistoryRef.current.pop();

          if (
            isValidTab(
              previous
            ) &&
            previous !==
              currentTab
          ) {
            return previous;
          }
        }

        /* =================================================
           FALLBACK
        ================================================= */

        if (
          currentTab !==
          "home"
        ) {
          return "home";
        }

        return null;
      },
      []
    );

  /* =======================================================
     ANDROID BACK BUTTON
  ======================================================= */

  useEffect(() => {
    const handleAndroidBack =
      (
        event
      ) => {
        const currentTab =
          currentTabRef.current;

        /* =================================================
           HOME
        ================================================= */

        if (
          currentTab ===
          "home"
        ) {
          return;
        }

        /* =================================================
           FIND PREVIOUS SCREEN
        ================================================= */

        const targetTab =
          getPreviousTab();

        if (
          !targetTab
        ) {
          return;
        }

        /* =================================================
           MARK EVENT HANDLED
        ================================================= */

        if (
          typeof event?.detail
            ?.handle ===
          "function"
        ) {
          event.detail.handle();
        }

        if (
          typeof event
            ?.preventDefault ===
          "function"
        ) {
          event.preventDefault();
        }

        /* =================================================
           NAVIGATE BACK
        ================================================= */

        goBackToTab(
          targetTab
        );
      };

    window.addEventListener(
      "asan:android-back",
      handleAndroidBack
    );

    return () => {
      window.removeEventListener(
        "asan:android-back",
        handleAndroidBack
      );
    };
  }, [
    getPreviousTab,
    goBackToTab,
  ]);

  /* =======================================================
     NAVIGATE HOME EVENT
  ======================================================= */

  useEffect(() => {
    const handleNavigateHome =
      () => {
        const currentTab =
          currentTabRef.current;

        if (
          currentTab ===
          "home"
        ) {
          window.scrollTo({
            top: 0,
            left: 0,
            behavior: "smooth",
          });

          return;
        }

        tabHistoryRef.current =
          [];

        setPreviousTab(
          currentTab
        );

        previousTabRef.current =
          currentTab;

        setTab(
          "home"
        );

        currentTabRef.current =
          "home";

        localStorage.setItem(
          "activeTab",
          "home"
        );
      };

    window.addEventListener(
      "asan:navigate-home",
      handleNavigateHome
    );

    return () => {
      window.removeEventListener(
        "asan:navigate-home",
        handleNavigateHome
      );
    };
  }, []);

  /* =======================================================
     PARENT LOGOUT
  ======================================================= */

  useEffect(() => {
    const handleLogout =
      () => {
        tabHistoryRef.current =
          [];

        currentTabRef.current =
          "home";

        previousTabRef.current =
          "home";

        setTab(
          "home"
        );

        setPreviousTab(
          "home"
        );

        localStorage.setItem(
          "activeTab",
          "home"
        );

        localStorage.setItem(
          "previousTab",
          "home"
        );

        window.scrollTo({
          top: 0,
          left: 0,
          behavior: "instant",
        });
      };

    window.addEventListener(
      "asan:parent-logged-out",
      handleLogout
    );

    return () => {
      window.removeEventListener(
        "asan:parent-logged-out",
        handleLogout
      );
    };
  }, []);

  /* =======================================================
     PARENT AUTHENTICATED
  ======================================================= */

  useEffect(() => {
    const handleAuthenticated =
      () => {
        tabHistoryRef.current =
          [];

        currentTabRef.current =
          "home";

        previousTabRef.current =
          "home";

        setPreviousTab(
          "home"
        );

        setTab(
          "home"
        );

        localStorage.setItem(
          "activeTab",
          "home"
        );

        localStorage.setItem(
          "previousTab",
          "home"
        );

        window.scrollTo({
          top: 0,
          left: 0,
          behavior: "instant",
        });
      };

    window.addEventListener(
      "asan:reset-main-navigation",
      handleAuthenticated
    );

    return () => {
      window.removeEventListener(
        "asan:reset-main-navigation",
        handleAuthenticated
      );
    };
  }, []);

  /* =======================================================
     NOTIFICATIONS HELPER
  ======================================================= */

  const openNotifications =
    useCallback(
      (
        sourceTab =
          currentTabRef.current
      ) => {
        const validSource =
          isValidTab(
            sourceTab
          )
            ? sourceTab
            : "home";

        if (
          validSource ===
          "notifications"
        ) {
          return;
        }

        const currentTab =
          currentTabRef.current;

        if (
          currentTab !==
          "notifications"
        ) {
          tabHistoryRef.current.push(
            currentTab
          );
        }

        setPreviousTab(
          validSource
        );

        previousTabRef.current =
          validSource;

        setTab(
          "notifications"
        );

        currentTabRef.current =
          "notifications";
      },
      []
    );

  /* =======================================================
     UPDATE PREVIOUS TAB
  ======================================================= */

  const updatePreviousTab =
    useCallback(
      (
        value
      ) => {
        let nextValue =
          value;

        if (
          typeof value ===
          "function"
        ) {
          nextValue =
            value(
              previousTabRef.current
            );
        }

        if (
          !isValidTab(
            nextValue
          )
        ) {
          return;
        }

        previousTabRef.current =
          nextValue;

        setPreviousTab(
          nextValue
        );

        localStorage.setItem(
          "previousTab",
          nextValue
        );
      },
      []
    );

  /* =======================================================
     BOTTOM NAV
  ======================================================= */

  const hideBottomNav =
    tab ===
    "notifications";

  /* =======================================================
     SCREENS
  ======================================================= */

  const screens = {
    home: (
      <Home
        setTab={
          changeTab
        }
        setPreviousTab={
          updatePreviousTab
        }
      />
    ),

    tracking: (
      <Tracking
        setTab={
          changeTab
        }
        setPreviousTab={
          updatePreviousTab
        }
      />
    ),

    trips: (
      <Trips
        setTab={
          changeTab
        }
        setPreviousTab={
          updatePreviousTab
        }
      />
    ),

    children: (
      <Children
        setTab={
          changeTab
        }
        setPreviousTab={
          updatePreviousTab
        }
      />
    ),

    billing: (
      <Billing
        setTab={
          changeTab
        }
        setPreviousTab={
          updatePreviousTab
        }
      />
    ),

    profile: (
      <Profile
        setTab={(
          nextTab
        ) => {
          if (
            nextTab ===
            "notifications"
          ) {
            openNotifications(
              "profile"
            );

            return;
          }

          changeTab(
            nextTab
          );
        }}
        setPreviousTab={
          updatePreviousTab
        }
      />
    ),

    notifications: (
      <Notifications
        setTab={(
          nextTab
        ) => {
          if (
            !isValidTab(
              nextTab
            )
          ) {
            return;
          }

          if (
            nextTab ===
            "notifications"
          ) {
            return;
          }

          const current =
            currentTabRef.current;

          setPreviousTab(
            current
          );

          previousTabRef.current =
            current;

          setTab(
            nextTab
          );

          currentTabRef.current =
            nextTab;
        }}
        previousTab={
          previousTab
        }
      />
    ),

    privacy: (
      <Privacy
        setTab={
          changeTab
        }
        setPreviousTab={
          updatePreviousTab
        }
      />
    ),

    support: (
      <Support
        setTab={
          changeTab
        }
        setPreviousTab={
          updatePreviousTab
        }
      />
    ),
  };

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div
      className={`
        min-h-screen
        bg-gray-100
        flex
        justify-center

        ${
          !hideBottomNav
            ? "pb-20"
            : ""
        }
      `}
    >
      <div
        className="
          w-full
          max-w-[400px]
          overflow-hidden
        "
      >
        <AnimatePresence
          mode="wait"
          initial={false}
        >
          <motion.div
            key={
              tab
            }
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: -10,
            }}
            transition={{
              duration: 0.2,
              ease:
                "easeInOut",
            }}
          >
            {screens[
              tab
            ] || (
              <Home
                setTab={
                  changeTab
                }
                setPreviousTab={
                  updatePreviousTab
                }
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ===================================================
          BOTTOM NAV
      =================================================== */}

      {!hideBottomNav && (
        <BottomNav
          active={
            tab
          }
          setActive={
            changeTab
          }
        />
      )}
    </div>
  );
}

export default MainScreen;