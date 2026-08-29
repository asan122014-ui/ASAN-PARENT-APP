import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

/* =========================================================
   ONBOARDING LAYOUT
========================================================= */

function OnboardingLayout({
  children,

  title = "",
  subtitle = "",

  eyebrow = "ASANRIDES PARENT",

  showBack = false,
  onBack,

  showBrand = true,
  compactBrand = false,

  className = "",
}) {
  /* =======================================================
     BACK
  ======================================================= */

  const handleBack = () => {
    if (typeof onBack === "function") {
      onBack();
      return;
    }

    window.history.back();
  };

  /* =======================================================
     UI
  ======================================================= */

  return (
    <main
      className={`
        relative
        min-h-screen
        overflow-hidden
        bg-[#FFF9EE]
        text-black
        ${className}
      `}
    >
      {/* ===================================================
          BACKGROUND DECORATION
      =================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          overflow-hidden
        "
      >
        {/* TOP RIGHT HONEY CIRCLE */}

        <motion.div
          className="
            absolute
            -right-[65px]
            -top-[135px]
            h-[335px]
            w-[335px]
            rounded-full
            bg-[#FFE9AD]
            opacity-[0.72]
          "
          animate={{
            y: [0, 12, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* LEFT WARM CIRCLE */}

        <div
          className="
            absolute
            -left-[145px]
            top-[390px]
            h-[300px]
            w-[300px]
            rounded-full
            bg-[#FFE2A0]
            opacity-[0.52]
          "
        />

        {/* RIGHT SOFT GLOW */}

        <div
          className="
            absolute
            -right-[125px]
            top-[440px]
            h-[260px]
            w-[260px]
            rounded-full
            bg-[#FFF1C8]
            opacity-[0.6]
          "
        />

        {/* BOTTOM IVORY */}

        <div
          className="
            absolute
            -left-[75px]
            bottom-[30px]
            h-[230px]
            w-[230px]
            rounded-full
            bg-[#FFF0C7]
            opacity-[0.45]
          "
        />

        {/* DECORATIVE RING */}

        <div
          className="
            absolute
            -right-[38px]
            bottom-[115px]
            h-[110px]
            w-[110px]
            rounded-full
            border-[22px]
            border-[#FFF0BE]
            opacity-70
          "
        />

        {/* GRID */}

        <div
          className="
            dashboard-grid
            absolute
            inset-0
          "
        />
      </div>

      {/* ===================================================
          CONTENT
      =================================================== */}

      <div
        className="
          relative
          z-10
          mx-auto
          flex
          min-h-screen
          w-full
          max-w-[475px]
          flex-col
          px-4
          pb-[max(30px,env(safe-area-inset-bottom))]
          pt-[max(26px,env(safe-area-inset-top))]
        "
      >
        {/* =================================================
            TOP BAR
        ================================================= */}

        <div
          className="
            flex
            min-h-[54px]
            items-center
            justify-between
            px-1
          "
        >
          {/* LEFT - BRAND */}

          {showBrand ? (
            <div
              className="
                flex
                items-center
                gap-3
              "
            >
              <img
                src="/Icon.png"
                alt="ASAN Rides"
                className="
                  h-[46px]
                  w-[46px]
                  shrink-0
                  object-contain
                "
              />

              <div>
                <h1
                  className="
                    text-[18px]
                    font-black
                    leading-none
                    tracking-[-0.4px]
                  "
                >
                  <span className="text-black">
                    ASAN
                  </span>

                  <span className="ml-1 text-[#FFB400]">
                    Rides
                  </span>
                </h1>
              </div>
            </div>
          ) : (
            <div />
          )}

          {/* RIGHT - BACK BUTTON */}

          {showBack ? (
            <motion.button
              type="button"
              onClick={handleBack}
              whileTap={{
                scale: 0.94,
              }}
              aria-label="Go back"
              className="
                flex
                h-[50px]
                w-[50px]
                shrink-0
                items-center
                justify-center
                rounded-[17px]
                border
                border-[#E9D7A0]
                bg-white/90
                text-black
                shadow-[0_8px_24px_rgba(101,76,17,0.07)]
                backdrop-blur-sm
              "
            >
              <ArrowLeft
                size={22}
                strokeWidth={2}
              />
            </motion.button>
          ) : (
            <div />
          )}
        </div>

        {/* =================================================
            PAGE HEADING
        ================================================= */}

        {(title || subtitle || eyebrow) && (
          <motion.header
            initial={{
              opacity: 0,
              y: 8,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className={`
              px-1

              ${
                compactBrand
                  ? "mt-5"
                  : "mt-7"
              }
            `}
          >
            {/* EYEBROW - LEFT */}

            {eyebrow && (
              <div
                className="
                  mb-6
                  flex
                  w-full
                  items-center
                  justify-start
                  gap-2
                "
              >
                <span
                  className="
                    text-[10px]
                    font-extrabold
                    uppercase
                    tracking-[1.8px]
                    text-[#B77D00]
                  "
                >
                  {eyebrow}
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
            )}

            {/* TITLE - LEFT */}

            {title && (
              <h1
                className="
                  max-w-[390px]
                  text-[30px]
                  font-extrabold
                  leading-[1.1]
                  tracking-[-0.7px]
                  text-black
                "
              >
                {title}
              </h1>
            )}

            {/* SUBTITLE - LEFT */}

            {subtitle && (
              <p
                className="
                  mt-2
                  max-w-[360px]
                  text-[11px]
                  leading-5
                  text-zinc-500
                "
              >
                {subtitle}
              </p>
            )}
          </motion.header>
        )}

        {/* =================================================
            CONTENT CARD
        ================================================= */}

        <motion.section
          initial={{
            opacity: 0,
            y: 14,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.05,
          }}
          className="
            relative
            mt-7
            w-full
            overflow-hidden
            rounded-[30px]
            border
            border-[#EFCF70]
            bg-white
            shadow-[0_18px_45px_rgba(97,74,12,0.09)]
          "
        >
          {/* TOP ACCENT */}

          <div
            className="
              absolute
              left-0
              right-0
              top-0
              h-[5px]
              bg-[#FFB400]
            "
          />

          {/* CARD HONEY DECORATION */}

          <motion.div
            className="
              pointer-events-none
              absolute
              -right-[95px]
              -top-[105px]
              h-[235px]
              w-[235px]
              rounded-full
              bg-[#FFF0B8]
            "
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
            }}
          />

          {/* SMALL RING */}

          <div
            className="
              pointer-events-none
              absolute
              -right-[15px]
              top-[115px]
              h-[82px]
              w-[82px]
              rounded-full
              border-[16px]
              border-[#FFF4D0]
            "
          />

          {/* CONTENT */}

          <div
            className="
              relative
              z-10
              p-5
              pt-7
            "
          >
            {children}
          </div>
        </motion.section>
      </div>
    </main>
  );
}

export default OnboardingLayout;