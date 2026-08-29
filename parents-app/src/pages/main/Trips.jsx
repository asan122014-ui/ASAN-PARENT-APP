import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  Loader2,
  MapPin,
  Navigation,
  Route,
  Star,
  User,
  X,
  Car,
  School,
  Home,
  Image,
} from "lucide-react";

import {
  API,
} from "../../api/api";

import BottomNav from "../../components/layout/BottomNav";

/* =========================================================
   MAIN
========================================================= */

function Trips({
  setTab,
}) {
  /* =======================================================
     STATE
  ======================================================= */

  const [
    trips,
    setTrips,
  ] =
    useState([]);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    selectedTrip,
    setSelectedTrip,
  ] =
    useState(null);

  const [
    photoLocation,
    setPhotoLocation,
  ] =
    useState(
      "Loading..."
    );

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

  const parentId =
    parent?._id;

  /* =======================================================
     FETCH TRIPS
  ======================================================= */

  useEffect(() => {
    if (
      parentId
    ) {
      fetchTrips();
    } else {
      setLoading(
        false
      );
    }
  }, [
    parentId,
  ]);

  const fetchTrips =
    async () => {
      try {
        setLoading(
          true
        );

        /*
          BACKEND:

          GET
          /api/trip/parent/:parentId
        */

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

        const sorted =
          [
            ...data,
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

        setTrips(
          sorted
        );
      } catch (
        err
      ) {
        console.error(
          "Trips fetch error:",

          err?.response
            ?.data ||
            err
        );
      } finally {
        setLoading(
          false
        );
      }
    };

  /* =======================================================
     REVERSE GEOCODING
  ======================================================= */

  const getAddressFromCoords =
    async (
      lat,
      lng
    ) => {
      try {
        const res =
          await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
          );

        const data =
          await res.json();

        return (
          data?.display_name ||
          "Location not available"
        );
      } catch (
        err
      ) {
        console.error(
          "Geocoding error:",
          err
        );

        return "Location not available";
      }
    };

  /* =======================================================
     PHOTO LOCATION
  ======================================================= */

  useEffect(() => {
    if (
      !selectedTrip
    ) {
      return;
    }

    const verification =
      getVerification(
        selectedTrip
      );

    if (
      verification
        ?.latitude !=
        null &&
      verification
        ?.longitude !=
        null
    ) {
      setPhotoLocation(
        "Loading..."
      );

      getAddressFromCoords(
        verification.latitude,
        verification.longitude
      )
        .then(
          setPhotoLocation
        )
        .catch(
          () =>
            setPhotoLocation(
              "Location not available"
            )
        );
    } else {
      setPhotoLocation(
        "Location not available"
      );
    }
  }, [
    selectedTrip,
  ]);

  /* =======================================================
     COMPLETED TRIPS
  ======================================================= */

  const historyTrips =
    useMemo(
      () =>
        trips.filter(
          (
            trip
          ) =>
            String(
              trip.status ||
                ""
            )
              .trim()
              .toLowerCase() ===
            "completed"
        ),

      [
        trips,
      ]
    );

  /* =======================================================
     STATS
  ======================================================= */

  const totalCompleted =
    historyTrips.length;

  const morningTrips =
    historyTrips.filter(
      (
        trip
      ) =>
        trip.tripType ===
        "morning"
    ).length;

  const afternoonTrips =
    historyTrips.filter(
      (
        trip
      ) =>
        trip.tripType ===
        "afternoon"
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
        pb-28
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
            -top-[90px]
            h-[300px]
            w-[300px]
            rounded-full
            bg-[#FFF0B5]
            opacity-70
          "
        />

        <div
          className="
            absolute
            -left-[140px]
            top-[520px]
            h-[280px]
            w-[280px]
            rounded-full
            bg-[#FFF5D9]
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
            <Route
              size={
                13
              }
              className="
                text-[#C78B00]
              "
            />

            <span
              className="
                text-[9px]
                font-extrabold
                uppercase
                tracking-[1.7px]
                text-[#B77D00]
              "
            >
              Journeys
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
              items-end
              justify-between
              gap-3
            "
          >
            <div>
              <h1
                className="
                  text-[28px]
                  font-extrabold
                  tracking-[-0.7px]
                  text-black
                "
              >
                Ride History
              </h1>

              <p
                className="
                  mt-1.5
                  text-[11px]
                  leading-5
                  text-zinc-500
                "
              >
                Review your child's
                completed school rides.
              </p>
            </div>

            <div
              className="
                flex
                h-[50px]
                w-[50px]
                shrink-0
                items-center
                justify-center
                rounded-[16px]
                border
                border-[#EBD58A]
                bg-[#FFF4CE]
                text-black
              "
            >
              <Route
                size={
                  22
                }
              />
            </div>
          </div>
        </header>

        {/* =================================================
            STATS
        ================================================= */}

        <div
          className="
            px-4
          "
        >
          <div
            className="
              grid
              grid-cols-3
              overflow-hidden
              rounded-[22px]
              border
              border-[#EFDEAA]
              bg-white
              shadow-[0_10px_28px_rgba(82,63,13,0.055)]
            "
          >
            <StatBox
              value={
                totalCompleted
              }
              label="Completed"
            />

            <StatBox
              value={
                morningTrips
              }
              label="Morning"
              border
            />

            <StatBox
              value={
                afternoonTrips
              }
              label="Afternoon"
            />
          </div>
        </div>

        {/* =================================================
            SECTION
        ================================================= */}

        <div
          className="
            mb-3
            mt-7
            flex
            items-center
            justify-between
            px-4
          "
        >
          <div>
            <p
              className="
                text-[9px]
                font-extrabold
                uppercase
                tracking-[1.4px]
                text-[#B77D00]
              "
            >
              History
            </p>

            <h2
              className="
                mt-1
                text-[18px]
                font-extrabold
                text-black
              "
            >
              Recent Rides
            </h2>
          </div>

          <div
            className="
              h-[4px]
              w-8
              rounded-full
              bg-[#FFB400]
            "
          />
        </div>

        {/* =================================================
            TRIPS
        ================================================= */}

        <main
          className="
            px-3
          "
        >
          {loading ? (
            <div
              className="
                space-y-4
              "
            >
              <Skeleton />

              <Skeleton />

              <Skeleton />
            </div>
          ) : historyTrips
              .length ===
            0 ? (
            <EmptyState />
          ) : (
            <div
              className="
                space-y-4
              "
            >
              {historyTrips.map(
                (
                  trip,
                  index
                ) => (
                  <TripCard
                    key={
                      trip._id ||
                      index
                    }
                    trip={
                      trip
                    }
                    onDetails={() =>
                      setSelectedTrip(
                        trip
                      )
                    }
                    onRate={() => {
                      /*
                        Rating endpoint has
                        not been verified yet.
                      */

                      alert(
                        "Driver rating will be connected after the rating API is finalized."
                      );
                    }}
                  />
                )
              )}
            </div>
          )}
        </main>
      </div>

      {/* =================================================
          TRIP DETAILS MODAL
      ================================================= */}

      {selectedTrip && (
        <div
          className="
            fixed
            inset-0
            z-[100]
            flex
            items-center
            justify-center
            bg-[#6E6037]/30
            p-4
            backdrop-blur-[4px]
          "
          onClick={() =>
            setSelectedTrip(
              null
            )
          }
        >
          <div
            onClick={(
              event
            ) =>
              event.stopPropagation()
            }
            className="
              max-h-[90vh]
              w-full
              max-w-[420px]
              overflow-y-auto
              rounded-[28px]
              border
              border-[#ECD583]
              bg-[#FFFEFB]
              shadow-[0_24px_70px_rgba(89,68,11,0.18)]
            "
          >
            {/* =================================================
                MODAL HEADER
            ================================================= */}

            <div
              className="
                relative
                overflow-hidden
                border-b
                border-[#EFE0AE]
                bg-[#FFF8DF]
                px-5
                pb-5
                pt-5
              "
            >
              <div
                className="
                  absolute
                  -right-12
                  -top-14
                  h-36
                  w-36
                  rounded-full
                  bg-[#FFDF7A]
                  opacity-40
                "
              />

              <div
                className="
                  relative
                  z-10
                  flex
                  items-start
                  justify-between
                  gap-4
                "
              >
                <div>
                  <div
                    className="
                      mb-2
                      flex
                      items-center
                      gap-2
                    "
                  >
                    <FileText
                      size={
                        13
                      }
                      className="
                        text-[#C68800]
                      "
                    />

                    <span
                      className="
                        text-[9px]
                        font-extrabold
                        uppercase
                        tracking-[1.5px]
                        text-[#B77D00]
                      "
                    >
                      Ride Summary
                    </span>
                  </div>

                  <h2
                    className="
                      text-[23px]
                      font-extrabold
                      text-black
                    "
                  >
                    Trip Details
                  </h2>

                  <p
                    className="
                      mt-1
                      text-[10px]
                      text-zinc-500
                    "
                  >
                    Complete ride
                    information and
                    verification.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setSelectedTrip(
                      null
                    )
                  }
                  className="
                    flex
                    h-10
                    w-10
                    shrink-0
                    items-center
                    justify-center
                    rounded-[13px]
                    border
                    border-[#EAD68E]
                    bg-white
                    text-black
                    transition
                    hover:bg-[#FFF0BB]
                  "
                >
                  <X
                    size={
                      19
                    }
                  />
                </button>
              </div>
            </div>

            {/* =================================================
                BODY
            ================================================= */}

            <div
              className="
                p-5
              "
            >
              {/* =================================================
                  DRIVER
              ================================================= */}

              <div
                className="
                  flex
                  items-center
                  gap-3
                  rounded-[18px]
                  border
                  border-[#EDDA98]
                  bg-[#FFF9E7]
                  p-4
                "
              >
                <div
                  className="
                    flex
                    h-12
                    w-12
                    shrink-0
                    items-center
                    justify-center
                    overflow-hidden
                    rounded-[15px]
                    bg-[#FFE8A1]
                    text-black
                  "
                >
                  {selectedTrip
                    ?.driver
                    ?.profilePhoto ? (
                    <img
                      src={
                        selectedTrip
                          .driver
                          .profilePhoto
                      }
                      alt="Driver"
                      className="
                        h-full
                        w-full
                        object-cover
                      "
                    />
                  ) : (
                    <User
                      size={
                        22
                      }
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
                      text-[15px]
                      font-bold
                      text-black
                    "
                  >
                    {getDriverName(
                      selectedTrip
                    )}
                  </p>

                  <p
                    className="
                      mt-[2px]
                      truncate
                      text-[10px]
                      text-zinc-500
                    "
                  >
                    {selectedTrip
                      .childName ||
                      selectedTrip
                        .child
                        ?.name ||
                      "Student"}
                  </p>
                </div>

                <StatusBadge />
              </div>

              {/* =================================================
                  BASIC INFO
              ================================================= */}

              <div
                className="
                  mt-4
                  grid
                  grid-cols-2
                  gap-3
                "
              >
                <InfoTile
                  label="Date"
                  value={formatDate(
                    selectedTrip
                      .startTime ||
                      selectedTrip
                        .createdAt
                  )}
                  icon={
                    <CalendarDays
                      size={
                        17
                      }
                    />
                  }
                />

                <InfoTile
                  label="Time"
                  value={formatTime(
                    selectedTrip
                      .startTime ||
                      selectedTrip
                        .createdAt
                  )}
                  icon={
                    <Clock
                      size={
                        17
                      }
                    />
                  }
                />

                <InfoTile
                  label="Trip Type"
                  value={
                    selectedTrip
                      .tripType
                      ? capitalize(
                          selectedTrip
                            .tripType
                        )
                      : "N/A"
                  }
                  icon={
                    <Car
                      size={
                        17
                      }
                    />
                  }
                />

                <InfoTile
                  label="Distance"
                  value={getDistance(
                    selectedTrip
                  )}
                  icon={
                    <Navigation
                      size={
                        17
                      }
                    />
                  }
                />
              </div>

              {/* =================================================
                  ROUTE
              ================================================= */}

              <div
                className="
                  mt-5
                  rounded-[18px]
                  border
                  border-[#EDDEAE]
                  bg-white
                  p-4
                "
              >
                <div
                  className="
                    mb-4
                    flex
                    items-center
                    gap-2
                  "
                >
                  <Route
                    size={
                      16
                    }
                    className="
                      text-[#C98C00]
                    "
                  />

                  <p
                    className="
                      text-[13px]
                      font-bold
                      text-black
                    "
                  >
                    Route Details
                  </p>
                </div>

                <RouteDetailRow
                  type="pickup"
                  label="Pickup"
                  location={getPickupLocation(
                    selectedTrip
                  )}
                />

                <div
                  className="
                    ml-[7px]
                    h-7
                    w-[2px]
                    bg-[#FFB400]
                  "
                />

                <RouteDetailRow
                  type="drop"
                  label="Drop-off"
                  location={getDropLocation(
                    selectedTrip
                  )}
                />
              </div>

              {/* =================================================
                  PHOTO
              ================================================= */}

              <VerificationPhoto
                trip={
                  selectedTrip
                }
              />

              {/* =================================================
                  PHOTO LOCATION
              ================================================= */}

              <PhotoLocation
                trip={
                  selectedTrip
                }
                photoLocation={
                  photoLocation
                }
              />

              {/* =================================================
                  CLOSE
              ================================================= */}

              <button
                type="button"
                onClick={() =>
                  setSelectedTrip(
                    null
                  )
                }
                className="
                  mt-5
                  flex
                  h-[50px]
                  w-full
                  items-center
                  justify-center
                  rounded-[14px]
                  bg-[#FFB400]
                  text-[13px]
                  font-bold
                  text-black
                  transition
                  hover:bg-[#F3A900]
                  active:scale-[0.99]
                "
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================
          BOTTOM NAV
      ================================================= */}

      <BottomNav
        active="trips"
        setActive={
          setTab
        }
      />
    </div>
  );
}

/* =========================================================
   STAT BOX
========================================================= */

function StatBox({
  value,
  label,
  border = false,
}) {
  return (
    <div
      className={`
        px-2
        py-4
        text-center

        ${
          border
            ? "border-l border-r border-[#F2E4B7]"
            : ""
        }
      `}
    >
      <p
        className="
          text-[22px]
          font-extrabold
          text-black
        "
      >
        {
          value
        }
      </p>

      <p
        className="
          mt-1
          text-[9px]
          font-semibold
          text-[#B77D00]
        "
      >
        {
          label
        }
      </p>
    </div>
  );
}

/* =========================================================
   TRIP CARD
========================================================= */

function TripCard({
  trip,
  onDetails,
  onRate,
}) {
  const tripDate =
    trip.startTime ||
    trip.createdAt;

  const driverName =
    getDriverName(
      trip
    );

  const rating =
    trip.driverRating ??
    trip.driver?.rating ??
    trip.rating ??
    null;

  const distance =
    getDistance(
      trip
    );

  const pickup =
    getPickupLocation(
      trip
    );

  const drop =
    getDropLocation(
      trip
    );

  const pickupTime =
    trip.pickupTime ||
    trip.startTime;

  const dropTime =
    trip.dropTime ||
    trip.endTime ||
    trip.completedAt;

  return (
    <article
      className="
        overflow-hidden
        rounded-[24px]
        border
        border-[#EEDC9E]
        bg-white
        shadow-[0_10px_28px_rgba(79,61,12,0.055)]
      "
    >
      {/* =================================================
          TOP ACCENT
      ================================================= */}

      <div
        className="
          h-[4px]
          bg-[#FFB400]
        "
      />

      <div
        className="
          p-4
        "
      >
        {/* =================================================
            DATE + STATUS
        ================================================= */}

        <div
          className="
            flex
            items-center
            justify-between
            gap-3
          "
        >
          <div
            className="
              flex
              items-center
              gap-2
            "
          >
            <div
              className="
                flex
                h-8
                w-8
                items-center
                justify-center
                rounded-[10px]
                bg-[#FFF4CE]
                text-[#C88B00]
              "
            >
              <CalendarDays
                size={
                  15
                }
              />
            </div>

            <div>
              <p
                className="
                  text-[13px]
                  font-bold
                  text-black
                "
              >
                {formatDate(
                  tripDate
                )}
              </p>

              <p
                className="
                  mt-[1px]
                  text-[8px]
                  text-zinc-400
                "
              >
                {trip.tripType
                  ? `${capitalize(
                      trip.tripType
                    )} Ride`
                  : "School Ride"}
              </p>
            </div>
          </div>

          <StatusBadge />
        </div>

        {/* =================================================
            DRIVER
        ================================================= */}

        <div
          className="
            mt-5
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
              border
              border-[#F1D784]
              bg-[#FFE9A8]
              text-black
            "
          >
            {trip
              ?.driver
              ?.profilePhoto ? (
              <img
                src={
                  trip.driver
                    .profilePhoto
                }
                alt={
                  driverName
                }
                className="
                  h-full
                  w-full
                  object-cover
                "
              />
            ) : (
              <User
                size={
                  25
                }
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
                text-[8px]
                uppercase
                tracking-[1px]
                text-zinc-400
              "
            >
              Driver
            </p>

            <h3
              className="
                mt-[2px]
                truncate
                text-[15px]
                font-bold
                text-black
              "
            >
              {
                driverName
              }
            </h3>

            <div
              className="
                mt-1
                flex
                items-center
                gap-1
              "
            >
              <Star
                size={
                  14
                }
                className="
                  fill-[#FFB400]
                  text-[#FFB400]
                "
              />

              <span
                className="
                  text-[10px]
                  font-semibold
                  text-zinc-500
                "
              >
                {rating !==
                null
                  ? Number(
                      rating
                    ).toFixed(
                      1
                    )
                  : "—"}
              </span>
            </div>
          </div>

          {/* =================================================
              DISTANCE
          ================================================= */}

          <div
            className="
              border-l
              border-[#F0E5C4]
              pl-3
            "
          >
            <Navigation
              size={
                20
              }
              className="
                text-[#D09400]
              "
            />

            <p
              className="
                mt-1
                whitespace-nowrap
                text-[12px]
                font-bold
                text-black
              "
            >
              {
                distance
              }
            </p>

            <p
              className="
                text-[7px]
                text-zinc-400
              "
            >
              Distance
            </p>
          </div>
        </div>

        {/* =================================================
            ROUTE
        ================================================= */}

        <div
          className="
            mt-5
            rounded-[18px]
            border
            border-[#F0E3BB]
            bg-[#FFFDF7]
            px-4
            py-4
          "
        >
          <TripRouteLine
            type="pickup"
            label="Pickup"
            location={
              pickup
            }
            time={formatTime(
              pickupTime
            )}
          />

          <div
            className="
              ml-[6px]
              h-7
              w-[2px]
              bg-[#FFB400]
            "
          />

          <TripRouteLine
            type="drop"
            label="Drop-off"
            location={
              drop
            }
            time={formatTime(
              dropTime
            )}
          />
        </div>

        {/* =================================================
            ACTIONS
        ================================================= */}

        <div
          className="
            mt-4
            grid
            grid-cols-2
            gap-3
          "
        >
          <button
            type="button"
            onClick={
              onDetails
            }
            className="
              flex
              h-[47px]
              items-center
              justify-center
              gap-2
              rounded-[13px]
              border
              border-[#E6D394]
              bg-white
              text-[12px]
              font-semibold
              text-black
              transition
              hover:bg-[#FFF8DF]
              active:scale-[0.98]
            "
          >
            <FileText
              size={
                16
              }
            />

            Details
          </button>

          <button
            type="button"
            onClick={
              onRate
            }
            className="
              flex
              h-[47px]
              items-center
              justify-center
              gap-2
              rounded-[13px]
              bg-[#FFB400]
              text-[12px]
              font-bold
              text-black
              transition
              hover:bg-[#F2A900]
              active:scale-[0.98]
            "
          >
            <Star
              size={
                16
              }
            />

            Rate Driver

            <ChevronRight
              size={
                16
              }
            />
          </button>
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge() {
  return (
    <div
      className="
        flex
        items-center
        gap-1.5
        rounded-full
        bg-[#FFF0B8]
        px-3
        py-1.5
      "
    >
      <CheckCircle2
        size={
          12
        }
        className="
          text-[#B87D00]
        "
      />

      <span
        className="
          text-[8px]
          font-extrabold
          text-[#8E6200]
        "
      >
        COMPLETED
      </span>
    </div>
  );
}

/* =========================================================
   ROUTE LINE
========================================================= */

function TripRouteLine({
  type,
  label,
  location,
  time,
}) {
  const pickup =
    type ===
    "pickup";

  return (
    <div
      className="
        grid
        grid-cols-[16px_1fr_auto]
        items-start
        gap-3
      "
    >
      <div
        className={`
          mt-1
          h-[13px]
          w-[13px]
          rounded-full
          border-2

          ${
            pickup
              ? "border-[#FFB400] bg-[#FFB400]"
              : "border-[#C89418] bg-[#FFF2C8]"
          }
        `}
      />

      <div
        className="
          min-w-0
        "
      >
        <p
          className="
            text-[10px]
            font-bold
            text-black
          "
        >
          {
            label
          }
        </p>

        <p
          className="
            mt-[2px]
            text-[10px]
            leading-4
            text-zinc-500
          "
        >
          {truncateAddress(
            location,
            48
          )}
        </p>
      </div>

      <span
        className="
          whitespace-nowrap
          pt-[2px]
          text-[10px]
          font-semibold
          text-zinc-500
        "
      >
        {
          time
        }
      </span>
    </div>
  );
}

/* =========================================================
   INFO TILE
========================================================= */

function InfoTile({
  label,
  value,
  icon,
}) {
  return (
    <div
      className="
        rounded-[17px]
        border
        border-[#EFE0AD]
        bg-[#FFF9E7]
        p-3
      "
    >
      <div
        className="
          flex
          items-center
          gap-2
          text-[#C78A00]
        "
      >
        {
          icon
        }

        <span
          className="
            text-[9px]
            font-bold
          "
        >
          {
            label
          }
        </span>
      </div>

      <p
        className="
          mt-2
          text-[11px]
          font-semibold
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

/* =========================================================
   ROUTE DETAIL
========================================================= */

function RouteDetailRow({
  type,
  label,
  location,
}) {
  const pickup =
    type ===
    "pickup";

  return (
    <div
      className="
        flex
        items-start
        gap-3
      "
    >
      <div
        className={`
          mt-[2px]
          h-[15px]
          w-[15px]
          shrink-0
          rounded-full
          border-2

          ${
            pickup
              ? "border-[#FFB400] bg-[#FFB400]"
              : "border-[#C58A00] bg-[#FFF1C2]"
          }
        `}
      />

      <div>
        <p
          className="
            text-[9px]
            font-bold
            uppercase
            tracking-[1px]
            text-[#B77D00]
          "
        >
          {
            label
          }
        </p>

        <p
          className="
            mt-1
            text-[11px]
            leading-5
            text-zinc-600
          "
        >
          {
            location
          }
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   VERIFICATION PHOTO
========================================================= */

function VerificationPhoto({
  trip,
}) {
  const verification =
    getVerification(
      trip
    );

  const label =
    trip.tripType ===
    "morning"
      ? "Morning Drop Photo"
      : "Afternoon Pickup Photo";

  return (
    <div
      className="
        mt-5
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
        <Image
          size={
            15
          }
          className="
            text-[#C98D00]
          "
        />

        <p
          className="
            text-[12px]
            font-bold
            text-black
          "
        >
          {
            label
          }
        </p>
      </div>

      {verification
        ?.imageUrl ? (
        <img
          src={
            verification.imageUrl
          }
          alt={
            label
          }
          className="
            h-[190px]
            w-full
            rounded-[18px]
            border
            border-[#EEDB9C]
            object-cover
          "
        />
      ) : (
        <div
          className="
            flex
            h-[150px]
            w-full
            flex-col
            items-center
            justify-center
            rounded-[18px]
            border
            border-[#EEDFAE]
            bg-[#FFF9E8]
          "
        >
          <Image
            size={
              27
            }
            className="
              text-[#D3B45A]
            "
          />

          <p
            className="
              mt-2
              text-[10px]
              text-zinc-400
            "
          >
            No photo available
          </p>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   PHOTO LOCATION
========================================================= */

function PhotoLocation({
  trip,
  photoLocation,
}) {
  const verification =
    getVerification(
      trip
    );

  if (
    verification
      ?.latitude ==
      null ||
    verification
      ?.longitude ==
      null
  ) {
    return null;
  }

  return (
    <div
      className="
        mt-4
        rounded-[18px]
        border
        border-[#EDDA9C]
        bg-[#FFF9E7]
        p-4
      "
    >
      <div
        className="
          flex
          items-center
          gap-2
        "
      >
        <MapPin
          size={
            15
          }
          className="
            text-[#C98C00]
          "
        />

        <p
          className="
            text-[11px]
            font-bold
            text-black
          "
        >
          Photo Captured At
        </p>
      </div>

      <div
        className="
          mt-2
        "
      >
        {photoLocation ===
        "Loading..." ? (
          <div
            className="
              flex
              items-center
              gap-2
            "
          >
            <Loader2
              size={
                15
              }
              className="
                animate-spin
                text-[#FFB400]
              "
            />

            <span
              className="
                text-[10px]
                text-zinc-500
              "
            >
              Loading location...
            </span>
          </div>
        ) : (
          <p
            className="
              text-[10px]
              leading-5
              text-zinc-600
            "
          >
            {
              photoLocation
            }
          </p>
        )}
      </div>

      <a
        href={`https://www.google.com/maps?q=${verification.latitude},${verification.longitude}`}
        target="_blank"
        rel="noreferrer"
        className="
          mt-3
          inline-flex
          items-center
          gap-1.5
          text-[10px]
          font-bold
          text-[#AD7700]
        "
      >
        <MapPin
          size={
            13
          }
        />

        View Location
      </a>
    </div>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState() {
  return (
    <div
      className="
        rounded-[24px]
        border
        border-[#EDD98F]
        bg-white
        px-6
        py-14
        text-center
        shadow-[0_8px_24px_rgba(82,65,16,0.05)]
      "
    >
      <div
        className="
          mx-auto
          flex
          h-20
          w-20
          items-center
          justify-center
          rounded-[24px]
          bg-[#FFF0BA]
          text-black
        "
      >
        <Route
          size={
            33
          }
        />
      </div>

      <h3
        className="
          mt-5
          text-[18px]
          font-bold
          text-black
        "
      >
        No completed rides yet
      </h3>

      <p
        className="
          mx-auto
          mt-2
          max-w-[240px]
          text-[11px]
          leading-5
          text-zinc-500
        "
      >
        Completed school rides
        will automatically appear
        here.
      </p>
    </div>
  );
}

/* =========================================================
   SKELETON
========================================================= */

function Skeleton() {
  return (
    <div
      className="
        rounded-[24px]
        border
        border-[#F0E3B9]
        bg-white
        p-4
      "
    >
      <div
        className="
          flex
          items-center
          justify-between
        "
      >
        <div
          className="
            h-4
            w-28
            animate-pulse
            rounded
            bg-[#FFF1BC]
          "
        />

        <div
          className="
            h-5
            w-20
            animate-pulse
            rounded-full
            bg-[#FFF4D3]
          "
        />
      </div>

      <div
        className="
          mt-5
          flex
          items-center
          gap-3
        "
      >
        <div
          className="
            h-14
            w-14
            animate-pulse
            rounded-[17px]
            bg-[#FFF1BC]
          "
        />

        <div
          className="
            flex-1
          "
        >
          <div
            className="
              h-4
              w-28
              animate-pulse
              rounded
              bg-[#F0E8D7]
            "
          />

          <div
            className="
              mt-2
              h-3
              w-16
              animate-pulse
              rounded
              bg-[#FFF1BC]
            "
          />
        </div>
      </div>

      <div
        className="
          mt-5
          h-[105px]
          animate-pulse
          rounded-[18px]
          bg-[#FFFDF7]
        "
      />

      <div
        className="
          mt-4
          grid
          grid-cols-2
          gap-3
        "
      >
        <div
          className="
            h-11
            animate-pulse
            rounded-xl
            bg-[#F2ECDD]
          "
        />

        <div
          className="
            h-11
            animate-pulse
            rounded-xl
            bg-[#FFF1BC]
          "
        />
      </div>
    </div>
  );
}

/* =========================================================
   HELPERS
========================================================= */

function getDriverName(
  trip
) {
  return (
    trip?.driverName ||
    trip?.driver?.name ||
    trip?.driver?.fullName ||
    "Driver"
  );
}

/* =========================================================
   PICKUP
========================================================= */

function getPickupLocation(
  trip
) {
  return (
    trip?.route?.from ||
    trip?.pickupLocation ||
    trip?.pickupAddress ||
    trip?.child
      ?.pickupLocation ||
    "Home"
  );
}

/* =========================================================
   DROP
========================================================= */

function getDropLocation(
  trip
) {
  return (
    trip?.route?.to ||
    trip?.dropoffLocation ||
    trip?.dropLocation ||
    trip?.child
      ?.dropoffLocation ||
    trip?.child?.school ||
    "School"
  );
}

/* =========================================================
   VERIFICATION
========================================================= */

function getVerification(
  trip
) {
  if (
    !trip
  ) {
    return null;
  }

  return trip.tripType ===
    "morning"
    ? trip.morningDrop
    : trip.afternoonPickup;
}

/* =========================================================
   DISTANCE
========================================================= */

function getDistance(
  trip
) {
  const distance =
    trip?.distance ??
    trip?.distanceKm ??
    trip?.route?.distance ??
    trip?.routeDistance;

  if (
    distance ===
      undefined ||
    distance ===
      null ||
    distance ===
      ""
  ) {
    return "-- km";
  }

  if (
    typeof distance ===
    "number"
  ) {
    return `${distance.toFixed(
      1
    )} km`;
  }

  const text =
    String(
      distance
    );

  return text
    .toLowerCase()
    .includes(
      "km"
    )
    ? text
    : `${text} km`;
}

/* =========================================================
   TRUNCATE
========================================================= */

function truncateAddress(
  address,
  maxLength = 60
) {
  if (
    !address
  ) {
    return "-";
  }

  const text =
    String(
      address
    );

  if (
    text.length <=
    maxLength
  ) {
    return text;
  }

  return `${text.slice(
    0,
    maxLength
  )}...`;
}

/* =========================================================
   DATE
========================================================= */

function formatDate(
  dateValue
) {
  if (
    !dateValue
  ) {
    return "N/A";
  }

  const date =
    new Date(
      dateValue
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "N/A";
  }

  return date.toLocaleDateString(
    "en-GB",
    {
      day:
        "2-digit",

      month:
        "short",

      year:
        "numeric",
    }
  );
}

/* =========================================================
   TIME
========================================================= */

function formatTime(
  dateValue
) {
  if (
    !dateValue
  ) {
    return "--:--";
  }

  /*
    Handle values such as:
    08:30
  */

  if (
    typeof dateValue ===
      "string" &&
    /^\d{2}:\d{2}$/.test(
      dateValue
    )
  ) {
    const [
      hour,
      minute,
    ] =
      dateValue.split(
        ":"
      );

    const hourNumber =
      Number(
        hour
      );

    const period =
      hourNumber >=
      12
        ? "PM"
        : "AM";

    const displayHour =
      hourNumber %
        12 ||
      12;

    return `${String(
      displayHour
    ).padStart(
      2,
      "0"
    )}:${minute} ${period}`;
  }

  const date =
    new Date(
      dateValue
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "--:--";
  }

  return date.toLocaleTimeString(
    "en-IN",
    {
      hour:
        "2-digit",

      minute:
        "2-digit",

      hour12:
        true,
    }
  );
}

/* =========================================================
   CAPITALIZE
========================================================= */

function capitalize(
  value
) {
  if (
    !value
  ) {
    return "";
  }

  return (
    value
      .charAt(0)
      .toUpperCase() +
    value.slice(
      1
    )
  );
}

export default Trips;