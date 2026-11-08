import { useState } from 'react';
import { createInvoicePaymentOrder, verifyInvoicePayment } from '../api/invoiceApi';

const loadRazorpay = () => {
  if (window.Razorpay) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-razorpay-checkout="true"]');
    if (existing) {
      existing.addEventListener("load", resolve, { once: true });
      existing.addEventListener("error", () => reject(new Error("Unable to load Razorpay checkout.")), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.dataset.razorpayCheckout = "true";
    script.onload = () => window.Razorpay ? resolve() : reject(new Error("Unable to initialize Razorpay checkout."));
    script.onerror = () => reject(new Error("Unable to load Razorpay checkout."));
    document.body.appendChild(script);
  });
};


export default function useInvoicePayment(invoice, onPaymentVerified) {
  const [paying, setPaying] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  const payInvoice = async () => {
    if (!invoice?._id || paying) return;
    setPaying(true);
    setPaymentError("");
    try {
      await loadRazorpay();
      const order = await createInvoicePaymentOrder(invoice._id);
      if (order?.paid) {
        await onPaymentVerified?.();
        setPaying(false);
        return;
      }
      if (!order?.order_id || !order?.keyId || !Number.isSafeInteger(Number(order.amount)) || order.amount < 100) throw new Error("The invoice payment order is incomplete.");
      const checkout = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency || "INR",
        order_id: order.order_id,
        name: "ASAN RIDES",
        description: `Invoice ${invoice.invoiceNumber || String(invoice._id).slice(-8).toUpperCase()}`,
        handler: async (result) => {
          try {
            const verified = await verifyInvoicePayment(invoice._id, result);
            if (!verified?.paid) throw new Error("Payment is awaiting confirmation. Refresh billing in a moment.");
            await onPaymentVerified?.();
          } catch (error) {
            setPaymentError(error?.response?.data?.message || error.message || "Payment verification failed. Please refresh billing.");
          } finally {
            setPaying(false);
          }
        },
        modal: { ondismiss: () => setPaying(false) },
        theme: { color: "#FFB400" },
      });
      checkout.on("payment.failed", (event) => {
        setPaymentError(event?.error?.description || "Payment failed. You can try again.");
        setPaying(false);
      });
      checkout.open();
    } catch (error) {
      setPaymentError(error?.response?.data?.message || error.message || "Unable to start payment. Please try again.");
      setPaying(false);
    }
  };

  return { paying, paymentError, payInvoice };
}
