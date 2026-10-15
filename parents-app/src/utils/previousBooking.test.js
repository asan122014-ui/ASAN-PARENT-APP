import test from "node:test";
import assert from "node:assert/strict";
import { previousBookingDetails } from "./previousBooking.js";

const booking = { createdAt: "2026-10-15", children: [{ name: "Child A", age: 12, school: "School", grade: "5" }], route: { pickup: "Home", dropoff: "School", pickupCoordinates: { lat: 17, lng: 78 }, dropoffCoordinates: { lat: 18, lng: 78 }, pickupTime: "07:50", schoolPickupTime: "15:10", distanceKm: 15 }, quote: { vehicleType: "VAN", totalMonthly: 1000 }, driverChoice: "existing", requestedDriverId: "ASAN-TEST", startDate: "2026-10-01", paymentId: "old-payment" };
test("restores editable previous details without financial state or old dates", () => {
  const result = previousBookingDetails([booking]);
  assert.equal(result.children[0].name, "Child A");
  assert.equal(result.vehicleType, "VAN");
  assert.equal(result.driverId, "ASAN-TEST");
  assert.deepEqual(result.route.pickupCoordinates, { lat: 17, lng: 78 });
  assert.equal(result.route.distanceMeters, null);
  for (const key of ["quote", "paymentId", "startDate", "status", "_id"]) assert.equal(key in result, false);
  result.children[0].name = "Changed";
  assert.equal(booking.children[0].name, "Child A");
});
test("chooses newest booking and supports legacy single-child snapshots", () => {
  const result = previousBookingDetails([booking, { ...booking, createdAt: "2026-10-16", children: [], child: { name: "Child B", school: "Other school" } }]);
  assert.equal(result.children[0].name, "Child B");
});
test("new accounts remain blank and invalid coordinates are not reused", () => {
  assert.equal(previousBookingDetails([]), null);
  assert.equal(previousBookingDetails(null), null);
  assert.equal(previousBookingDetails([{ ...booking, route: { pickupCoordinates: { lat: 999, lng: 78 } } }]).route.pickupCoordinates, null);
});
