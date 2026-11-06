import InstituteTransport from '../components/InstituteTransport';
import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "../pages/auth/Login";

import TripDetails from "../pages/main/TripDetails";
import MainScreen from "../pages/main/MainScreen";
import InvoiceDetails from "../pages/main/InvoiceDetails";
import BookRide from "../pages/main/BookRide";
import BookingPayment from "../pages/main/BookingPayment";

import ProtectedParentRoute from "./ProtectedParentRoute";

/* =========================================================
   APP ROUTES
========================================================= */

function AppRoutes() {
  let instituteManaged = false;
  try { instituteManaged = JSON.parse(localStorage.getItem('parent') || '{}').accountSource === 'institute'; } catch {}
  return (
    <Routes>
      <Route path="/booking-payment/:id" element={<ProtectedParentRoute><BookingPayment /></ProtectedParentRoute>} />

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
        path="/book-ride"
        element={
          <ProtectedParentRoute>
            {instituteManaged ? <InstituteTransport /> : <BookRide />}
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



