import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { API } from "../../api/api";

import BottomNav from "../../components/layout/BottomNav";

import { io } from "socket.io-client";

import { motion } from "framer-motion";

import {
  Activity,
  Bell,
  Car,
  Check,
  ChevronRight,
  CloudSun,
  Flag,
  Moon,
  Navigation,
  Play,
  Route,
  Sun,
  User,
} from "lucide-react";

/* =========================================================
   SOCKET
========================================================= */

const SOCKET_URL =
  "https://asan-driverapp.onrender.com";

/* =========================================================
   HOME
========================================================= */

function Home({
  setTab,
  setPreviousTab,
}) {
  /* =======================================================
     STATE
  ======================================================= */

  const [
    parent,
    setParent,
  ] = useState(null);

  const [
    trips,
    setTrips,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    notificationCount,
    setNotificationCount,
  ] = useState(0);

  /* =======================================================
     LOAD STORED PARENT
  ======================================================= */

  useEffect(() => {
    try {
      const stored =
        localStorage.getItem(
          "parent"
        );

      if (stored) {
        setParent(
          JSON.parse(
            stored
          )
        );
      }
    } catch (err) {
      console.error(
        "Invalid parent data:",
        err
      );
    }
  }, []);

  /* =======================================================
     FETCH FRESH PARENT PROFILE
  ======================================================= */

  const fetchParentProfile =
    async (
      parentId
    ) => {
      try {
        if (!parentId) {
          return;
        }

        const res =
          await API.get(
            `/parent/${parentId}`
          );

        const freshParent =
          res.data?.data ||
          res.data?.parent ||
          res.data ||
          null;

        if (
          freshParent &&
          typeof freshParent ===
            "object" &&
          freshParent._id
        ) {
          setParent(
            freshParent
          );

          localStorage.setItem(
            "parent",
            JSON.stringify(
              freshParent
            )
          );
        }
      } catch (err) {
        console.error(
          "Parent profile fetch error:",
          err?.response?.data ||
            err
        );
      }
    };

  /* =======================================================
     FETCH DASHBOARD
  ======================================================= */

  const fetchDashboard =
    async (
      parentId,
      showLoader = true
    ) => {
      try {
        if (showLoader) {
          setLoading(true);
        }

        const res =
          await API.get(
            `/trip/parent/${parentId}`
          );

        const data =
          Array.isArray(
            res.data?.data
          )
            ? res.data.data
            : [];

        setTrips(
          data
        );

        localStorage.setItem(
          "dashboardTrips",
          JSON.stringify(
            data
          )
        );
      } catch (err) {
        console.error(
          "Dashboard error:",
          err?.response?.data ||
            err
        );
      } finally {
        if (showLoader) {
          setLoading(false);
        }
      }
    };

  /* =======================================================
     FETCH NOTIFICATION COUNT
  ======================================================= */

  const fetchNotificationCount =
    async (
      parentId
    ) => {
      try {
        const res =
          await API.get(
            `/notifications/parent/${parentId}`
          );

        const count =
          res.data
            ?.unreadCount ??
          res.data
            ?.count ??
          0;

        setNotificationCount(
          count
        );
      } catch (err) {
        console.error(
          "Notification fetch error:",
          err?.response?.data ||
            err
        );

        setNotificationCount(
          0
        );
      }
    };

  /* =======================================================
     INITIAL DATA LOAD
  ======================================================= */

  useEffect(() => {
    if (!parent?._id) {
      return;
    }

    const parentId =
      parent._id;

    fetchDashboard(
      parentId
    );

    fetchNotificationCount(
      parentId
    );

    fetchParentProfile(
      parentId
    );

    const interval =
      window.setInterval(
        () => {
          fetchDashboard(
            parentId,
            false
          );

          fetchParentProfile(
            parentId
          );

          fetchNotificationCount(
            parentId
          );
        },
        10000
      );

    return () => {
      window.clearInterval(
        interval
      );
    };
  }, [parent?._id]);

  /* =======================================================
     SOCKET
  ======================================================= */

  useEffect(() => {
    if (!parent?._id) {
      return;
    }

    const socket =
      io(
        SOCKET_URL,
        {
          transports: [
            "websocket",
            "polling",
          ],

          reconnection:
            true,
        }
      );

    socket.on(
      "connect",
      () => {
        console.log(
          "Parent socket connected:",
          socket.id
        );

        socket.emit(
          "join_parent",
          String(
            parent._id
          )
        );
      }
    );

    /* =====================================================
       DRIVER ASSIGNED
    ====================================================== */

    socket.on(
      "driver_request_assigned",
      async () => {
        await fetchParentProfile(
          parent._id
        );

        await fetchNotificationCount(
          parent._id
        );
      }
    );

    socket.on(
      "driver_assigned",
      async () => {
        await fetchParentProfile(
          parent._id
        );

        await fetchNotificationCount(
          parent._id
        );
      }
    );

    /* =====================================================
       TRIP START
    ====================================================== */

    socket.on(
      "trip_started",
      (trip) => {
        const tripParent =
          typeof trip?.parent ===
          "object"
            ? trip.parent?._id
            : trip?.parent;

        if (
          tripParent &&
          String(
            tripParent
          ) !==
            String(
              parent._id
            )
        ) {
          return;
        }

        const startedTrip = {
          ...trip,

          uiStatus:
            "ride_started",
        };

        setTrips(
          (
            previous
          ) => {
            const remaining =
              previous.filter(
                (
                  item
                ) =>
                  item._id !==
                  trip._id
              );

            const updated = [
              startedTrip,
              ...remaining,
            ];

            localStorage.setItem(
              "dashboardTrips",
              JSON.stringify(
                updated
              )
            );

            return updated;
          }
        );
      }
    );

    /* =====================================================
       TRIP END
    ====================================================== */

    socket.on(
      "trip_ended",
      (
        endedTrip
      ) => {
        const tripParent =
          typeof endedTrip
            ?.parent ===
          "object"
            ? endedTrip
                .parent
                ?._id
            : endedTrip
                ?.parent;

        if (
          tripParent &&
          String(
            tripParent
          ) !==
            String(
              parent._id
            )
        ) {
          return;
        }

        setTrips(
          (
            previous
          ) => {
            const updated =
              previous.map(
                (
                  trip
                ) =>
                  trip._id ===
                  endedTrip._id
                    ? {
                        ...trip,
                        ...endedTrip,

                        status:
                          "completed",

                        uiStatus:
                          "completed",
                      }
                    : trip
              );

            localStorage.setItem(
              "dashboardTrips",
              JSON.stringify(
                updated
              )
            );

            return updated;
          }
        );
      }
    );

    /* =====================================================
       NOTIFICATION
    ====================================================== */

    socket.on(
      "notification",
      (
        data
      ) => {
        const notificationParent =
          typeof data
            ?.parent ===
          "object"
            ? data
                .parent
                ?._id
            : data
                ?.parent;

        if (
          notificationParent &&
          String(
            notificationParent
          ) !==
            String(
              parent._id
            )
        ) {
          return;
        }

        setNotificationCount(
          (
            previous
          ) =>
            previous + 1
        );
      }
    );

    return () => {
      socket.disconnect();
    };
  }, [parent?._id]);

  /* =======================================================
     DRIVER ASSIGNMENT
  ======================================================= */

  const assignedDriver =
    parent?.driver ||
    parent?.assignedDriver ||
    parent?.driverId ||
    null;

  const hasAssignedDriver =
    Boolean(
      typeof assignedDriver ===
        "object"
        ? assignedDriver?._id ||
            assignedDriver
              ?.driverId
        : assignedDriver
    );

  /* =======================================================
     PARENT TRIPS
  ======================================================= */

  const parentTrips =
    useMemo(
      () => {
        if (!parent?._id) {
          return [];
        }

        return trips.filter(
          (
            trip
          ) => {
            const tripParent =
              typeof trip
                .parent ===
              "object"
                ? trip
                    .parent
                    ?._id
                : trip
                    .parent;

            return (
              String(
                tripParent
              ) ===
              String(
                parent._id
              )
            );
          }
        );
      },
      [
        trips,
        parent?._id,
      ]
    );

  /* =======================================================
     SORT TRIPS
  ======================================================= */

  const sortedTrips =
    useMemo(
      () => {
        return [
          ...parentTrips,
        ].sort(
          (
            a,
            b
          ) =>
            new Date(
              b.startTime ||
                b.createdAt ||
                0
            ) -
            new Date(
              a.startTime ||
                a.createdAt ||
                0
            )
        );
      },
      [
        parentTrips,
      ]
    );

  /* =======================================================
     ACTIVE / LATEST TRIP
  ======================================================= */

  const activeTrip =
    sortedTrips.find(
      (
        trip
      ) =>
        isRideActive(
          trip.uiStatus ||
            trip.status
        )
    ) ||
    null;

  const latestTrip =
    activeTrip ||
    sortedTrips[0] ||
    null;

  const displayTrip =
    activeTrip ||
    latestTrip;

  /* =======================================================
     STATUS
  ======================================================= */

  const displayStatus =
    displayTrip
      ?.uiStatus ||
    displayTrip
      ?.status ||
    "";

  const currentStage =
    displayTrip
      ? getRideStage(
          displayStatus
        )
      : -1;

  const rideCompleted =
    currentStage ===
    3;

  /* =======================================================
     DRIVER
  ======================================================= */

  const driverName =
    displayTrip
      ?.driver
      ?.name ||
    displayTrip
      ?.driverName ||
    displayTrip
      ?.driver
      ?.fullName ||
    (
      typeof assignedDriver ===
        "object"
        ? assignedDriver
            ?.name
        : ""
    ) ||
    "";

  const driverPhoto =
    displayTrip
      ?.driver
      ?.profilePhoto ||
    (
      typeof assignedDriver ===
        "object"
        ? assignedDriver
            ?.profilePhoto
        : null
    ) ||
    null;

  const vehicleNumber =
    displayTrip
      ?.vehicleNumber ||
    displayTrip
      ?.driver
      ?.vehicleNumber ||
    (
      typeof assignedDriver ===
        "object"
        ? assignedDriver
            ?.vehicleNumber
        : ""
    ) ||
    "";

  /* =======================================================
     GREETING
  ======================================================= */

  const getGreeting =
    () => {
      const hour =
        new Date()
          .getHours();

      if (
        hour >= 5 &&
        hour < 12
      ) {
        return {
          text:
            "Good morning",

          icon: (
            <Sun
              size={20}
            />
          ),
        };
      }

      if (
        hour >= 12 &&
        hour < 17
      ) {
        return {
          text:
            "Good afternoon",

          icon: (
            <CloudSun
              size={20}
            />
          ),
        };
      }

      return {
        text:
          "Good evening",

        icon: (
          <Moon
            size={19}
          />
        ),
      };
    };

  const greeting =
    getGreeting();

  const firstName =
    parent
      ?.name
      ?.trim()
      ?.split(
        /\s+/
      )?.[0] ||
    "User";

  /* =======================================================
     NAVIGATION
  ======================================================= */

  const openTracking =
    () => {
      if (
        !hasAssignedDriver ||
        !displayTrip
      ) {
        return;
      }

      setTab(
        "tracking"
      );
    };

  const goToNotifications =
    () => {
      if (
        setPreviousTab
      ) {
        setPreviousTab(
          "home"
        );
      }

      setTab(
        "notifications"
      );
    };

  /* =======================================================
     STATUS LABEL
  ======================================================= */

  const statusLabel =
    loading
      ? "CHECKING"
      : !hasAssignedDriver
        ? "WAITING"
        : activeTrip
          ? "LIVE"
          : rideCompleted
            ? "COMPLETED"
            : "READY";

  /* =======================================================
     MAIN RIDE TITLE
  ======================================================= */

  const rideTitle =
    loading
      ? "Checking Ride"
      : !hasAssignedDriver
        ? "No Driver Assigned Yet"
        : displayTrip
          ? getRideTitle(
              currentStage
            )
          : "No Active Ride";

  /* =======================================================
     RIDE DESCRIPTION
  ======================================================= */

  const rideDescription =
    !hasAssignedDriver
      ? "We're currently finding a suitable driver for you. You'll be notified as soon as a driver is assigned."
      : activeTrip
        ? "Tap the card to view your child's live journey."
        : rideCompleted
          ? "The latest ride has been completed successfully."
          : "Your driver is assigned. Ride information will appear here when the next trip starts.";

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div
      className="
        relative
        min-h-screen
        overflow-hidden
        bg-[#FFF9EE]
        pb-28
      "
    >
      {/* =================================================
          BACKGROUND DECORATION
      ================================================= */}

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          overflow-hidden
        "
      >
        <motion.div
          className="
            absolute
            -right-[40px]
            -top-[125px]
            h-[325px]
            w-[325px]
            rounded-full
            bg-[#FFE9AD]
            opacity-[0.72]
          "
          animate={{
            y: [
              0,
              12,
              0,
            ],
          }}
          transition={{
            duration:
              10,

            repeat:
              Infinity,

            ease:
              "easeInOut",
          }}
        />

        <div
          className="
            absolute
            -left-[145px]
            top-[405px]
            h-[300px]
            w-[300px]
            rounded-full
            bg-[#FFE2A0]
            opacity-[0.55]
          "
        />

        <div
          className="
            absolute
            -right-[115px]
            top-[375px]
            h-[250px]
            w-[250px]
            rounded-full
            bg-[#FFF1C8]
            opacity-[0.55]
          "
        />

        <div
          className="
            absolute
            -left-[65px]
            bottom-[45px]
            h-[210px]
            w-[210px]
            rounded-full
            bg-[#FFF0C7]
            opacity-[0.45]
          "
        />

        <div
          className="
            dashboard-grid
            absolute
            inset-0
          "
        />
      </div>

      {/* =================================================
          APP CONTENT
      ================================================= */}

      <div
        className="
          relative
          z-10
          mx-auto
          min-h-screen
          w-full
          max-w-[475px]
        "
      >
        {/* =================================================
            HEADER
        ================================================= */}

        <header
          className="
            px-5
            pt-7
          "
        >
          <div
            className="
              flex
              items-start
              justify-between
              gap-4
            "
          >
            <motion.div
              initial={{
                opacity:
                  0,

                y:
                  8,
              }}
              animate={{
                opacity:
                  1,

                y:
                  0,
              }}
              className="
                min-w-0
                flex-1
              "
            >
              <div
                className="
                  mb-[3px]
                  flex
                  items-center
                  gap-2
                "
              >
                <span
                  className="
                    text-[10px]
                    font-extrabold
                    uppercase
                    tracking-[1.8px]
                    text-[#B77D00]
                  "
                >
                  Welcome Back
                </span>

                <div
                  className="
                    h-[3px]
                    w-7
                    rounded-full
                    bg-[#FFB400]
                  "
                />
              </div>

              <div
                className="
                  flex
                  items-center
                  gap-2
                "
              >
                <h1
                  className="
                    min-w-0
                    text-[27px]
                    font-extrabold
                    leading-[1.12]
                    tracking-[-0.6px]
                    text-black
                  "
                >
                  {
                    greeting.text
                  }
                  ,{" "}
                  {
                    firstName
                  }
                </h1>

                <div
                  className="
                    flex
                    h-[39px]
                    w-[39px]
                    shrink-0
                    items-center
                    justify-center
                    rounded-[13px]
                    bg-[#FFEAAE]
                    text-[#CF8D00]
                  "
                >
                  {
                    greeting.icon
                  }
                </div>
              </div>

              <p
                className="
                  mt-2
                  text-[11px]
                  leading-5
                  text-zinc-500
                "
              >
                Track your child's ride
                and stay updated in real
                time.
              </p>
            </motion.div>

            {/* NOTIFICATIONS */}

            <motion.button
              type="button"
              onClick={
                goToNotifications
              }
              whileTap={{
                scale:
                  0.94,
              }}
              className="
                relative
                mt-1
                flex
                h-[52px]
                w-[52px]
                shrink-0
                items-center
                justify-center
                rounded-[17px]
                border
                border-[#E9D7A0]
                bg-white/90
                text-black
                shadow-[0_8px_24px_rgba(101,76,17,0.07)]
                backdrop-blur-sm
              "
              aria-label="Notifications"
            >
              <Bell
                size={22}
                strokeWidth={1.9}
              />

              {notificationCount >
                0 && (
                <span
                  className="
                    absolute
                    -right-[5px]
                    -top-[5px]
                    flex
                    h-[21px]
                    min-w-[21px]
                    items-center
                    justify-center
                    rounded-full
                    border-2
                    border-[#FFF9EE]
                    bg-[#FFB400]
                    px-1
                    text-[8px]
                    font-extrabold
                    text-black
                  "
                >
                  {notificationCount >
                  99
                    ? "99+"
                    : notificationCount}
                </span>
              )}
            </motion.button>
          </div>
        </header>

        {/* =================================================
            MAIN CONTENT
        ================================================= */}

        <main
          className="
            mt-7
            px-4
          "
        >
          {/* SECTION TITLE */}

          <div
            className="
              mb-4
              flex
              items-end
              justify-between
              px-1
            "
          >
            <div>
              <div
                className="
                  flex
                  items-center
                  gap-2
                "
              >
                <Activity
                  size={14}
                  className="
                    text-[#CF9100]
                  "
                />

                <p
                  className="
                    text-[9px]
                    font-extrabold
                    uppercase
                    tracking-[1.6px]
                    text-[#B97E00]
                  "
                >
                  Ride Overview
                </p>
              </div>

              <h2
                className="
                  mt-1
                  text-[21px]
                  font-extrabold
                  text-black
                "
              >
                Current Ride
              </h2>
            </div>

            <div
              className="
                h-[4px]
                w-[34px]
                rounded-full
                bg-[#FFB400]
              "
            />
          </div>

          {/* =================================================
              CURRENT RIDE CARD
          ================================================= */}

          <motion.button
            type="button"
            onClick={
              openTracking
            }
            initial={{
              opacity:
                0,

              y:
                12,
            }}
            animate={{
              opacity:
                1,

              y:
                0,
            }}
            whileTap={
              hasAssignedDriver &&
              displayTrip
                ? {
                    scale:
                      0.99,
                  }
                : {}
            }
            className={`
              relative
              w-full
              overflow-hidden
              rounded-[30px]
              border
              border-[#EFCF70]
              bg-white
              text-left
              shadow-[0_18px_45px_rgba(97,74,12,0.09)]

              ${
                hasAssignedDriver &&
                displayTrip
                  ? "cursor-pointer"
                  : "cursor-default"
              }
            `}
          >
            <div
              className="
                absolute
                left-0
                right-0
                top-0
                h-[5px]
                bg-[#FFB400]
              "
            />

            <motion.div
              className="
                absolute
                -right-[85px]
                -top-[85px]
                h-[230px]
                w-[230px]
                rounded-full
                bg-[#FFF0B8]
              "
              animate={{
                scale: [
                  1,
                  1.05,
                  1,
                ],
              }}
              transition={{
                duration:
                  6,

                repeat:
                  Infinity,
              }}
            />

            <div
              className="
                absolute
                right-[55px]
                top-[165px]
                h-[78px]
                w-[78px]
                rounded-full
                border-[16px]
                border-[#FFF4D0]
              "
            />

            <div
              className="
                relative
                z-10
                p-5
              "
            >
              {/* CARD TOP */}

              <div
                className="
                  flex
                  items-start
                  justify-between
                  gap-3
                "
              >
                <div
                  className="
                    flex
                    items-center
                    gap-3
                  "
                >
                  <motion.div
                    className="
                      flex
                      h-[48px]
                      w-[48px]
                      items-center
                      justify-center
                      rounded-[16px]
                      bg-[#FFB400]
                      text-black
                      shadow-[0_8px_20px_rgba(255,180,0,0.20)]
                    "
                    animate={
                      activeTrip
                        ? {
                            y: [
                              0,
                              -2,
                              0,
                            ],
                          }
                        : {}
                    }
                    transition={{
                      duration:
                        1.7,

                      repeat:
                        activeTrip
                          ? Infinity
                          : 0,
                    }}
                  >
                    <Route
                      size={21}
                    />
                  </motion.div>

                  <div>
                    <p
                      className="
                        text-[9px]
                        font-extrabold
                        uppercase
                        tracking-[1.4px]
                        text-[#C58800]
                      "
                    >
                      Current Ride
                    </p>

                    <div
                      className="
                        mt-1.5
                        flex
                        items-center
                        gap-2
                      "
                    >
                      <motion.span
                        className={`
                          h-[7px]
                          w-[7px]
                          rounded-full

                          ${
                            activeTrip
                              ? "bg-[#FFB400]"
                              : hasAssignedDriver
                                ? "bg-emerald-400"
                                : "bg-zinc-300"
                          }
                        `}
                        animate={
                          activeTrip
                            ? {
                                opacity: [
                                  1,
                                  0.3,
                                  1,
                                ],
                              }
                            : {}
                        }
                        transition={{
                          duration:
                            1.2,

                          repeat:
                            activeTrip
                              ? Infinity
                              : 0,
                        }}
                      />

                      <span
                        className="
                          text-[9px]
                          font-medium
                          text-zinc-500
                        "
                      >
                        {!hasAssignedDriver
                          ? "Waiting for assignment"
                          : activeTrip
                            ? "Live ride"
                            : rideCompleted
                              ? "Latest ride"
                              : "Driver assigned"}
                      </span>
                    </div>
                  </div>
                </div>

                <div
                  className="
                    flex
                    items-center
                    gap-2
                  "
                >
                  <motion.span
                    key={
                      statusLabel
                    }
                    initial={{
                      opacity:
                        0,

                      scale:
                        0.85,
                    }}
                    animate={{
                      opacity:
                        1,

                      scale:
                        1,
                    }}
                    className="
                      rounded-full
                      bg-[#FFF0B5]
                      px-3
                      py-2
                      text-[8px]
                      font-extrabold
                      text-[#9A6900]
                    "
                  >
                    {
                      statusLabel
                    }
                  </motion.span>

                  {hasAssignedDriver &&
                    displayTrip && (
                    <div
                      className="
                        flex
                        h-[38px]
                        w-[38px]
                        items-center
                        justify-center
                        rounded-[13px]
                        border
                        border-[#F2DF9E]
                        bg-[#FFF9E7]
                        text-black
                      "
                    >
                      <ChevronRight
                        size={18}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* RIDE STATUS */}

              <div
                className="
                  mt-6
                "
              >
                <p
                  className="
                    text-[9px]
                    font-bold
                    uppercase
                    tracking-[1.3px]
                    text-zinc-400
                  "
                >
                  Ride Status
                </p>

                <motion.h3
                  key={
                    !hasAssignedDriver
                      ? "no-driver"
                      : currentStage
                  }
                  initial={{
                    opacity:
                      0,

                    y:
                      6,
                  }}
                  animate={{
                    opacity:
                      1,

                    y:
                      0,
                  }}
                  className="
                    mt-1
                    text-[26px]
                    font-extrabold
                    tracking-[-0.6px]
                    text-black
                  "
                >
                  {
                    rideTitle
                  }
                </motion.h3>

                <p
                  className="
                    mt-2
                    max-w-[340px]
                    text-[10px]
                    leading-5
                    text-zinc-500
                  "
                >
                  {
                    rideDescription
                  }
                </p>
              </div>

              {/* DRIVER */}

              {hasAssignedDriver &&
                (driverName ||
                  vehicleNumber) && (
                <>
                  <div
                    className="
                      my-5
                      h-px
                      bg-[#F0E8D2]
                    "
                  />

                  <div
                    className="
                      flex
                      items-center
                      gap-3
                    "
                  >
                    <div
                      className="
                        flex
                        h-[54px]
                        w-[54px]
                        shrink-0
                        items-center
                        justify-center
                        overflow-hidden
                        rounded-[17px]
                        bg-[#FFE6A1]
                        text-black
                      "
                    >
                      {driverPhoto ? (
                        <img
                          src={
                            driverPhoto
                          }
                          alt={
                            driverName ||
                            "Driver"
                          }
                          className="
                            h-full
                            w-full
                            object-cover
                          "
                        />
                      ) : (
                        <User
                          size={24}
                        />
                      )}
                    </div>

                    <div
                      className="
                        min-w-0
                        flex-1
                      "
                    >
                      <p
                        className="
                          truncate
                          text-[14px]
                          font-bold
                          text-black
                        "
                      >
                        {driverName ||
                          "Assigned Driver"}
                      </p>

                      <p
                        className="
                          mt-1
                          text-[9px]
                          font-medium
                          text-zinc-400
                        "
                      >
                        Assigned Driver
                      </p>
                    </div>

                    {vehicleNumber && (
                      <div
                        className="
                          flex
                          items-center
                          gap-2
                          rounded-[13px]
                          border
                          border-[#F0DE9E]
                          bg-[#FFF9E8]
                          px-3
                          py-2.5
                        "
                      >
                        <Car
                          size={14}
                          className="
                            text-[#C88D00]
                          "
                        />

                        <span
                          className="
                            text-[9px]
                            font-bold
                            text-black
                          "
                        >
                          {
                            vehicleNumber
                          }
                        </span>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* JOURNEY PROGRESS */}

              {hasAssignedDriver && (
                <div
                  className="
                    mt-5
                    rounded-[22px]
                    border
                    border-[#EEDFB7]
                    bg-[#FFFDF7]
                    px-4
                    py-4
                  "
                >
                  <div
                    className="
                      mb-4
                      flex
                      items-center
                      justify-between
                    "
                  >
                    <div>
                      <p
                        className="
                          text-[8px]
                          font-bold
                          uppercase
                          tracking-[1.3px]
                          text-zinc-400
                        "
                      >
                        Journey Progress
                      </p>

                      <p
                        className="
                          mt-1
                          text-[10px]
                          font-semibold
                          text-black
                        "
                      >
                        {displayTrip
                          ? getRideTitle(
                              currentStage
                            )
                          : "Waiting for ride"}
                      </p>
                    </div>

                    {displayTrip && (
                      <motion.span
                        key={
                          currentStage
                        }
                        initial={{
                          scale:
                            0.85,

                          opacity:
                            0,
                        }}
                        animate={{
                          scale:
                            1,

                          opacity:
                            1,
                        }}
                        className="
                          rounded-full
                          bg-[#FFF0B5]
                          px-2.5
                          py-1.5
                          text-[9px]
                          font-bold
                          text-[#9A6900]
                        "
                      >
                        {currentStage +
                          1}
                        /4
                      </motion.span>
                    )}
                  </div>

                  <RideProgress
                    stage={
                      currentStage
                    }
                    hasTrip={
                      Boolean(
                        displayTrip
                      )
                    }
                    active={
                      Boolean(
                        activeTrip
                      )
                    }
                  />
                </div>
              )}

              {/* NO DRIVER WAITING PANEL */}

              {!loading &&
                !hasAssignedDriver && (
                <div
                  className="
                    mt-5
                    rounded-[22px]
                    border
                    border-[#F0D996]
                    bg-[#FFF8E5]
                    px-4
                    py-4
                  "
                >
                  <div
                    className="
                      flex
                      items-start
                      gap-3
                    "
                  >
                    <div
                      className="
                        flex
                        h-[40px]
                        w-[40px]
                        shrink-0
                        items-center
                        justify-center
                        rounded-[13px]
                        bg-[#FFB400]
                        text-black
                      "
                    >
                      <Car
                        size={18}
                      />
                    </div>

                    <div>
                      <p
                        className="
                          text-[10px]
                          font-extrabold
                          text-black
                        "
                      >
                        Driver assignment in progress
                      </p>

                      <p
                        className="
                          mt-1
                          text-[9px]
                          leading-4
                          text-zinc-500
                        "
                      >
                        No action is required from you.
                        We'll notify you once your driver
                        has been assigned.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.button>
        </main>
      </div>

      {/* BOTTOM NAVIGATION */}

      <BottomNav
        active="home"
        setActive={
          setTab
        }
      />

      {/* BACKGROUND CSS */}

      <style>{`
        .dashboard-grid {
          background-image:
            linear-gradient(
              rgba(170, 125, 0, 0.030) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(170, 125, 0, 0.030) 1px,
              transparent 1px
            );

          background-size:
            30px 30px;

          mask-image:
            linear-gradient(
              to bottom,
              rgba(0, 0, 0, 0.18),
              transparent
            );

          -webkit-mask-image:
            linear-gradient(
              to bottom,
              rgba(0, 0, 0, 0.18),
              transparent
            );
        }
      `}</style>
    </div>
  );
}

/* =========================================================
   RIDE PROGRESS
========================================================= */

function RideProgress({
  stage,
  hasTrip,
  active,
}) {
  const steps = [
    {
      label:
        "Ride Started",

      icon: (
        <Play
          size={12}
          fill="currentColor"
        />
      ),
    },

    {
      label:
        "On the Way",

      icon: (
        <Car
          size={12}
        />
      ),
    },

    {
      label:
        "Pickup",

      icon: (
        <Navigation
          size={12}
        />
      ),
    },

    {
      label:
        "Reached",

      icon: (
        <Flag
          size={12}
        />
      ),
    },
  ];

  return (
    <div
      className="
        flex
        w-full
        items-start
      "
    >
      {steps.map(
        (
          step,
          index
        ) => {
          const reached =
            hasTrip &&
            index <= stage;

          const completed =
            hasTrip &&
            index < stage;

          const current =
            hasTrip &&
            index === stage;

          return (
            <div
              key={
                step.label
              }
              className={`
                flex
                items-start

                ${
                  index ===
                  steps.length - 1
                    ? ""
                    : "flex-1"
                }
              `}
            >
              <div
                className="
                  flex
                  w-[54px]
                  shrink-0
                  flex-col
                  items-center
                  text-center
                "
              >
                <motion.div
                  initial={false}
                  animate={{
                    backgroundColor:
                      reached
                        ? "#FFB400"
                        : "#F3F1E9",

                    borderColor:
                      reached
                        ? "#FFB400"
                        : "#E6DFCA",

                    color:
                      reached
                        ? "#111111"
                        : "#A1A1AA",

                    scale:
                      current &&
                      active
                        ? [
                            1,
                            1.1,
                            1,
                          ]
                        : 1,
                  }}
                  transition={
                    current &&
                    active
                      ? {
                          scale: {
                            duration:
                              1.4,

                            repeat:
                              Infinity,
                          },

                          duration:
                            0.35,
                        }
                      : {
                          duration:
                            0.35,
                        }
                  }
                  className="
                    relative
                    flex
                    h-[36px]
                    w-[36px]
                    items-center
                    justify-center
                    rounded-[12px]
                    border
                  "
                >
                  {current &&
                    active && (
                    <motion.span
                      className="
                        absolute
                        inset-[-4px]
                        rounded-[15px]
                        border
                        border-[#FFB400]
                      "
                      animate={{
                        opacity: [
                          0.7,
                          0,
                        ],

                        scale: [
                          0.9,
                          1.25,
                        ],
                      }}
                      transition={{
                        duration:
                          1.4,

                        repeat:
                          Infinity,
                      }}
                    />
                  )}

                  {completed ||
                  (stage === 3 &&
                    index === 3) ? (
                    <Check
                      size={14}
                      strokeWidth={3}
                    />
                  ) : (
                    step.icon
                  )}
                </motion.div>

                <motion.p
                  animate={{
                    color:
                      reached
                        ? "#111111"
                        : "#A1A1AA",
                  }}
                  className="
                    mt-1.5
                    w-[56px]
                    text-[7px]
                    font-medium
                    leading-tight
                  "
                >
                  {
                    step.label
                  }
                </motion.p>
              </div>

              {index <
                steps.length - 1 && (
                <div
                  className="
                    relative
                    mx-[-7px]
                    mt-[17px]
                    h-[3px]
                    flex-1
                    overflow-hidden
                    rounded-full
                    bg-[#E8E3D5]
                  "
                >
                  <motion.div
                    initial={false}
                    animate={{
                      width:
                        hasTrip &&
                        stage >
                          index
                          ? "100%"
                          : "0%",
                    }}
                    transition={{
                      duration:
                        0.65,

                      ease:
                        "easeInOut",
                    }}
                    className="
                      absolute
                      inset-y-0
                      left-0
                      bg-[#FFB400]
                    "
                  />

                  {active &&
                    stage >
                      index && (
                    <motion.div
                      className="
                        absolute
                        inset-y-0
                        w-7
                        bg-gradient-to-r
                        from-transparent
                        via-white/70
                        to-transparent
                      "
                      animate={{
                        x: [
                          "-150%",
                          "500%",
                        ],
                      }}
                      transition={{
                        duration:
                          1.7,

                        repeat:
                          Infinity,

                        ease:
                          "linear",
                      }}
                    />
                  )}
                </div>
              )}
            </div>
          );
        }
      )}
    </div>
  );
}

/* =========================================================
   ACTIVE RIDE
========================================================= */

function isRideActive(
  status
) {
  const value =
    normalizeStatus(
      status
    );

  return [
    "pending",
    "started",
    "ride_started",
    "trip_started",
    "active",
    "in_transit",
    "on_the_way",
    "ontheway",
    "onway",
    "moving",
    "enroute",
    "en_route",
    "pickup",
    "picked_up",
    "pickedup",
    "onboard",
    "arriving",
    "nearby",
    "at_pickup",
    "pickup_completed",
  ].includes(value);
}

/* =========================================================
   STATUS → STAGE
========================================================= */

function getRideStage(
  status
) {
  const value =
    normalizeStatus(
      status
    );

  if (
    [
      "completed",
      "complete",
      "reached",
      "trip_ended",
      "ended",
      "finished",
      "dropped",
      "drop_completed",
    ].includes(value)
  ) {
    return 3;
  }

  if (
    [
      "pickup",
      "picked_up",
      "pickedup",
      "onboard",
      "arriving",
      "nearby",
      "at_pickup",
      "pickup_completed",
    ].includes(value)
  ) {
    return 2;
  }

  if (
    [
      "in_transit",
      "active",
      "on_the_way",
      "ontheway",
      "onway",
      "moving",
      "enroute",
      "en_route",
    ].includes(value)
  ) {
    return 1;
  }

  return 0;
}

/* =========================================================
   RIDE TITLE
========================================================= */

function getRideTitle(
  stage
) {
  if (stage === 0) {
    return "Ride Started";
  }

  if (stage === 1) {
    return "Ride is On the Way";
  }

  if (stage === 2) {
    return "Pickup in Progress";
  }

  if (stage === 3) {
    return "Ride Completed";
  }

  return "No Active Ride";
}

/* =========================================================
   NORMALIZE STATUS
========================================================= */

function normalizeStatus(
  status
) {
  return String(
    status || ""
  )
    .trim()
    .toLowerCase()
    .replace(
      /\s+/g,
      "_"
    )
    .replace(
      /-/g,
      "_"
    );
}

export default Home;