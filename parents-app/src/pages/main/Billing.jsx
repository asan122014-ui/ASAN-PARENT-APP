import {
  useEffect,
  useState,
} from "react";

import {
  ReceiptText,
  RefreshCw,
  CalendarDays,
  Clock3,
  IndianRupee,
  AlertTriangle,
  SlidersHorizontal,
  WalletCards,
} from "lucide-react";

import {
  motion,
} from "framer-motion";

import SummaryCard from "../../components/billing/SummaryCard";
import InvoiceCard from "../../components/billing/InvoiceCard";
import EmptyInvoice from "../../components/billing/EmptyInvoice";

import {
  getParentInvoices,
} from "../../api/invoiceApi";

/* =========================================================
   BILLING
========================================================= */

const Billing = () => {
  /* =======================================================
     STATE
  ======================================================= */

  const [
    invoices,
    setInvoices,
  ] =
    useState([]);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    refreshing,
    setRefreshing,
  ] =
    useState(false);

  const [
    filterStatus,
    setFilterStatus,
  ] =
    useState("All");

  const [
    error,
    setError,
  ] =
    useState("");

  /* =======================================================
     LOAD
  ======================================================= */

  useEffect(() => {
    fetchInvoices();
  }, []);

  /* =======================================================
     FETCH INVOICES
  ======================================================= */

  const fetchInvoices =
    async () => {
      try {
        setError(
          ""
        );

        const parent =
          JSON.parse(
            localStorage.getItem(
              "parent"
            )
          );

        if (
          !parent?._id
        ) {
          setInvoices(
            []
          );

          setError(
            "Parent details not found."
          );

          return;
        }

        const res =
          await getParentInvoices(
            parent._id
          );

        const data =
          Array.isArray(
            res?.data
          )
            ? res.data
            : Array.isArray(
                  res?.data
                    ?.data
                )
              ? res.data.data
              : [];

        const sorted =
          [
            ...data,
          ].sort(
            (
              a,
              b
            ) =>
              new Date(
                b.createdAt ||
                  0
              ) -
              new Date(
                a.createdAt ||
                  0
              )
          );

        setInvoices(
          sorted
        );
      } catch (
        err
      ) {
        console.error(
          "Billing error:",

          err?.response
            ?.data ||
            err
        );

        setInvoices(
          []
        );

        setError(
          err?.response
            ?.data
            ?.message ||
            "Unable to load billing information."
        );
      } finally {
        setLoading(
          false
        );

        setRefreshing(
          false
        );
      }
    };

  /* =======================================================
     REFRESH
  ======================================================= */

  const handleRefresh =
    async () => {
      if (
        refreshing
      ) {
        return;
      }

      setRefreshing(
        true
      );

      await fetchInvoices();
    };

  /* =======================================================
     FORMAT MONTH
  ======================================================= */

  const formatMonth =
    (
      month
    ) => {
      if (
        !month
      ) {
        return "--";
      }

      const [
        year,
        mon,
      ] =
        String(
          month
        ).split(
          "-"
        );

      if (
        !year ||
        !mon
      ) {
        return month;
      }

      return new Date(
        Number(
          year
        ),

        Number(
          mon
        ) - 1
      ).toLocaleString(
        "en-IN",
        {
          month:
            "long",

          year:
            "numeric",
        }
      );
    };

  /* =======================================================
     NORMALIZE STATUS
  ======================================================= */

  const normalizeStatus =
    (
      status
    ) => {
      const value =
        String(
          status ||
            ""
        )
          .trim()
          .toLowerCase();

      if (
        value ===
        "paid"
      ) {
        return "Paid";
      }

      if (
        value ===
        "overdue"
      ) {
        return "Overdue";
      }

      if (
        value ===
        "pending"
      ) {
        return "Pending";
      }

      return status ||
        "Pending";
    };

  /* =======================================================
     NORMALIZED INVOICES
  ======================================================= */

  const normalizedInvoices =
    invoices.map(
      (
        invoice
      ) => ({
        ...invoice,

        status:
          normalizeStatus(
            invoice.status
          ),
      })
    );

  /* =======================================================
     FILTER
  ======================================================= */

  const filteredInvoices =
    normalizedInvoices.filter(
      (
        invoice
      ) =>
        filterStatus ===
          "All" ||
        invoice.status ===
          filterStatus
    );

  /* =======================================================
     CURRENT INVOICE
  ======================================================= */

  const currentInvoice =
    normalizedInvoices.find(
      (
        invoice
      ) =>
        invoice.status ===
        "Pending"
    ) ||
    normalizedInvoices.find(
      (
        invoice
      ) =>
        invoice.status ===
        "Overdue"
    ) ||
    null;

  /* =======================================================
     COUNTS
  ======================================================= */

  const statusCounts =
    {
      All:
        normalizedInvoices.length,

      Pending:
        normalizedInvoices.filter(
          (
            invoice
          ) =>
            invoice.status ===
            "Pending"
        ).length,

      Paid:
        normalizedInvoices.filter(
          (
            invoice
          ) =>
            invoice.status ===
            "Paid"
        ).length,

      Overdue:
        normalizedInvoices.filter(
          (
            invoice
          ) =>
            invoice.status ===
            "Overdue"
        ).length,
    };

  /* =======================================================
     LOADING
  ======================================================= */

  if (
    loading
  ) {
    return (
      <BillingLoading />
    );
  }

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div
      className="
        relative
        min-h-screen
        overflow-hidden
        bg-[#F8F8F6]
        pb-28
      "
    >
      {/* =================================================
          BACKGROUND
      ================================================= */}

      <div
        className="
          pointer-events-none
          fixed
          inset-0
          overflow-hidden
        "
      >
        <motion.div
          className="
            absolute
            -right-[120px]
            -top-[100px]
            h-[300px]
            w-[300px]
            rounded-full
            bg-[#FFF0B5]
            opacity-70
          "
          animate={{
            y: [
              0,
              14,
              0,
            ],
          }}
          transition={{
            duration:
              10,

            repeat:
              Infinity,

            ease:
              "easeInOut",
          }}
        />

        <div
          className="
            absolute
            -left-[120px]
            top-[560px]
            h-[260px]
            w-[260px]
            rounded-full
            bg-[#FFF5D9]
          "
        />

        <div
          className="
            billing-grid
            absolute
            inset-0
          "
        />
      </div>

      {/* =================================================
          PAGE
      ================================================= */}

      <div
        className="
          relative
          z-10
          mx-auto
          min-h-screen
          w-full
          max-w-[475px]
        "
      >
        {/* =================================================
    HEADER
================================================= */}

<header
  className="
    px-5
    pb-5
    pt-7
  "
>
  {/* =================================================
      TOP ROW
  ================================================= */}

  <div
    className="
      flex
      items-center
      justify-between
      gap-3
    "
  >
    {/* TRANSPORT BILLING */}

    <div
      className="
        flex
        items-center
        gap-2
      "
    >
      <span
        className="
          text-[9px]
          font-extrabold
          uppercase
          tracking-[1.7px]
          text-[#B77D00]
        "
      >
        Transport Billing
      </span>

      <div
        className="
          h-[3px]
          w-7
          rounded-full
          bg-[#FFB400]
        "
      />
    </div>

    {/* REFRESH */}

    <motion.button
      type="button"
      onClick={
        handleRefresh
      }
      disabled={
        refreshing
      }
      whileTap={{
        scale: 0.92,
      }}
      className="
        flex
        h-[44px]
        w-[44px]
        shrink-0
        items-center
        justify-center
        rounded-[14px]
        border
        border-[#E9D99F]
        bg-white
        text-black
        shadow-[0_6px_18px_rgba(79,61,12,0.05)]
        disabled:opacity-60
      "
      aria-label="Refresh billing"
    >
      <RefreshCw
        size={18}
        className={
          refreshing
            ? "animate-spin"
            : ""
        }
      />
    </motion.button>
  </div>

  {/* =================================================
      TITLE
  ================================================= */}

  <motion.div
    initial={{
      opacity: 0,
      y: 8,
    }}
    animate={{
      opacity: 1,
      y: 0,
    }}
    className="
      mt-4
    "
  >
    <div
      className="
        flex
        items-center
        gap-2
      "
    >
      <h1
        className="
          text-[28px]
          font-extrabold
          tracking-[-0.7px]
          text-black
        "
      >
        Billing
      </h1>

      <ReceiptText
        size={21}
        className="
          text-[#C98C00]
        "
      />
    </div>

    <p
      className="
        mt-1.5
        max-w-[330px]
        text-[11px]
        leading-5
        text-zinc-500
      "
    >
      View monthly invoices,
      payment status and
      transport charges.
    </p>
  </motion.div>

  {/* =================================================
      HEADER INFO
  ================================================= */}

  {(statusCounts.Pending > 0 ||
    statusCounts.Overdue > 0) && (
    <div
      className="
        mt-4
        flex
        flex-wrap
        gap-2
      "
    >
      {statusCounts.Pending > 0 && (
        <div
          className="
            flex
            items-center
            gap-2
            rounded-full
            border
            border-[#E9CA68]
            bg-[#FFF0B8]
            px-3
            py-2
          "
        >
          <Clock3
            size={12}
            className="
              text-black
            "
          />

          <span
            className="
              text-[8px]
              font-extrabold
              text-black
            "
          >
            {statusCounts.Pending}{" "}
            Pending
          </span>
        </div>
      )}

      {statusCounts.Overdue > 0 && (
        <div
          className="
            flex
            items-center
            gap-2
            rounded-full
            border
            border-red-100
            bg-red-50
            px-3
            py-2
          "
        >
          <AlertTriangle
            size={12}
            className="
              text-red-500
            "
          />

          <span
            className="
              text-[8px]
              font-extrabold
              text-red-500
            "
          >
            {statusCounts.Overdue}{" "}
            Overdue
          </span>
        </div>
      )}
    </div>
  )}
</header>
        {/* =================================================
            BODY
        ================================================= */}

        <main
          className="
            px-4
            pb-8
            pt-2
          "
        >
          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <div
              className="
                mb-5
                flex
                items-start
                gap-3
                rounded-[18px]
                border
                border-[#EFD99A]
                bg-[#FFF9E8]
                px-4
                py-4
              "
            >
              <AlertTriangle
                size={
                  18
                }
                className="
                  mt-[1px]
                  shrink-0
                  text-[#C88B00]
                "
              />

              <div
                className="
                  flex-1
                "
              >
                <p
                  className="
                    text-[11px]
                    font-bold
                    text-black
                  "
                >
                  Billing information
                  unavailable
                </p>

                <p
                  className="
                    mt-1
                    text-[9px]
                    leading-4
                    text-zinc-500
                  "
                >
                  {
                    error
                  }
                </p>
              </div>
            </div>
          )}

          {/* =================================================
              BILLING OVERVIEW
          ================================================= */}

          <SectionHeader
            miniTitle="Overview"
            title="Billing Summary"
          />

          <SummaryCard
            invoices={
              normalizedInvoices
            }
          />

          {/* =================================================
              CURRENT INVOICE
          ================================================= */}

          {currentInvoice && (
            <motion.section
              initial={{
                opacity:
                  0,

                y:
                  8,
              }}
              animate={{
                opacity:
                  1,

                y:
                  0,
              }}
              className="
                mt-6
              "
            >
              <div
                className="
                  mb-3
                  flex
                  items-end
                  justify-between
                  gap-3
                  px-1
                "
              >
                <div>
                  <p
                    className="
                      text-[8px]
                      font-extrabold
                      uppercase
                      tracking-[1.6px]
                      text-[#B77D00]
                    "
                  >
                    Active Billing
                  </p>

                  <h2
                    className="
                      mt-1
                      text-[17px]
                      font-extrabold
                      text-black
                    "
                  >
                    Current Invoice
                  </h2>
                </div>

                <div
                  className="
                    flex
                    items-center
                    gap-1.5
                    rounded-full
                    border
                    border-[#EBD482]
                    bg-[#FFF3C8]
                    px-2.5
                    py-1.5
                  "
                >
                  <CalendarDays
                    size={
                      11
                    }
                    className="
                      text-[#B67C00]
                    "
                  />

                  <span
                    className="
                      text-[8px]
                      font-bold
                      text-[#8C6200]
                    "
                  >
                    {formatMonth(
                      currentInvoice.month
                    )}
                  </span>
                </div>
              </div>

              <InvoiceCard
                invoice={{
                  ...currentInvoice,

                  month:
                    formatMonth(
                      currentInvoice.month
                    ),
                }}
              />
            </motion.section>
          )}

          {/* =================================================
              HISTORY
          ================================================= */}

          <section
            className="
              mt-6
            "
          >
            <SectionHeader
              miniTitle="History"
              title="Invoice History"
              count={
                filteredInvoices.length
              }
            />

            {/* =================================================
                FILTERS
            ================================================= */}

            <div
              className="
                mb-3
                rounded-[20px]
                border
                border-[#EEDB99]
                bg-white
                p-2
                shadow-[0_6px_18px_rgba(79,61,12,0.035)]
              "
            >
              <div
                className="
                  flex
                  items-center
                  gap-2
                  px-1
                  pb-2
                "
              >
                <SlidersHorizontal
                  size={
                    13
                  }
                  className="
                    text-[#C48700]
                  "
                />

                <span
                  className="
                    text-[8px]
                    font-extrabold
                    uppercase
                    tracking-[1.2px]
                    text-zinc-400
                  "
                >
                  Filter invoices
                </span>
              </div>

              <div
                className="
                  grid
                  grid-cols-4
                  gap-1.5
                "
              >
                <FilterButton
                  label="All"
                  count={
                    statusCounts.All
                  }
                  icon={
                    ReceiptText
                  }
                  active={
                    filterStatus ===
                    "All"
                  }
                  onClick={() =>
                    setFilterStatus(
                      "All"
                    )
                  }
                />

                <FilterButton
                  label="Pending"
                  count={
                    statusCounts.Pending
                  }
                  icon={
                    Clock3
                  }
                  active={
                    filterStatus ===
                    "Pending"
                  }
                  onClick={() =>
                    setFilterStatus(
                      "Pending"
                    )
                  }
                />

                <FilterButton
                  label="Paid"
                  count={
                    statusCounts.Paid
                  }
                  icon={
                    IndianRupee
                  }
                  active={
                    filterStatus ===
                    "Paid"
                  }
                  onClick={() =>
                    setFilterStatus(
                      "Paid"
                    )
                  }
                />

                <FilterButton
                  label="Overdue"
                  count={
                    statusCounts.Overdue
                  }
                  icon={
                    AlertTriangle
                  }
                  active={
                    filterStatus ===
                    "Overdue"
                  }
                  onClick={() =>
                    setFilterStatus(
                      "Overdue"
                    )
                  }
                />
              </div>
            </div>

            {/* =================================================
                INVOICES
            ================================================= */}

            {filteredInvoices.length ===
            0 ? (
              <EmptyInvoice
                title={
                  invoices.length ===
                  0
                    ? "No Invoices Yet"
                    : "No Matching Invoices"
                }
                description={
                  invoices.length ===
                  0
                    ? "Your monthly transport invoices will appear here once they are generated."
                    : `There are no ${filterStatus.toLowerCase()} invoices available right now.`
                }
              />
            ) : (
              <div
                className="
                  grid
                  grid-cols-1
                  gap-3
                "
              >
                {filteredInvoices.map(
                  (
                    invoice
                  ) => (
                    <InvoiceCard
                      key={
                        invoice._id
                      }
                      invoice={{
                        ...invoice,

                        month:
                          formatMonth(
                            invoice.month
                          ),
                      }}
                    />
                  )
                )}
              </div>
            )}
          </section>
        </main>
      </div>

      {/* =================================================
          CSS
      ================================================= */}

      <style>{`
        .billing-grid {
          background-image:
            linear-gradient(
              rgba(168,124,0,0.022) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(168,124,0,0.022) 1px,
              transparent 1px
            );

          background-size:
            30px 30px;

          mask-image:
            linear-gradient(
              to bottom,
              rgba(0,0,0,0.22),
              transparent
            );

          -webkit-mask-image:
            linear-gradient(
              to bottom,
              rgba(0,0,0,0.22),
              transparent
            );
        }
      `}</style>
    </div>
  );
};

/* =========================================================
   SECTION HEADER
========================================================= */

function SectionHeader({
  miniTitle,
  title,
  count,
}) {
  return (
    <div
      className="
        mb-3
        flex
        items-end
        justify-between
        px-1
      "
    >
      <div>
        <p
          className="
            text-[8px]
            font-extrabold
            uppercase
            tracking-[1.6px]
            text-[#B77D00]
          "
        >
          {
            miniTitle
          }
        </p>

        <div
          className="
            mt-1
            flex
            items-center
            gap-2
          "
        >
          <h2
            className="
              text-[17px]
              font-extrabold
              text-black
            "
          >
            {
              title
            }
          </h2>

          {typeof count ===
            "number" && (
            <span
              className="
                flex
                h-[23px]
                min-w-[23px]
                items-center
                justify-center
                rounded-full
                border
                border-[#EBD482]
                bg-[#FFF3C8]
                px-1.5
                text-[8px]
                font-extrabold
                text-[#926300]
              "
            >
              {
                count
              }
            </span>
          )}
        </div>
      </div>

      <div
        className="
          h-[3px]
          w-[30px]
          rounded-full
          bg-[#FFB400]
        "
      />
    </div>
  );
}

/* =========================================================
   FILTER BUTTON
========================================================= */

function FilterButton({
  label,
  count,
  active,
  onClick,
  icon: Icon,
}) {
  const FilterIcon =
    Icon ||
    ReceiptText;

  return (
    <motion.button
      type="button"
      onClick={
        onClick
      }
      whileTap={{
        scale:
          0.96,
      }}
      className={`
        relative
        flex
        min-w-0
        flex-col
        items-center
        justify-center
        gap-1
        rounded-[13px]
        border
        px-1.5
        py-2.5
        transition-all

        ${
          active
            ? "border-[#E7C657] bg-[#FFF0B7] text-black"
            : "border-[#EEE7D5] bg-[#FAFAF8] text-zinc-400"
        }
      `}
    >
      <motion.div
        animate={{
          scale:
            active
              ? 1.08
              : 1,
        }}
      >
        <FilterIcon
          size={
            13
          }
          strokeWidth={
            active
              ? 2.3
              : 1.9
          }
        />
      </motion.div>

      <span
        className={`
          max-w-full
          truncate
          text-[7px]
          font-extrabold

          ${
            active
              ? "text-black"
              : "text-zinc-500"
          }
        `}
      >
        {
          label
        }
      </span>

      <span
        className={`
          flex
          h-[17px]
          min-w-[17px]
          items-center
          justify-center
          rounded-full
          px-1
          text-[7px]
          font-extrabold

          ${
            active
              ? "bg-white text-black"
              : "bg-[#FFF3C8] text-[#916500]"
          }
        `}
      >
        {
          count
        }
      </span>
    </motion.button>
  );
}

/* =========================================================
   LOADING
========================================================= */

function BillingLoading() {
  return (
    <div
      className="
        relative
        flex
        min-h-screen
        items-center
        justify-center
        overflow-hidden
        bg-[#F8F8F6]
        px-5
      "
    >
      {/* =================================================
          BACKGROUND
      ================================================= */}

      <div
        className="
          absolute
          -right-[110px]
          -top-[100px]
          h-[290px]
          w-[290px]
          rounded-full
          bg-[#FFF0B5]
        "
      />

      {/* =================================================
          CARD
      ================================================= */}

      <motion.div
        initial={{
          opacity:
            0,

          scale:
            0.96,
        }}
        animate={{
          opacity:
            1,

          scale:
            1,
        }}
        className="
          relative
          w-full
          max-w-[330px]
          overflow-hidden
          rounded-[28px]
          border
          border-[#EEDB99]
          bg-white
          px-6
          py-8
          text-center
          shadow-[0_16px_40px_rgba(82,63,12,0.09)]
        "
      >
        <div
          className="
            absolute
            -right-12
            -top-12
            h-[130px]
            w-[130px]
            rounded-full
            bg-[#FFF0B8]
          "
        />

        <div
          className="
            relative
            z-10
          "
        >
          <div
            className="
              relative
              mx-auto
              h-[66px]
              w-[66px]
            "
          >
            <div
              className="
                absolute
                inset-0
                flex
                items-center
                justify-center
                rounded-[20px]
                bg-[#FFB400]
                text-black
              "
            >
              <ReceiptText
                size={
                  28
                }
              />
            </div>

            <motion.div
              animate={{
                rotate:
                  360,
              }}
              transition={{
                duration:
                  1.5,

                repeat:
                  Infinity,

                ease:
                  "linear",
              }}
              className="
                absolute
                -bottom-[7px]
                -right-[7px]
                flex
                h-[28px]
                w-[28px]
                items-center
                justify-center
                rounded-[9px]
                border-[3px]
                border-white
                bg-[#FFF7DD]
                text-black
              "
            >
              <RefreshCw
                size={
                  12
                }
              />
            </motion.div>
          </div>

          <h2
            className="
              mt-5
              text-[18px]
              font-extrabold
              text-black
            "
          >
            Loading Billing
          </h2>

          <p
            className="
              mt-1
              text-[9px]
              leading-4
              text-zinc-500
            "
          >
            Fetching your latest
            invoices and payment
            details.
          </p>

          <div
            className="
              mx-auto
              mt-5
              h-[4px]
              w-[110px]
              overflow-hidden
              rounded-full
              bg-[#F2E8C8]
            "
          >
            <motion.div
              animate={{
                x: [
                  "-100%",
                  "100%",
                ],
              }}
              transition={{
                duration:
                  1.1,

                repeat:
                  Infinity,

                ease:
                  "easeInOut",
              }}
              className="
                h-full
                w-[55px]
                rounded-full
                bg-[#FFB400]
              "
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Billing;