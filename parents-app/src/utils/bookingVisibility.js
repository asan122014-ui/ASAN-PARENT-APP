const currentStatuses = new Set(['quoted', 'awaiting_driver', 'driver_searching', 'driver_accepted', 'awaiting_payment', 'active']);
export function isCurrentBooking(booking, now = Date.now()) {
  if (!currentStatuses.has(booking.status)) return false;
  return booking.status !== 'active' || !booking.serviceEndsAt || new Date(booking.serviceEndsAt).getTime() > now;
}
export function showRenewalPanel(booking, now = Date.now()) {
  if (!['active', 'expired'].includes(booking.status)) return false;
  const end = new Date(booking.serviceEndsAt).getTime();
  if (booking.status === 'expired' || (Number.isFinite(end) && end <= now)) return true;
  return Number.isFinite(end) && end > now && end - now <= 24 * 60 * 60 * 1000;
}
