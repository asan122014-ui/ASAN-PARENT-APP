import {
  useEffect,
  useState,
} from "react";

import {
  User,
  CalendarDays,
  GraduationCap,
  School,
  Clock3,
  MapPin,
  ArrowLeft,
  ArrowRight,
  Plus,
  Trash2,
  Check,
  Users,
  Bookmark,
  HeartPulse,
  Phone,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";

import {
  motion,
} from "framer-motion";

import OnboardingLayout from "./OnboardingLayout";

/* =========================================================
   CREATE EMPTY CHILD
========================================================= */

export const createEmptyChild =
  () => ({
    /* =====================================================
       BASIC INFORMATION
    ===================================================== */

    name: "",

    age: "",

    gender: "",

    /* =====================================================
       SCHOOL INFORMATION
    ===================================================== */

    school: "",

    grade: "",

    section: "",

    /* =====================================================
       RIDE INFORMATION
    ===================================================== */

    pickupTime: "",

    eveningPickup: "",

    pickupLocation: "",

    dropoffLocation: "",

    location: {
      lat: null,
      lng: null,
    },

    dropLocationCoords: {
      lat: null,
      lng: null,
    },

    /* =====================================================
       SAFETY DETAILS
    ===================================================== */

    medicalNotes: "",

    emergencyContact: "",
  });

/* =========================================================
   CHILD DETAILS STEP
========================================================= */

function ChildDetailsStep({
  children,
  setChildren,

  onContinue,
  onBack,

  onOpenPickupMap,
  onOpenDropMap,

  loading = false,
  error = "",
}) {
  const [
    activeIndex,
    setActiveIndex,
  ] =
    useState(0);

  /* =======================================================
     SAFETY
  ======================================================= */

  useEffect(() => {
    if (
      children.length ===
      0
    ) {
      setChildren([
        createEmptyChild(),
      ]);

      setActiveIndex(
        0
      );

      return;
    }

    if (
      activeIndex >
      children.length - 1
    ) {
      setActiveIndex(
        children.length - 1
      );
    }
  }, [
    children,
    activeIndex,
    setChildren,
  ]);

  const child =
    children[
      activeIndex
    ] ||
    createEmptyChild();

  /* =======================================================
     UPDATE CHILD FIELD
  ======================================================= */

  const updateChildField =
    (
      field,
      value
    ) => {
      setChildren(
        (
          previous
        ) =>
          previous.map(
            (
              item,
              index
            ) =>
              index ===
              activeIndex
                ? {
                    ...item,

                    [field]:
                      value,
                  }
                : item
          )
      );
    };

  /* =======================================================
     VALIDATION
  ======================================================= */

  const isValidChild =
    (
      item
    ) => {
      /* FULL NAME */

      if (
        !item.name
          ?.trim()
      ) {
        return false;
      }

      /* AGE */

      const age =
        Number(
          item.age
        );

      if (
        !Number.isInteger(
          age
        ) ||
        age < 1 ||
        age > 17
      ) {
        return false;
      }

      /* SCHOOL */

      if (
        !item.school
          ?.trim()
      ) {
        return false;
      }

      /* GRADE */

      if (
        !item.grade
          ?.trim()
      ) {
        return false;
      }

      /* HOME PICKUP TIME */

      if (
        !item.pickupTime
      ) {
        return false;
      }

      /* SCHOOL PICKUP TIME */

      if (
        !item.eveningPickup
      ) {
        return false;
      }

      /* HOME LOCATION */

      if (
        !item.pickupLocation
          ?.trim() ||
        item.location?.lat ===
          null ||
        item.location?.lng ===
          null
      ) {
        return false;
      }

      /* SCHOOL LOCATION */

      if (
        !item.dropoffLocation
          ?.trim() ||
        item
          .dropLocationCoords
          ?.lat ===
          null ||
        item
          .dropLocationCoords
          ?.lng ===
          null
      ) {
        return false;
      }

      return true;
    };

  const currentChildValid =
    isValidChild(
      child
    );

  const allChildrenValid =
    children.length >
      0 &&
    children.every(
      isValidChild
    );

  /* =======================================================
     ADD CHILD
  ======================================================= */

  const addChild =
    () => {
      if (
        loading
      ) {
        return;
      }

      setChildren(
        (
          previous
        ) => [
          ...previous,

          createEmptyChild(),
        ]
      );

      setActiveIndex(
        children.length
      );
    };

  /* =======================================================
     REMOVE CHILD
  ======================================================= */

  const removeChild =
    () => {
      if (
        loading ||
        children.length <=
          1
      ) {
        return;
      }

      setChildren(
        (
          previous
        ) =>
          previous.filter(
            (
              _,
              index
            ) =>
              index !==
              activeIndex
          )
      );

      setActiveIndex(
        (
          previous
        ) =>
          Math.max(
            0,
            previous - 1
          )
      );
    };

  /* =======================================================
     NEXT / SAVE
  ======================================================= */

  const handleNext =
    () => {
      if (
        !currentChildValid ||
        loading
      ) {
        return;
      }

      if (
        activeIndex <
        children.length - 1
      ) {
        setActiveIndex(
          (
            previous
          ) =>
            previous + 1
        );

        return;
      }

      if (
        allChildrenValid &&
        typeof onContinue ===
          "function"
      ) {
        onContinue();
      }
    };

  /* =======================================================
     PREVIOUS CHILD
  ======================================================= */

  const handlePreviousChild =
    () => {
      if (
        activeIndex >
        0
      ) {
        setActiveIndex(
          (
            previous
          ) =>
            previous - 1
        );
      }
    };

  /* =======================================================
     UI
  ======================================================= */

  return (
    <OnboardingLayout
      showBack={false}
      showBrand
      compactBrand
      eyebrow="Child Profile"
      title="Add Child"
      subtitle="Add school, schedule and safety information for your child."
    >
      <div
        className="
          w-full
        "
      >
        {/* =================================================
            CHILD NAVIGATION HEADER
        ================================================= */}

        <div
          className="
            mb-6
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
                tracking-[1.6px]
                text-[#B77D00]
              "
            >
              Child{" "}
              {activeIndex + 1}
              {" "}of{" "}
              {children.length}
            </p>

            <p
              className="
                mt-1
                text-[11px]
                text-zinc-500
              "
            >
              Enter the child&apos;s details below.
            </p>
          </div>

          {children.length >
            1 && (
            <motion.button
              type="button"
              disabled={
                loading
              }
              onClick={
                removeChild
              }
              whileTap={{
                scale: 0.94,
              }}
              aria-label="Remove child"
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-[13px]
                border
                border-red-100
                bg-red-50
                text-red-500
                transition
                hover:bg-red-100
                disabled:opacity-50
              "
            >
              <Trash2
                size={17}
              />
            </motion.button>
          )}
        </div>

        {/* =================================================
            CHILD TABS
        ================================================= */}

        {children.length >
          1 && (
          <div
            className="
              mb-7
              flex
              gap-2
              overflow-x-auto
              pb-1
            "
          >
            {children.map(
              (
                item,
                index
              ) => {
                const active =
                  index ===
                  activeIndex;

                const valid =
                  isValidChild(
                    item
                  );

                return (
                  <button
                    key={
                      index
                    }
                    type="button"
                    disabled={
                      loading
                    }
                    onClick={() =>
                      setActiveIndex(
                        index
                      )
                    }
                    className={`
                      flex
                      min-w-[92px]
                      items-center
                      justify-center
                      gap-1.5
                      rounded-[14px]
                      border
                      px-3
                      py-2.5
                      text-[10px]
                      font-bold
                      transition

                      ${
                        active
                          ? `
                            border-[#EFD78A]
                            bg-[#FFF4CA]
                            text-black
                          `
                          : `
                            border-[#EEE4C9]
                            bg-white
                            text-zinc-500
                          `
                      }
                    `}
                  >
                    {valid && (
                      <Check
                        size={12}
                        className="
                          text-green-600
                        "
                      />
                    )}

                    Child{" "}
                    {index + 1}
                  </button>
                );
              }
            )}
          </div>
        )}

        {/* =================================================
            BASIC INFORMATION
        ================================================= */}

        <FormSectionTitle
          title="Basic Information"
        />

        <CleanField
          label="Full Name"
          icon={
            User
          }
        >
          <input
            type="text"
            autoComplete="off"
            value={
              child.name
            }
            disabled={
              loading
            }
            onChange={(
              event
            ) =>
              updateChildField(
                "name",
                event.target.value
              )
            }
            placeholder="Enter child's full name"
            className="
              clean-child-input
            "
          />
        </CleanField>

        {/* AGE + GENDER */}

        <div
          className="
            grid
            grid-cols-2
            gap-3
          "
        >
          <CleanField
            label="Age"
            icon={
              CalendarDays
            }
          >
            <input
              type="number"
              inputMode="numeric"
              min="1"
              max="17"
              value={
                child.age
              }
              disabled={
                loading
              }
              onChange={(
                event
              ) =>
                updateChildField(
                  "age",
                  event.target.value
                )
              }
              placeholder="Age"
              className="
                clean-child-input
              "
            />
          </CleanField>

          <CleanField
            label="Gender"
            icon={
              Users
            }
          >
            <select
              value={
                child.gender
              }
              disabled={
                loading
              }
              onChange={(
                event
              ) =>
                updateChildField(
                  "gender",
                  event.target.value
                )
              }
              className="
                clean-child-input
                appearance-none
              "
            >
              <option value="">
                Select
              </option>

              <option value="Male">
                Male
              </option>

              <option value="Female">
                Female
              </option>

              <option value="Other">
                Other
              </option>
            </select>
          </CleanField>
        </div>

        {/* =================================================
            SCHOOL INFORMATION
        ================================================= */}

        <FormSectionTitle
          title="School Information"
        />

        <CleanField
          label="School"
          icon={
            School
          }
        >
          <input
            type="text"
            value={
              child.school
            }
            disabled={
              loading
            }
            onChange={(
              event
            ) =>
              updateChildField(
                "school",
                event.target.value
              )
            }
            placeholder="Enter school name"
            className="
              clean-child-input
            "
          />
        </CleanField>

        <div
          className="
            grid
            grid-cols-2
            gap-3
          "
        >
          <CleanField
            label="Class / Grade"
            icon={
              GraduationCap
            }
          >
            <input
              type="text"
              value={
                child.grade
              }
              disabled={
                loading
              }
              onChange={(
                event
              ) =>
                updateChildField(
                  "grade",
                  event.target.value
                )
              }
              placeholder="Grade"
              className="
                clean-child-input
              "
            />
          </CleanField>

          <CleanField
            label="Section"
            optional
            icon={
              Bookmark
            }
          >
            <input
              type="text"
              value={
                child.section
              }
              disabled={
                loading
              }
              onChange={(
                event
              ) =>
                updateChildField(
                  "section",
                  event.target.value
                )
              }
              placeholder="Section"
              className="
                clean-child-input
              "
            />
          </CleanField>
        </div>

        {/* =================================================
            RIDE INFORMATION
        ================================================= */}

        <FormSectionTitle
          title="Ride Information"
        />

        {/* =================================================
            HOME
        ================================================= */}

        <FormGroupTitle
          title="HOME"
        />

        <div
          className="
            overflow-hidden
            rounded-[20px]
            border
            border-[#EEE0B5]
            bg-white
            shadow-[0_7px_20px_rgba(91,71,14,0.04)]
          "
        >
          {/* HOME LOCATION */}

          <button
            type="button"
            disabled={
              loading
            }
            onClick={() =>
              onOpenPickupMap?.(
                activeIndex
              )
            }
            className="
              flex
              min-h-[70px]
              w-full
              items-center
              gap-3
              px-4
              py-3
              text-left
              transition
              hover:bg-[#FFFCF4]
              disabled:opacity-60
            "
          >
            <StackIcon
              icon={
                MapPin
              }
            />

            <div
              className="
                min-w-0
                flex-1
              "
            >
              <p
                className="
                  mb-[2px]
                  text-[10px]
                  text-zinc-400
                "
              >
                Home Location
              </p>

              <p
                className={`
                  truncate
                  text-[13px]
                  font-medium

                  ${
                    child.pickupLocation
                      ? "text-black"
                      : "text-zinc-400"
                  }
                `}
              >
                {child.pickupLocation ||
                  "Select pickup address"}
              </p>
            </div>

            {child.location
              ?.lat !==
              null &&
            child.location
              ?.lng !==
              null ? (
              <CheckCircle2
                size={18}
                className="
                  shrink-0
                  text-green-500
                "
              />
            ) : (
              <ChevronRight
                size={19}
                className="
                  shrink-0
                  text-zinc-400
                "
              />
            )}
          </button>

          <StackDivider />

          {/* HOME PICKUP TIME */}

          <div
            className="
              flex
              min-h-[70px]
              items-center
              gap-3
              px-4
              py-3
            "
          >
            <StackIcon
              icon={
                Clock3
              }
            />

            <div
              className="
                min-w-0
                flex-1
              "
            >
              <p
                className="
                  mb-[3px]
                  text-[10px]
                  text-zinc-400
                "
              >
                Pickup Time
              </p>

              <input
                type="time"
                value={
                  child.pickupTime
                }
                disabled={
                  loading
                }
                onChange={(
                  event
                ) =>
                  updateChildField(
                    "pickupTime",
                    event.target.value
                  )
                }
                className="
                  w-full
                  bg-transparent
                  text-[13px]
                  font-semibold
                  text-black
                  outline-none
                  disabled:opacity-60
                "
              />
            </div>
          </div>
        </div>

        {/* =================================================
            SCHOOL
        ================================================= */}

        <FormGroupTitle
          title="SCHOOL"
        />

        <div
          className="
            overflow-hidden
            rounded-[20px]
            border
            border-[#EEE0B5]
            bg-white
            shadow-[0_7px_20px_rgba(91,71,14,0.04)]
          "
        >
          {/* SCHOOL LOCATION */}

          <button
            type="button"
            disabled={
              loading
            }
            onClick={() =>
              onOpenDropMap?.(
                activeIndex
              )
            }
            className="
              flex
              min-h-[70px]
              w-full
              items-center
              gap-3
              px-4
              py-3
              text-left
              transition
              hover:bg-[#FFFCF4]
              disabled:opacity-60
            "
          >
            <StackIcon
              icon={
                School
              }
            />

            <div
              className="
                min-w-0
                flex-1
              "
            >
              <p
                className="
                  mb-[2px]
                  text-[10px]
                  text-zinc-400
                "
              >
                School Location
              </p>

              <p
                className={`
                  truncate
                  text-[13px]
                  font-medium

                  ${
                    child.dropoffLocation
                      ? "text-black"
                      : "text-zinc-400"
                  }
                `}
              >
                {child.dropoffLocation ||
                  "Select school address"}
              </p>
            </div>

            {child
              .dropLocationCoords
              ?.lat !==
              null &&
            child
              .dropLocationCoords
              ?.lng !==
              null ? (
              <CheckCircle2
                size={18}
                className="
                  shrink-0
                  text-green-500
                "
              />
            ) : (
              <ChevronRight
                size={19}
                className="
                  shrink-0
                  text-zinc-400
                "
              />
            )}
          </button>

          <StackDivider />

          {/* SCHOOL PICKUP TIME */}

          <div
            className="
              flex
              min-h-[70px]
              items-center
              gap-3
              px-4
              py-3
            "
          >
            <StackIcon
              icon={
                Clock3
              }
            />

            <div
              className="
                min-w-0
                flex-1
              "
            >
              <p
                className="
                  mb-[3px]
                  text-[10px]
                  text-zinc-400
                "
              >
                Pickup Time
              </p>

              <input
                type="time"
                value={
                  child.eveningPickup
                }
                disabled={
                  loading
                }
                onChange={(
                  event
                ) =>
                  updateChildField(
                    "eveningPickup",
                    event.target.value
                  )
                }
                className="
                  w-full
                  bg-transparent
                  text-[13px]
                  font-semibold
                  text-black
                  outline-none
                  disabled:opacity-60
                "
              />
            </div>
          </div>
        </div>

        {/* =================================================
            SAFETY DETAILS
        ================================================= */}

        <FormSectionTitle
          title="Safety Details"
        />

        <CleanField
          label="Medical Notes"
          optional
          icon={
            HeartPulse
          }
        >
          <input
            type="text"
            value={
              child.medicalNotes
            }
            disabled={
              loading
            }
            onChange={(
              event
            ) =>
              updateChildField(
                "medicalNotes",
                event.target.value
              )
            }
            placeholder="Medical conditions or notes"
            className="
              clean-child-input
            "
          />
        </CleanField>

        <CleanField
          label="Emergency Contact"
          optional
          icon={
            Phone
          }
        >
          <input
            type="tel"
            inputMode="numeric"
            maxLength={10}
            value={
              child.emergencyContact
            }
            disabled={
              loading
            }
            onChange={(
              event
            ) =>
              updateChildField(
                "emergencyContact",
                event.target
                  .value
                  .replace(
                    /\D/g,
                    ""
                  )
                  .slice(
                    0,
                    10
                  )
              )
            }
            placeholder="Emergency contact number"
            className="
              clean-child-input
            "
          />
        </CleanField>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div
            className="
              mt-5
              rounded-[15px]
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
          </div>
        )}

        {/* =================================================
            SAVE / NEXT
        ================================================= */}

        <div
          className="
            mt-7
            flex
            gap-3
          "
        >
          {activeIndex >
            0 && (
            <motion.button
              type="button"
              disabled={
                loading
              }
              onClick={
                handlePreviousChild
              }
              whileTap={{
                scale: 0.95,
              }}
              className="
                flex
                h-[56px]
                w-[56px]
                shrink-0
                items-center
                justify-center
                rounded-[16px]
                border
                border-[#EEDFAE]
                bg-white
                text-[#A87300]
                shadow-[0_4px_12px_rgba(91,71,14,0.05)]
                disabled:opacity-50
              "
            >
              <ArrowLeft
                size={20}
              />
            </motion.button>
          )}

          <motion.button
            type="button"
            disabled={
              !currentChildValid ||
              loading
            }
            onClick={
              handleNext
            }
            whileTap={{
              scale: 0.99,
            }}
            className="
              flex
              h-[56px]
              flex-1
              items-center
              justify-center
              gap-2
              rounded-[16px]
              bg-[#FFB000]
              px-4
              text-[13px]
              font-extrabold
              text-black
              shadow-[0_10px_24px_rgba(255,176,0,0.20)]
              transition
              hover:bg-[#F4A900]
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            {loading
              ? "SAVING..."
              : activeIndex <
                  children.length -
                    1
                ? "NEXT CHILD"
                : "SAVE & CONTINUE"}

            {!loading && (
              <ArrowRight
                size={18}
              />
            )}
          </motion.button>
        </div>

        <p
          className="
            mt-2
            text-center
            text-[8px]
            leading-4
            text-zinc-400
          "
        >
          Please verify the child and ride details before saving.
        </p>

        {/* =================================================
            ADD ANOTHER CHILD
        ================================================= */}

        {activeIndex ===
          children.length -
            1 && (
          <motion.button
            type="button"
            disabled={
              loading
            }
            onClick={
              addChild
            }
            whileTap={{
              scale: 0.99,
            }}
            className="
              mt-4
              flex
              h-[52px]
              w-full
              items-center
              justify-center
              gap-2
              rounded-[16px]
              border
              border-[#EEDFAE]
              bg-white
              text-[11px]
              font-bold
              text-[#9C7000]
              transition
              hover:bg-[#FFF9E7]
              disabled:opacity-50
            "
          >
            <Plus
              size={17}
            />

            ADD ANOTHER CHILD
          </motion.button>
        )}
      </div>

      {/* ===================================================
          LOCAL INPUT STYLE
      =================================================== */}

      <style>
        {`
          .clean-child-input {
            width: 100%;
            height: 48px;
            background: transparent;
            outline: none;
            border: none;
            color: #000;
            font-size: 13px;
            font-weight: 500;
          }

          .clean-child-input::placeholder {
            color: #a1a1aa;
            font-weight: 400;
          }

          .clean-child-input:disabled {
            opacity: 0.6;
          }
        `}
      </style>
    </OnboardingLayout>
  );
}

/* =========================================================
   FORM SECTION TITLE
========================================================= */

function FormSectionTitle({
  title,
}) {
  return (
    <div
      className="
        mb-3
        mt-7
        flex
        items-center
        gap-2
      "
    >
      <h3
        className="
          text-[13px]
          font-extrabold
          text-black
        "
      >
        {title}
      </h3>

      <div
        className="
          h-[3px]
          w-7
          rounded-full
          bg-[#FFB000]
        "
      />
    </div>
  );
}

/* =========================================================
   GROUP TITLE
========================================================= */

function FormGroupTitle({
  title,
}) {
  return (
    <p
      className="
        mb-2
        mt-5
        px-1
        text-[8px]
        font-extrabold
        uppercase
        tracking-[1.5px]
        text-[#B77D00]
      "
    >
      {title}
    </p>
  );
}

/* =========================================================
   CLEAN FIELD
========================================================= */

function CleanField({
  label,
  optional = false,
  icon: Icon,
  children,
}) {
  return (
    <label
      className="
        mb-3
        block
      "
    >
      <div
        className="
          mb-1.5
          flex
          items-center
          justify-between
          px-1
        "
      >
        <span
          className="
            text-[9px]
            font-semibold
            text-zinc-600
          "
        >
          {label}
        </span>

        {optional && (
          <span
            className="
              text-[8px]
              font-medium
              text-zinc-400
            "
          >
            Optional
          </span>
        )}
      </div>

      <div
        className="
          flex
          min-h-[58px]
          items-center
          gap-3
          rounded-[17px]
          border
          border-[#EEE0B5]
          bg-white
          px-3
          shadow-[0_4px_12px_rgba(91,71,14,0.035)]
          transition
          focus-within:border-[#E3BD4F]
          focus-within:ring-4
          focus-within:ring-[#FFB000]/10
        "
      >
        <div
          className="
            flex
            h-[38px]
            w-[38px]
            shrink-0
            items-center
            justify-center
            rounded-[12px]
            bg-[#FFF4CA]
            text-[#A87300]
          "
        >
          <Icon
            size={18}
          />
        </div>

        <div
          className="
            min-w-0
            flex-1
          "
        >
          {children}
        </div>
      </div>
    </label>
  );
}

/* =========================================================
   STACK ICON
========================================================= */

function StackIcon({
  icon: Icon,
}) {
  return (
    <div
      className="
        flex
        h-[40px]
        w-[40px]
        shrink-0
        items-center
        justify-center
        rounded-[13px]
        bg-[#FFF4CA]
        text-[#A87300]
      "
    >
      <Icon
        size={18}
      />
    </div>
  );
}

/* =========================================================
   STACK DIVIDER
========================================================= */

function StackDivider() {
  return (
    <div
      className="
        ml-[67px]
        h-px
        bg-[#F1E8CF]
      "
    />
  );
}

export default ChildDetailsStep;