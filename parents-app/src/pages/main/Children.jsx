import {
  useEffect,
  useState,
} from "react";

import {
  ArrowLeft,
  ChevronRight,
  Pencil,
  User,
  School,
  Clock3,
  MapPin,
  Plus,
  Trash2,
  CalendarDays,
  Users,
  Bookmark,
  HeartPulse,
  Phone,
  Save,
  GraduationCap,
  CheckCircle2,
  MapPinned,
  AlertTriangle,
  CircleAlert,
  Info,
} from "lucide-react";

import BottomNav from "../../components/layout/BottomNav";

import {
  API,
} from "../../api/api";

import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

/* =========================================================
   CREATE EMPTY FORM
========================================================= */

const createEmptyForm =
  () => ({
    name: "",

    age: "",

    gender: "",

    school: "",

    grade: "",

    section: "",

    pickupTime: "",

    eveningPickup: "",

    pickupLocation: "",

    dropoffLocation: "",

    pickupCoords: {
      lat: null,
      lng: null,
    },

    dropoffCoords: {
      lat: null,
      lng: null,
    },

    medicalNotes: "",

    emergencyContact: "",
  });

/* =========================================================
   MAP PICKER
========================================================= */

function LocationPicker({
  onSelect,
}) {
  const [
    position,
    setPosition,
  ] =
    useState(null);

  /* =======================================================
     GET ADDRESS
  ======================================================= */

  const getAddress =
    async (
      lat,
      lng
    ) => {
      try {
        const res =
          await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
          );

        const data =
          await res.json();

        return (
          data?.display_name ||
          data?.name ||
          `${lat}, ${lng}`
        );
      } catch (
        err
      ) {
        console.error(
          "Geocoding error:",
          err
        );

        return `${lat}, ${lng}`;
      }
    };

  /* =======================================================
     MAP CLICK
  ======================================================= */

  useMapEvents({
    async click(
      event
    ) {
      const {
        lat,
        lng,
      } =
        event.latlng;

      setPosition({
        lat,
        lng,
      });

      const address =
        await getAddress(
          lat,
          lng
        );

      onSelect({
        address,
        lat,
        lng,
      });
    },
  });

  return position ? (
    <Marker
      position={
        position
      }
    />
  ) : null;
}

/* =========================================================
   MAIN
========================================================= */

