import test from 'node:test';
import assert from 'node:assert/strict';
import { isCurrentBooking, showRenewalPanel } from './bookingVisibility.js';
const end = Date.parse('2026-12-10T12:00:00Z');
const booking = { status: 'active', serviceEndsAt: new Date(end).toISOString() };
test('Home hides expired, cancelled and time-ended services while keeping open requests', () => {
  assert.equal(isCurrentBooking(booking, end - 1), true);
  assert.equal(isCurrentBooking(booking, end), false);
  assert.equal(isCurrentBooking({ ...booking, status: 'expired' }, end - 1), false);
  assert.equal(isCurrentBooking({ ...booking, status: 'cancelled' }, end - 1), false);
  assert.equal(isCurrentBooking({ status: 'awaiting_payment' }, end), true);
});
test('active renewal prompt starts exactly 24 hours before expiry', () => {
  const day = 24 * 60 * 60 * 1000;
  assert.equal(showRenewalPanel(booking, end - day - 1), false);
  assert.equal(showRenewalPanel(booking, end - day), true);
  assert.equal(showRenewalPanel(booking, end - 1), true);
  assert.equal(showRenewalPanel({ status: 'awaiting_payment' }, end), false);
  assert.equal(showRenewalPanel({ status: 'active' }, end), false);
});
test('ended services still support renewal from payment history', () => {
  assert.equal(showRenewalPanel(booking, end), true);
  assert.equal(showRenewalPanel({ ...booking, status: 'expired' }, end + 1000), true);
});
