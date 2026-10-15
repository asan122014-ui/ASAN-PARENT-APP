const text = (value) => typeof value === "string" ? value : "";
const point = (value) => value && Number.isFinite(value.lat) && Number.isFinite(value.lng)
  && Math.abs(value.lat) <= 90 && Math.abs(value.lng) <= 180 ? { lat: value.lat, lng: value.lng } : null;

export function previousBookingDetails(bookings) {
  if (!Array.isArray(bookings)) return null;
  const latest = [...bookings].filter((item) => item?.route && (item.children?.length || item.child?.name))
    .sort((a, b) => (Date.parse(b.createdAt) || 0) - (Date.parse(a.createdAt) || 0))[0];
  if (!latest) return null;
  const children = (latest.children?.length ? latest.children : [latest.child]).map((child) => ({
    name: text(child.name), age: child.age ?? "", school: text(child.school), grade: text(child.grade),
    gender: text(child.gender), section: text(child.section),
  }));
  return {
    children, school: children[0].school,
    route: {
      pickup: text(latest.route.pickup), dropoff: text(latest.route.dropoff),
      pickupCoordinates: point(latest.route.pickupCoordinates), dropoffCoordinates: point(latest.route.dropoffCoordinates),
      pickupTime: text(latest.route.pickupTime), schoolPickupTime: text(latest.route.schoolPickupTime),
      // Never reuse a previous estimate, price, payment or booking identifier.
      distanceMeters: null, distanceKm: "", durationMinutes: "",
    },
    vehicleType: latest.quote?.vehicleType === "VAN" ? "VAN" : "AUTO",
    driverChoice: latest.driverChoice === "existing" ? "existing" : "new",
    driverId: text(latest.assignedDriverId || latest.requestedDriverId).trim().toUpperCase(),
  };
}
