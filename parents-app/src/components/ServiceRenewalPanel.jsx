import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API } from '../api/api';

export default function ServiceRenewalPanel({ booking, onChange }) {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [confirmEnd, setConfirmEnd] = useState(false);
  const [savedChoice, setSavedChoice] = useState(null);
  if (!['active', 'expired'].includes(booking.status) || !(booking.paidAt || booking.couponAppliedAt || ['PAID', 'WAIVED'].includes(booking.paymentId?.status))) return null;
  const ended = booking.status === 'expired' || (booking.serviceEndsAt && new Date(booking.serviceEndsAt) <= new Date());
  const choice = savedChoice ?? booking.renewalDecision;
  const endDate = booking.serviceEndsAt ? new Date(booking.serviceEndsAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'the service end date';
  const save = async (value) => {
    setBusy(true); setError('');
    try {
      await API.put(`/bookings/mine/${booking._id}/renewal-choice`, { choice: value });
      setSavedChoice(value); setConfirmEnd(false); onChange?.();
    } catch (err) { setError(err?.response?.data?.message || 'Could not save your choice. Please try again.'); }
    finally { setBusy(false); }
  };
  const continueRide = async () => {
    if (busy) return;
    setBusy(true); setError('');
    try {
      const response = await API.post(`/bookings/mine/${booking._id}/renew`);
      const nextId = response.data?.data?.booking?._id;
      if (!nextId) throw new Error('Missing renewal booking');
      navigate(`/booking-payment/${encodeURIComponent(nextId)}`);
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not continue your ride. Please retry.');
      setBusy(false);
    }
  };
  return <div className="mt-3 rounded-[15px] border border-[#EBDCA9] bg-[#FFF9EE] p-3 text-xs text-[#69532A]">
    <h4 className="font-extrabold text-black">{ended ? 'Continue your previous ride?' : 'Your monthly ride'}</h4>
    <p className="mt-1 leading-5">{ended ? `This service ended on ${endDate}. Your booking and payment details are kept below.` : `Your paid service continues until ${endDate}. Your receipts will stay available after it ends.`}</p>
    {choice === 'end' && <p role="status" className="mt-2 font-bold">You chose to end after this month. No renewal is scheduled.</p>}
    {choice === 'continue' && <p role="status" className="mt-2 font-bold">You chose to continue. Review and pay for the next booking when this service ends.</p>}
    {ended ? <button type="button" disabled={busy} onClick={continueRide} className="mt-3 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#FFB400] px-4 font-extrabold text-black disabled:opacity-50">{busy ? 'Preparing payment…' : 'Continue previous ride'}</button> : <button type="button" disabled={busy || choice === 'continue'} onClick={() => save('continue')} className="mt-3 min-h-11 rounded-xl bg-[#FFB400] px-4 font-extrabold text-black disabled:opacity-50">Continue next month</button>}
    {confirmEnd ? <div className="mt-3"><p className="leading-5">End after this paid month? This keeps your service until {endDate} and does not delete receipts or issue a refund.</p><div className="mt-2 flex flex-wrap gap-2"><button type="button" disabled={busy} onClick={() => save('end')} className="min-h-11 rounded-xl border border-[#EBDCA9] bg-white px-3 font-bold">{busy ? 'Saving…' : 'Confirm end after this month'}</button><button type="button" disabled={busy} onClick={() => setConfirmEnd(false)} className="min-h-11 px-3 font-bold">Go back</button></div></div>
      : <button type="button" disabled={busy} onClick={() => choice === 'end' || choice === 'continue' ? save('undecided') : setConfirmEnd(true)} className="mt-2 block min-h-11 rounded-xl border border-[#EBDCA9] bg-white px-3 font-bold disabled:opacity-50">{busy ? 'Saving…' : choice === 'end' || choice === 'continue' ? 'Change my choice' : 'End after this month'}</button>}
    <p className="mt-2 text-[10px] leading-4">Continue with your saved child details, route and previous driver. Review the price and complete payment to activate the next service period.</p>
    {error && <p role="alert" className="mt-2 text-red-700">{error}</p>}
  </div>;
}
