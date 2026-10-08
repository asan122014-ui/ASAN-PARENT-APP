import { useState } from "react";

import {
  ArrowRight,
  CalendarDays,
  User,
  IndianRupee,
  ReceiptText,
  Clock,
  AlertCircle,
  CheckCircle2,
  CreditCard,
  Loader2,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import {
  motion,
} from "framer-motion";

import { createInvoicePaymentOrder, verifyInvoicePayment } from "../../api/invoiceApi";

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

/* =========================================================
   INVOICE CARD
========================================================= */

const InvoiceCard = ({
  invoice,
  onPaymentVerified,
}) => {
  const navigate =
    useNavigate();
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

  /* =======================================================
     FORMAT DATE
  ======================================================= */

  const formatDate =
    (
      date
    ) => {
      if (
        !date
      ) {
        return "--";
      }

      const value =
        new Date(
          date
        );

      if (
        Number.isNaN(
          value.getTime()
        )
      ) {
        return "--";
      }

      return value.toLocaleDateString(
        "en-IN",
        {
          day:
            "2-digit",

          month:
            "short",

          year:
            "numeric",
        }
      );
    };

  /* =======================================================
     CHILD
  ======================================================= */

  const childName =
    invoice?.childId
      ?.name ||
    invoice?.childName ||
    "Student";

  /* =======================================================
     STATUS
  ======================================================= */

  const getStatusConfig =
    (
      status
    ) => {
      const normalized =
        String(
          status ||
            "Pending"
        )
          .trim()
          .toLowerCase();

      /* ===================================================
         PAID
      =================================================== */

      if (
        normalized ===
        "paid"
      ) {
        return {
          label:
            "Paid",

          icon:
            CheckCircle2,

          badge:
            "bg-green-50 text-green-700 border-green-100",

          dot:
            "bg-green-500",

          amountPanel:
            "bg-[#F7FFF8] border-green-100",

          amountIcon:
            "bg-green-50 border-green-100 text-green-600",

          amountAccent:
            "bg-green-100",

          labelColor:
            "text-green-700",
        };
      }

      /* ===================================================
         OVERDUE
      =================================================== */

      if (
        normalized ===
        "overdue"
      ) {
        return {
          label:
            "Overdue",

          icon:
            AlertCircle,

          badge:
            "bg-red-50 text-red-600 border-red-100",

          dot:
            "bg-red-500",

          amountPanel:
            "bg-red-50 border-red-100",

          amountIcon:
            "bg-white border-red-100 text-red-500",

          amountAccent:
            "bg-red-100",

          labelColor:
            "text-red-500",
        };
      }

      /* ===================================================
         PENDING
      =================================================== */

      return {
        label:
          "Pending",

        icon:
          Clock,

        badge:
          "bg-[#FFF0B8] text-[#946400] border-[#E8CD70]",

        dot:
          "bg-[#FFB400]",

        amountPanel:
          "bg-[#FFF8DE] border-[#E9CB69]",

        amountIcon:
          "bg-white border-[#E7CD73] text-[#B67C00]",

        amountAccent:
          "bg-[#FFE694]",

        labelColor:
          "text-[#9A6900]",
      };
    };

  const status =
    getStatusConfig(
      invoice?.status
    );

  const StatusIcon =
    status.icon;

  /* =======================================================
     AMOUNT
  ======================================================= */

  const formattedAmount =
    Number(
      invoice?.totalAmount ||
        0
    ).toLocaleString(
      "en-IN",
      {
        minimumFractionDigits:
          2,

        maximumFractionDigits:
          2,
      }
    );

  /* =======================================================
     OPEN INVOICE
  ======================================================= */

  const openInvoice =
    () => {
      if (
        !invoice?._id
      ) {
        return;
      }

      navigate(
        `/invoice/${invoice._id}`
      );
    };

  const canPayInvoice = Boolean(invoice?._id) && !["paid", "cancelled", "processing"].includes(String(invoice?.status || "").toLowerCase()) && String(invoice?.paymentStatus || "Pending").toLowerCase() !== "success";

  /* =======================================================
     UI
  ======================================================= */

  return (
    <motion.article
      initial={{
        opacity:
          0,

        y:
          10,
      }}
      animate={{
        opacity:
          1,

        y:
          0,
      }}
      whileHover={{
        y:
          -2,
      }}
      transition={{
        duration:
          0.3,
      }}
      className="
        relative
        overflow-hidden
        rounded-[24px]
        border
        border-[#EEDB99]
        bg-white
        shadow-[0_9px_26px_rgba(79,61,12,0.05)]
      "
    >
      {/* =================================================
          TOP ACCENT
      ================================================= */}

      <div
        className="
          absolute
          left-0
          right-0
          top-0
          h-[4px]
          bg-[#FFB400]
        "
      />

      {/* =================================================
          BACKGROUND
      ================================================= */}

      <div
        className="
          pointer-events-none
          absolute
          -right-[60px]
          -top-[60px]
          h-[150px]
          w-[150px]
          rounded-full
          bg-[#FFF0B8]
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          right-[35px]
          top-[75px]
          h-[62px]
          w-[62px]
          rounded-full
          border-[12px]
          border-[#FFF2C2]
        "
      />

      {/* =================================================
          HEADER
      ================================================= */}

      <div
        className="
          relative
          z-10
          flex
          items-center
          justify-between
          gap-3
          px-4
          pb-3
          pt-5
        "
      >
        <div
          className="
            flex
            min-w-0
            items-center
            gap-3
          "
        >
          {/* =================================================
              RECEIPT ICON
          ================================================= */}

          <motion.div
            whileHover={{
              rotate:
                4,

              scale:
                1.04,
            }}
            className="
              flex
              h-[46px]
              w-[46px]
              shrink-0
              items-center
              justify-center
              rounded-[15px]
              border
              border-[#EBD384]
              bg-[#FFF3C8]
              text-[#B97E00]
            "
          >
            <ReceiptText
              size={
                20
              }
            />
          </motion.div>

          <div
            className="
              min-w-0
            "
          >
            <p
              className="
                text-[8px]
                font-extrabold
                uppercase
                tracking-[1.5px]
                text-[#B77D00]
              "
            >
              Invoice
            </p>

            <h3
              className="
                mt-[2px]
                truncate
                text-[15px]
                font-extrabold
                text-black
              "
            >
              {invoice?.month ||
                "N/A"}
            </h3>
          </div>
        </div>

        {/* =================================================
            STATUS
        ================================================= */}

        <motion.div
          key={
            status.label
          }
          initial={{
            scale:
              0.9,

            opacity:
              0,
          }}
          animate={{
            scale:
              1,

            opacity:
              1,
          }}
          className={`
            flex
            shrink-0
            items-center
            gap-1.5
            rounded-full
            border
            px-2.5
            py-1.5

            ${status.badge}
          `}
        >
          <span
            className={`
              h-[6px]
              w-[6px]
              rounded-full

              ${status.dot}
            `}
          />

          <StatusIcon
            size={
              11
            }
          />

          <span
            className="
              text-[7px]
              font-extrabold
              uppercase
              tracking-[0.5px]
            "
          >
            {
              status.label
            }
          </span>
        </motion.div>
      </div>

      {/* =================================================
          BODY
      ================================================= */}

      <div
        className="
          relative
          z-10
          px-4
          pb-4
        "
      >
        {/* =================================================
            STUDENT
        ================================================= */}

        <div
          className="
            flex
            items-center
            gap-3
            border-t
            border-[#F0E6C8]
            py-3
          "
        >
          <div
            className="
              flex
              h-[42px]
              w-[42px]
              shrink-0
              items-center
              justify-center
              rounded-[14px]
              border
              border-[#EED58B]
              bg-[#FFF3C8]
              text-[#B77D00]
            "
          >
            <User
              size={
                18
              }
            />
          </div>

          <div
            className="
              min-w-0
            "
          >
            <p
              className="
                text-[8px]
                font-bold
                uppercase
                tracking-[1.2px]
                text-zinc-400
              "
            >
              Student
            </p>

            <p
              className="
                mt-[2px]
                truncate
                text-[12px]
                font-bold
                text-black
              "
            >
              {
                childName
              }
            </p>
          </div>
        </div>

        {/* =================================================
            AMOUNT
        ================================================= */}

        <div
          className={`
            relative
            overflow-hidden
            rounded-[18px]
            border
            px-4
            py-4

            ${status.amountPanel}
          `}
        >
          {/* =================================================
              DECORATION
          ================================================= */}

          <div
            className={`
              absolute
              -right-7
              -top-8
              h-[90px]
              w-[90px]
              rounded-full

              ${status.amountAccent}
            `}
          />

          <div
            className="
              relative
              z-10
              flex
              items-end
              justify-between
              gap-3
            "
          >
            <div>
              {/* =================================================
                  LABEL
              ================================================= */}

              <div
                className="
                  flex
                  items-center
                  gap-1.5
                "
              >
                <IndianRupee
                  size={
                    13
                  }
                  className={
                    status.labelColor
                  }
                />

                <p
                  className={`
                    text-[8px]
                    font-bold
                    uppercase
                    tracking-[1.3px]

                    ${status.labelColor}
                  `}
                >
                  Total Amount
                </p>
              </div>

              {/* =================================================
                  VALUE
              ================================================= */}

              <p
                className="
                  mt-2
                  text-[24px]
                  font-extrabold
                  leading-none
                  tracking-[-0.4px]
                  text-black
                "
              >
                ₹
                {
                  formattedAmount
                }
              </p>

              <p
                className="
                  mt-2
                  text-[8px]
                  font-medium
                  text-zinc-500
                "
              >
                Monthly school
                transport charge
              </p>
            </div>

            {/* =================================================
                RUPEE ICON
            ================================================= */}

            <motion.div
              whileHover={{
                scale:
                  1.08,

                rotate:
                  4,
              }}
              className={`
                flex
                h-[40px]
                w-[40px]
                shrink-0
                items-center
                justify-center
                rounded-[12px]
                border

                ${status.amountIcon}
              `}
            >
              <IndianRupee
                size={
                  18
                }
                strokeWidth={
                  2.4
                }
              />
            </motion.div>
          </div>
        </div>

        {/* =================================================
            DUE DATE
        ================================================= */}

        <div
          className="
            flex
            items-center
            justify-between
            gap-3
            py-3
          "
        >
          <div
            className="
              flex
              items-center
              gap-2
            "
          >
            <div
              className="
                flex
                h-[34px]
                w-[34px]
                items-center
                justify-center
                rounded-[11px]
                border
                border-[#EED58B]
                bg-[#FFF3C8]
                text-[#C48700]
              "
            >
              <CalendarDays
                size={
                  15
                }
              />
            </div>

            <div>
              <p
                className="
                  text-[8px]
                  font-bold
                  uppercase
                  tracking-[1px]
                  text-zinc-400
                "
              >
                Due Date
              </p>

              <p
                className="
                  mt-[1px]
                  text-[10px]
                  font-bold
                  text-black
                "
              >
                {formatDate(
                  invoice?.dueDate
                )}
              </p>
            </div>
          </div>

          {/* =================================================
              STATUS MINI INDICATOR
          ================================================= */}

          <div
            className="
              flex
              items-center
              gap-2
            "
          >
            <span
              className={`
                h-[7px]
                w-[7px]
                rounded-full

                ${status.dot}
              `}
            />

            <span
              className={`
                text-[8px]
                font-bold

                ${status.labelColor}
              `}
            >
              {
                status.label
              }
            </span>
          </div>
        </div>

        {canPayInvoice && (
          <div className="mb-2">
            <motion.button type="button" onClick={payInvoice} disabled={paying} whileTap={{ scale: 0.98 }} className="flex h-[49px] w-full items-center justify-center gap-2 rounded-[15px] bg-black px-4 text-[11px] font-extrabold text-white shadow-[0_7px_18px_rgba(0,0,0,0.12)] transition hover:bg-zinc-800 disabled:cursor-wait disabled:opacity-60">
              {paying ? <Loader2 size={15} className="animate-spin"/> : <CreditCard size={15}/>}
              {paying ? "Opening secure checkout…" : `Pay ₹${formattedAmount} securely`}
            </motion.button>
            {paymentError && <p role="alert" className="mt-2 rounded-xl bg-red-50 px-3 py-2 text-[10px] leading-4 text-red-700">{paymentError}</p>}
          </div>
        )}

        {/* =================================================
            VIEW DETAILS
        ================================================= */}

        <motion.button
          type="button"
          onClick={
            openInvoice
          }
          disabled={
            !invoice?._id
          }
          whileTap={{
            scale:
              0.98,
          }}
          className="
            group
            flex
            h-[49px]
            w-full
            items-center
            justify-between
            rounded-[15px]
            bg-[#FFB400]
            px-4
            text-[11px]
            font-extrabold
            text-black
            shadow-[0_7px_18px_rgba(255,180,0,0.17)]
            transition
            hover:bg-[#F5AA00]
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          <div
            className="
              flex
              items-center
              gap-2
            "
          >
            <ReceiptText
              size={
                15
              }
            />

            View Invoice Details
          </div>

          <motion.div
            whileHover={{
              x:
                3,
            }}
            className="
              flex
              h-[29px]
              w-[29px]
              items-center
              justify-center
              rounded-[9px]
              border
              border-[#E6CB70]
              bg-[#FFF5D5]
              text-[#9B6A00]
            "
          >
            <ArrowRight
              size={
                14
              }
            />
          </motion.div>
        </motion.button>
      </div>
    </motion.article>
  );
};

export default InvoiceCard;
