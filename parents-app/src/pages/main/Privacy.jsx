import {
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Database,
  Download,
  Eye,
  Info,
  Lock,
  MapPin,
  ShieldCheck,
  Trash2,
  UserCheck,
  X,
} from "lucide-react";

import {
  AnimatePresence,
  motion,
} from "framer-motion";

import {
  API,
  clearAccessToken,
} from "../../api/api";

/* =========================================================
   PRIVACY
========================================================= */

function Privacy({
  setTab,
  setPreviousTab,
}) {
  const navigate =
    useNavigate();

  /* =======================================================
     STATE
  ======================================================= */

  const [
    showDeleteModal,
    setShowDeleteModal,
  ] =
    useState(false);

  const [
    downloading,
    setDownloading,
  ] =
    useState(false);

  const [
    deleting,
    setDeleting,
  ] =
    useState(false);

  const [
    activePrivacy,
    setActivePrivacy,
  ] =
    useState(null);

  /* =======================================================
     GET STORED PARENT
  ======================================================= */

  const getParent =
    () => {
      try {
        return JSON.parse(
          localStorage.getItem(
            "parent"
          )
        );
      } catch {
        return null;
      }
    };

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
     PRIVACY ITEM
  ======================================================= */

  const togglePrivacy =
    (
      key
    ) => {
      setActivePrivacy(
        (
          current
        ) =>
          current ===
          key
            ? null
            : key
      );
    };

  /* =======================================================
     CLEAR PARENT SESSION
  ======================================================= */

  const clearParentSession =
    () => {
      clearAccessToken();

      localStorage.removeItem(
        "parent"
      );

      localStorage.removeItem(
        "parentId"
      );

      localStorage.removeItem(
        "driverId"
      );

      localStorage.removeItem(
        "push_token"
      );

      localStorage.removeItem(
        "activeTab"
      );

      localStorage.removeItem(
        "dashboardTrips"
      );

      sessionStorage.removeItem(
        "phoneEmailUserJsonUrl"
      );

      sessionStorage.removeItem(
        "verifiedParentPhone"
      );
    };

  /* =======================================================
     DOWNLOAD DATA
  ======================================================= */

  const handleDownloadData =
    async () => {
      try {
        setDownloading(
          true
        );

        const parent =
          getParent();

        const accessToken =
          localStorage.getItem(
            "accessToken"
          );

        if (
          !accessToken
        ) {
          clearParentSession();

          navigate(
            "/",
            {
              replace:
                true,
            }
          );

          return;
        }

        if (
          !parent?._id
        ) {
          return;
        }

        const res =
          await API.get(
            `/parent/download-data/${parent._id}`
          );

        const data =
          res.data?.data;

        if (
          !data
        ) {
          throw new Error(
            "No account data returned"
          );
        }

        /* =================================================
           CREATE JSON FILE
        ================================================= */

        const blob =
          new Blob(
            [
              JSON.stringify(
                data,
                null,
                2
              ),
            ],
            {
              type:
                "application/json",
            }
          );

        const url =
          window.URL.createObjectURL(
            blob
          );

        const anchor =
          document.createElement(
            "a"
          );

        const safeName =
          String(
            parent.name ||
              "Parent"
          )
            .trim()
            .replace(
              /[^a-z0-9_-]+/gi,
              "_"
            );

        anchor.href =
          url;

        anchor.download =
          `ASAN_Data_${safeName}.json`;

        document.body.appendChild(
          anchor
        );

        anchor.click();

        anchor.remove();

        window.URL.revokeObjectURL(
          url
        );
      } catch (
        err
      ) {
        console.error(
          "Download data error:",

          err?.response
            ?.data ||
            err
        );

        if (
          err?.response
            ?.status ===
          401
        ) {
          clearParentSession();

          navigate(
            "/",
            {
              replace:
                true,
            }
          );

          return;
        }
      } finally {
        setDownloading(
          false
        );
      }
    };

  /* =======================================================
     DELETE ACCOUNT
  ======================================================= */

  const handleDeleteAccount =
    async () => {
      try {
        setDeleting(
          true
        );

        const parent =
          getParent();

        const accessToken =
          localStorage.getItem(
            "accessToken"
          );

        if (
          !accessToken
        ) {
          clearParentSession();

          navigate(
            "/",
            {
              replace:
                true,
            }
          );

          return;
        }

        if (
          !parent?._id
        ) {
          return;
        }

        await API.delete(
          `/parent/${parent._id}`
        );

        clearParentSession();

        setShowDeleteModal(
          false
        );

        window.dispatchEvent(
          new CustomEvent(
            "asan:parent-logged-out"
          )
        );

        navigate(
          "/",
          {
            replace:
              true,
          }
        );
      } catch (
        err
      ) {
        console.error(
          "Delete account error:",

          err?.response
            ?.data ||
            err
        );

        if (
          err?.response
            ?.status ===
          401
        ) {
          clearParentSession();

          navigate(
            "/",
            {
              replace:
                true,
            }
          );

          return;
        }
      } finally {
        setDeleting(
          false
        );
      }
    };

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
            top-[550px]
            h-[270px]
            w-[270px]
            rounded-full
            bg-[#FFF5D9]
          "
        />

        <div
          className="
            privacy-grid
            absolute
            inset-0
          "
        />
      </div>

      {/* =================================================
          APP
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
      CLOSE BUTTON
  ================================================= */}

  <motion.button
    type="button"
    onClick={goBack}
    whileTap={{
      scale: 0.92,
    }}
    className="
      absolute
      right-5
      top-6
      z-20
      flex
      h-[44px]
      w-[44px]
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
    aria-label="Close privacy settings"
  >
    <X
      size={20}
      strokeWidth={2.2}
    />
  </motion.button>

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
        Account Protection
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
      Privacy & Security
    </h1>

    <p
      className="
        mt-1.5
        max-w-[330px]
        text-[11px]
        leading-5
        text-zinc-500
      "
    >
      Understand how your
      account, location and
      personal data are
      protected.
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
              PRIVACY SETTINGS
          ================================================= */}

          <SectionHeader
            miniTitle="Security"
            title="Privacy Settings"
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
            <PrivacyItem
              active={
                activePrivacy ===
                "location"
              }
              onClick={() =>
                togglePrivacy(
                  "location"
                )
              }
              icon={
                <MapPin
                  size={20}
                />
              }
              title="Location Access"
              desc="Used for live trip tracking and route progress"
              status="In Use"
              details="Location data is used during transportation features to display vehicle movement, route information and trip progress."
            />

            <Divider />

            <PrivacyItem
              active={
                activePrivacy ===
                "protection"
              }
              onClick={() =>
                togglePrivacy(
                  "protection"
                )
              }
              icon={
                <ShieldCheck
                  size={20}
                />
              }
              title="Data Protection"
              desc="Protected authenticated access to Parent data"
              status="Active"
              details="Sensitive Parent routes require authenticated access, and protected operations are restricted to the authenticated account."
            />

            <Divider />

            <PrivacyItem
              active={
                activePrivacy ===
                "security"
              }
              onClick={() =>
                togglePrivacy(
                  "security"
                )
              }
              icon={
                <Lock
                  size={20}
                />
              }
              title="Account Security"
              desc="Secure authentication and account ownership checks"
              status="Protected"
              details="Profile, notifications, data download and account deletion use authenticated Parent access and ownership verification."
            />

            <Divider />

            <PrivacyItem
              active={
                activePrivacy ===
                "verification"
              }
              onClick={() =>
                togglePrivacy(
                  "verification"
                )
              }
              icon={
                <UserCheck
                  size={20}
                />
              }
              title="Identity Verification"
              desc="Phone.Email verification protects your Parent account"
              status="Enabled"
              details="Your phone number is verified through Phone.Email before ASAN issues a Parent authentication session."
            />

            <Divider />

            <PrivacyItem
              active={
                activePrivacy ===
                "visibility"
              }
              onClick={() =>
                togglePrivacy(
                  "visibility"
                )
              }
              icon={
                <Eye
                  size={20}
                />
              }
              title="Data Visibility"
              desc="Account information is limited to authorized access"
              status="Private"
              details="Parent profile, children, ride and notification information are intended for authenticated application access rather than public visibility."
            />
          </div>

          {/* =================================================
              SECURITY TIPS
          ================================================= */}

          <div className="mt-6">
            <SectionHeader
              miniTitle="Protection"
              title="Security Tips"
            />

            <div
              className="
                rounded-[23px]
                border
                border-[#EEDB99]
                bg-white
                px-4
                py-2
                shadow-[0_8px_24px_rgba(80,62,14,0.045)]
              "
            >
              <TipItem
                text="Never share your OTP or phone verification code with anyone."
              />

              <TipDivider />

              <TipItem
                text="Sign out if you use the Parent app on a device you do not control."
              />

              <TipDivider />

              <TipItem
                text="Keep your registered phone number and email information secure and up to date."
              />
            </div>
          </div>

          {/* =================================================
              DATA & ACCOUNT
          ================================================= */}

          <div className="mt-6">
            <SectionHeader
              miniTitle="Account"
              title="Data & Account"
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
                  DOWNLOAD
              ================================================= */}

              <motion.button
                type="button"
                disabled={
                  downloading ||
                  deleting
                }
                onClick={
                  handleDownloadData
                }
                whileTap={{
                  scale:
                    0.99,
                }}
                className="
                  group
                  flex
                  w-full
                  items-center
                  px-4
                  py-4
                  text-left
                  transition
                  hover:bg-[#FFFDF6]
                  disabled:opacity-50
                "
              >
                <div
                  className="
                    flex
                    h-[48px]
                    w-[48px]
                    shrink-0
                    items-center
                    justify-center
                    rounded-[15px]
                    border
                    border-[#EED38A]
                    bg-[#FFF3C8]
                    text-black
                  "
                >
                  {downloading ? (
                    <div
                      className="
                        h-5
                        w-5
                        animate-spin
                        rounded-full
                        border-2
                        border-[#C88B00]
                        border-t-transparent
                      "
                    />
                  ) : (
                    <Download
                      size={20}
                    />
                  )}
                </div>

                <div
                  className="
                    ml-3
                    min-w-0
                    flex-1
                  "
                >
                  <h3
                    className="
                      text-[13px]
                      font-bold
                      text-black
                    "
                  >
                    Download My Data
                  </h3>

                  <p
                    className="
                      mt-1
                      text-[9px]
                      leading-4
                      text-zinc-500
                    "
                  >
                    Download your profile,
                    children, trips and
                    notification data.
                  </p>
                </div>

                <ActionArrow />
              </motion.button>

              <Divider />

              {/* =================================================
                  DELETE
              ================================================= */}

              <motion.button
                type="button"
                disabled={
                  downloading ||
                  deleting
                }
                onClick={() =>
                  setShowDeleteModal(
                    true
                  )
                }
                whileTap={{
                  scale:
                    0.99,
                }}
                className="
                  flex
                  w-full
                  items-center
                  px-4
                  py-4
                  text-left
                  transition
                  hover:bg-red-50/50
                  disabled:opacity-50
                "
              >
                <div
                  className="
                    flex
                    h-[48px]
                    w-[48px]
                    shrink-0
                    items-center
                    justify-center
                    rounded-[15px]
                    border
                    border-red-100
                    bg-red-50
                    text-red-500
                  "
                >
                  <Trash2
                    size={20}
                  />
                </div>

                <div
                  className="
                    ml-3
                    min-w-0
                    flex-1
                  "
                >
                  <h3
                    className="
                      text-[13px]
                      font-bold
                      text-red-500
                    "
                  >
                    Delete Account
                  </h3>

                  <p
                    className="
                      mt-1
                      text-[9px]
                      leading-4
                      text-zinc-500
                    "
                  >
                    Permanently remove
                    your Parent account
                    and related data.
                  </p>
                </div>

                <ActionArrow
                  danger
                />
              </motion.button>
            </div>
          </div>
        </main>
      </div>

      {/* =================================================
          DELETE MODAL
      ================================================= */}

      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{
              opacity:
                0,
            }}
            animate={{
              opacity:
                1,
            }}
            exit={{
              opacity:
                0,
            }}
            className="
              fixed
              inset-0
              z-[120]
              flex
              items-center
              justify-center
              bg-[#795F28]/30
              px-5
              backdrop-blur-[4px]
            "
            onClick={() =>
              !deleting &&
              setShowDeleteModal(
                false
              )
            }
          >
            <motion.div
              initial={{
                opacity:
                  0,

                scale:
                  0.94,

                y:
                  18,
              }}
              animate={{
                opacity:
                  1,

                scale:
                  1,

                y:
                  0,
              }}
              exit={{
                opacity:
                  0,

                scale:
                  0.96,

                y:
                  8,
              }}
              transition={{
                duration:
                  0.22,
              }}
              onClick={(
                event
              ) =>
                event.stopPropagation()
              }
              className="
                w-full
                max-w-[360px]
                overflow-hidden
                rounded-[28px]
                border
                border-red-100
                bg-white
                shadow-[0_24px_70px_rgba(86,61,10,0.18)]
              "
            >
              {/* =================================================
                  MODAL HEADER
              ================================================= */}

              <div
                className="
                  relative
                  overflow-hidden
                  border-b
                  border-red-100
                  bg-red-50
                  px-5
                  pb-5
                  pt-6
                "
              >
                <div
                  className="
                    absolute
                    -right-10
                    -top-14
                    h-36
                    w-36
                    rounded-full
                    bg-red-100
                    opacity-70
                  "
                />

                <button
                  type="button"
                  disabled={
                    deleting
                  }
                  onClick={() =>
                    setShowDeleteModal(
                      false
                    )
                  }
                  className="
                    absolute
                    right-4
                    top-4
                    z-20
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-[11px]
                    border
                    border-red-100
                    bg-white
                    text-black
                    disabled:opacity-50
                  "
                >
                  <X
                    size={18}
                  />
                </button>

                <div
                  className="
                    relative
                    z-10
                  "
                >
                  <div
                    className="
                      flex
                      h-[58px]
                      w-[58px]
                      items-center
                      justify-center
                      rounded-[18px]
                      bg-red-100
                      text-red-500
                    "
                  >
                    <AlertTriangle
                      size={26}
                    />
                  </div>

                  <h2
                    className="
                      mt-4
                      text-[22px]
                      font-extrabold
                      text-red-600
                    "
                  >
                    Delete Account?
                  </h2>

                  <p
                    className="
                      mt-1
                      max-w-[260px]
                      text-[10px]
                      leading-5
                      text-zinc-500
                    "
                  >
                    This permanently
                    removes your Parent
                    account and related
                    transportation data.
                  </p>
                </div>
              </div>

              {/* =================================================
                  MODAL BODY
              ================================================= */}

              <div
                className="
                  px-5
                  py-5
                "
              >
                <div
                  className="
                    rounded-[18px]
                    border
                    border-[#EEDB98]
                    bg-[#FFF9E8]
                    p-4
                  "
                >
                  <DeleteDataItem
                    icon={
                      <UserCheck
                        size={15}
                      />
                    }
                    text="Parent profile information"
                  />

                  <DeleteDataItem
                    icon={
                      <Database
                        size={15}
                      />
                    }
                    text="Children details"
                  />

                  <DeleteDataItem
                    icon={
                      <MapPin
                        size={15}
                      />
                    }
                    text="Trip history"
                  />

                  <DeleteDataItem
                    icon={
                      <ShieldCheck
                        size={15}
                      />
                    }
                    text="Notifications and related records"
                  />
                </div>

                {/* =================================================
                    WARNING
                ================================================= */}

                <div
                  className="
                    mt-4
                    flex
                    items-start
                    gap-2
                    rounded-[14px]
                    border
                    border-red-100
                    bg-red-50
                    px-3
                    py-3
                  "
                >
                  <AlertTriangle
                    size={15}
                    className="
                      mt-[1px]
                      shrink-0
                      text-red-500
                    "
                  />

                  <p
                    className="
                      text-[9px]
                      leading-4
                      text-red-500
                    "
                  >
                    This action cannot
                    be undone after your
                    account has been
                    deleted.
                  </p>
                </div>

                {/* =================================================
                    BUTTONS
                ================================================= */}

                <div
                  className="
                    mt-5
                    flex
                    gap-2
                  "
                >
                  <button
                    type="button"
                    disabled={
                      deleting
                    }
                    onClick={() =>
                      setShowDeleteModal(
                        false
                      )
                    }
                    className="
                      h-[48px]
                      flex-1
                      rounded-[14px]
                      border
                      border-[#E4E0D6]
                      bg-[#F7F7F4]
                      text-[11px]
                      font-bold
                      text-black
                      disabled:opacity-50
                    "
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    disabled={
                      deleting
                    }
                    onClick={
                      handleDeleteAccount
                    }
                    className="
                      flex
                      h-[48px]
                      flex-1
                      items-center
                      justify-center
                      gap-2
                      rounded-[14px]
                      bg-red-500
                      text-[11px]
                      font-extrabold
                      text-white
                      transition
                      hover:bg-red-600
                      disabled:opacity-60
                    "
                  >
                    {deleting ? (
                      <>
                        <div
                          className="
                            h-4
                            w-4
                            animate-spin
                            rounded-full
                            border-2
                            border-white
                            border-t-transparent
                          "
                        />

                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2
                          size={15}
                        />

                        Delete
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =================================================
          CSS
      ================================================= */}

      <style>{`
        .privacy-grid {
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
          {miniTitle}
        </p>

        <h2
          className="
            mt-1
            text-[17px]
            font-extrabold
            text-black
          "
        >
          {title}
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
   PRIVACY ITEM
========================================================= */

function PrivacyItem({
  icon,
  title,
  desc,
  status,
  details,
  active,
  onClick,
}) {
  return (
    <div>
      <motion.button
        type="button"
        onClick={
          onClick
        }
        whileTap={{
          scale:
            0.995,
        }}
        animate={{
          backgroundColor:
            active
              ? "#FFF9E8"
              : "#FFFFFF",
        }}
        className="
          flex
          w-full
          items-center
          gap-3
          px-4
          py-[14px]
          text-left
        "
      >
        <motion.div
          animate={{
            scale:
              active
                ? 1.05
                : 1,

            rotate:
              active
                ? 3
                : 0,
          }}
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
          {icon}
        </motion.div>

        <div
          className="
            min-w-0
            flex-1
          "
        >
          <div
            className="
              flex
              items-center
              gap-2
            "
          >
            <h3
              className="
                flex-1
                text-[12px]
                font-bold
                text-black
              "
            >
              {title}
            </h3>

            <span
              className="
                shrink-0
                rounded-full
                bg-[#FFF0B8]
                px-2
                py-1
                text-[7px]
                font-extrabold
                uppercase
                text-[#906200]
              "
            >
              {status}
            </span>

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
              className="text-zinc-400"
            >
              <ChevronRight
                size={16}
              />
            </motion.div>
          </div>

          <p
            className="
              mt-[3px]
              pr-2
              text-[9px]
              leading-4
              text-zinc-500
            "
          >
            {desc}
          </p>
        </div>
      </motion.button>

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
                0.24,
            }}
            className="overflow-hidden"
          >
            <div
              className="
                mb-3
                ml-[74px]
                mr-4
                flex
                items-start
                gap-2
                rounded-[14px]
                border
                border-[#ECD995]
                bg-[#FFF9E8]
                px-3
                py-3
              "
            >
              <Info
                size={14}
                className="
                  mt-[1px]
                  shrink-0
                  text-[#C78A00]
                "
              />

              <p
                className="
                  text-[8px]
                  leading-[1.55]
                  text-zinc-500
                "
              >
                {details}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* =========================================================
   TIP
========================================================= */

function TipItem({
  text,
}) {
  return (
    <div
      className="
        flex
        items-center
        gap-3
        py-3
      "
    >
      <div
        className="
          flex
          h-[31px]
          w-[31px]
          shrink-0
          items-center
          justify-center
          rounded-[10px]
          bg-[#FFF0B8]
          text-black
        "
      >
        <CheckCircle2
          size={15}
        />
      </div>

      <p
        className="
          text-[10px]
          font-medium
          leading-5
          text-zinc-600
        "
      >
        {text}
      </p>
    </div>
  );
}

/* =========================================================
   DELETE DATA ITEM
========================================================= */

function DeleteDataItem({
  icon,
  text,
}) {
  return (
    <div
      className="
        flex
        items-center
        gap-2
        py-[6px]
      "
    >
      <div
        className="
          flex
          h-[29px]
          w-[29px]
          items-center
          justify-center
          rounded-[9px]
          border
          border-[#EED794]
          bg-white
          text-black
        "
      >
        {icon}
      </div>

      <span
        className="
          text-[10px]
          font-medium
          text-zinc-600
        "
      >
        {text}
      </span>
    </div>
  );
}

/* =========================================================
   ACTION ARROW
========================================================= */

function ActionArrow({
  danger = false,
}) {
  return (
    <div
      className={`
        flex
        h-8
        w-8
        shrink-0
        items-center
        justify-center
        rounded-[10px]

        ${
          danger
            ? "bg-red-50"
            : "bg-[#FFF8E3]"
        }
      `}
    >
      <ChevronRight
        size={17}
        className={
          danger
            ? "text-red-400"
            : "text-zinc-400"
        }
      />
    </div>
  );
}

/* =========================================================
   DIVIDERS
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

function TipDivider() {
  return (
    <div
      className="
        ml-[43px]
        h-px
        bg-[#F0E6CB]
      "
    />
  );
}

export default Privacy;