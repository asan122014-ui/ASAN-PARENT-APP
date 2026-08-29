import {
  UserRound,
  CarTaxiFront,
  ShieldCheck,
  Clock3,
  MapPin,
  BellRing,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

import {
  motion,
} from "framer-motion";

import OnboardingLayout from "./OnboardingLayout";

/* =========================================================
   DRIVER CHOICE STEP
========================================================= */

function DriverChoiceStep({
  onEnterDriverId,
  onRequestDriver,
  onBack,

  loading = false,
  error = "",
}) {
  return (
    <OnboardingLayout
      showBack
      onBack={
        onBack
      }
      showBrand
      compactBrand
      eyebrow="Driver Setup"
      title="Choose Your Driver"
      subtitle="Connect with your assigned Driver or request one for your child."
    >
      <div
        className="
          w-full
        "
      >
        {/* =================================================
            INTRO
        ================================================= */}

        <div
          className="
            mb-5
            flex
            items-center
            justify-between
            gap-3
          "
        >
          <div>
            <p
              className="
                text-[9px]
                font-extrabold
                uppercase
                tracking-[1.4px]
                text-[#B77D00]
              "
            >
              Driver Connection
            </p>

            <h2
              className="
                mt-1
                text-[18px]
                font-extrabold
                tracking-[-0.3px]
                text-black
              "
            >
              How would you like to continue?
            </h2>
          </div>

          <div
            className="
              flex
              h-[42px]
              w-[42px]
              shrink-0
              items-center
              justify-center
              rounded-[14px]
              bg-[#FFF1C8]
              text-[#B77D00]
            "
          >
            <CarTaxiFront
              size={19}
              strokeWidth={2}
            />
          </div>
        </div>

        {/* =================================================
            OPTION 1
        ================================================= */}

        <ChoiceCard
          icon={
            UserRound
          }
          eyebrow="Already Assigned"
          title="Enter Driver ID"
          description="Connect with your school transport Driver using the Driver ID provided to you."
          buttonText="Enter Driver ID"
          onClick={
            onEnterDriverId
          }
          disabled={
            loading
          }
        />

        {/* =================================================
            OPTION 2
        ================================================= */}

        <ChoiceCard
          icon={
            CarTaxiFront
          }
          eyebrow="Need a Driver?"
          title="Request a Driver"
          description="Send a request and let the ASANRIDES team help you connect with a suitable Driver."
          buttonText="Request Driver"
          onClick={
            onRequestDriver
          }
          disabled={
            loading
          }
          className="mt-3"
        />

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
            FEATURES
        ================================================= */}

        <div
          className="
            mt-6
            border-t
            border-[#F0E4C4]
            pt-5
          "
        >
          <div
            className="
              mb-4
              flex
              items-center
              justify-between
            "
          >
            <div>
              <p
                className="
                  text-[9px]
                  font-extrabold
                  uppercase
                  tracking-[1.4px]
                  text-[#B77D00]
                "
              >
                ASANRIDES
              </p>

              <h3
                className="
                  mt-1
                  text-[14px]
                  font-extrabold
                  text-black
                "
              >
                Built for safer school rides
              </h3>
            </div>

            <div
              className="
                h-[3px]
                w-7
                rounded-full
                bg-[#FFB400]
              "
            />
          </div>

          <div
            className="
              grid
              grid-cols-2
              gap-2.5
            "
          >
            <FeatureItem
              icon={
                ShieldCheck
              }
              title="Safe & Secure"
              description="Verified Drivers"
            />

            <FeatureItem
              icon={
                Clock3
              }
              title="Reliable"
              description="Scheduled rides"
            />

            <FeatureItem
              icon={
                MapPin
              }
              title="Live Tracking"
              description="Track every ride"
            />

            <FeatureItem
              icon={
                BellRing
              }
              title="Instant Updates"
              description="Real-time alerts"
            />
          </div>
        </div>

        {/* =================================================
            FOOTER NOTE
        ================================================= */}

        <div
          className="
            mt-5
            flex
            items-center
            justify-center
            gap-2
          "
        >
          <CheckCircle2
            size={12}
            className="
              text-[#B77D00]
            "
          />

          <p
            className="
              text-center
              text-[8px]
              leading-4
              text-zinc-400
            "
          >
            You can manage Driver details later from your Parent account.
          </p>
        </div>
      </div>
    </OnboardingLayout>
  );
}

/* =========================================================
   CHOICE CARD
========================================================= */

function ChoiceCard({
  icon: Icon,
  eyebrow,
  title,
  description,
  buttonText,
  onClick,
  disabled,
  className = "",
}) {
  return (
    <motion.button
      type="button"
      disabled={
        disabled
      }
      onClick={
        onClick
      }
      whileTap={{
        scale: 0.99,
      }}
      className={`
        group
        relative
        w-full
        overflow-hidden
        rounded-[20px]
        border
        border-[#EEDFAE]
        bg-white
        px-4
        py-4
        text-left
        shadow-[0_6px_18px_rgba(91,71,14,0.045)]
        transition
        hover:border-[#E2C15D]
        hover:bg-[#FFFDF8]
        disabled:cursor-not-allowed
        disabled:opacity-60
        ${className}
      `}
    >
      {/* DECORATION */}

      <div
        className="
          pointer-events-none
          absolute
          -right-10
          -top-10
          h-24
          w-24
          rounded-full
          bg-[#FFF1C8]
          opacity-60
        "
      />

      <div
        className="
          relative
          z-10
          flex
          items-center
          gap-3
        "
      >
        {/* ICON */}

        <div
          className="
            flex
            h-[46px]
            w-[46px]
            shrink-0
            items-center
            justify-center
            rounded-[15px]
            bg-[#FFF1C8]
            text-[#B77D00]
          "
        >
          <Icon
            size={20}
            strokeWidth={2}
          />
        </div>

        {/* CONTENT */}

        <div
          className="
            min-w-0
            flex-1
          "
        >
          <p
            className="
              text-[8px]
              font-extrabold
              uppercase
              tracking-[1.2px]
              text-[#B77D00]
            "
          >
            {eyebrow}
          </p>

          <h3
            className="
              mt-0.5
              text-[15px]
              font-extrabold
              text-black
            "
          >
            {title}
          </h3>

          <p
            className="
              mt-1
              max-w-[290px]
              text-[9px]
              leading-[15px]
              text-zinc-500
            "
          >
            {description}
          </p>
        </div>

        {/* ARROW */}

        <div
          className="
            flex
            h-[36px]
            w-[36px]
            shrink-0
            items-center
            justify-center
            rounded-[12px]
            bg-black
            text-white
            transition
            group-hover:bg-[#FFB400]
            group-hover:text-black
          "
        >
          <ArrowRight
            size={16}
          />
        </div>
      </div>

      {/* ACTION LABEL */}

      <div
        className="
          relative
          z-10
          mt-3
          border-t
          border-[#F3EAD2]
          pt-3
        "
      >
        <span
          className="
            text-[9px]
            font-bold
            text-[#9A6A00]
          "
        >
          {buttonText}
        </span>
      </div>
    </motion.button>
  );
}

/* =========================================================
   FEATURE ITEM
========================================================= */

function FeatureItem({
  icon: Icon,
  title,
  description,
}) {
  return (
    <div
      className="
        flex
        items-center
        gap-2.5
        rounded-[15px]
        border
        border-[#F0E4C4]
        bg-[#FFFDF8]
        px-3
        py-3
      "
    >
      <div
        className="
          flex
          h-[34px]
          w-[34px]
          shrink-0
          items-center
          justify-center
          rounded-[11px]
          bg-[#FFF1C8]
          text-[#B77D00]
        "
      >
        <Icon
          size={15}
          strokeWidth={2}
        />
      </div>

      <div
        className="
          min-w-0
        "
      >
        <p
          className="
            truncate
            text-[9px]
            font-extrabold
            text-black
          "
        >
          {title}
        </p>

        <p
          className="
            mt-0.5
            truncate
            text-[7px]
            text-zinc-400
          "
        >
          {description}
        </p>
      </div>
    </div>
  );
}

export default DriverChoiceStep;