import test from 'node:test';
import assert from 'node:assert/strict';
import { createPaidRideInvoicePdf } from './paidRideInvoice.js';
const booking = { _id: '1234567890abcdef', child: { name: 'Student', school: 'School' }, quote: { totalMonthly: 500 } };
test('coupon invoice records zero collected and never claims a Razorpay payment', async () => {
  const { blob, fileName } = createPaidRideInvoicePdf({ ...booking, couponAppliedAt: '2026-11-10', couponCode: 'Asanrides0' });
  const pdf = await blob.text();
  assert.match(fileName, /\.pdf$/); assert.match(pdf, /^%PDF/);
  assert.match(pdf, /COUPON APPLIED - NO PAYMENT COLLECTED/);
  assert.match(pdf, /Asanrides0/); assert.match(pdf, /INR 0.00/);
  assert.doesNotMatch(pdf, /VERIFIED BY RAZORPAY|Payment verified with Razorpay/);
});
test('normal paid invoice retains its actual payment amount and reference', async () => {
  const { blob } = createPaidRideInvoicePdf({ ...booking, paymentId: { paymentId: 'pay_actual', amount: 450, paidAt: '2026-11-10' } });
  const pdf = await blob.text();
  assert.match(pdf, /PAID - VERIFIED BY RAZORPAY/); assert.match(pdf, /pay_actual/); assert.match(pdf, /INR 450.00/);
});
