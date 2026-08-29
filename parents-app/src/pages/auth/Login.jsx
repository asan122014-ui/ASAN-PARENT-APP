import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  API,
  setAccessToken,
} from "../../api/api";

import {
  linkDriver,
} from "../../api/parentApi";

import MapPicker from "../../components/MapPicker";

import ParentLoginStep from "./onboarding/ParentLoginStep";
import EmailVerificationStep from "./onboarding/EmailVerificationStep";
import ParentRegistrationStep from "./onboarding/ParentRegistrationStep";

import ChildDetailsStep, {
  createEmptyChild,
} from "./onboarding/ChildDetailsStep";

import DriverChoiceStep from "./onboarding/DriverChoiceStep";
import DriverIdStep from "./onboarding/DriverIdStep";

/* =========================================================
   LOGIN / REGISTRATION / ONBOARDING CONTROLLER
========================================================= */

function Login() {
  const navigate =
    useNavigate();

  /* =======================================================
     CURRENT STEP
  ======================================================= */

  const [
    step,
    setStep,
  ] =
    useState(
      "login"
    );

  /*
    EXISTING PARENT

    login
      ↓
    send-login-otp
      ↓
    verify-login
      ↓
    dashboard


    NEW PARENT

    login
      ↓
    register
      ↓
    send-register-otp
      ↓
    verify-register
      ↓
    child-details
      ↓
    driver-choice
      ↓
    driver-id / request-driver
      ↓
    dashboard
  */

  /* =======================================================
     LOGIN EMAIL
  ======================================================= */

  const [
    loginEmail,
    setLoginEmail,
  ] =
    useState("");

  /* =======================================================
     PARENT REGISTRATION FORM
  ======================================================= */

  const [
    form,
    setForm,
  ] =
    useState({
      name: "",
      phone: "",
      email: "",
      address: "",
      latitude: null,
      longitude: null,
    });

  /* =======================================================
     CHILDREN
  ======================================================= */

  const [
    children,
    setChildren,
  ] =
    useState([
      createEmptyChild(),
    ]);

  /* =======================================================
     DRIVER
  ======================================================= */

  const [
    driverId,
    setDriverId,
  ] =
    useState("");

  /* =======================================================
     MAP
  ======================================================= */

  const [
    mapMode,
    setMapMode,
  ] =
    useState(null);

  const [
    mapChildIndex,
    setMapChildIndex,
  ] =
    useState(null);

  /* =======================================================
     UI STATE
  ======================================================= */

  const [
    loading,
    setLoading,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState("");

  /* =======================================================
     EMAIL NORMALIZATION
  ======================================================= */

  const normalizeEmail =
    (
      value
    ) => {
      return String(
        value || ""
      )
        .trim()
        .toLowerCase();
    };

  /* =======================================================
     EMAIL VALIDATION
  ======================================================= */

  const isValidEmail =
    (
      value
    ) => {
      const email =
        normalizeEmail(
          value
        );

      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email
      );
    };

  /* =======================================================
     PHONE NORMALIZATION
  ======================================================= */

  const normalizePhone =
    (
      value
    ) => {
      return String(
        value || ""
      )
        .replace(
          /\D/g,
          ""
        )
        .slice(
          0,
          10
        );
    };

  /* =======================================================
     PHONE VALIDATION
  ======================================================= */

  const isValidPhone =
    (
      value
    ) => {
      return /^[6-9]\d{9}$/.test(
        normalizePhone(
          value
        )
      );
    };

  /* =======================================================
     SAVE PARENT LOCALLY
  ======================================================= */

  const saveParent =
    (
      parent
    ) => {
      if (!parent) {
        return;
      }

      localStorage.setItem(
        "parent",
        JSON.stringify(
          parent
        )
      );

      if (
        parent._id
      ) {
        localStorage.setItem(
          "parentId",
          String(
            parent._id
          )
        );
      }

      if (
        parent.driverId
      ) {
        localStorage.setItem(
          "driverId",
          String(
            parent.driverId
          )
        );
      } else {
        localStorage.removeItem(
          "driverId"
        );
      }
    };

  /* =======================================================
     SAVE AUTH SESSION
  ======================================================= */

  const saveAuthSession =
    (
      token,
      parent
    ) => {
      if (!token) {
        throw new Error(
          "Authentication token was not returned."
        );
      }

      if (
        !parent?._id
      ) {
        throw new Error(
          "Parent account could not be loaded."
        );
      }

      setAccessToken(
        token
      );

      saveParent(
        parent
      );

      window.dispatchEvent(
        new CustomEvent(
          "asan:parent-authenticated",
          {
            detail: {
              parentId:
                String(
                  parent._id
                ),
            },
          }
        )
      );
    };

  /* =======================================================
     ERROR MESSAGE
  ======================================================= */

  const getErrorMessage =
    (
      err,
      fallback
    ) => {
      const backendMessage =
        err?.response?.data
          ?.message;

      if (
        backendMessage
      ) {
        return backendMessage;
      }

      return (
        err?.message ||
        fallback
      );
    };

  /* =======================================================
     RESTORE EXISTING SESSION
  ======================================================= */

  useEffect(() => {
    const token =
      localStorage.getItem(
        "accessToken"
      );

    const parent =
      localStorage.getItem(
        "parent"
      );

    if (
      token &&
      parent
    ) {
      navigate(
        "/app",
        {
          replace:
            true,
        }
      );
    }
  }, [
    navigate,
  ]);

  /* =======================================================
     SEND LOGIN OTP
  ======================================================= */

  const handleLoginGetOtp =
    async () => {
      try {
        setError("");
        setLoading(
          true
        );

        const email =
          normalizeEmail(
            loginEmail
          );

        if (
          !isValidEmail(
            email
          )
        ) {
          throw new Error(
            "Enter a valid email address."
          );
        }

        await API.post(
          "/parent-auth/send-login-otp",
          {
            email,
          }
        );

        setLoginEmail(
          email
        );

        setStep(
          "verify-login"
        );
      } catch (
        err
      ) {
        console.error(
          "SEND LOGIN OTP ERROR:",
          err
        );

        setError(
          getErrorMessage(
            err,
            "Unable to send login OTP."
          )
        );
      } finally {
        setLoading(
          false
        );
      }
    };

  /* =======================================================
     OPEN REGISTRATION
  ======================================================= */

  const handleOpenRegistration =
    () => {
      setError("");

      setForm(
        (
          previous
        ) => ({
          ...previous,

          email:
            normalizeEmail(
              loginEmail
            ),
        })
      );

      setStep(
        "register"
      );
    };

  /* =======================================================
     VALIDATE REGISTRATION + SEND OTP
  ======================================================= */

  const handleRegistrationContinue =
    async () => {
      try {
        setError("");
        setLoading(
          true
        );

        if (
          !form.name.trim()
        ) {
          throw new Error(
            "Parent name is required."
          );
        }

        if (
          !isValidEmail(
            form.email
          )
        ) {
          throw new Error(
            "Enter a valid email address."
          );
        }

        if (
          !isValidPhone(
            form.phone
          )
        ) {
          throw new Error(
            "Enter a valid 10-digit mobile number."
          );
        }

        if (
          !form.address.trim()
        ) {
          throw new Error(
            "Home address is required."
          );
        }

        if (
          form.latitude ===
            null ||
          form.longitude ===
            null
        ) {
          throw new Error(
            "Please select your home location."
          );
        }

        const normalizedForm =
          {
            ...form,

            name:
              form.name
                .trim(),

            email:
              normalizeEmail(
                form.email
              ),

            phone:
              normalizePhone(
                form.phone
              ),

            address:
              form.address
                .trim(),
          };

        setForm(
          normalizedForm
        );

        await API.post(
          "/parent-auth/send-register-otp",
          {
            email:
              normalizedForm.email,
          }
        );

        setStep(
          "verify-register"
        );
      } catch (
        err
      ) {
        console.error(
          "SEND REGISTER OTP ERROR:",
          err
        );

        setError(
          getErrorMessage(
            err,
            "Unable to send registration OTP."
          )
        );
      } finally {
        setLoading(
          false
        );
      }
    };

  /* =======================================================
     VERIFY LOGIN OTP
  ======================================================= */

  const handleLoginVerified =
    async (
      otp
    ) => {
      try {
        setError("");
        setLoading(
          true
        );

        const email =
          normalizeEmail(
            loginEmail
          );

        const normalizedOtp =
          String(
            otp || ""
          ).trim();

        if (
          !/^\d{6}$/.test(
            normalizedOtp
          )
        ) {
          throw new Error(
            "Enter a valid 6-digit OTP."
          );
        }

        const response =
          await API.post(
            "/parent-auth/verify-login-otp",
            {
              email,

              otp:
                normalizedOtp,
            }
          );

        const token =
          response.data
            ?.token;

        const parent =
          response.data
            ?.data;

        saveAuthSession(
          token,
          parent
        );

        navigate(
          "/app",
          {
            replace:
              true,
          }
        );
      } catch (
        err
      ) {
        console.error(
          "VERIFY LOGIN OTP ERROR:",
          err
        );

        setError(
          getErrorMessage(
            err,
            "Unable to verify login OTP."
          )
        );
      } finally {
        setLoading(
          false
        );
      }
    };

  /* =======================================================
     VERIFY REGISTRATION OTP
  ======================================================= */

  const handleRegistrationVerified =
    async (
      otp
    ) => {
      try {
        setError("");
        setLoading(
          true
        );

        const normalizedOtp =
          String(
            otp || ""
          ).trim();

        if (
          !/^\d{6}$/.test(
            normalizedOtp
          )
        ) {
          throw new Error(
            "Enter a valid 6-digit OTP."
          );
        }

        const response =
          await API.post(
            "/parent-auth/verify-register-otp",
            {
              name:
                form.name
                  .trim(),

              email:
                normalizeEmail(
                  form.email
                ),

              phone:
                normalizePhone(
                  form.phone
                ),

              address:
                form.address
                  .trim(),

              latitude:
                form.latitude,

              longitude:
                form.longitude,

              otp:
                normalizedOtp,
            }
          );

        const token =
          response.data
            ?.token;

        const parent =
          response.data
            ?.data;

        saveAuthSession(
          token,
          parent
        );

        setStep(
          "child-details"
        );
      } catch (
        err
      ) {
        console.error(
          "VERIFY REGISTER OTP ERROR:",
          err
        );

        setError(
          getErrorMessage(
            err,
            "Unable to create Parent account."
          )
        );
      } finally {
        setLoading(
          false
        );
      }
    };

  /* =======================================================
     RESEND LOGIN OTP
  ======================================================= */

  const handleResendLoginOtp =
    async () => {
      try {
        setError("");
        setLoading(
          true
        );

        await API.post(
          "/parent-auth/send-login-otp",
          {
            email:
              normalizeEmail(
                loginEmail
              ),
          }
        );
      } catch (
        err
      ) {
        setError(
          getErrorMessage(
            err,
            "Unable to resend OTP."
          )
        );

        throw err;
      } finally {
        setLoading(
          false
        );
      }
    };

  /* =======================================================
     RESEND REGISTER OTP
  ======================================================= */

  const handleResendRegisterOtp =
    async () => {
      try {
        setError("");
        setLoading(
          true
        );

        await API.post(
          "/parent-auth/send-register-otp",
          {
            email:
              normalizeEmail(
                form.email
              ),
          }
        );
      } catch (
        err
      ) {
        setError(
          getErrorMessage(
            err,
            "Unable to resend OTP."
          )
        );

        throw err;
      } finally {
        setLoading(
          false
        );
      }
    };

  /* =======================================================
     SAVE CHILDREN
  ======================================================= */

  const handleSaveChildren =
    async () => {
      try {
        setError("");
        setLoading(
          true
        );

        if (
          !children.length
        ) {
          throw new Error(
            "Add at least one child."
          );
        }

        for (
          const child of
          children
        ) {
          if (
            !child.name
              ?.trim()
          ) {
            throw new Error(
              "Child name is required."
            );
          }

          if (
            !child.age ||
            Number(
              child.age
            ) <= 0
          ) {
            throw new Error(
              "Enter a valid child age."
            );
          }

          if (
            !child.school
              ?.trim()
          ) {
            throw new Error(
              "School name is required."
            );
          }

          if (
            !child.grade
              ?.trim()
          ) {
            throw new Error(
              "Grade is required."
            );
          }

          await API.post(
            "/children/add",
            {
              name:
                child.name
                  .trim(),

              age:
                Number(
                  child.age
                ),

              gender:
                child.gender ||
                "",

              school:
                child.school
                  .trim(),

              grade:
                child.grade
                  .trim(),

              section:
                child.section
                  ?.trim() ||
                "",

              pickupTime:
                child.pickupTime,

              eveningPickup:
                child.eveningPickup,

              pickupLocation:
                child.pickupLocation
                  ?.trim() ||
                "",

              dropoffLocation:
                child.dropoffLocation
                  ?.trim() ||
                "",

              location: {
                lat:
                  child.location
                    ?.lat,

                lng:
                  child.location
                    ?.lng,
              },

              dropLocationCoords: {
                lat:
                  child
                    .dropLocationCoords
                    ?.lat,

                lng:
                  child
                    .dropLocationCoords
                    ?.lng,
              },

              medicalNotes:
                child.medicalNotes
                  ?.trim() ||
                "",

              emergencyContact:
                child.emergencyContact
                  ?.trim() ||
                "",
            }
          );
        }

        setStep(
          "driver-choice"
        );
      } catch (
        err
      ) {
        console.error(
          "SAVE CHILDREN ERROR:",
          err
        );

        setError(
          getErrorMessage(
            err,
            "Unable to save child details."
          )
        );
      } finally {
        setLoading(
          false
        );
      }
    };

  /* =======================================================
     REQUEST DRIVER
  ======================================================= */

  const handleRequestDriver =
    async () => {
      try {
        setError("");
        setLoading(
          true
        );

        await API.post(
          "/driver-request",
          {}
        );

        navigate(
          "/app",
          {
            replace:
              true,
          }
        );
      } catch (
        err
      ) {
        console.error(
          "REQUEST DRIVER ERROR:",
          err
        );

        setError(
          getErrorMessage(
            err,
            "Unable to request a Driver."
          )
        );
      } finally {
        setLoading(
          false
        );
      }
    };

  /* =======================================================
     LINK DRIVER
  ======================================================= */

  const handleDriverLink =
    async () => {
      const normalizedDriverId =
        String(
          driverId ||
          ""
        )
          .trim()
          .toUpperCase();

      if (
        !normalizedDriverId
      ) {
        setError(
          "Enter your Driver ID."
        );

        return;
      }

      try {
        setError("");
        setLoading(
          true
        );

        const result =
          await linkDriver(
            normalizedDriverId
          );

        const updatedParent =
          result?.data;

        if (
          updatedParent
        ) {
          saveParent(
            updatedParent
          );
        }

        localStorage.setItem(
          "driverId",
          normalizedDriverId
        );

        navigate(
          "/app",
          {
            replace:
              true,
          }
        );
      } catch (
        err
      ) {
        console.error(
          "LINK DRIVER ERROR:",
          err
        );

        setError(
          getErrorMessage(
            err,
            "Unable to link this Driver."
          )
        );
      } finally {
        setLoading(
          false
        );
      }
    };

  /* =======================================================
     MAP OPENERS
  ======================================================= */

  const openParentMap =
    () => {
      setMapChildIndex(
        null
      );

      setMapMode(
        "parent"
      );
    };

  const openPickupMap =
    (
      childIndex
    ) => {
      setMapChildIndex(
        childIndex
      );

      setMapMode(
        "pickup"
      );
    };

  const openDropMap =
    (
      childIndex
    ) => {
      setMapChildIndex(
        childIndex
      );

      setMapMode(
        "drop"
      );
    };

  const closeMap =
    () => {
      setMapMode(
        null
      );

      setMapChildIndex(
        null
      );
    };

  /* =======================================================
     MAP LOCATION SELECTED
  ======================================================= */

  const handleMapChange =
    (
      location
    ) => {
      if (
        !location
      ) {
        return;
      }

      if (
        mapMode ===
        "parent"
      ) {
        setForm(
          (
            previous
          ) => ({
            ...previous,

            address:
              location.address ||
              "",

            latitude:
              location.latitude,

            longitude:
              location.longitude,
          })
        );

        closeMap();

        return;
      }

      if (
        mapChildIndex ===
          null ||
        mapChildIndex ===
          undefined
      ) {
        return;
      }

      setChildren(
        (
          previous
        ) =>
          previous.map(
            (
              child,
              index
            ) => {
              if (
                index !==
                mapChildIndex
              ) {
                return child;
              }

              if (
                mapMode ===
                "pickup"
              ) {
                return {
                  ...child,

                  pickupLocation:
                    location.address ||
                    "",

                  location: {
                    lat:
                      location.latitude,

                    lng:
                      location.longitude,
                  },
                };
              }

              if (
                mapMode ===
                "drop"
              ) {
                return {
                  ...child,

                  dropoffLocation:
                    location.address ||
                    "",

                  dropLocationCoords: {
                    lat:
                      location.latitude,

                    lng:
                      location.longitude,
                  },
                };
              }

              return child;
            }
          )
      );

      closeMap();
    };

  /* =======================================================
     NAVIGATION HELPERS
  ======================================================= */

  const goToLogin =
    () => {
      setError("");

      setStep(
        "login"
      );
    };

  const goToRegister =
    () => {
      setError("");

      setStep(
        "register"
      );
    };

  /* =======================================================
     UI
  ======================================================= */

  return (
    <>
      {/* ===================================================
          EXISTING PARENT LOGIN
      =================================================== */}

      {step ===
        "login" && (
        <ParentLoginStep
          email={
            loginEmail
          }
          setEmail={
            (
              value
            ) => {
              setLoginEmail(
                value
              );

              setError("");
            }
          }
          onGetOtp={
            handleLoginGetOtp
          }
          onRegister={
            handleOpenRegistration
          }
          loading={
            loading
          }
          error={
            error
          }
        />
      )}

      {/* ===================================================
          LOGIN EMAIL VERIFICATION
      =================================================== */}

      {step ===
        "verify-login" && (
        <EmailVerificationStep
          mode="login"
          email={
            loginEmail
          }
          onVerify={
            handleLoginVerified
          }
          onResend={
            handleResendLoginOtp
          }
          onBack={
            goToLogin
          }
          loading={
            loading
          }
          error={
            error
          }
        />
      )}

      {/* ===================================================
          NEW PARENT REGISTRATION
      =================================================== */}

      {step ===
        "register" && (
        <ParentRegistrationStep
          form={
            form
          }
          setForm={
            setForm
          }
          onContinue={
            handleRegistrationContinue
          }
          onSignIn={
            goToLogin
          }
          onBack={
            goToLogin
          }
          onOpenMap={
            openParentMap
          }
          loading={
            loading
          }
          error={
            error
          }
        />
      )}

      {/* ===================================================
          REGISTRATION EMAIL VERIFICATION
      =================================================== */}

      {step ===
        "verify-register" && (
        <EmailVerificationStep
          mode="register"
          email={
            form.email
          }
          onVerify={
            handleRegistrationVerified
          }
          onResend={
            handleResendRegisterOtp
          }
          onBack={
            goToRegister
          }
          loading={
            loading
          }
          error={
            error
          }
        />
      )}

      {/* ===================================================
          CHILD DETAILS
      =================================================== */}

      {step ===
        "child-details" && (
        <ChildDetailsStep
          children={
            children
          }
          setChildren={
            setChildren
          }
          onContinue={
            handleSaveChildren
          }
          onBack={() => {
            setError("");
          }}
          onOpenPickupMap={
            openPickupMap
          }
          onOpenDropMap={
            openDropMap
          }
          loading={
            loading
          }
          error={
            error
          }
        />
      )}

      {/* ===================================================
          DRIVER CHOICE
      =================================================== */}

      {step ===
        "driver-choice" && (
        <DriverChoiceStep
          onEnterDriverId={() => {
            setError("");

            setStep(
              "driver-id"
            );
          }}
          onRequestDriver={
            handleRequestDriver
          }
          onBack={() => {
            setError("");

            setStep(
              "child-details"
            );
          }}
          loading={
            loading
          }
          error={
            error
          }
        />
      )}

      {/* ===================================================
          DRIVER ID
      =================================================== */}

      {step ===
        "driver-id" && (
        <DriverIdStep
          driverId={
            driverId
          }
          setDriverId={
            setDriverId
          }
          onContinue={
            handleDriverLink
          }
          onBack={() => {
            setError("");

            setStep(
              "driver-choice"
            );
          }}
          loading={
            loading
          }
          error={
            error
          }
        />
      )}

      {/* ===================================================
          MAP PICKER OVERLAY
      =================================================== */}

      {mapMode && (
        <MapPicker
          initialLatitude={
            mapMode === "parent"
              ? form.latitude ?? 17.385
              : mapChildIndex !== null
                ? mapMode === "pickup"
                  ? children[mapChildIndex]?.location?.lat ?? 17.385
                  : children[mapChildIndex]?.dropLocationCoords?.lat ?? 17.385
                : 17.385
          }
          initialLongitude={
            mapMode === "parent"
              ? form.longitude ?? 78.486
              : mapChildIndex !== null
                ? mapMode === "pickup"
                  ? children[mapChildIndex]?.location?.lng ?? 78.486
                  : children[mapChildIndex]?.dropLocationCoords?.lng ?? 78.486
                : 78.486
          }
          onConfirm={
            handleMapChange
          }
          onBack={
            closeMap
          }
        />
      )}
    </>
  );
}

export default Login;