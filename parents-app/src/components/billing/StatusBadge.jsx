import {
  IndianRupee,
  Clock3,
  AlertTriangle,
  Loader2,
  XCircle,
  CircleCheck,
  CircleDot,
  Circle,
} from "lucide-react";

import {
  motion,
} from "framer-motion";

/* =========================================================
   STATUS BADGE
========================================================= */

const StatusBadge = ({
  status = "Pending",
  size = "md",
  showIcon = true,
  className = "",
  dotOnly = false,
}) => {
  /* =======================================================
     NORMALIZE STATUS
  ======================================================= */

  const normalizedStatus =
    String(
      status ||
        "Pending"
    )
      .trim()
      .toLowerCase()
      .replace(
        /\s+/g,
        ""
      );

  /* =======================================================
     STATUS CONFIG
  ======================================================= */

  const badgeConfig = {
    /* =====================================================
       PAID
    ===================================================== */

    paid: {
      bg:
        "bg-green-50",

      text:
        "text-green-700",

      border:
        "border-green-100",

      dot:
        "bg-green-500",

      icon:
        IndianRupee,

      label:
        "Paid",
    },

    /* =====================================================
       PENDING
    ===================================================== */

    pending: {
      bg:
        "bg-[#FFF0B8]",

      text:
        "text-[#946400]",

      border:
        "border-[#E8CD70]",

      dot:
        "bg-[#FFB400]",

      icon:
        Clock3,

      label:
        "Pending",
    },

    /* =====================================================
       OVERDUE
    ===================================================== */

    overdue: {
      bg:
        "bg-red-50",

      text:
        "text-red-600",

      border:
        "border-red-100",

      dot:
        "bg-red-500",

      icon:
        AlertTriangle,

      label:
        "Overdue",
    },

    /* =====================================================
       PROCESSING
    ===================================================== */

    processing: {
      bg:
        "bg-[#FFF3C8]",

      text:
        "text-[#946400]",

      border:
        "border-[#E8D184]",

      dot:
        "bg-[#FFB400]",

      icon:
        Loader2,

      label:
        "Processing",
    },

    /* =====================================================
       COMPLETED
    ===================================================== */

    completed: {
      bg:
        "bg-green-50",

      text:
        "text-green-700",

      border:
        "border-green-100",

      dot:
        "bg-green-500",

      icon:
        CircleCheck,

      label:
        "Completed",
    },

    /* =====================================================
       CANCELLED
    ===================================================== */

    cancelled: {
      bg:
        "bg-red-50",

      text:
        "text-red-500",

      border:
        "border-red-100",

      dot:
        "bg-red-400",

      icon:
        XCircle,

      label:
        "Cancelled",
    },

    /* =====================================================
       IN PROGRESS
    ===================================================== */

    inprogress: {
      bg:
        "bg-[#FFF7DE]",

      text:
        "text-[#966600]",

      border:
        "border-[#EED28A]",

      dot:
        "bg-[#FFB400]",

      icon:
        CircleDot,

      label:
        "In Progress",
    },
  };

  /* =======================================================
     FALLBACK
  ======================================================= */

  const config =
    badgeConfig[
      normalizedStatus
    ] || {
      bg:
        "bg-[#FFF9E8]",

      text:
        "text-[#8E6200]",

      border:
        "border-[#EED58B]",

      dot:
        "bg-[#FFB400]",

      icon:
        Circle,

      label:
        status ||
        "Unknown",
    };

  const Icon =
    config.icon;

  /* =======================================================
     SIZE CONFIG
  ======================================================= */

  const sizes = {
    sm: {
      badge:
        "px-2 py-[5px] text-[8px] gap-1.5 rounded-[9px]",

      icon:
        11,

      dot:
        "w-[6px] h-[6px]",
    },

    md: {
      badge:
        "px-2.5 py-[7px] text-[9px] gap-1.5 rounded-[11px]",

      icon:
        13,

      dot:
        "w-[7px] h-[7px]",
    },

    lg: {
      badge:
        "px-3.5 py-2 text-[10px] gap-2 rounded-[13px]",

      icon:
        15,

      dot:
        "w-[8px] h-[8px]",
    },
  };

  const currentSize =
    sizes[size] ||
    sizes.md;

  /* =======================================================
     ANIMATED STATUS
  ======================================================= */

  const isAnimatedStatus =
    normalizedStatus ===
      "pending" ||
    normalizedStatus ===
      "processing" ||
    normalizedStatus ===
      "inprogress";

  /* =======================================================
     DOT ONLY
  ======================================================= */

  if (
    dotOnly
  ) {
    return (
      <motion.span
        initial={{
          opacity:
            0,
        }}
        animate={{
          opacity:
            1,
        }}
        className={`
          inline-flex
          items-center
          gap-2

          ${config.text}

          ${className}
        `}
      >
        {/* =================================================
            DOT
        ================================================= */}

        <motion.span
          className={`
            shrink-0
            rounded-full

            ${currentSize.dot}
            ${config.dot}
          `}
          animate={
            isAnimatedStatus
              ? {
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
                }
              : {
                  scale:
                    1,

                  opacity:
                    1,
                }
          }
          transition={{
            duration:
              1.5,

            repeat:
              isAnimatedStatus
                ? Infinity
                : 0,

            ease:
              "easeInOut",
          }}
        />

        {/* =================================================
            LABEL
        ================================================= */}

        <span
          className="
            whitespace-nowrap
            text-[9px]
            font-semibold
          "
        >
          {
            config.label
          }
        </span>
      </motion.span>
    );
  }

  /* =======================================================
     FULL BADGE
  ======================================================= */

  return (
    <motion.span
      initial={{
        opacity:
          0,

        scale:
          0.94,
      }}
      animate={{
        opacity:
          1,

        scale:
          1,
      }}
      whileHover={{
        scale:
          1.03,
      }}
      whileTap={{
        scale:
          0.97,
      }}
      transition={{
        duration:
          0.2,
      }}
      className={`
        inline-flex
        items-center
        justify-center
        whitespace-nowrap
        border
        font-extrabold
        uppercase
        tracking-[0.4px]
        shadow-[0_3px_10px_rgba(98,76,18,0.035)]
        transition-all
        duration-200

        ${config.bg}
        ${config.text}
        ${config.border}
        ${currentSize.badge}

        ${className}
      `}
    >
      {/* =================================================
          ICON
      ================================================= */}

      {showIcon ? (
        <motion.span
          className="
            flex
            shrink-0
            items-center
            justify-center
          "
          animate={
            normalizedStatus ===
            "pending"
              ? {
                  rotate: [
                    0,
                    -7,
                    7,
                    0,
                  ],
                }
              : normalizedStatus ===
                  "paid" ||
                normalizedStatus ===
                  "completed"
              ? {
                  scale: [
                    1,
                    1.08,
                    1,
                  ],
                }
              : {}
          }
          transition={{
            duration:
              normalizedStatus ===
              "pending"
                ? 1.8
                : 2,

            repeat:
              normalizedStatus ===
                "pending" ||
              normalizedStatus ===
                "paid" ||
              normalizedStatus ===
                "completed"
                ? Infinity
                : 0,

            repeatDelay:
              normalizedStatus ===
                "paid" ||
              normalizedStatus ===
                "completed"
                ? 2
                : 0,
          }}
        >
          <Icon
            size={
              currentSize.icon
            }
            strokeWidth={
              2.2
            }
            className={
              normalizedStatus ===
              "processing"
                ? "animate-spin"
                : ""
            }
          />
        </motion.span>
      ) : (
        /* =================================================
            DOT INSTEAD OF ICON
        ================================================= */

        <motion.span
          className={`
            shrink-0
            rounded-full

            ${currentSize.dot}
            ${config.dot}
          `}
          animate={
            isAnimatedStatus
              ? {
                  scale: [
                    1,
                    1.3,
                    1,
                  ],

                  opacity: [
                    1,
                    0.6,
                    1,
                  ],
                }
              : {
                  scale:
                    1,
                }
          }
          transition={{
            duration:
              1.4,

            repeat:
              isAnimatedStatus
                ? Infinity
                : 0,

            ease:
              "easeInOut",
          }}
        />
      )}

      {/* =================================================
          LABEL
      ================================================= */}

      <span>
        {
          config.label
        }
      </span>
    </motion.span>
  );
};

export default StatusBadge;