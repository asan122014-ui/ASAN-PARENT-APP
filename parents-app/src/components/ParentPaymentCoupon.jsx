import { useEffect, useState } from "react";
import { API } from "../api/api";
export default function ParentPaymentCoupon({ endpoint, onApplied, disabled = false }) {
  const [allowed, setAllowed] = useState(false);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => { let active = true; API.get("/booking-payments/coupon-access").then((response) => { if (active) setAllowed(Boolean(response.data?.data?.allowed)); }).catch(() => {}); return () => { active = false; }; }, []);
  if (!allowed) return null;
  const apply = async () => {
    setBusy(true); setError("");
    try { await API.post(endpoint, { code: code.trim() }); await onApplied?.(); }
    catch (err) { setError(err.response?.data?.message || "Unable to apply coupon. Please retry."); }
    finally { setBusy(false); }
  };
  return <div className="mt-4 rounded-xl border border-[#EBDCA9] bg-[#FFF9EE] p-3">
    <label className="mb-2 block text-sm font-bold">Payment coupon<input aria-label="Payment coupon" placeholder="Enter coupon code" value={code} onChange={(event) => setCode(event.target.value)} disabled={disabled || busy} className="mt-2 w-full rounded-xl border border-[#EBDCA9] bg-white px-3 py-2 text-base" /></label>
    <button type="button" onClick={apply} disabled={disabled || busy || !code.trim()} className="rounded-xl bg-[#FFB400] px-4 py-2 text-sm font-bold disabled:opacity-50">{busy ? "Applying…" : "Apply coupon"}</button>
    <p className="mt-2 text-xs text-zinc-600">Available until 15 November 2026, 11:59 PM India time.</p>
    {error && <p role="alert" className="mt-2 text-sm text-red-700">{error}</p>}
  </div>;
}