function Children({
  setTab,
}) {
  /* =======================================================
     STATE
  ======================================================= */

  const [
    children,
    setChildren,
  ] =
    useState([]);

  const [
    showForm,
    setShowForm,
  ] =
    useState(false);

  const [
    editingChild,
    setEditingChild,
  ] =
    useState(null);

  const [
    mapType,
    setMapType,
  ] =
    useState(null);

  const [
    form,
    setForm,
  ] =
    useState(
      createEmptyForm()
    );

  const [
    loading,
    setLoading,
  ] =
    useState(false);

  const [
    fetching,
    setFetching,
  ] =
    useState(true);

  /* =======================================================
     APP DIALOG STATE
  ======================================================= */

  const [
    dialog,
    setDialog,
  ] =
    useState({
      open:
        false,

      type:
        "info",

      title:
        "",

      message:
        "",

      confirmText:
        "OK",

      cancelText:
        "Cancel",

      showCancel:
        false,

      onConfirm:
        null,
    });

  /* =======================================================
     SHOW MESSAGE
  ======================================================= */

  const showMessage =
    ({
      title =
        "ASANRIDES",

      message =
        "",

      type =
        "info",

      confirmText =
        "OK",
    }) => {
      setDialog({
        open:
          true,

        type,

        title,

        message,

        confirmText,

        cancelText:
          "Cancel",

        showCancel:
          false,

        onConfirm:
          null,
      });
    };

  /* =======================================================
     SHOW CONFIRMATION
  ======================================================= */

  const showConfirm =
    ({
      title =
        "Please Confirm",

      message =
        "",

      type =
        "warning",

      confirmText =
        "Confirm",

      cancelText =
        "Cancel",

      onConfirm,
    }) => {
      setDialog({
        open:
          true,

        type,

        title,

        message,

        confirmText,

        cancelText,

        showCancel:
          true,

        onConfirm:
          typeof onConfirm ===
          "function"
            ? onConfirm
            : null,
      });
    };

  /* =======================================================
     CLOSE DIALOG
  ======================================================= */

  const closeDialog =
    () => {
      setDialog(
        (
          previous
        ) => ({
          ...previous,

          open:
            false,

          onConfirm:
            null,
        })
      );
    };

  /* =======================================================
     CONFIRM DIALOG
  ======================================================= */

  const confirmDialog =
    async () => {
      const callback =
        dialog.onConfirm;

      closeDialog();

      if (
        typeof callback ===
        "function"
      ) {
        await callback();
      }
    };

  /* =======================================================
     LOAD CHILDREN
  ======================================================= */

  useEffect(() => {
    fetchChildren();
  }, []);

  /* =======================================================
     FETCH CHILDREN
  ======================================================= */

  const fetchChildren =
    async () => {
      try {
        setFetching(
          true
        );

        const storedParent =
          localStorage.getItem(
            "parent"
          );

        if (
          !storedParent
        ) {
          setChildren([]);

          return;
        }

        let parent =
          null;

        try {
          parent =
            JSON.parse(
              storedParent
            );
        } catch {
          parent =
            null;
        }

        if (
          !parent?._id
        ) {
          setChildren([]);

          return;
        }

        const res =
          await API.get(
            `/children/parent/${parent._id}`
          );

        const data =
          Array.isArray(
            res.data?.data
          )
            ? res.data.data
            : [];

        setChildren(
          data
        );
      } catch (
        err
      ) {
        console.error(
          "Fetch children error:",
          err?.response
            ?.data ||
            err
        );

        showMessage({
          type:
            "error",

          title:
            "Unable to Load Children",

          message:
            err?.response
              ?.data
              ?.message ||
            "We couldn't load your children's information. Please try again.",
        });
      } finally {
        setFetching(
          false
        );
      }
    };

  /* =======================================================
     OPEN ADD CHILD
  ======================================================= */

  const openAddChild =
    () => {
      setEditingChild(
        null
      );

      setForm(
        createEmptyForm()
      );

      setMapType(
        null
      );

      setShowForm(
        true
      );
    };

  /* =======================================================
     OPEN EDIT CHILD
  ======================================================= */

  const handleEdit =
    (
      child
    ) => {
      setEditingChild(
        child
      );

      setForm({
        name:
          child?.name ||
          "",

        age:
          child?.age ||
          "",

        gender:
          child?.gender ||
          "",

        school:
          child?.school ||
          "",

        grade:
          child?.grade ||
          "",

        section:
          child?.section ||
          "",

        pickupTime:
          child?.pickupTime ||
          "",

        eveningPickup:
          child?.eveningPickup ||
          "",

        pickupLocation:
          child?.pickupLocation ||
          "",

        dropoffLocation:
          child?.dropoffLocation ||
          "",

        pickupCoords: {
          lat:
            child
              ?.location
              ?.lat ??
            null,

          lng:
            child
              ?.location
              ?.lng ??
            null,
        },

        dropoffCoords: {
          lat:
            child
              ?.dropLocationCoords
              ?.lat ??
            null,

          lng:
            child
              ?.dropLocationCoords
              ?.lng ??
            null,
        },

        medicalNotes:
          child
            ?.medicalNotes ||
          "",

        emergencyContact:
          child
            ?.emergencyContact ||
          "",
      });

      setMapType(
        null
      );

      setShowForm(
        true
      );
    };

  /* =======================================================
     CLOSE FORM
  ======================================================= */

  const closeForm =
    () => {
      if (
        loading
      ) {
        return;
      }

      setShowForm(
        false
      );

      setEditingChild(
        null
      );

      setForm(
        createEmptyForm()
      );

      setMapType(
        null
      );
    };

  /* =======================================================
     UPDATE FORM
  ======================================================= */

  const updateForm =
    (
      key,
      value
    ) => {
      setForm(
        (
          previous
        ) => ({
          ...previous,

          [key]:
            value,
        })
      );
    };

  /* =======================================================
     VALIDATE FORM
  ======================================================= */

  const validateForm =
    () => {
      if (
        !form.name.trim()
      ) {
        showMessage({
          type:
            "warning",

          title:
            "Child Name Required",

          message:
            "Please enter the child's full name.",
        });

        return false;
      }

      const age =
        Number(
          form.age
        );

      if (
        !Number.isInteger(
          age
        ) ||
        age < 1 ||
        age > 17
      ) {
        showMessage({
          type:
            "warning",

          title:
            "Invalid Age",

          message:
            "Please enter a valid age between 1 and 17 years.",
        });

        return false;
      }

      if (
        !form.school.trim()
      ) {
        showMessage({
          type:
            "warning",

          title:
            "School Required",

          message:
            "Please enter the child's school name.",
        });

        return false;
      }

      if (
        !form.grade.trim()
      ) {
        showMessage({
          type:
            "warning",

          title:
            "Class Required",

          message:
            "Please enter the child's class or grade.",
        });

        return false;
      }

      if (
        !form.pickupTime
      ) {
        showMessage({
          type:
            "warning",

          title:
            "Home Pickup Time Required",

          message:
            "Please select the pickup time from home.",
        });

        return false;
      }

      if (
        !form.eveningPickup
      ) {
        showMessage({
          type:
            "warning",

          title:
            "School Pickup Time Required",

          message:
            "Please select the pickup time from school.",
        });

        return false;
      }

      if (
        !String(
          form.pickupLocation ||
          ""
        ).trim()
      ) {
        showMessage({
          type:
            "warning",

          title:
            "Home Location Required",

          message:
            "Please select the child's pickup location.",
        });

        return false;
      }

      if (
        form.pickupCoords
          ?.lat ===
          null ||
        form.pickupCoords
          ?.lat ===
          undefined ||
        form.pickupCoords
          ?.lng ===
          null ||
        form.pickupCoords
          ?.lng ===
          undefined
      ) {
        showMessage({
          type:
            "warning",

          title:
            "Exact Home Location Required",

          message:
            "Please select the exact home pickup point on the map.",
        });

        return false;
      }

      if (
        !String(
          form.dropoffLocation ||
          ""
        ).trim()
      ) {
        showMessage({
          type:
            "warning",

          title:
            "School Location Required",

          message:
            "Please select the child's school location.",
        });

        return false;
      }

      if (
        form.dropoffCoords
          ?.lat ===
          null ||
        form.dropoffCoords
          ?.lat ===
          undefined ||
        form.dropoffCoords
          ?.lng ===
          null ||
        form.dropoffCoords
          ?.lng ===
          undefined
      ) {
        showMessage({
          type:
            "warning",

          title:
            "Exact School Location Required",

          message:
            "Please select the exact school location on the map.",
        });

        return false;
      }

      if (
        form.emergencyContact &&
        !/^[6-9]\d{9}$/.test(
          form.emergencyContact
        )
      ) {
        showMessage({
          type:
            "warning",

          title:
            "Invalid Emergency Contact",

          message:
            "Please enter a valid 10-digit mobile number.",
        });

        return false;
      }

      return true;
    };

  /* =======================================================
     CREATE PAYLOAD
  ======================================================= */

  const createPayload =
    (
      includeParent =
        false
    ) => {
      const payload =
        {
          name:
            form.name.trim(),

          age:
            Number(
              form.age
            ),

          gender:
            form.gender,

          school:
            form.school.trim(),

          grade:
            form.grade.trim(),

          section:
            form.section.trim(),

          pickupTime:
            form.pickupTime,

          eveningPickup:
            form.eveningPickup,

          pickupLocation:
            form.pickupLocation,

          dropoffLocation:
            form.dropoffLocation,

          location: {
            lat:
              form
                .pickupCoords
                .lat,

            lng:
              form
                .pickupCoords
                .lng,
          },

          dropLocationCoords:
            {
              lat:
                form
                  .dropoffCoords
                  .lat,

              lng:
                form
                  .dropoffCoords
                  .lng,
            },

          medicalNotes:
            form
              .medicalNotes
              .trim(),

          emergencyContact:
            form
              .emergencyContact,
        };

      if (
        includeParent
      ) {
        const storedParent =
          localStorage.getItem(
            "parent"
          );

        let parent =
          null;

        if (
          storedParent
        ) {
          try {
            parent =
              JSON.parse(
                storedParent
              );
          } catch {
            parent =
              null;
          }
        }

        payload.parentId =
          parent?._id;

        if (
          parent?.driverId
        ) {
          payload.driverId =
            parent.driverId;
        }
      }

      return payload;
    };

  /* =======================================================
     SUBMIT
  ======================================================= */

  const handleSubmit =
    async () => {
      if (
        !validateForm()
      ) {
        return;
      }

      try {
        setLoading(
          true
        );

        const storedParent =
          localStorage.getItem(
            "parent"
          );

        let parent =
          null;

        if (
          storedParent
        ) {
          try {
            parent =
              JSON.parse(
                storedParent
              );
          } catch {
            parent =
              null;
          }
        }

        if (
          !parent?._id
        ) {
          showMessage({
            type:
              "error",

            title:
              "Session Error",

            message:
              "Your Parent account information is unavailable. Please sign in again.",
          });

          return;
        }

        /* =================================================
           EDIT CHILD
        ================================================= */

        if (
          editingChild?._id
        ) {
          const payload =
            createPayload(
              false
            );

          const res =
            await API.put(
              `/children/${editingChild._id}`,

              payload
            );

          const updatedChild =
            res.data?.data;

          if (
            updatedChild
          ) {
            setChildren(
              (
                previous
              ) =>
                previous.map(
                  (
                    child
                  ) =>
                    child._id ===
                    editingChild._id
                      ? updatedChild
                      : child
                )
            );
          } else {
            await fetchChildren();
          }

          setEditingChild(
            null
          );

          setForm(
            createEmptyForm()
          );

          setShowForm(
            false
          );

          setMapType(
            null
          );

          showMessage({
            type:
              "success",

            title:
              "Child Updated",

            message:
              "The child's information and ride details were updated successfully.",
          });

          return;
        }

        /* =================================================
           ADD CHILD
        ================================================= */

        const payload =
          createPayload(
            true
          );

        const res =
          await API.post(
            "/children/add",

            payload
          );

        const savedChild =
          res.data?.data;

        if (
          savedChild
        ) {
          setChildren(
            (
              previous
            ) => [
              ...previous,

              savedChild,
            ]
          );
        } else {
          await fetchChildren();
        }

        setForm(
          createEmptyForm()
        );

        setEditingChild(
          null
        );

        setShowForm(
          false
        );

        setMapType(
          null
        );

        showMessage({
          type:
            "success",

          title:
            "Child Added",

          message:
            "The child profile and transportation details were saved successfully.",
        });
      } catch (
        err
      ) {
        console.error(
          editingChild
            ? "Update child error:"
            : "Add child error:",

          err?.response
            ?.data ||
            err
        );

        showMessage({
          type:
            "error",

          title:
            editingChild
              ? "Update Failed"
              : "Unable to Add Child",

          message:
            err?.response
              ?.data
              ?.message ||
            (editingChild
              ? "The child's details could not be updated. Please try again."
              : "The child could not be added. Please try again."),
        });
      } finally {
        setLoading(
          false
        );
      }
    };

  /* =======================================================
     DELETE CHILD
  ======================================================= */

  const handleDelete =
    (
      id
    ) => {
      if (
        !id
      ) {
        return;
      }

      showConfirm({
        type:
          "danger",

        title:
          "Delete Child?",

        message:
          "This child profile and its saved ride information will be permanently removed. This action cannot be undone.",

        confirmText:
          "Delete",

        cancelText:
          "Keep Child",

        onConfirm:
          async () => {
            try {
              await API.delete(
                `/children/${id}`
              );

              setChildren(
                (
                  previous
                ) =>
                  previous.filter(
                    (
                      child
                    ) =>
                      child._id !==
                      id
                  )
              );

              showMessage({
                type:
                  "success",

                title:
                  "Child Removed",

                message:
                  "The child profile was deleted successfully.",
              });
            } catch (
              err
            ) {
              console.error(
                "Delete child error:",

                err?.response
                  ?.data ||
                  err
              );

              showMessage({
                type:
                  "error",

                title:
                  "Delete Failed",

                message:
                  err?.response
                    ?.data
                    ?.message ||
                  "The child profile could not be deleted. Please try again.",
              });
            }
          },
      });
    };

  /* =======================================================
     ADD / EDIT CHILD SCREEN
  ======================================================= */

  if (
    showForm
  ) {
    return (
      <>
        <div
          className="
            flex
            min-h-screen
            justify-center
            bg-[#FFF9EE]
          "
        >
          <div
            className="
              min-h-screen
              w-full
              max-w-[475px]
              pb-6
            "
          >
            {/* =================================================
                TOP BAR
            ================================================= */}

            <div
              className="
                sticky
                top-0
                z-30
                border-b
                border-[#F0E7CD]
                bg-[#FFFCF4]/95
                px-4
                py-4
                backdrop-blur-xl
              "
            >
              <button
                type="button"
                onClick={
                  closeForm
                }
                className="
                  flex
                  items-center
                  gap-2
                  text-black
                "
              >
                <div
                  className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-[13px]
                    border
                    border-[#EEDFAE]
                    bg-white
                    text-[#A87300]
                    shadow-[0_4px_12px_rgba(91,71,14,0.05)]
                  "
                >
                  <ArrowLeft
                    size={20}
                  />
                </div>

                <span
                  className="
                    text-[13px]
                    font-semibold
                  "
                >
                  Back
                </span>
              </button>
            </div>

            {/* =================================================
                FORM CONTENT
            ================================================= */}

            <div
              className="
                px-4
                pt-6
              "
            >
              {/* =================================================
                  TITLE
              ================================================= */}

              <div
                className="
                  mb-7
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
                    Child Profile
                  </span>

                  <div
                    className="
                      h-[3px]
                      w-7
                      rounded-full
                      bg-[#FFB000]
                    "
                  />
                </div>

                <h1
                  className="
                    text-[26px]
                    font-extrabold
                    tracking-[-0.5px]
                    text-black
                  "
                >
                  {editingChild
                    ? "Edit Child"
                    : "Add Child"}
                </h1>

                <p
                  className="
                    mt-2
                    max-w-[330px]
                    text-[11px]
                    leading-5
                    text-zinc-500
                  "
                >
                  Add school,
                  schedule and safety
                  information for your
                  child.
                </p>
              </div>

              {/* =================================================
                  BASIC INFORMATION
              ================================================= */}

              <FormSectionTitle
                title="Basic Information"
              />

              <CleanField
                label="Full Name"
                icon={
                  <User
                    size={18}
                  />
                }
              >
                <input
                  type="text"
                  value={
                    form.name
                  }
                  onChange={(
                    event
                  ) =>
                    updateForm(
                      "name",
                      event
                        .target
                        .value
                    )
                  }
                  placeholder="Enter child's full name"
                  className="clean-input"
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
                  label="Age"
                  icon={
                    <CalendarDays
                      size={18}
                    />
                  }
                >
                  <input
                    type="number"
                    inputMode="numeric"
                    min="1"
                    max="17"
                    value={
                      form.age
                    }
                    onChange={(
                      event
                    ) =>
                      updateForm(
                        "age",
                        event
                          .target
                          .value
                      )
                    }
                    placeholder="Age"
                    className="clean-input"
                  />
                </CleanField>

                <CleanField
                  label="Gender"
                  icon={
                    <Users
                      size={18}
                    />
                  }
                >
                  <select
                    value={
                      form.gender
                    }
                    onChange={(
                      event
                    ) =>
                      updateForm(
                        "gender",
                        event
                          .target
                          .value
                      )
                    }
                    className="
                      clean-input
                      clean-select
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
                  <School
                    size={18}
                  />
                }
              >
                <input
                  type="text"
                  value={
                    form.school
                  }
                  onChange={(
                    event
                  ) =>
                    updateForm(
                      "school",
                      event
                        .target
                        .value
                    )
                  }
                  placeholder="Enter school name"
                  className="clean-input"
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
                    <GraduationCap
                      size={18}
                    />
                  }
                >
                  <input
                    type="text"
                    value={
                      form.grade
                    }
                    onChange={(
                      event
                    ) =>
                      updateForm(
                        "grade",
                        event
                          .target
                          .value
                      )
                    }
                    placeholder="Grade"
                    className="clean-input"
                  />
                </CleanField>

                <CleanField
                  label="Section"
                  optional
                  icon={
                    <Bookmark
                      size={18}
                    />
                  }
                >
                  <input
                    type="text"
                    value={
                      form.section
                    }
                    onChange={(
                      event
                    ) =>
                      updateForm(
                        "section",
                        event
                          .target
                          .value
                      )
                    }
                    placeholder="Section"
                    className="clean-input"
                  />
                </CleanField>
              </div>

              {/* =================================================
                  RIDE INFORMATION
              ================================================= */}

              <FormSectionTitle
                title="Ride Information"
              />

              <FormGroupTitle
                title="HOME"
              />

              <div
                className="
                  clean-stack-card
                "
              >
                <button
                  type="button"
                  onClick={() =>
                    setMapType(
                      "pickup"
                    )
                  }
                  className="
                    clean-stack-row
                  "
                >
                  <div
                    className="
                      clean-stack-icon
                    "
                  >
                    <MapPin
                      size={18}
                    />
                  </div>

                  <div
                    className="
                      min-w-0
                      flex-1
                      text-left
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
                          form.pickupLocation
                            ? "text-black"
                            : "text-zinc-400"
                        }
                      `}
                    >
                      {form.pickupLocation ||
                        "Select pickup address"}
                    </p>
                  </div>

                  {form
                    .pickupCoords
                    ?.lat !==
                    null ? (
                    <CheckCircle2
                      size={18}
                      className="
                        text-green-500
                      "
                    />
                  ) : (
                    <ChevronRight
                      size={19}
                      className="
                        text-zinc-400
                      "
                    />
                  )}
                </button>

                <div
                  className="
                    clean-stack-divider
                  "
                />

                <div
                  className="
                    clean-stack-row
                  "
                >
                  <div
                    className="
                      clean-stack-icon
                    "
                  >
                    <Clock3
                      size={18}
                    />
                  </div>

                  <div
                    className="
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
                        form.pickupTime
                      }
                      onChange={(
                        event
                      ) =>
                        updateForm(
                          "pickupTime",
                          event
                            .target
                            .value
                        )
                      }
                      className="
                        clean-time-input
                      "
                    />
                  </div>
                </div>
              </div>

              <FormGroupTitle
                title="SCHOOL"
              />

              <div
                className="
                  clean-stack-card
                "
              >
                <button
                  type="button"
                  onClick={() =>
                    setMapType(
                      "drop"
                    )
                  }
                  className="
                    clean-stack-row
                  "
                >
                  <div
                    className="
                      clean-stack-icon
                    "
                  >
                    <School
                      size={18}
                    />
                  </div>

                  <div
                    className="
                      min-w-0
                      flex-1
                      text-left
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
                          form.dropoffLocation
                            ? "text-black"
                            : "text-zinc-400"
                        }
                      `}
                    >
                      {form.dropoffLocation ||
                        "Select school address"}
                    </p>
                  </div>

                  {form
                    .dropoffCoords
                    ?.lat !==
                    null ? (
                    <CheckCircle2
                      size={18}
                      className="
                        text-green-500
                      "
                    />
                  ) : (
                    <ChevronRight
                      size={19}
                      className="
                        text-zinc-400
                      "
                    />
                  )}
                </button>

                <div
                  className="
                    clean-stack-divider
                  "
                />

                <div
                  className="
                    clean-stack-row
                  "
                >
                  <div
                    className="
                      clean-stack-icon
                    "
                  >
                    <Clock3
                      size={18}
                    />
                  </div>

                  <div
                    className="
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
                        form.eveningPickup
                      }
                      onChange={(
                        event
                      ) =>
                        updateForm(
                          "eveningPickup",
                          event
                            .target
                            .value
                        )
                      }
                      className="
                        clean-time-input
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
                  <HeartPulse
                    size={18}
                  />
                }
              >
                <input
                  type="text"
                  value={
                    form.medicalNotes
                  }
                  onChange={(
                    event
                  ) =>
                    updateForm(
                      "medicalNotes",
                      event
                        .target
                        .value
                    )
                  }
                  placeholder="Medical conditions or notes"
                  className="clean-input"
                />
              </CleanField>

              <CleanField
                label="Emergency Contact"
                optional
                icon={
                  <Phone
                    size={18}
                  />
                }
              >
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={
                    form.emergencyContact
                  }
                  onChange={(
                    event
                  ) =>
                    updateForm(
                      "emergencyContact",

                      event
                        .target
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
                  className="clean-input"
                />
              </CleanField>

              {/* =================================================
                  SAVE / UPDATE
              ================================================= */}

              <div
                className="
                  mt-7
                  pb-8
                "
              >
                <button
                  type="button"
                  disabled={
                    loading
                  }
                  onClick={
                    handleSubmit
                  }
                  className="
                    flex
                    h-[56px]
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-[16px]
                    bg-[#FFB000]
                    text-[14px]
                    font-extrabold
                    text-black
                    shadow-[0_10px_24px_rgba(255,176,0,0.20)]
                    transition
                    hover:bg-[#F4A900]
                    active:scale-[0.99]
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >
                  <Save
                    size={19}
                    className="
                      text-[#8B6200]
                    "
                  />

                  {loading
                    ? editingChild
                      ? "UPDATING..."
                      : "SAVING..."
                    : editingChild
                      ? "UPDATE CHILD"
                      : "SAVE CHILD"}
                </button>

                <p
                  className="
                    mt-2
                    text-center
                    text-[8px]
                    leading-4
                    text-zinc-400
                  "
                >
                  Please verify the
                  child and ride details
                  before saving.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* =================================================
            MAP PICKER
        ================================================= */}

        {mapType && (
          <div
            className="
              fixed
              inset-0
              z-[200]
              bg-[#FFFDF7]
            "
          >
            <div
              className="
                absolute
                left-4
                right-4
                top-4
                z-[500]
                flex
                items-center
                gap-3
              "
            >
              <button
                type="button"
                onClick={() =>
                  setMapType(
                    null
                  )
                }
                className="
                  flex
                  h-11
                  w-11
                  shrink-0
                  items-center
                  justify-center
                  rounded-[14px]
                  border
                  border-[#F0E0A9]
                  bg-white
                  text-[#A87300]
                  shadow-lg
                "
              >
                <ArrowLeft
                  size={22}
                />
              </button>

              <div
                className="
                  flex
                  items-center
                  gap-2
                  rounded-[14px]
                  border
                  border-[#EFD78A]
                  bg-[#FFF4CA]
                  px-4
                  py-3
                  text-[12px]
                  font-semibold
                  text-black
                  shadow-lg
                "
              >
                <MapPinned
                  size={17}
                  className="
                    text-[#C78B00]
                  "
                />

                Tap the map to select{" "}
                {mapType ===
                "pickup"
                  ? "Home"
                  : "School"}
              </div>
            </div>

            <MapContainer
              center={[
                17.385,
                78.4867,
              ]}
              zoom={13}
              className="
                h-full
                w-full
              "
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <LocationPicker
                onSelect={(
                  data
                ) => {
                  setForm(
                    (
                      previous
                    ) => ({
                      ...previous,

                      [mapType ===
                      "pickup"
                        ? "pickupLocation"
                        : "dropoffLocation"]:
                        data.address,

                      [mapType ===
                      "pickup"
                        ? "pickupCoords"
                        : "dropoffCoords"]:
                        {
                          lat:
                            data.lat,

                          lng:
                            data.lng,
                        },
                    })
                  );

                  setMapType(
                    null
                  );
                }}
              />
            </MapContainer>
          </div>
        )}

        <AppDialog
          dialog={
            dialog
          }
          onClose={
            closeDialog
          }
          onConfirm={
            confirmDialog
          }
        />

        <ChildrenStyles />
      </>
    );
  }

  /* =======================================================
     CHILD MANAGEMENT SCREEN
  ======================================================= */

  return (
    <>
      <div
        className="
          relative
          flex
          min-h-screen
          justify-center
          overflow-hidden
          bg-[#FFF9EE]
          pb-28
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
          <div
            className="
              absolute
              -right-[110px]
              -top-[80px]
              h-[270px]
              w-[270px]
              rounded-full
              bg-[#FFF0B5]
              opacity-60
            "
          />

          <div
            className="
              absolute
              -left-[130px]
              top-[400px]
              h-[260px]
              w-[260px]
              rounded-full
              bg-[#FFF5D8]
            "
          />
        </div>

        <div
          className="
            relative
            z-10
            w-full
            max-w-[475px]
          "
        >
          {/* =================================================
              HEADER
          ================================================= */}

          <header
            className="
              px-5
              pb-5
              pt-7
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
                MY CHILDREN
              </span>

              <div
                className="
                  h-[3px]
                  w-7
                  rounded-full
                  bg-[#FFB000]
                "
              />
            </div>

            <div
              className="
                flex
                items-end
                justify-between
                gap-3
              "
            >
              <div>
                <h1
                  className="
                    text-[27px]
                    font-extrabold
                    tracking-[-0.6px]
                    text-black
                  "
                >
                  Child Management
                </h1>

                <p
                  className="
                    mt-1.5
                    text-[11px]
                    leading-5
                    text-zinc-500
                  "
                >
                  Manage your children,
                  school details and ride
                  schedules.
                </p>
              </div>

              {children.length >
                0 && (
                <div
                  className="
                    flex
                    h-[47px]
                    min-w-[47px]
                    items-center
                    justify-center
                    rounded-[15px]
                    border
                    border-[#ECD991]
                    bg-[#FFF6D6]
                    px-3
                  "
                >
                  <span
                    className="
                      text-[15px]
                      font-extrabold
                      text-black
                    "
                  >
                    {
                      children.length
                    }
                  </span>
                </div>
              )}
            </div>
          </header>

          {/* =================================================
              CONTENT
          ================================================= */}

          <main
            className="
              px-4
            "
          >
            {fetching ? (
              <div
                className="
                  rounded-[24px]
                  border
                  border-[#F0E2B4]
                  bg-white
                  p-7
                  text-center
                  shadow-[0_10px_30px_rgba(95,72,16,0.06)]
                "
              >
                <div
                  className="
                    mx-auto
                    h-9
                    w-9
                    animate-spin
                    rounded-full
                    border-[3px]
                    border-[#FFE49A]
                    border-t-[#FFB000]
                  "
                />

                <p
                  className="
                    mt-4
                    text-[12px]
                    font-semibold
                    text-zinc-500
                  "
                >
                  Loading children...
                </p>
              </div>
            ) : children.length ===
              0 ? (
              <div
                className="
                  rounded-[26px]
                  border
                  border-[#F0D682]
                  bg-white
                  p-8
                  text-center
                  shadow-[0_12px_32px_rgba(92,69,10,0.07)]
                "
              >
                <div
                  className="
                    mx-auto
                    flex
                    h-[72px]
                    w-[72px]
                    items-center
                    justify-center
                    rounded-[22px]
                    bg-[#FFF4CF]
                    text-[#B77D00]
                  "
                >
                  <User
                    size={31}
                  />
                </div>

                <h2
                  className="
                    mt-5
                    text-[18px]
                    font-extrabold
                    text-black
                  "
                >
                  No children added yet
                </h2>

                <p
                  className="
                    mx-auto
                    mt-2
                    max-w-[260px]
                    text-[11px]
                    leading-5
                    text-zinc-500
                  "
                >
                  Add your child to
                  manage their school
                  transportation details.
                </p>

                <button
                  type="button"
                  onClick={
                    openAddChild
                  }
                  className="
                    mt-6
                    inline-flex
                    h-[48px]
                    items-center
                    justify-center
                    gap-2
                    rounded-[14px]
                    bg-[#FFB000]
                    px-6
                    font-bold
                    text-black
                    transition
                    hover:bg-[#F4A900]
                    active:scale-[0.98]
                  "
                >
                  <Plus
                    size={18}
                    className="
                      text-[#8B6200]
                    "
                  />

                  Add Child
                </button>
              </div>
            ) : (
              <div
                className="
                  space-y-3
                "
              >
                {children.map(
                  (
                    child,
                    index
                  ) => (
                    <ChildCard
                      key={
                        child._id ||
                        index
                      }
                      child={
                        child
                      }
                      index={
                        index
                      }
                      onEdit={() =>
                        handleEdit(
                          child
                        )
                      }
                      onDelete={() =>
                        handleDelete(
                          child._id
                        )
                      }
                    />
                  )
                )}

                <button
                  type="button"
                  onClick={
                    openAddChild
                  }
                  className="
                    flex
                    h-[54px]
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-[16px]
                    border
                    border-[#E8CC67]
                    bg-[#FFFDF6]
                    font-semibold
                    text-[#B67D00]
                    transition
                    hover:bg-[#FFF7DC]
                    active:scale-[0.99]
                  "
                >
                  <Plus
                    size={18}
                  />

                  Add Another Child
                </button>
              </div>
            )}
          </main>
        </div>

        <BottomNav
          active="children"
          setActive={
            setTab
          }
        />
      </div>

      <AppDialog
        dialog={
          dialog
        }
        onClose={
          closeDialog
        }
        onConfirm={
          confirmDialog
        }
      />

      <ChildrenStyles />
    </>
  );
}

/* =========================================================
   CHILD CARD
========================================================= */

function ChildCard({
  child,
  index,
  onEdit,
  onDelete,
}) {
  return (
    <div
      className="
        overflow-hidden
        rounded-[24px]
        border
        border-[#EFE6CD]
        bg-white
        shadow-[0_10px_30px_rgba(79,61,14,0.065)]
      "
    >
      <div
        className="
          h-[4px]
          w-full
          bg-[#FFB000]
        "
      />

      <div
        className="
          p-4
        "
      >
        <div
          className="
            flex
            items-start
            gap-3
          "
        >
          <div
            className="
              flex
              h-[70px]
              w-[70px]
              shrink-0
              items-center
              justify-center
              overflow-hidden
              rounded-[21px]
              border
              border-[#FFE39A]
              bg-[#FFF2C5]
              text-[#B77D00]
            "
          >
            {child
              ?.profilePhoto ? (
              <img
                src={
                  child
                    .profilePhoto
                }
                alt={
                  child.name
                }
                className="
                  h-full
                  w-full
                  object-cover
                "
              />
            ) : (
              <User
                size={31}
                strokeWidth={1.7}
              />
            )}
          </div>

          <div
            className="
              min-w-0
              flex-1
            "
          >
            <div
              className="
                flex
                items-start
                justify-between
                gap-2
              "
            >
              <div
                className="
                  min-w-0
                "
              >
                <h2
                  className="
                    truncate
                    text-[17px]
                    font-extrabold
                    text-black
                  "
                >
                  {child?.name ||
                    `Child ${
                      index +
                      1
                    }`}
                </h2>

                {(child?.age ||
                  child
                    ?.gender) && (
                  <p
                    className="
                      mt-1
                      text-[10px]
                      text-zinc-400
                    "
                  >
                    {child?.age
                      ? `${child.age} years`
                      : ""}

                    {child?.age &&
                    child?.gender
                      ? " • "
                      : ""}

                    {child
                      ?.gender ||
                      ""}
                  </p>
                )}
              </div>

              <div
                className="
                  flex
                  items-center
                  gap-1
                "
              >
                <button
                  type="button"
                  onClick={
                    onEdit
                  }
                  className="
                    flex
                    h-9
                    items-center
                    gap-1.5
                    rounded-[11px]
                    bg-[#FFF6D9]
                    px-3
                    text-[11px]
                    font-semibold
                    text-black
                    transition
                    hover:bg-[#FFEFB8]
                  "
                >
                  <Pencil
                    size={13}
                    className="
                      text-[#B77D00]
                    "
                  />

                  Edit
                </button>

                <button
                  type="button"
                  onClick={
                    onDelete
                  }
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-[11px]
                    text-red-500
                    transition
                    hover:bg-red-50
                  "
                  aria-label="Delete child"
                >
                  <Trash2
                    size={15}
                  />
                </button>
              </div>
            </div>

            <div
              className="
                mt-3
                flex
                items-center
                gap-2
              "
            >
              <div
                className="
                  flex
                  h-7
                  w-7
                  items-center
                  justify-center
                  rounded-[9px]
                  bg-[#FFF5D5]
                  text-[#D69900]
                "
              >
                <GraduationCap
                  size={14}
                />
              </div>

              <span
                className="
                  text-[11px]
                  font-semibold
                  text-black
                "
              >
                {child?.grade
                  ? `Class ${child.grade}${
                      child?.section
                        ? ` - ${child.section}`
                        : ""
                    }`
                  : "Class not added"}
              </span>
            </div>

            <div
              className="
                mt-2
                flex
                min-w-0
                items-center
                gap-2
              "
            >
              <div
                className="
                  flex
                  h-7
                  w-7
                  shrink-0
                  items-center
                  justify-center
                  rounded-[9px]
                  bg-[#FFF5D5]
                  text-[#D69900]
                "
              >
                <School
                  size={13}
                />
              </div>

              <span
                className="
                  truncate
                  text-[10px]
                  text-zinc-500
                "
              >
                {child?.school ||
                  "School not added"}
              </span>
            </div>
          </div>
        </div>

        <div
          className="
            my-4
            h-px
            bg-[#F1EAD8]
          "
        />

        <div
          className="
            grid
            grid-cols-2
            gap-3
          "
        >
          <RideTime
            label="Pickup from Home"
            time={
              child?.pickupTime
            }
          />

          <RideTime
            label="Pickup from School"
            time={
              child
                ?.eveningPickup
            }
          />
        </div>

        {(child
          ?.pickupLocation ||
          child
            ?.dropoffLocation) && (
          <div
            className="
              mt-4
              rounded-[16px]
              border
              border-[#F1E4BA]
              bg-[#FFFCF2]
              px-3
              py-3
            "
          >
            {child
              ?.pickupLocation && (
              <div
                className="
                  flex
                  items-start
                  gap-2
                "
              >
                <MapPin
                  size={14}
                  className="
                    mt-[2px]
                    shrink-0
                    text-[#D89900]
                  "
                />

                <p
                  className="
                    line-clamp-1
                    text-[9px]
                    leading-4
                    text-zinc-500
                  "
                >
                  {
                    child
                      .pickupLocation
                  }
                </p>
              </div>
            )}

            {child
              ?.dropoffLocation && (
              <div
                className="
                  mt-2
                  flex
                  items-start
                  gap-2
                "
              >
                <School
                  size={14}
                  className="
                    mt-[2px]
                    shrink-0
                    text-[#D89900]
                  "
                />

                <p
                  className="
                    line-clamp-1
                    text-[9px]
                    leading-4
                    text-zinc-500
                  "
                >
                  {
                    child
                      .dropoffLocation
                  }
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   RIDE TIME
========================================================= */

function RideTime({
  label,
  time,
}) {
  return (
    <div
      className="
        rounded-[15px]
        border
        border-[#F1E6C5]
        bg-[#FFFDF7]
        p-3
      "
    >
      <div
        className="
          mb-2
          flex
          h-8
          w-8
          items-center
          justify-center
          rounded-[10px]
          bg-[#FFF4CE]
          text-[#D99A00]
        "
      >
        <Clock3
          size={15}
        />
      </div>

      <p
        className="
          text-[9px]
          leading-4
          text-zinc-400
        "
      >
        {
          label
        }
      </p>

      <p
        className="
          mt-1
          text-[14px]
          font-extrabold
          text-black
        "
      >
        {formatTime(
          time
        )}
      </p>
    </div>
  );
}

/* =========================================================
   SECTION TITLE
========================================================= */

function FormSectionTitle({
  title,
}) {
  return (
    <div
      className="
        mb-4
        mt-2
        flex
        items-center
        gap-2
      "
    >
      <span
        className="
          h-[7px]
          w-[7px]
          rounded-full
          bg-[#FFB000]
        "
      />

      <h2
        className="
          text-[13px]
          font-bold
          text-black
        "
      >
        {
          title
        }
      </h2>

      <div
        className="
          h-px
          flex-1
          bg-[#F0E3B9]
        "
      />
    </div>
  );
}

/* =========================================================
   CLEAN FIELD
========================================================= */

function CleanField({
  label,
  optional = false,
  icon,
  children,
}) {
  return (
    <div
      className="
        mb-5
      "
    >
      <label
        className="
          mb-2
          block
          text-[12px]
          font-semibold
          text-black
        "
      >
        {
          label
        }

        {optional && (
          <span
            className="
              ml-1
              font-normal
              text-zinc-400
            "
          >
            (Optional)
          </span>
        )}
      </label>

      <div
        className="
          relative
          flex
          h-[54px]
          items-center
          rounded-[14px]
          border
          border-[#E9E4D8]
          bg-white
          transition
          focus-within:border-[#FFB000]
          focus-within:ring-4
          focus-within:ring-[#FFB000]/10
        "
      >
        <div
          className="
            pointer-events-none
            absolute
            left-4
            z-10
            flex
            items-center
            justify-center
            text-[#A87300]
          "
        >
          {
            icon
          }
        </div>

        {
          children
        }
      </div>
    </div>
  );
}

/* =========================================================
   FORM GROUP TITLE
========================================================= */

function FormGroupTitle({
  title,
}) {
  return (
    <div
      className="
        mb-2
        mt-1
      "
    >
      <p
        className="
          text-[12px]
          font-semibold
          text-black
        "
      >
        {
          title
        }
      </p>
    </div>
  );
}

/* =========================================================
   ASAN APP DIALOG
========================================================= */

function AppDialog({
  dialog,
  onClose,
  onConfirm,
}) {
  if (
    !dialog?.open
  ) {
    return null;
  }

  const configs = {
    success: {
      icon:
        CheckCircle2,

      iconBg:
        "bg-emerald-50",

      iconColor:
        "text-emerald-600",

      accent:
        "bg-emerald-500",

      eyebrow:
        "Success",
    },

    warning: {
      icon:
        AlertTriangle,

      iconBg:
        "bg-[#FFF4CF]",

      iconColor:
        "text-[#C68A00]",

      accent:
        "bg-[#FFB000]",

      eyebrow:
        "Attention",
    },

    error: {
      icon:
        CircleAlert,

      iconBg:
        "bg-red-50",

      iconColor:
        "text-red-500",

      accent:
        "bg-red-500",

      eyebrow:
        "Something Went Wrong",
    },

    danger: {
      icon:
        Trash2,

      iconBg:
        "bg-red-50",

      iconColor:
        "text-red-500",

      accent:
        "bg-red-500",

      eyebrow:
        "Confirmation Required",
    },

    info: {
      icon:
        Info,

      iconBg:
        "bg-[#FFF4CF]",

      iconColor:
        "text-[#B77D00]",

      accent:
        "bg-[#FFB000]",

      eyebrow:
        "ASANRIDES",
    },
  };

  const current =
    configs[
      dialog.type
    ] ||
    configs.info;

  const DialogIcon =
    current.icon;

  const danger =
    dialog.type ===
      "danger" ||
    dialog.type ===
      "error";

  return (
    <div
      className="
        fixed
        inset-0
        z-[99999]
        flex
        items-end
        justify-center
        bg-black/40
        px-4
        pb-[max(20px,env(safe-area-inset-bottom))]
        pt-16
        backdrop-blur-[3px]
        sm:items-center
      "
    >
      <div
        className="
          dialog-enter
          w-full
          max-w-[390px]
          overflow-hidden
          rounded-[28px]
          border
          border-[#EFE5C8]
          bg-white
          shadow-[0_28px_80px_rgba(20,14,2,0.28)]
        "
      >
        <div
          className={`
            h-[5px]
            w-full

            ${current.accent}
          `}
        />

        <div
          className="
            p-5
          "
        >
          <div
            className="
              flex
              items-start
              gap-4
            "
          >
            <div
              className={`
                flex
                h-[52px]
                w-[52px]
                shrink-0
                items-center
                justify-center
                rounded-[17px]

                ${current.iconBg}
                ${current.iconColor}
              `}
            >
              <DialogIcon
                size={23}
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
                  tracking-[1.5px]
                  text-[#B77D00]
                "
              >
                {
                  current.eyebrow
                }
              </p>

              <h3
                className="
                  mt-1
                  text-[19px]
                  font-extrabold
                  tracking-[-0.3px]
                  text-black
                "
              >
                {
                  dialog.title
                }
              </h3>

              <p
                className="
                  mt-2
                  text-[11px]
                  font-medium
                  leading-[19px]
                  text-zinc-500
                "
              >
                {
                  dialog.message
                }
              </p>
            </div>
          </div>

          <div
            className={`
              mt-6
              grid
              gap-2.5

              ${
                dialog.showCancel
                  ? "grid-cols-2"
                  : "grid-cols-1"
              }
            `}
          >
            {dialog.showCancel && (
              <button
                type="button"
                onClick={
                  onClose
                }
                className="
                  flex
                  h-[52px]
                  items-center
                  justify-center
                  rounded-[16px]
                  border
                  border-[#E9E1CD]
                  bg-[#FFFDF8]
                  px-3
                  text-[11px]
                  font-extrabold
                  text-zinc-600
                  transition
                  active:scale-[0.98]
                "
              >
                {
                  dialog.cancelText ||
                  "Cancel"
                }
              </button>
            )}

            <button
              type="button"
              onClick={
                dialog.showCancel
                  ? onConfirm
                  : onClose
              }
              className={`
                flex
                h-[52px]
                items-center
                justify-center
                rounded-[16px]
                px-3
                text-[11px]
                font-extrabold
                transition
                active:scale-[0.98]

                ${
                  danger
                    ? `
                      bg-red-500
                      text-white
                      shadow-[0_8px_20px_rgba(239,68,68,0.22)]
                    `
                    : `
                      bg-[#FFB000]
                      text-black
                      shadow-[0_8px_20px_rgba(255,176,0,0.20)]
                    `
                }
              `}
            >
              {
                dialog.confirmText ||
                "OK"
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   CSS
========================================================= */

function ChildrenStyles() {
  return (
    <style>{`
      .clean-input {
        width: 100%;
        height: 100%;

        min-width: 0;

        padding-left: 46px;
        padding-right: 12px;

        border: none;
        outline: none;

        background: transparent;

        font-size: 12px;
        font-weight: 500;

        color: #111111;
      }

      .clean-input::placeholder {
        color: #A1A1AA;
      }

      .clean-select {
        cursor: pointer;
        color: #52525B;
      }

      .clean-stack-card {
        width: 100%;

        overflow: hidden;

        margin-bottom: 23px;

        border: 1px solid #EEE3C1;

        border-radius: 17px;

        background: #FFFFFF;

        box-shadow:
          0 7px 22px
          rgba(
            92,
            72,
            16,
            0.035
          );
      }

      .clean-stack-row {
        width: 100%;

        min-height: 66px;

        display: flex;

        align-items: center;

        gap: 12px;

        padding: 10px 14px;

        border: none;

        background: #FFFFFF;

        color: #111111;
      }

      button.clean-stack-row:hover {
        background: #FFFDF7;
      }

      .clean-stack-icon {
        width: 36px;
        height: 36px;

        flex-shrink: 0;

        display: flex;

        align-items: center;

        justify-content: center;

        border-radius: 11px;

        background: #FFF4CF;

        color: #C88C00;
      }

      .clean-stack-divider {
        height: 1px;

        margin-left: 62px;

        background: #F0E9D6;
      }

      .clean-time-input {
        width: 100%;

        border: none;
        outline: none;

        background: transparent;

        font-size: 14px;

        font-weight: 700;

        color: #111111;
      }

      @keyframes dialogEnter {
        from {
          opacity: 0;
          transform:
            translateY(20px)
            scale(0.97);
        }

        to {
          opacity: 1;
          transform:
            translateY(0)
            scale(1);
        }
      }

      .dialog-enter {
        animation:
          dialogEnter
          0.22s
          ease-out;
      }
    `}</style>
  );
}

/* =========================================================
   FORMAT TIME
========================================================= */

function formatTime(
  time
) {
  if (
    !time
  ) {
    return "--:--";
  }

  const [
    hour,
    minute,
  ] =
    time.split(
      ":"
    );

  if (
    hour ===
      undefined ||
    minute ===
      undefined
  ) {
    return time;
  }

  const hourNumber =
    Number(
      hour
    );

  const period =
    hourNumber >=
    12
      ? "PM"
      : "AM";

  const formattedHour =
    hourNumber %
      12 ||
    12;

  return `${String(
    formattedHour
  ).padStart(
    2,
    "0"
  )}:${minute} ${period}`;
}

export default Children;