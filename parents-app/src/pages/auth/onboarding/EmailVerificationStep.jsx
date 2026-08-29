import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Mail,
  ShieldCheck,
  ArrowLeft,
  ArrowRight, 
  Loader2,
  RefreshCw,
  KeyRound,
} from "lucide-react";

import {
  motion,
} from "framer-motion";

import OnboardingLayout from "./OnboardingLayout";

/* =========================================================
   EMAIL OTP VERIFICATION STEP
========================================================= */

function EmailVerificationStep({
  mode = "login",

  email = "",

  onVerify,
  onResend,
  onBack,

  loading = false,
  error = "",
}) {
  /* =======================================================
     STATE
  ======================================================= */

  const [
    otp,
    setOtp,
  ] =
    useState([
      "",
      "",
      "",
      "",
      "",
      "",
    ]);

  const [
    localError,
    setLocalError,
  ] =
    useState("");

  const [
    resendSeconds,
    setResendSeconds,
  ] =
    useState(60);

  const [
    resendLoading,
    setResendLoading,
  ] =
    useState(false);

  /* =======================================================
     INPUT REFS
  ======================================================= */

  const inputRefs =
    useRef([]);

  /* =======================================================
     MASK EMAIL
  ======================================================= */

  const maskEmail = (
    value
  ) => {
    const normalized =
      String(
        value || ""
      )
        .trim()
        .toLowerCase();

    const [
      username,
      domain,
    ] =
      normalized.split(
        "@"
      );

    if (
      !username ||
      !domain
    ) {
      return normalized;
    }

    if (
      username.length <= 2
    ) {
      return `${username[0] || ""}***@${domain}`;
    }

    return `${username.slice(
      0,
      2
    )}***${username.slice(
      -1
    )}@${domain}`;
  };

  const maskedEmail =
    maskEmail(
      email
    );

  /* =======================================================
     RESEND TIMER
  ======================================================= */

  useEffect(() => {
    if (
      resendSeconds <= 0
    ) {
      return;
    }

    const timer =
      window.setInterval(
        () => {
          setResendSeconds(
            (
              previous
            ) =>
              previous > 0
                ? previous - 1
                : 0
          );
        },
        1000
      );

    return () => {
      window.clearInterval(
        timer
      );
    };
  }, [
    resendSeconds,
  ]);

  /* =======================================================
     AUTO FOCUS
  ======================================================= */

  useEffect(() => {
    inputRefs
      .current?.[0]
      ?.focus();
  }, []);

  /* =======================================================
     OTP STRING
  ======================================================= */

  const otpValue =
    otp.join("");

  /* =======================================================
     OTP CHANGE
  ======================================================= */

  const handleOtpChange = (
    index,
    value
  ) => {
    const digit =
      String(
        value || ""
      )
        .replace(
          /\D/g,
          ""
        )
        .slice(
          -1
        );

    const updated =
      [
        ...otp,
      ];

    updated[index] =
      digit;

    setOtp(
      updated
    );

    setLocalError("");

    if (
      digit &&
      index < 5
    ) {
      inputRefs
        .current?.[
          index + 1
        ]
        ?.focus();
    }
  };

  /* =======================================================
     KEYBOARD
  ======================================================= */

  const handleKeyDown = (
    index,
    event
  ) => {
    if (
      event.key ===
        "Backspace" &&
      !otp[index] &&
      index > 0
    ) {
      inputRefs
        .current?.[
          index - 1
        ]
        ?.focus();
    }

    if (
      event.key ===
        "ArrowLeft" &&
      index > 0
    ) {
      inputRefs
        .current?.[
          index - 1
        ]
        ?.focus();
    }

    if (
      event.key ===
        "ArrowRight" &&
      index < 5
    ) {
      inputRefs
        .current?.[
          index + 1
        ]
        ?.focus();
    }
  };

  /* =======================================================
     PASTE
  ======================================================= */

  const handlePaste = (
    event
  ) => {
    event.preventDefault();

    const pasted =
      event.clipboardData
        .getData(
          "text"
        )
        .replace(
          /\D/g,
          ""
        )
        .slice(
          0,
          6
        );

    if (
      !pasted
    ) {
      return;
    }

    const updated =
      [
        "",
        "",
        "",
        "",
        "",
        "",
      ];

    pasted
      .split("")
      .forEach(
        (
          digit,
          index
        ) => {
          updated[index] =
            digit;
        }
      );

    setOtp(
      updated
    );

    setLocalError("");

    const focusIndex =
      Math.min(
        pasted.length,
        5
      );

    inputRefs
      .current?.[
        focusIndex
      ]
      ?.focus();
  };

  /* =======================================================
     VERIFY
  ======================================================= */

  const handleVerify =
    async () => {
      try {
        setLocalError("");

        if (
          !/^\d{6}$/.test(
            otpValue
          )
        ) {
          throw new Error(
            "Enter the complete 6-digit OTP."
          );
        }

        if (
          typeof onVerify !==
          "function"
        ) {
          throw new Error(
            "OTP verification is unavailable."
          );
        }

        await onVerify(
          otpValue
        );
      } catch (
        err
      ) {
        setLocalError(
          err?.message ||
            "Unable to verify OTP."
        );
      }
    };

  /* =======================================================
     RESEND
  ======================================================= */

  const handleResend =
    async () => {
      if (
        resendSeconds > 0
      ) {
        return;
      }

      try {
        setLocalError("");

        setResendLoading(
          true
        );

        if (
          typeof onResend !==
          "function"
        ) {
          throw new Error(
            "OTP resend is unavailable."
          );
        }

        await onResend();

        setOtp([
          "",
          "",
          "",
          "",
          "",
          "",
        ]);

        setResendSeconds(
          60
        );

        inputRefs
          .current?.[0]
          ?.focus();
      } catch (
        err
      ) {
        setLocalError(
          err?.response?.data
            ?.message ||
            err?.message ||
            "Unable to resend OTP."
        );
      } finally {
        setResendLoading(
          false
        );
      }
    };

  /* =======================================================
     UI
  ======================================================= */

  return (
    <OnboardingLayout
  showBrand
  compactBrand
  eyebrow={
    mode === "register"
      ? "Account Verification"
      : "Secure Login"
  }
  title="Verify Your Email"
  subtitle={
    mode === "register"
      ? "Enter the 6-digit code sent to your email to finish creating your Parent account."
      : "Enter the 6-digit code sent to your registered email address."
  }
>
      <div
        className="
          w-full
        "
      >
        {/* =================================================
            TOP INFO
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
                  tracking-[1.6px]
                  text-[#B97E00]
                "
              >
                Verification Code
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
              Check your inbox
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
              We&apos;ve sent a 6-digit OTP to your email. The code is valid for 5 minutes.
            </p>
          </div>

          <motion.div
            animate={{
              y: [
                0,
                -2,
                0,
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
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
          </motion.div>
        </div>

        {/* =================================================
            EMAIL CARD
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
              gap-3
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
                bg-white
                text-[#CF8D00]
                shadow-[0_6px_18px_rgba(97,74,12,0.07)]
              "
            >
              <Mail
                size={18}
                strokeWidth={2}
              />
            </div>

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
                  tracking-[1.4px]
                  text-[#B97E00]
                "
              >
                Code sent to
              </p>

              <p
                className="
                  mt-1
                  truncate
                  text-[13px]
                  font-extrabold
                  text-black
                "
              >
                {maskedEmail}
              </p>
            </div>
          </div>
        </div>

        {/* =================================================
            OTP INPUT
        ================================================= */}

        <div
          className="
            mt-7
          "
        >
          <div
            className="
              mb-3
              flex
              items-center
              justify-between
              px-1
            "
          >
            <p
              className="
                text-[9px]
                font-extrabold
                uppercase
                tracking-[1.5px]
                text-[#B97E00]
              "
            >
              Enter OTP
            </p>

            <div
              className="
                h-[3px]
                w-8
                rounded-full
                bg-[#FFB400]
              "
            />
          </div>

          <div
            className="
              grid
              grid-cols-6
              gap-2
            "
          >
            {otp.map(
              (
                digit,
                index
              ) => (
                <input
                  key={
                    index
                  }
                  ref={(
                    element
                  ) => {
                    inputRefs.current[
                      index
                    ] =
                      element;
                  }}
                  type="text"
                  inputMode="numeric"
                  autoComplete={
                    index === 0
                      ? "one-time-code"
                      : "off"
                  }
                  maxLength={1}
                  value={
                    digit
                  }
                  disabled={
                    loading ||
                    resendLoading
                  }
                  onChange={(
                    event
                  ) =>
                    handleOtpChange(
                      index,
                      event.target.value
                    )
                  }
                  onKeyDown={(
                    event
                  ) =>
                    handleKeyDown(
                      index,
                      event
                    )
                  }
                  onPaste={
                    handlePaste
                  }
                  className="
                    h-[56px]
                    min-w-0
                    rounded-[16px]
                    border
                    border-[#E8D7A5]
                    bg-[#FFFDF8]
                    text-center
                    text-[20px]
                    font-extrabold
                    text-black
                    outline-none
                    transition
                    focus:border-[#FFB400]
                    focus:bg-white
                    focus:ring-4
                    focus:ring-[#FFB400]/10
                    disabled:opacity-50
                  "
                />
              )
            )}
          </div>
        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {(error ||
          localError) && (
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
              mt-5
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
              {error ||
                localError}
            </p>
          </motion.div>
        )}

        {/* =================================================
    VERIFY BUTTON
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
    type="button"
    disabled={
      loading ||
      resendLoading ||
      otpValue.length !== 6
    }
    onClick={
      handleVerify
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
      min-w-[175px]
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
        ? "Verifying..."
        : "Verify & Continue"}
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
          strokeWidth={2.3}
        />
      )}
    </div>
  </motion.button>
</div>

        {/* =================================================
            RESEND AREA
        ================================================= */}

        <div
          className="
            mt-5
            rounded-[18px]
            border
            border-[#EFE2BB]
            bg-[#FFFCF5]
            px-4
            py-4
          "
        >
          <div
            className="
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
                  tracking-[1.3px]
                  text-[#B97E00]
                "
              >
                Didn&apos;t get it?
              </p>

              <p
                className="
                  mt-1
                  text-[10px]
                  text-zinc-500
                "
              >
                You can request a new verification code.
              </p>
            </div>

            <button
              type="button"
              disabled={
                loading ||
                resendLoading ||
                resendSeconds > 0
              }
              onClick={
                handleResend
              }
              className="
                flex
                h-[40px]
                shrink-0
                items-center
                justify-center
                gap-2
                rounded-[13px]
                bg-[#FFF1C8]
                px-3
                text-[10px]
                font-extrabold
                text-[#A66F00]
                transition
                hover:bg-[#FFE7A1]
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {resendLoading ? (
                <>
                  <Loader2
                    size={14}
                    className="
                      animate-spin
                    "
                  />

                  Sending
                </>
              ) : resendSeconds > 0 ? (
                <>
                  {resendSeconds}s
                </>
              ) : (
                <>
                  <RefreshCw
                    size={14}
                  />

                  Resend
                </>
              )}
            </button>
          </div>
        </div>

        {/* =================================================
            CHANGE EMAIL
        ================================================= */}

        <button
          type="button"
          disabled={
            loading ||
            resendLoading
          }
          onClick={
            onBack
          }
          className="
            mt-4
            flex
            h-[50px]
            w-full
            items-center
            justify-center
            gap-2
            rounded-[17px]
            border
            border-[#E9D7A0]
            bg-white/90
            text-[11px]
            font-extrabold
            text-black
            shadow-[0_6px_18px_rgba(101,76,17,0.05)]
            transition
            hover:bg-[#FFF8E7]
            active:scale-[0.99]
            disabled:opacity-50
          "
        >
          <ArrowLeft
            size={16}
          />

          Change Email Address
        </button>

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
            px-2
          "
        >
          <ShieldCheck
            size={12}
            className="
              text-[#C58A00]
            "
          />

          <p
            className="
              text-center
              text-[8px]
              font-medium
              leading-4
              text-zinc-400
            "
          >
            Never share your ASANRIDES verification code with anyone.
          </p>
        </div>
      </div>
    </OnboardingLayout>
  );
}

export default EmailVerificationStep;