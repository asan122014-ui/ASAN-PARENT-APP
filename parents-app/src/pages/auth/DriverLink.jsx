import {
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import DriverChoiceStep from "../../components/onboarding/DriverChoiceStep";
import DriverIdStep from "../../components/onboarding/DriverIdStep";

import {
  linkDriver,
} from "../../api/parentApi";

import {
  API,
} from "../../api/api";

/* =========================================================
   DRIVER LINK
========================================================= */

function DriverLink() {
  const navigate =
    useNavigate();

  /* =======================================================
     STEP
  ======================================================= */

  const [
    step,
    setStep,
  ] =
    useState("choice");

  /* =======================================================
     DRIVER ID
  ======================================================= */

  const [
    driverId,
    setDriverId,
  ] =
    useState("");

  /* =======================================================
     STATE
  ======================================================= */

  const [
    linking,
    setLinking,
  ] =
    useState(false);

  const [
    requesting,
    setRequesting,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState("");

  /* =======================================================
     SAVE UPDATED PARENT
  ======================================================= */

  const saveUpdatedParent =
    (
      parent
    ) => {
      if (
        !parent
      ) {
        return;
      }

      localStorage.setItem(
        "parent",
        JSON.stringify(
          parent
        )
      );

      if (
        parent?._id
      ) {
        localStorage.setItem(
          "parentId",
          String(
            parent._id
          )
        );
      }

      const linkedDriverId =
        typeof parent?.driverId ===
        "object"
          ? (
              parent?.driverId
                ?.driverId ||
              parent?.driverId
                ?._id ||
              ""
            )
          : parent?.driverId;

      if (
        linkedDriverId
      ) {
        localStorage.setItem(
          "driverId",
          String(
            linkedDriverId
          )
        );
      } else {
        localStorage.removeItem(
          "driverId"
        );
      }
    };

  /* =======================================================
     OPEN DRIVER ID STEP
  ======================================================= */

  const handleEnterDriverId =
    () => {
      setError("");

      setStep(
        "driver-id"
      );
    };

  /* =======================================================
     BACK FROM DRIVER ID
  ======================================================= */

  const handleBack =
    () => {
      setError("");

      setStep(
        "choice"
      );
    };

  /* =======================================================
     LINK DRIVER
  ======================================================= */

  const handleLinkDriver =
    async (
      value
    ) => {
      const normalizedDriverId =
        String(
          value ||
          driverId ||
          ""
        )
          .trim()
          .toUpperCase();

      if (
        !normalizedDriverId
      ) {
        setError(
          "Please enter your Driver ID."
        );

        return;
      }

      try {
        setError("");

        setLinking(
          true
        );

        const result =
          await linkDriver(
            normalizedDriverId
          );

        /*
          Driver ID is only cached locally
          for convenience.

          Backend remains the source
          of truth.
        */

        localStorage.setItem(
          "driverId",
          normalizedDriverId
        );

        const updatedParent =
          result?.data;

        if (
          updatedParent
        ) {
          saveUpdatedParent(
            updatedParent
          );
        }

        /*
          Driver has been successfully
          linked.

          Return to Parent application.
        */

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
          "Driver link error:",
          err?.response?.data ||
          err
        );

        setError(
          err?.response?.data
            ?.message ||
            "Unable to link this Driver. Please check the Driver ID."
        );
      } finally {
        setLinking(
          false
        );
      }
    };

  /* =======================================================
     REQUEST DRIVER
  ======================================================= */

  const handleDriverRequest =
    async () => {
      if (
        requesting ||
        linking
      ) {
        return;
      }

      try {
        setError("");

        setRequesting(
          true
        );

        /*
          Parent identity comes from
          authenticated Parent JWT.

          parentId must NOT be supplied
          by the frontend.
        */

        const response =
          await API.post(
            "/driver-request",
            {}
          );

        /*
          Some backend implementations
          may return the updated Parent.

          If present, keep the local
          Parent cache synchronized.
        */

        const updatedParent =
          response?.data?.data
            ?.parent ||
          response?.data?.parent ||
          null;

        if (
          updatedParent
        ) {
          saveUpdatedParent(
            updatedParent
          );
        }

        /*
          Parent has now requested a
          Driver.

          Return to Home.

          Home.jsx can display:
          "No driver is assigned to you.
           We will notify you once a
           Driver has been assigned."
        */

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
          "Driver request error:",
          err?.response?.data ||
          err
        );

        /*
          If backend says a request
          already exists, the Parent
          should simply return to Home
          instead of getting stuck here.
        */

        const status =
          err?.response?.status;

        const message =
          String(
            err?.response?.data
              ?.message ||
            ""
          ).toLowerCase();

        const alreadyRequested =
          status === 409 ||
          message.includes(
            "already"
          ) ||
          message.includes(
            "pending"
          ) ||
          message.includes(
            "request exists"
          );

        if (
          alreadyRequested
        ) {
          navigate(
            "/app",
            {
              replace:
                true,
            }
          );

          return;
        }

        setError(
          err?.response?.data
            ?.message ||
            "Unable to submit your Driver request."
        );
      } finally {
        setRequesting(
          false
        );
      }
    };

  /* =======================================================
     DRIVER CHOICE
  ======================================================= */

  if (
    step ===
    "choice"
  ) {
    return (
      <DriverChoiceStep
        onEnterDriverId={
          handleEnterDriverId
        }
        onRequestDriver={
          handleDriverRequest
        }
        loading={
          requesting
        }
        error={
          error
        }
      />
    );
  }

  /* =======================================================
     DRIVER ID
  ======================================================= */

  return (
    <DriverIdStep
      driverId={
        driverId
      }
      setDriverId={
        setDriverId
      }
      onContinue={
        handleLinkDriver
      }
      onBack={
        handleBack
      }
      loading={
        linking
      }
      error={
        error
      }
    />
  );
}

export default DriverLink;