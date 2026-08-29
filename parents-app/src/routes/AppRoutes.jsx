import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "../pages/auth/Login";

import TripDetails from "../pages/main/TripDetails";
import MainScreen from "../pages/main/MainScreen";
import InvoiceDetails from "../pages/main/InvoiceDetails";

import ProtectedParentRoute from "./ProtectedParentRoute";

/* =========================================================
   APP ROUTES
========================================================= */

function AppRoutes() {
  return (
    <Routes>

      {/* =====================================================
          PUBLIC
      ===================================================== */}

      <Route
        path="/"
        element={
          <Login />
        }
      />

      {/* =====================================================
          PROTECTED PARENT ROUTES
      ===================================================== */}

      <Route
        path="/app"
        element={
          <ProtectedParentRoute>
            <MainScreen />
          </ProtectedParentRoute>
        }
      />

      <Route
        path="/tracking"
        element={
          <ProtectedParentRoute>
            <TripDetails />
          </ProtectedParentRoute>
        }
      />

      <Route
        path="/invoice/:id"
        element={
          <ProtectedParentRoute>
            <InvoiceDetails />
          </ProtectedParentRoute>
        }
      />

      {/* =====================================================
          FALLBACK
      ===================================================== */}

      <Route
        path="*"
        element={
          <Navigate
            to="/"
            replace
          />
        }
      />

    </Routes>
  );
}

export default AppRoutes;