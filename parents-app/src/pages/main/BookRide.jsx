import { createElement, useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, MapPin, Clock3, Route as RouteIcon, UserRound, Search, LoaderCircle, Plus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { API } from "../../api/api";
import MapPicker from "../../components/MapPicker";
import { createEmptyChild } from "../auth/onboarding/ChildDetailsStep";

const emptyChild = { ...createEmptyChild(), estimatedDistanceKm: "", estimatedTimeMinutes: "" };
const emptyRoute = { pickup: "", dropoff: "", distanceKm: "", durationMinutes: "" };
function BookRide() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [children, setChildren] = useState([emptyChild]);
  const [school, setSchool] = useState("");
  const [route, setRoute] = useState({ ...emptyRoute, pickupCoordinates: null, dropoffCoordinates: null, pickupTime: "", schoolPickupTime: "" });
  const [vehicleType, setVehicleType] = useState("AUTO");
  const [mapMode, setMapMode] = useState(null);
  const [quote, setQuote] = useState(null);
  const [driverChoice, setDriverChoice] = useState("");
  const [driverId, setDriverId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [bookingId, setBookingId] = useState("");
  const [bookingStatus, setBookingStatus] = useState(null);
  const [requestDelivery, setRequestDelivery] = useState(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState("");

  useEffect(() => {
    const pickupCoordinates = route.pickupCoordinates;
    const dropoffCoordinates = route.dropoffCoordinates;
    if (!pickupCoordinates || !dropoffCoordinates) {
      setRouteLoading(false);
      setRouteError("");
      return undefined;
    }

    let active = true;
    setRouteLoading(true);
    setRouteError("");
    API.post("/bookings/route-estimate", { pickupCoordinates, dropoffCoordinates })
      .then((response) => {
        if (!active) return;
        const estimate = response.data?.data;
        if (!Number.isFinite(Number(estimate?.distanceMeters)) || !Number.isFinite(Number(estimate?.distanceKm))) {
          throw new Error("Google Maps did not return a valid road route.");
        }
        setRoute((current) => ({ ...current, distanceMeters: Number(estimate.distanceMeters), distanceKm: Number(estimate.distanceKm), durationMinutes: Number(estimate.durationMinutes) }));
      })
      .catch((err) => {
        if (!active) return;
        setRoute((current) => ({ ...current, distanceMeters: null, distanceKm: "", durationMinutes: "" }));
        setRouteError(err?.response?.data?.message || err?.message || "Unable to calculate the driving route. Please try again.");
      })
      .finally(() => { if (active) setRouteLoading(false); });
    return () => { active = false; };
  }, [route.pickupCoordinates?.lat, route.pickupCoordinates?.lng, route.dropoffCoordinates?.lat, route.dropoffCoordinates?.lng]);

  useEffect(() => {
    if (step !== 3 || !bookingId) return undefined;
    let mounted = true;
    const refreshStatus = async () => {
      try {
        const response = await API.get("/bookings/mine");
        const current = (response.data?.data || []).find((booking) => String(booking._id) === bookingId);
        if (mounted && current) setBookingStatus(current);
      } catch (err) {
        console.warn("Unable to refresh booking status", err?.message);
      }
    };
    refreshStatus();
    const timer = window.setInterval(refreshStatus, 5000);
    return () => { mounted = false; window.clearInterval(timer); };
  }, [step, bookingId]);

  const updateChild = (index, key) => (event) => setChildren((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: event.target.value } : item));
  const getQuote = async (event) => {
    event.preventDefault(); setError(""); setLoading(true);
    try {
      if (!route.distanceMeters || routeLoading) throw new Error(routeError || "Wait for Google Maps to calculate the driving route.");
      const bookingChildren = children.map((item) => ({ ...item, school: school.trim() }));
      const response = await API.post("/bookings/quote", { children: bookingChildren, child: bookingChildren[0], vehicleType, workingDays: 26, route: { ...route, distanceKm: Number(route.distanceKm), durationMinutes: Number(route.durationMinutes || 0) } });
      setRoute((current) => ({ ...current, distanceMeters: Number(response.data.data.route.distanceMeters), distanceKm: Number(response.data.data.route.distanceKm), durationMinutes: Number(response.data.data.route.durationMinutes) }));
      setQuote(response.data.data); setStep(2);
    } catch (err) { setError(err?.response?.data?.message || "Please complete the child and route details."); }
    finally { setLoading(false); }
  };
  const submitRequest = async () => {
    setError(""); setLoading(true);
    try {
      const requestRoute = { ...quote.route, pickupTime: route.pickupTime, schoolPickupTime: route.schoolPickupTime, pickupCoordinates: quote.route.pickupCoordinates || route.pickupCoordinates, dropoffCoordinates: quote.route.dropoffCoordinates || route.dropoffCoordinates };
      const bookingChildren = quote.children || children.map((item) => ({ ...item, school: school.trim() }));
      const response = await API.post("/bookings/request", { child: bookingChildren[0], children: bookingChildren, route: requestRoute, quote: quote.quote, driverChoice, requestedDriverId: driverId, startDate });
      const result = response.data?.data || {};
      setBookingId(String(result.booking?._id || ""));
      setBookingStatus(result.booking || null);
      setRequestDelivery({
        targetDriverId: result.targetDriverId || (driverChoice === "existing" ? driverId.trim().toUpperCase() : null),
        offerSent: result.offerSent,
        message: response.data?.message || "",
      });
      setStep(3);
    } catch (err) { setError(err?.response?.data?.message || "Unable to send the booking request."); }
    finally { setLoading(false); }
  };
  const driverAccepted = bookingStatus?.status === "awaiting_payment" || bookingStatus?.driverRequestId?.matchingStatus === "Accepted";
  const directDeliveryFailed = driverChoice === "existing" && requestDelivery?.offerSent === false && !driverAccepted;
  const inputClass = "mt-1 h-12 w-full rounded-[15px] border border-[#E8D7A5] bg-white px-4 text-sm outline-none focus:border-[#FFB400] focus:ring-4 focus:ring-[#FFB400]/10";
  if (mapMode) return <MapPicker onBack={() => setMapMode(null)} onConfirm={(place) => { setRoute((current) => { const nextPoint = { lat: place.latitude, lng: place.longitude }; const next = mapMode === "pickup" ? { ...current, pickup: place.address, pickupCoordinates: nextPoint } : { ...current, dropoff: place.address, dropoffCoordinates: nextPoint }; return { ...next, distanceMeters: null, distanceKm: "", durationMinutes: "" }; }); setMapMode(null); }} />;
  return <main className="min-h-screen bg-[#FFF9EE] px-4 py-5 text-black">
    <div className="mx-auto max-w-[430px]">
      <button onClick={() => navigate("/app")} className="mb-5 flex items-center gap-2 text-xs font-bold text-[#9A6A00]"><ArrowLeft size={16}/> Back to dashboard</button>
      <div className="relative mb-6 overflow-hidden rounded-[25px] border border-[#EBDCA9] bg-gradient-to-br from-white via-[#FFFDF8] to-[#FFF1C8] p-5 shadow-[0_14px_36px_rgba(101,76,17,0.08)]">
        <div className="pointer-events-none absolute -right-10 -top-14 h-36 w-36 rounded-full bg-[#FFE39A]/50 blur-2xl" />
        <div className="relative">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[9px] font-extrabold uppercase tracking-[2px] text-[#B77D00]">Your booking journey</p>
            <span className="rounded-full border border-[#EBDCA9] bg-white/80 px-2.5 py-1 text-[9px] font-bold text-[#8B6A1E]">STEP {step} OF 3</span>
          </div>
          <h1 className="mt-2 text-[25px] font-extrabold leading-tight tracking-[-0.7px]">Book a ride for your child</h1>
          <p className="mt-2 max-w-[340px] text-[11px] leading-[18px] text-zinc-500">Set up a safe monthly route and we will coordinate the right driver for your family.</p>
          <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-[#EFE8D8]">
            <div className="h-full rounded-full bg-gradient-to-r from-[#E6A900] to-[#FFCA3A] transition-all duration-500" style={{ width: `${(step / 3) * 100}%` }} />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {["Child & route", "Driver choice", "Request sent"].map((label, index) => {
              const current = step === index + 1;
              const completed = step > index + 1;
              return <div key={label} className={`flex min-w-0 items-center gap-2 rounded-[14px] px-2 py-2 ${current ? "bg-white shadow-[0_5px_15px_rgba(101,76,17,0.08)] ring-1 ring-[#F0D98C]" : ""}`}>
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-extrabold ${completed ? "bg-[#E8F4EC] text-[#27804B]" : current ? "bg-[#FFB400] text-black" : "border border-[#E8DCC0] bg-white/70 text-zinc-400"}`}>{completed ? <CheckCircle2 size={15}/> : index + 1}</span>
                <span className={`truncate text-[8px] leading-tight ${current ? "font-extrabold text-black" : completed ? "font-bold text-[#27804B]" : "font-semibold text-zinc-400"}`}>{label}</span>
              </div>;
            })}
          </div>
        </div>
      </div>
      {step === 1 && <form onSubmit={getQuote} className="rounded-[24px] border border-[#EBDCA9] bg-white p-5 shadow-[0_12px_35px_rgba(101,76,17,0.07)]"><SectionTitle icon={UserRound} title="My Children" />
        <p className="-mt-2 mb-4 text-[10px] leading-4 text-zinc-500">Add every child who will use this shared monthly route. The price updates for the total number of children.</p>
        <div className="space-y-3">
          {children.map((item, index) => <div key={index} className="rounded-[18px] border border-[#EFE4D0] bg-[#FFFDF8] p-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[10px] font-extrabold uppercase tracking-[1px] text-[#9A6A00]">Child details</p>
              {children.length > 1 && <button type="button" onClick={() => setChildren((current) => current.filter((_, itemIndex) => itemIndex !== index))} className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[9px] font-bold text-[#8D4B43]" aria-label={"Remove child " + (index + 1)}><Trash2 size={12} /> Remove</button>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className="col-span-2 text-[10px] font-bold text-zinc-500">Child name<input required value={item.name} onChange={updateChild(index, "name")} className={inputClass} placeholder="Full name" /></label>
              <label className="text-[10px] font-bold text-zinc-500">Age<input required type="number" min="1" max="17" value={item.age} onChange={updateChild(index, "age")} className={inputClass} placeholder="Age" /></label>
              <label className="text-[10px] font-bold text-zinc-500">Grade<input value={item.grade} onChange={updateChild(index, "grade")} className={inputClass} placeholder="Class" /></label>
            </div>
          </div>)}
        </div>
        <button type="button" onClick={() => setChildren((current) => [...current, { ...emptyChild, school }])} className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-[14px] border border-dashed border-[#D8B24B] bg-[#FFF9EE] text-[11px] font-extrabold text-[#8A6100]"><Plus size={15} /> Add another child</button>
        <label className="mt-4 block text-[10px] font-bold text-zinc-500">School<input required value={school} onChange={(event) => setSchool(event.target.value)} className={inputClass} placeholder="School name (shared route)" /></label>
        <SectionTitle icon={MapPin} title="Ride information"/><LocationTimeCard label="HOME" locationLabel="Home location" timeLabel="Pickup time" value={route.pickup} time={route.pickupTime} onLocation={() => setMapMode("pickup")} onTime={(event) => setRoute((current) => ({ ...current, pickupTime: event.target.value }))} /><LocationTimeCard label="SCHOOL" locationLabel="School location" timeLabel="Pickup time" value={route.dropoff} time={route.schoolPickupTime} onLocation={() => setMapMode("dropoff")} onTime={(event) => setRoute((current) => ({ ...current, schoolPickupTime: event.target.value }))} /><div className="mt-3 grid grid-cols-2 gap-3"><label className="text-[10px] font-bold text-zinc-500">Estimated road distance<input readOnly required value={routeLoading ? "Calculating road route…" : route.distanceMeters ? `${route.distanceKm.toFixed(3)} km` : "Select both locations"} className={`${inputClass} bg-[#FFF9EE]`}/></label><label className="text-[10px] font-bold text-zinc-500">Estimated time<input readOnly required value={routeLoading ? "Calculating…" : route.durationMinutes ? `${route.durationMinutes} min` : "Select both locations"} className={`${inputClass} bg-[#FFF9EE]`}/></label></div><label className="mt-3 block text-[10px] font-bold text-zinc-500">Vehicle type<select value={vehicleType} onChange={(e) => setVehicleType(e.target.value)} className={inputClass}><option value="AUTO">Auto</option><option value="VAN">Van</option></select></label><p className="mt-2 text-[9px] text-zinc-400">Distance and time use the Google Maps driving route between your pinned locations.</p>{routeError && <ErrorText text={routeError}/>}{error && <ErrorText text={error}/>}<button disabled={loading || routeLoading || !route.distanceMeters || !route.pickupCoordinates || !route.dropoffCoordinates} className="mt-5 flex h-13 w-full items-center justify-between rounded-[17px] bg-[#FFB400] px-5 font-extrabold disabled:opacity-60"><span>{loading ? "Calculating..." : "Calculate monthly price"}</span>{loading ? <LoaderCircle className="animate-spin" size={18}/> : <ArrowRight size={18}/>}</button></form>}
      {step === 2 && quote && <div className="space-y-4"><div className="rounded-[24px] border border-[#EBDCA9] bg-white p-5 shadow-[0_12px_35px_rgba(101,76,17,0.07)]"><SectionTitle icon={RouteIcon} title="Your monthly price"/><div className="rounded-[17px] bg-[#FFF9EE] p-4"><div className="flex justify-between text-xs text-zinc-500"><span>{quote.route.distanceKm} km route · {quote.quote.childCount} {quote.quote.childCount === 1 ? "child" : "children"}</span><span>Valid for 15 minutes</span></div><p className="mt-2 text-[10px] text-zinc-500">{(quote.children || [quote.child]).map((child) => child.name).join(", ")}</p><div className="mt-4 space-y-2 text-xs"><div><div className="flex justify-between"><span>Distance charge</span><span className="font-bold text-black">₹{Number(quote.quote.distanceCharge).toLocaleString("en-IN")}</span></div><p className="mt-1 text-[10px] text-zinc-500">₹{Number(quote.quote.dailyDistanceCharge ?? (Number(quote.quote.distanceCharge) / Number(quote.quote.workingDays || 26))).toLocaleString("en-IN")} per day × {quote.quote.workingDays} working days</p></div><Line label="Additional child charge" value={quote.quote.additionalChildCharge}/><Line label="Ride subtotal" value={quote.quote.rideSubtotal}/><Line label="Platform fee (2%)" value={quote.quote.platformFee}/><Line label="Tax" value={quote.quote.tax}/><Line label="Discount" value={quote.quote.discount}/></div><div className="mt-4 flex justify-between border-t border-[#EBDCA9] pt-4 text-lg font-extrabold"><span>Monthly total</span><span>₹{quote.quote.totalMonthly.toLocaleString("en-IN")}</span></div></div></div><div className="rounded-[24px] border border-[#EBDCA9] bg-white p-5 shadow-[0_12px_35px_rgba(101,76,17,0.07)]"><SectionTitle icon={UserRound} title="Choose your driver path"/><button onClick={() => setDriverChoice("existing")} className={`mb-3 w-full rounded-[17px] border p-4 text-left ${driverChoice === "existing" ? "border-[#FFB400] bg-[#FFF9EE]" : "border-[#EBDCA9]"}`}><b className="text-sm">I already have a driver</b><p className="mt-1 text-[10px] text-zinc-500">Send this request to a verified ASAN driver.</p></button><button onClick={() => setDriverChoice("new")} className={`w-full rounded-[17px] border p-4 text-left ${driverChoice === "new" ? "border-[#FFB400] bg-[#FFF9EE]" : "border-[#EBDCA9]"}`}><b className="text-sm">I need a new driver</b><p className="mt-1 text-[10px] text-zinc-500">We will search for an available driver near your route.</p></button>{driverChoice === "existing" && <label className="mt-4 block text-[10px] font-bold text-zinc-500">Driver ASAN ID<input value={driverId} onChange={(e) => setDriverId(e.target.value.toUpperCase())} className={inputClass} placeholder="ASAN-XXXX"/></label>}<label className="mt-4 block text-[10px] font-bold text-zinc-500">Preferred start date<input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputClass}/></label>{error && <ErrorText text={error}/>}<button disabled={loading || !driverChoice || (driverChoice === "existing" && driverId.length < 3)} onClick={submitRequest} className="mt-5 flex h-13 w-full items-center justify-between rounded-[17px] bg-black px-5 font-extrabold text-white disabled:opacity-40"><span>{loading ? "Sending request..." : "Send driver request"}</span>{loading ? <LoaderCircle className="animate-spin" size={18}/> : <ArrowRight size={18}/>}</button></div></div>}
      {step === 3 && <div className="rounded-[24px] border border-[#EBDCA9] bg-white p-7 text-center shadow-[0_12px_35px_rgba(101,76,17,0.07)]">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#FFF1C8] text-[#B77D00]"><CheckCircle2 size={30}/></div>
        <h2 className="mt-4 text-2xl font-extrabold">{directDeliveryFailed ? "Request needs attention" : "Request sent"}</h2>
        <p className="mt-2 text-sm leading-6 text-zinc-500">{driverAccepted ? "Your driver has accepted the request." : directDeliveryFailed ? requestDelivery.message || `We could not deliver this request to ASAN ID ${requestDelivery.targetDriverId}. Please contact the institute.` : driverChoice === "existing" ? `Your request was sent to ASAN ID ${requestDelivery?.targetDriverId || driverId.trim().toUpperCase()}. We’re waiting for the driver to accept.` : "Your request has been sent. We’re waiting for a nearby driver to accept."}</p>
        <div className="mt-5 rounded-[18px] bg-[#FFF9EE] p-4 text-left">
          <p className="text-[9px] font-extrabold uppercase tracking-[1.5px] text-[#B77D00]">Request progress</p>
          <div className="mt-3 flex items-start gap-3">
            <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${driverAccepted ? "bg-[#E8F4EC] text-[#27804B]" : "bg-[#FFF1C8] text-[#B77D00]"}`}>{driverAccepted ? <CheckCircle2 size={15}/> : <Clock3 size={15}/>}</span>
            <div><p className="text-[11px] font-extrabold">{driverAccepted ? "Driver accepted" : directDeliveryFailed ? "Offer not delivered" : "Waiting for driver acceptance"}</p><p className="mt-1 text-[10px] leading-4 text-zinc-500">{driverAccepted ? "Your booking is ready for the next step." : directDeliveryFailed ? `Target: ASAN ID ${requestDelivery.targetDriverId}` : driverChoice === "existing" ? `Offer sent to ASAN ID ${requestDelivery?.targetDriverId || driverId.trim().toUpperCase()}` : "We’ll update you when a nearby driver responds."}</p></div>
          </div>
          {driverAccepted && <p className="mt-4 border-t border-[#EBDCA9] pt-3 text-[11px] font-bold">Monthly price: ₹{Number(bookingStatus?.quote?.totalMonthly || quote?.quote?.totalMonthly || 0).toLocaleString("en-IN")}</p>}
        </div>
        {error && <ErrorText text={error}/>}
        {driverAccepted && <button onClick={() => navigate(`/booking-payment/${bookingId}`)} className="mt-5 h-12 w-full rounded-[15px] bg-[#FFB400] font-extrabold">{bookingStatus?.status === "active" ? "View payment receipt" : "Pay monthly price"}</button>}
        <button onClick={() => navigate("/app")} className="mt-6 h-12 w-full rounded-[15px] bg-[#FFB400] font-extrabold">Return to dashboard</button>
      </div>}
    </div>
  </main>;
}
function LocationTimeCard({ label, locationLabel, timeLabel, value, time, onLocation, onTime }) { return <section className="mt-4"><p className="mb-2 text-[11px] font-extrabold text-black">{label}</p><div className="overflow-hidden rounded-[19px] border border-[#E8D7A5] bg-white"><button type="button" onClick={onLocation} className="flex w-full items-center gap-3 border-b border-[#EBDCA9] px-3 py-3 text-left"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] bg-[#FFF1C8] text-[#B77D00]"><MapPin size={18}/></span><span className="min-w-0 flex-1"><span className="block text-[10px] text-zinc-400">{locationLabel}</span><span className="mt-1 block truncate text-sm font-semibold">{value || "Search and pin on map"}</span></span><Search size={16} className="shrink-0 text-emerald-500"/></button><label className="flex items-center gap-3 px-3 py-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] bg-[#FFF1C8] text-[#B77D00]"><Clock3 size={18}/></span><span className="min-w-0 flex-1"><span className="block text-[10px] text-zinc-400">{timeLabel}</span><input required type="time" value={time} onChange={onTime} className="mt-1 w-full bg-transparent text-sm font-semibold outline-none" /></span></label></div></section>; }
function SectionTitle({ icon, title }) { return <div className="mb-4 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-[13px] bg-[#FFF1C8] text-[#B77D00]">{createElement(icon, { size: 18 })}</div><h2 className="text-lg font-extrabold">{title}</h2></div>; }
function Line({ label, value }) { return <div className="flex justify-between"><span>{label}</span><span className="font-bold text-black">₹{Number(value).toLocaleString("en-IN")}</span></div>; }
function ErrorText({ text }) { return <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-[10px] text-red-600">{text}</p>; }
function LocationButton({ label, value, onClick }) { return <button type="button" onClick={onClick} className="mt-3 flex min-h-12 w-full items-center gap-3 rounded-[15px] border border-[#E8D7A5] bg-white px-4 text-left"><MapPin size={17} className="shrink-0 text-[#B77D00]"/><span className="min-w-0 flex-1"><span className="block text-[10px] font-bold text-zinc-500">{label}</span><span className={`mt-0.5 block truncate text-sm ${value ? "text-black" : "text-zinc-400"}`}>{value || "Search and pin a location"}</span></span><Search size={16} className="shrink-0 text-[#B77D00]"/></button>; }
export default BookRide;










