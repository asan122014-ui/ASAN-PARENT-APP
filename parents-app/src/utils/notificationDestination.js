const id = (value) => /^[a-f\d]{24}$/i.test(String(value || "")) ? String(value) : null;
export function notificationDestination(notification, role = "parent") {
  const source = notification?.notification || notification || {};
  const data = { ...(source.meta || {}), ...(source.data || {}) };
  const type = String(data.notificationKey || source.notificationKey || data.type || source.type || "").toLowerCase();
  if (role === "driver") {
    if (/booking|driver_request|driver_assigned/.test(type) || data.requestId) return "/dashboard";
    if (/trip_ended|trip_completed|trip_cancelled/.test(type)) return "/trips";
    if (/trip|pickup|drop|approach|arrived|emergency/.test(type)) return "/activetrip";
    if (/payment|invoice/.test(type)) return "/trips";
    return "/notifications";
  }
  if (id(data.invoiceId)) return `/invoice/${id(data.invoiceId)}`;
  if (id(data.bookingId)) return `/booking-payment/${id(data.bookingId)}`;
  if (/trip_ended|trip_completed|trip_cancelled/.test(type)) return "/app?tab=trips";
  if (/trip|pickup|drop|approach|arrived|emergency/.test(type)) return "/app?tab=tracking";
  return "/app?tab=notifications";
}
