import { Link } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { API } from "../../api/api";
import { AlertCircle, CheckCircle2, Clock3, RefreshCw, Route, X } from "lucide-react";

const openBookingStatuses = new Set(["quoted", "awaiting_driver", "driver_searching", "driver_accepted", "awaiting_payment", "active"]);
const canCancelStatuses = new Set(["awaiting_driver", "driver_searching"]);

function getStatus(booking) {
  const status = booking.status;
  if (booking.driverRequestId?.matchingStatus === "Exhausted") return { title: "Driver search needs attention", detail: booking.driverRequestId?.rejectionReason || "We haven’t found an available driver yet.", tone: "amber" };
  if (status === "awaiting_driver") return { title: "Waiting for driver acceptance", detail: "Your request has been sent to your selected driver.", tone: "amber" };
  if (status === "driver_searching") return { title: "Finding a driver", detail: "Your request is being matched with available drivers.", tone: "amber" };
  if (status === "driver_accepted" || status === "awaiting_payment") return { title: "Driver accepted", detail: `Driver ${booking.assignedDriverId || booking.driverRequestId?.assignedDriverId || "assigned"} accepted your request.`, tone: "green" };
  if (status === "active") return { title: "Service active", detail: `Your monthly ride service is in progress${booking.assignedDriverId ? ` with driver ${booking.assignedDriverId}` : ""}.`, tone: "green" };
  return { title: "Request received", detail: "Your booking request is being processed.", tone: "amber" };
}

function CurrentBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [cancelId, setCancelId] = useState("");
  const [busyId, setBusyId] = useState("");
  const [notice, setNotice] = useState("");

  const loadBookings = useCallback(async (quiet = false) => {
    if (quiet) setRefreshing(true);
    try {
      const response = await API.get("/bookings/mine");
      const current = (response.data?.data || []).filter((booking) => openBookingStatuses.has(booking.status));
      setBookings(current);
      setError("");
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "Unable to load your booking status.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const initialLoad = window.setTimeout(() => loadBookings(), 0);
    const timer = window.setInterval(() => loadBookings(true), 15000);
    return () => { window.clearTimeout(initialLoad); window.clearInterval(timer); };
  }, [loadBookings]);

  const cancelBooking = async (bookingId) => {
    setBusyId(bookingId);
    setError("");
    try {
      await API.put(`/bookings/mine/${bookingId}/cancel`);
      setCancelId("");
      setNotice("Booking request cancelled.");
      await loadBookings(true);
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "Unable to cancel this booking request.");
      await loadBookings(true);
    } finally {
      setBusyId("");
    }
  };

  return (
    <section className="mt-6 rounded-[25px] border border-[#EBDCA9] bg-white p-4 shadow-[0_12px_32px_rgba(101,76,17,0.06)]" aria-label="Current bookings">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[9px] font-extrabold uppercase tracking-[1.6px] text-[#B77D00]">Booking tracker</p>
          <h2 className="mt-1 text-[19px] font-extrabold text-black">Your current bookings</h2>
        </div>
        <button type="button" onClick={() => loadBookings(true)} disabled={refreshing} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#EFE4D0] bg-[#FFF9EE] text-[#8C6A18] disabled:opacity-50" aria-label="Refresh booking status">
          <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
        </button>
      </div>

      {notice && <p className="mt-3 rounded-[13px] bg-[#EEF8F1] px-3 py-2 text-[10px] font-bold text-[#2F7149]">{notice}</p>}
      {error && <p className="mt-3 flex items-start gap-2 rounded-[13px] bg-red-50 px-3 py-2 text-[10px] font-semibold text-red-700"><AlertCircle size={14} className="mt-0.5 shrink-0" />{error}</p>}

      {loading ? (
        <div className="mt-4 flex items-center gap-2 rounded-[17px] bg-[#FFF9EE] p-4 text-[11px] text-[#817669]"><RefreshCw size={14} className="animate-spin" /> Loading your booking status…</div>
      ) : bookings.length === 0 ? (
        <div className="mt-4 rounded-[17px] bg-[#FFF9EE] p-4 text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#FFF1C8] text-[#B77D00]"><Route size={18} /></div>
          <p className="mt-2 text-[12px] font-extrabold text-black">No current bookings</p>
          <p className="mt-1 text-[10px] leading-4 text-[#817669]">Your sent ride requests and active services will appear here.</p>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {bookings.map((booking) => {
            const status = getStatus(booking);
            const child = booking.childId || booking.child || {};
            const cancellable = canCancelStatuses.has(booking.status) && booking.driverRequestId?.status !== "Cancelled";
            return (
              <article key={booking._id} className="overflow-hidden rounded-[19px] border border-[#EFE4D0] bg-[#FFFDF8]">
                <div className="h-1 bg-[#FFB400]" />
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[8px] font-extrabold uppercase tracking-[1.3px] text-[#95897C]">{child.name || "Child ride"}</p>
                      <h3 className="mt-1 truncate text-[13px] font-extrabold text-black">{child.school || "School route"}</h3>
                    </div>
                    <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[8px] font-extrabold ${status.tone === "green" ? "bg-[#EAF5ED] text-[#35764B]" : "bg-[#FFF1C8] text-[#946900]"}`}>
                      {status.tone === "green" ? <CheckCircle2 size={12} /> : <Clock3 size={12} />}{status.title}
                    </span>
                  </div>
                  <p className="mt-2 text-[10px] leading-4 text-[#756B5F]">{status.detail}</p>
                  <div className="mt-3 space-y-1.5 rounded-[13px] bg-[#FFF8E8] p-3 text-[9px] leading-4 text-[#51483B]">
                    <p className="truncate"><b>Home:</b> {booking.route?.pickup || "—"}{booking.route?.pickupTime ? ` · ${booking.route.pickupTime}` : ""}</p>
                    <p className="truncate"><b>School:</b> {booking.route?.dropoff || "—"}{booking.route?.schoolPickupTime ? ` · ${booking.route.schoolPickupTime}` : ""}</p>
                    <div className="flex items-center justify-between gap-2 border-t border-[#EFE4D0] pt-2 text-[#817669]">
                      <span>{booking.route?.distanceKm || "—"} km · {booking.quote?.vehicleType || "Ride"}</span>
                      <b className="shrink-0 text-[11px] text-[#8A6100]">₹{Number(booking.quote?.totalMonthly || 0).toLocaleString("en-IN")} / month</b>
                    </div>
                  </div>
                  {["awaiting_payment", "active"].includes(booking.status) && <Link to={`/booking-payment/${booking._id}`} className="mt-3 flex h-11 items-center justify-center rounded-[13px] bg-[#FFB400] text-xs font-extrabold text-black">{booking.status === "active" ? "View payment and service dates" : "Pay monthly price"}</Link>}
                  {cancellable && (cancelId === booking._id ? (
                    <div className="mt-3 rounded-[13px] border border-[#F0D9D5] bg-[#FFF7F5] p-3">
                      <p className="text-[10px] font-bold text-[#7C342D]">Cancel this ride request?</p>
                      <p className="mt-1 text-[9px] leading-4 text-[#8C625B]">The driver offer will be withdrawn. You can submit a new request later.</p>
                      <div className="mt-2 flex gap-2">
                        <button type="button" onClick={() => setCancelId("")} disabled={busyId === booking._id} className="h-9 flex-1 rounded-[11px] border border-[#E7D9D6] bg-white text-[9px] font-bold text-[#6D6255]">Keep request</button>
                        <button type="button" onClick={() => cancelBooking(booking._id)} disabled={busyId === booking._id} className="h-9 flex-1 rounded-[11px] bg-[#B83E32] text-[9px] font-extrabold text-white disabled:opacity-50">{busyId === booking._id ? "Cancelling…" : "Confirm cancellation"}</button>
                      </div>
                    </div>
                  ) : (
                    <button type="button" onClick={() => { setNotice(""); setCancelId(booking._id); }} className="mt-3 inline-flex h-9 items-center gap-1.5 rounded-[11px] border border-[#E7D9D6] bg-white px-3 text-[9px] font-bold text-[#8D4B43]"><X size={13} /> Cancel request</button>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default CurrentBookings;
