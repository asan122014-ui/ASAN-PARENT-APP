import { useEffect, useRef, useState } from "react";

import {
  ArrowLeft,
  ChevronRight,
  Pencil,
  User,
  School,
  Clock3,
  MapPin,
  Plus,
  Trash2,
  CalendarDays,
  Users,
  Bookmark,
  HeartPulse,
  Phone,
  Save,
  GraduationCap,
  CheckCircle2,
  AlertTriangle,
  CircleAlert,
  Info,
  Search,
  Loader2,
  Check,
  X,
} from "lucide-react";

import BottomNav from "../../components/layout/BottomNav";
import { API } from "../../api/api";
import { GoogleMap, useJsApiLoader } from "@react-google-maps/api";

const createEmptyForm = () => ({
  name: "",
  age: "",
  gender: "",
  school: "",
  grade: "",
  section: "",
  pickupTime: "",
  eveningPickup: "",
  pickupLocation: "",
  dropoffLocation: "",
  pickupCoords: { lat: null, lng: null },
  dropoffCoords: { lat: null, lng: null },
  medicalNotes: "",
  emergencyContact: "",
});

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const GOOGLE_MAPS_LOADER_ID = "asan-parent-google-map";
const GOOGLE_MAP_LIBRARIES = ["places", "marker"];
const FALLBACK_LOCATION = { lat: 17.385044, lng: 78.486671 };
const mapContainerStyle = { width: "100%", height: "100%" };

const hasValidCoords = (coords) => {
  if (!coords) return false;
  if (coords.lat === null || coords.lat === undefined || coords.lat === "") return false;
  if (coords.lng === null || coords.lng === undefined || coords.lng === "") return false;
  const lat = Number(coords.lat);
  const lng = Number(coords.lng);
  return Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
};

