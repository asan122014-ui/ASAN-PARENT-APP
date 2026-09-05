import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  GoogleMap,
  Marker,
  InfoWindow,
  DirectionsRenderer,
  useJsApiLoader,
} from "@react-google-maps/api";

import {
  io,
} from "socket.io-client";

import {
  API,
} from "../../api/api";

import {
  Phone,
  User,
  Car,
  Camera,
  MessageCircle,
  Share2,
  Maximize2,
  Minimize2,
  LocateFixed,
  Layers3,
  ShieldAlert,
  School,
  Home,
  Navigation,
  MapPinned,
  Clock3,
  Route,
  Radio,
} from "lucide-react";

/* =========================================================
   CONFIG
========================================================= */

const SOCKET_URL =
  "https://asan-driverapp.onrender.com";

const GOOGLE_MAPS_API_KEY =
  import.meta.env
    .VITE_GOOGLE_MAPS_API_KEY ||
  "";

const GOOGLE_MAPS_LOADER_ID =
  "asan-parent-google-map";

const GOOGLE_MAP_LIBRARIES = [
  "places",
];

const containerStyle = {
  width: "100%",
  height: "100%",
};

const HYDERABAD = {
  lat: 17.385,
  lng: 78.486,
};

/* =========================================================
   MAP STYLE
========================================================= */

const mapStyles = [
  {
    featureType:
      "all",

    elementType:
      "geometry",

    stylers: [
      {
        saturation:
          -80,
      },

      {
        lightness:
          18,
      },
    ],
  },

  {
    featureType:
      "all",

    elementType:
      "labels.text.fill",

    stylers: [
      {
        color:
          "#52525B",
      },
    ],
  },

  {
    featureType:
      "all",

    elementType:
      "labels.text.stroke",

    stylers: [
      {
        color:
          "#FFFFFF",
      },
    ],
  },

  {
    featureType:
      "poi",

    elementType:
      "labels.icon",

    stylers: [
      {
        visibility:
          "off",
      },
    ],
  },

  {
    featureType:
      "transit",

    elementType:
      "labels.icon",

    stylers: [
      {
        visibility:
          "off",
      },
    ],
  },
];

/* =========================================================
   TRACKING
========================================================= */

