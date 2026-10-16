export function paymentPresentation(payment, checkoutState = "") {
  if (payment?.status === "PENDING") return { title: "Payment processing", detail: "Your bank is still processing this payment. Check its status before paying again.", blocked: true };
  if (payment?.status === "PAID") return { title: "Payment confirmed", detail: "Your payment is confirmed.", blocked: true };
  if (payment?.status === "REFUNDING" || payment?.status === "REFUND_FAILED") return { title: "Refund needs attention", detail: "Check payment status before making another payment.", blocked: true };
  if (checkoutState === "closed") return { title: "Checkout closed", detail: "No payment has been confirmed here. Check payment status, retry checkout, or apply an eligible coupon.", blocked: false };
  if (checkoutState === "failed" || payment?.status === "FAILED") return { title: "Payment failed", detail: "Check payment status before retrying. You can also apply an eligible coupon.", blocked: false };
  if (payment) return { title: "Payment not confirmed", detail: "Check payment status if you attempted payment. An unpaid checkout can be retried or replaced with an eligible coupon.", blocked: false };
  return null;
}
