import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  GoogleMap,
  Marker,
  useJsApiLoader,
} from "@react-google-maps/api";

import BottomNav from "../../components/layout/BottomNav";

import {
  Bell,
  CheckCircle2,
  ChevronRight,
  Headphones,
  IdCard,
  Link2,
  LogOut,
  Mail,
  MapPin,
  Phone,
  Save,
  ShieldCheck,
  Trash2,
  User,
  X,
  Loader2,
  Settings,
  Navigation,
  KeyRound,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

import {
  API,
  clearAccessToken,
} from "../../api/api";

import {
  getParentProfile,
  updateParentProfile,
  logoutParent,
} from "../../api/parentApi";

/* =========================================================
   GOOGLE MAPS
========================================================= */

const GOOGLE_MAPS_API_KEY =
  import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const GOOGLE_MAPS_LOADER_ID =
  "asan-parent-google-map";

const GOOGLE_MAP_LIBRARIES = [
  "places",
];

const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

const DEFAULT_LOCATION = {
  lat: 17.385044,
  lng: 78.486671,
};

const EMPTY_OTP = [
  "",
  "",
  "",
  "",
  "",
  "",
];

/* =========================================================
   PROFILE
========================================================= */

function Profile({
  setTab,
  setPreviousTab,
}) {
  const navigate =
    useNavigate();

  /* =======================================================
     GOOGLE MAPS LOADER

     IMPORTANT:
     GoogleMap is not rendered until isLoaded === true.
  ======================================================= */

  const {
    isLoaded: mapsLoaded,
    loadError: mapsLoadError,
  } = useJsApiLoader({
    id:
      GOOGLE_MAPS_LOADER_ID,

    googleMapsApiKey:
      GOOGLE_MAPS_API_KEY || "",

    libraries:
      GOOGLE_MAP_LIBRARIES,
  });

  /* =======================================================
     LOCAL PARENT
  ======================================================= */

  const getStoredParent =
    () => {
      try {
        return (
          JSON.parse(
            localStorage.getItem(
              "parent"
            )
          ) || {}
        );
      } catch {
        return {};
      }
    };

  /* =======================================================
     STATE
  ======================================================= */

  const [
    user,
    setUser,
  ] = useState(
    getStoredParent()
  );

  const [
    originalUser,
    setOriginalUser,
  ] = useState(
    getStoredParent()
  );

  const [
    loadingProfile,
    setLoadingProfile,
  ] = useState(true);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    deleting,
    setDeleting,
  ] = useState(false);

  const [
    loggingOut,
    setLoggingOut,
  ] = useState(false);

  const [
    showPersonalInfo,
    setShowPersonalInfo,
  ] = useState(false);

  const [
    showLogoutPopup,
    setShowLogoutPopup,
  ] = useState(false);

  const [
    showDeletePopup,
    setShowDeletePopup,
  ] = useState(false);

  /* =======================================================
     EMAIL OTP
  ======================================================= */

  const [
    showEmailOtp,
    setShowEmailOtp,
  ] = useState(false);

  const [
    pendingEmail,
    setPendingEmail,
  ] = useState("");

  const [
    otp,
    setOtp,
  ] = useState([
    ...EMPTY_OTP,
  ]);

  const [
    sendingOtp,
    setSendingOtp,
  ] = useState(false);

  const [
    verifyingOtp,
    setVerifyingOtp,
  ] = useState(false);

  const [
    emailOtpError,
    setEmailOtpError,
  ] = useState("");

  const [
    resendSeconds,
    setResendSeconds,
  ] = useState(0);

  const otpRefs =
    useRef([]);

  /* =======================================================
     MAP
  ======================================================= */

  const [
    showMapPicker,
    setShowMapPicker,
  ] = useState(false);

  const [
    mapLocation,
    setMapLocation,
  ] = useState(
    DEFAULT_LOCATION
  );

  const [
    mapAddress,
    setMapAddress,
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
    mapError,
    setMapError,
  ] = useState("");

  const mapRef =
    useRef(null);

  /* =======================================================
     SAVE PARENT LOCALLY
  ======================================================= */

  const saveParentLocally =
    (parent) => {
      if (!parent) {
        return;
      }

      localStorage.setItem(
        "parent",
        JSON.stringify(
          parent
        )
      );

      if (parent._id) {
        localStorage.setItem(
          "parentId",
          String(
            parent._id
          )
        );
      }

      if (parent.driverId) {
        localStorage.setItem(
          "driverId",
          String(
            parent.driverId
          )
        );
      } else {
        localStorage.removeItem(
          "driverId"
        );
      }
    };

  /* =======================================================
     CLEAR LOCAL SESSION
  ======================================================= */

  const clearLocalSession =
    () => {
      clearAccessToken();

      localStorage.removeItem(
        "parent"
      );

      localStorage.removeItem(
        "parentId"
      );

      localStorage.removeItem(
        "driverId"
      );

      localStorage.removeItem(
        "push_token"
      );

      localStorage.removeItem(
        "activeTab"
      );

      localStorage.removeItem(
        "dashboardTrips"
      );

      sessionStorage.removeItem(
        "phoneEmailUserJsonUrl"
      );

      sessionStorage.removeItem(
        "verifiedParentPhone"
      );
    };

  /* =======================================================
     APPLY PROFILE
  ======================================================= */

  const applyParentProfile =
    (parent) => {
      if (!parent) {
        return;
      }

      setUser(parent);

      setOriginalUser(
        parent
      );

      saveParentLocally(
        parent
      );

      const lat =
        Number(
          parent.latitude
        );

      const lng =
        Number(
          parent.longitude
        );

      if (
        parent.latitude != null &&
        parent.longitude != null &&
        Number.isFinite(lat) &&
        Number.isFinite(lng)
      ) {
        setMapLocation({
          lat,
          lng,
        });
      }

      if (parent.address) {
        setMapAddress(
          parent.address
        );
      }
    };

  /* =======================================================
     FETCH PROFILE
  ======================================================= */

  const loadProfile =
    async () => {
      const token =
        localStorage.getItem(
          "accessToken"
        );

      if (!token) {
        return null;
      }

      const result =
        await getParentProfile();

      const parent =
        result?.data;

      if (parent) {
        applyParentProfile(
          parent
        );
      }

      return parent;
    };

  useEffect(() => {
    let cancelled =
      false;

    const fetchProfile =
      async () => {
        try {
          const token =
            localStorage.getItem(
              "accessToken"
            );

          if (!token) {
            return;
          }

          const result =
            await getParentProfile();

          if (cancelled) {
            return;
          }

          const parent =
            result?.data;

          if (parent) {
            applyParentProfile(
              parent
            );
          }
        } catch (err) {
          console.error(
            "Profile fetch error:",
            err?.response?.data ||
              err
          );

          if (
            err?.response?.status ===
            401
          ) {
            clearLocalSession();

            navigate(
              "/",
              {
                replace: true,
              }
            );
          }
        } finally {
          if (!cancelled) {
            setLoadingProfile(
              false
            );
          }
        }
      };

    fetchProfile();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  /* =======================================================
     UPDATE LOCAL FORM
  ======================================================= */

  const handleChange =
    (
      key,
      value
    ) => {
      setUser(
        (previous) => ({
          ...previous,

          [key]:
            value,
        })
      );
    };

  /* =======================================================
     GMAIL VALIDATION
  ======================================================= */

  const isValidGmail =
    (email) => {
      const normalized =
        String(
          email || ""
        )
          .trim()
          .toLowerCase();

      return /^[a-z0-9._%+-]+@gmail\.com$/i.test(
        normalized
      );
    };

  /* =======================================================
     CLOSE PERSONAL INFO
  ======================================================= */

  const closePersonalInfo =
    () => {
      if (
        saving ||
        sendingOtp ||
        verifyingOtp
      ) {
        return;
      }

      /*
        Restore original database values.
      */

      setUser({
        ...originalUser,
      });

      setShowMapPicker(
        false
      );

      setShowEmailOtp(
        false
      );

      setPendingEmail("");

      setOtp([
        ...EMPTY_OTP,
      ]);

      setEmailOtpError("");

      setMapError("");

      mapRef.current =
        null;

      setShowPersonalInfo(
        false
      );
    };

  /* =======================================================
     SAVE PROFILE
  ======================================================= */

  const handleSave =
    async () => {
      const name =
        user?.name
          ?.trim();

      const email =
        user?.email
          ?.trim()
          ?.toLowerCase();

      const oldEmail =
        originalUser?.email
          ?.trim()
          ?.toLowerCase();

      if (!name) {
        alert(
          "Name is required"
        );

        return;
      }

      if (!email) {
        alert(
          "Email is required"
        );

        return;
      }

      if (
        !isValidGmail(
          email
        )
      ) {
        alert(
          "Only Gmail addresses ending with @gmail.com are allowed."
        );

        return;
      }

      /*
        Email changed:
        verify email first.
      */

      if (
        email !==
        oldEmail
      ) {
        await startEmailVerification(
          email
        );

        return;
      }

      await saveNormalProfile();
    };

  /* =======================================================
     SAVE NORMAL PROFILE
  ======================================================= */

  const saveNormalProfile =
    async () => {
      const name =
        user?.name
          ?.trim();

      const address =
        user?.address
          ?.trim();

      try {
        setSaving(true);

        const payload = {
          name,
        };

        if (address) {
          payload.address =
            address;
        }

        if (
          user?.latitude != null &&
          user?.longitude != null
        ) {
          const lat =
            Number(
              user.latitude
            );

          const lng =
            Number(
              user.longitude
            );

          if (
            Number.isFinite(lat) &&
            Number.isFinite(lng)
          ) {
            payload.latitude =
              lat;

            payload.longitude =
              lng;
          }
        }

        const result =
          await updateParentProfile(
            payload
          );

        const updatedParent =
          result?.data;

        if (updatedParent) {
          applyParentProfile(
            updatedParent
          );
        }

        setShowPersonalInfo(
          false
        );
      } catch (err) {
        console.error(
          "Profile update error:",
          err?.response?.data ||
            err
        );

        alert(
          err?.response?.data
            ?.message ||
            "Failed to update profile"
        );
      } finally {
        setSaving(false);
      }
    };

  /* =======================================================
     EMAIL OTP - SEND
  ======================================================= */

  const startEmailVerification =
    async (email) => {
      const normalized =
        String(
          email || ""
        )
          .trim()
          .toLowerCase();

      if (
        !isValidGmail(
          normalized
        )
      ) {
        alert(
          "Please enter a valid Gmail address ending with @gmail.com."
        );

        return;
      }

      try {
        setSendingOtp(true);

        setEmailOtpError(
          ""
        );

        await API.post(
          "/parent/email/send-otp",
          {
            email:
              normalized,
          }
        );

        setPendingEmail(
          normalized
        );

        setOtp([
          ...EMPTY_OTP,
        ]);

        setResendSeconds(
          60
        );

        setShowEmailOtp(
          true
        );

        window.setTimeout(
          () => {
            otpRefs
              .current?.[0]
              ?.focus();
          },
          150
        );
      } catch (err) {
        console.error(
          "Send email OTP error:",
          err?.response?.data ||
            err
        );

        alert(
          err?.response?.data
            ?.message ||
            "Unable to send verification code."
        );
      } finally {
        setSendingOtp(false);
      }
    };

  /* =======================================================
     RESEND TIMER
  ======================================================= */

  useEffect(() => {
    if (
      resendSeconds <= 0
    ) {
      return undefined;
    }

    const timer =
      window.setInterval(
        () => {
          setResendSeconds(
            (previous) =>
              Math.max(
                previous - 1,
                0
              )
          );
        },
        1000
      );

    return () =>
      window.clearInterval(
        timer
      );
  }, [resendSeconds]);

  /* =======================================================
     OTP INPUT
  ======================================================= */

  const handleOtpChange =
    (
      index,
      value
    ) => {
      const digit =
        String(
          value || ""
        )
          .replace(
            /\D/g,
            ""
          )
          .slice(-1);

      const updated = [
        ...otp,
      ];

      updated[index] =
        digit;

      setOtp(updated);

      setEmailOtpError(
        ""
      );

      if (
        digit &&
        index < 5
      ) {
        otpRefs.current?.[
          index + 1
        ]?.focus();
      }
    };

  const handleOtpKeyDown =
    (
      index,
      event
    ) => {
      if (
        event.key ===
          "Backspace" &&
        !otp[index] &&
        index > 0
      ) {
        otpRefs.current?.[
          index - 1
        ]?.focus();
      }

      if (
        event.key ===
          "ArrowLeft" &&
        index > 0
      ) {
        otpRefs.current?.[
          index - 1
        ]?.focus();
      }

      if (
        event.key ===
          "ArrowRight" &&
        index < 5
      ) {
        otpRefs.current?.[
          index + 1
        ]?.focus();
      }
    };

  const handleOtpPaste =
    (event) => {
      event.preventDefault();

      const value =
        event.clipboardData
          .getData("text")
          .replace(
            /\D/g,
            ""
          )
          .slice(
            0,
            6
          );

      if (!value) {
        return;
      }

      const updated = [
        ...EMPTY_OTP,
      ];

      value
        .split("")
        .forEach(
          (
            digit,
            index
          ) => {
            updated[index] =
              digit;
          }
        );

      setOtp(updated);

      setEmailOtpError(
        ""
      );

      const focusIndex =
        Math.min(
          value.length,
          5
        );

      otpRefs.current?.[
        focusIndex
      ]?.focus();
    };

  /* =======================================================
     VERIFY EMAIL OTP
  ======================================================= */

  const verifyEmailOtp =
    async () => {
      const otpValue =
        otp.join("");

      if (
        !/^\d{6}$/.test(
          otpValue
        )
      ) {
        setEmailOtpError(
          "Enter the complete 6-digit OTP."
        );

        return;
      }

      if (!pendingEmail) {
        setEmailOtpError(
          "Verification session expired. Request a new OTP."
        );

        return;
      }

      try {
        setVerifyingOtp(
          true
        );

        setEmailOtpError(
          ""
        );

        await API.post(
          "/parent/email/verify-otp",
          {
            email:
              pendingEmail,

            otp:
              otpValue,
          }
        );

        /*
          Save remaining changes.
        */

        const currentName =
          user?.name
            ?.trim();

        const currentAddress =
          user?.address
            ?.trim();

        const payload = {
          name:
            currentName,
        };

        if (
          currentAddress
        ) {
          payload.address =
            currentAddress;
        }

        if (
          user?.latitude != null &&
          user?.longitude != null
        ) {
          const lat =
            Number(
              user.latitude
            );

          const lng =
            Number(
              user.longitude
            );

          if (
            Number.isFinite(lat) &&
            Number.isFinite(lng)
          ) {
            payload.latitude =
              lat;

            payload.longitude =
              lng;
          }
        }

        await updateParentProfile(
          payload
        );

        /*
          Final fresh copy from MongoDB.
        */

        const updatedParent =
          await loadProfile();

        if (updatedParent) {
          applyParentProfile(
            updatedParent
          );
        }

        setShowEmailOtp(
          false
        );

        setPendingEmail("");

        setOtp([
          ...EMPTY_OTP,
        ]);

        setResendSeconds(
          0
        );

        setShowPersonalInfo(
          false
        );
      } catch (err) {
        console.error(
          "Verify email OTP error:",
          err?.response?.data ||
            err
        );

        setEmailOtpError(
          err?.response?.data
            ?.message ||
            "Invalid or expired OTP."
        );
      } finally {
        setVerifyingOtp(
          false
        );
      }
    };

  /* =======================================================
     RESEND EMAIL OTP
  ======================================================= */

  const resendEmailOtp =
    async () => {
      if (
        resendSeconds > 0 ||
        sendingOtp ||
        verifyingOtp
      ) {
        return;
      }

      if (!pendingEmail) {
        setEmailOtpError(
          "Verification session expired."
        );

        return;
      }

      try {
        setSendingOtp(true);

        setEmailOtpError(
          ""
        );

        await API.post(
          "/parent/email/send-otp",
          {
            email:
              pendingEmail,
          }
        );

        setOtp([
          ...EMPTY_OTP,
        ]);

        setResendSeconds(
          60
        );

        window.setTimeout(
          () => {
            otpRefs
              .current?.[0]
              ?.focus();
          },
          100
        );
      } catch (err) {
        setEmailOtpError(
          err?.response?.data
            ?.message ||
            "Unable to resend OTP."
        );
      } finally {
        setSendingOtp(false);
      }
    };

  /* =======================================================
     CLOSE EMAIL OTP
  ======================================================= */

  const closeEmailOtp =
    () => {
      if (
        verifyingOtp
      ) {
        return;
      }

      setShowEmailOtp(
        false
      );

      setPendingEmail("");

      setOtp([
        ...EMPTY_OTP,
      ]);

      setEmailOtpError("");

      setResendSeconds(
        0
      );

      /*
        New email wasn't verified,
        so restore original email.
      */

      setUser(
        (previous) => ({
          ...previous,

          email:
            originalUser
              ?.email ||
            "",
        })
      );
    };

  /* =======================================================
     REVERSE GEOCODING

     IMPORTANT:
     Uses already-loaded Maps JavaScript SDK.
     No REST URL required here.
  ======================================================= */

  const reverseGeocode =
    async (
      lat,
      lng
    ) => {
      if (
        !mapsLoaded ||
        !window.google?.maps
          ?.Geocoder
      ) {
        console.error(
          "Google Maps Geocoder has not loaded."
        );

        return "";
      }

      try {
        setGeocoding(true);

        const geocoder =
          new window.google.maps.Geocoder();

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
          response?.results?.[0]
            ?.formatted_address ||
          ""
        );
      } catch (error) {
        console.error(
          "Reverse geocode error:",
          error
        );

        return "";
      } finally {
        setGeocoding(false);
      }
    };

  /* =======================================================
     GET CURRENT LOCATION
  ======================================================= */

  const getCurrentPosition =
    () =>
      new Promise(
        (
          resolve,
          reject
        ) => {
          if (
            !navigator
              .geolocation
          ) {
            reject(
              new Error(
                "Geolocation is not supported."
              )
            );

            return;
          }

          navigator.geolocation
            .getCurrentPosition(
              resolve,
              reject,
              {
                enableHighAccuracy:
                  true,

                timeout:
                  15000,

                maximumAge:
                  0,
              }
            );
        }
      );

  /* =======================================================
     APPLY CURRENT LOCATION
  ======================================================= */

  const applyCurrentLocation =
    async (position) => {
      const lat =
        Number(
          position.coords
            .latitude
        );

      const lng =
        Number(
          position.coords
            .longitude
        );

      if (
        !Number.isFinite(lat) ||
        !Number.isFinite(lng)
      ) {
        throw new Error(
          "Invalid GPS coordinates."
        );
      }

      const location = {
        lat,
        lng,
      };

      setMapLocation(
        location
      );

      mapRef.current?.panTo(
        location
      );

      mapRef.current?.setZoom(
        17
      );

      const address =
        await reverseGeocode(
          lat,
          lng
        );

      if (address) {
        setMapAddress(
          address
        );
      } else {
        setMapAddress(
          `${lat.toFixed(
            6
          )}, ${lng.toFixed(
            6
          )}`
        );
      }
    };

  /* =======================================================
     OPEN MAP
  ======================================================= */

  const openAddressMap =
    async () => {
      setMapError("");

      setShowMapPicker(
        true
      );

      /*
        First use saved coordinates so
        there is always a meaningful fallback.
      */

      const savedLat =
        user?.latitude != null
          ? Number(
              user.latitude
            )
          : NaN;

      const savedLng =
        user?.longitude != null
          ? Number(
              user.longitude
            )
          : NaN;

      if (
        Number.isFinite(
          savedLat
        ) &&
        Number.isFinite(
          savedLng
        )
      ) {
        setMapLocation({
          lat:
            savedLat,

          lng:
            savedLng,
        });

        setMapAddress(
          user?.address ||
            ""
        );
      } else {
        setMapLocation(
          DEFAULT_LOCATION
        );

        setMapAddress(
          user?.address ||
            ""
        );
      }

      /*
        Then automatically try to
        obtain current device position.
      */

      try {
        setLocating(true);

        const position =
          await getCurrentPosition();

        await applyCurrentLocation(
          position
        );
      } catch (error) {
        console.warn(
          "Current location unavailable:",
          error
        );

        /*
          Saved/default location remains visible.
        */

        if (
          !Number.isFinite(
            savedLat
          ) ||
          !Number.isFinite(
            savedLng
          )
        ) {
          setMapError(
            "Current location could not be detected. You can select your location manually on the map."
          );
        }
      } finally {
        setLocating(false);
      }
    };

  /* =======================================================
     MAP CLICK
  ======================================================= */

  const handleMapClick =
    async (event) => {
      if (
        !event?.latLng
      ) {
        return;
      }

      const lat =
        event.latLng.lat();

      const lng =
        event.latLng.lng();

      const location = {
        lat,
        lng,
      };

      setMapLocation(
        location
      );

      setMapError("");

      mapRef.current?.panTo(
        location
      );

      const address =
        await reverseGeocode(
          lat,
          lng
        );

      if (address) {
        setMapAddress(
          address
        );
      } else {
        setMapAddress(
          `${lat.toFixed(
            6
          )}, ${lng.toFixed(
            6
          )}`
        );
      }
    };

  /* =======================================================
     MARKER DRAG
  ======================================================= */

  const handleMarkerDragEnd =
    async (event) => {
      if (
        !event?.latLng
      ) {
        return;
      }

      const lat =
        event.latLng.lat();

      const lng =
        event.latLng.lng();

      const location = {
        lat,
        lng,
      };

      setMapLocation(
        location
      );

      setMapError("");

      mapRef.current?.panTo(
        location
      );

      const address =
        await reverseGeocode(
          lat,
          lng
        );

      if (address) {
        setMapAddress(
          address
        );
      } else {
        setMapAddress(
          `${lat.toFixed(
            6
          )}, ${lng.toFixed(
            6
          )}`
        );
      }
    };

  /* =======================================================
     CURRENT LOCATION BUTTON
  ======================================================= */

  const useCurrentLocation =
    async () => {
      if (locating) {
        return;
      }

      try {
        setLocating(true);

        setMapError("");

        const position =
          await getCurrentPosition();

        await applyCurrentLocation(
          position
        );
      } catch (error) {
        console.error(
          "Current location error:",
          error
        );

        setMapError(
          "Unable to access your current location. Please enable location permission and GPS."
        );
      } finally {
        setLocating(false);
      }
    };

  /* =======================================================
     CONFIRM MAP LOCATION
  ======================================================= */

  const confirmMapLocation =
    () => {
      const lat =
        Number(
          mapLocation?.lat
        );

      const lng =
        Number(
          mapLocation?.lng
        );

      if (
        !Number.isFinite(lat) ||
        !Number.isFinite(lng)
      ) {
        setMapError(
          "Please select a valid location."
        );

        return;
      }

      if (
        !mapAddress
          ?.trim()
      ) {
        setMapError(
          "Address is still being detected."
        );

        return;
      }

      setUser(
        (previous) => ({
          ...previous,

          address:
            mapAddress.trim(),

          latitude:
            lat,

          longitude:
            lng,
        })
      );

      setMapError("");

      setShowMapPicker(
        false
      );

      mapRef.current =
        null;
    };

  /* =======================================================
     CLOSE MAP
  ======================================================= */

  const closeMapPicker =
    () => {
      setShowMapPicker(
        false
      );

      setLocating(false);

      setGeocoding(false);

      setMapError("");

      mapRef.current =
        null;
    };

  /* =======================================================
     NOTIFICATIONS
  ======================================================= */

  const goToNotifications =
    () => {
      if (
        setPreviousTab
      ) {
        setPreviousTab(
          "profile"
        );
      }

      if (setTab) {
        setTab(
          "notifications"
        );
      }
    };

  /* =======================================================
     LOGOUT
  ======================================================= */

  const handleLogout =
    async () => {
      try {
        setLoggingOut(true);

        const fcmToken =
          localStorage.getItem(
            "push_token"
          );

        try {
          await logoutParent(
            fcmToken ||
              undefined
          );
        } catch (err) {
          console.warn(
            "Backend logout cleanup failed:",
            err?.response?.data ||
              err
          );
        }

        clearLocalSession();

        setShowLogoutPopup(
          false
        );

        window.dispatchEvent(
          new CustomEvent(
            "asan:parent-logged-out"
          )
        );

        navigate(
          "/",
          {
            replace: true,
          }
        );
      } catch (err) {
        console.error(
          "Logout failed:",
          err
        );

        clearLocalSession();

        navigate(
          "/",
          {
            replace: true,
          }
        );
      } finally {
        setLoggingOut(false);
      }
    };

  /* =======================================================
     DELETE ACCOUNT
  ======================================================= */

  const handleDeleteAccount =
    async () => {
      if (!user?._id) {
        return;
      }

      try {
        setDeleting(true);

        await API.delete(
          `/parent/${user._id}`
        );

        clearLocalSession();

        setShowDeletePopup(
          false
        );

        window.dispatchEvent(
          new CustomEvent(
            "asan:parent-logged-out"
          )
        );

        navigate(
          "/",
          {
            replace: true,
          }
        );
      } catch (err) {
        console.error(
          "Delete account error:",
          err?.response?.data ||
            err
        );

        alert(
          err?.response?.data
            ?.message ||
            "Failed to delete account"
        );
      } finally {
        setDeleting(false);
      }
    };

  /* =======================================================
     DRIVER STATUS
  ======================================================= */

  const driverLinked =
    Boolean(
      user?.driverId
    );

  const handleDriverClick =
    () => {
      if (driverLinked) {
        return;
      }

      navigate(
        "/link-driver"
      );
    };

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#F8F8F6] pb-28">

      {/* BACKGROUND */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">

        <div className="absolute -right-[130px] -top-[110px] h-[310px] w-[310px] rounded-full bg-[#FFF0B5] opacity-70" />

        <div className="absolute -left-[140px] top-[560px] h-[290px] w-[290px] rounded-full bg-[#FFF5D8]" />

      </div>

      {/* APP */}

      <div className="relative z-10 mx-auto w-full max-w-[475px]">

        {/* HEADER */}

        <header className="px-5 pb-5 pt-7">

          <div className="mb-2 flex items-center gap-2">

            <Settings
              size={13}
              className="text-[#C58A00]"
            />

            <span className="text-[9px] font-extrabold uppercase tracking-[1.7px] text-[#B77D00]">
              Account
            </span>

            <div className="h-[3px] w-7 rounded-full bg-[#FFB400]" />

          </div>

          <h1 className="text-[28px] font-extrabold tracking-[-0.7px] text-black">
            Profile & Settings
          </h1>

          <p className="mt-1.5 text-[11px] leading-5 text-zinc-500">
            Manage your account, preferences and privacy.
          </p>

        </header>

        {/* PROFILE CARD */}

        <div className="px-4">

          <div className="overflow-hidden rounded-[26px] border border-[#EEDB98] bg-white shadow-[0_12px_32px_rgba(78,60,11,0.07)]">

            <div className="h-[5px] bg-[#FFB400]" />

            <div className="p-5">

              {loadingProfile ? (
                <ProfileSkeleton />
              ) : (
                <>
                  <div className="flex items-center gap-3">

                    <div className="relative shrink-0">

                      <div className="flex h-[64px] w-[64px] items-center justify-center rounded-[20px] border-2 border-[#FFB400] bg-white p-[3px]">

                        {user?.profilePhoto ? (
                          <img
                            src={
                              user.profilePhoto
                            }
                            alt={
                              user?.name ||
                              "Parent"
                            }
                            className="h-full w-full rounded-[15px] object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center rounded-[15px] bg-[#FFF0B8] text-black">

                            <User
                              size={29}
                              strokeWidth={
                                1.7
                              }
                            />

                          </div>
                        )}

                      </div>

                      <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-white">

                        <span className="h-[14px] w-[14px] rounded-full border-2 border-white bg-green-500" />

                      </div>

                    </div>

                    <div className="min-w-0 flex-1">

                      <h2 className="truncate text-[21px] font-extrabold text-black">
                        {user?.name ||
                          "Parent"}
                      </h2>

                      <p className="mt-1 text-[9px] font-medium text-zinc-400">
                        Parent account
                      </p>

                    </div>

                  </div>

                  {/* EMAIL + PHONE */}

                  <div className="mt-4 grid grid-cols-2 gap-2">

                    <div className="flex min-w-0 items-center gap-2 rounded-[13px] border border-[#EEE3C3] bg-[#FFFDF7] px-3 py-2.5">

                      <Mail
                        size={14}
                        className="shrink-0 text-[#C88D00]"
                      />

                      <span className="min-w-0 truncate text-[9px] text-zinc-500">
                        {user?.email ||
                          "Email not added"}
                      </span>

                    </div>

                    <div className="flex min-w-0 items-center gap-2 rounded-[13px] border border-[#EEE3C3] bg-[#FFFDF7] px-3 py-2.5">

                      <Phone
                        size={14}
                        className="shrink-0 text-[#C88D00]"
                      />

                      <span className="min-w-0 truncate text-[9px] text-zinc-500">
                        {formatPhone(
                          user?.phone
                        )}
                      </span>

                    </div>

                  </div>

                  {/* DRIVER STATUS */}

                  <button
                    type="button"
                    onClick={
                      handleDriverClick
                    }
                    className={`
                      mt-4 flex w-full items-center justify-between
                      rounded-[17px] border px-4 py-3 text-left
                      ${
                        driverLinked
                          ? "border-green-100 bg-green-50"
                          : "border-[#EFD994] bg-[#FFF9EA]"
                      }
                    `}
                  >

                    <div className="flex items-center gap-3">

                      <div
                        className={`
                          flex h-10 w-10 shrink-0 items-center
                          justify-center rounded-[12px]
                          ${
                            driverLinked
                              ? "bg-green-100 text-green-600"
                              : "bg-[#FFF0B6] text-black"
                          }
                        `}
                      >

                        {driverLinked ? (
                          <CheckCircle2
                            size={19}
                          />
                        ) : (
                          <Link2
                            size={19}
                          />
                        )}

                      </div>

                      <div>

                        <p className="text-[9px] text-zinc-400">
                          Driver connection
                        </p>

                        <p className="mt-[2px] text-[12px] font-bold text-black">
                          {driverLinked
                            ? user.driverId
                            : "No driver linked"}
                        </p>

                      </div>

                    </div>

                    <span
                      className={`
                        rounded-full px-2.5 py-1.5
                        text-[8px] font-bold
                        ${
                          driverLinked
                            ? "bg-green-100 text-green-700"
                            : "bg-[#FFF0B8] text-[#936400]"
                        }
                      `}
                    >
                      {driverLinked
                        ? "LINKED"
                        : "SELECT"}
                    </span>

                  </button>
                </>
              )}

            </div>

          </div>

        </div>

        {/* MANAGE PROFILE */}

        <div className="mt-7 px-4">

          <SectionHeader
            title="Manage your profile"
          />

          <OptionCard>

            <SettingItem
              icon={
                <User
                  size={21}
                />
              }
              title="Personal Information"
              subtitle="View and edit your account details"
              onClick={() =>
                setShowPersonalInfo(
                  true
                )
              }
            />

            <Divider />

            <SettingItem
              icon={
                <Bell
                  size={21}
                />
              }
              title="Notifications"
              subtitle="View ride and safety updates"
              onClick={
                goToNotifications
              }
            />

            <Divider />

            <SettingItem
              icon={
                <ShieldCheck
                  size={21}
                />
              }
              title="Privacy"
              subtitle="Manage privacy and your data"
              onClick={() =>
                setTab?.(
                  "privacy"
                )
              }
            />

          </OptionCard>

        </div>

        {/* SUPPORT */}

        <div className="mt-7 px-4">

          <SectionHeader
            title="Help & Support"
          />

          <OptionCard>

            <SettingItem
              icon={
                <Headphones
                  size={21}
                />
              }
              title="Help & Support"
              subtitle="Get help or contact support"
              onClick={() =>
                setTab?.(
                  "support"
                )
              }
            />

          </OptionCard>

        </div>

        {/* ACCOUNT ACTIONS */}

        <div className="mt-7 px-4">

          <SectionHeader
            title="Account Actions"
          />

          <OptionCard>

            <SettingItem
              icon={
                <LogOut
                  size={21}
                />
              }
              title="Logout"
              subtitle="Sign out of your account"
              onClick={() =>
                setShowLogoutPopup(
                  true
                )
              }
            />

            <Divider />

            <SettingItem
              icon={
                <Trash2
                  size={21}
                />
              }
              title="Delete Account"
              subtitle="Permanently delete your account"
              danger
              onClick={() =>
                setShowDeletePopup(
                  true
                )
              }
            />

          </OptionCard>

        </div>

        <div className="h-8" />

      </div>

      {/* ===================================================
          PERSONAL INFORMATION
      =================================================== */}

      {showPersonalInfo && (
        <div className="fixed inset-0 z-[9999] overflow-y-auto bg-[#FFFEFB]">

          <div className="relative mx-auto min-h-screen w-full max-w-[475px] bg-[#FFFEFB] pb-8">

            {/* HEADER */}

            <div className="relative overflow-hidden border-b border-[#F0E0AD] bg-[#FFF8DF] px-5 pb-6 pt-7">

              <div className="pointer-events-none absolute -right-[45px] -top-[55px] h-[145px] w-[145px] rounded-full bg-[#FFE28A] opacity-55" />

              <div className="relative z-10 flex items-start justify-between gap-3">

                <div className="min-w-0 flex-1">

                  <p className="text-[9px] font-extrabold uppercase tracking-[1.5px] text-[#B77D00]">
                    Account Details
                  </p>

                  <h2 className="mt-1 text-[23px] font-extrabold leading-tight tracking-[-0.4px] text-black">
                    Personal Information
                  </h2>

                  <p className="mt-2 text-[10px] leading-4 text-zinc-500">
                    Update your editable profile information.
                  </p>

                </div>

                <button
                  type="button"
                  disabled={
                    saving ||
                    sendingOtp ||
                    verifyingOtp
                  }
                  onClick={
                    closePersonalInfo
                  }
                  className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[14px] border border-[#E8D48D] bg-white text-black shadow-[0_5px_14px_rgba(94,70,14,0.05)] disabled:opacity-50"
                >

                  <X
                    size={19}
                  />

                </button>

              </div>

            </div>

            {/* FORM */}

            <div className="px-5 pb-8 pt-6">

              <FormField
                label="Full Name"
                icon={
                  <User
                    size={18}
                  />
                }
              >

                <input
                  type="text"
                  value={
                    user?.name ||
                    ""
                  }
                  onChange={(
                    event
                  ) =>
                    handleChange(
                      "name",
                      event.target
                        .value
                    )
                  }
                  placeholder="Enter your name"
                  className="profile-input"
                />

              </FormField>

              <FormField
                label="Email Address"
                icon={
                  <Mail
                    size={18}
                  />
                }
                hint="Only Gmail addresses ending with @gmail.com are accepted. Changing email requires OTP verification."
              >

                <input
                  type="email"
                  value={
                    user?.email ||
                    ""
                  }
                  onChange={(
                    event
                  ) =>
                    handleChange(
                      "email",
                      event.target
                        .value
                    )
                  }
                  placeholder="example@gmail.com"
                  className="profile-input"
                />

              </FormField>

              <FormField
                label="Verified Phone Number"
                icon={
                  <Phone
                    size={18}
                  />
                }
                hint="Your phone number is verified and cannot be edited from your profile."
              >

                <input
                  type="text"
                  value={
                    formatPhone(
                      user?.phone
                    )
                  }
                  disabled
                  className="profile-input cursor-not-allowed bg-[#F8F7F3] text-zinc-500"
                />

              </FormField>

              {/* ADDRESS */}

              <div className="mb-4">

                <label className="mb-2 block text-[11px] font-semibold text-black">
                  Home Address
                </label>

                <button
                  type="button"
                  onClick={
                    openAddressMap
                  }
                  className="flex min-h-[58px] w-full items-center gap-3 rounded-[14px] border-[1.5px] border-[#E8E2D5] bg-white px-4 text-left transition hover:border-[#FFB400]"
                >

                  <MapPin
                    size={18}
                    className="shrink-0 text-black"
                  />

                  <div className="min-w-0 flex-1">

                    <p className="text-[8px] font-semibold uppercase tracking-[1px] text-[#B77D00]">
                      Selected Location
                    </p>

                    <p className="mt-1 line-clamp-2 text-[11px] text-black">
                      {user?.address ||
                        "Tap to select your home location"}
                    </p>

                  </div>

                  <ChevronRight
                    size={17}
                    className="text-zinc-400"
                  />

                </button>

                {user?.latitude != null &&
                  user?.longitude != null && (
                    <p className="mt-1.5 text-[8px] text-zinc-400">
                      Location coordinates saved with your address.
                    </p>
                  )}

              </div>

              <FormField
                label="Driver ID"
                icon={
                  <IdCard
                    size={18}
                  />
                }
                hint={
                  driverLinked
                    ? "Driver assignments cannot be edited from profile."
                    : "No driver is currently linked. Use Driver Connection from your profile to select or request a driver."
                }
              >

                <input
                  type="text"
                  value={
                    user?.driverId ||
                    "No driver linked"
                  }
                  disabled
                  className="profile-input cursor-not-allowed bg-[#F8F7F3] text-zinc-500"
                />

              </FormField>

              <button
                type="button"
                disabled={
                  saving ||
                  sendingOtp
                }
                onClick={
                  handleSave
                }
                className="mt-2 flex h-[54px] w-full items-center justify-center gap-2 rounded-[16px] bg-[#FFB400] text-[13px] font-extrabold text-black shadow-[0_8px_20px_rgba(255,180,0,0.18)] transition hover:bg-[#F5AA00] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >

                {saving ||
                sendingOtp ? (
                  <Loader2
                    size={19}
                    className="animate-spin"
                  />
                ) : (
                  <Save
                    size={19}
                  />
                )}

                {sendingOtp
                  ? "Sending OTP..."
                  : saving
                  ? "Saving..."
                  : "Save Changes"}

              </button>

            </div>

          </div>

        </div>
      )}

      {/* ===================================================
          MAP PICKER
      =================================================== */}

      {showMapPicker && (
        <div className="fixed inset-0 z-[10050] bg-[#FFFEFB]">

          <div className="mx-auto flex h-[100dvh] w-full max-w-[475px] flex-col bg-[#FFFEFB]">

            {/* MAP HEADER */}

            <div className="flex shrink-0 items-center justify-between border-b border-[#EEE3C3] bg-[#FFF8DF] px-5 py-5">

              <div>

                <p className="text-[8px] font-extrabold uppercase tracking-[1.5px] text-[#B77D00]">
                  Home Location
                </p>

                <h2 className="mt-1 text-[20px] font-extrabold text-black">
                  Select Address
                </h2>

              </div>

              <button
                type="button"
                onClick={
                  closeMapPicker
                }
                className="flex h-10 w-10 items-center justify-center rounded-[13px] border border-[#E8D48D] bg-white"
              >

                <X
                  size={18}
                />

              </button>

            </div>

            {/* MAP AREA */}

            <div className="relative min-h-0 flex-1 bg-[#F5F1E7]">

              {!GOOGLE_MAPS_API_KEY ? (
                <MapStatus
                  title="Google Maps API key missing"
                  message="Add VITE_GOOGLE_MAPS_API_KEY to your .env file and restart the Vite development server."
                  error
                />
              ) : mapsLoadError ? (
                <MapStatus
                  title="Google Maps failed to load"
                  message="Check the API key, Maps JavaScript API activation, billing, and API-key restrictions in Google Cloud."
                  error
                />
              ) : !mapsLoaded ? (
                <MapStatus
                  title="Loading Google Maps"
                  message="Please wait while the map service is loaded."
                  loading
                />
              ) : (
                <>
                  <GoogleMap
                    mapContainerStyle={
                      mapContainerStyle
                    }
                    center={
                      mapLocation
                    }
                    zoom={16}
                    onLoad={(
                      map
                    ) => {
                      mapRef.current =
                        map;

                      window.setTimeout(
                        () => {
                          if (
                            !mapRef.current
                          ) {
                            return;
                          }

                          if (
                            window.google
                              ?.maps
                          ) {
                            window.google
                              .maps
                              .event
                              .trigger(
                                mapRef.current,
                                "resize"
                              );
                          }

                          mapRef.current
                            .setCenter(
                              mapLocation
                            );
                        },
                        100
                      );
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
                        false,

                      gestureHandling:
                        "greedy",
                    }}
                  >

                    <Marker
                      position={
                        mapLocation
                      }
                      draggable
                      onDragEnd={
                        handleMarkerDragEnd
                      }
                    />

                  </GoogleMap>

                  <button
                    type="button"
                    disabled={
                      locating
                    }
                    onClick={
                      useCurrentLocation
                    }
                    className="absolute right-4 top-4 z-10 flex h-11 items-center gap-2 rounded-[14px] border border-[#E9D7A0] bg-white px-4 text-[9px] font-extrabold text-black shadow-md disabled:opacity-60"
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

                    Current Location

                  </button>
                </>
              )}

            </div>

            {/* ADDRESS PANEL */}

            <div className="shrink-0 border-t border-[#EEE3C3] bg-white p-4">

              {mapError && (
                <div className="mb-3 flex items-start gap-2 rounded-[13px] border border-red-200 bg-red-50 p-3">

                  <AlertCircle
                    size={15}
                    className="mt-0.5 shrink-0 text-red-500"
                  />

                  <p className="text-[9px] leading-4 text-red-600">
                    {mapError}
                  </p>

                </div>
              )}

              <div className="rounded-[16px] border border-[#EEE3C3] bg-[#FFFDF7] p-4">

                <div className="flex items-start gap-3">

                  <MapPin
                    size={18}
                    className="mt-0.5 shrink-0 text-[#B77D00]"
                  />

                  <div className="min-w-0">

                    <p className="text-[8px] font-extrabold uppercase tracking-[1px] text-[#B77D00]">
                      Selected Address
                    </p>

                    <p className="mt-1 text-[10px] leading-5 text-black">

                      {geocoding
                        ? "Detecting address..."
                        : locating
                        ? "Detecting your current location..."
                        : mapAddress ||
                          "Tap anywhere on the map to select your home location."}

                    </p>

                    {mapLocation && (
                      <p className="mt-1.5 text-[8px] text-zinc-400">
                        {Number(
                          mapLocation.lat
                        ).toFixed(
                          6
                        )}
                        ,{" "}
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
                  geocoding ||
                  locating ||
                  !mapsLoaded
                }
                onClick={
                  confirmMapLocation
                }
                className="mt-3 flex h-[52px] w-full items-center justify-center gap-2 rounded-[16px] bg-[#FFB400] text-[12px] font-extrabold text-black disabled:opacity-50"
              >

                {geocoding ? (
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                ) : (
                  <CheckCircle2
                    size={18}
                  />
                )}

                Use This Location

              </button>

            </div>

          </div>

        </div>
      )}

      {/* ===================================================
          EMAIL OTP
      =================================================== */}

      {showEmailOtp && (
        <div className="fixed inset-0 z-[10100] flex items-center justify-center bg-black/35 px-5 backdrop-blur-[4px]">

          <div className="w-full max-w-[375px] overflow-hidden rounded-[27px] border border-[#EBD78F] bg-white shadow-[0_24px_70px_rgba(81,61,10,0.18)]">

            <div className="relative overflow-hidden bg-[#FFF8DE] px-6 pb-6 pt-7">

              <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-[#FFE28A] opacity-50" />

              <button
                type="button"
                disabled={
                  verifyingOtp
                }
                onClick={
                  closeEmailOtp
                }
                className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-[11px] bg-white disabled:opacity-50"
              >

                <X
                  size={16}
                />

              </button>

              <div className="relative z-10">

                <div className="flex h-[52px] w-[52px] items-center justify-center rounded-[17px] bg-[#FFB400] text-black">

                  <KeyRound
                    size={22}
                  />

                </div>

                <h2 className="mt-4 text-[20px] font-extrabold text-black">
                  Verify New Email
                </h2>

                <p className="mt-2 text-[10px] leading-5 text-zinc-500">
                  Enter the 6-digit verification code sent to
                </p>

                <p className="mt-1 break-all text-[11px] font-extrabold text-[#A97000]">
                  {pendingEmail}
                </p>

              </div>

            </div>

            <div className="p-5">

              <div className="grid grid-cols-6 gap-2">

                {otp.map(
                  (
                    digit,
                    index
                  ) => (
                    <input
                      key={
                        index
                      }
                      ref={(
                        element
                      ) => {
                        otpRefs.current[
                          index
                        ] =
                          element;
                      }}
                      type="text"
                      inputMode="numeric"
                      autoComplete={
                        index === 0
                          ? "one-time-code"
                          : "off"
                      }
                      maxLength={1}
                      value={
                        digit
                      }
                      disabled={
                        verifyingOtp
                      }
                      onChange={(
                        event
                      ) =>
                        handleOtpChange(
                          index,
                          event.target
                            .value
                        )
                      }
                      onKeyDown={(
                        event
                      ) =>
                        handleOtpKeyDown(
                          index,
                          event
                        )
                      }
                      onPaste={
                        handleOtpPaste
                      }
                      className="h-[52px] min-w-0 rounded-[14px] border border-[#E8D7A5] bg-[#FFFDF8] text-center text-[18px] font-extrabold text-black outline-none focus:border-[#FFB400] focus:ring-4 focus:ring-[#FFB400]/10 disabled:opacity-50"
                    />
                  )
                )}

              </div>

              {emailOtpError && (
                <div className="mt-4 rounded-[13px] border border-red-200 bg-red-50 px-3 py-2.5">

                  <p className="text-[10px] font-semibold text-red-600">
                    {emailOtpError}
                  </p>

                </div>
              )}

              <button
                type="button"
                disabled={
                  verifyingOtp ||
                  otp.join("")
                    .length !== 6
                }
                onClick={
                  verifyEmailOtp
                }
                className="mt-5 flex h-[52px] w-full items-center justify-center gap-2 rounded-[15px] bg-[#FFB400] text-[12px] font-extrabold text-black disabled:opacity-50"
              >

                {verifyingOtp ? (
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />
                ) : (
                  <ShieldCheck
                    size={17}
                  />
                )}

                {verifyingOtp
                  ? "Verifying..."
                  : "Verify Email"}

              </button>

              <button
                type="button"
                disabled={
                  resendSeconds > 0 ||
                  sendingOtp ||
                  verifyingOtp
                }
                onClick={
                  resendEmailOtp
                }
                className="mt-3 flex h-[44px] w-full items-center justify-center gap-2 rounded-[13px] bg-[#FFF5D5] text-[9px] font-extrabold text-[#A97000] disabled:opacity-50"
              >

                {sendingOtp ? (
                  <Loader2
                    size={14}
                    className="animate-spin"
                  />
                ) : (
                  <RefreshCw
                    size={14}
                  />
                )}

                {resendSeconds > 0
                  ? `Resend in ${resendSeconds}s`
                  : "Resend OTP"}

              </button>

            </div>

          </div>

        </div>
      )}

      {/* LOGOUT */}

      {showLogoutPopup && (
        <ConfirmPopup
          icon={
            <LogOut
              size={28}
            />
          }
          title="Logout"
          description="Are you sure you want to sign out of your account?"
          buttonText={
            loggingOut
              ? "Logging out..."
              : "Logout"
          }
          loading={
            loggingOut
          }
          onCancel={() =>
            setShowLogoutPopup(
              false
            )
          }
          onConfirm={
            handleLogout
          }
        />
      )}

      {/* DELETE */}

      {showDeletePopup && (
        <ConfirmPopup
          icon={
            <Trash2
              size={28}
            />
          }
          title="Delete Account"
          description="This permanently removes your Parent account and associated records. This action cannot be undone."
          buttonText={
            deleting
              ? "Deleting..."
              : "Delete"
          }
          loading={
            deleting
          }
          danger
          onCancel={() =>
            setShowDeletePopup(
              false
            )
          }
          onConfirm={
            handleDeleteAccount
          }
        />
      )}

      {/* CSS */}

      <style>{`
        .profile-input {
          width: 100%;
          height: 52px;
          padding-left: 46px;
          padding-right: 14px;
          border: 1.5px solid #E8E2D5;
          border-radius: 14px;
          outline: none;
          font-size: 13px;
          font-weight: 500;
          color: #111111;
          background: #FFFFFF;
          transition: 0.2s ease;
        }

        .profile-input:focus {
          border-color: #FFB400;
          box-shadow: 0 0 0 3px rgba(255, 180, 0, 0.11);
        }

        .profile-input::placeholder {
          color: #A1A1AA;
        }

        .profile-input:disabled {
          border-color: #EAE7DF;
        }
      `}</style>

      {/* BOTTOM NAV */}

      {!showPersonalInfo &&
        !showMapPicker &&
        !showEmailOtp && (
          <BottomNav
            active="profile"
            setActive={
              setTab
            }
          />
        )}

    </div>
  );
}

/* =========================================================
   MAP STATUS
========================================================= */

function MapStatus({
  title,
  message,
  loading = false,
  error = false,
}) {
  return (
    <div className="flex h-full w-full items-center justify-center px-7">

      <div className="max-w-[300px] text-center">

        {loading ? (
          <Loader2
            size={32}
            className="mx-auto animate-spin text-[#B77D00]"
          />
        ) : error ? (
          <AlertCircle
            size={32}
            className="mx-auto text-red-500"
          />
        ) : (
          <MapPin
            size={32}
            className="mx-auto text-[#B77D00]"
          />
        )}

        <h3 className="mt-4 text-[14px] font-extrabold text-black">
          {title}
        </h3>

        <p className="mt-2 text-[9px] leading-5 text-zinc-500">
          {message}
        </p>

      </div>

    </div>
  );
}

/* =========================================================
   OPTION CARD
========================================================= */

function OptionCard({
  children,
}) {
  return (
    <div className="overflow-hidden rounded-[22px] border border-[#EEDB9A] bg-white shadow-[0_8px_24px_rgba(81,62,13,0.045)]">
      {children}
    </div>
  );
}

/* =========================================================
   SECTION HEADER
========================================================= */

function SectionHeader({
  title,
}) {
  return (
    <div className="mb-3 flex items-center justify-between px-1">

      <h3 className="text-[16px] font-extrabold text-black">
        {title}
      </h3>

      <div className="h-[3px] w-8 rounded-full bg-[#FFB400]" />

    </div>
  );
}

/* =========================================================
   SETTING ITEM
========================================================= */

function SettingItem({
  icon,
  title,
  subtitle,
  onClick,
  danger = false,
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className={`
        group flex min-h-[82px] w-full
        items-center px-4 py-3 text-left transition
        ${
          danger
            ? "hover:bg-red-50/50"
            : "hover:bg-[#FFFDF7]"
        }
      `}
    >

      <div
        className={`
          flex h-[47px] w-[47px]
          shrink-0 items-center justify-center
          rounded-[15px] border transition
          ${
            danger
              ? "border-red-100 bg-red-50 text-red-500"
              : "border-[#EEDB99] bg-[#FFF5D5] text-black"
          }
        `}
      >
        {icon}
      </div>

      <div className="ml-4 min-w-0 flex-1">

        <h3
          className={`
            text-[14px] font-semibold
            ${
              danger
                ? "text-red-500"
                : "text-black"
            }
          `}
        >
          {title}
        </h3>

        <p className="mt-[3px] truncate text-[10px] text-zinc-500">
          {subtitle}
        </p>

      </div>

      <ActionArrow
        danger={
          danger
        }
      />

    </button>
  );
}

/* =========================================================
   ACTION ARROW
========================================================= */

function ActionArrow({
  danger = false,
}) {
  return (
    <div
      className={`
        flex h-8 w-8 items-center
        justify-center rounded-[10px] transition
        ${
          danger
            ? "bg-red-50"
            : "bg-[#FFF9E8]"
        }
      `}
    >

      <ChevronRight
        size={17}
        className={
          danger
            ? "text-red-400"
            : "text-zinc-400"
        }
      />

    </div>
  );
}

/* =========================================================
   DIVIDER
========================================================= */

function Divider() {
  return (
    <div className="ml-[78px] h-px bg-[#F0E7D0]" />
  );
}

/* =========================================================
   FORM FIELD
========================================================= */

function FormField({
  label,
  icon,
  hint,
  children,
}) {
  return (
    <div className="mb-4">

      <label className="mb-2 block text-[11px] font-semibold text-black">
        {label}
      </label>

      <div className="relative">

        <div className="absolute left-4 top-1/2 z-10 -translate-y-1/2 text-black">
          {icon}
        </div>

        {children}

      </div>

      {hint && (
        <p className="mt-1.5 text-[8px] leading-4 text-zinc-400">
          {hint}
        </p>
      )}

    </div>
  );
}

/* =========================================================
   CONFIRM POPUP
========================================================= */

function ConfirmPopup({
  icon,
  title,
  description,
  buttonText,
  danger = false,
  loading = false,
  onCancel,
  onConfirm,
}) {
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[#746131]/30 px-5 backdrop-blur-[4px]">

      <div className="w-full max-w-[345px] overflow-hidden rounded-[27px] border border-[#EBD78F] bg-white shadow-[0_24px_70px_rgba(81,61,10,0.18)]">

        <div
          className={`
            px-6 pb-6 pt-7 text-center
            ${
              danger
                ? "bg-red-50"
                : "bg-[#FFF8DE]"
            }
          `}
        >

          <div
            className={`
              mx-auto flex h-[64px] w-[64px]
              items-center justify-center rounded-[21px]
              ${
                danger
                  ? "bg-red-100 text-red-500"
                  : "bg-[#FFF0B8] text-black"
              }
            `}
          >
            {icon}
          </div>

          <h2
            className={`
              mt-4 text-[20px] font-extrabold
              ${
                danger
                  ? "text-red-600"
                  : "text-black"
              }
            `}
          >
            {title}
          </h2>

          <p className="mt-2 text-[11px] leading-5 text-zinc-500">
            {description}
          </p>

        </div>

        <div className="flex gap-3 p-5">

          <button
            type="button"
            disabled={
              loading
            }
            onClick={
              onCancel
            }
            className="h-12 flex-1 rounded-[14px] border border-[#E4E0D6] bg-[#F7F7F4] text-[12px] font-semibold text-black transition hover:bg-[#F0EFEA] disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={
              loading
            }
            onClick={
              onConfirm
            }
            className={`
              flex h-12 flex-1 items-center
              justify-center gap-2 rounded-[14px]
              text-[12px] font-bold transition
              disabled:opacity-60
              ${
                danger
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "bg-[#FFB400] text-black hover:bg-[#F5A900]"
              }
            `}
          >

            {loading && (
              <Loader2
                size={16}
                className="animate-spin"
              />
            )}

            {buttonText}

          </button>

        </div>

      </div>

    </div>
  );
}

/* =========================================================
   PROFILE SKELETON
========================================================= */

function ProfileSkeleton() {
  return (
    <div>

      <div className="flex items-center gap-3">

        <div className="h-[64px] w-[64px] shrink-0 animate-pulse rounded-[20px] bg-[#FFF0B8]" />

        <div className="flex-1">

          <div className="h-5 w-[55%] animate-pulse rounded-full bg-[#EEE9DB]" />

          <div className="mt-3 h-3 w-[35%] animate-pulse rounded-full bg-[#F2EDDF]" />

        </div>

      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">

        <div className="h-[42px] animate-pulse rounded-[13px] bg-[#FFF7E0]" />

        <div className="h-[42px] animate-pulse rounded-[13px] bg-[#FFF7E0]" />

      </div>

    </div>
  );
}

/* =========================================================
   PHONE FORMAT
========================================================= */

function formatPhone(
  phone
) {
  if (!phone) {
    return "Phone not available";
  }

  const value =
    String(
      phone
    ).trim();

  if (
    value.startsWith(
      "+91"
    )
  ) {
    return value;
  }

  if (
    /^\d{10}$/.test(
      value
    )
  ) {
    return `+91 ${value}`;
  }

  return value;
}

export default Profile;
