import {
  House,
  Clock,
  UsersRound,
  ReceiptText,
  CircleUserRound,
} from "lucide-react";

import {
  motion,
} from "framer-motion";

/* =========================================================
   BOTTOM NAVIGATION
========================================================= */

function BottomNav({
  active,
  setActive,
}) {
  /* =======================================================
     NAV ITEMS
  ======================================================= */

  const navItems = [
    {
      key:
        "home",

      icon:
        House,

      label:
        "Home",
    },

    {
      key:
        "trips",

      icon:
        Clock,

      label:
        "Trips",
    },

    {
      key:
        "children",

      icon:
        UsersRound,

      label:
        "Children",
    },

    {
      key:
        "billing",

      icon:
        ReceiptText,

      label:
        "Billing",
    },

    {
      key:
        "profile",

      icon:
        CircleUserRound,

      label:
        "Profile",
    },
  ];

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div
      className="
        pointer-events-none
        fixed
        bottom-[10px]
        left-1/2
        z-[100]
        w-full
        max-w-[475px]
        -translate-x-1/2
        px-3
      "
    >
      {/* =================================================
          NAV CONTAINER
      ================================================= */}

      <div
        className="
          pointer-events-auto
          relative
          overflow-hidden
          rounded-[24px]
          border
          border-[#E9DCA9]
          bg-white/95
          p-[6px]
          shadow-[0_12px_36px_rgba(87,67,15,0.10)]
          backdrop-blur-xl
        "
      >
        {/* =================================================
            TOP HIGHLIGHT
        ================================================= */}

        <div
          className="
            absolute
            left-[20px]
            right-[20px]
            top-0
            h-px
            bg-gradient-to-r
            from-transparent
            via-[#FFB400]/45
            to-transparent
          "
        />

        {/* =================================================
            DECORATION
        ================================================= */}

        <div
          className="
            pointer-events-none
            absolute
            -right-[45px]
            -top-[55px]
            h-[120px]
            w-[120px]
            rounded-full
            bg-[#FFF3CA]
            opacity-55
          "
        />

        {/* =================================================
            NAV ITEMS
        ================================================= */}

        <div
          className="
            relative
            flex
            h-[63px]
            items-center
            justify-between
            gap-[3px]
          "
        >
          {navItems.map(
            (
              item
            ) => {
              const Icon =
                item.icon;

              const isActive =
                active ===
                item.key;

              return (
                <motion.button
                  key={
                    item.key
                  }
                  type="button"
                  onClick={() =>
                    setActive?.(
                      item.key
                    )
                  }
                  whileTap={{
                    scale:
                      0.93,
                  }}
                  className="
                    relative
                    flex
                    h-[53px]
                    min-w-0
                    flex-1
                    items-center
                    justify-center
                    outline-none
                  "
                >
                  {/* =================================================
                      ACTIVE BACKGROUND
                  ================================================= */}

                  {isActive && (
                    <motion.div
                      layoutId="bottomNavActive"
                      transition={{
                        type:
                          "spring",

                        stiffness:
                          420,

                        damping:
                          32,
                      }}
                      className="
                        absolute
                        inset-[2px]
                        overflow-hidden
                        rounded-[17px]
                        border
                        border-[#E7C75F]
                        bg-[#FFF0B8]
                        shadow-[0_6px_16px_rgba(183,133,0,0.12)]
                      "
                    >
                      {/* =================================================
                          ACTIVE GLOW
                      ================================================= */}

                      <div
                        className="
                          absolute
                          -right-[18px]
                          -top-[25px]
                          h-[60px]
                          w-[60px]
                          rounded-full
                          bg-[#FFB400]
                          opacity-[0.16]
                        "
                      />

                      {/* =================================================
                          ACTIVE LINE
                      ================================================= */}

                      <div
                        className="
                          absolute
                          left-1/2
                          top-0
                          h-[3px]
                          w-[24px]
                          -translate-x-1/2
                          rounded-b-full
                          bg-[#FFB400]
                        "
                      />
                    </motion.div>
                  )}

                  {/* =================================================
                      CONTENT
                  ================================================= */}

                  <div
                    className="
                      relative
                      z-10
                      flex
                      flex-col
                      items-center
                      justify-center
                      gap-[4px]
                    "
                  >
                    {/* =================================================
                        ICON
                    ================================================= */}

                    <motion.div
                      animate={{
                        y:
                          isActive
                            ? -1
                            : 0,

                        scale:
                          isActive
                            ? 1.06
                            : 1,
                      }}
                      transition={{
                        duration:
                          0.2,
                      }}
                      className={`
                        flex
                        items-center
                        justify-center
                        transition-colors
                        duration-200

                        ${
                          isActive
                            ? "text-[#A56F00]"
                            : "text-zinc-400"
                        }
                      `}
                    >
                      <Icon
                        size={
                          isActive
                            ? 21
                            : 20
                        }
                        strokeWidth={
                          isActive
                            ? 2.4
                            : 1.9
                        }
                      />
                    </motion.div>

                    {/* =================================================
                        LABEL
                    ================================================= */}

                    <motion.span
                      animate={{
                        color:
                          isActive
                            ? "#8F6100"
                            : "#A1A1AA",
                      }}
                      className={`
                        whitespace-nowrap
                        text-[8px]
                        leading-none

                        ${
                          isActive
                            ? "font-extrabold"
                            : "font-semibold"
                        }
                      `}
                    >
                      {
                        item.label
                      }
                    </motion.span>
                  </div>

                  {/* =================================================
                      ACTIVE DOT
                  ================================================= */}

                  {isActive && (
                    <motion.span
                      initial={{
                        scale:
                          0,
                      }}
                      animate={{
                        scale:
                          1,
                      }}
                      className="
                        absolute
                        bottom-[3px]
                        left-1/2
                        h-[4px]
                        w-[4px]
                        -translate-x-1/2
                        rounded-full
                        bg-[#FFB400]
                      "
                    />
                  )}
                </motion.button>
              );
            }
          )}
        </div>
      </div>
    </div>
  );
}

export default BottomNav;