import {
  Mail,
  ArrowRight,
  ShieldCheck,
  Loader2,
  LockKeyhole,
} from "lucide-react";

import {
  motion,
} from "framer-motion";

import OnboardingLayout from "./OnboardingLayout";

/* =========================================================
   PARENT LOGIN STEP
========================================================= */

function ParentLoginStep({
  email = "",
  setEmail,
  onGetOtp,
  onRegister,
  loading = false,
  error = "",
}) {
  /* =======================================================
     NORMALIZE EMAIL
  ======================================================= */

  const normalizeEmail = (
    value
  ) => {
    return String(
      value || ""
    ).trimStart();
  };

  /* =======================================================
     EMAIL VALIDATION
  ======================================================= */

  const isValidEmail = (
    value
  ) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      String(
        value || ""
      )
        .trim()
        .toLowerCase()
    );
  };

  /* =======================================================
     SUBMIT
  ======================================================= */

  const handleSubmit = (
    event
  ) => {
    event.preventDefault();

    if (
      loading
    ) {
      return;
    }

    if (
      typeof onGetOtp ===
      "function"
    ) {
      onGetOtp();
    }
  };

  /* =======================================================
     UI
  ======================================================= */

  return (
    <OnboardingLayout
      showBack={false}
      showBrand
      compactBrand={false}
      eyebrow="Welcome Back"
      title="Parent Login"
      subtitle="Sign in to track your child's rides and receive real-time updates."
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
            CARD HEADER
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
              <LockKeyhole
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
                  tracking-[1.6px]
                  text-[#B97E00]
                "
              >
                Secure Access
              </p>
            </div>

            <h2
              className="
                mt-1
                text-[21px]
                font-extrabold
                tracking-[-0.3px]
                text-black
              "
            >
              Sign in securely
            </h2>

            <p
              className="
                mt-1.5
                max-w-[260px]
                text-[10px]
                leading-[17px]
                text-zinc-500
              "
            >
              Enter your registered email address to receive a verification code.
            </p>
          </div>

          <div
            className="
              flex
              h-[48px]
              w-[48px]
              shrink-0
              items-center
              justify-center
              rounded-[16px]
              bg-[#FFB400]
              text-black
              shadow-[0_8px_20px_rgba(255,180,0,0.20)]
            "
          >
            <ShieldCheck
              size={21}
              strokeWidth={2}
            />
          </div>
        </div>

        {/* =================================================
            EMAIL
        ================================================= */}

        <div
          className="
            mt-7
          "
        >
          <label
            htmlFor="parent-login-email"
            className="
              ml-1
              text-[9px]
              font-extrabold
              uppercase
              tracking-[1.4px]
              text-[#C58800]
            "
          >
            Email Address
          </label>

          <div
            className="
              mt-2
              flex
              h-[62px]
              items-center
              rounded-[20px]
              border
              border-[#E8D7A5]
              bg-[#FFFDF8]
              px-3
              transition
              focus-within:border-[#FFB400]
              focus-within:bg-white
              focus-within:ring-4
              focus-within:ring-[#FFB400]/10
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
                bg-[#FFEAAE]
                text-[#CF8D00]
              "
            >
              <Mail
                size={19}
                strokeWidth={2}
              />
            </div>

            <input
              id="parent-login-email"
              type="email"
              value={
                email
              }
              onChange={(
                event
              ) => {
                const value =
                  normalizeEmail(
                    event.target.value
                  );

                if (
                  typeof setEmail ===
                  "function"
                ) {
                  setEmail(
                    value
                  );
                }
              }}
              placeholder="parent@example.com"
              autoComplete="email"
              inputMode="email"
              disabled={
                loading
              }
              className="
                ml-3
                h-full
                min-w-0
                flex-1
                bg-transparent
                text-[14px]
                font-semibold
                text-black
                outline-none
                placeholder:font-medium
                placeholder:text-zinc-400
                disabled:opacity-60
              "
            />
          </div>
        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <motion.div
            initial={{
              opacity: 0,
              y: -4,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="
              mt-4
              rounded-[16px]
              border
              border-red-200
              bg-red-50
              px-4
              py-3
            "
          >
            <p
              className="
                text-[11px]
                font-semibold
                leading-5
                text-red-600
              "
            >
              {error}
            </p>
          </motion.div>
        )}

        {/* =================================================
    CONTINUE BUTTON
================================================= */}

<div
  className="
    mt-6
    flex
    w-full
    justify-end
  "
>
  <motion.button
    type="submit"
    disabled={
      loading ||
      !isValidEmail(email)
    }
    whileTap={
      loading
        ? {}
        : {
            scale: 0.97,
          }
    }
    className="
      flex
      h-[50px]
      min-w-[145px]
      items-center
      justify-between
      gap-3
      rounded-[16px]
      bg-[#FFB400]
      py-1.5
      pl-5
      pr-2
      text-black
      shadow-[0_8px_20px_rgba(255,180,0,0.20)]
      transition
      hover:bg-[#FFBE24]
      disabled:cursor-not-allowed
      disabled:opacity-50
    "
  >
    <span
      className="
        whitespace-nowrap
        text-[12px]
        font-extrabold
      "
    >
      {loading
        ? "Sending..."
        : "Continue"}
    </span>

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
      "
    >
      {loading ? (
        <Loader2
          size={16}
          className="animate-spin"
        />
      ) : (
        <ArrowRight
          size={17}
          strokeWidth={2.2}
        />
      )}
    </div>
  </motion.button>
</div>

        {/* =================================================
            REGISTER
        ================================================= */}

        <div
          className="
            relative
            mt-6
            overflow-hidden
            rounded-[20px]
            border
            border-[#EFE2BB]
            bg-[#FFF8E7]
            px-4
            py-4
          "
        >
          <div
            className="
              pointer-events-none
              absolute
              -right-8
              -top-10
              h-24
              w-24
              rounded-full
              bg-[#FFE7A1]
              opacity-70
            "
          />

          <div
            className="
              relative
              z-10
              flex
              items-center
              justify-between
              gap-4
            "
          >
            <div>
              <p
                className="
                  text-[9px]
                  font-extrabold
                  uppercase
                  tracking-[1.4px]
                  text-[#B97E00]
                "
              >
                New Parent?
              </p>

              <p
                className="
                  mt-1
                  text-[13px]
                  font-extrabold
                  text-black
                "
              >
                Create your account
              </p>

              <p
                className="
                  mt-1
                  text-[9px]
                  leading-4
                  text-zinc-500
                "
              >
                Set up your Parent profile and child details.
              </p>
            </div>

            <motion.button
              type="button"
              disabled={
                loading
              }
              onClick={
                onRegister
              }
              whileTap={{
                scale: 0.94,
              }}
              className="
                flex
                h-[42px]
                shrink-0
                items-center
                justify-center
                gap-2
                rounded-[14px]
                bg-white
                px-4
                text-[11px]
                font-extrabold
                text-black
                shadow-[0_6px_18px_rgba(97,74,12,0.08)]
                transition
                hover:bg-[#FFB400]
                disabled:opacity-50
              "
            >
              Register

              <ArrowRight
                size={15}
              />
            </motion.button>
          </div>
        </div>

        {/* =================================================
            SECURITY FOOTER
        ================================================= */}

        <div
          className="
            mt-5
            flex
            items-center
            justify-center
            gap-2
            px-3
          "
        >
          <ShieldCheck
            size={13}
            className="
              text-[#C58A00]
            "
          />

          <p
            className="
              text-center
              text-[9px]
              font-medium
              leading-4
              text-zinc-400
            "
          >
            Protected with secure email OTP verification
          </p>
        </div>
      </form>
    </OnboardingLayout>
  );
}

export default ParentLoginStep;