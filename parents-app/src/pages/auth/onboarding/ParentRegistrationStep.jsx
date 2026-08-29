import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  User,
  Phone,
  Mail,
  MapPin,
  Map,
  ArrowRight,
  Loader2,
  ShieldCheck,
  CheckCircle2,
  Search,
  Navigation,
  X,
  AlertCircle,
} from "lucide-react";

import {
  motion,
} from "framer-motion";

import {
  GoogleMap,
  Marker,
  Autocomplete,
  useJsApiLoader,
} from "@react-google-maps/api";

import OnboardingLayout from "./OnboardingLayout";

/* =========================================================
   GOOGLE MAPS
========================================================= */

const GOOGLE_MAPS_API_KEY =
  import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const GOOGLE_MAP_LIBRARIES = [
  "places",
];

/* =========================================================
   FALLBACK LOCATION

   Used ONLY when:
   - GPS permission is denied
   - GPS is unavailable
   - GPS times out
   - Browser/device does not support location

   Hyderabad, Telangana
========================================================= */

const FALLBACK_LOCATION = {
  lat: 17.385044,
  lng: 78.486671,
};

const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

/* =========================================================
   COORDINATE HELPERS
========================================================= */

/*
  IMPORTANT:

  Number(null) === 0
  Number("") === 0

  So never use Number(value) directly to decide
  whether an optional coordinate exists.
*/

const parseCoordinate = (
  value
) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const number =
    Number(value);

  if (
    !Number.isFinite(
      number
    )
  ) {
    return null;
  }

  return number;
};

const getValidCoordinates = (
  latitude,
  longitude
) => {
  const lat =
    parseCoordinate(
      latitude
    );

  const lng =
    parseCoordinate(
      longitude
    );

  if (
    lat === null ||
    lng === null
  ) {
    return null;
  }

  if (
    lat < -90 ||
    lat > 90 ||
    lng < -180 ||
    lng > 180
  ) {
    return null;
  }

  /*
    0,0 is technically a valid coordinate,
    but in this application it should never
    represent a Parent's selected home address.

    Reject it explicitly.
  */

  if (
    lat === 0 &&
    lng === 0
  ) {
    return null;
  }

  return {
    lat,
    lng,
  };
};

/* =========================================================
   PARENT REGISTRATION STEP
========================================================= */

