import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, CreditCard, LoaderCircle, RefreshCw, ShieldCheck } from "lucide-react";
import { API } from "../../api/api";

let sdkPromise;
function loadRazorpay() {
  if (window.Razorpay) return Promise.resolve(window.Razorpay);
  if (!sdkPromise) sdkPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    const timer = setTimeout(() => { script.remove(); reject(new Error("Payment checkout took too long to load. Please retry.")); }, 20000);
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => { clearTimeout(timer); window.Razorpay ? resolve(window.Razorpay) : reject(new Error("Unable to open payment checkout.")); };
    script.onerror = () => { clearTimeout(timer); script.remove(); reject(new Error("Unable to load payment checkout. Check your connection.")); };
    document.head.appendChild(script);
  }).catch((error) => { sdkPromise = null; throw error; });
  return sdkPromise;
}

export default function BookingPayment() {
  const { id } = useParams();
  const [details, setDetails] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [checking, setChecking] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const refresh = useCallback(async (verify = false) => {
    setChecking(true);
    try {
      if (verify) await API.get(`/booking-payments/${id}/status`);
      const response = await API.get(`/booking-payments/${id}`);
      setDetails(response.data.data);
      setError("");
    } catch (err) { setError(err.response?.data?.message || "Unable to check payment. Please retry."); }
    finally { setChecking(false); }
  }, [id]);
  useEffect(() => { refresh(); }, [refresh]);
  const hasOrder = Boolean(details?.payment);
  const paid = details?.payment?.status === "PAID";
  useEffect(() => {
    if (!hasOrder || paid) return;
    let count = 0;
    refresh(true);
    const timer = setInterval(() => { if (++count >= 12) clearInterval(timer); else refresh(true); }, 10000);
    return () => clearInterval(timer);
  }, [hasOrder, paid, refresh]);
  const pay = async () => {
    let opened = false;
    setBusy(true); setError("");
    try {
      const Razorpay = await loadRazorpay();
      const response = await API.post(`/booking-payments/${id}/order`);
      const order = response.data.data;
      if (order.paid) { await refresh(); return; }
      let completed = false;
      let failed = false;
      const checkout = new Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "ASAN Rides",
        description: "Monthly child ride service",
        order_id: order.order_id,
        handler: async (result) => {
          completed = true;
          setBusy(true);
          try {
            await API.post(`/booking-payments/${id}/verify`, result);
            await refresh();
          } catch (err) {
            setError(err.response?.data?.message || "Payment could not be confirmed yet. Check payment status before retrying.");
          } finally { setBusy(false); }
        },
        modal: { ondismiss: () => { setBusy(false); if (!completed && !failed) setError("Payment window closed. No new payment was confirmed."); } },
      });
      checkout.on("payment.failed", (event) => {
        failed = true;
        setBusy(false);
        setError(event.error?.description || "Payment failed. Please try again.");
      });
      checkout.open();
      opened = true;
    } catch (err) { setError(err.response?.data?.message || err.message || "Unable to start payment."); }
    finally { if (!opened) setBusy(false); }
  };
  const booking = details?.booking;
  const payment = details?.payment;
  const cancelled = booking?.status === "cancelled";
  const canCancel = booking?.status === "awaiting_payment" && !paid && !cancelling && !busy && !checking;
  const cancelBooking = async () => {
    setCancelling(true); setError("");
    try {
      await API.put(`/bookings/mine/${id}/cancel`);
      setConfirmCancel(false);
      await refresh();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to cancel this booking. Please refresh and try again.");
      await refresh();
    } finally { setCancelling(false); }
  };
  const date = (value) => value ? new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";
  return <main className="min-h-screen bg-[#FFF9EE] px-4 py-6 text-black"><div className="mx-auto max-w-[430px]">
    <Link to="/app" className="mb-5 inline-flex items-center gap-2 text-xs font-bold text-[#9A6A00]"><ArrowLeft size={16}/> Back to dashboard</Link>
    <header className="rounded-[25px] border border-[#EBDCA9] bg-gradient-to-br from-white to-[#FFF1C8] p-6">
      <p className="text-[9px] font-extrabold uppercase tracking-[2px] text-[#B77D00]">Your monthly ride</p>
      <h1 className="mt-3 text-[26px] font-extrabold">{cancelled ? "Booking cancelled" : paid ? "Payment received" : "Complete your booking"}</h1>
      <p className="mt-2 text-xs leading-5 text-zinc-500">{cancelled ? "This booking has been cancelled. You can start a new booking from your dashboard." : paid ? "Your payment is confirmed. Your service dates are below." : "Pay securely to begin your child’s monthly ride service."}</p>
    </header>
    {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-xs text-red-700">{error}</p>}
    {!details ? <button onClick={() => refresh()} className="mt-5 flex items-center gap-2 text-sm">{checking && <LoaderCircle size={16} className="animate-spin"/>}{checking ? "Loading booking…" : "Retry loading booking"}</button> : <section className="mt-5 rounded-[24px] border border-[#EBDCA9] bg-white p-6 shadow-[0_12px_35px_rgba(101,76,17,0.07)]">
      <div className="mb-4 flex items-center gap-3"><span className="rounded-[14px] bg-[#FFF1C8] p-3 text-[#B77D00]">{paid ? <CheckCircle2/> : <CreditCard/>}</span><div><h2 className="font-extrabold">{booking.child?.name}</h2><p className="text-xs text-zinc-500">{booking.child?.school}</p></div></div>
      <div className="space-y-3 rounded-[17px] bg-[#FFF9EE] p-4 text-xs text-zinc-600"><p><b>Driver:</b> {booking.assignedDriverId || "Waiting for acceptance"}</p><p><b>Home:</b> {booking.route?.pickup}</p><p><b>School:</b> {booking.route?.dropoff}</p><div className="flex justify-between border-t border-[#EBDCA9] pt-3 text-lg font-extrabold text-black"><span>Monthly price</span><span>₹{Number(payment?.amount || booking.quote?.totalMonthly || 0).toLocaleString("en-IN")}</span></div></div>
      {cancelled ? <div role="status" className={`mt-4 rounded-[16px] p-4 text-xs leading-6 ${payment?.status === "REFUNDED" ? "bg-[#EAF5ED] text-[#35764B]" : "bg-[#FFF9EE] text-[#725B2A]"}`}><b>{payment?.status === "REFUNDED" ? "Payment refunded" : payment?.status === "REFUNDING" ? "Refund processing" : payment?.status === "REFUND_FAILED" ? "Refund needs attention" : "Booking cancelled"}</b><p>{payment?.status === "REFUNDED" ? "A payment completed at the time of cancellation has been refunded." : payment?.status === "REFUNDING" ? "A payment completed at the time of cancellation; the refund is being processed." : payment?.status === "REFUND_FAILED" ? "Please contact support so the payment can be refunded." : "No ride service will start for this booking."}</p><Link to="/app" className="mt-3 inline-flex font-extrabold underline">Return to dashboard</Link></div> : paid ? <div className="mt-4 rounded-[16px] bg-[#EAF5ED] p-4 text-xs leading-6 text-[#35764B]"><b>{booking.status === "expired" ? "Service ended" : "Service active"}</b><p>{date(booking.serviceStartsAt)} – {date(booking.serviceEndsAt)}</p><p className="break-all">Payment reference: {payment.paymentId}</p><p>Paid on {date(payment.paidAt)}</p></div> : <>
        {payment && <p role="status" className="mt-4 text-xs text-[#8A6100]">{payment.status === "FAILED" ? "Your last attempt was not completed. You can try again." : ["EXPIRED", "TERMINATED"].includes(payment.status) ? "The checkout session expired. You can start a new attempt." : "Waiting for payment confirmation. Use Check payment status if you have already paid."}</p>}
        {booking.status === "awaiting_payment" && <button onClick={pay} disabled={busy || checking || payment?.status === "PENDING"} className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-[15px] bg-[#FFB400] font-extrabold disabled:opacity-50">{busy && <LoaderCircle size={17} className="animate-spin"/>}{busy ? "Opening checkout…" : "Pay securely"}</button>}
        {hasOrder && <button onClick={() => refresh(true)} disabled={checking || busy} className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-[15px] border border-[#EBDCA9] text-xs font-bold disabled:opacity-50"><RefreshCw size={14} className={checking ? "animate-spin" : ""}/>Check payment status</button>}
        {canCancel && (confirmCancel ? <div className="mt-4 rounded-[15px] border border-[#F0D9D5] bg-[#FFF7F5] p-4"><p className="text-xs font-extrabold text-[#7C342D]">Cancel this booking?</p><p className="mt-1 text-[11px] leading-5 text-[#8C625B]">This cancels the booking and payment access. If a payment completes at the same time, it will be refunded.</p><div className="mt-3 flex gap-2"><button type="button" onClick={() => setConfirmCancel(false)} disabled={cancelling} className="h-10 flex-1 rounded-xl border border-[#E7D9D6] bg-white text-xs font-bold">Keep booking</button><button type="button" onClick={cancelBooking} disabled={cancelling} className="h-10 flex-1 rounded-xl bg-[#B83E32] text-xs font-extrabold text-white disabled:opacity-50">{cancelling ? "Cancelling…" : "Confirm cancel"}</button></div></div> : <button type="button" onClick={() => setConfirmCancel(true)} className="mt-4 h-10 w-full rounded-[13px] border border-[#E7D9D6] bg-white text-xs font-bold text-[#8D4B43]">Cancel booking</button>)}
      </>}
      <p className="mt-4 flex items-center gap-2 text-[10px] text-zinc-500"><ShieldCheck size={14}/> Payments processed securely by Razorpay</p>
    </section>}
  </div></main>;
}
