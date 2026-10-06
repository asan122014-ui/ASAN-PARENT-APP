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

import MapPicker from "../../components/MapPicker";

import ParentLoginStep from "./onboarding/ParentLoginStep";
import EmailVerificationStep from "./onboarding/EmailVerificationStep";
import ParentRegistrationStep from "./onboarding/ParentRegistrationStep";


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
     MAP
  ======================================================= */

  const [
    mapMode,
    setMapMode,
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

        localStorage.setItem("activeTab", "home");
        localStorage.setItem("previousTab", "home");

        navigate(
          "/app",
          {
            replace: true,
          }
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

  const openParentMap = () => setMapMode("parent");

  const closeMap = () => setMapMode(null);

  const handleMapChange = (location) => {
    if (!location) return;
    setForm((previous) => ({
      ...previous,
      address: location.address || "",
      latitude: location.latitude,
      longitude: location.longitude,
    }));
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
          MAP PICKER OVERLAY
      =================================================== */}

      {mapMode && (
        <MapPicker
          initialLatitude={form.latitude ?? 17.385}
          initialLongitude={form.longitude ?? 78.486}
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
