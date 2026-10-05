import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, MapPin, Clock3, Route as RouteIcon, UserRound, Search, LoaderCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { API } from "../../api/api";
import MapPicker from "../../components/MapPicker";
import { createEmptyChild } from "../auth/onboarding/ChildDetailsStep";

const emptyChild = { ...createEmptyChild(), estimatedDistanceKm: "", estimatedTimeMinutes: "" };
const emptyRoute = { pickup: "", dropoff: "", distanceKm: "", durationMinutes: "" };
const routeEstimate = (from, to) => {
  if (!from || !to) return {};
  const radians = (value) => (value * Math.PI) / 180;
  const dLat = radians(to.lat - from.lat);
  const dLng = radians(to.lng - from.lng);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(radians(from.lat)) * Math.cos(radians(to.lat)) * Math.sin(dLng / 2) ** 2;
  const distanceKm = Math.round(6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10;
  return { distanceKm, durationMinutes: Math.max(1, Math.round((distanceKm / 25) * 60)) };
};

function BookRide() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [child, setChild] = useState(emptyChild);
  const [route, setRoute] = useState({ ...emptyRoute, pickupCoordinates: null, dropoffCoordinates: null, pickupTime: "", schoolPickupTime: "" });
  const [vehicleType, setVehicleType] = useState("AUTO");
  const [mapMode, setMapMode] = useState(null);
  const [quote, setQuote] = useState(null);
  const [driverChoice, setDriverChoice] = useState("");
  const [driverId, setDriverId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [complete, setComplete] = useState("");
  const [bookingId, setBookingId] = useState("");
  const [bookingStatus, setBookingStatus] = useState(null);
  const [retryLoading, setRetryLoading] = useState(false);

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

  const update = (setter, key) => (event) => setter((current) => ({ ...current, [key]: event.target.value }));
  const getQuote = async (event) => {
    event.preventDefault(); setError(""); setLoading(true);
    try {
      const response = await API.post("/bookings/quote", { child: { ...child, count: 1 }, vehicleType, workingDays: 26, route: { ...route, distanceKm: Number(route.distanceKm), durationMinutes: Number(route.durationMinutes || 0) } });
      setQuote(response.data.data); setStep(2);
    } catch (err) { setError(err?.response?.data?.message || "Please complete the child and route details."); }
    finally { setLoading(false); }
  };
  const submitRequest = async () => {
    setError(""); setLoading(true);
    try {
      const requestRoute = { ...quote.route, pickupTime: route.pickupTime, schoolPickupTime: route.schoolPickupTime, pickupCoordinates: quote.route.pickupCoordinates || route.pickupCoordinates, dropoffCoordinates: quote.route.dropoffCoordinates || route.dropoffCoordinates };
      const response = await API.post("/bookings/request", { child, route: requestRoute, quote: quote.quote, driverChoice, requestedDriverId: driverId, startDate });
      setBookingId(String(response.data?.data?.booking?._id || ""));
      setBookingStatus(response.data?.data?.booking || null);
      setComplete(response.data.message); setStep(3);
    } catch (err) { setError(err?.response?.data?.message || "Unable to send the booking request."); }
    finally { setLoading(false); }
  };
  const retryWithNearbyDrivers = async () => {
    if (!bookingId) return;
    setRetryLoading(true);
    setError("");
    try {
      const response = await API.put(`/bookings/mine/${bookingId}/retry-search`);
      setDriverChoice("new");
      setBookingStatus(response.data?.data || null);
      setComplete(response.data?.message || "Nearby driver search started.");
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to start a nearby driver search.");
    } finally {
      setRetryLoading(false);
    }
  };
  const inputClass = "mt-1 h-12 w-full rounded-[15px] border border-[#E8D7A5] bg-white px-4 text-sm outline-none focus:border-[#FFB400] focus:ring-4 focus:ring-[#FFB400]/10";
  if (mapMode) return <MapPicker onBack={() => setMapMode(null)} onConfirm={(place) => { setRoute((current) => { const nextPoint = { lat: place.latitude, lng: place.longitude }; const next = mapMode === "pickup" ? { ...current, pickup: place.address, pickupCoordinates: nextPoint } : { ...current, dropoff: place.address, dropoffCoordinates: nextPoint }; return { ...next, ...routeEstimate(next.pickupCoordinates, next.dropoffCoordinates) }; }); setMapMode(null); }} />;
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
      {step === 1 && <form onSubmit={getQuote} className="rounded-[24px] border border-[#EBDCA9] bg-white p-5 shadow-[0_12px_35px_rgba(101,76,17,0.07)]"><SectionTitle icon={UserRound} title="Child details"/><div className="grid grid-cols-2 gap-3"><label className="col-span-2 text-[10px] font-bold text-zinc-500">Child name<input required value={child.name} onChange={update(setChild,"name")} className={inputClass} placeholder="Full name"/></label><label className="text-[10px] font-bold text-zinc-500">Age<input required type="number" min="1" max="17" value={child.age} onChange={update(setChild,"age")} className={inputClass} placeholder="Age"/></label><label className="text-[10px] font-bold text-zinc-500">Grade<input value={child.grade} onChange={update(setChild,"grade")} className={inputClass} placeholder="Class"/></label><label className="col-span-2 text-[10px] font-bold text-zinc-500">School<input required value={child.school} onChange={update(setChild,"school")} className={inputClass} placeholder="School name"/></label></div><SectionTitle icon={MapPin} title="Ride information"/><LocationTimeCard label="HOME" locationLabel="Home location" timeLabel="Pickup time" value={route.pickup} time={route.pickupTime} onLocation={() => setMapMode("pickup")} onTime={(event) => setRoute((current) => ({ ...current, pickupTime: event.target.value }))} /><LocationTimeCard label="SCHOOL" locationLabel="School location" timeLabel="Pickup time" value={route.dropoff} time={route.schoolPickupTime} onLocation={() => setMapMode("dropoff")} onTime={(event) => setRoute((current) => ({ ...current, schoolPickupTime: event.target.value }))} /><div className="mt-3 grid grid-cols-2 gap-3"><label className="text-[10px] font-bold text-zinc-500">Estimated distance<input readOnly required value={route.distanceKm ? `${route.distanceKm} km` : "Select both locations"} className={`${inputClass} bg-[#FFF9EE]`}/></label><label className="text-[10px] font-bold text-zinc-500">Estimated time<input readOnly required value={route.durationMinutes ? `${route.durationMinutes} min` : "Select both locations"} className={`${inputClass} bg-[#FFF9EE]`}/></label></div><label className="mt-3 block text-[10px] font-bold text-zinc-500">Vehicle type<select value={vehicleType} onChange={(e) => setVehicleType(e.target.value)} className={inputClass}><option value="AUTO">Auto</option><option value="VAN">Van</option></select></label><p className="mt-2 text-[9px] text-zinc-400">Search and pin both locations on the map. Distance and travel time will be filled automatically.</p>{error && <ErrorText text={error}/>}<button disabled={loading || !route.pickupCoordinates || !route.dropoffCoordinates} className="mt-5 flex h-13 w-full items-center justify-between rounded-[17px] bg-[#FFB400] px-5 font-extrabold disabled:opacity-60"><span>{loading ? "Calculating..." : "Calculate monthly price"}</span>{loading ? <LoaderCircle className="animate-spin" size={18}/> : <ArrowRight size={18}/>}</button></form>}
      {step === 2 && quote && <div className="space-y-4"><div className="rounded-[24px] border border-[#EBDCA9] bg-white p-5 shadow-[0_12px_35px_rgba(101,76,17,0.07)]"><SectionTitle icon={RouteIcon} title="Your monthly price"/><div className="rounded-[17px] bg-[#FFF9EE] p-4"><div className="flex justify-between text-xs text-zinc-500"><span>{quote.route.distanceKm} km route</span><span>Valid for 15 minutes</span></div><div className="mt-4 space-y-2 text-xs"><Line label="Distance charge" value={quote.quote.distanceCharge}/><Line label="Additional child charge" value={quote.quote.additionalChildCharge}/><Line label="Ride subtotal" value={quote.quote.rideSubtotal}/><Line label="Platform fee (2%)" value={quote.quote.platformFee}/><Line label="Tax" value={quote.quote.tax}/><Line label="Discount" value={quote.quote.discount}/></div><div className="mt-4 flex justify-between border-t border-[#EBDCA9] pt-4 text-lg font-extrabold"><span>Monthly total</span><span>₹{quote.quote.totalMonthly.toLocaleString("en-IN")}</span></div></div></div><div className="rounded-[24px] border border-[#EBDCA9] bg-white p-5 shadow-[0_12px_35px_rgba(101,76,17,0.07)]"><SectionTitle icon={UserRound} title="Choose your driver path"/><button onClick={() => setDriverChoice("existing")} className={`mb-3 w-full rounded-[17px] border p-4 text-left ${driverChoice === "existing" ? "border-[#FFB400] bg-[#FFF9EE]" : "border-[#EBDCA9]"}`}><b className="text-sm">I already have a driver</b><p className="mt-1 text-[10px] text-zinc-500">Send this request to a verified ASAN driver.</p></button><button onClick={() => setDriverChoice("new")} className={`w-full rounded-[17px] border p-4 text-left ${driverChoice === "new" ? "border-[#FFB400] bg-[#FFF9EE]" : "border-[#EBDCA9]"}`}><b className="text-sm">I need a new driver</b><p className="mt-1 text-[10px] text-zinc-500">We will search for an available driver near your route.</p></button>{driverChoice === "existing" && <label className="mt-4 block text-[10px] font-bold text-zinc-500">Driver ASAN ID<input value={driverId} onChange={(e) => setDriverId(e.target.value.toUpperCase())} className={inputClass} placeholder="ASAN-XXXX"/></label>}<label className="mt-4 block text-[10px] font-bold text-zinc-500">Preferred start date<input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputClass}/></label>{error && <ErrorText text={error}/>}<button disabled={loading || !driverChoice || (driverChoice === "existing" && driverId.length < 3)} onClick={submitRequest} className="mt-5 flex h-13 w-full items-center justify-between rounded-[17px] bg-black px-5 font-extrabold text-white disabled:opacity-40"><span>{loading ? "Sending request..." : "Send driver request"}</span>{loading ? <LoaderCircle className="animate-spin" size={18}/> : <ArrowRight size={18}/>}</button></div></div>}
      {step === 3 && <div className="rounded-[24px] border border-[#EBDCA9] bg-white p-7 text-center shadow-[0_12px_35px_rgba(101,76,17,0.07)]"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#FFF1C8] text-[#B77D00]"><CheckCircle2 size={30}/></div><h2 className="mt-4 text-2xl font-extrabold">Request received</h2><p className="mt-2 text-sm leading-6 text-zinc-500">{complete}</p><div className="mt-5 rounded-[18px] bg-[#FFF9EE] p-4 text-left"><p className="text-[9px] font-extrabold uppercase tracking-[1.5px] text-[#B77D00]">Live request status</p><p className="mt-2 text-sm font-extrabold">{bookingStatus?.status === "awaiting_payment" ? "Driver accepted · payment required" : bookingStatus?.driverRequestId?.matchingStatus === "Exhausted" ? driverChoice === "existing" ? "The selected driver could not accept" : "No nearby driver is available right now" : driverChoice === "new" ? "Searching nearby drivers" : "Waiting for your driver to respond"}</p><p className="mt-1 text-[10px] leading-5 text-zinc-500">{bookingStatus?.status === "awaiting_payment" ? `Monthly price: ₹${Number(bookingStatus?.quote?.totalMonthly || quote?.quote?.totalMonthly || 0).toLocaleString("en-IN")}.` : "This status refreshes automatically while the request is open."}</p></div>{bookingStatus?.driverRequestId?.matchingStatus === "Exhausted" && driverChoice === "existing" && <button disabled={retryLoading} onClick={retryWithNearbyDrivers} className="mt-4 h-12 w-full rounded-[15px] bg-black font-extrabold text-white disabled:opacity-60">{retryLoading ? "Starting search..." : "Search for a nearby driver"}</button>}{error && <ErrorText text={error}/>}<button onClick={() => navigate("/app")} className="mt-6 h-12 w-full rounded-[15px] bg-[#FFB400] font-extrabold">Return to dashboard</button></div>}
    </div>
  </main>;
}
function LocationTimeCard({ label, locationLabel, timeLabel, value, time, onLocation, onTime }) { return <section className="mt-4"><p className="mb-2 text-[11px] font-extrabold text-black">{label}</p><div className="overflow-hidden rounded-[19px] border border-[#E8D7A5] bg-white"><button type="button" onClick={onLocation} className="flex w-full items-center gap-3 border-b border-[#EBDCA9] px-3 py-3 text-left"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] bg-[#FFF1C8] text-[#B77D00]"><MapPin size={18}/></span><span className="min-w-0 flex-1"><span className="block text-[10px] text-zinc-400">{locationLabel}</span><span className="mt-1 block truncate text-sm font-semibold">{value || "Search and pin on map"}</span></span><Search size={16} className="shrink-0 text-emerald-500"/></button><label className="flex items-center gap-3 px-3 py-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] bg-[#FFF1C8] text-[#B77D00]"><Clock3 size={18}/></span><span className="min-w-0 flex-1"><span className="block text-[10px] text-zinc-400">{timeLabel}</span><input required type="time" value={time} onChange={onTime} className="mt-1 w-full bg-transparent text-sm font-semibold outline-none" /></span></label></div></section>; }
function SectionTitle({ icon: Icon, title }) { return <div className="mb-4 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-[13px] bg-[#FFF1C8] text-[#B77D00]"><Icon size={18}/></div><h2 className="text-lg font-extrabold">{title}</h2></div>; }
function Line({ label, value }) { return <div className="flex justify-between"><span>{label}</span><span className="font-bold text-black">₹{Number(value).toLocaleString("en-IN")}</span></div>; }
function ErrorText({ text }) { return <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-[10px] text-red-600">{text}</p>; }
function LocationButton({ label, value, onClick }) { return <button type="button" onClick={onClick} className="mt-3 flex min-h-12 w-full items-center gap-3 rounded-[15px] border border-[#E8D7A5] bg-white px-4 text-left"><MapPin size={17} className="shrink-0 text-[#B77D00]"/><span className="min-w-0 flex-1"><span className="block text-[10px] font-bold text-zinc-500">{label}</span><span className={`mt-0.5 block truncate text-sm ${value ? "text-black" : "text-zinc-400"}`}>{value || "Search and pin a location"}</span></span><Search size={16} className="shrink-0 text-[#B77D00]"/></button>; }
export default BookRide;