function Tracking() {
  /* =======================================================
     LOCATION
  ======================================================= */

  const [
    position,
    setPosition,
  ] =
    useState(null);

  const [
    smoothPosition,
    setSmoothPosition,
  ] =
    useState(null);

  const [
    fallback,
    setFallback,
  ] =
    useState(null);

  /* =======================================================
     ROUTE
  ======================================================= */

  const [
    directions,
    setDirections,
  ] =
    useState(null);

  const [
    eta,
    setEta,
  ] =
    useState("--");

  const [
    distance,
    setDistance,
  ] =
    useState("--");

  const [
    tripPhase,
    setTripPhase,
  ] =
    useState(
      "pickup"
    );

  /* =======================================================
     DATA
  ======================================================= */

  const [
    driver,
    setDriver,
  ] =
    useState(null);

  const [
    students,
    setStudents,
  ] =
    useState([]);

  /* =======================================================
     UI
  ======================================================= */

  const [
    showStops,
    setShowStops,
  ] =
    useState(true);

  const [
    cameraFullscreen,
    setCameraFullscreen,
  ] =
    useState(false);

  const [
    showDriverInfo,
    setShowDriverInfo,
  ] =
    useState(false);

  /* =======================================================
     REFS
  ======================================================= */

  const socketRef =
    useRef(null);

  const mapRef =
    useRef(null);

  const lastRouteCall =
    useRef(0);

  const prevPositionRef =
    useRef(null);

  const remoteVideoRef =
    useRef(null);

  const pcRef =
    useRef(null);

  const cameraRequestedRef =
    useRef(false);

  const iceQueueRef =
    useRef([]);

  /* =======================================================
     PARENT
  ======================================================= */

  let parent = {};

  try {
    parent =
      JSON.parse(
        localStorage.getItem(
          "parent"
        )
      ) || {};
  } catch {
    parent = {};
  }

  const driverId =
    parent?.driverId;

  const parentId =
    parent?._id;

  /* =======================================================
     GOOGLE MAP
  ======================================================= */

  const {
    isLoaded,
  } =
    useJsApiLoader({
      id:
        GOOGLE_MAPS_LOADER_ID,

      googleMapsApiKey:
        GOOGLE_MAPS_API_KEY,

      libraries:
        GOOGLE_MAP_LIBRARIES,
    });

  /* =======================================================
     HELPERS
  ======================================================= */

  const isAppActive =
    () =>
      !document.hidden;

  const isEvening =
    () => {
      const hour =
        new Date()
          .getHours();

      return (
        hour >=
        12
      );
    };

  /* =======================================================
     GET STUDENT COORDS
  ======================================================= */

  const getCoords =
    (
      student
    ) => {
      if (
        tripPhase ===
        "pickup"
      ) {
        return isEvening()
          ? student
              .dropLocationCoords
          : student
              .location;
      }

      return isEvening()
        ? student
            .location
        : student
            .dropLocationCoords;
    };

  /* =======================================================
     MAP MARKER
  ======================================================= */

  const getCircleMarker =
    (
      fillColor,
      strokeColor,
      scale = 10
    ) => {
      if (
        !window.google ||
        !window.google
          .maps
      ) {
        return undefined;
      }

      return {
        path:
          window.google
            .maps
            .SymbolPath
            .CIRCLE,

        fillColor,

        fillOpacity:
          1,

        strokeColor,

        strokeWeight:
          3,

        scale,
      };
    };

  /* =======================================================
     FALLBACK LOCATION
  ======================================================= */

  useEffect(() => {
    if (
      !navigator
        .geolocation
    ) {
      setFallback(
        HYDERABAD
      );

      return;
    }

    navigator.geolocation
      .getCurrentPosition(
        (
          current
        ) => {
          setFallback({
            lat:
              current
                .coords
                .latitude,

            lng:
              current
                .coords
                .longitude,
          });
        },

        () => {
          setFallback(
            HYDERABAD
          );
        },

        {
          enableHighAccuracy:
            true,

          timeout:
            10000,

          maximumAge:
            0,
        }
      );
  }, []);

  /* =======================================================
     FETCH DRIVER + CHILDREN
  ======================================================= */

  useEffect(() => {
    if (
      !driverId ||
      !parentId
    ) {
      return;
    }

    const fetchData =
      async () => {
        if (
          !isAppActive()
        ) {
          return;
        }

        try {
          /* ===============================================
             LINKED DRIVER
             PARENT AUTHENTICATED
          =============================================== */

          const driverResponse =
            await API.get(
              `/driver/tracking?driverId=${encodeURIComponent(
                driverId
              )}`
            );

          /* ===============================================
             PARENT CHILDREN
          =============================================== */

          const childResponse =
            await API.get(
              `/children/parent/${encodeURIComponent(
                parentId
              )}`
            );

          /* ===============================================
             DRIVER
          =============================================== */

          setDriver(
            driverResponse
              .data
              ?.data ||
              null
          );

          /* ===============================================
             STUDENTS
          =============================================== */

          setStudents(
            Array.isArray(
              childResponse
                .data
                ?.data
            )
              ? childResponse
                  .data
                  .data
              : []
          );
        } catch (
          error
        ) {
          console.error(
            "Tracking fetch error:",
            error
              ?.response
              ?.data ||
              error
          );
        }
      };

    fetchData();

    const interval =
      window.setInterval(
        fetchData,
        10000
      );

    return () => {
      window.clearInterval(
        interval
      );
    };
  }, [
    driverId,
    parentId,
  ]);

  /* =======================================================
     PICKUP → DROP
  ======================================================= */

  useEffect(() => {
    if (
      !students.length
    ) {
      return;
    }

    const remainingPickup =
      students.some(
        (
          student
        ) =>
          student.status ===
          "waiting"
      );

    if (
      tripPhase ===
        "pickup" &&
      !remainingPickup
    ) {
      setTripPhase(
        "drop"
      );
    }
  }, [
    students,
    tripPhase,
  ]);

  /* =======================================================
     SMOOTH DRIVER MOVEMENT
  ======================================================= */

  const animateMarker =
    (
      start,
      end
    ) => {
      let startTime =
        null;

      const step =
        (
          time
        ) => {
          if (
            !startTime
          ) {
            startTime =
              time;
          }

          const progress =
            Math.min(
              (time -
                startTime) /
                800,

              1
            );

          const lat =
            start.lat +
            (end.lat -
              start.lat) *
              progress;

          const lng =
            start.lng +
            (end.lng -
              start.lng) *
              progress;

          setSmoothPosition({
            lat,
            lng,
          });

          if (
            progress <
            1
          ) {
            requestAnimationFrame(
              step
            );
          }
        };

      requestAnimationFrame(
        step
      );
    };

  /* =======================================================
     ATTACH VIDEO
  ======================================================= */

  const attachVideo =
    (
      video,
      stream
    ) => {
      video.srcObject =
        stream;

      video.muted =
        true;

      video.autoplay =
        true;

      video.playsInline =
        true;

      video.onloadedmetadata =
        async () => {
          try {
            await video.play();
          } catch (
            error
          ) {
            console.error(
              "Video play error:",
              error
            );
          }
        };
    };

  /* =======================================================
     ACTIVE TRIP
  ======================================================= */

  const hasActiveTrip =
    students.some(
      (
        student
      ) =>
        student.status ===
          "waiting" ||
        student.status ===
          "onboard"
    );

  /* =======================================================
     SOCKET + WEBRTC
  ======================================================= */

  useEffect(() => {
    if (
      !driverId ||
      !parentId
    ) {
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

    socketRef.current =
      socket;

    /* =====================================================
       CONNECT
    ===================================================== */

    socket.on(
      "connect",

      () => {
        console.log(
          "Parent tracking socket connected:",
          socket.id
        );

        cameraRequestedRef.current =
          false;

        socket.emit(
          "join_driver_room",

          {
            driverId,
            parentId,
          }
        );
      }
    );

    /* =====================================================
       OFFER
    ===================================================== */

    socket.on(
      "offer",

      async ({
        offer,

        parentId:
          offerParentId,
      }) => {
        if (
          String(
            offerParentId
          ) !==
          String(
            parentId
          )
        ) {
          return;
        }

        if (
          pcRef.current
        ) {
          pcRef.current
            .close();

          pcRef.current =
            null;

          iceQueueRef.current =
            [];
        }

        const pc =
          new RTCPeerConnection(
            {
              iceServers: [
                {
                  urls:
                    "stun:stun.l.google.com:19302",
                },
              ],
            }
          );

        pcRef.current =
          pc;

        pc.onicecandidate =
          (
            event
          ) => {
            if (
              event.candidate
            ) {
              socket.emit(
                "ice-candidate",

                {
                  candidate:
                    event.candidate,

                  driverId,

                  parentId,

                  sender:
                    "parent",
                }
              );
            }
          };

        pc.addTransceiver(
          "video",

          {
            direction:
              "recvonly",
          }
        );

        pc.ontrack =
          (
            event
          ) => {
            const video =
              remoteVideoRef
                .current;

            const stream =
              event
                .streams?.[0];

            if (
              !video ||
              !stream
            ) {
              return;
            }

            const track =
              stream
                .getVideoTracks()
                ?.[0];

            attachVideo(
              video,
              stream
            );

            const playVideo =
              () => {
                video
                  .play()
                  .catch(
                    (
                      error
                    ) => {
                      console.error(
                        "Video play error:",
                        error
                      );
                    }
                  );
              };

            if (
              track?.muted
            ) {
              track.onunmute =
                playVideo;
            } else {
              playVideo();
            }
          };

        try {
          await pc
            .setRemoteDescription(
              new RTCSessionDescription(
                offer
              )
            );

          while (
            iceQueueRef
              .current
              .length
          ) {
            const candidate =
              iceQueueRef
                .current
                .shift();

            try {
              await pc
                .addIceCandidate(
                  new RTCIceCandidate(
                    candidate
                  )
                );
            } catch (
              error
            ) {
              console.error(
                "ICE queue error:",
                error
              );
            }
          }

          const answer =
            await pc
              .createAnswer();

          await pc
            .setLocalDescription(
              answer
            );

          socket.emit(
            "answer",

            {
              answer,

              driverId,

              parentId,
            }
          );
        } catch (
          error
        ) {
          console.error(
            "WebRTC error:",
            error
          );
        }
      }
    );

    /* =====================================================
       RECEIVE ICE
    ===================================================== */

    socket.on(
      "ice-candidate",

      async ({
        candidate,

        parentId:
          candidateParentId,
      }) => {
        if (
          String(
            candidateParentId
          ) !==
          String(
            parentId
          )
        ) {
          return;
        }

        try {
          if (
            !pcRef.current
          ) {
            iceQueueRef
              .current
              .push(
                candidate
              );

            return;
          }

          if (
            pcRef.current
              .remoteDescription
          ) {
            await pcRef.current
              .addIceCandidate(
                new RTCIceCandidate(
                  candidate
                )
              );
          } else {
            iceQueueRef
              .current
              .push(
                candidate
              );
          }
        } catch (
          error
        ) {
          console.error(
            "ICE error:",
            error
          );
        }
      }
    );

    /* =====================================================
       LIVE LOCATION
    ===================================================== */

    socket.on(
      "live_location",

      (
        data
      ) => {
        if (
          data?.lat ==
            null ||
          data?.lng ==
            null ||
          !window.google
        ) {
          return;
        }

        if (
          document.hidden
        ) {
          return;
        }

        const newPosition =
          {
            lat:
              Number(
                data.lat
              ),

            lng:
              Number(
                data.lng
              ),
          };

        if (
          prevPositionRef
            .current
        ) {
          animateMarker(
            prevPositionRef
              .current,

            newPosition
          );
        } else {
          setSmoothPosition(
            newPosition
          );
        }

        prevPositionRef.current =
          newPosition;

        setPosition(
          newPosition
        );

        mapRef.current
          ?.panTo(
            newPosition
          );
      }
    );

    /* =====================================================
       CLEANUP
    ===================================================== */

    return () => {
      iceQueueRef.current =
        [];

      if (
        pcRef.current
      ) {
        pcRef.current
          .close();

        pcRef.current =
          null;
      }

      socket.disconnect();
    };
  }, [
    driverId,
    parentId,
  ]);

  /* =======================================================
     REQUEST CAMERA
  ======================================================= */

  useEffect(() => {
    if (
      socketRef.current
        ?.connected &&
      hasActiveTrip &&
      !cameraRequestedRef
        .current
    ) {
      socketRef.current.emit(
        "start_camera",

        {
          driverId,
          parentId,
        }
      );

      cameraRequestedRef.current =
        true;
    }

    if (
      !hasActiveTrip
    ) {
      cameraRequestedRef.current =
        false;
    }
  }, [
    hasActiveTrip,
    driverId,
    parentId,
  ]);

  /* =======================================================
     NEXT STUDENT
  ======================================================= */

  const nextStudent =
    students.find(
      (
        student
      ) => {
        if (
          tripPhase ===
          "pickup"
        ) {
          return (
            student.status ===
            "waiting"
          );
        }

        return (
          student.status ===
          "onboard"
        );
      }
    );

  /* =======================================================
     ROUTE + ETA
  ======================================================= */

  useEffect(() => {
    if (
      !position ||
      !nextStudent ||
      !isLoaded ||
      !window.google
    ) {
      return;
    }

    if (
      !isAppActive()
    ) {
      return;
    }

    const now =
      Date.now();

    if (
      now -
        lastRouteCall
          .current <
      15000
    ) {
      return;
    }

    lastRouteCall.current =
      now;

    const target =
      getCoords(
        nextStudent
      );

    if (
      target?.lat ==
        null ||
      target?.lng ==
        null
    ) {
      return;
    }

    const service =
      new window
        .google
        .maps
        .DirectionsService();

    service.route(
      {
        origin:
          position,

        destination:
          {
            lat:
              Number(
                target.lat
              ),

            lng:
              Number(
                target.lng
              ),
          },

        travelMode:
          window
            .google
            .maps
            .TravelMode
            .DRIVING,

        drivingOptions:
          {
            departureTime:
              new Date(),

            trafficModel:
              "bestguess",
          },
      },

      (
        result,
        status
      ) => {
        if (
          status ===
          "OK"
        ) {
          setDirections(
            result
          );

          const leg =
            result
              .routes?.[0]
              ?.legs?.[0];

          setEta(
            leg
              ?.duration_in_traffic
              ?.text ||
              leg
                ?.duration
                ?.text ||
              "--"
          );

          setDistance(
            leg
              ?.distance
              ?.text ||
              "--"
          );
        } else {
          console.error(
            "Directions failed:",
            status
          );
        }
      }
    );
  }, [
    position,
    nextStudent,
    isLoaded,
    tripPhase,
  ]);

  /* =======================================================
     MAP CENTER
  ======================================================= */

  const center =
    smoothPosition ||
    position ||
    fallback ||
    HYDERABAD;

  /* =======================================================
     MY CHILD
  ======================================================= */

  const myChild =
    students.find(
      (
        child
      ) =>
        String(
          child.parentId
        ) ===
        String(
          parentId
        )
    ) ||
    students[0] ||
    null;

  /* =======================================================
     STATUS
  ======================================================= */

  const getStatusText =
    (
      status
    ) => {
      if (
        status ===
        "waiting"
      ) {
        return "Waiting";
      }

      if (
        status ===
        "onboard"
      ) {
        return "On Board";
      }

      if (
        status ===
        "dropped"
      ) {
        return "Dropped";
      }

      return "Unknown";
    };

  const childStatus =
    myChild
      ? getStatusText(
          myChild.status
        )
      : "Waiting";

  /* =======================================================
     SHARE TRIP
  ======================================================= */

  const handleShareTrip =
    async () => {
      const message =
        `AsanRides live trip with ${
          driver?.name ||
          driverId ||
          "driver"
        }.`;

      try {
        if (
          navigator.share
        ) {
          await navigator
            .share({
              title:
                "AsanRides Live Trip",

              text:
                message,
            });
        } else {
          await navigator
            .clipboard
            .writeText(
              message
            );

          alert(
            "Trip information copied"
          );
        }
      } catch (
        error
      ) {
        console.error(
          "Share error:",
          error
        );
      }
    };

  /* =======================================================
     SHARE LOCATION
  ======================================================= */

  const handleShareLocation =
    async () => {
      const current =
        smoothPosition ||
        position;

      if (
        !current
      ) {
        alert(
          "Live location is not available yet"
        );

        return;
      }

      const locationUrl =
        `https://www.google.com/maps?q=${current.lat},${current.lng}`;

      try {
        if (
          navigator.share
        ) {
          await navigator
            .share({
              title:
                "AsanRides Live Location",

              text:
                "Current trip location",

              url:
                locationUrl,
            });
        } else {
          await navigator
            .clipboard
            .writeText(
              locationUrl
            );

          alert(
            "Location copied"
          );
        }
      } catch (
        error
      ) {
        console.error(
          "Location share error:",
          error
        );
      }
    };

  /* =======================================================
     MAP API NOT CONFIGURED
  ======================================================= */

  if (
    !GOOGLE_MAPS_API_KEY
  ) {
    return (
      <div
        className="
          flex
          min-h-screen
          items-center
          justify-center
          bg-[#FFF9EE]
          px-5
        "
      >
        <div
          className="
            w-full
            max-w-[420px]
            rounded-[24px]
            border
            border-[#F0D98F]
            bg-white
            p-7
            text-center
            shadow-[0_12px_30px_rgba(91,70,15,0.07)]
          "
        >
          <MapPinned
            size={32}
            className="
              mx-auto
              text-[#D79500]
            "
          />

          <h2
            className="
              mt-4
              text-[18px]
              font-bold
              text-black
            "
          >
            Maps configuration required
          </h2>

          <p
            className="
              mt-2
              text-[11px]
              leading-5
              text-zinc-500
            "
          >
            Add
            {" "}
            VITE_GOOGLE_MAPS_API_KEY
            {" "}
            to your frontend environment file.
          </p>
        </div>
      </div>
    );
  }

  /* =======================================================
     LOADING
  ======================================================= */

  if (
    !isLoaded
  ) {
    return (
      <div
        className="
          flex
          h-screen
          items-center
          justify-center
          bg-[#FFF9EE]
        "
      >
        <div
          className="
            flex
            flex-col
            items-center
            gap-3
          "
        >
          <div
            className="
              h-11
              w-11
              animate-spin
              rounded-full
              border-[4px]
              border-[#FFE49A]
              border-t-[#FFB400]
            "
          />

          <p
            className="
              text-[12px]
              font-medium
              text-zinc-500
            "
          >
            Loading live tracking...
          </p>
        </div>
      </div>
    );
  }

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div
      className="
        min-h-screen
        bg-[#FFF9EE]
        pb-8
      "
    >
      <div
        className="
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
            pt-7
          "
        >
          <div
            className="
              mb-2
              flex
              items-center
              gap-2
            "
          >
            <Radio
              size={13}
              className="
                text-[#C88B00]
              "
            />

            <p
              className="
                text-[9px]
                font-extrabold
                uppercase
                tracking-[1.7px]
                text-[#B77D00]
              "
            >
              Live Journey
            </p>

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
              items-end
              justify-between
              gap-3
            "
          >
            <div>
              <h1
                className="
                  text-[27px]
                  font-extrabold
                  tracking-[-0.6px]
                  text-black
                "
              >
                Live Tracking
              </h1>

              <p
                className="
                  mt-1.5
                  text-[11px]
                  text-zinc-500
                "
              >
                {driverId
                  ? `Driver ${driverId}`
                  : "Driver not linked"}
              </p>
            </div>

            <div
              className="
                flex
                items-center
                gap-2
                rounded-full
                border
                border-[#F0D57B]
                bg-[#FFF3C9]
                px-3
                py-2
              "
            >
              <span
                className="
                  h-[7px]
                  w-[7px]
                  animate-pulse
                  rounded-full
                  bg-[#FFB400]
                "
              />

              <span
                className="
                  text-[9px]
                  font-extrabold
                  text-black
                "
              >
                LIVE
              </span>
            </div>
          </div>
        </header>

        {/* =================================================
            TRIP SUMMARY
        ================================================= */}

        <div
          className="
            mb-3
            grid
            grid-cols-3
            gap-2
            px-3
          "
        >
          <SummaryCard
            icon={
              <Clock3
                size={13}
              />
            }
            label="ETA"
            value={eta}
          />

          <SummaryCard
            icon={
              <Route
                size={13}
              />
            }
            label="Distance"
            value={distance}
          />

          <SummaryCard
            icon={
              tripPhase ===
              "pickup" ? (
                <Home
                  size={13}
                />
              ) : (
                <School
                  size={13}
                />
              )
            }
            label="Mode"
            value={
              tripPhase ===
              "pickup"
                ? "Pickup"
                : "Drop"
            }
          />
        </div>

        {/* =================================================
            MAP
        ================================================= */}

        <section
          className="
            mx-3
            overflow-hidden
            rounded-[24px]
            border
            border-[#EEDB9B]
            bg-white
            shadow-[0_12px_32px_rgba(94,72,14,0.08)]
          "
        >
          <div
            className="
              relative
              h-[390px]
              overflow-hidden
            "
          >
            <GoogleMap
              mapContainerStyle={
                containerStyle
              }
              center={
                center
              }
              zoom={15}
              onLoad={(
                map
              ) => {
                mapRef.current =
                  map;
              }}
              options={{
                fullscreenControl:
                  false,

                streetViewControl:
                  false,

                mapTypeControl:
                  false,

                zoomControl:
                  false,

                clickableIcons:
                  false,

                styles:
                  mapStyles,
              }}
            >
              {/* ===============================================
                  DRIVER MARKER
              =============================================== */}

              {smoothPosition && (
                <>
                  <Marker
                    position={
                      smoothPosition
                    }
                    icon={
                      getCircleMarker(
                        "#FFB400",
                        "#FFFFFF",
                        12
                      )
                    }
                    label={{
                      text:
                        "V",

                      color:
                        "#111111",

                      fontWeight:
                        "800",

                      fontSize:
                        "10px",
                    }}
                    onMouseOver={() =>
                      setShowDriverInfo(
                        true
                      )
                    }
                    onClick={() =>
                      setShowDriverInfo(
                        (
                          previous
                        ) =>
                          !previous
                      )
                    }
                  />

                  {/* ===========================================
                      DRIVER INFO WINDOW
                  =========================================== */}

                  {showDriverInfo &&
                    driver && (
                      <InfoWindow
                        position={
                          smoothPosition
                        }
                        onCloseClick={() =>
                          setShowDriverInfo(
                            false
                          )
                        }
                        options={{
                          pixelOffset:
                            window.google
                              ? new window.google.maps.Size(
                                  0,
                                  -12
                                )
                              : undefined,
                        }}
                      >
                        <div
                          style={{
                            minWidth:
                              "180px",

                            maxWidth:
                              "220px",

                            padding:
                              "3px 2px 5px",

                            fontFamily:
                              "inherit",
                          }}
                        >
                          <div
                            style={{
                              display:
                                "flex",

                              alignItems:
                                "center",

                              gap:
                                "9px",
                            }}
                          >
                            <div
                              style={{
                                width:
                                  "40px",

                                height:
                                  "40px",

                                flexShrink:
                                  0,

                                borderRadius:
                                  "12px",

                                overflow:
                                  "hidden",

                                background:
                                  "#FFF0B8",

                                border:
                                  "1px solid #E8CD70",

                                display:
                                  "flex",

                                alignItems:
                                  "center",

                                justifyContent:
                                  "center",

                                color:
                                  "#B77D00",
                              }}
                            >
                              {driver
                                ?.profilePhoto ? (
                                <img
                                  src={
                                    driver.profilePhoto
                                  }
                                  alt={
                                    driver.name ||
                                    "Driver"
                                  }
                                  style={{
                                    width:
                                      "100%",

                                    height:
                                      "100%",

                                    objectFit:
                                      "cover",
                                  }}
                                />
                              ) : (
                                <User
                                  size={20}
                                />
                              )}
                            </div>

                            <div
                              style={{
                                minWidth:
                                  0,
                              }}
                            >
                              <div
                                style={{
                                  fontSize:
                                    "8px",

                                  fontWeight:
                                    700,

                                  color:
                                    "#B77D00",

                                  textTransform:
                                    "uppercase",

                                  letterSpacing:
                                    "0.7px",
                                }}
                              >
                                Assigned Driver
                              </div>

                              <div
                                style={{
                                  marginTop:
                                    "2px",

                                  fontSize:
                                    "13px",

                                  fontWeight:
                                    800,

                                  color:
                                    "#111111",
                                }}
                              >
                                {driver.name ||
                                  "Driver"}
                              </div>
                            </div>
                          </div>

                          <div
                            style={{
                              marginTop:
                                "9px",

                              padding:
                                "7px 8px",

                              borderRadius:
                                "10px",

                              background:
                                "#FFF9E8",

                              border:
                                "1px solid #F0DFA5",
                            }}
                          >
                            <div
                              style={{
                                display:
                                  "flex",

                                alignItems:
                                  "center",

                                gap:
                                  "6px",
                              }}
                            >
                              <Car
                                size={13}
                                color="#C88A00"
                              />

                              <span
                                style={{
                                  fontSize:
                                    "10px",

                                  fontWeight:
                                    700,

                                  color:
                                    "#111111",
                                }}
                              >
                                {driver
                                  .vehicleNumber ||
                                  "Vehicle unavailable"}
                              </span>
                            </div>

                            {driver
                              .vehicleType && (
                              <div
                                style={{
                                  marginTop:
                                    "3px",

                                  marginLeft:
                                    "19px",

                                  fontSize:
                                    "8px",

                                  color:
                                    "#71717A",
                                }}
                              >
                                {
                                  driver.vehicleType
                                }
                              </div>
                            )}
                          </div>

                          {driver.phone && (
                            <div
                              style={{
                                marginTop:
                                  "7px",

                                display:
                                  "flex",

                                alignItems:
                                  "center",

                                gap:
                                  "6px",

                                fontSize:
                                  "9px",

                                color:
                                  "#52525B",
                              }}
                            >
                              <Phone
                                size={12}
                                color="#C88A00"
                              />

                              {
                                driver.phone
                              }
                            </div>
                          )}

                          <div
                            style={{
                              marginTop:
                                "7px",

                              display:
                                "flex",

                              alignItems:
                                "center",

                              gap:
                                "5px",
                            }}
                          >
                            <span
                              style={{
                                width:
                                  "6px",

                                height:
                                  "6px",

                                borderRadius:
                                  "50%",

                                background:
                                  "#22C55E",
                              }}
                            />

                            <span
                              style={{
                                fontSize:
                                  "8px",

                                fontWeight:
                                  700,

                                color:
                                  "#16A34A",
                              }}
                            >
                              Live location
                            </span>
                          </div>
                        </div>
                      </InfoWindow>
                    )}
                </>
              )}

              {/* ===============================================
                  NEXT STOP
              =============================================== */}

              {nextStudent &&
                getCoords(
                  nextStudent
                )?.lat !=
                  null && (
                  <Marker
                    position={{
                      lat:
                        Number(
                          getCoords(
                            nextStudent
                          ).lat
                        ),

                      lng:
                        Number(
                          getCoords(
                            nextStudent
                          ).lng
                        ),
                    }}
                    icon={
                      getCircleMarker(
                        "#FFF2C4",
                        "#FFB400",
                        11
                      )
                    }
                    label={{
                      text:
                        tripPhase ===
                        "pickup"
                          ? "H"
                          : "S",

                      color:
                        "#111111",

                      fontWeight:
                        "800",

                      fontSize:
                        "10px",
                    }}
                  />
                )}

              {/* ===============================================
                  OTHER STOPS
              =============================================== */}

              {showStops &&
                students.map(
                  (
                    student
                  ) => {
                    const coords =
                      getCoords(
                        student
                      );

                    if (
                      coords?.lat ==
                        null ||
                      coords?.lng ==
                        null ||
                      student._id ===
                        nextStudent
                          ?._id
                    ) {
                      return null;
                    }

                    return (
                      <Marker
                        key={
                          student._id
                        }
                        position={{
                          lat:
                            Number(
                              coords.lat
                            ),

                          lng:
                            Number(
                              coords.lng
                            ),
                        }}
                        icon={
                          getCircleMarker(
                            "#FFE9A1",
                            "#FFB400",
                            7
                          )
                        }
                      />
                    );
                  }
                )}

              {/* ===============================================
                  ROUTE
              =============================================== */}

              {directions && (
                <DirectionsRenderer
                  directions={
                    directions
                  }
                  options={{
                    suppressMarkers:
                      true,

                    polylineOptions:
                      {
                        strokeColor:
                          "#FFB400",

                        strokeOpacity:
                          1,

                        strokeWeight:
                          6,
                      },
                  }}
                />
              )}
            </GoogleMap>

            {/* ===============================================
                CURRENT MODE
            =============================================== */}

            <div
              className="
                absolute
                left-3
                top-3
                z-10
                flex
                items-center
                gap-2
                rounded-[13px]
                border
                border-[#ECD585]
                bg-white/95
                px-2.5
                py-2
                shadow-md
                backdrop-blur
              "
            >
              <div
                className="
                  flex
                  h-7
                  w-7
                  items-center
                  justify-center
                  rounded-[9px]
                  bg-[#FFF2C4]
                  text-[#B77D00]
                "
              >
                {tripPhase ===
                "pickup" ? (
                  <Home
                    size={14}
                  />
                ) : (
                  <School
                    size={14}
                  />
                )}
              </div>

              <div>
                <p
                  className="
                    text-[7px]
                    text-zinc-400
                  "
                >
                  Current Mode
                </p>

                <p
                  className="
                    text-[10px]
                    font-bold
                    text-black
                  "
                >
                  {tripPhase ===
                  "pickup"
                    ? "Pickup"
                    : "Drop"}
                </p>
              </div>
            </div>

            {/* ===============================================
                MAP CONTROLS
            =============================================== */}

            <div
              className="
                absolute
                right-3
                top-3
                z-10
                flex
                flex-col
                gap-2
              "
            >
              <button
                type="button"
                onClick={() => {
                  const current =
                    smoothPosition ||
                    position;

                  if (
                    current
                  ) {
                    mapRef.current
                      ?.panTo(
                        current
                      );
                  }
                }}
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-[12px]
                  border
                  border-[#E7DFC8]
                  bg-white
                  text-[#A87400]
                  shadow-md
                  transition
                  active:scale-95
                "
              >
                <LocateFixed
                  size={17}
                />
              </button>

              <button
                type="button"
                onClick={() =>
                  setShowStops(
                    (
                      previous
                    ) =>
                      !previous
                  )
                }
                className={`
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-[12px]
                  border
                  border-[#E7D48D]
                  text-[#9F6D00]
                  shadow-md
                  transition
                  active:scale-95

                  ${
                    showStops
                      ? "bg-[#FFB400]"
                      : "bg-white"
                  }
                `}
              >
                <Layers3
                  size={17}
                />
              </button>
            </div>

            {/* ===============================================
                FLOATING DRIVER CARD
            =============================================== */}

            {driver && (
              <div
                className="
                  absolute
                  bottom-3
                  left-3
                  right-3
                  z-20
                "
              >
                <div
                  className="
                    flex
                    items-center
                    gap-2.5
                    rounded-[18px]
                    border
                    border-[#E9D58D]
                    bg-white/95
                    p-2.5
                    shadow-[0_10px_28px_rgba(72,55,12,0.16)]
                    backdrop-blur-xl
                  "
                >
                  {/* DRIVER PHOTO */}

                  <div
                    className="
                      flex
                      h-[48px]
                      w-[48px]
                      shrink-0
                      items-center
                      justify-center
                      overflow-hidden
                      rounded-[14px]
                      border
                      border-[#EFD47B]
                      bg-[#FFF1BD]
                      text-[#B77D00]
                    "
                  >
                    {driver
                      .profilePhoto ? (
                      <img
                        src={
                          driver.profilePhoto
                        }
                        alt={
                          driver.name ||
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
                        size={22}
                      />
                    )}
                  </div>

                  {/* DRIVER DETAILS */}

                  <div
                    className="
                      min-w-0
                      flex-1
                    "
                  >
                    <p
                      className="
                        text-[7px]
                        font-extrabold
                        uppercase
                        tracking-[1px]
                        text-zinc-400
                      "
                    >
                      Assigned Driver
                    </p>

                    <h3
                      className="
                        mt-[1px]
                        truncate
                        text-[13px]
                        font-extrabold
                        text-black
                      "
                    >
                      {driver.name ||
                        "Driver"}
                    </h3>

                    <div
                      className="
                        mt-1
                        flex
                        min-w-0
                        items-center
                        gap-1
                      "
                    >
                      <Car
                        size={11}
                        className="
                          shrink-0
                          text-[#C88B00]
                        "
                      />

                      <span
                        className="
                          truncate
                          text-[8px]
                          font-bold
                          text-black
                        "
                      >
                        {driver
                          .vehicleNumber ||
                          "Vehicle"}
                      </span>

                      {driver
                        .vehicleType && (
                        <>
                          <span
                            className="
                              text-[7px]
                              text-zinc-300
                            "
                          >
                            •
                          </span>

                          <span
                            className="
                              truncate
                              text-[7px]
                              text-zinc-400
                            "
                          >
                            {
                              driver.vehicleType
                            }
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* ACTIONS */}

                  <div
                    className="
                      flex
                      shrink-0
                      items-center
                      gap-1.5
                    "
                  >
                    {driver.phone && (
                      <a
                        href={`tel:${driver.phone}`}
                        className="
                          flex
                          h-9
                          w-9
                          items-center
                          justify-center
                          rounded-[11px]
                          border
                          border-[#E8CE74]
                          bg-[#FFF8DF]
                          text-[#A97300]
                          shadow-sm
                          transition
                          active:scale-95
                        "
                        aria-label="Call driver"
                      >
                        <Phone
                          size={15}
                        />
                      </a>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        alert(
                          "Chat can be connected to the Parent messaging screen."
                        )
                      }
                      className="
                        flex
                        h-9
                        w-9
                        items-center
                        justify-center
                        rounded-[11px]
                        border
                        border-[#E8CE74]
                        bg-[#FFF8DF]
                        text-[#A97300]
                        shadow-sm
                        transition
                        active:scale-95
                      "
                      aria-label="Chat with driver"
                    >
                      <MessageCircle
                        size={15}
                      />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ===============================================
              CHILD STATUS
          =============================================== */}

          <div
            className="
              flex
              items-center
              justify-between
              border-t
              border-[#F0E4BF]
              bg-[#FFFDF6]
              px-4
              py-3
            "
          >
            <div>
              <p
                className="
                  text-[8px]
                  font-semibold
                  uppercase
                  tracking-[1px]
                  text-zinc-400
                "
              >
                Your Child
              </p>

              <p
                className="
                  mt-1
                  text-[12px]
                  font-bold
                  text-black
                "
              >
                {myChild
                  ?.name ||
                  "Ride Status"}
              </p>
            </div>

            <span
              className="
                rounded-full
                bg-[#FFF0B9]
                px-3
                py-2
                text-[9px]
                font-bold
                text-[#946600]
              "
            >
              {
                childStatus
              }
            </span>
          </div>
        </section>

        {/* =================================================
            LIVE CAMERA
        ================================================= */}

        <section
          className={`
            ${
              cameraFullscreen
                ? "fixed inset-0 z-[200] bg-[#FFF9EE] p-3"
                : "mx-3 mt-4"
            }
          `}
        >
          <div
            className={`
              relative
              overflow-hidden
              border
              border-[#EACB69]
              bg-[#FFFDF7]
              shadow-[0_10px_28px_rgba(90,70,15,0.07)]

              ${
                cameraFullscreen
                  ? "h-full w-full rounded-[24px]"
                  : "rounded-[22px]"
              }
            `}
          >
            {/* CAMERA HEADER */}

            <div
              className="
                flex
                h-[54px]
                items-center
                justify-between
                border-b
                border-[#F0E4BF]
                bg-white
                px-4
              "
            >
              <div
                className="
                  flex
                  items-center
                  gap-2
                "
              >
                <Camera
                  size={17}
                  className="
                    text-[#C98E00]
                  "
                />

                <span
                  className="
                    text-[12px]
                    font-bold
                    text-black
                  "
                >
                  Live Camera
                </span>

                {hasActiveTrip && (
                  <span
                    className="
                      flex
                      items-center
                      gap-1
                      rounded-full
                      bg-[#FFF1BA]
                      px-2
                      py-1
                      text-[8px]
                      font-extrabold
                      text-black
                    "
                  >
                    <span
                      className="
                        h-[5px]
                        w-[5px]
                        animate-pulse
                        rounded-full
                        bg-[#FFB400]
                      "
                    />

                    LIVE
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() =>
                  setCameraFullscreen(
                    (
                      previous
                    ) =>
                      !previous
                  )
                }
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-[11px]
                  border
                  border-[#EEE2C1]
                  bg-[#FFF9E8]
                  text-[#A97300]
                "
              >
                {cameraFullscreen ? (
                  <Minimize2
                    size={17}
                  />
                ) : (
                  <Maximize2
                    size={17}
                  />
                )}
              </button>
            </div>

            {/* CAMERA BODY */}

            {hasActiveTrip ? (
              <video
                ref={
                  remoteVideoRef
                }
                autoPlay
                playsInline
                muted
                className={`
                  w-full
                  object-cover

                  ${
                    cameraFullscreen
                      ? "h-[calc(100%_-_54px)]"
                      : "h-[210px]"
                  }
                `}
              />
            ) : (
              <div
                className={`
                  flex
                  flex-col
                  items-center
                  justify-center
                  bg-[#FFF9EA]
                  px-6
                  text-center

                  ${
                    cameraFullscreen
                      ? "h-[calc(100%_-_54px)]"
                      : "h-[210px]"
                  }
                `}
              >
                <div
                  className="
                    flex
                    h-14
                    w-14
                    items-center
                    justify-center
                    rounded-[18px]
                    bg-[#FFF0B7]
                    text-[#A97300]
                  "
                >
                  <Camera
                    size={27}
                  />
                </div>

                <p
                  className="
                    mt-4
                    text-[13px]
                    font-bold
                    text-black
                  "
                >
                  Live camera unavailable
                </p>

                <p
                  className="
                    mt-1
                    max-w-[260px]
                    text-[9px]
                    leading-4
                    text-zinc-500
                  "
                >
                  Camera starts automatically
                  when the driver begins an
                  active trip.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* =================================================
            SHARE
        ================================================= */}

        <div
          className="
            mt-4
            grid
            grid-cols-2
            gap-3
            px-3
          "
        >
          <button
            type="button"
            onClick={
              handleShareTrip
            }
            className="
              flex
              h-[50px]
              items-center
              justify-center
              gap-2
              rounded-[14px]
              border
              border-[#E8CC6B]
              bg-white
              text-[11px]
              font-bold
              text-black
              transition
              hover:bg-[#FFF9E8]
              active:scale-[0.98]
            "
          >
            <Share2
              size={17}
              className="
                text-[#A97300]
              "
            />

            Share Trip
          </button>

          <button
            type="button"
            onClick={
              handleShareLocation
            }
            className="
              flex
              h-[50px]
              items-center
              justify-center
              gap-2
              rounded-[14px]
              bg-[#FFB400]
              text-[11px]
              font-bold
              text-black
              transition
              hover:bg-[#F5A900]
              active:scale-[0.98]
            "
          >
            <Navigation
              size={17}
              className="
                text-[#825B00]
              "
            />

            Share Location
          </button>
        </div>

        {/* =================================================
            SOS
        ================================================= */}

        <div
          className="
            px-3
            pb-5
            pt-5
          "
        >
          <button
            type="button"
            onClick={() =>
              alert(
                "SOS emergency workflow can be connected later."
              )
            }
            className="
              flex
              h-[62px]
              w-full
              items-center
              justify-between
              rounded-[18px]
              border
              border-red-200
              bg-red-50
              px-4
              text-red-600
              transition
              hover:bg-red-100
              active:scale-[0.99]
            "
          >
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
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-[12px]
                  bg-white
                "
              >
                <ShieldAlert
                  size={20}
                />
              </div>

              <div
                className="
                  text-left
                "
              >
                <p
                  className="
                    text-[13px]
                    font-extrabold
                  "
                >
                  Emergency SOS
                </p>

                <p
                  className="
                    mt-[1px]
                    text-[8px]
                    text-red-400
                  "
                >
                  Use only during an emergency
                </p>
              </div>
            </div>

            <span
              className="
                rounded-full
                bg-white
                px-3
                py-2
                text-[9px]
                font-bold
              "
            >
              SOS
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   SUMMARY CARD
========================================================= */

function SummaryCard({
  icon,
  label,
  value,
}) {
  return (
    <div
      className="
        min-w-0
        rounded-[13px]
        border
        border-[#EFE2B8]
        bg-white
        px-2.5
        py-2
        shadow-[0_4px_12px_rgba(79,62,16,0.035)]
      "
    >
      <div
        className="
          mb-1.5
          flex
          items-center
          gap-1.5
        "
      >
        <div
          className="
            flex
            h-6
            w-6
            shrink-0
            items-center
            justify-center
            rounded-[8px]
            bg-[#FFF2C8]
            text-[#B77D00]
          "
        >
          {
            icon
          }
        </div>

        <p
          className="
            truncate
            text-[7px]
            font-medium
            text-zinc-400
          "
        >
          {
            label
          }
        </p>
      </div>

      <p
        className="
          truncate
          text-[10px]
          font-extrabold
          text-black
        "
      >
        {
          value
        }
      </p>
    </div>
  );
}

export default Tracking;
