import {
  UserRound,
  ShieldCheck,
  ArrowRight,
  LoaderCircle,
  BadgeCheck,
  KeyRound,
} from "lucide-react";

import {
  motion,
} from "framer-motion";

import OnboardingLayout from "./OnboardingLayout";

/* =========================================================
   DRIVER ID STEP
========================================================= */

function DriverIdStep({
  driverId,
  setDriverId,

  onContinue,
  onBack,

  loading = false,
  error = "",
}) {
  /* =======================================================
     DRIVER ID
  ======================================================= */

  const handleChange = (
    event
  ) => {
    const value =
      event.target.value
        .toUpperCase()
        .replace(
          /[^A-Z0-9-]/g,
          ""
        )
        .slice(
          0,
          30
        );

    setDriverId(
      value
    );
  };

  /* =======================================================
     VALIDATION
  ======================================================= */

  const validDriverId =
    driverId
      ?.trim()
      .length >= 3;

  /* =======================================================
     SUBMIT
  ======================================================= */

  const handleSubmit = (
    event
  ) => {
    event.preventDefault();

    if (
      !validDriverId ||
      loading
    ) {
      return;
    }

    if (
      typeof onContinue ===
      "function"
    ) {
      onContinue();
    }
  };

  /* =======================================================
     UI
  ======================================================= */

  return (
    <OnboardingLayout
      showBack
      onBack={
        onBack
      }
      showBrand
      compactBrand
      eyebrow="Driver Setup"
      title="Enter Driver ID"
      subtitle="Enter the Driver ID provided by your assigned school transport Driver."
    >
      <form
        onSubmit={
          handleSubmit
        }
        className="
          w-full
        "
      >
        {/* =================================================
            INTRO
        ================================================= */}

        <div
          className="
            flex
            items-start
            justify-between
            gap-4
          "
        >
          <div>
            <div
              className="
                flex
                items-center
                gap-2
              "
            >
              <KeyRound
                size={14}
                className="
                  text-[#CF9100]
                "
              />

              <p
                className="
                  text-[9px]
                  font-extrabold
                  uppercase
                  tracking-[1.5px]
                  text-[#B77D00]
                "
              >
                Driver Connection
              </p>
            </div>

            <h2
              className="
                mt-1
                text-[19px]
                font-extrabold
                tracking-[-0.3px]
                text-black
              "
            >
              Link your Driver
            </h2>

            <p
              className="
                mt-1.5
                max-w-[270px]
                text-[10px]
                leading-[17px]
                text-zinc-500
              "
            >
              Use the unique Driver ID shared by your assigned school transport Driver.
            </p>
          </div>

          <div
            className="
              flex
              h-[44px]
              w-[44px]
              shrink-0
              items-center
              justify-center
              rounded-[14px]
              bg-[#FFF1C8]
              text-[#B77D00]
            "
          >
            <UserRound
              size={20}
              strokeWidth={2}
            />
          </div>
        </div>

        {/* =================================================
            DRIVER ID FIELD
        ================================================= */}

        <div
          className="
            mt-6
          "
        >
          <label
            htmlFor="driver-id"
            className="
              ml-1
              text-[9px]
              font-extrabold
              uppercase
              tracking-[1.4px]
              text-[#B77D00]
            "
          >
            Driver ID
          </label>

          <div
            className={`
              mt-2
              flex
              h-[62px]
              items-center
              rounded-[19px]
              border
              bg-white
              px-3
              shadow-[0_5px_16px_rgba(91,71,14,0.04)]
              transition

              ${
                error
                  ? `
                    border-red-300
                  `
                  : `
                    border-[#E8D7A5]
                    focus-within:border-[#FFB400]
                    focus-within:ring-4
                    focus-within:ring-[#FFB400]/10
                  `
              }
            `}
          >
            <div
              className="
                flex
                h-[40px]
                w-[40px]
                shrink-0
                items-center
                justify-center
                rounded-[13px]
                bg-[#FFF3CE]
                text-[#B77D00]
              "
            >
              <UserRound
                size={18}
                strokeWidth={2}
              />
            </div>

            <input
              id="driver-id"
              type="text"
              autoComplete="off"
              placeholder="ASAN-XXXX"
              value={
                driverId
              }
              disabled={
                loading
              }
              onChange={
                handleChange
              }
              className="
                ml-3
                h-full
                min-w-0
                flex-1
                bg-transparent
                text-[14px]
                font-extrabold
                uppercase
                tracking-[0.05em]
                text-black
                outline-none
                placeholder:font-medium
                placeholder:tracking-normal
                placeholder:text-zinc-400
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            />

            {validDriverId && (
              <BadgeCheck
                size={18}
                className="
                  shrink-0
                  text-emerald-500
                "
              />
            )}
          </div>

          <p
            className="
              mt-2
              px-1
              text-[8px]
              leading-4
              text-zinc-400
            "
          >
            Enter the ID exactly as provided by your Driver.
          </p>
        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <motion.div
            initial={{
              opacity: 0,
              y: -3,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="
              mt-4
              rounded-[14px]
              border
              border-red-100
              bg-red-50
              px-4
              py-3
            "
          >
            <p
              className="
                text-[11px]
                font-medium
                leading-5
                text-red-600
              "
            >
              {error}
            </p>
          </motion.div>
        )}

        {/* =================================================
            CONTINUE
        ================================================= */}

        <motion.button
          type="submit"
          disabled={
            !validDriverId ||
            loading
          }
          whileTap={
            loading
              ? {}
              : {
                  scale: 0.985,
                }
          }
          className="
            mt-6
            flex
            h-[58px]
            w-full
            items-center
            justify-between
            rounded-[19px]
            bg-[#FFB400]
            px-3
            pl-5
            text-black
            shadow-[0_9px_22px_rgba(255,180,0,0.20)]
            transition
            hover:bg-[#FFBE24]
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          <div
            className="
              text-left
            "
          >
            <p
              className="
                text-[13px]
                font-extrabold
                leading-none
              "
            >
              {loading
                ? "Connecting..."
                : "Continue"}
            </p>

            {!loading && (
              <p
                className="
                  mt-1
                  text-[8px]
                  font-semibold
                  text-black/55
                "
              >
                Link this Driver to your Parent account
              </p>
            )}
          </div>

          <div
            className="
              flex
              h-[40px]
              w-[40px]
              items-center
              justify-center
              rounded-[13px]
              bg-black
              text-white
            "
          >
            {loading ? (
              <LoaderCircle
                size={17}
                className="
                  animate-spin
                "
              />
            ) : (
              <ArrowRight
                size={17}
                strokeWidth={2.2}
              />
            )}
          </div>
        </motion.button>

        {/* =================================================
            SECURITY NOTE
        ================================================= */}

        <div
          className="
            mt-5
            flex
            items-start
            gap-3
            border-t
            border-[#F0E4C4]
            pt-5
          "
        >
          <div
            className="
              flex
              h-[36px]
              w-[36px]
              shrink-0
              items-center
              justify-center
              rounded-[12px]
              bg-[#FFF1C8]
              text-[#B77D00]
            "
          >
            <ShieldCheck
              size={16}
              strokeWidth={2}
            />
          </div>

          <div>
            <p
              className="
                text-[10px]
                font-extrabold
                text-black
              "
            >
              Secure & Verified
            </p>

            <p
              className="
                mt-1
                max-w-[300px]
                text-[8px]
                leading-[14px]
                text-zinc-400
              "
            >
              Only approved Drivers can be linked to your Parent account.
            </p>
          </div>
        </div>
      </form>
    </OnboardingLayout>
  );
}

export default DriverIdStep;