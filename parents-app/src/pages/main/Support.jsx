import {
  useState,
} from "react";

import {
  Phone,
  Mail,
  MessageCircle,
  Clock,
  CheckCircle2,
  Send,
  ChevronRight,
  Info,
  HelpCircle,
  X,
} from "lucide-react";

import {
  motion,
  AnimatePresence,
} from "framer-motion";

/* =========================================================
   SUPPORT CONTACT
========================================================= */

const SUPPORT_PHONE =
  "+918309649713";

const SUPPORT_PHONE_DISPLAY =
  "+91 83096 49713";

const SUPPORT_EMAIL =
  "asan122014@gmail.com";

/* =========================================================
   SUPPORT
========================================================= */

function Support({
  setTab,
  setPreviousTab,
}) {
  /* =======================================================
     STATE
  ======================================================= */

  const [
    message,
    setMessage,
  ] =
    useState("");

  const [
    messageSent,
    setMessageSent,
  ] =
    useState(false);

  const [
    activeSupport,
    setActiveSupport,
  ] =
    useState(null);

  const [
    activeFaq,
    setActiveFaq,
  ] =
    useState(null);

  /* =======================================================
     BACK / CLOSE
  ======================================================= */

  const goBack =
    () => {
      if (
        setPreviousTab
      ) {
        setPreviousTab(
          "profile"
        );
      }

      setTab?.(
        "profile"
      );
    };

  /* =======================================================
     SUPPORT ACTION
  ======================================================= */

  const handleSupportAction =
    (
      type
    ) => {
      if (
        type ===
        "call"
      ) {
        window.location.href =
          `tel:${SUPPORT_PHONE}`;

        return;
      }

      if (
        type ===
        "email"
      ) {
        window.location.href =
          `mailto:${SUPPORT_EMAIL}`;

        return;
      }

      if (
        type ===
        "chat"
      ) {
        setActiveSupport(
          (
            current
          ) =>
            current ===
            "chat"
              ? null
              : "chat"
        );
      }
    };

  /* =======================================================
     SEND MESSAGE
  ======================================================= */

  const handleSendMessage =
    () => {
      const cleanMessage =
        message.trim();

      if (
        !cleanMessage
      ) {
        return;
      }

      const subject =
        encodeURIComponent(
          "AsanRides Support Request"
        );

      const body =
        encodeURIComponent(
          cleanMessage
        );

      window.location.href =
        `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;

      setMessageSent(
        true
      );

      window.setTimeout(
        () => {
          setMessageSent(
            false
          );

          setMessage(
            ""
          );
        },
        2500
      );
    };

  /* =======================================================
     FAQ
  ======================================================= */

  const faqs = [
    {
      question:
        "I cannot see the live ride. What should I do?",

      answer:
        "Make sure a driver is linked and that an active ride has started. Live tracking appears when ride data is available.",
    },

    {
      question:
        "Why am I not receiving ride notifications?",

      answer:
        "Check that notifications are allowed for the app and that you are signed in to the correct Parent account.",
    },

    {
      question:
        "How can I change my linked driver?",

      answer:
        "Driver assignment is managed through the app's driver-linking flow. Contact support if you need help with an existing assignment.",
    },
  ];

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
        pb-12
      "
    >
      {/* =================================================
          BACKGROUND
      ================================================= */}

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          overflow-hidden
        "
      >
        <motion.div
          className="
            absolute
            -right-[125px]
            -top-[110px]
            h-[310px]
            w-[310px]
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
            -left-[130px]
            top-[560px]
            h-[270px]
            w-[270px]
            rounded-full
            bg-[#FFF5D9]
          "
        />

        <div
          className="
            support-grid
            absolute
            inset-0
          "
        />
      </div>

      {/* =================================================
          MAIN
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
            relative
            px-5
            pb-5
            pt-6
          "
        >
          {/* =================================================
              CLOSE
          ================================================= */}

          <motion.button
            type="button"
            onClick={
              goBack
            }
            whileTap={{
              scale:
                0.92,
            }}
            className="
              absolute
              right-5
              top-6
              z-20
              flex
              h-[44px]
              w-[44px]
              shrink-0
              items-center
              justify-center
              rounded-[14px]
              border
              border-[#E9DAA8]
              bg-white
              text-black
              shadow-[0_6px_18px_rgba(79,61,12,0.05)]
              transition
              hover:border-[#E6CA70]
              hover:bg-[#FFF9E8]
            "
            aria-label="Close support"
          >
            <X
              size={20}
              strokeWidth={
                2.2
              }
            />
          </motion.button>

          {/* =================================================
              TITLE
          ================================================= */}

          <motion.div
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
              pr-[58px]
              pt-1
            "
          >
            <div
              className="
                mb-2
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
                Support Center
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

            <h1
              className="
                text-[28px]
                font-extrabold
                tracking-[-0.7px]
                text-black
              "
            >
              Help & Support
            </h1>

            <p
              className="
                mt-1.5
                max-w-[320px]
                text-[11px]
                leading-5
                text-zinc-500
              "
            >
              Contact support or find
              quick answers whenever
              you need help.
            </p>
          </motion.div>
        </header>

        {/* =================================================
            CONTENT
        ================================================= */}

        <main
          className="
            px-4
            pb-10
            pt-2
          "
        >
          {/* =================================================
              CONTACT SUPPORT
          ================================================= */}

          <SectionHeader
            miniTitle="Support"
            title="Contact Support"
          />

          <div
            className="
              overflow-hidden
              rounded-[23px]
              border
              border-[#EEDB99]
              bg-white
              shadow-[0_8px_24px_rgba(80,62,14,0.045)]
            "
          >
            {/* =================================================
                CALL
            ================================================= */}

            <SupportItem
              icon={
                <Phone
                  size={
                    20
                  }
                />
              }
              title="Call Support"
              desc="Speak directly with our support team"
              value={
                SUPPORT_PHONE_DISPLAY
              }
              buttonText="Call"
              active={
                activeSupport ===
                "call"
              }
              onClick={() =>
                handleSupportAction(
                  "call"
                )
              }
            />

            <Divider />

            {/* =================================================
                EMAIL
            ================================================= */}

            <SupportItem
              icon={
                <Mail
                  size={
                    20
                  }
                />
              }
              title="Email Support"
              desc="Send your queries at any time"
              value={
                SUPPORT_EMAIL
              }
              buttonText="Email"
              active={
                activeSupport ===
                "email"
              }
              onClick={() =>
                handleSupportAction(
                  "email"
                )
              }
            />

            <Divider />

            {/* =================================================
                MESSAGE
            ================================================= */}

            <SupportItem
              icon={
                <MessageCircle
                  size={
                    20
                  }
                />
              }
              title="Write to Support"
              desc="Prepare a detailed support message"
              value="Support message"
              buttonText={
                activeSupport ===
                "chat"
                  ? "Close"
                  : "Open"
              }
              active={
                activeSupport ===
                "chat"
              }
              onClick={() =>
                handleSupportAction(
                  "chat"
                )
              }
            />

            {/* =================================================
                MESSAGE EXPANSION
            ================================================= */}

            <AnimatePresence>
              {activeSupport ===
                "chat" && (
                <motion.div
                  initial={{
                    height:
                      0,

                    opacity:
                      0,
                  }}
                  animate={{
                    height:
                      "auto",

                    opacity:
                      1,
                  }}
                  exit={{
                    height:
                      0,

                    opacity:
                      0,
                  }}
                  transition={{
                    duration:
                      0.24,
                  }}
                  className="
                    overflow-hidden
                  "
                >
                  <div
                    className="
                      mb-4
                      ml-[73px]
                      mr-4
                      rounded-[18px]
                      border
                      border-[#ECD795]
                      bg-[#FFF9E8]
                      p-4
                    "
                  >
                    <div
                      className="
                        flex
                        items-start
                        gap-2
                      "
                    >
                      <Info
                        size={
                          14
                        }
                        className="
                          mt-[1px]
                          shrink-0
                          text-[#C88B00]
                        "
                      />

                      <p
                        className="
                          text-[8px]
                          leading-4
                          text-zinc-500
                        "
                      >
                        Write your issue
                        below. Your email
                        app will open with
                        the message ready
                        to send.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* =================================================
              MESSAGE FORM
          ================================================= */}

          <AnimatePresence>
            {activeSupport ===
              "chat" && (
              <motion.div
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
                exit={{
                  opacity:
                    0,

                  y:
                    -5,
                }}
                className="
                  mt-4
                  rounded-[23px]
                  border
                  border-[#EEDB99]
                  bg-white
                  p-4
                  shadow-[0_8px_24px_rgba(80,62,14,0.045)]
                "
              >
                <div
                  className="
                    mb-3
                  "
                >
                  <p
                    className="
                      text-[12px]
                      font-bold
                      text-black
                    "
                  >
                    Tell us what happened
                  </p>

                  <p
                    className="
                      mt-1
                      text-[9px]
                      leading-4
                      text-zinc-500
                    "
                  >
                    Include enough detail
                    so the support team
                    can understand the
                    issue.
                  </p>
                </div>

                {/* =================================================
                    MESSAGE BOX
                ================================================= */}

                <div
                  className="
                    relative
                    overflow-hidden
                    rounded-[16px]
                    border
                    border-[#E8E1CF]
                    bg-[#FFFDF8]
                    transition
                    focus-within:border-[#FFB400]
                    focus-within:ring-4
                    focus-within:ring-[#FFB400]/10
                  "
                >
                  <textarea
                    value={
                      message
                    }
                    maxLength={
                      500
                    }
                    onChange={(
                      event
                    ) =>
                      setMessage(
                        event.target
                          .value
                      )
                    }
                    placeholder="Describe your issue..."
                    className="
                      h-[120px]
                      w-full
                      resize-none
                      bg-transparent
                      px-4
                      pb-8
                      pt-4
                      text-[11px]
                      leading-relaxed
                      text-black
                      outline-none
                      placeholder:text-zinc-400
                    "
                  />

                  <span
                    className="
                      absolute
                      bottom-2
                      right-3
                      text-[8px]
                      text-zinc-400
                    "
                  >
                    {
                      message.length
                    }
                    /500
                  </span>
                </div>

                {/* =================================================
                    SEND
                ================================================= */}

                <motion.button
                  type="button"
                  onClick={
                    handleSendMessage
                  }
                  disabled={
                    !message.trim() ||
                    messageSent
                  }
                  whileTap={
                    !message.trim()
                      ? {}
                      : {
                          scale:
                            0.985,
                        }
                  }
                  className={`
                    mt-3
                    flex
                    h-[50px]
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-[15px]
                    text-[11px]
                    font-extrabold
                    transition
                    disabled:opacity-40

                    ${
                      messageSent
                        ? "border border-[#E7CD78] bg-[#FFF2C2] text-black"
                        : "bg-[#FFB400] text-black"
                    }
                  `}
                >
                  <AnimatePresence
                    mode="wait"
                  >
                    {messageSent ? (
                      <motion.div
                        key="sent"
                        initial={{
                          opacity:
                            0,

                          y:
                            5,
                        }}
                        animate={{
                          opacity:
                            1,

                          y:
                            0,
                        }}
                        exit={{
                          opacity:
                            0,

                          y:
                            -5,
                        }}
                        className="
                          flex
                          items-center
                          gap-2
                        "
                      >
                        <CheckCircle2
                          size={
                            17
                          }
                        />

                        Email Ready
                      </motion.div>
                    ) : (
                      <motion.div
                        key="send"
                        initial={{
                          opacity:
                            0,
                        }}
                        animate={{
                          opacity:
                            1,
                        }}
                        className="
                          flex
                          items-center
                          gap-2
                        "
                      >
                        <Send
                          size={
                            16
                          }
                        />

                        Send Message
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>

                <p
                  className="
                    mt-2
                    text-center
                    text-[8px]
                    text-zinc-400
                  "
                >
                  Your email app will
                  open with your message
                  prepared.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* =================================================
              FAQ
          ================================================= */}

          <div
            className="
              mt-6
            "
          >
            <SectionHeader
              miniTitle="Quick Help"
              title="Frequently Asked Questions"
            />

            <div
              className="
                overflow-hidden
                rounded-[23px]
                border
                border-[#EEDB99]
                bg-white
                shadow-[0_8px_24px_rgba(80,62,14,0.045)]
              "
            >
              {faqs.map(
                (
                  faq,
                  index
                ) => (
                  <div
                    key={
                      faq.question
                    }
                  >
                    <FaqItem
                      question={
                        faq.question
                      }
                      answer={
                        faq.answer
                      }
                      active={
                        activeFaq ===
                        index
                      }
                      onClick={() =>
                        setActiveFaq(
                          (
                            current
                          ) =>
                            current ===
                            index
                              ? null
                              : index
                        )
                      }
                    />

                    {index <
                      faqs.length -
                        1 && (
                      <Divider />
                    )}
                  </div>
                )
              )}
            </div>
          </div>

          {/* =================================================
              SUPPORT HOURS
          ================================================= */}

          <div
            className="
              mt-6
            "
          >
            <SectionHeader
              miniTitle="Availability"
              title="Support Hours"
            />

            <div
              className="
                overflow-hidden
                rounded-[23px]
                border
                border-[#EEDB99]
                bg-white
                shadow-[0_8px_24px_rgba(80,62,14,0.045)]
              "
            >
              <SupportHour
                label="Weekdays"
                value="9:00 AM – 9:00 PM"
              />

              <Divider />

              <SupportHour
                label="Weekends"
                value="10:00 AM – 6:00 PM"
              />
            </div>
          </div>
        </main>
      </div>

      {/* =================================================
          CSS
      ================================================= */}

      <style>{`
        .support-grid {
          background-image:
            linear-gradient(
              rgba(168, 124, 0, 0.022) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(168, 124, 0, 0.022) 1px,
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
}

/* =========================================================
   SECTION HEADER
========================================================= */

function SectionHeader({
  miniTitle,
  title,
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

        <h2
          className="
            mt-1
            text-[17px]
            font-extrabold
            text-black
          "
        >
          {
            title
          }
        </h2>
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
   SUPPORT ITEM
========================================================= */

function SupportItem({
  icon,
  title,
  desc,
  value,
  buttonText,
  active,
  onClick,
}) {
  return (
    <motion.button
      type="button"
      onClick={
        onClick
      }
      whileTap={{
        scale:
          0.995,
      }}
      className={`
        flex
        w-full
        items-center
        gap-3
        px-4
        py-[14px]
        text-left
        transition

        ${
          active
            ? "bg-[#FFF9E8]"
            : "bg-white hover:bg-[#FFFDF7]"
        }
      `}
    >
      <div
        className={`
          flex
          h-[46px]
          w-[46px]
          shrink-0
          items-center
          justify-center
          rounded-[15px]
          border
          text-black

          ${
            active
              ? "border-[#FFB400] bg-[#FFB400]"
              : "border-[#EED58B] bg-[#FFF3C8]"
          }
        `}
      >
        {
          icon
        }
      </div>

      <div
        className="
          min-w-0
          flex-1
        "
      >
        <h3
          className="
            text-[12px]
            font-bold
            text-black
          "
        >
          {
            title
          }
        </h3>

        <p
          className="
            mt-[2px]
            text-[9px]
            text-zinc-500
          "
        >
          {
            desc
          }
        </p>

        <p
          className="
            mt-1
            truncate
            text-[9px]
            font-semibold
            text-[#A87300]
          "
        >
          {
            value
          }
        </p>
      </div>

      <div
        className="
          flex
          shrink-0
          items-center
          gap-1
          rounded-full
          bg-[#FFF2C3]
          px-2.5
          py-1.5
          text-[#8E6200]
        "
      >
        <span
          className="
            text-[8px]
            font-bold
          "
        >
          {
            buttonText
          }
        </span>

        <ChevronRight
          size={
            13
          }
        />
      </div>
    </motion.button>
  );
}

/* =========================================================
   FAQ
========================================================= */

function FaqItem({
  question,
  answer,
  active,
  onClick,
}) {
  return (
    <div>
      <button
        type="button"
        onClick={
          onClick
        }
        className="
          flex
          w-full
          items-center
          gap-3
          px-4
          py-[15px]
          text-left
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
            rounded-[13px]
            border
            border-[#EED58B]
            bg-[#FFF3C8]
            text-black
          "
        >
          <HelpCircle
            size={
              18
            }
          />
        </div>

        <p
          className="
            flex-1
            text-[11px]
            font-semibold
            leading-4
            text-black
          "
        >
          {
            question
          }
        </p>

        <motion.div
          animate={{
            rotate:
              active
                ? 90
                : 0,
          }}
          transition={{
            duration:
              0.2,
          }}
          className="
            text-zinc-400
          "
        >
          <ChevronRight
            size={
              16
            }
          />
        </motion.div>
      </button>

      <AnimatePresence>
        {active && (
          <motion.div
            initial={{
              height:
                0,

              opacity:
                0,
            }}
            animate={{
              height:
                "auto",

              opacity:
                1,
            }}
            exit={{
              height:
                0,

              opacity:
                0,
            }}
            transition={{
              duration:
                0.22,
            }}
            className="
              overflow-hidden
            "
          >
            <div
              className="
                mb-3
                ml-[70px]
                mr-4
                rounded-[14px]
                border
                border-[#EFD99A]
                bg-[#FFF9E8]
                px-3
                py-3
              "
            >
              <p
                className="
                  text-[9px]
                  leading-5
                  text-zinc-500
                "
              >
                {
                  answer
                }
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* =========================================================
   SUPPORT HOURS
========================================================= */

function SupportHour({
  label,
  value,
}) {
  return (
    <motion.div
      initial={{
        opacity:
          0,

        y:
          4,
      }}
      animate={{
        opacity:
          1,

        y:
          0,
      }}
      className="
        flex
        min-h-[65px]
        items-center
        justify-between
        gap-3
        px-4
        py-3
      "
    >
      <div
        className="
          flex
          items-center
          gap-3
        "
      >
        <div
          className="
            flex
            h-[40px]
            w-[40px]
            shrink-0
            items-center
            justify-center
            rounded-[12px]
            border
            border-[#EED58B]
            bg-[#FFF3C8]
            text-black
          "
        >
          <Clock
            size={
              17
            }
          />
        </div>

        <span
          className="
            text-[11px]
            font-semibold
            text-black
          "
        >
          {
            label
          }
        </span>
      </div>

      <span
        className="
          text-[9px]
          font-bold
          text-zinc-500
        "
      >
        {
          value
        }
      </span>
    </motion.div>
  );
}

/* =========================================================
   DIVIDER
========================================================= */

function Divider() {
  return (
    <div
      className="
        ml-[73px]
        h-px
        bg-[#F0E6CB]
      "
    />
  );
}

export default Support;