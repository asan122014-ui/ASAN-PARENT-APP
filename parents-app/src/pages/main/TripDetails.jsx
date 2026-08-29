import { useLocation, useNavigate } from "react-router-dom";
import { MapPin, Clock, User } from "lucide-react";

function TripDetails() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const trip = state?.trip;

  /* ================= SAFETY ================= */
  if (!trip) {
    return (
      <div className="p-4 text-center text-gray-500">
        No trip data
      </div>
    );
  }

  /* ================= 🔥 SINGLE CHILD ================= */
  const child = trip?.child || null;

  /* ================= ETA ================= */
  const eta = trip?.eta ?? "--";

  /* ================= TIME ================= */
  const formatTime = (date) => {
    if (!date) return "--";
    return new Date(date).toLocaleString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "short",
    });
  };

  return (
    <div className="min-h-screen bg-white">

      {/* HEADER */}
      <div className="bg-yellow-400 px-5 pt-6 pb-6 rounded-b-3xl">
        <button
          onClick={() => navigate(-1)}
          className="text-sm mb-3"
        >
          ← Back
        </button>

        <h1 className="text-xl font-semibold">
          Trip Details
        </h1>
      </div>

      {/* CONTENT */}
      <div className="p-4 space-y-5">

        {/* ================= 🔥 CHILD (ONLY ONE) ================= */}
        <div className="bg-white rounded-2xl p-4 shadow border border-gray-100">

          <div className="flex items-center gap-2 mb-3">
            <User size={16} />
            <span className="font-medium">
              Student Details
            </span>
          </div>

          {child ? (
            <div className="flex justify-between items-center py-2">
              <span className="text-sm font-medium">
                {child.name || trip.childName || "Student"}
              </span>

              <span
                className={`text-xs px-2 py-1 rounded-full
                  ${
                    child.status === "waiting"
                      ? "bg-yellow-100 text-yellow-700"
                      : child.status === "onboard"
                      ? "bg-blue-100 text-blue-700"
                      : child.status === "dropped"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-500"
                  }
                `}
              >
                {child.status || "unknown"}
              </span>
            </div>
          ) : (
            <p className="text-sm text-gray-400">
              No student found
            </p>
          )}
        </div>

        {/* ================= ROUTE ================= */}
        <div className="bg-white rounded-2xl p-4 shadow border border-gray-100">

          <div className="flex items-center gap-2">
            <MapPin size={16} />
            <span>
              {trip.route?.from || "--"} → {trip.route?.to || "--"}
            </span>
          </div>

          <div className="flex items-center gap-2 mt-3">
            <Clock size={16} />
            <span>ETA: {eta}</span>
          </div>

          <div className="mt-3 text-xs text-gray-400">
            Started: {formatTime(trip.startTime)}
          </div>

          <div className="mt-1 text-xs text-gray-500">
            Status: {trip.status}
          </div>

        </div>

        {/* ================= BUTTON ================= */}
        <button
          onClick={() =>
            navigate("/tracking", { state: { trip } })
          }
          className="w-full bg-yellow-500 text-white py-3 rounded-xl font-semibold active:scale-95 transition"
        >
          Open Live Tracking
        </button>

      </div>
    </div>
  );
}

export default TripDetails;