function ParentRegistrationStep({
  form,
  setForm,

  onContinue,
  onSignIn,
  onBack,

  loading = false,
  error = "",
}) {
  /* =======================================================
     GOOGLE MAPS
  ======================================================= */

  const {
    isLoaded: googleMapsLoaded,

    loadError:
      googleMapsLoadError,
  } = useJsApiLoader({
    id:
      "asan-parent-google-map",

    googleMapsApiKey:
      GOOGLE_MAPS_API_KEY ||
      "",

    libraries:
      GOOGLE_MAP_LIBRARIES,
  });

  /* =======================================================
     EXISTING SAVED LOCATION
  ======================================================= */

  const existingLocation =
    getValidCoordinates(
      form?.latitude,
      form?.longitude
    );

  /* =======================================================
     MAP STATE
  ======================================================= */

  const [
    showMapPicker,
    setShowMapPicker,
  ] = useState(false);

  /*
    Never initialize to 0,0.

    Existing saved location first.
    Otherwise Hyderabad fallback temporarily.

    GPS will replace this as soon as
    current location is obtained.
  */

  const [
    mapLocation,
    setMapLocation,
  ] = useState(
    existingLocation ||
      FALLBACK_LOCATION
  );

  const [
    mapAddress,
    setMapAddress,
  ] = useState(
    form?.address || ""
  );

  const [
    searchValue,
    setSearchValue,
  ] = useState("");

  const [
    locating,
    setLocating,
  ] = useState(false);

  const [
    geocoding,
    setGeocoding,
  ] = useState(false);

  const [
    initialLocationChecked,
    setInitialLocationChecked,
  ] = useState(
    Boolean(
      existingLocation
    )
  );

  const [
    usingFallback,
    setUsingFallback,
  ] = useState(false);

  const [
    locationMessage,
    setLocationMessage,
  ] = useState("");

  /* =======================================================
     REFS
  ======================================================= */

  const mapRef =
    useRef(null);

  const autocompleteRef =
    useRef(null);

  const initialLocationStartedRef =
    useRef(false);

  /* =======================================================
     FIELD UPDATE
  ======================================================= */

  const updateField = (
    field,
    value
  ) => {
    setForm(
      (
        previous
      ) => ({
        ...previous,

        [field]:
          value,
      })
    );
  };

  /* =======================================================
     PHONE
  ======================================================= */

  const normalizePhone = (
    value
  ) => {
    return String(
      value || ""
    )
      .replace(
        /\D/g,
        ""
      )
      .slice(
        0,
        10
      );
  };

  /* =======================================================
     EMAIL
  ======================================================= */

  const normalizeEmail = (
    value
  ) => {
    return String(
      value || ""
    ).trimStart();
  };

  /* =======================================================
     VALIDATION
  ======================================================= */

  const validName =
    String(
      form?.name || ""
    )
      .trim()
      .length >= 2;

  const validPhone =
    /^[6-9]\d{9}$/.test(
      normalizePhone(
        form?.phone
      )
    );

  const validEmail =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      String(
        form?.email || ""
      )
        .trim()
        .toLowerCase()
    );

  const validAddress =
    Boolean(
      String(
        form?.address || ""
      ).trim()
    );

  const validFormLocation =
    getValidCoordinates(
      form?.latitude,
      form?.longitude
    );

  const validLocation =
    Boolean(
      validFormLocation
    );

  const canContinue =
    validName &&
    validPhone &&
    validEmail &&
    validAddress &&
    validLocation;

  /* =======================================================
     PHONE CHANGE
  ======================================================= */

  const handlePhoneChange = (
    event
  ) => {
    updateField(
      "phone",

      normalizePhone(
        event.target.value
      )
    );
  };

  /* =======================================================
     EMAIL CHANGE
  ======================================================= */

  const handleEmailChange = (
    event
  ) => {
    updateField(
      "email",

      normalizeEmail(
        event.target.value
      )
    );
  };

  /* =======================================================
     REVERSE GEOCODING
  ======================================================= */

  const reverseGeocode =
    async (
      lat,
      lng
    ) => {
      if (
        !googleMapsLoaded ||
        !window.google?.maps
      ) {
        return "";
      }

      try {
        setGeocoding(
          true
        );

        const geocoder =
          new window.google.maps
            .Geocoder();

        const response =
          await geocoder.geocode({
            location: {
              lat:
                Number(lat),

              lng:
                Number(lng),
            },
          });

        return (
          response
            ?.results?.[0]
            ?.formatted_address ||
          ""
        );
      } catch (
        geocodeError
      ) {
        console.error(
          "Reverse geocoding failed:",
          geocodeError
        );

        return "";
      } finally {
        setGeocoding(
          false
        );
      }
    };

  /* =======================================================
     APPLY FALLBACK
  ======================================================= */

  const applyFallbackLocation =
    async (
      message = ""
    ) => {
      setMapLocation(
        FALLBACK_LOCATION
      );

      setUsingFallback(
        true
      );

      setLocationMessage(
        message ||
          "Current location unavailable. Showing Hyderabad as fallback."
      );

      if (
        mapRef.current
      ) {
        mapRef.current.panTo(
          FALLBACK_LOCATION
        );

        mapRef.current.setZoom(
          13
        );
      }

      /*
        We don't automatically set Hyderabad
        as the Parent's home address.

        It is only the map fallback.
      */

      setInitialLocationChecked(
        true
      );
    };

  /* =======================================================
     GET CURRENT LOCATION
  ======================================================= */

  const fetchCurrentLocation =
    async ({
      showErrors = false,
    } = {}) => {
      if (
        !navigator.geolocation
      ) {
        await applyFallbackLocation(
          "Location services are unavailable. Showing Hyderabad as fallback."
        );

        if (
          showErrors
        ) {
          alert(
            "Location services are not supported on this device."
          );
        }

        return;
      }

      setLocating(
        true
      );

      setLocationMessage(
        "Finding your current location..."
      );

      navigator.geolocation.getCurrentPosition(
        async (
          position
        ) => {
          try {
            const lat =
              position.coords
                .latitude;

            const lng =
              position.coords
                .longitude;

            const location =
              getValidCoordinates(
                lat,
                lng
              );

            if (
              !location
            ) {
              await applyFallbackLocation(
                "Invalid GPS coordinates received. Showing Hyderabad as fallback."
              );

              return;
            }

            setMapLocation(
              location
            );

            setUsingFallback(
              false
            );

            setLocationMessage(
              "Current location detected."
            );

            if (
              mapRef.current
            ) {
              mapRef.current.panTo(
                location
              );

              mapRef.current.setZoom(
                17
              );
            }

            /*
              Geocoder may not yet be available
              during the earliest location request.

              If Maps is already loaded, resolve
              the address now.
            */

            if (
              googleMapsLoaded &&
              window.google
                ?.maps
            ) {
              const address =
                await reverseGeocode(
                  location.lat,
                  location.lng
                );

              if (
                address
              ) {
                setMapAddress(
                  address
                );

                setSearchValue(
                  address
                );
              }
            }

            setInitialLocationChecked(
              true
            );
          } finally {
            setLocating(
              false
            );
          }
        },

        async (
          geoError
        ) => {
          console.warn(
            "Current location failed:",
            geoError
          );

          setLocating(
            false
          );

          let message =
            "Unable to detect your current location.";

          if (
            geoError.code === 1
          ) {
            message =
              "Location permission was denied. Showing Hyderabad as fallback.";
          } else if (
            geoError.code === 2
          ) {
            message =
              "Your current location is unavailable. Showing Hyderabad as fallback.";
          } else if (
            geoError.code === 3
          ) {
            message =
              "Location request timed out. Showing Hyderabad as fallback.";
          }

          await applyFallbackLocation(
            message
          );

          if (
            showErrors
          ) {
            if (
              geoError.code === 1
            ) {
              alert(
                "Location permission is disabled. Please enable location access for ASANRIDES."
              );
            } else if (
              geoError.code === 3
            ) {
              alert(
                "Location request timed out. Please make sure GPS is enabled and try again."
              );
            } else {
              alert(
                "Unable to detect your current location."
              );
            }
          }
        },

        {
          enableHighAccuracy:
            true,

          timeout:
            20000,

          maximumAge:
            5000,
        }
      );
    };

  /* =======================================================
     FETCH CURRENT LOCATION AT SCREEN START
  ======================================================= */

  useEffect(() => {
    /*
      If the Parent already selected a location
      before navigating away/back, preserve it.

      Otherwise fetch GPS automatically.
    */

    const savedLocation =
      getValidCoordinates(
        form?.latitude,
        form?.longitude
      );

    if (
      savedLocation
    ) {
      setMapLocation(
        savedLocation
      );

      setMapAddress(
        form?.address || ""
      );

      setInitialLocationChecked(
        true
      );

      setUsingFallback(
        false
      );

      return;
    }

    if (
      initialLocationStartedRef
        .current
    ) {
      return;
    }

    initialLocationStartedRef.current =
      true;

    fetchCurrentLocation({
      showErrors:
        false,
    });
  }, []);

  /* =======================================================
     WHEN GOOGLE MAPS FINISHES LOADING

     GPS may have been obtained before Google
     Maps was ready. Resolve its address here.
  ======================================================= */

  useEffect(() => {
    if (
      !googleMapsLoaded ||
      !window.google?.maps ||
      !initialLocationChecked
    ) {
      return;
    }

    /*
      Don't overwrite an existing address.
    */

    if (
      mapAddress?.trim()
    ) {
      return;
    }

    if (
      usingFallback
    ) {
      return;
    }

    const resolveInitialAddress =
      async () => {
        const location =
          getValidCoordinates(
            mapLocation?.lat,
            mapLocation?.lng
          );

        if (
          !location
        ) {
          return;
        }

        const address =
          await reverseGeocode(
            location.lat,
            location.lng
          );

        if (
          address
        ) {
          setMapAddress(
            address
          );

          setSearchValue(
            address
          );
        }
      };

    resolveInitialAddress();
  }, [
    googleMapsLoaded,
    initialLocationChecked,
  ]);

  /* =======================================================
     OPEN MAP PICKER
  ======================================================= */

  const openMapPicker =
    async () => {
      const savedLocation =
        getValidCoordinates(
          form?.latitude,
          form?.longitude
        );

      /*
        Existing manually selected location
        has highest priority.
      */

      if (
        savedLocation
      ) {
        setMapLocation(
          savedLocation
        );

        setMapAddress(
          form?.address || ""
        );

        setSearchValue(
          form?.address || ""
        );

        setUsingFallback(
          false
        );
      }

      setShowMapPicker(
        true
      );

      /*
        If location was never checked,
        attempt GPS now as well.
      */

      if (
        !savedLocation &&
        !initialLocationChecked
      ) {
        await fetchCurrentLocation({
          showErrors:
            false,
        });
      }
    };

  /* =======================================================
     AUTOCOMPLETE
  ======================================================= */

  const handleAutocompleteLoad =
    (
      autocomplete
    ) => {
      autocompleteRef.current =
        autocomplete;
    };

  const handleAutocompleteUnmount =
    () => {
      autocompleteRef.current =
        null;
    };

  /* =======================================================
     PLACE SELECTED
  ======================================================= */

  const handlePlaceChanged =
    () => {
      if (
        !autocompleteRef.current
      ) {
        return;
      }

      const place =
        autocompleteRef.current
          .getPlace();

      const location =
        place?.geometry
          ?.location;

      if (
        !location
      ) {
        alert(
          "Please select a location from the Google suggestions."
        );

        return;
      }

      const selectedLocation =
        getValidCoordinates(
          location.lat(),
          location.lng()
        );

      if (
        !selectedLocation
      ) {
        alert(
          "Unable to determine coordinates for this location."
        );

        return;
      }

      const selectedAddress =
        place.formatted_address ||
        place.name ||
        searchValue ||
        "";

      setMapLocation(
        selectedLocation
      );

      setMapAddress(
        selectedAddress
      );

      setSearchValue(
        selectedAddress
      );

      setUsingFallback(
        false
      );

      setLocationMessage(
        "Search location selected."
      );

      if (
        mapRef.current
      ) {
        mapRef.current.panTo(
          selectedLocation
        );

        mapRef.current.setZoom(
          17
        );
      }
    };

  /* =======================================================
     MAP CLICK
  ======================================================= */

  const handleMapClick =
    async (
      event
    ) => {
      if (
        !event?.latLng
      ) {
        return;
      }

      const location =
        getValidCoordinates(
          event.latLng.lat(),
          event.latLng.lng()
        );

      if (
        !location
      ) {
        return;
      }

      setMapLocation(
        location
      );

      setUsingFallback(
        false
      );

      setLocationMessage(
        "Location selected on map."
      );

      const address =
        await reverseGeocode(
          location.lat,
          location.lng
        );

      if (
        address
      ) {
        setMapAddress(
          address
        );

        setSearchValue(
          address
        );
      }
    };

  /* =======================================================
     MARKER DRAG
  ======================================================= */

  const handleMarkerDragEnd =
    async (
      event
    ) => {
      if (
        !event?.latLng
      ) {
        return;
      }

      const location =
        getValidCoordinates(
          event.latLng.lat(),
          event.latLng.lng()
        );

      if (
        !location
      ) {
        return;
      }

      setMapLocation(
        location
      );

      setUsingFallback(
        false
      );

      setLocationMessage(
        "Location marker moved."
      );

      const address =
        await reverseGeocode(
          location.lat,
          location.lng
        );

      if (
        address
      ) {
        setMapAddress(
          address
        );

        setSearchValue(
          address
        );
      }
    };

  /* =======================================================
     CURRENT LOCATION BUTTON
  ======================================================= */

  const useCurrentLocation =
    async () => {
      await fetchCurrentLocation({
        showErrors:
          true,
      });
    };

  /* =======================================================
     CONFIRM LOCATION
  ======================================================= */

  const confirmMapLocation =
    () => {
      const location =
        getValidCoordinates(
          mapLocation?.lat,
          mapLocation?.lng
        );

      if (
        !location
      ) {
        alert(
          "Please select a valid location."
        );

        return;
      }

      /*
        Prevent fallback Hyderabad from being saved
        accidentally unless the user actually interacted
        with it / selected an address.

        Most importantly, fallback alone is not treated
        as the Parent's home address.
      */

      if (
        usingFallback &&
        !mapAddress?.trim()
      ) {
        alert(
          "Your current location could not be detected. Please search for your home address or select it manually on the map."
        );

        return;
      }

      const address =
        String(
          mapAddress || ""
        ).trim();

      if (
        !address
      ) {
        alert(
          "Please search for a location or select a point on the map."
        );

        return;
      }

      setForm(
        (
          previous
        ) => ({
          ...previous,

          address,

          latitude:
            location.lat,

          longitude:
            location.lng,
        })
      );

      setUsingFallback(
        false
      );

      setShowMapPicker(
        false
      );
    };

  /* =======================================================
     SUBMIT
  ======================================================= */

  const handleSubmit = (
    event
  ) => {
    event.preventDefault();

    if (
      !canContinue ||
      loading
    ) {
      return;
    }

    if (
      typeof onContinue ===
      "function"
    ) {
      onContinue();
    }
  };

  /* =======================================================
     DISPLAY COORDINATES
  ======================================================= */

  const displayLatitude =
    validFormLocation?.lat;

  const displayLongitude =
    validFormLocation?.lng;

  /* =======================================================
     UI
  ======================================================= */

  return (
    <>
      <OnboardingLayout
        showBack
        onBack={
          onBack
        }
        showBrand
        compactBrand={false}
        eyebrow="Parent Registration"
        title="Create Your Account"
        subtitle="Set up your Parent profile and home location to continue."
      >
        <form
          onSubmit={
            handleSubmit
          }
          className="w-full"
        >
          {/* =================================================
              HEADER
          ================================================= */}

          <div
            className="
              flex
              items-start
              justify-between
              gap-4
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
                <User
                  size={14}
                  className="text-[#CF9100]"
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
                  Parent Profile
                </p>
              </div>

              <h2
                className="
                  mt-1
                  text-[21px]
                  font-extrabold
                  tracking-[-0.3px]
                  text-black
                "
              >
                Your details
              </h2>

              <p
                className="
                  mt-1.5
                  max-w-[275px]
                  text-[10px]
                  leading-[17px]
                  text-zinc-500
                "
              >
                Enter your information and choose your exact home location.
              </p>
            </div>

            <div
              className="
                flex
                h-[48px]
                w-[48px]
                shrink-0
                items-center
                justify-center
                rounded-[16px]
                bg-[#FFB400]
                text-black
                shadow-[0_8px_20px_rgba(255,180,0,0.20)]
              "
            >
              <ShieldCheck
                size={21}
                strokeWidth={2}
              />
            </div>
          </div>

          {/* =================================================
              FULL NAME
          ================================================= */}

          <div className="mt-7">
            <label
              htmlFor="parent-name"
              className="
                ml-1
                text-[9px]
                font-extrabold
                uppercase
                tracking-[1.4px]
                text-[#C58800]
              "
            >
              Full Name
            </label>

            <div
              className="
                mt-2
                flex
                h-[62px]
                items-center
                rounded-[20px]
                border
                border-[#E8D7A5]
                bg-[#FFFDF8]
                px-3
                transition
                focus-within:border-[#FFB400]
                focus-within:bg-white
                focus-within:ring-4
                focus-within:ring-[#FFB400]/10
              "
            >
              <div
                className="
                  flex
                  h-[42px]
                  w-[42px]
                  shrink-0
                  items-center
                  justify-center
                  rounded-[14px]
                  bg-[#FFEAAE]
                  text-[#CF8D00]
                "
              >
                <User
                  size={19}
                />
              </div>

              <input
                id="parent-name"
                type="text"
                autoComplete="name"
                placeholder="Enter your full name"
                value={
                  form?.name || ""
                }
                disabled={
                  loading
                }
                onChange={(
                  event
                ) =>
                  updateField(
                    "name",
                    event.target.value
                  )
                }
                className="
                  ml-3
                  h-full
                  min-w-0
                  flex-1
                  bg-transparent
                  text-[14px]
                  font-semibold
                  text-black
                  outline-none
                  placeholder:font-medium
                  placeholder:text-zinc-400
                  disabled:opacity-60
                "
              />
            </div>
          </div>

          {/* =================================================
              EMAIL
          ================================================= */}

          <div className="mt-5">
            <label
              htmlFor="parent-email"
              className="
                ml-1
                text-[9px]
                font-extrabold
                uppercase
                tracking-[1.4px]
                text-[#C58800]
              "
            >
              Email Address
            </label>

            <div
              className="
                mt-2
                flex
                h-[62px]
                items-center
                rounded-[20px]
                border
                border-[#E8D7A5]
                bg-[#FFFDF8]
                px-3
                transition
                focus-within:border-[#FFB400]
                focus-within:bg-white
                focus-within:ring-4
                focus-within:ring-[#FFB400]/10
              "
            >
              <div
                className="
                  flex
                  h-[42px]
                  w-[42px]
                  shrink-0
                  items-center
                  justify-center
                  rounded-[14px]
                  bg-[#FFEAAE]
                  text-[#CF8D00]
                "
              >
                <Mail
                  size={18}
                />
              </div>

              <input
                id="parent-email"
                type="email"
                autoComplete="email"
                inputMode="email"
                placeholder="parent@example.com"
                value={
                  form?.email || ""
                }
                disabled={
                  loading
                }
                onChange={
                  handleEmailChange
                }
                className="
                  ml-3
                  h-full
                  min-w-0
                  flex-1
                  bg-transparent
                  text-[14px]
                  font-semibold
                  text-black
                  outline-none
                  placeholder:font-medium
                  placeholder:text-zinc-400
                  disabled:opacity-60
                "
              />
            </div>

            <p
              className="
                mt-2
                px-1
                text-[9px]
                leading-4
                text-zinc-400
              "
            >
              A 6-digit verification code will be sent to this email.
            </p>
          </div>

          {/* =================================================
              PHONE
          ================================================= */}

          <div className="mt-5">
            <label
              htmlFor="parent-phone"
              className="
                ml-1
                text-[9px]
                font-extrabold
                uppercase
                tracking-[1.4px]
                text-[#C58800]
              "
            >
              Mobile Number
            </label>

            <div
              className="
                mt-2
                flex
                h-[62px]
                items-center
                rounded-[20px]
                border
                border-[#E8D7A5]
                bg-[#FFFDF8]
                px-3
                transition
                focus-within:border-[#FFB400]
                focus-within:bg-white
                focus-within:ring-4
                focus-within:ring-[#FFB400]/10
              "
            >
              <div
                className="
                  flex
                  h-[42px]
                  w-[42px]
                  shrink-0
                  items-center
                  justify-center
                  rounded-[14px]
                  bg-[#FFEAAE]
                  text-[#CF8D00]
                "
              >
                <Phone
                  size={18}
                />
              </div>

              <div
                className="
                  ml-3
                  flex
                  h-[34px]
                  items-center
                  border-r
                  border-[#E8D7A5]
                  pr-3
                  text-[13px]
                  font-extrabold
                  text-black
                "
              >
                +91
              </div>

              <input
                id="parent-phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                placeholder="Mobile number"
                value={
                  form?.phone || ""
                }
                maxLength={10}
                disabled={
                  loading
                }
                onChange={
                  handlePhoneChange
                }
                className="
                  ml-3
                  h-full
                  min-w-0
                  flex-1
                  bg-transparent
                  text-[14px]
                  font-semibold
                  tracking-[0.04em]
                  text-black
                  outline-none
                  placeholder:font-medium
                  placeholder:tracking-normal
                  placeholder:text-zinc-400
                  disabled:opacity-60
                "
              />
            </div>

            <p
              className="
                mt-2
                px-1
                text-[9px]
                leading-4
                text-zinc-400
              "
            >
              Used for Parent profile and contact information.
            </p>
          </div>

          {/* =================================================
              HOME LOCATION
          ================================================= */}

          <div className="mt-6">
            <div
              className="
                mb-2
                flex
                items-center
                justify-between
                px-1
              "
            >
              <label
                className="
                  text-[9px]
                  font-extrabold
                  uppercase
                  tracking-[1.4px]
                  text-[#C58800]
                "
              >
                Home Location
              </label>

              {validLocation && (
                <div
                  className="
                    flex
                    items-center
                    gap-1
                    text-[8px]
                    font-extrabold
                    uppercase
                    tracking-[1px]
                    text-emerald-600
                  "
                >
                  <CheckCircle2
                    size={12}
                  />

                  Selected
                </div>
              )}
            </div>

            <motion.button
              type="button"
              disabled={
                loading
              }
              onClick={
                openMapPicker
              }
              whileTap={{
                scale:
                  0.985,
              }}
              className="
                relative
                flex
                min-h-[76px]
                w-full
                items-center
                gap-3
                overflow-hidden
                rounded-[22px]
                border
                border-[#EFCF70]
                bg-[#FFF8E7]
                px-4
                text-left
                shadow-[0_6px_18px_rgba(97,74,12,0.05)]
                disabled:opacity-50
              "
            >
              <div
                className="
                  flex
                  h-[46px]
                  w-[46px]
                  shrink-0
                  items-center
                  justify-center
                  rounded-[15px]
                  bg-[#FFB400]
                  text-black
                "
              >
                {locating &&
                !validLocation ? (
                  <Loader2
                    size={19}
                    className="animate-spin"
                  />
                ) : (
                  <Map
                    size={19}
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
                    font-extrabold
                    uppercase
                    tracking-[1px]
                    text-[#B97E00]
                  "
                >
                  Home Address
                </p>

                <p
                  className="
                    mt-1
                    line-clamp-2
                    text-[11px]
                    font-semibold
                    leading-[16px]
                    text-black
                  "
                >
                  {form?.address
                    ? form.address
                    : locating
                    ? "Detecting your current location..."
                    : "Search and select your home location"}
                </p>
              </div>

              <ArrowRight
                size={17}
                className="
                  shrink-0
                  text-[#B97E00]
                "
              />
            </motion.button>

            {validLocation &&
              displayLatitude !==
                undefined &&
              displayLongitude !==
                undefined && (
                <motion.div
                  initial={{
                    opacity:
                      0,

                    y:
                      -3,
                  }}
                  animate={{
                    opacity:
                      1,

                    y:
                      0,
                  }}
                  className="
                    mt-3
                    flex
                    items-start
                    gap-2
                    rounded-[15px]
                    border
                    border-emerald-100
                    bg-emerald-50
                    px-3
                    py-3
                  "
                >
                  <MapPin
                    size={15}
                    className="
                      mt-0.5
                      shrink-0
                      text-emerald-600
                    "
                  />

                  <div>
                    <p
                      className="
                        text-[9px]
                        font-extrabold
                        uppercase
                        tracking-[1px]
                        text-emerald-700
                      "
                    >
                      Home location selected
                    </p>

                    <p
                      className="
                        mt-1
                        text-[8px]
                        leading-4
                        text-emerald-700/70
                      "
                    >
                      {displayLatitude.toFixed(
                        5
                      )}
                      {", "}
                      {displayLongitude.toFixed(
                        5
                      )}
                    </p>
                  </div>
                </motion.div>
              )}
          </div>

          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <motion.div
              initial={{
                opacity: 0,
                y: -4,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              className="
                mt-5
                rounded-[16px]
                border
                border-red-200
                bg-red-50
                px-4
                py-3
              "
            >
              <p
                className="
                  text-[11px]
                  font-semibold
                  leading-5
                  text-red-600
                "
              >
                {error}
              </p>
            </motion.div>
          )}

          {/* =================================================
              CONTINUE
          ================================================= */}

          <motion.button
            type="submit"
            disabled={
              !canContinue ||
              loading
            }
            whileTap={
              loading
                ? {}
                : {
                    scale:
                      0.985,
                  }
            }
            className="
              mt-7
              flex
              h-[60px]
              w-full
              items-center
              justify-between
              rounded-[20px]
              bg-[#FFB400]
              px-3
              pl-5
              text-black
              shadow-[0_10px_24px_rgba(255,180,0,0.23)]
              transition
              hover:bg-[#FFBE24]
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            <div className="text-left">
              <p
                className="
                  text-[14px]
                  font-extrabold
                  leading-none
                "
              >
                {loading
                  ? "Sending OTP..."
                  : "Continue"}
              </p>

              {!loading && (
                <p
                  className="
                    mt-1
                    text-[9px]
                    font-semibold
                    text-black/55
                  "
                >
                  Verify your email to create account
                </p>
              )}
            </div>

            <div
              className="
                flex
                h-[42px]
                w-[42px]
                shrink-0
                items-center
                justify-center
                rounded-[14px]
                bg-black
                text-white
              "
            >
              {loading ? (
                <Loader2
                  size={18}
                  className="animate-spin"
                />
              ) : (
                <ArrowRight
                  size={18}
                />
              )}
            </div>
          </motion.button>

          {/* =================================================
              SIGN IN
          ================================================= */}

          <div
            className="
              mt-6
              flex
              items-center
              justify-center
              gap-1.5
              pb-1
            "
          >
            <span
              className="
                text-[10px]
                font-medium
                text-zinc-500
              "
            >
              Already registered?
            </span>

            <button
              type="button"
              disabled={
                loading
              }
              onClick={
                onSignIn
              }
              className="
                text-[10px]
                font-extrabold
                text-[#B77D00]
                transition
                hover:text-[#8E6200]
                disabled:opacity-50
              "
            >
              Sign In
            </button>
          </div>
        </form>
      </OnboardingLayout>

      {/* =====================================================
          MAP PICKER
      ===================================================== */}

      {showMapPicker && (
        <div
          className="
            fixed
            inset-0
            z-[10000]
            bg-[#FFFEFB]
          "
        >
          <div
            className="
              mx-auto
              flex
              h-full
              w-full
              max-w-[475px]
              flex-col
              bg-[#FFFEFB]
            "
          >
            {/* =================================================
                HEADER
            ================================================= */}

            <div
              className="
                relative
                z-30
                border-b
                border-[#EEE3C3]
                bg-[#FFF8DF]
                px-4
                pb-4
                pt-5
              "
            >
              <div
                className="
                  flex
                  items-center
                  justify-between
                  gap-3
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
                    Home Location
                  </p>

                  <h2
                    className="
                      mt-1
                      text-[20px]
                      font-extrabold
                      text-black
                    "
                  >
                    Select Address
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setShowMapPicker(
                      false
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
                    border-[#E8D48D]
                    bg-white
                    text-black
                  "
                >
                  <X
                    size={18}
                  />
                </button>
              </div>

              {/* ===============================================
                  SEARCH
              =============================================== */}

              <div className="mt-4">
                {!GOOGLE_MAPS_API_KEY ? (
                  <MapErrorCard
                    message="Google Maps API key is missing. Add VITE_GOOGLE_MAPS_API_KEY to your environment file."
                  />
                ) : googleMapsLoadError ? (
                  <MapErrorCard
                    message="Google Maps could not be loaded. Check your API key, restrictions and enabled Google APIs."
                  />
                ) : !googleMapsLoaded ? (
                  <div
                    className="
                      flex
                      h-[54px]
                      items-center
                      justify-center
                      gap-2
                      rounded-[16px]
                      border
                      border-[#E7D79F]
                      bg-white
                    "
                  >
                    <Loader2
                      size={17}
                      className="
                        animate-spin
                        text-[#B77D00]
                      "
                    />

                    <span
                      className="
                        text-[10px]
                        font-semibold
                        text-zinc-500
                      "
                    >
                      Loading Google Maps...
                    </span>
                  </div>
                ) : (
                  <Autocomplete
                    onLoad={
                      handleAutocompleteLoad
                    }
                    onUnmount={
                      handleAutocompleteUnmount
                    }
                    onPlaceChanged={
                      handlePlaceChanged
                    }
                    options={{
                      componentRestrictions:
                        {
                          country:
                            "in",
                        },

                      fields: [
                        "formatted_address",
                        "geometry",
                        "name",
                        "place_id",
                      ],
                    }}
                  >
                    <div
                      className="
                        flex
                        h-[54px]
                        items-center
                        rounded-[16px]
                        border
                        border-[#E7D79F]
                        bg-white
                        px-4
                        shadow-[0_5px_14px_rgba(91,67,8,0.05)]
                        transition
                        focus-within:border-[#FFB400]
                        focus-within:ring-4
                        focus-within:ring-[#FFB400]/10
                      "
                    >
                      <Search
                        size={18}
                        className="
                          shrink-0
                          text-[#B77D00]
                        "
                      />

                      <input
                        type="text"
                        value={
                          searchValue
                        }
                        onChange={(
                          event
                        ) =>
                          setSearchValue(
                            event
                              .target
                              .value
                          )
                        }
                        placeholder="Search area, landmark or address"
                        className="
                          ml-3
                          h-full
                          min-w-0
                          flex-1
                          bg-transparent
                          text-[12px]
                          font-semibold
                          text-black
                          outline-none
                          placeholder:font-medium
                          placeholder:text-zinc-400
                        "
                      />

                      {searchValue && (
                        <button
                          type="button"
                          onClick={() =>
                            setSearchValue(
                              ""
                            )
                          }
                          className="
                            ml-2
                            flex
                            h-8
                            w-8
                            shrink-0
                            items-center
                            justify-center
                            rounded-[10px]
                            bg-[#FFF7E0]
                            text-zinc-500
                          "
                        >
                          <X
                            size={14}
                          />
                        </button>
                      )}
                    </div>
                  </Autocomplete>
                )}
              </div>

              <p
                className="
                  mt-2
                  px-1
                  text-[8px]
                  leading-4
                  text-zinc-400
                "
              >
                Search an address, choose a Google suggestion, use your current location, or tap directly on the map.
              </p>
            </div>

            {/* =================================================
                MAP
            ================================================= */}

            <div
              className="
                relative
                min-h-0
                flex-1
                bg-[#EEE8DD]
              "
            >
              {!GOOGLE_MAPS_API_KEY ? (
                <MapUnavailable
                  message="Google Maps API key is not configured."
                />
              ) : googleMapsLoadError ? (
                <MapUnavailable
                  message="Google Maps failed to load."
                />
              ) : !googleMapsLoaded ? (
                <div
                  className="
                    flex
                    h-full
                    w-full
                    items-center
                    justify-center
                  "
                >
                  <div className="text-center">
                    <Loader2
                      size={28}
                      className="
                        mx-auto
                        animate-spin
                        text-[#B77D00]
                      "
                    />

                    <p
                      className="
                        mt-3
                        text-[10px]
                        font-semibold
                        text-zinc-500
                      "
                    >
                      Loading map...
                    </p>
                  </div>
                </div>
              ) : (
                <GoogleMap
                  mapContainerStyle={
                    mapContainerStyle
                  }
                  center={
                    mapLocation
                  }
                  zoom={
                    usingFallback
                      ? 13
                      : 16
                  }
                  onLoad={(
                    map
                  ) => {
                    mapRef.current =
                      map;

                    /*
                      Ensure map moves to the
                      latest GPS coordinates.
                    */

                    if (
                      mapLocation
                    ) {
                      map.panTo(
                        mapLocation
                      );
                    }
                  }}
                  onUnmount={() => {
                    mapRef.current =
                      null;
                  }}
                  onClick={
                    handleMapClick
                  }
                  options={{
                    streetViewControl:
                      false,

                    mapTypeControl:
                      false,

                    fullscreenControl:
                      false,

                    clickableIcons:
                      true,

                    gestureHandling:
                      "greedy",
                  }}
                >
                  {/*
                    Don't present fallback as an
                    automatically selected home marker.

                    Show a marker when:
                    - real GPS location exists
                    - user chose an address/map position
                  */}

                  {!usingFallback && (
                    <Marker
                      position={
                        mapLocation
                      }
                      draggable
                      onDragEnd={
                        handleMarkerDragEnd
                      }
                    />
                  )}
                </GoogleMap>
              )}

              {/* ===============================================
                  LOCATION STATUS
              =============================================== */}

              {googleMapsLoaded &&
                !googleMapsLoadError &&
                locationMessage && (
                  <div
                    className="
                      absolute
                      left-4
                      top-4
                      z-20
                      max-w-[250px]
                      rounded-[13px]
                      border
                      border-white/80
                      bg-white/95
                      px-3
                      py-2
                      shadow-md
                      backdrop-blur
                    "
                  >
                    <div
                      className="
                        flex
                        items-center
                        gap-2
                      "
                    >
                      {locating ? (
                        <Loader2
                          size={13}
                          className="
                            shrink-0
                            animate-spin
                            text-[#B77D00]
                          "
                        />
                      ) : (
                        <Navigation
                          size={13}
                          className="
                            shrink-0
                            text-[#B77D00]
                          "
                        />
                      )}

                      <p
                        className="
                          text-[8px]
                          font-semibold
                          leading-4
                          text-zinc-600
                        "
                      >
                        {locationMessage}
                      </p>
                    </div>
                  </div>
                )}

              {/* ===============================================
                  MY LOCATION
              =============================================== */}

              {googleMapsLoaded &&
                !googleMapsLoadError && (
                  <button
                    type="button"
                    disabled={
                      locating ||
                      geocoding
                    }
                    onClick={
                      useCurrentLocation
                    }
                    className="
                      absolute
                      bottom-4
                      right-4
                      z-20
                      flex
                      h-[46px]
                      items-center
                      gap-2
                      rounded-[15px]
                      border
                      border-[#E9D7A0]
                      bg-white
                      px-4
                      text-[9px]
                      font-extrabold
                      text-black
                      shadow-[0_8px_25px_rgba(45,32,7,0.14)]
                      disabled:opacity-60
                    "
                  >
                    {locating ? (
                      <Loader2
                        size={16}
                        className="animate-spin"
                      />
                    ) : (
                      <Navigation
                        size={16}
                        className="text-[#B77D00]"
                      />
                    )}

                    {locating
                      ? "Locating..."
                      : "My Location"}
                  </button>
                )}
            </div>

            {/* =================================================
                SELECTED ADDRESS
            ================================================= */}

            <div
              className="
                relative
                z-30
                border-t
                border-[#EEE3C3]
                bg-white
                p-4
              "
            >
              <div
                className="
                  rounded-[17px]
                  border
                  border-[#EEE3C3]
                  bg-[#FFFDF7]
                  p-4
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
                      h-10
                      w-10
                      shrink-0
                      items-center
                      justify-center
                      rounded-[13px]
                      bg-[#FFF0B8]
                      text-[#B77D00]
                    "
                  >
                    {geocoding ||
                    locating ? (
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />
                    ) : (
                      <MapPin
                        size={18}
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
                        font-extrabold
                        uppercase
                        tracking-[1px]
                        text-[#B77D00]
                      "
                    >
                      Selected Address
                    </p>

                    <p
                      className="
                        mt-1
                        text-[10px]
                        leading-5
                        text-black
                      "
                    >
                      {locating
                        ? "Finding your current location..."
                        : geocoding
                        ? "Detecting address..."
                        : mapAddress ||
                          (usingFallback
                            ? "Current location unavailable. Search or select your home manually."
                            : "Search for an address or select a point on the map.")}
                    </p>

                    {!usingFallback &&
                      mapLocation && (
                        <p
                          className="
                            mt-1
                            text-[7px]
                            text-zinc-400
                          "
                        >
                          {Number(
                            mapLocation.lat
                          ).toFixed(
                            6
                          )}
                          {", "}
                          {Number(
                            mapLocation.lng
                          ).toFixed(
                            6
                          )}
                        </p>
                      )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                disabled={
                  !googleMapsLoaded ||
                  Boolean(
                    googleMapsLoadError
                  ) ||
                  locating ||
                  geocoding ||
                  !mapAddress?.trim()
                }
                onClick={
                  confirmMapLocation
                }
                className="
                  mt-3
                  flex
                  h-[54px]
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-[16px]
                  bg-[#FFB400]
                  text-[12px]
                  font-extrabold
                  text-black
                  shadow-[0_8px_20px_rgba(255,180,0,0.18)]
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                <CheckCircle2
                  size={18}
                />

                Use This Location
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* =========================================================
   MAP ERROR
========================================================= */

function MapErrorCard({
  message,
}) {
  return (
    <div
      className="
        flex
        min-h-[54px]
        items-start
        gap-3
        rounded-[16px]
        border
        border-red-200
        bg-red-50
        px-4
        py-3
      "
    >
      <AlertCircle
        size={17}
        className="
          mt-0.5
          shrink-0
          text-red-500
        "
      />

      <p
        className="
          text-[9px]
          font-semibold
          leading-4
          text-red-600
        "
      >
        {message}
      </p>
    </div>
  );
}

/* =========================================================
   MAP UNAVAILABLE
========================================================= */

function MapUnavailable({
  message,
}) {
  return (
    <div
      className="
        flex
        h-full
        w-full
        items-center
        justify-center
        px-6
      "
    >
      <div className="text-center">
        <div
          className="
            mx-auto
            flex
            h-12
            w-12
            items-center
            justify-center
            rounded-[16px]
            bg-red-50
            text-red-500
          "
        >
          <AlertCircle
            size={21}
          />
        </div>

        <p
          className="
            mt-3
            text-[11px]
            font-extrabold
            text-black
          "
        >
          Map unavailable
        </p>

        <p
          className="
            mt-1
            text-[9px]
            leading-4
            text-zinc-500
          "
        >
          {message}
        </p>
      </div>
    </div>
  );
}

export default ParentRegistrationStep;