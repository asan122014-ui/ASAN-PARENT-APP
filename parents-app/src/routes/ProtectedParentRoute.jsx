import {
  Navigate,
} from "react-router-dom";

function ProtectedParentRoute({
  children,
}) {
  const token =
    localStorage.getItem(
      "accessToken"
    );

  const parent =
    localStorage.getItem(
      "parent"
    );

  /* =========================================================
     NO AUTH SESSION
  ========================================================= */

  if (
    !token ||
    !parent
  ) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  /* =========================================================
     VALID PARENT SESSION
  ========================================================= */

  return children;
}

export default ProtectedParentRoute;