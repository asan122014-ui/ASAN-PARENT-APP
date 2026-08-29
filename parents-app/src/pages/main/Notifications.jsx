import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  io,
} from "socket.io-client";

import {
  motion,
  AnimatePresence,
} from "framer-motion";

import {
  X,
  Bell,
  Car,
  CheckCircle2,
  Clock3,
  Info,
  Route,
  School,
  ShieldCheck,
  UserRoundCheck,
  CheckCheck,
  RefreshCw,
} from "lucide-react";

import {
  API,
} from "../../api/api";

/* =========================================================
   SOCKET
========================================================= */

const SOCKET_URL =
  "https://asan-driverapp.onrender.com";

/* =========================================================
   NOTIFICATIONS
========================================================= */

function Notifications({
  setTab,
  previousTab,
}) {
  /* =======================================================
     STATE
  ======================================================= */

  const [
    notifications,
    setNotifications,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  /* =======================================================
     REFS
  ======================================================= */

  const socketRef =
    useRef(null);

  const audioRef =
    useRef(null);

  const isFirstLoad =
    useRef(true);

  /* =======================================================
     PARENT
  ======================================================= */

  const getParent =
    () => {
      try {
        return JSON.parse(
          localStorage.getItem(
            "parent"
          )
        );
      } catch {
        return null;
      }
    };

  /* =======================================================
     SOUND
  ======================================================= */

  useEffect(() => {
    audioRef.current =
      new Audio(
        "/notification.mp3"
      );

    const unlockAudio =
      () => {
        const audio =
          audioRef.current;

        if (audio) {
          audio.muted =
            true;

          audio
            .play()
            .then(
              () => {
                audio.pause();

                audio.currentTime =
                  0;

                audio.muted =
                  false;
              }
            )
            .catch(
              () => {}
            );
        }

        document.removeEventListener(
          "click",
          unlockAudio
        );
      };

    document.addEventListener(
      "click",
      unlockAudio
    );

    return () => {
      document.removeEventListener(
        "click",
        unlockAudio
      );
    };
  }, []);

  /* =======================================================
     PLAY SOUND
  ======================================================= */

  const playSound =
    () => {
      if (
        !audioRef.current
      ) {
        return;
      }

      audioRef.current.currentTime =
        0;

      audioRef.current
        .play()
        .catch(
          () => {}
        );
    };

  /* =======================================================
     FETCH NOTIFICATIONS
  ======================================================= */

  const fetchNotifications =
    async (
      silent = false
    ) => {
      try {
        if (!silent) {
          setLoading(
            true
          );
        } else {
          setRefreshing(
            true
          );
        }

        const parent =
          getParent();

        const parentId =
          parent?._id;

        if (
          !parentId
        ) {
          setError(
            "Parent details not found. Please login again."
          );

          return;
        }

        const res =
          await API.get(
            `/notifications/parent/${parentId}`
          );

        const data =
          Array.isArray(
            res.data?.data
          )
            ? res.data.data
            : [];

        const sorted =
          [...data].sort(
            (
              first,
              second
            ) =>
              new Date(
                second.createdAt ||
                  0
              ) -
              new Date(
                first.createdAt ||
                  0
              )
          );

        setNotifications(
          sorted
        );

        setError(
          ""
        );
      } catch (
        err
      ) {
        console.error(
          "Notification fetch error:",

          err?.response
            ?.data ||
            err
        );

        setError(
          err?.response
            ?.data
            ?.message ||
            "Failed to load notifications"
        );
      } finally {
        setLoading(
          false
        );

        setRefreshing(
          false
        );
      }
    };

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    const load =
      async () => {
        await fetchNotifications();

        window.setTimeout(
          () => {
            isFirstLoad.current =
              false;
          },
          500
        );
      };

    load();
  }, []);

  /* =======================================================
     MARK ALL READ
  ======================================================= */

  const markAllRead =
    async () => {
      try {
        const parent =
          getParent();

        const parentId =
          parent?._id;

        if (
          !parentId
        ) {
          return;
        }

        await API.put(
          `/notifications/read-all?parentId=${parentId}`
        );

        setNotifications(
          (
            previous
          ) =>
            previous.map(
              (
                item
              ) => ({
                ...item,

                read:
                  true,
              })
            )
        );
      } catch (
        err
      ) {
        console.error(
          "Mark all read error:",

          err?.response
            ?.data ||
            err
        );
      }
    };

  /* =======================================================
     MARK INITIAL LIST AS READ
  ======================================================= */

  useEffect(() => {
    const parent =
      getParent();

    if (
      !parent?._id
    ) {
      return;
    }

    markAllRead();
  }, []);

  /* =======================================================
     SOCKET
  ======================================================= */

  useEffect(() => {
    const parent =
      getParent();

    if (
      !parent?._id
    ) {
      return;
    }

    const socket =
      io(
        SOCKET_URL,
        {
          transports: [
            "websocket",
          ],

          reconnection:
            true,
        }
      );

    socketRef.current =
      socket;

    /* =====================================================
       CONNECT
    ===================================================== */

    socket.on(
      "connect",

      () => {
        console.log(
          "Notifications socket connected:",
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
       RECEIVE NOTIFICATION
    ===================================================== */

    const handleNotification =
      (
        data
      ) => {
        if (
          !data?._id
        ) {
          return;
        }

        const notificationParent =
          typeof data?.parent ===
          "object"
            ? data.parent?._id
            : data?.parent;

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

        setNotifications(
          (
            previous
          ) => {
            const exists =
              previous.some(
                (
                  item
                ) =>
                  item._id ===
                  data._id
              );

            if (
              exists
            ) {
              return previous;
            }

            if (
              !isFirstLoad.current
            ) {
              playSound();
            }

            return [
              {
                ...data,

                read:
                  false,

                createdAt:
                  data.createdAt ||
                  new Date()
                    .toISOString(),
              },

              ...previous,
            ];
          }
        );
      };

    socket.on(
      "notification",
      handleNotification
    );

    /* =====================================================
       CLEANUP
    ===================================================== */

    return () => {
      socket.off(
        "notification",
        handleNotification
      );

      socket.disconnect();

      socketRef.current =
        null;
    };
  }, []);

  /* =======================================================
     MARK SINGLE READ
  ======================================================= */

  const markAsRead =
    async (
      id
    ) => {
      const notification =
        notifications.find(
          (
            item
          ) =>
            item._id ===
            id
        );

      if (
        !notification ||
        notification.read
      ) {
        return;
      }

      try {
        await API.put(
          `/notifications/${id}/read`
        );

        setNotifications(
          (
            previous
          ) =>
            previous.map(
              (
                item
              ) =>
                item._id ===
                id
                  ? {
                      ...item,

                      read:
                        true,
                    }
                  : item
            )
        );
      } catch (
        err
      ) {
        console.error(
          "Mark notification read error:",

          err?.response
            ?.data ||
            err
        );
      }
    };

  /* =======================================================
     CLOSE / BACK
  ======================================================= */

  const handleBack =
    () => {
      if (
        previousTab &&
        previousTab !==
          "notifications"
      ) {
        setTab(
          previousTab
        );

        return;
      }

      setTab(
        "home"
      );
    };

  /* =======================================================
     GROUP NOTIFICATIONS
  ======================================================= */

  const groupedNotifications =
    useMemo(
      () => {
        const groups = {
          today: [],
          yesterday: [],
          earlier: [],
        };

        notifications.forEach(
          (
            notification
          ) => {
            const group =
              getDateGroup(
                notification.createdAt
              );

            groups[
              group
            ].push(
              notification
            );
          }
        );

        return groups;
      },
      [
        notifications,
      ]
    );

  /* =======================================================
     UNREAD
  ======================================================= */

  const unreadCount =
    notifications.filter(
      (
        item
      ) =>
        !item.read
    ).length;

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div
      className="
        relative
        min-h-screen
        overflow-hidden
        bg-[#F8F8F6]
        pb-10
      "
    >
      {/* =================================================
          BACKGROUND
      ================================================= */}

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          overflow-hidden
        "
      >
        <div
          className="
            absolute
            -right-[120px]
            -top-[100px]
            h-[300px]
            w-[300px]
            rounded-full
            bg-[#FFEDAC]
            opacity-60
          "
        />

        <div
          className="
            absolute
            -left-[120px]
            top-[560px]
            h-[250px]
            w-[250px]
            rounded-full
            bg-[#FFF4D5]
          "
        />

        <div
          className="
            notification-grid
            absolute
            inset-0
          "
        />
      </div>

      {/* =================================================
          APP
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
            pb-5
            pt-6
          "
        >
          {/* =================================================
              TOP ROW
          ================================================= */}

          <div
            className="
              flex
              items-center
              justify-between
            "
          >
            {/* ACTIVITY CENTER */}

            <div
              className="
                flex
                items-center
                gap-2
              "
            >
              <span
                className="
                  text-[9px]
                  font-extrabold
                  uppercase
                  tracking-[1.7px]
                  text-[#B77D00]
                "
              >
                Activity Center
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

            {/* RIGHT ACTIONS */}

            <div
              className="
                flex
                items-center
                gap-2
              "
            >
              {/* REFRESH */}

              <motion.button
                type="button"
                disabled={
                  refreshing
                }
                onClick={() =>
                  fetchNotifications(
                    true
                  )
                }
                whileTap={{
                  scale:
                    0.92,
                }}
                className="
                  flex
                  h-[44px]
                  w-[44px]
                  shrink-0
                  items-center
                  justify-center
                  rounded-[14px]
                  border
                  border-[#EBDDAB]
                  bg-white
                  text-black
                  shadow-[0_6px_18px_rgba(81,62,13,0.05)]
                  transition
                  hover:bg-[#FFF9E8]
                  disabled:opacity-60
                "
                aria-label="Refresh notifications"
              >
                <RefreshCw
                  size={18}
                  className={
                    refreshing
                      ? "animate-spin"
                      : ""
                  }
                />
              </motion.button>

              {/* CLOSE */}

              <motion.button
                type="button"
                onClick={
                  handleBack
                }
                whileTap={{
                  scale:
                    0.92,
                }}
                className="
                  flex
                  h-[44px]
                  w-[44px]
                  shrink-0
                  items-center
                  justify-center
                  rounded-[14px]
                  border
                  border-[#EBDDAB]
                  bg-white
                  text-black
                  shadow-[0_6px_18px_rgba(81,62,13,0.05)]
                  transition
                  hover:border-[#E8CA68]
                  hover:bg-[#FFF9E8]
                "
                aria-label="Close notifications"
              >
                <X
                  size={20}
                  strokeWidth={2.2}
                />
              </motion.button>
            </div>
          </div>

          {/* =================================================
              TITLE
          ================================================= */}

          <motion.div
            initial={{
              opacity: 0,
              y: 8,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="
              mt-5
            "
          >
            <div
              className="
                flex
                items-end
                justify-between
                gap-4
              "
            >
              <div>
                <h1
                  className="
                    text-[28px]
                    font-extrabold
                    tracking-[-0.6px]
                    text-black
                  "
                >
                  Notifications
                </h1>

                <p
                  className="
                    mt-1.5
                    text-[11px]
                    leading-5
                    text-zinc-500
                  "
                >
                  Ride, safety and
                  account updates in one
                  place.
                </p>
              </div>

              {unreadCount >
                0 && (
                <button
                  type="button"
                  onClick={
                    markAllRead
                  }
                  className="
                    flex
                    shrink-0
                    items-center
                    gap-1.5
                    rounded-full
                    border
                    border-[#E9D487]
                    bg-[#FFF4CB]
                    px-3
                    py-2
                    text-[8px]
                    font-bold
                    text-black
                    transition
                    hover:bg-[#FFEDBA]
                  "
                >
                  <CheckCheck
                    size={13}
                  />

                  Mark all read
                </button>
              )}
            </div>
          </motion.div>
        </header>

        {/* =================================================
            CONTENT
        ================================================= */}

        <main
          className="
            px-4
            pb-10
            pt-2
          "
        >
          {/* =================================================
              SECTION HEADER
          ================================================= */}

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
              <p
                className="
                  text-[8px]
                  font-extrabold
                  uppercase
                  tracking-[1.5px]
                  text-[#B77D00]
                "
              >
                Activity Feed
              </p>

              <h2
                className="
                  mt-1
                  text-[18px]
                  font-extrabold
                  text-black
                "
              >
                Recent Updates
              </h2>
            </div>

            <div
              className="
                flex
                items-center
                gap-2
              "
            >
              <span
                className="
                  rounded-full
                  bg-[#FFF1BE]
                  px-2.5
                  py-1.5
                  text-[9px]
                  font-bold
                  text-[#936500]
                "
              >
                {
                  notifications.length
                }
              </span>
            </div>
          </div>

          {/* =================================================
              LOADING
          ================================================= */}

          {loading && (
            <LoadingState />
          )}

          {/* =================================================
              ERROR
          ================================================= */}

          {!loading &&
            error && (
              <div
                className="
                  rounded-[22px]
                  border
                  border-[#EEDB9A]
                  bg-white
                  p-8
                  text-center
                  shadow-[0_8px_24px_rgba(81,63,15,0.045)]
                "
              >
                <div
                  className="
                    mx-auto
                    flex
                    h-14
                    w-14
                    items-center
                    justify-center
                    rounded-[18px]
                    bg-[#FFF3C7]
                    text-[#B67D00]
                  "
                >
                  <Info
                    size={25}
                  />
                </div>

                <p
                  className="
                    mt-4
                    text-[14px]
                    font-bold
                    text-black
                  "
                >
                  Unable to load
                  notifications
                </p>

                <p
                  className="
                    mt-1
                    text-[10px]
                    leading-5
                    text-zinc-500
                  "
                >
                  {error}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    fetchNotifications()
                  }
                  className="
                    mt-5
                    inline-flex
                    h-[43px]
                    items-center
                    justify-center
                    gap-2
                    rounded-[13px]
                    bg-[#FFB400]
                    px-5
                    text-[11px]
                    font-bold
                    text-black
                  "
                >
                  <RefreshCw
                    size={15}
                  />

                  Try Again
                </button>
              </div>
            )}

          {/* =================================================
              EMPTY
          ================================================= */}

          {!loading &&
            !error &&
            notifications.length ===
              0 && (
              <EmptyState />
            )}

          {/* =================================================
              GROUPS
          ================================================= */}

          {!loading &&
            !error &&
            notifications.length >
              0 && (
              <div
                className="
                  space-y-6
                "
              >
                {groupedNotifications
                  .today.length >
                  0 && (
                  <NotificationGroup
                    title="Today"
                    items={
                      groupedNotifications
                        .today
                    }
                    markAsRead={
                      markAsRead
                    }
                  />
                )}

                {groupedNotifications
                  .yesterday
                  .length >
                  0 && (
                  <NotificationGroup
                    title="Yesterday"
                    items={
                      groupedNotifications
                        .yesterday
                    }
                    markAsRead={
                      markAsRead
                    }
                  />
                )}

                {groupedNotifications
                  .earlier.length >
                  0 && (
                  <NotificationGroup
                    title="Earlier"
                    items={
                      groupedNotifications
                        .earlier
                    }
                    markAsRead={
                      markAsRead
                    }
                  />
                )}
              </div>
            )}
        </main>
      </div>

      {/* =================================================
          CSS
      ================================================= */}

      <style>{`
        .notification-grid {
          background-image:
            linear-gradient(
              rgba(168, 124, 0, 0.022) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(168, 124, 0, 0.022) 1px,
              transparent 1px
            );

          background-size:
            30px 30px;

          mask-image:
            linear-gradient(
              to bottom,
              rgba(0, 0, 0, 0.25),
              transparent
            );

          -webkit-mask-image:
            linear-gradient(
              to bottom,
              rgba(0, 0, 0, 0.25),
              transparent
            );
        }
      `}</style>
    </div>
  );
}

/* =========================================================
   NOTIFICATION GROUP
========================================================= */

function NotificationGroup({
  title,
  items,
  markAsRead,
}) {
  return (
    <section>
      {/* =================================================
          GROUP TITLE
      ================================================= */}

      <div
        className="
          mb-2.5
          flex
          items-center
          gap-2
          px-1
        "
      >
        <div
          className="
            h-[16px]
            w-[4px]
            rounded-full
            bg-[#FFB400]
          "
        />

        <h3
          className="
            text-[10px]
            font-extrabold
            uppercase
            tracking-[1px]
            text-black
          "
        >
          {title}
        </h3>

        <span
          className="
            flex
            h-[20px]
            min-w-[20px]
            items-center
            justify-center
            rounded-full
            bg-[#FFF3CC]
            px-1.5
            text-[7px]
            font-bold
            text-[#936500]
          "
        >
          {items.length}
        </span>
      </div>

      {/* =================================================
          LIST
      ================================================= */}

      <div
        className="
          space-y-2.5
        "
      >
        <AnimatePresence
          initial={false}
        >
          {items.map(
            (
              notification,
              index
            ) => (
              <NotificationItem
                key={
                  notification._id
                }
                notification={
                  notification
                }
                index={
                  index
                }
                markAsRead={
                  markAsRead
                }
              />
            )
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

/* =========================================================
   NOTIFICATION ITEM
========================================================= */

function NotificationItem({
  notification,
  index,
  markAsRead,
}) {
  const {
    title,
    message,
    createdAt,
    read,
    child,
    childId,
  } =
    notification;

  const config =
    getNotificationConfig(
      title,
      message
    );

  const Icon =
    config.icon;

  const time =
    formatNotificationTime(
      createdAt
    );

  return (
    <motion.button
      type="button"
      onClick={() =>
        markAsRead(
          notification._id
        )
      }
      initial={{
        opacity: 0,
        y: 7,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      exit={{
        opacity: 0,
        y: -5,
      }}
      transition={{
        duration:
          0.28,

        delay:
          Math.min(
            index *
              0.025,
            0.15
          ),
      }}
      whileTap={{
        scale:
          0.99,
      }}
      className={`
        relative
        w-full
        overflow-hidden
        rounded-[20px]
        border
        bg-white
        px-3
        py-3.5
        text-left
        shadow-[0_7px_20px_rgba(81,62,12,0.04)]

        ${
          read
            ? "border-[#EEE5CC]"
            : "border-[#EBCB64]"
        }
      `}
    >
      {/* =================================================
          UNREAD ACCENT
      ================================================= */}

      {!read && (
        <div
          className="
            absolute
            bottom-3
            left-0
            top-3
            w-[4px]
            rounded-r-full
            bg-[#FFB400]
          "
        />
      )}

      <div
        className="
          flex
          items-start
          gap-3
        "
      >
        {/* =================================================
            ICON
        ================================================= */}

        <div
          className={`
            relative
            flex
            h-[48px]
            w-[48px]
            shrink-0
            items-center
            justify-center
            rounded-[15px]
            border

            ${config.iconBox}
          `}
        >
          <Icon
            size={20}
            strokeWidth={1.9}
          />

          {!read && (
            <motion.div
              className="
                absolute
                -right-[3px]
                -top-[3px]
                h-[10px]
                w-[10px]
                rounded-full
                border-2
                border-white
                bg-[#FFB400]
              "
              animate={{
                scale: [
                  1,
                  1.3,
                  1,
                ],
              }}
              transition={{
                duration:
                  1.5,

                repeat:
                  Infinity,
              }}
            />
          )}
        </div>

        {/* =================================================
            CONTENT
        ================================================= */}

        <div
          className="
            min-w-0
            flex-1
          "
        >
          <div
            className="
              flex
              items-start
              justify-between
              gap-2
            "
          >
            <div
              className="
                min-w-0
                flex-1
              "
            >
              <h4
                className="
                  text-[13px]
                  font-bold
                  leading-tight
                  text-black
                "
              >
                {title ||
                  "Notification"}
              </h4>
            </div>

            <span
              className="
                mt-[1px]
                shrink-0
                text-[8px]
                font-medium
                text-zinc-400
              "
            >
              {time}
            </span>
          </div>

          <p
            className="
              mt-1.5
              pr-1
              text-[10px]
              leading-[1.55]
              text-zinc-500
            "
          >
            {message ||
              "You have a new update."}
          </p>

          {/* =================================================
              CHILD
          ================================================= */}

          {(child?.name ||
            childId) && (
            <div
              className="
                mt-2.5
                inline-flex
                items-center
                gap-1.5
                rounded-full
                border
                border-[#EFD788]
                bg-[#FFF5D5]
                px-2.5
                py-1
              "
            >
              <UserRoundCheck
                size={10}
                className="
                  text-[#B87C00]
                "
              />

              <span
                className="
                  text-[8px]
                  font-semibold
                  text-[#876000]
                "
              >
                {child?.name ||
                  childId}
              </span>
            </div>
          )}

          {/* =================================================
              READ STATE
          ================================================= */}

          {!read && (
            <div
              className="
                mt-2.5
                flex
                items-center
                gap-1
              "
            >
              <span
                className="
                  h-[5px]
                  w-[5px]
                  rounded-full
                  bg-[#FFB400]
                "
              />

              <span
                className="
                  text-[7px]
                  font-bold
                  uppercase
                  tracking-[0.8px]
                  text-[#A46F00]
                "
              >
                New
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.button>
  );
}

/* =========================================================
   NOTIFICATION CONFIG
========================================================= */

function getNotificationConfig(
  title = "",
  message = ""
) {
  const value =
    `${title} ${message}`
      .toLowerCase();

  /* =======================================================
     DRIVER
  ======================================================= */

  if (
    value.includes(
      "driver"
    )
  ) {
    return {
      icon:
        Car,

      iconBox:
        "bg-[#FFF0B8] text-black border-[#EACB69]",
    };
  }

  /* =======================================================
     PICKUP
  ======================================================= */

  if (
    value.includes(
      "pickup"
    ) ||
    value.includes(
      "picked up"
    )
  ) {
    return {
      icon:
        UserRoundCheck,

      iconBox:
        "bg-[#FFF6D7] text-black border-[#EED994]",
    };
  }

  /* =======================================================
     SCHOOL / HOME / REACHED
  ======================================================= */

  if (
    value.includes(
      "school"
    ) ||
    value.includes(
      "home"
    ) ||
    value.includes(
      "reached"
    )
  ) {
    return {
      icon:
        School,

      iconBox:
        "bg-[#FFF1C2] text-black border-[#E9CD76]",
    };
  }

  /* =======================================================
     ROUTE
  ======================================================= */

  if (
    value.includes(
      "route"
    )
  ) {
    return {
      icon:
        Route,

      iconBox:
        "bg-[#FFE7A0] text-black border-[#E7C762]",
    };
  }

  /* =======================================================
     DELAY
  ======================================================= */

  if (
    value.includes(
      "delay"
    ) ||
    value.includes(
      "traffic"
    ) ||
    value.includes(
      "late"
    )
  ) {
    return {
      icon:
        Clock3,

      iconBox:
        "bg-[#FFF1CF] text-black border-[#EED092]",
    };
  }

  /* =======================================================
     COMPLETED
  ======================================================= */

  if (
    value.includes(
      "complete"
    ) ||
    value.includes(
      "success"
    )
  ) {
    return {
      icon:
        CheckCircle2,

      iconBox:
        "bg-[#FFF7D9] text-black border-[#E9DAA1]",
    };
  }

  /* =======================================================
     SECURITY
  ======================================================= */

  if (
    value.includes(
      "verification"
    ) ||
    value.includes(
      "verified"
    ) ||
    value.includes(
      "security"
    )
  ) {
    return {
      icon:
        ShieldCheck,

      iconBox:
        "bg-[#FFF0BB] text-black border-[#E6CA70]",
    };
  }

  /* =======================================================
     DEFAULT
  ======================================================= */

  return {
    icon:
      Info,

    iconBox:
      "bg-[#FFF6D7] text-black border-[#EED994]",
  };
}

/* =========================================================
   LOADING
========================================================= */

function LoadingState() {
  return (
    <div
      className="
        space-y-2.5
      "
    >
      {[
        1,
        2,
        3,
        4,
      ].map(
        (
          item
        ) => (
          <div
            key={
              item
            }
            className="
              flex
              items-center
              gap-3
              rounded-[20px]
              border
              border-[#EFE3BE]
              bg-white
              px-3
              py-3.5
            "
          >
            <div
              className="
                h-[48px]
                w-[48px]
                shrink-0
                animate-pulse
                rounded-[15px]
                bg-[#FFF1C5]
              "
            />

            <div
              className="
                flex-1
              "
            >
              <div
                className="
                  h-[9px]
                  w-[45%]
                  animate-pulse
                  rounded-full
                  bg-[#EDE7D8]
                "
              />

              <div
                className="
                  mt-2
                  h-[7px]
                  w-[90%]
                  animate-pulse
                  rounded-full
                  bg-[#F2ECDE]
                "
              />

              <div
                className="
                  mt-1.5
                  h-[7px]
                  w-[65%]
                  animate-pulse
                  rounded-full
                  bg-[#FFF1C5]
                "
              />
            </div>
          </div>
        )
      )}
    </div>
  );
}

/* =========================================================
   EMPTY
========================================================= */

function EmptyState() {
  return (
    <div
      className="
        rounded-[24px]
        border
        border-[#EDDA97]
        bg-white
        px-6
        py-12
        text-center
        shadow-[0_8px_24px_rgba(81,63,15,0.04)]
      "
    >
      <div
        className="
          mx-auto
          flex
          h-[68px]
          w-[68px]
          items-center
          justify-center
          rounded-[21px]
          bg-[#FFF0B8]
          text-black
        "
      >
        <Bell
          size={28}
        />
      </div>

      <h3
        className="
          mt-4
          text-[17px]
          font-extrabold
          text-black
        "
      >
        No Notifications
      </h3>

      <p
        className="
          mt-2
          text-[10px]
          text-zinc-500
        "
      >
        You're all caught up.
      </p>

      <p
        className="
          mx-auto
          mt-1
          max-w-[230px]
          text-[9px]
          leading-4
          text-zinc-400
        "
      >
        New ride and safety
        updates will appear here
        automatically.
      </p>
    </div>
  );
}

/* =========================================================
   DATE GROUP
========================================================= */

function getDateGroup(
  date
) {
  if (
    !date
  ) {
    return "earlier";
  }

  const value =
    new Date(
      date
    );

  if (
    Number.isNaN(
      value.getTime()
    )
  ) {
    return "earlier";
  }

  const today =
    new Date();

  const yesterday =
    new Date();

  yesterday.setDate(
    today.getDate() -
      1
  );

  if (
    isSameDay(
      value,
      today
    )
  ) {
    return "today";
  }

  if (
    isSameDay(
      value,
      yesterday
    )
  ) {
    return "yesterday";
  }

  return "earlier";
}

/* =========================================================
   SAME DAY
========================================================= */

function isSameDay(
  first,
  second
) {
  return (
    first.getDate() ===
      second.getDate() &&
    first.getMonth() ===
      second.getMonth() &&
    first.getFullYear() ===
      second.getFullYear()
  );
}

/* =========================================================
   FORMAT TIME
========================================================= */

function formatNotificationTime(
  date
) {
  if (
    !date
  ) {
    return "";
  }

  const value =
    new Date(
      date
    );

  if (
    Number.isNaN(
      value.getTime()
    )
  ) {
    return "";
  }

  return value.toLocaleTimeString(
    "en-IN",
    {
      hour:
        "numeric",

      minute:
        "2-digit",

      hour12:
        true,
    }
  );
}

export default Notifications;