function GoogleLocationPicker({ mapType, initialCoords, initialAddress, onConfirm, onClose }) {
  const validInitialCoords = hasValidCoords(initialCoords)
    ? { lat: Number(initialCoords.lat), lng: Number(initialCoords.lng) }
    : null;

  const [markerPosition, setMarkerPosition] = useState(validInitialCoords || FALLBACK_LOCATION);
  const [mapCenter, setMapCenter] = useState(validInitialCoords || FALLBACK_LOCATION);
  const [selectedAddress, setSelectedAddress] = useState(initialAddress || "");
  const [searchValue, setSearchValue] = useState(initialAddress || "");
  const [geocoding, setGeocoding] = useState(false);
  const [locatingUser, setLocatingUser] = useState(!validInitialCoords);
  const [searching, setSearching] = useState(false);
  const [mapError, setMapError] = useState("");

  const mapRef = useRef(null);
  const advancedMarkerRef = useRef(null);
  const autocompleteHostRef = useRef(null);
  const autocompleteElementRef = useRef(null);

  const { isLoaded: googleMapsLoaded, loadError: googleMapsLoadError } = useJsApiLoader({
    id: GOOGLE_MAPS_LOADER_ID,
    googleMapsApiKey: GOOGLE_MAPS_API_KEY || "",
    libraries: GOOGLE_MAP_LIBRARIES,
  });

  const reverseGeocode = async (lat, lng) => {
    setGeocoding(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}`,
        { headers: { Accept: "application/json" } }
      );
      if (!response.ok) throw new Error(`Reverse geocoding failed (${response.status})`);
      const data = await response.json();
      const address = data?.display_name || `${Number(lat).toFixed(6)}, ${Number(lng).toFixed(6)}`;
      setSelectedAddress(address);
      setSearchValue(address);
      return address;
    } catch (error) {
      console.warn("Reverse geocoding failed:", error);
      const fallback = `${Number(lat).toFixed(6)}, ${Number(lng).toFixed(6)}`;
      setSelectedAddress(fallback);
      setSearchValue(fallback);
      return fallback;
    } finally {
      setGeocoding(false);
    }
  };

  const movePin = (coords, zoom = 17, resolveAddress = true) => {
    if (!hasValidCoords(coords)) return;
    const next = { lat: Number(coords.lat), lng: Number(coords.lng) };
    setMarkerPosition(next);
    setMapCenter(next);
    if (mapRef.current) {
      mapRef.current.panTo(next);
      mapRef.current.setZoom(zoom);
    }
    if (resolveAddress) reverseGeocode(next.lat, next.lng);
  };

  useEffect(() => {
    if (!googleMapsLoaded || googleMapsLoadError) return;
    if (validInitialCoords) {
      setLocatingUser(false);
      if (!initialAddress) reverseGeocode(validInitialCoords.lat, validInitialCoords.lng);
      return;
    }
    if (!navigator.geolocation) {
      setLocatingUser(false);
      if (!initialAddress) reverseGeocode(FALLBACK_LOCATION.lat, FALLBACK_LOCATION.lng);
      return;
    }
    setLocatingUser(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = { lat: position.coords.latitude, lng: position.coords.longitude };
        movePin(coords, 17, true);
        setLocatingUser(false);
      },
      (error) => {
        console.warn("Unable to get current location:", error);
        setLocatingUser(false);
        if (!initialAddress) reverseGeocode(FALLBACK_LOCATION.lat, FALLBACK_LOCATION.lng);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  }, [googleMapsLoaded, googleMapsLoadError]);

  useEffect(() => {
    if (!googleMapsLoaded || !window.google?.maps?.places || !autocompleteHostRef.current) return;
    if (!window.google.maps.places.PlaceAutocompleteElement) return;

    const host = autocompleteHostRef.current;
    host.innerHTML = "";

    const autocomplete = new window.google.maps.places.PlaceAutocompleteElement({
      includedRegionCodes: ["in"],
    });
    autocomplete.placeholder = mapType === "pickup"
      ? "Search home area, building or street..."
      : "Search school area, building or street...";
    autocomplete.style.width = "100%";
    autocomplete.style.height = "48px";
    autocompleteElementRef.current = autocomplete;
    host.appendChild(autocomplete);

    const handleSelect = async (event) => {
      try {
        setSearching(true);
        const prediction = event.placePrediction;
        if (!prediction) return;
        const place = prediction.toPlace();
        await place.fetchFields({ fields: ["displayName", "formattedAddress", "location"] });
        if (!place.location) return;
        const coords = { lat: place.location.lat(), lng: place.location.lng() };
        const address = place.formattedAddress || place.displayName || `${coords.lat}, ${coords.lng}`;
        setSelectedAddress(address);
        setSearchValue(address);
        movePin(coords, 17, false);
      } catch (error) {
        console.error("Place search failed:", error);
        setMapError("Unable to open that search result. Please try another location.");
      } finally {
        setSearching(false);
      }
    };

    autocomplete.addEventListener("gmp-select", handleSelect);
    return () => {
      autocomplete.removeEventListener("gmp-select", handleSelect);
      if (host.contains(autocomplete)) host.removeChild(autocomplete);
      autocompleteElementRef.current = null;
    };
  }, [googleMapsLoaded, mapType]);

  useEffect(() => {
    if (!googleMapsLoaded || !mapRef.current || !window.google?.maps?.marker?.AdvancedMarkerElement) return;

    if (!advancedMarkerRef.current) {
      const marker = new window.google.maps.marker.AdvancedMarkerElement({
        map: mapRef.current,
        position: markerPosition,
        gmpDraggable: true,
        title: mapType === "pickup" ? "Home location" : "School location",
      });
      marker.addListener("dragend", () => {
        const position = marker.position;
        if (!position) return;
        const lat = typeof position.lat === "function" ? position.lat() : Number(position.lat);
        const lng = typeof position.lng === "function" ? position.lng() : Number(position.lng);
        movePin({ lat, lng }, mapRef.current?.getZoom() || 17, true);
      });
      advancedMarkerRef.current = marker;
    } else {
      advancedMarkerRef.current.map = mapRef.current;
      advancedMarkerRef.current.position = markerPosition;
    }
  }, [googleMapsLoaded, markerPosition, mapType]);

  useEffect(() => () => {
    if (advancedMarkerRef.current) {
      advancedMarkerRef.current.map = null;
      advancedMarkerRef.current = null;
    }
  }, []);

  const handleMapClick = (event) => {
    if (!event.latLng) return;
    movePin({ lat: event.latLng.lat(), lng: event.latLng.lng() }, mapRef.current?.getZoom() || 17, true);
  };

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      setMapError("Location access is not available on this device.");
      return;
    }
    setMapError("");
    setLocatingUser(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        movePin({ lat: position.coords.latitude, lng: position.coords.longitude }, 17, true);
        setLocatingUser(false);
      },
      (error) => {
        console.warn("Current location failed:", error);
        setLocatingUser(false);
        setMapError("Unable to access your current location. Please allow location permission and try again.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 15000 }
    );
  };

  const handleConfirm = () => {
    if (!hasValidCoords(markerPosition) || !selectedAddress.trim()) return;
    onConfirm({ address: selectedAddress.trim(), lat: Number(markerPosition.lat), lng: Number(markerPosition.lng) });
  };

  const isPickup = mapType === "pickup";
  const locationLabel = isPickup ? "Home Location" : "School Location";

  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-[#FFF9EE]">
      <div className="relative z-30 border-b border-[#E9D7A0] bg-[#FFF9EE]/95 px-4 pb-3 pt-[max(16px,env(safe-area-inset-top))] shadow-sm backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-[500px] flex-col gap-3">
          <div className="flex items-center gap-3">
            <button type="button" onClick={onClose} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] border border-[#E9D7A0] bg-white text-black shadow-sm transition active:scale-95">
              <ArrowLeft size={20} />
            </button>
            <div className="flex-1">
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#B97E00]">Pinpoint Location</span>
              <h2 className="text-[16px] font-extrabold text-black">{isPickup ? "Select Home Address" : "Select School Address"}</h2>
            </div>
            <button type="button" onClick={handleCurrentLocation} className="flex h-11 items-center gap-2 rounded-[15px] border border-[#E9D7A0] bg-white px-3 text-[11px] font-bold text-black shadow-sm active:scale-95">
              <MapPin size={16} className="text-[#C58800]" />
              My Location
            </button>
          </div>

          {googleMapsLoaded && window.google?.maps?.places?.PlaceAutocompleteElement ? (
            <div className="relative w-full rounded-[16px] border border-[#E9D7A0] bg-white px-2 py-1 shadow-sm">
              <div ref={autocompleteHostRef} className="w-full" />
              {searching && <Loader2 size={16} className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-[#C58800]" />}
            </div>
          ) : googleMapsLoaded ? (
            <div className="flex h-[48px] items-center rounded-[16px] border border-[#E9D7A0] bg-white px-3.5 text-xs text-zinc-500 shadow-sm">
              <Search size={18} className="mr-2 text-[#C58800]" />
              Search is unavailable. You can still tap the map to choose a location.
            </div>
          ) : null}
        </div>
      </div>

      <div className="relative min-h-0 flex-1 w-full bg-[#E5E3DF]">
        {!GOOGLE_MAPS_API_KEY ? (
          <div className="flex h-full items-center justify-center p-6 text-center">
            <div className="max-w-sm rounded-[20px] border border-amber-200 bg-white p-6 shadow-sm">
              <AlertTriangle className="mx-auto mb-2 text-amber-500" size={32} />
              <p className="text-sm font-bold text-black">Google Maps API key missing</p>
              <p className="mt-1 text-xs text-zinc-500">Configure VITE_GOOGLE_MAPS_API_KEY and rebuild the app.</p>
            </div>
          </div>
        ) : googleMapsLoadError ? (
          <div className="flex h-full items-center justify-center p-6 text-center">
            <div className="max-w-sm rounded-[20px] border border-red-200 bg-white p-6 shadow-sm">
              <AlertTriangle className="mx-auto mb-2 text-red-500" size={32} />
              <p className="text-sm font-bold text-black">Google Maps could not load</p>
              <p className="mt-1 text-xs text-zinc-500">Check billing, API restrictions and allowed website referrers for this key.</p>
            </div>
          </div>
        ) : !googleMapsLoaded ? (
          <div className="flex h-full items-center justify-center">
            <div className="flex items-center gap-3 rounded-2xl border border-[#E9D7A0] bg-white px-5 py-4 shadow-md">
              <Loader2 size={22} className="animate-spin text-[#C58800]" />
              <span className="text-xs font-bold text-black">Loading map...</span>
            </div>
          </div>
        ) : (
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={mapCenter}
            zoom={16}
            onLoad={(map) => { mapRef.current = map; map.panTo(markerPosition); }}
            onUnmount={() => {
              if (advancedMarkerRef.current) advancedMarkerRef.current.map = null;
              mapRef.current = null;
            }}
            onClick={handleMapClick}
            options={{
              mapId: "DEMO_MAP_ID",
              disableDefaultUI: true,
              zoomControl: true,
              clickableIcons: false,
              gestureHandling: "greedy",
              streetViewControl: false,
              mapTypeControl: false,
              fullscreenControl: false,
            }}
          />
        )}

        {locatingUser && (
          <div className="absolute left-1/2 top-4 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full border border-[#E9D7A0] bg-white/95 px-4 py-2 shadow-md backdrop-blur-sm">
            <Loader2 size={14} className="animate-spin text-[#C58800]" />
            <span className="text-[11px] font-semibold text-black">Locating you...</span>
          </div>
        )}
      </div>

      <div className="relative z-30 border-t border-[#E9D7A0] bg-white px-4 pb-[max(18px,env(safe-area-inset-bottom))] pt-4 shadow-[0_-8px_25px_rgba(0,0,0,0.06)]">
        <div className="mx-auto w-full max-w-[500px]">
          {mapError && <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[11px] font-semibold text-red-700">{mapError}</div>}
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-[#FFEAAE] text-[#C58800]"><MapPin size={22} /></div>
            <div className="min-w-0 flex-1">
              <span className="text-[9px] font-extrabold uppercase tracking-wider text-[#B97E00]">{locationLabel}</span>
              {geocoding ? (
                <div className="mt-1 flex items-center gap-2 text-xs font-semibold text-zinc-500"><Loader2 size={13} className="animate-spin text-[#C58800]" /><span>Fetching address...</span></div>
              ) : (
                <p className="mt-1 line-clamp-2 text-[13px] font-bold leading-tight text-black">{selectedAddress || "Tap the map or search to place the pin"}</p>
              )}
              {hasValidCoords(markerPosition) && <p className="mt-0.5 text-[10px] font-medium text-zinc-400">{Number(markerPosition.lat).toFixed(5)}, {Number(markerPosition.lng).toFixed(5)}</p>}
            </div>
          </div>

          <button
            type="button"
            disabled={!selectedAddress.trim() || geocoding || !hasValidCoords(markerPosition)}
            onClick={handleConfirm}
            className="mt-3.5 flex h-[52px] w-full items-center justify-between rounded-[16px] bg-[#FFB400] px-4 font-extrabold text-black shadow-md transition active:scale-[0.99] disabled:pointer-events-none disabled:opacity-50"
          >
            <div className="text-left">
              <p className="text-[13px] font-extrabold">Confirm {isPickup ? "Home" : "School"} Location</p>
              <p className="text-[8px] font-semibold text-black/60">Save this address to child profile</p>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-black text-white"><Check size={16} /></div>
          </button>
        </div>
      </div>
    </div>
  );
}

function Children({
  setTab,
}) {
  /* =======================================================
     STATE
  ======================================================= */

  const [
    children,
    setChildren,
  ] =
    useState([]);

  const [
    showForm,
    setShowForm,
  ] =
    useState(false);

  const [
    editingChild,
    setEditingChild,
  ] =
    useState(null);

  const [
    mapType,
    setMapType,
  ] =
    useState(null);

  const [
    form,
    setForm,
  ] =
    useState(
      createEmptyForm()
    );

  const [
    loading,
    setLoading,
  ] =
    useState(false);

  const [
    fetching,
    setFetching,
  ] =
    useState(true);

  const [
    locationRequestType,
    setLocationRequestType,
  ] = useState("");
  const [locationReason, setLocationReason] = useState("");
  const [locationRequestLoading, setLocationRequestLoading] = useState(false);
  const [approvedLocationRequest, setApprovedLocationRequest] = useState(null);
  const [locationChoiceType, setLocationChoiceType] = useState("");
  const [pendingLocationPayment, setPendingLocationPayment] = useState(null);
  const [locationPaymentPreview, setLocationPaymentPreview] = useState(null);
  const [locationAccessAllowed, setLocationAccessAllowed] = useState(false);
  const [locationAccessCode, setLocationAccessCode] = useState("");
  useEffect(() => {
    let cancelled = false;
    setLocationAccessCode("");
    setLocationAccessAllowed(false);
    let retry;
    if (locationPaymentPreview?._id) {
      const checkAccess = () => API.get("/child-location-changes/developer-access")
        .then((response) => {
          if (!cancelled) setLocationAccessAllowed(response.data?.data?.allowed === true);
          clearInterval(retry);
        })
        .catch(() => {});
      retry = setInterval(checkAccess, 5000);
      checkAccess();
    }
    return () => { cancelled = true; clearInterval(retry); };
  }, [locationPaymentPreview?._id]);

  /* =======================================================
     APP DIALOG STATE
  ======================================================= */

  const [
    dialog,
    setDialog,
  ] =
    useState({
      open:
        false,

      type:
        "info",

      title:
        "",

      message:
        "",

      confirmText:
        "OK",

      cancelText:
        "Cancel",

      showCancel:
        false,

      onConfirm:
        null,
    });

  /* =======================================================
     SHOW MESSAGE
  ======================================================= */

  const showMessage =
    ({
      title =
        "ASANRIDES",

      message =
        "",

      type =
        "info",

      confirmText =
        "OK",
    }) => {
      setDialog({
        open:
          true,

        type,

        title,

        message,

        confirmText,

        cancelText:
          "Cancel",

        showCancel:
          false,

        onConfirm:
          null,
      });
    };

  /* =======================================================
     SHOW CONFIRMATION
  ======================================================= */

  const showConfirm =
    ({
      title =
        "Please Confirm",

      message =
        "",

      type =
        "warning",

      confirmText =
        "Confirm",

      cancelText =
        "Cancel",

      onConfirm,
    }) => {
      setDialog({
        open:
          true,

        type,

        title,

        message,

        confirmText,

        cancelText,

        showCancel:
          true,

        onConfirm:
          typeof onConfirm ===
          "function"
            ? onConfirm
            : null,
      });
    };

  /* =======================================================
     CLOSE DIALOG
  ======================================================= */

  const closeDialog =
    () => {
      setDialog(
        (
          previous
        ) => ({
          ...previous,

          open:
            false,

          onConfirm:
            null,
        })
      );
    };

  /* =======================================================
     CONFIRM DIALOG
  ======================================================= */

  const confirmDialog =
    async () => {
      const callback =
        dialog.onConfirm;

      closeDialog();

      if (
        typeof callback ===
        "function"
      ) {
        await callback();
      }
    };

  /* =======================================================
     LOAD CHILDREN
  ======================================================= */

  useEffect(() => {
    fetchChildren();
  }, []);

  /* =======================================================
     FETCH CHILDREN
  ======================================================= */

  const fetchChildren =
    async () => {
      try {
        setFetching(
          true
        );

        const storedParent =
          localStorage.getItem(
            "parent"
          );

        if (
          !storedParent
        ) {
          setChildren([]);

          return;
        }

        let parent =
          null;

        try {
          parent =
            JSON.parse(
              storedParent
            );
        } catch {
          parent =
            null;
        }

        if (
          !parent?._id
        ) {
          setChildren([]);

          return;
        }

        const res =
          await API.get(
            `/children/parent/${parent._id}`
          );

        const data =
          Array.isArray(
            res.data?.data
          )
            ? res.data.data
            : [];

        setChildren(
          data
        );
      } catch (
        err
      ) {
        console.error(
          "Fetch children error:",
          err?.response
            ?.data ||
            err
        );

        showMessage({
          type:
            "error",

          title:
            "Unable to Load Children",

          message:
            err?.response
              ?.data
              ?.message ||
            "We couldn't load your children's information. Please try again.",
        });
      } finally {
        setFetching(
          false
        );
      }
    };

  /* =======================================================
     OPEN ADD CHILD
  ======================================================= */

  const openAddChild =
    () => {
      setEditingChild(
        null
      );

      setForm(
        createEmptyForm()
      );

      setMapType(
        null
      );

      setShowForm(
        true
      );
    };

  /* =======================================================
     OPEN EDIT CHILD
  ======================================================= */

  const handleEdit =
    (
      child
    ) => {
      setLocationRequestType("");
      setLocationChoiceType("");
      setPendingLocationPayment(null);
      setApprovedLocationRequest(null);
      setEditingChild(
        child
      );

      setForm({
        name:
          child?.name ||
          "",

        age:
          child?.age ||
          "",

        gender:
          child?.gender ||
          "",

        school:
          child?.school ||
          "",

        grade:
          child?.grade ||
          "",

        section:
          child?.section ||
          "",

        pickupTime:
          child?.pickupTime ||
          "",

        eveningPickup:
          child?.eveningPickup ||
          "",

        pickupLocation:
          child?.pickupLocation ||
          "",

        dropoffLocation:
          child?.dropoffLocation ||
          "",

        pickupCoords: {
          lat:
            child
              ?.location
              ?.lat ??
            null,

          lng:
            child
              ?.location
              ?.lng ??
            null,
        },

        dropoffCoords: {
          lat:
            child
              ?.dropLocationCoords
              ?.lat ??
            null,

          lng:
            child
              ?.dropLocationCoords
              ?.lng ??
            null,
        },

        medicalNotes:
          child
            ?.medicalNotes ||
          "",

        emergencyContact:
          child
            ?.emergencyContact ||
          "",
      });

      setMapType(
        null
      );

      setShowForm(
        true
      );
    };

  const beginLocationChange = async (locationType) => {
    if (!editingChild?._id) return;
    try {
      const response = await API.get(`/child-location-changes/children/${editingChild._id}`);
      const requests = response.data?.data || [];
      const approved = requests.find((item) => item.locationType === locationType && item.status === "approved");
      if (approved) {
        setApprovedLocationRequest(approved);
        setMapType(locationType === "home" ? "pickup" : "drop");
        return;
      }
      const pending = requests.find((item) => item.locationType === locationType && ["pending", "awaiting_payment"].includes(item.status));
      if (pending) {
        if (pending.status === "awaiting_payment") {
          try {
            const reconciliation = await API.post(`/child-location-changes/${pending._id}/reconcile`);
            if (reconciliation.data?.data?.paid) {
              await fetchChildren();
              setPendingLocationPayment(null);
              setLocationChoiceType(locationType);
              showMessage({ title: "Payment confirmed", type: "success", message: "Your updated location is active. You can continue with it or request another change." });
              return;
            }
          } catch {
            // If no captured payment exists, keep the resume-payment choices below.
          }
          setPendingLocationPayment(pending);
          setLocationChoiceType("");
          return;
        }
        showMessage({ title: "Request in progress", message: pending.status === "pending" ? "Your request will be processed by the end of the day, and an agent will call to confirm the location change." : "Complete the location price adjustment before starting another request." });
        return;
      }
      setPendingLocationPayment(null);
      const completed = requests.find((item) => item.locationType === locationType && item.status === "completed");
      if (completed) {
        setLocationChoiceType(locationType);
        return;
      }
      setLocationRequestType(locationType);
      setLocationReason("");
    } catch (error) {
      showMessage({ title: "Unable to check request", type: "error", message: error.response?.data?.message || "Please try again in a moment." });
    }
  };

  const submitLocationChangeReason = async () => {
    if (!editingChild?._id || locationReason.trim().length < 5) {
      showMessage({ title: "Add a reason", type: "warning", message: "Please explain why this location needs to change (at least 5 characters)." });
      return;
    }
    setLocationRequestLoading(true);
    try {
      const response = await API.post(`/child-location-changes/children/${editingChild._id}`, { locationType: locationRequestType, reason: locationReason.trim() });
      setLocationRequestType("");
      setLocationReason("");
      showMessage({ title: "Request sent", type: "success", message: response.data?.message || "Your request will be processed by the end of the day, and an agent will call to confirm the location change." });
    } catch (error) {
      showMessage({ title: "Request not sent", type: "error", message: error.response?.data?.message || "Please try again later." });
    } finally {
      setLocationRequestLoading(false);
    }
  };

  const continuePendingLocationPayment = async () => {
    const request = pendingLocationPayment;
    if (!request?._id) return;
    setLocationPaymentPreview(request);
    setPendingLocationPayment(null);
  };

  const applyLocationAccessCode = async () => {
    const request = locationPaymentPreview;
    if (!request?._id || !locationAccessCode.trim()) return;
    setLocationRequestLoading(true);
    try {
      await API.post(`/child-location-changes/${request._id}/developer-apply`, { code: locationAccessCode.trim() });
      setForm((previous) => ({ ...previous,
        [request.locationType === "home" ? "pickupLocation" : "dropoffLocation"]: request.proposedAddress,
        [request.locationType === "home" ? "pickupCoords" : "dropoffCoords"]: request.proposedCoordinates,
      }));
      await fetchChildren();
      setLocationPaymentPreview(null);
      showMessage({ title: "Location changed", type: "success", message: "Your new location is active." });
    } catch (error) {
      showMessage({ title: "Unable to change location", type: "error", message: error.response?.data?.message || "Please try again." });
    } finally { setLocationRequestLoading(false); }
  };

  const payLocationAdjustment = async () => {
    const request = locationPaymentPreview;
    if (!request?._id) return;
    setLocationRequestLoading(true);
    try {
      const orderResponse = await API.post(`/child-location-changes/${request._id}/order`);
      setLocationPaymentPreview(null);
      await checkoutLocationAdjustment(request, orderResponse.data?.data);
    } catch (error) {
      showMessage({ title: "Payment could not be opened", type: "error", message: error.response?.data?.message || error.message || "Please try again." });
    } finally {
      setLocationRequestLoading(false);
    }
  };

  const revisePendingLocation = async () => {
    const request = pendingLocationPayment;
    if (!request?._id) return;
    setLocationRequestLoading(true);
    try {
      const response = await API.post(`/child-location-changes/${request._id}/revise`);
      setPendingLocationPayment(null);
      setApprovedLocationRequest(response.data?.data || request);
      setMapType(request.locationType === "home" ? "pickup" : "drop");
    } catch (error) {
      showMessage({ title: "Unable to change location", type: "error", message: error.response?.data?.message || "Please try again." });
    } finally {
      setLocationRequestLoading(false);
    }
  };

  const checkoutLocationAdjustment = async (request, order) => {
    if (!order?.keyId || !order?.order_id) throw new Error("Payment checkout is unavailable right now.");
    if (!window.Razorpay) await new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = resolve;
      script.onerror = () => reject(new Error("Payment checkout could not be loaded."));
      document.body.appendChild(script);
    });
    const dueNow = (Number(order.amount) / 100).toFixed(2);
    const nextMonthlyPrice = Number(request.newMonthlyPrice || 0).toFixed(2);
    const checkout = new window.Razorpay({ key: order.keyId, amount: order.amount, currency: order.currency, order_id: order.order_id, name: "ASAN RIDES", description: `One-time route adjustment ₹${dueNow}; new monthly price ₹${nextMonthlyPrice}`, handler: async (payment) => {
      try {
        await API.post(`/child-location-changes/${request._id}/verify`, payment);
        setForm((previous) => ({ ...previous, [request.locationType === "home" ? "pickupLocation" : "dropoffLocation"]: request.proposedAddress || previous[request.locationType === "home" ? "pickupLocation" : "dropoffLocation"], [request.locationType === "home" ? "pickupCoords" : "dropoffCoords"]: request.proposedCoordinates || previous[request.locationType === "home" ? "pickupCoords" : "dropoffCoords"] }));
        await fetchChildren();
        setLocationChoiceType(request.locationType);
        showMessage({ title: "Location updated", type: "success", message: `Payment received. Your new route is active and the monthly price is ₹${Number(request.newMonthlyPrice).toFixed(2)}.` });
      } catch (error) {
        try {
          const recovery = await API.post(`/child-location-changes/${request._id}/reconcile`);
          if (recovery.data?.data?.paid) {
            setForm((previous) => ({ ...previous, [request.locationType === "home" ? "pickupLocation" : "dropoffLocation"]: request.proposedAddress || previous[request.locationType === "home" ? "pickupLocation" : "dropoffLocation"], [request.locationType === "home" ? "pickupCoords" : "dropoffCoords"]: request.proposedCoordinates || previous[request.locationType === "home" ? "pickupCoords" : "dropoffCoords"] }));
            await fetchChildren();
            setLocationChoiceType(request.locationType);
            showMessage({ title: "Location updated", type: "success", message: `Payment received. Your new route is active and the monthly price is ₹${Number(request.newMonthlyPrice).toFixed(2)}.` });
            return;
          }
        } catch (recoveryError) {
          showMessage({ title: "Payment verification pending", type: "error", message: recoveryError.response?.data?.message || error.response?.data?.message || recoveryError.message || "Payment status is being checked. Please refresh before trying again." });
          return;
        }
        showMessage({ title: "Payment verification pending", type: "error", message: error.response?.data?.message || "Razorpay has not confirmed a captured payment yet. Please check again shortly." });
      }
    }, modal: { ondismiss: () => showMessage({ title: "Payment not completed", message: "Your new location has not been applied. Reopen this location request to complete the price adjustment." }) } });
    checkout.on("payment.failed", (event) => showMessage({ title: "Payment failed", type: "error", message: event.error?.description || "The route price adjustment was not paid. Your current location remains active." }));
    checkout.open();
  };

  const confirmApprovedLocation = async (data) => {
    const request = approvedLocationRequest;
    if (!request?._id) return;
    setLocationRequestLoading(true);
    try {
      const response = await API.post(`/child-location-changes/${request._id}/location`, { address: data.address, lat: data.lat, lng: data.lng });
      const result = response.data?.data || {};
      setMapType(null);
      setLocationChoiceType("");
      setPendingLocationPayment(null);
      setApprovedLocationRequest(null);
      if (result.amountDue > 0) {
        setLocationPaymentPreview({
          ...request,
          childId: editingChild?._id || request.childId,
          locationType: request.locationType,
          proposedAddress: data.address,
          proposedCoordinates: { lat: data.lat, lng: data.lng },
          oldDistanceKm: result.oldDistanceKm,
          newDistanceKm: result.newDistanceKm,
          addedDistanceKm: result.addedDistanceKm,
          remainingServiceDays: result.remainingServiceDays,
          extraDistanceDailyCharge: result.extraDistanceDailyCharge,
          distanceChargeDue: result.distanceChargeDue,
          platformFeeDue: result.platformFeeDue,
          currentMonthlyPrice: result.currentMonthlyPrice,
          newMonthlyPrice: result.newMonthlyPrice,
          amountDue: result.amountDue,
        });
        return;
      }
      setForm((previous) => ({ ...previous, [request.locationType === "home" ? "pickupLocation" : "dropoffLocation"]: data.address, [request.locationType === "home" ? "pickupCoords" : "dropoffCoords"]: { lat: data.lat, lng: data.lng } }));
      await fetchChildren();
      showMessage({ title: "Location updated", type: "success", message: result.message || "The approved location has been updated." });
    } catch (error) {
      showMessage({ title: "Location not updated", type: "error", message: error.response?.data?.message || error.message || "Please try again later." });
    } finally {
      setLocationRequestLoading(false);
    }
  };

  /* =======================================================
     CLOSE FORM
  ======================================================= */

  const closeForm =
    () => {
      if (
        loading
      ) {
        return;
      }

      setShowForm(
        false
      );

      setLocationRequestType("");
      setLocationChoiceType("");
      setPendingLocationPayment(null);
      setApprovedLocationRequest(null);
      setLocationPaymentPreview(null);

      setEditingChild(
        null
      );

      setForm(
        createEmptyForm()
      );

      setMapType(
        null
      );
    };

  /* =======================================================
     UPDATE FORM
  ======================================================= */

  const updateForm =
    (
      key,
      value
    ) => {
      setForm(
        (
          previous
        ) => ({
          ...previous,

          [key]:
            value,
        })
      );
    };

  /* =======================================================
     VALIDATE FORM
  ======================================================= */

  const validateForm =
    () => {
      if (editingChild) {
        if (!form.grade.trim()) {
          showMessage({ type: "warning", title: "Class Required", message: "Please enter the child's class or grade." });
          return false;
        }
        if (!form.pickupTime || !form.eveningPickup) {
          showMessage({ type: "warning", title: "Pickup Times Required", message: "Please enter the home and school pickup times." });
          return false;
        }
        return true;
      }
      if (
        !form.name.trim()
      ) {
        showMessage({
          type:
            "warning",

          title:
            "Child Name Required",

          message:
            "Please enter the child's full name.",
        });

        return false;
      }

      const age =
        Number(
          form.age
        );

      if (
        !Number.isInteger(
          age
        ) ||
        age < 1 ||
        age > 17
      ) {
        showMessage({
          type:
            "warning",

          title:
            "Invalid Age",

          message:
            "Please enter a valid age between 1 and 17 years.",
        });

        return false;
      }

      if (
        !form.school.trim()
      ) {
        showMessage({
          type:
            "warning",

          title:
            "School Required",

          message:
            "Please enter the child's school name.",
        });

        return false;
      }

      if (
        !form.grade.trim()
      ) {
        showMessage({
          type:
            "warning",

          title:
            "Class Required",

          message:
            "Please enter the child's class or grade.",
        });

        return false;
      }

      if (
        !form.pickupTime
      ) {
        showMessage({
          type:
            "warning",

          title:
            "Home Pickup Time Required",

          message:
            "Please select the pickup time from home.",
        });

        return false;
      }

      if (
        !form.eveningPickup
      ) {
        showMessage({
          type:
            "warning",

          title:
            "School Pickup Time Required",

          message:
            "Please select the pickup time from school.",
        });

        return false;
      }

      if (
        !String(
          form.pickupLocation ||
          ""
        ).trim()
      ) {
        showMessage({
          type:
            "warning",

          title:
            "Home Location Required",

          message:
            "Please select the child's pickup location.",
        });

        return false;
      }

      if (
        form.pickupCoords
          ?.lat ===
          null ||
        form.pickupCoords
          ?.lat ===
          undefined ||
        form.pickupCoords
          ?.lng ===
          null ||
        form.pickupCoords
          ?.lng ===
          undefined
      ) {
        showMessage({
          type:
            "warning",

          title:
            "Exact Home Location Required",

          message:
            "Please select the exact home pickup point on the map.",
        });

        return false;
      }

      if (
        !String(
          form.dropoffLocation ||
          ""
        ).trim()
      ) {
        showMessage({
          type:
            "warning",

          title:
            "School Location Required",

          message:
            "Please select the child's school location.",
        });

        return false;
      }

      if (
        form.dropoffCoords
          ?.lat ===
          null ||
        form.dropoffCoords
          ?.lat ===
          undefined ||
        form.dropoffCoords
          ?.lng ===
          null ||
        form.dropoffCoords
          ?.lng ===
          undefined
      ) {
        showMessage({
          type:
            "warning",

          title:
            "Exact School Location Required",

          message:
            "Please select the exact school location on the map.",
        });

        return false;
      }

      if (
        form.emergencyContact &&
        !/^[6-9]\d{9}$/.test(
          form.emergencyContact
        )
      ) {
        showMessage({
          type:
            "warning",

          title:
            "Invalid Emergency Contact",

          message:
            "Please enter a valid 10-digit mobile number.",
        });

        return false;
      }

      return true;
    };

  /* =======================================================
     CREATE PAYLOAD
  ======================================================= */

  const createPayload =
    (
      includeParent =
        false
    ) => {
      const payload =
        {
          name:
            form.name.trim(),

          age:
            Number(
              form.age
            ),

          gender:
            form.gender,

          school:
            form.school.trim(),

          grade:
            form.grade.trim(),

          section:
            form.section.trim(),

          pickupTime:
            form.pickupTime,

          eveningPickup:
            form.eveningPickup,

          pickupLocation:
            form.pickupLocation,

          dropoffLocation:
            form.dropoffLocation,

          location: {
            lat:
              form
                .pickupCoords
                .lat,

            lng:
              form
                .pickupCoords
                .lng,
          },

          dropLocationCoords:
            {
              lat:
                form
                  .dropoffCoords
                  .lat,

              lng:
                form
                  .dropoffCoords
                  .lng,
            },

          medicalNotes:
            form
              .medicalNotes
              .trim(),

          emergencyContact:
            form
              .emergencyContact,
        };

      if (
        includeParent
      ) {
        const storedParent =
          localStorage.getItem(
            "parent"
          );

        let parent =
          null;

        if (
          storedParent
        ) {
          try {
            parent =
              JSON.parse(
                storedParent
              );
          } catch {
            parent =
              null;
          }
        }

        payload.parentId =
          parent?._id;

        if (
          parent?.driverId
        ) {
          payload.driverId =
            parent.driverId;
        }
      }

      return payload;
    };

  /* =======================================================
     SUBMIT
  ======================================================= */

  const handleSubmit =
    async () => {
      if (
        !validateForm()
      ) {
        return;
      }

      try {
        setLoading(
          true
        );

        const storedParent =
          localStorage.getItem(
            "parent"
          );

        let parent =
          null;

        if (
          storedParent
        ) {
          try {
            parent =
              JSON.parse(
                storedParent
              );
          } catch {
            parent =
              null;
          }
        }

        if (
          !parent?._id
        ) {
          showMessage({
            type:
              "error",

            title:
              "Session Error",

            message:
              "Your Parent account information is unavailable. Please sign in again.",
          });

          return;
        }

        /* =================================================
           EDIT CHILD
        ================================================= */

        if (
          editingChild?._id
        ) {
          const payload = {
            grade: form.grade.trim(),
            pickupTime: form.pickupTime,
            eveningPickup: form.eveningPickup,
          };

          const res =
            await API.put(
              `/children/${editingChild._id}`,

              payload
            );

          const updatedChild =
            res.data?.data;

          if (
            updatedChild
          ) {
            setChildren(
              (
                previous
              ) =>
                previous.map(
                  (
                    child
                  ) =>
                    child._id ===
                    editingChild._id
                      ? updatedChild
                      : child
                )
            );
          } else {
            await fetchChildren();
          }

          setEditingChild(
            null
          );

          setForm(
            createEmptyForm()
          );

          setShowForm(
            false
          );

          setMapType(
            null
          );

          showMessage({
            type:
              "success",

            title:
              "Child Updated",

            message:
              "The child's information and ride details were updated successfully.",
          });

          return;
        }

        /* =================================================
           ADD CHILD
        ================================================= */

        const payload =
          createPayload(
            true
          );

        const res =
          await API.post(
            "/children/add",

            payload
          );

        const savedChild =
          res.data?.data;

        if (
          savedChild
        ) {
          setChildren(
            (
              previous
            ) => [
              ...previous,

              savedChild,
            ]
          );
        } else {
          await fetchChildren();
        }

        setForm(
          createEmptyForm()
        );

        setEditingChild(
          null
        );

        setShowForm(
          false
        );

        setMapType(
          null
        );

        showMessage({
          type:
            "success",

          title:
            "Child Added",

          message:
            "The child profile and transportation details were saved successfully.",
        });
      } catch (
        err
      ) {
        console.error(
          editingChild
            ? "Update child error:"
            : "Add child error:",

          err?.response
            ?.data ||
            err
        );

        showMessage({
          type:
            "error",

          title:
            editingChild
              ? "Update Failed"
              : "Unable to Add Child",

          message:
            err?.response
              ?.data
              ?.message ||
            (editingChild
              ? "The child's details could not be updated. Please try again."
              : "The child could not be added. Please try again."),
        });
      } finally {
        setLoading(
          false
        );
      }
    };

  /* =======================================================
     DELETE CHILD
  ======================================================= */

  const handleDelete =
    (
      id
    ) => {
      if (
        !id
      ) {
        return;
      }

      showConfirm({
        type:
          "danger",

        title:
          "Delete Child?",

        message:
          "This child profile and its saved ride information will be permanently removed. This action cannot be undone.",

        confirmText:
          "Delete",

        cancelText:
          "Keep Child",

        onConfirm:
          async () => {
            try {
              await API.delete(
                `/children/${id}`
              );

              setChildren(
                (
                  previous
                ) =>
                  previous.filter(
                    (
                      child
                    ) =>
                      child._id !==
                      id
                  )
              );

              showMessage({
                type:
                  "success",

                title:
                  "Child Removed",

                message:
                  "The child profile was deleted successfully.",
              });
            } catch (
              err
            ) {
              console.error(
                "Delete child error:",

                err?.response
                  ?.data ||
                  err
              );

              showMessage({
                type:
                  "error",

                title:
                  "Delete Failed",

                message:
                  err?.response
                    ?.data
                    ?.message ||
                  "The child profile could not be deleted. Please try again.",
              });
            }
          },
      });
    };

  /* =======================================================
     ADD / EDIT CHILD SCREEN
  ======================================================= */

  if (
    showForm
  ) {
    return (
      <>
        <div
          className="
            flex
            min-h-screen
            justify-center
            bg-[#FFF9EE]
          "
        >
          <div
            className="
              min-h-screen
              w-full
              max-w-[475px]
              pb-6
            "
          >
            {/* =================================================
                TOP BAR
            ================================================= */}

            <div
              className="
                sticky
                top-0
                z-30
                border-b
                border-[#F0E7CD]
                bg-[#FFFCF4]/95
                px-4
                py-4
                backdrop-blur-xl
              "
            >
              <button
                type="button"
                onClick={
                  closeForm
                }
                className="
                  flex
                  items-center
                  gap-2
                  text-black
                "
              >
                <div
                  className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-[13px]
                    border
                    border-[#EEDFAE]
                    bg-white
                    text-[#A87300]
                    shadow-[0_4px_12px_rgba(91,71,14,0.05)]
                  "
                >
                  <ArrowLeft
                    size={20}
                  />
                </div>

                <span
                  className="
                    text-[13px]
                    font-semibold
                  "
                >
                  Back
                </span>
              </button>
            </div>

            {/* =================================================
                FORM CONTENT
            ================================================= */}

            <div
              className="
                px-4
                pt-6
              "
            >
              {/* =================================================
                  TITLE
              ================================================= */}

              <div className={editingChild ? "mb-5" : "mb-7"}>
                {!editingChild && <div
                  className="
                    mb-2
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
                    Child Profile
                  </span>

                    <div
                    className="
                      h-[3px]
                      w-7
                      rounded-full
                      bg-[#FFB000]
                    "
                  />
                </div>}

                <h1
                  className="
                    text-[26px]
                    font-extrabold
                    tracking-[-0.5px]
                    text-black
                  "
                >
                  {editingChild
                    ? "Edit Child"
                    : "Add Child"}
                </h1>

                <p
                  className="
                    mt-1.5
                    max-w-[330px]
                    text-[12px]
                    leading-5
                    text-zinc-500
                  "
                >
                  {editingChild
                    ? "Update class and pickup times. Request approval for location changes."
                    : "Add school, schedule and safety information for your child."}
                </p>
              </div>

              {/* =================================================
                  BASIC INFORMATION
              ================================================= */}

              {!editingChild && <>
              <FormSectionTitle
                title="Basic Information"
              />

              <CleanField
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
                    form.name
                  }
                  onChange={(
                    event
                  ) =>
                    updateForm(
                      "name",
                      event
                        .target
                        .value
                    )
                  }
                  placeholder="Enter child's full name"
                  className="clean-input"
                />
              </CleanField>

              <div
                className="
                  grid
                  grid-cols-2
                  gap-3
                "
              >
                <CleanField
                  label="Age"
                  icon={
                    <CalendarDays
                      size={18}
                    />
                  }
                >
                  <input
                    type="number"
                    inputMode="numeric"
                    min="1"
                    max="17"
                    value={
                      form.age
                    }
                    onChange={(
                      event
                    ) =>
                      updateForm(
                        "age",
                        event
                          .target
                          .value
                      )
                    }
                    placeholder="Age"
                    className="clean-input"
                  />
                </CleanField>

                <CleanField
                  label="Gender"
                  icon={
                    <Users
                      size={18}
                    />
                  }
                >
                  <select
                    value={
                      form.gender
                    }
                    onChange={(
                      event
                    ) =>
                      updateForm(
                        "gender",
                        event
                          .target
                          .value
                      )
                    }
                    className="
                      clean-input
                      clean-select
                    "
                  >
                    <option value="">
                      Select
                    </option>

                    <option value="Male">
                      Male
                    </option>

                    <option value="Female">
                      Female
                    </option>

                    <option value="Other">
                      Other
                    </option>
                  </select>
                </CleanField>
              </div>
              </>}

              {/* =================================================
                  SCHOOL INFORMATION
              ================================================= */}

              {!editingChild && <FormSectionTitle title="School Information" />}

              {!editingChild && <CleanField
                label="School"
                icon={
                  <School
                    size={18}
                  />
                }
              >
                <input
                  type="text"
                  value={
                    form.school
                  }
                  onChange={(
                    event
                  ) =>
                    updateForm(
                      "school",
                      event
                        .target
                        .value
                    )
                  }
                  placeholder="Enter school name"
                  className="clean-input"
                />
              </CleanField>}

              <div className={editingChild ? "" : "grid grid-cols-2 gap-3"}>
                <CleanField
                  label="Class / Grade"
                  icon={
                    <GraduationCap
                      size={18}
                    />
                  }
                >
                  <input
                    type="text"
                    value={
                      form.grade
                    }
                    onChange={(
                      event
                    ) =>
                      updateForm(
                        "grade",
                        event
                          .target
                          .value
                      )
                    }
                    placeholder="Grade"
                    className="clean-input"
                  />
                </CleanField>

                {!editingChild && <CleanField
                  label="Section"
                  optional
                  icon={
                    <Bookmark
                      size={18}
                    />
                  }
                >
                  <input
                    type="text"
                    value={
                      form.section
                    }
                    onChange={(
                      event
                    ) =>
                      updateForm(
                        "section",
                        event
                          .target
                          .value
                      )
                    }
                    placeholder="Section"
                    className="clean-input"
                  />
                </CleanField>}
              </div>

              {/* =================================================
                  RIDE INFORMATION
              ================================================= */}

              <FormSectionTitle title={editingChild ? "Pickup Schedule & Locations" : "Ride Information"} />

              <FormGroupTitle
                title="HOME"
              />

              <div
                className="
                  clean-stack-card
                "
              >
                <button
                  type="button"
                  onClick={() => editingChild ? beginLocationChange("home") : setMapType("pickup")}
                  className="
                    clean-stack-row
                  "
                >
                  <div
                    className="
                      clean-stack-icon
                    "
                  >
                    <MapPin
                      size={18}
                    />
                  </div>

                  <div
                    className="
                      min-w-0
                      flex-1
                      text-left
                    "
                  >
                    <p
                      className="
                        mb-[2px]
                        text-[10px]
                        text-zinc-400
                      "
                    >
                      Home Location
                    </p>

                    <p
                      className={`
                        truncate
                        text-[13px]
                        font-medium

                        ${
                          form.pickupLocation
                            ? "text-black"
                            : "text-zinc-400"
                        }
                      `}
                    >
                      {form.pickupLocation || "Select pickup address"}
                    </p>
                  </div>

                  {editingChild ? <span className="rounded-full bg-[#FFF2C9] px-2.5 py-1 text-[9px] font-bold text-[#9A6900]">Request change</span> : form
                    .pickupCoords
                    ?.lat !==
                    null ? (
                    <CheckCircle2
                      size={18}
                      className="
                        text-green-500
                      "
                    />
                  ) : (
                    <ChevronRight
                      size={19}
                      className="
                        text-zinc-400
                      "
                    />
                  )}
                </button>

                <div
                  className="
                    clean-stack-divider
                  "
                />

                <div
                  className="
                    clean-stack-row
                  "
                >
                  <div
                    className="
                      clean-stack-icon
                    "
                  >
                    <Clock3
                      size={18}
                    />
                  </div>

                  <div
                    className="
                      flex-1
                    "
                  >
                    <p
                      className="
                        mb-[3px]
                        text-[10px]
                        text-zinc-400
                      "
                    >
                      Pickup Time
                    </p>

                    <input
                      type="time"
                      value={
                        form.pickupTime
                      }
                      onChange={(
                        event
                      ) =>
                        updateForm(
                          "pickupTime",
                          event
                            .target
                            .value
                        )
                      }
                      className="
                        clean-time-input
                      "
                    />
                  </div>
                </div>
              </div>

              <FormGroupTitle
                title="SCHOOL"
              />

              <div
                className="
                  clean-stack-card
                "
              >
                <button
                  type="button"
                  onClick={() => editingChild ? beginLocationChange("school") : setMapType("drop")}
                  className="
                    clean-stack-row
                  "
                >
                  <div
                    className="
                      clean-stack-icon
                    "
                  >
                    <School
                      size={18}
                    />
                  </div>

                  <div
                    className="
                      min-w-0
                      flex-1
                      text-left
                    "
                  >
                    <p
                      className="
                        mb-[2px]
                        text-[10px]
                        text-zinc-400
                      "
                    >
                      School Location
                    </p>

                    <p
                      className={`
                        truncate
                        text-[13px]
                        font-medium

                        ${
                          form.dropoffLocation
                            ? "text-black"
                            : "text-zinc-400"
                        }
                      `}
                    >
                      {form.dropoffLocation ||
                        "Select school address"}
                    </p>
                  </div>

                  {editingChild ? <span className="rounded-full bg-[#FFF2C9] px-2.5 py-1 text-[9px] font-bold text-[#9A6900]">Request change</span> : form
                    .dropoffCoords
                    ?.lat !==
                    null ? (
                    <CheckCircle2
                      size={18}
                      className="
                        text-green-500
                      "
                    />
                  ) : (
                    <ChevronRight
                      size={19}
                      className="
                        text-zinc-400
                      "
                    />
                  )}
                </button>

                <div
                  className="
                    clean-stack-divider
                  "
                />

                <div
                  className="
                    clean-stack-row
                  "
                >
                  <div
                    className="
                      clean-stack-icon
                    "
                  >
                    <Clock3
                      size={18}
                    />
                  </div>

                  <div
                    className="
                      flex-1
                    "
                  >
                    <p
                      className="
                        mb-[3px]
                        text-[10px]
                        text-zinc-400
                      "
                    >
                      Pickup Time
                    </p>

                    <input
                      type="time"
                      value={
                        form.eveningPickup
                      }
                      onChange={(
                        event
                      ) =>
                        updateForm(
                          "eveningPickup",
                          event
                            .target
                            .value
                        )
                      }
                      className="
                        clean-time-input
                      "
                    />
                  </div>
                </div>
              </div>

              {/* =================================================
                  SAFETY DETAILS
              ================================================= */}

              {!editingChild && <FormSectionTitle
                title="Safety Details"
              />}

              {!editingChild && <CleanField
                label="Medical Notes"
                optional
                icon={
                  <HeartPulse
                    size={18}
                  />
                }
              >
                <input
                  type="text"
                  value={
                    form.medicalNotes
                  }
                  onChange={(
                    event
                  ) =>
                    updateForm(
                      "medicalNotes",
                      event
                        .target
                        .value
                    )
                  }
                  placeholder="Medical conditions or notes"
                  className="clean-input"
                />
              </CleanField>}

              {!editingChild && <CleanField
                label="Emergency Contact"
                optional
                icon={
                  <Phone
                    size={18}
                  />
                }
              >
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={
                    form.emergencyContact
                  }
                  onChange={(
                    event
                  ) =>
                    updateForm(
                      "emergencyContact",

                      event
                        .target
                        .value
                        .replace(
                          /\D/g,
                          ""
                        )
                        .slice(
                          0,
                          10
                        )
                    )
                  }
                  placeholder="Emergency contact number"
                  className="clean-input"
                />
              </CleanField>}

              {/* =================================================
                  SAVE / UPDATE
              ================================================= */}

              <div
                className="
                  mt-7
                  pb-8
                "
              >
                <button
                  type="button"
                  disabled={
                    loading
                  }
                  onClick={
                    handleSubmit
                  }
                  className="
                    flex
                    h-[56px]
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-[16px]
                    bg-[#FFB000]
                    text-[14px]
                    font-extrabold
                    text-black
                    shadow-[0_10px_24px_rgba(255,176,0,0.20)]
                    transition
                    hover:bg-[#F4A900]
                    active:scale-[0.99]
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >
                  <Save
                    size={19}
                    className="
                      text-[#8B6200]
                    "
                  />

                  {loading
                    ? editingChild
                      ? "UPDATING..."
                      : "SAVING..."
                    : editingChild
                      ? "UPDATE CHILD"
                      : "SAVE CHILD"}
                </button>

                <p
                  className="
                    mt-2
                    text-center
                    text-[8px]
                    leading-4
                    text-zinc-400
                  "
                >
                  Please verify the
                  child and ride details
                  before saving.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* =================================================
            MAP PICKER
        ================================================= */}

        {mapType && (
          <GoogleLocationPicker
            mapType={mapType}
            initialCoords={mapType === "pickup" ? form.pickupCoords : form.dropoffCoords}
            initialAddress={mapType === "pickup" ? form.pickupLocation : form.dropoffLocation}
            onClose={() => setMapType(null)}
            onConfirm={(data) => {
              if (editingChild && approvedLocationRequest) {
                confirmApprovedLocation(data);
                return;
              }
              setForm((previous) => ({
                ...previous,
                [mapType === "pickup" ? "pickupLocation" : "dropoffLocation"]: data.address,
                [mapType === "pickup" ? "pickupCoords" : "dropoffCoords"]: {
                  lat: data.lat,
                  lng: data.lng,
                },
              }));
              setMapType(null);
            }}
          />
        )}

        {pendingLocationPayment && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
            <div className="w-full max-w-[420px] rounded-[24px] border border-[#F0DFBC] bg-[#FFFDF8] p-5 shadow-2xl">
              <p className="text-[9px] font-extrabold uppercase tracking-[1.7px] text-[#B77D00]">Payment not completed</p>
              <h2 className="mt-1 text-[21px] font-extrabold text-black">What would you like to do?</h2>
              <p className="mt-2 text-[12px] leading-5 text-zinc-600">Your current {pendingLocationPayment.locationType === "home" ? "home" : "school"} location is still active. Continue to pay for the selected location, or choose a different location and recalculate the adjustment.</p>
              <div className="mt-4 grid gap-2">
                <button type="button" disabled={locationRequestLoading} onClick={continuePendingLocationPayment} className="h-11 rounded-[13px] bg-[#FFB000] font-extrabold text-black disabled:opacity-50">{locationRequestLoading ? "Please wait..." : "Continue with payment"}</button>
                <button type="button" disabled={locationRequestLoading} onClick={revisePendingLocation} className="h-11 rounded-[13px] border border-[#E9D8B7] bg-white font-bold text-zinc-700 disabled:opacity-50">Change location again</button>
              </div>
            </div>
          </div>
        )}

        {locationPaymentPreview && (
          <div className="fixed inset-0 z-[85] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
            <div className="max-h-[90vh] w-full max-w-[440px] overflow-y-auto rounded-[24px] border border-[#F0DFBC] bg-[#FFFDF8] p-5 shadow-2xl">
              <p className="text-[9px] font-extrabold uppercase tracking-[1.7px] text-[#B77D00]">Route price adjustment</p>
              <h2 className="mt-1 text-[21px] font-extrabold text-black">Review your updated cost</h2>
              <p className="mt-2 text-[12px] leading-5 text-zinc-600">Your current location stays active until the adjustment payment is complete.</p>
              <div className="mt-4 rounded-[18px] border border-[#F0DFBC] bg-[#FFF9EC] p-4 text-[13px]">
                <div className="flex justify-between gap-3 py-1.5 text-zinc-600"><span>Previous route distance</span><strong className="text-zinc-900">{Number(locationPaymentPreview.oldDistanceKm || 0).toFixed(2)} km</strong></div>
                <div className="flex justify-between gap-3 py-1.5 text-zinc-600"><span>Updated route distance</span><strong className="text-zinc-900">{Number(locationPaymentPreview.newDistanceKm || 0).toFixed(2)} km</strong></div>
                <div className="flex justify-between gap-3 border-b border-[#EAD9B8] py-1.5 text-zinc-600"><span>Additional distance</span><strong className="text-zinc-900">{Number(locationPaymentPreview.addedDistanceKm || 0).toFixed(2)} km</strong></div>
                <div className="flex justify-between gap-3 pt-3 text-zinc-700"><span>Additional distance charge</span><strong className="text-zinc-900">₹{Number(locationPaymentPreview.distanceChargeDue || 0).toFixed(2)}</strong></div>
                {Number(locationPaymentPreview.extraDistanceDailyCharge) > 0 && <p className="pb-1 text-[11px] text-zinc-500">₹{Number(locationPaymentPreview.extraDistanceDailyCharge).toFixed(2)} per remaining service day × {Number(locationPaymentPreview.remainingServiceDays || 0)} days</p>}
                <div className="flex justify-between gap-3 py-1.5 text-zinc-700"><span>Platform fee (2%)</span><strong className="text-zinc-900">₹{Number(locationPaymentPreview.platformFeeDue || 0).toFixed(2)}</strong></div>
                <div className="mt-2 flex justify-between gap-3 border-t border-[#EAD9B8] pt-3 text-[16px] font-extrabold"><span>Due now</span><span>₹{Number(locationPaymentPreview.amountDue || 0).toFixed(2)}</span></div>
                <div className="mt-3 flex justify-between gap-3 rounded-[12px] bg-white px-3 py-2 text-[12px] text-zinc-600"><span>New monthly price from next billing cycle</span><strong className="text-zinc-900">₹{Number(locationPaymentPreview.newMonthlyPrice || 0).toFixed(2)}</strong></div>
              </div>
              <div className="mt-4 grid gap-2">
                {locationAccessAllowed && <div className="flex gap-2">
                  <input aria-label="Developer access code" placeholder="Access code" value={locationAccessCode} onChange={(event) => setLocationAccessCode(event.target.value)} disabled={locationRequestLoading} autoComplete="off" className="min-w-0 flex-1 rounded-[13px] border border-[#E9D8B7] bg-white px-3 py-2 text-sm" />
                  <button type="button" onClick={applyLocationAccessCode} disabled={locationRequestLoading || !locationAccessCode.trim()} className="rounded-[13px] bg-[#FFB000] px-4 font-bold disabled:opacity-50">Apply</button>
                </div>}
                <button type="button" disabled={locationRequestLoading} onClick={payLocationAdjustment} className="h-11 rounded-[13px] bg-[#FFB000] font-extrabold text-black disabled:opacity-50">{locationRequestLoading ? "Please wait..." : `Pay ₹${Number(locationPaymentPreview.amountDue || 0).toFixed(2)} securely`}</button>
                <button type="button" disabled={locationRequestLoading} onClick={() => setLocationPaymentPreview(null)} className="h-11 rounded-[13px] border border-[#E9D8B7] bg-white font-bold text-zinc-700">Not now</button>
              </div>
            </div>
          </div>
        )}

        {locationChoiceType && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
            <div className="w-full max-w-[420px] rounded-[24px] border border-[#F0DFBC] bg-[#FFFDF8] p-5 shadow-2xl">
              <p className="text-[9px] font-extrabold uppercase tracking-[1.7px] text-[#B77D00]">Location already updated</p>
              <h2 className="mt-1 text-[21px] font-extrabold text-black">Keep or change it again?</h2>
              <p className="mt-2 text-[12px] leading-5 text-zinc-600">Your {locationChoiceType === "home" ? "home" : "school"} location was updated previously. Continue using it, or submit a new request to change it again.</p>
              <div className="mt-4 grid gap-2">
                <button type="button" onClick={() => { setLocationChoiceType(""); showMessage({ title: "Location unchanged", message: "Your current location will remain in use." }); }} className="h-11 rounded-[13px] border border-[#E9D8B7] bg-white font-bold text-zinc-700">Continue with current location</button>
                <button type="button" onClick={() => { setLocationRequestType(locationChoiceType); setLocationReason(""); setLocationChoiceType(""); }} className="h-11 rounded-[13px] bg-[#FFB000] font-extrabold text-black">Change location again</button>
              </div>
            </div>
          </div>
        )}
        {locationRequestType && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
            <div className="w-full max-w-[420px] rounded-[24px] border border-[#F0DFBC] bg-[#FFFDF8] p-5 shadow-2xl">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <p className="text-[9px] font-extrabold uppercase tracking-[1.7px] text-[#B77D00]">Location change request</p>
                  <h2 className="mt-1 text-[21px] font-extrabold text-black">Why change the {locationRequestType === "home" ? "home" : "school"} location?</h2>
                </div>
                <button type="button" onClick={() => setLocationRequestType("")} className="rounded-full p-2 text-zinc-500" aria-label="Close"><X size={18} /></button>
              </div>
              <p className="mb-3 text-[12px] leading-5 text-zinc-600">An agent will review your request and call to confirm the new location.</p>
              <textarea value={locationReason} onChange={(event) => setLocationReason(event.target.value)} maxLength={1000} rows={4} placeholder="Tell us why this location needs to change..." className="w-full resize-none rounded-[15px] border border-[#E9D8B7] bg-white p-3 text-[13px] outline-none focus:border-[#E6A900]" />
              <div className="mt-3 flex gap-2">
                <button type="button" onClick={() => setLocationRequestType("")} className="h-11 flex-1 rounded-[13px] border border-[#E9D8B7] font-bold text-zinc-700">Cancel</button>
                <button type="button" disabled={locationRequestLoading || locationReason.trim().length < 5} onClick={submitLocationChangeReason} className="h-11 flex-1 rounded-[13px] bg-[#FFB000] font-extrabold text-black disabled:opacity-50">{locationRequestLoading ? "Sending..." : "Send request"}</button>
              </div>
            </div>
          </div>
        )}

        <AppDialog
          dialog={
            dialog
          }
          onClose={
            closeDialog
          }
          onConfirm={
            confirmDialog
          }
        />

        <ChildrenStyles />
      </>
    );
  }

  /* =======================================================
     CHILD MANAGEMENT SCREEN
  ======================================================= */

  return (
    <>
      <div
        className="
          relative
          flex
          min-h-screen
          justify-center
          overflow-hidden
          bg-[#FFF9EE]
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
              -right-[110px]
              -top-[80px]
              h-[270px]
              w-[270px]
              rounded-full
              bg-[#FFF0B5]
              opacity-60
            "
          />

          <div
            className="
              absolute
              -left-[130px]
              top-[400px]
              h-[260px]
              w-[260px]
              rounded-full
              bg-[#FFF5D8]
            "
          />
        </div>

        <div
          className="
            relative
            z-10
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
              <span
                className="
                  text-[9px]
                  font-extrabold
                  uppercase
                  tracking-[1.7px]
                  text-[#B77D00]
                "
              >
                MY CHILDREN
              </span>

              <div
                className="
                  h-[3px]
                  w-7
                  rounded-full
                  bg-[#FFB000]
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
                  Child Management
                </h1>

                <p
                  className="
                    mt-1.5
                    text-[11px]
                    leading-5
                    text-zinc-500
                  "
                >
                  Manage your children,
                  school details and ride
                  schedules.
                </p>
              </div>

              {children.length >
                0 && (
                <div
                  className="
                    flex
                    h-[47px]
                    min-w-[47px]
                    items-center
                    justify-center
                    rounded-[15px]
                    border
                    border-[#ECD991]
                    bg-[#FFF6D6]
                    px-3
                  "
                >
                  <span
                    className="
                      text-[15px]
                      font-extrabold
                      text-black
                    "
                  >
                    {
                      children.length
                    }
                  </span>
                </div>
              )}
            </div>
          </header>

          {/* =================================================
              CONTENT
          ================================================= */}

          <main
            className="
              px-4
            "
          >
            {fetching ? (
              <div
                className="
                  rounded-[24px]
                  border
                  border-[#F0E2B4]
                  bg-white
                  p-7
                  text-center
                  shadow-[0_10px_30px_rgba(95,72,16,0.06)]
                "
              >
                <div
                  className="
                    mx-auto
                    h-9
                    w-9
                    animate-spin
                    rounded-full
                    border-[3px]
                    border-[#FFE49A]
                    border-t-[#FFB000]
                  "
                />

                <p
                  className="
                    mt-4
                    text-[12px]
                    font-semibold
                    text-zinc-500
                  "
                >
                  Loading children...
                </p>
              </div>
            ) : children.length ===
              0 ? (
              <div
                className="
                  rounded-[26px]
                  border
                  border-[#F0D682]
                  bg-white
                  p-8
                  text-center
                  shadow-[0_12px_32px_rgba(92,69,10,0.07)]
                "
              >
                <div
                  className="
                    mx-auto
                    flex
                    h-[72px]
                    w-[72px]
                    items-center
                    justify-center
                    rounded-[22px]
                    bg-[#FFF4CF]
                    text-[#B77D00]
                  "
                >
                  <User
                    size={31}
                  />
                </div>

                <h2
                  className="
                    mt-5
                    text-[18px]
                    font-extrabold
                    text-black
                  "
                >
                  No children added yet
                </h2>

                <p
                  className="
                    mx-auto
                    mt-2
                    max-w-[260px]
                    text-[11px]
                    leading-5
                    text-zinc-500
                  "
                >
                  Add your child to
                  manage their school
                  transportation details.
                </p>

                <button
                  type="button"
                  onClick={
                    openAddChild
                  }
                  className="
                    mt-6
                    inline-flex
                    h-[48px]
                    items-center
                    justify-center
                    gap-2
                    rounded-[14px]
                    bg-[#FFB000]
                    px-6
                    font-bold
                    text-black
                    transition
                    hover:bg-[#F4A900]
                    active:scale-[0.98]
                  "
                >
                  <Plus
                    size={18}
                    className="
                      text-[#8B6200]
                    "
                  />

                  Add Child
                </button>
              </div>
            ) : (
              <div
                className="
                  space-y-3
                "
              >
                {children.map(
                  (
                    child,
                    index
                  ) => (
                    <ChildCard
                      key={
                        child._id ||
                        index
                      }
                      child={
                        child
                      }
                      index={
                        index
                      }
                      onEdit={() =>
                        handleEdit(
                          child
                        )
                      }
                      onDelete={() =>
                        handleDelete(
                          child._id
                        )
                      }
                    />
                  )
                )}

              </div>
            )}
          </main>
        </div>

        <BottomNav
          active="children"
          setActive={
            setTab
          }
        />
      </div>

      <AppDialog
        dialog={
          dialog
        }
        onClose={
          closeDialog
        }
        onConfirm={
          confirmDialog
        }
      />

      <ChildrenStyles />
    </>
  );
}

/* =========================================================
   CHILD CARD
========================================================= */

function ChildCard({
  child,
  index,
  onEdit,
  onDelete,
}) {
  return (
    <div
      className="
        overflow-hidden
        rounded-[24px]
        border
        border-[#EFE6CD]
        bg-white
        shadow-[0_10px_30px_rgba(79,61,14,0.065)]
      "
    >
      <div
        className="
          h-[4px]
          w-full
          bg-[#FFB000]
        "
      />

      <div
        className="
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
              h-[70px]
              w-[70px]
              shrink-0
              items-center
              justify-center
              overflow-hidden
              rounded-[21px]
              border
              border-[#FFE39A]
              bg-[#FFF2C5]
              text-[#B77D00]
            "
          >
            {child
              ?.profilePhoto ? (
              <img
                src={
                  child
                    .profilePhoto
                }
                alt={
                  child.name
                }
                className="
                  h-full
                  w-full
                  object-cover
                "
              />
            ) : (
              <User
                size={31}
                strokeWidth={1.7}
              />
            )}
          </div>

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
                "
              >
                <h2
                  className="
                    truncate
                    text-[17px]
                    font-extrabold
                    text-black
                  "
                >
                  {child?.name ||
                    `Child ${
                      index +
                      1
                    }`}
                </h2>

                {(child?.age ||
                  child
                    ?.gender) && (
                  <p
                    className="
                      mt-1
                      text-[10px]
                      text-zinc-400
                    "
                  >
                    {child?.age
                      ? `${child.age} years`
                      : ""}

                    {child?.age &&
                    child?.gender
                      ? " • "
                      : ""}

                    {child
                      ?.gender ||
                      ""}
                  </p>
                )}
              </div>

              <div
                className="
                  flex
                  items-center
                  gap-1
                "
              >
                <button
                  type="button"
                  onClick={
                    onEdit
                  }
                  className="
                    flex
                    h-9
                    items-center
                    gap-1.5
                    rounded-[11px]
                    bg-[#FFF6D9]
                    px-3
                    text-[11px]
                    font-semibold
                    text-black
                    transition
                    hover:bg-[#FFEFB8]
                  "
                >
                  <Pencil
                    size={13}
                    className="
                      text-[#B77D00]
                    "
                  />

                  Edit
                </button>

                <button
                  type="button"
                  onClick={
                    onDelete
                  }
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-[11px]
                    text-red-500
                    transition
                    hover:bg-red-50
                  "
                  aria-label="Delete child"
                >
                  <Trash2
                    size={15}
                  />
                </button>
              </div>
            </div>

            <div
              className="
                mt-3
                flex
                items-center
                gap-2
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
                  bg-[#FFF5D5]
                  text-[#D69900]
                "
              >
                <GraduationCap
                  size={14}
                />
              </div>

              <span
                className="
                  text-[11px]
                  font-semibold
                  text-black
                "
              >
                {child?.grade
                  ? `Class ${child.grade}${
                      child?.section
                        ? ` - ${child.section}`
                        : ""
                    }`
                  : "Class not added"}
              </span>
            </div>

            <div
              className="
                mt-2
                flex
                min-w-0
                items-center
                gap-2
              "
            >
              <div
                className="
                  flex
                  h-7
                  w-7
                  shrink-0
                  items-center
                  justify-center
                  rounded-[9px]
                  bg-[#FFF5D5]
                  text-[#D69900]
                "
              >
                <School
                  size={13}
                />
              </div>

              <span
                className="
                  truncate
                  text-[10px]
                  text-zinc-500
                "
              >
                {child?.school ||
                  "School not added"}
              </span>
            </div>
          </div>
        </div>

        <div
          className="
            my-4
            h-px
            bg-[#F1EAD8]
          "
        />

        <div
          className="
            grid
            grid-cols-2
            gap-3
          "
        >
          <RideTime
            label="Pickup from Home"
            time={
              child?.pickupTime
            }
          />

          <RideTime
            label="Pickup from School"
            time={
              child
                ?.eveningPickup
            }
          />
        </div>

        {(child
          ?.pickupLocation ||
          child
            ?.dropoffLocation) && (
          <div
            className="
              mt-4
              rounded-[16px]
              border
              border-[#F1E4BA]
              bg-[#FFFCF2]
              px-3
              py-3
            "
          >
            {child
              ?.pickupLocation && (
              <div
                className="
                  flex
                  items-start
                  gap-2
                "
              >
                <MapPin
                  size={14}
                  className="
                    mt-[2px]
                    shrink-0
                    text-[#D89900]
                  "
                />

                <p
                  className="
                    line-clamp-1
                    text-[9px]
                    leading-4
                    text-zinc-500
                  "
                >
                  {
                    child
                      .pickupLocation
                  }
                </p>
              </div>
            )}

            {child
              ?.dropoffLocation && (
              <div
                className="
                  mt-2
                  flex
                  items-start
                  gap-2
                "
              >
                <School
                  size={14}
                  className="
                    mt-[2px]
                    shrink-0
                    text-[#D89900]
                  "
                />

                <p
                  className="
                    line-clamp-1
                    text-[9px]
                    leading-4
                    text-zinc-500
                  "
                >
                  {
                    child
                      .dropoffLocation
                  }
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   RIDE TIME
========================================================= */

function RideTime({
  label,
  time,
}) {
  return (
    <div
      className="
        rounded-[15px]
        border
        border-[#F1E6C5]
        bg-[#FFFDF7]
        p-3
      "
    >
      <div
        className="
          mb-2
          flex
          h-8
          w-8
          items-center
          justify-center
          rounded-[10px]
          bg-[#FFF4CE]
          text-[#D99A00]
        "
      >
        <Clock3
          size={15}
        />
      </div>

      <p
        className="
          text-[9px]
          leading-4
          text-zinc-400
        "
      >
        {
          label
        }
      </p>

      <p
        className="
          mt-1
          text-[14px]
          font-extrabold
          text-black
        "
      >
        {formatTime(
          time
        )}
      </p>
    </div>
  );
}

/* =========================================================
   SECTION TITLE
========================================================= */

function FormSectionTitle({
  title,
}) {
  return (
    <div
      className="
        mb-4
        mt-2
        flex
        items-center
        gap-2
      "
    >
      <span
        className="
          h-[7px]
          w-[7px]
          rounded-full
          bg-[#FFB000]
        "
      />

      <h2
        className="
          text-[13px]
          font-bold
          text-black
        "
      >
        {
          title
        }
      </h2>

      <div
        className="
          h-px
          flex-1
          bg-[#F0E3B9]
        "
      />
    </div>
  );
}

/* =========================================================
   CLEAN FIELD
========================================================= */

function CleanField({
  label,
  optional = false,
  icon,
  children,
}) {
  return (
    <div
      className="
        mb-5
      "
    >
      <label
        className="
          mb-2
          block
          text-[12px]
          font-semibold
          text-black
        "
      >
        {
          label
        }

        {optional && (
          <span
            className="
              ml-1
              font-normal
              text-zinc-400
            "
          >
            (Optional)
          </span>
        )}
      </label>

      <div
        className="
          relative
          flex
          h-[54px]
          items-center
          rounded-[14px]
          border
          border-[#E9E4D8]
          bg-white
          transition
          focus-within:border-[#FFB000]
          focus-within:ring-4
          focus-within:ring-[#FFB000]/10
        "
      >
        <div
          className="
            pointer-events-none
            absolute
            left-4
            z-10
            flex
            items-center
            justify-center
            text-[#A87300]
          "
        >
          {
            icon
          }
        </div>

        {
          children
        }
      </div>
    </div>
  );
}

/* =========================================================
   FORM GROUP TITLE
========================================================= */

function FormGroupTitle({
  title,
}) {
  return (
    <div
      className="
        mb-2
        mt-1
      "
    >
      <p
        className="
          text-[12px]
          font-semibold
          text-black
        "
      >
        {
          title
        }
      </p>
    </div>
  );
}

/* =========================================================
   ASAN APP DIALOG
========================================================= */

function AppDialog({
  dialog,
  onClose,
  onConfirm,
}) {
  if (
    !dialog?.open
  ) {
    return null;
  }

  const configs = {
    success: {
      icon:
        CheckCircle2,

      iconBg:
        "bg-emerald-50",

      iconColor:
        "text-emerald-600",

      accent:
        "bg-emerald-500",

      eyebrow:
        "Success",
    },

    warning: {
      icon:
        AlertTriangle,

      iconBg:
        "bg-[#FFF4CF]",

      iconColor:
        "text-[#C68A00]",

      accent:
        "bg-[#FFB000]",

      eyebrow:
        "Attention",
    },

    error: {
      icon:
        CircleAlert,

      iconBg:
        "bg-red-50",

      iconColor:
        "text-red-500",

      accent:
        "bg-red-500",

      eyebrow:
        "Something Went Wrong",
    },

    danger: {
      icon:
        Trash2,

      iconBg:
        "bg-red-50",

      iconColor:
        "text-red-500",

      accent:
        "bg-red-500",

      eyebrow:
        "Confirmation Required",
    },

    info: {
      icon:
        Info,

      iconBg:
        "bg-[#FFF4CF]",

      iconColor:
        "text-[#B77D00]",

      accent:
        "bg-[#FFB000]",

      eyebrow:
        "ASANRIDES",
    },
  };

  const current =
    configs[
      dialog.type
    ] ||
    configs.info;

  const DialogIcon =
    current.icon;

  const danger =
    dialog.type ===
      "danger" ||
    dialog.type ===
      "error";

  return (
    <div
      className="
        fixed
        inset-0
        z-[99999]
        flex
        items-end
        justify-center
        bg-black/40
        px-4
        pb-[max(20px,env(safe-area-inset-bottom))]
        pt-16
        backdrop-blur-[3px]
        sm:items-center
      "
    >
      <div
        className="
          dialog-enter
          w-full
          max-w-[390px]
          overflow-hidden
          rounded-[28px]
          border
          border-[#EFE5C8]
          bg-white
          shadow-[0_28px_80px_rgba(20,14,2,0.28)]
        "
      >
        <div
          className={`
            h-[5px]
            w-full

            ${current.accent}
          `}
        />

        <div
          className="
            p-5
          "
        >
          <div
            className="
              flex
              items-start
              gap-4
            "
          >
            <div
              className={`
                flex
                h-[52px]
                w-[52px]
                shrink-0
                items-center
                justify-center
                rounded-[17px]

                ${current.iconBg}
                ${current.iconColor}
              `}
            >
              <DialogIcon
                size={23}
                strokeWidth={2}
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
                  text-[8px]
                  font-extrabold
                  uppercase
                  tracking-[1.5px]
                  text-[#B77D00]
                "
              >
                {
                  current.eyebrow
                }
              </p>

              <h3
                className="
                  mt-1
                  text-[19px]
                  font-extrabold
                  tracking-[-0.3px]
                  text-black
                "
              >
                {
                  dialog.title
                }
              </h3>

              <p
                className="
                  mt-2
                  text-[11px]
                  font-medium
                  leading-[19px]
                  text-zinc-500
                "
              >
                {
                  dialog.message
                }
              </p>
            </div>
          </div>

          <div
            className={`
              mt-6
              grid
              gap-2.5

              ${
                dialog.showCancel
                  ? "grid-cols-2"
                  : "grid-cols-1"
              }
            `}
          >
            {dialog.showCancel && (
              <button
                type="button"
                onClick={
                  onClose
                }
                className="
                  flex
                  h-[52px]
                  items-center
                  justify-center
                  rounded-[16px]
                  border
                  border-[#E9E1CD]
                  bg-[#FFFDF8]
                  px-3
                  text-[11px]
                  font-extrabold
                  text-zinc-600
                  transition
                  active:scale-[0.98]
                "
              >
                {
                  dialog.cancelText ||
                  "Cancel"
                }
              </button>
            )}

            <button
              type="button"
              onClick={
                dialog.showCancel
                  ? onConfirm
                  : onClose
              }
              className={`
                flex
                h-[52px]
                items-center
                justify-center
                rounded-[16px]
                px-3
                text-[11px]
                font-extrabold
                transition
                active:scale-[0.98]

                ${
                  danger
                    ? `
                      bg-red-500
                      text-white
                      shadow-[0_8px_20px_rgba(239,68,68,0.22)]
                    `
                    : `
                      bg-[#FFB000]
                      text-black
                      shadow-[0_8px_20px_rgba(255,176,0,0.20)]
                    `
                }
              `}
            >
              {
                dialog.confirmText ||
                "OK"
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   CSS
========================================================= */

function ChildrenStyles() {
  return (
    <style>{`
      .clean-input {
        width: 100%;
        height: 100%;

        min-width: 0;

        padding-left: 46px;
        padding-right: 12px;

        border: none;
        outline: none;

        background: transparent;

        font-size: 12px;
        font-weight: 500;

        color: #111111;
      }

      .clean-input::placeholder {
        color: #A1A1AA;
      }

      .clean-select {
        cursor: pointer;
        color: #52525B;
      }

      .clean-stack-card {
        width: 100%;

        overflow: hidden;

        margin-bottom: 23px;

        border: 1px solid #EEE3C1;

        border-radius: 17px;

        background: #FFFFFF;

        box-shadow:
          0 7px 22px
          rgba(
            92,
            72,
            16,
            0.035
          );
      }

      .clean-stack-row {
        width: 100%;

        min-height: 66px;

        display: flex;

        align-items: center;

        gap: 12px;

        padding: 10px 14px;

        border: none;

        background: #FFFFFF;

        color: #111111;
      }

      button.clean-stack-row:hover {
        background: #FFFDF7;
      }

      .clean-stack-icon {
        width: 36px;
        height: 36px;

        flex-shrink: 0;

        display: flex;

        align-items: center;

        justify-content: center;

        border-radius: 11px;

        background: #FFF4CF;

        color: #C88C00;
      }

      .clean-stack-divider {
        height: 1px;

        margin-left: 62px;

        background: #F0E9D6;
      }

      .clean-time-input {
        width: 100%;

        border: none;
        outline: none;

        background: transparent;

        font-size: 14px;

        font-weight: 700;

        color: #111111;
      }

      @keyframes dialogEnter {
        from {
          opacity: 0;
          transform:
            translateY(20px)
            scale(0.97);
        }

        to {
          opacity: 1;
          transform:
            translateY(0)
            scale(1);
        }
      }

      .dialog-enter {
        animation:
          dialogEnter
          0.22s
          ease-out;
      }
    `}</style>
  );
}

/* =========================================================
   FORMAT TIME
========================================================= */

function formatTime(
  time
) {
  if (
    !time
  ) {
    return "--:--";
  }

  const [
    hour,
    minute,
  ] =
    time.split(
      ":"
    );

  if (
    hour ===
      undefined ||
    minute ===
      undefined
  ) {
    return time;
  }

  const hourNumber =
    Number(
      hour
    );

  const period =
    hourNumber >=
    12
      ? "PM"
      : "AM";

  const formattedHour =
    hourNumber %
      12 ||
    12;

  return `${String(
    formattedHour
  ).padStart(
    2,
    "0"
  )}:${minute} ${period}`;
}

export default Children;
