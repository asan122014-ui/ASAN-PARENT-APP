import {
  ReceiptText,
  IndianRupee,
  CheckCircle2,
  Clock3,
  WalletCards,
} from "lucide-react";

import {
  motion,
} from "framer-motion";

/* =========================================================
   SUMMARY CARD
========================================================= */

const SummaryCard = ({
  invoices = [],
  className = "",
}) => {
  /* =======================================================
     CALCULATIONS
  ======================================================= */

  const totalInvoices =
    invoices.length;

  const paidInvoices =
    invoices.filter(
      (
        invoice
      ) =>
        invoice.status ===
        "Paid"
    );

  const pendingInvoices =
    invoices.filter(
      (
        invoice
      ) =>
        invoice.status ===
        "Pending"
    );

  const totalPaidAmount =
    paidInvoices.reduce(
      (
        sum,
        invoice
      ) =>
        sum +
        Number(
          invoice.totalAmount ||
            0
        ),

      0
    );

  const totalPendingAmount =
    pendingInvoices.reduce(
      (
        sum,
        invoice
      ) =>
        sum +
        Number(
          invoice.totalAmount ||
            0
        ),

      0
    );

  const totalAmount =
    invoices.reduce(
      (
        sum,
        invoice
      ) =>
        sum +
        Number(
          invoice.totalAmount ||
            0
        ),

      0
    );

  /* =======================================================
     FORMAT AMOUNT
  ======================================================= */

  const formatAmount =
    (
      amount
    ) => {
      return Number(
        amount ||
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
    };

  /* =======================================================
     CARDS
  ======================================================= */

  const cards = [
    {
      id:
        "invoice",

      title:
        "Invoices",

      value:
        totalInvoices,

      icon:
        ReceiptText,

      subText:
        `${totalInvoices} ${
          totalInvoices ===
          1
            ? "Invoice"
            : "Invoices"
        }`,

      variant:
        "light",
    },

    {
      id:
        "paid",

      title:
        "Paid",

      value:
        `₹${formatAmount(
          totalPaidAmount
        )}`,

      icon:
        CheckCircle2,

      subText:
        `${paidInvoices.length} Paid ${
          paidInvoices.length ===
          1
            ? "Invoice"
            : "Invoices"
        }`,

      variant:
        "paid",
    },

    {
      id:
        "pending",

      title:
        "Pending",

      value:
        `₹${formatAmount(
          totalPendingAmount
        )}`,

      icon:
        Clock3,

      subText:
        `${pendingInvoices.length} Pending ${
          pendingInvoices.length ===
          1
            ? "Invoice"
            : "Invoices"
        }`,

      variant:
        "pending",
    },

    {
      id:
        "total",

      title:
        "Total Amount",

      value:
        `₹${formatAmount(
          totalAmount
        )}`,

      icon:
        WalletCards,

      subText:
        "Overall Billing",

      variant:
        "total",
    },
  ];

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div
      className={`
        grid
        grid-cols-2
        gap-2.5
        ${className}
      `}
    >
      {cards.map(
        (
          card,
          index
        ) => {
          const Icon =
            card.icon;

          const styles =
            getCardStyles(
              card.variant
            );

          return (
            <motion.div
              key={
                card.id
              }
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
              transition={{
                duration:
                  0.3,

                delay:
                  index *
                  0.05,
              }}
              whileHover={{
                y:
                  -2,
              }}
              whileTap={{
                scale:
                  0.985,
              }}
              className={`
                relative
                min-h-[145px]
                cursor-default
                overflow-hidden
                rounded-[22px]
                border
                p-4
                shadow-[0_7px_20px_rgba(79,61,12,0.045)]

                ${styles.card}
              `}
            >
              {/* =================================================
                  DECORATION
              ================================================= */}

              <div
                className={`
                  pointer-events-none
                  absolute
                  -right-[28px]
                  -top-[34px]
                  h-[90px]
                  w-[90px]
                  rounded-full

                  ${styles.circle}
                `}
              />

              {/* =================================================
                  TOP ROW
              ================================================= */}

              <div
                className="
                  relative
                  z-10
                  flex
                  items-start
                  justify-between
                  gap-2
                "
              >
                <div>
                  <p
                    className={`
                      text-[8px]
                      font-extrabold
                      uppercase
                      tracking-[1.3px]

                      ${styles.label}
                    `}
                  >
                    {
                      card.title
                    }
                  </p>
                </div>

                {/* =================================================
                    ICON
                ================================================= */}

                <motion.div
                  whileHover={{
                    rotate:
                      5,

                    scale:
                      1.05,
                  }}
                  className={`
                    flex
                    h-[38px]
                    w-[38px]
                    shrink-0
                    items-center
                    justify-center
                    rounded-[12px]
                    border

                    ${styles.icon}
                  `}
                >
                  <Icon
                    size={
                      17
                    }
                    strokeWidth={
                      2
                    }
                  />
                </motion.div>
              </div>

              {/* =================================================
                  VALUE
              ================================================= */}

              <div
                className="
                  relative
                  z-10
                  mt-4
                "
              >
                <motion.h2
                  key={
                    card.value
                  }
                  initial={{
                    opacity:
                      0.7,

                    scale:
                      0.98,
                  }}
                  animate={{
                    opacity:
                      1,

                    scale:
                      1,
                  }}
                  className={`
                    break-words
                    text-[18px]
                    font-extrabold
                    leading-tight
                    tracking-[-0.35px]
                    sm:text-[20px]

                    ${styles.value}
                  `}
                >
                  {
                    card.value
                  }
                </motion.h2>

                <p
                  className={`
                    mt-1
                    text-[8px]
                    font-medium

                    ${styles.subText}
                  `}
                >
                  {
                    card.subText
                  }
                </p>
              </div>

              {/* =================================================
                  INVOICE PROGRESS
              ================================================= */}

              {card.id ===
                "invoice" &&
                totalInvoices >
                  0 && (
                  <div
                    className="
                      relative
                      z-10
                      mt-4
                    "
                  >
                    <div
                      className={`
                        h-[4px]
                        w-full
                        overflow-hidden
                        rounded-full

                        ${styles.track}
                      `}
                    >
                      <motion.div
                        initial={{
                          width:
                            0,
                        }}
                        animate={{
                          width:
                            `${Math.min(
                              (
                                totalInvoices /
                                20
                              ) *
                                100,

                              100
                            )}%`,
                        }}
                        transition={{
                          duration:
                            0.7,

                          delay:
                            0.15,
                        }}
                        className={`
                          h-full
                          rounded-full

                          ${styles.progress}
                        `}
                      />
                    </div>
                  </div>
                )}

              {/* =================================================
                  PAID INDICATOR
              ================================================= */}

              {card.id ===
                "paid" && (
                <div
                  className="
                    absolute
                    bottom-4
                    right-4
                    flex
                    items-center
                    gap-1
                  "
                >
                  <div
                    className="
                      h-[7px]
                      w-[7px]
                      rounded-full
                      bg-green-500
                    "
                  />

                  <span
                    className="
                      text-[7px]
                      font-bold
                      text-green-600
                    "
                  >
                    CLEARED
                  </span>
                </div>
              )}

              {/* =================================================
                  PENDING INDICATOR
              ================================================= */}

              {card.id ===
                "pending" && (
                <div
                  className="
                    absolute
                    bottom-4
                    right-4
                    flex
                    items-center
                    gap-1
                  "
                >
                  <motion.div
                    animate={{
                      scale: [
                        1,
                        1.35,
                        1,
                      ],

                      opacity: [
                        1,
                        0.55,
                        1,
                      ],
                    }}
                    transition={{
                      duration:
                        1.5,

                      repeat:
                        Infinity,
                    }}
                    className="
                      h-[7px]
                      w-[7px]
                      rounded-full
                      bg-[#FFB400]
                    "
                  />

                  <span
                    className="
                      text-[7px]
                      font-bold
                      text-[#A36F00]
                    "
                  >
                    DUE
                  </span>
                </div>
              )}

              {/* =================================================
                  TOTAL ACCENT
              ================================================= */}

              {card.id ===
                "total" && (
                <div
                  className="
                    absolute
                    bottom-4
                    right-4
                    flex
                    h-[26px]
                    w-[26px]
                    items-center
                    justify-center
                    rounded-[9px]
                    bg-[#FFF3C8]
                    text-[#B67D00]
                  "
                >
                  <IndianRupee
                    size={
                      13
                    }
                  />
                </div>
              )}
            </motion.div>
          );
        }
      )}
    </div>
  );
};

/* =========================================================
   CARD STYLES
========================================================= */

function getCardStyles(
  variant
) {
  const variants = {
    /* =====================================================
       INVOICES
    ===================================================== */

    light: {
      card:
        "bg-white border-[#EEDB99]",

      label:
        "text-[#B47E00]",

      value:
        "text-black",

      subText:
        "text-zinc-400",

      icon:
        "bg-[#FFF3C8] text-black border-[#E9D18A]",

      circle:
        "bg-[#FFF0B8]",

      track:
        "bg-[#F0E7D2]",

      progress:
        "bg-[#FFB400]",
    },

    /* =====================================================
       PAID
    ===================================================== */

    paid: {
      card:
        "bg-[#F7FFF8] border-green-100",

      label:
        "text-green-700",

      value:
        "text-black",

      subText:
        "text-zinc-500",

      icon:
        "bg-green-50 text-green-600 border-green-100",

      circle:
        "bg-green-50",

      track:
        "bg-green-100",

      progress:
        "bg-green-500",
    },

    /* =====================================================
       PENDING
    ===================================================== */

    pending: {
      card:
        "bg-[#FFF8DE] border-[#EACA67]",

      label:
        "text-[#9B6A00]",

      value:
        "text-black",

      subText:
        "text-[#A57A20]",

      icon:
        "bg-white text-black border-[#E6CC73]",

      circle:
        "bg-[#FFE69A]",

      track:
        "bg-[#EEDB9B]",

      progress:
        "bg-[#FFB400]",
    },

    /* =====================================================
       TOTAL
    ===================================================== */

    total: {
      card:
        "bg-[#FFFDF7] border-[#EEDB99]",

      label:
        "text-[#B47E00]",

      value:
        "text-black",

      subText:
        "text-zinc-500",

      icon:
        "bg-[#FFF3C8] text-black border-[#E9D18A]",

      circle:
        "bg-[#FFF3C8]",

      track:
        "bg-[#F0E7D2]",

      progress:
        "bg-[#FFB400]",
    },
  };

  return (
    variants[
      variant
    ] ||
    variants.light
  );
}

export default SummaryCard;