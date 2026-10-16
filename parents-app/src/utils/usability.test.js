import test from "node:test";
import assert from "node:assert/strict";
import { bookingStatus } from "./bookingStatus.js";
import { paymentPresentation } from "./paymentPresentation.js";
import { notificationDestination } from "./notificationDestination.js";

test("booking stages tell parents the correct next action", () => {
  assert.equal(bookingStatus({ status: "driver_searching" }).title, "Waiting for admin");
  assert.equal(bookingStatus({ status: "driver_searching", driverRequestId: { matchingStatus: "Offered" } }).title, "Waiting for driver");
  assert.equal(bookingStatus({ status: "awaiting_payment" }).title, "Ready for payment");
  assert.equal(bookingStatus({ status: "active", driverRequestId: { matchingStatus: "Exhausted" } }).title, "Service active");
});
test("payment processing takes precedence over checkout dismissal", () => {
  assert.equal(paymentPresentation({ status: "PENDING" }, "closed").blocked, true);
  assert.equal(paymentPresentation({ status: "ACTIVE" }, "closed").title, "Checkout closed");
  assert.equal(paymentPresentation({ status: "FAILED" }).blocked, false);
  assert.equal(paymentPresentation({ status: "PAID" }).blocked, true);
});
test("notification taps resolve only known internal destinations", () => {
  const bookingId = "6ad0c84ded260915864c75c5";
  assert.equal(notificationDestination({ notification: { data: { bookingId } } }), `/booking-payment/${bookingId}`);
  assert.equal(notificationDestination({ meta: { invoiceId: bookingId } }), `/invoice/${bookingId}`);
  assert.equal(notificationDestination({ data: { bookingId: "https://evil.test" } }), "/app?tab=notifications");
  assert.equal(notificationDestination({ type: "trip_started" }), "/app?tab=tracking");
  assert.equal(notificationDestination({ type: "general", meta: { requestId: "request" } }, "driver"), "/dashboard");
  assert.equal(notificationDestination({ type: "payment_received" }, "driver"), "/trips");
});
