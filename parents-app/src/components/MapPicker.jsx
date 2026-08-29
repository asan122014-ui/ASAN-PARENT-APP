import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  ArrowLeft,
  Search,
  MapPin,
  Loader2,
  Check,
} from "lucide-react";

const GOOGLE_MAPS_API_KEY =
  import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

/* =========================================================
   MAP PICKER
========================================================= */

function MapPicker({
  initialLatitude = 17.385,
  initialLongitude = 78.486,

  onConfirm,
  onBack,
}) {
  const mapRef = useRef(null);
  const googleMapRef = useRef(null);
  const markerRef = useRef(null);
  const autocompleteServiceRef = useRef(null);
  const placesServiceRef = useRef(null);

  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);

  const [address, setAddress] = useState("");
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  const [loadingAddress, setLoadingAddress] =
    useState(false);

  const [mapReady, setMapReady] =
    useState(false);

  const [locatingUser, setLocatingUser] =
    useState(true);

  /* =======================================================
     LOAD GOOGLE MAPS
  ======================================================= */

  useEffect(() => {
    if (window.google?.maps) {
      getCurrentLocationAndInitialize();
      return;
    }

    const existingScript =
      document.querySelector(
        'script[data-asan-google-maps="true"]'
      );

    if (existingScript) {
      existingScript.addEventListener(
        "load",
        getCurrentLocationAndInitialize
      );

      return () => {
        existingScript.removeEventListener(
          "load",
          getCurrentLocationAndInitialize
        );
      };
    }

    const script =
      document.createElement("script");

    script.src =
      `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;

    script.async = true;
    script.defer = true;

    script.dataset.asanGoogleMaps =
      "true";

    script.addEventListener(
      "load",
      getCurrentLocationAndInitialize
    );

    document.head.appendChild(script);

    return () => {
      script.removeEventListener(
        "load",
        getCurrentLocationAndInitialize
      );
    };
  }, []);

  /* =======================================================
     GET CURRENT LOCATION FIRST
  ======================================================= */

  const getCurrentLocationAndInitialize = () => {
    if (!window.google?.maps) {
      return;
    }

    if (!navigator.geolocation) {
      initializeMap(
        Number(initialLatitude) || 17.385,
        Number(initialLongitude) || 78.486
      );

      setLocatingUser(false);

      return;
    }

    setLocatingUser(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat =
          position.coords.latitude;

        const lng =
          position.coords.longitude;

        initializeMap(
          lat,
          lng
        );

        setLocatingUser(false);
      },

      (error) => {
        console.warn(
          "Unable to get current location:",
          error
        );

        initializeMap(
          Number(initialLatitude) || 17.385,
          Number(initialLongitude) || 78.486
        );

        setLocatingUser(false);
      },

      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      }
    );
  };

  /* =======================================================
     INITIALIZE MAP
  ======================================================= */

  const initializeMap = (
    startingLatitude,
    startingLongitude
  ) => {
    if (
      !mapRef.current ||
      !window.google?.maps
    ) {
      return;
    }

    if (googleMapRef.current) {
      return;
    }

    const center = {
      lat:
        Number(
          startingLatitude
        ),

      lng:
        Number(
          startingLongitude
        ),
    };

    const map =
      new window.google.maps.Map(
        mapRef.current,
        {
          center,

          zoom: 17,

          disableDefaultUI: true,

          zoomControl: true,

          gestureHandling:
            "greedy",
        }
      );

    googleMapRef.current =
      map;

    /* =====================================================
       SELECTED LOCATION PIN
    ===================================================== */

    markerRef.current =
      new window.google.maps.Marker({
        position:
          center,

        map,

        draggable:
          true,
      });

    autocompleteServiceRef.current =
      new window.google.maps.places.AutocompleteService();

    placesServiceRef.current =
      new window.google.maps.places.PlacesService(
        map
      );

    setLatitude(
      center.lat
    );

    setLongitude(
      center.lng
    );

    /* =====================================================
       MAP CLICK / TAP
    ===================================================== */

    map.addListener(
      "click",
      (event) => {
        if (!event.latLng) {
          return;
        }

        selectPosition(
          event.latLng.lat(),
          event.latLng.lng(),
          false
        );
      }
    );

    /* =====================================================
       MARKER DRAG
    ===================================================== */

    markerRef.current.addListener(
      "dragend",
      (event) => {
        if (!event.latLng) {
          return;
        }

        selectPosition(
          event.latLng.lat(),
          event.latLng.lng(),
          false
        );
      }
    );

    /*
      IMPORTANT:

      No "idle" listener.

      Moving or zooming the map does NOT
      change the selected location.

      The pin moves only when:
      - user taps the map
      - user drags the pin
      - user selects a search result
    */

    setMapReady(true);

    reverseGeocode(
      center.lat,
      center.lng
    );
  };

  /* =======================================================
     SELECT POSITION
  ======================================================= */

  const selectPosition = (
    lat,
    lng,
    moveMap = false
  ) => {
    const position = {
      lat: Number(lat),
      lng: Number(lng),
    };

    setLatitude(
      position.lat
    );

    setLongitude(
      position.lng
    );

    markerRef.current?.setPosition(
      position
    );

    if (moveMap) {
      googleMapRef.current?.panTo(
        position
      );
    }

    reverseGeocode(
      position.lat,
      position.lng
    );
  };

  /* =======================================================
     REVERSE GEOCODE
  ======================================================= */

  const reverseGeocode = (
    lat,
    lng
  ) => {
    if (!window.google?.maps) {
      return;
    }

    setLoadingAddress(true);

    const geocoder =
      new window.google.maps.Geocoder();

    geocoder.geocode(
      {
        location: {
          lat,
          lng,
        },
      },

      (
        results,
        status
      ) => {
        setLoadingAddress(false);

        if (
          status === "OK" &&
          results?.[0]
        ) {
          const formattedAddress =
            results[0]
              .formatted_address ||
            "";

          setAddress(
            formattedAddress
          );

          setSearch(
            formattedAddress
          );
        }
      }
    );
  };

  /* =======================================================
     SEARCH
  ======================================================= */

  const handleSearchChange = (
    event
  ) => {
    const value =
      event.target.value;

    setSearch(value);

    if (
      !value.trim() ||
      !autocompleteServiceRef.current
    ) {
      setSuggestions([]);
      return;
    }

    autocompleteServiceRef.current
      .getPlacePredictions(
        {
          input: value,

          componentRestrictions: {
            country: "in",
          },
        },

        (
          predictions,
          status
        ) => {
          if (
            status ===
              window.google.maps
                .places
                .PlacesServiceStatus
                .OK &&
            predictions
          ) {
            setSuggestions(
              predictions
            );
          } else {
            setSuggestions([]);
          }
        }
      );
  };

  /* =======================================================
     SEARCH RESULT SELECT
  ======================================================= */

  const handleSuggestionSelect = (
    suggestion
  ) => {
    if (!placesServiceRef.current) {
      return;
    }

    placesServiceRef.current
      .getDetails(
        {
          placeId:
            suggestion.place_id,

          fields: [
            "geometry",
            "formatted_address",
            "name",
          ],
        },

        (
          place,
          status
        ) => {
          if (
            status !==
              window.google.maps
                .places
                .PlacesServiceStatus
                .OK ||
            !place?.geometry
              ?.location
          ) {
            return;
          }

          const lat =
            place.geometry
              .location
              .lat();

          const lng =
            place.geometry
              .location
              .lng();

          const selectedAddress =
            place.formatted_address ||
            suggestion.description ||
            "";

          setSearch(
            selectedAddress
          );

          setAddress(
            selectedAddress
          );

          setSuggestions([]);

          setLatitude(lat);
          setLongitude(lng);

          markerRef.current?.setPosition({
            lat,
            lng,
          });

          googleMapRef.current?.panTo({
            lat,
            lng,
          });

          googleMapRef.current?.setZoom(
            17
          );
        }
      );
  };

  /* =======================================================
     CONFIRM
  ======================================================= */

  const handleConfirm = () => {
    if (
      typeof onConfirm !==
      "function"
    ) {
      console.error(
        "MapPicker: onConfirm callback is missing."
      );

      return;
    }

    if (
      !address ||
      latitude === null ||
      longitude === null
    ) {
      console.error(
        "MapPicker: location is incomplete."
      );

      return;
    }

    onConfirm({
      address:
        String(address).trim(),

      latitude:
        Number(latitude),

      longitude:
        Number(longitude),
    });
  };

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div
      className="
        fixed
        inset-0
        z-[100]
        bg-[#FFF9EE]
      "
    >
      {/* MAP */}

      <div
        ref={mapRef}
        className="
          absolute
          inset-0
          h-full
          w-full
        "
      />

      {/* =================================================
          GETTING CURRENT LOCATION
      ================================================= */}

      {locatingUser && (
        <div
          className="
            pointer-events-none
            absolute
            inset-0
            z-30
            flex
            items-center
            justify-center
            bg-[#FFF9EE]/75
            backdrop-blur-sm
          "
        >
          <div
            className="
              flex
              items-center
              gap-3
              rounded-[18px]
              border
              border-[#E9D7A0]
              bg-white
              px-5
              py-4
              shadow-[0_12px_35px_rgba(101,76,17,0.13)]
            "
          >
            <Loader2
              size={19}
              className="
                animate-spin
                text-[#C58800]
              "
            />

            <div>
              <p
                className="
                  text-[12px]
                  font-extrabold
                  text-black
                "
              >
                Finding your location
              </p>

              <p
                className="
                  mt-0.5
                  text-[9px]
                  text-zinc-500
                "
              >
                Allow location access to start nearby
              </p>
            </div>
          </div>
        </div>
      )}

      {/* =================================================
          TOP CONTROLS
      ================================================= */}

      <div
        className="
          pointer-events-none
          absolute
          left-0
          right-0
          top-0
          z-20
          px-4
          pt-[max(18px,env(safe-area-inset-top))]
        "
      >
        <div
          className="
            pointer-events-auto
            mx-auto
            w-full
            max-w-[475px]
          "
        >
          <div
            className="
              flex
              items-center
              gap-3
            "
          >
            <button
              type="button"
              onClick={onBack}
              className="
                flex
                h-[50px]
                w-[50px]
                shrink-0
                items-center
                justify-center
                rounded-[17px]
                border
                border-[#E9D7A0]
                bg-white/95
                text-black
                shadow-[0_8px_24px_rgba(101,76,17,0.12)]
                backdrop-blur-xl
              "
            >
              <ArrowLeft
                size={21}
              />
            </button>

            <div
              className="
                relative
                flex-1
              "
            >
              <div
                className="
                  flex
                  h-[52px]
                  items-center
                  rounded-[17px]
                  border
                  border-[#E9D7A0]
                  bg-white/95
                  px-4
                  shadow-[0_8px_24px_rgba(101,76,17,0.12)]
                  backdrop-blur-xl
                "
              >
                <Search
                  size={18}
                  className="
                    shrink-0
                    text-[#C58800]
                  "
                />

                <input
                  type="text"
                  value={search}
                  onChange={
                    handleSearchChange
                  }
                  placeholder="Search location..."
                  className="
                    ml-3
                    min-w-0
                    flex-1
                    bg-transparent
                    text-[13px]
                    font-semibold
                    text-black
                    outline-none
                    placeholder:text-zinc-400
                  "
                />
              </div>

              {suggestions.length >
                0 && (
                <div
                  className="
                    absolute
                    left-0
                    right-0
                    top-[59px]
                    max-h-[260px]
                    overflow-y-auto
                    rounded-[18px]
                    border
                    border-[#E9D7A0]
                    bg-white
                    p-2
                    shadow-[0_15px_40px_rgba(70,50,10,0.16)]
                  "
                >
                  {suggestions.map(
                    (
                      suggestion
                    ) => (
                      <button
                        key={
                          suggestion.place_id
                        }
                        type="button"
                        onClick={() =>
                          handleSuggestionSelect(
                            suggestion
                          )
                        }
                        className="
                          flex
                          w-full
                          items-start
                          gap-3
                          rounded-[14px]
                          px-3
                          py-3
                          text-left
                          transition
                          hover:bg-[#FFF8E7]
                        "
                      >
                        <MapPin
                          size={17}
                          className="
                            mt-0.5
                            shrink-0
                            text-[#C58800]
                          "
                        />

                        <span
                          className="
                            text-[11px]
                            font-semibold
                            leading-5
                            text-zinc-700
                          "
                        >
                          {
                            suggestion.description
                          }
                        </span>
                      </button>
                    )
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* =================================================
          BOTTOM CARD
      ================================================= */}

      <div
        className="
          pointer-events-none
          absolute
          bottom-0
          left-0
          right-0
          z-20
          px-4
          pb-[max(18px,env(safe-area-inset-bottom))]
        "
      >
        <div
          className="
            pointer-events-auto
            mx-auto
            w-full
            max-w-[475px]
            overflow-hidden
            rounded-[28px]
            border
            border-[#EFCF70]
            bg-white
            shadow-[0_18px_45px_rgba(97,74,12,0.16)]
          "
        >
          <div
            className="
              h-[5px]
              w-full
              bg-[#FFB400]
            "
          />

          <div className="p-5">
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
                  h-[44px]
                  w-[44px]
                  shrink-0
                  items-center
                  justify-center
                  rounded-[15px]
                  bg-[#FFEAAE]
                  text-[#CF8D00]
                "
              >
                <MapPin
                  size={20}
                />
              </div>

              <div
                className="
                  min-w-0
                  flex-1
                "
              >
                <p
                  className="
                    text-[9px]
                    font-extrabold
                    uppercase
                    tracking-[1.4px]
                    text-[#B97E00]
                  "
                >
                  Selected Location
                </p>

                {loadingAddress ? (
                  <div
                    className="
                      mt-2
                      flex
                      items-center
                      gap-2
                      text-[11px]
                      text-zinc-500
                    "
                  >
                    <Loader2
                      size={14}
                      className="animate-spin"
                    />

                    Finding address...
                  </div>
                ) : (
                  <p
                    className="
                      mt-1
                      text-[11px]
                      font-semibold
                      leading-5
                      text-black
                    "
                  >
                    {address ||
                      "Tap a location on the map"}
                  </p>
                )}
              </div>
            </div>

            <button
              type="button"
              disabled={
                !mapReady ||
                !address ||
                latitude === null ||
                longitude === null
              }
              onClick={
                handleConfirm
              }
              className="
                mt-5
                flex
                h-[56px]
                w-full
                items-center
                justify-between
                rounded-[18px]
                bg-[#FFB400]
                px-3
                pl-5
                text-black
                shadow-[0_10px_24px_rgba(255,180,0,0.23)]
                disabled:opacity-50
              "
            >
              <div className="text-left">
                <p
                  className="
                    text-[13px]
                    font-extrabold
                  "
                >
                  Confirm Location
                </p>

                <p
                  className="
                    mt-0.5
                    text-[8px]
                    font-semibold
                    text-black/55
                  "
                >
                  Use this as your home location
                </p>
              </div>

              <div
                className="
                  flex
                  h-[40px]
                  w-[40px]
                  items-center
                  justify-center
                  rounded-[13px]
                  bg-black
                  text-white
                "
              >
                <Check
                  size={18}
                />
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MapPicker;