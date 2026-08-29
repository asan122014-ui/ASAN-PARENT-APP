import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { MapPin, Clock, User, Calendar, CheckCircle2, ArrowRight } from "lucide-react";

function TripCard({ trip }) {
  const navigate = useNavigate();

  const formatDate = (date) => {
    if (!date) return "--";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  const formatTime = (date) => {
    if (!date) return "--";
    return new Date(date).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      whileHover={{ scale: 1.01 }}
      onClick={() => navigate("/trip-details", { state: { trip } })}
      className="relative bg-white rounded-2xl border-2 border-yellow-400 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden"
    >

      {/* GLOW EFFECT ON HOVER */}
      <div className="absolute inset-0 opacity-0 hover:opacity-100 transition duration-300 pointer-events-none bg-gradient-to-r from-yellow-400/10 via-yellow-300/10 to-yellow-400/10"></div>

      {/* TOP SECTION */}
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center flex-shrink-0">
              <User size={18} className="text-black" />
            </div>
            <div>
              <p className="text-base font-semibold text-gray-900">
                {trip.childName || "Student"}
              </p>
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                {trip.driverId?.name || "No Driver Assigned"}
              </p>
            </div>
          </div>

          {/* STATUS BADGE */}
          <span className="flex items-center gap-1 bg-green-100 text-green-700 text-[10px] px-3 py-1 rounded-full font-medium border border-green-300 whitespace-nowrap">
            <CheckCircle2 size={12} />
            Completed
          </span>
        </div>

        {/* ROUTE SECTION */}
        <div className="mt-4 bg-gray-50 rounded-xl p-3 flex items-center gap-2 border border-gray-200">
          <MapPin size={14} className="text-yellow-500 flex-shrink-0" />
          <p className="text-sm text-gray-700 font-medium truncate">
            {trip.route?.from || "Pickup"} 
            <ArrowRight size={12} className="inline mx-1 text-gray-400" /> 
            {trip.route?.to || "Drop"}
          </p>
        </div>

        {/* FOOTER */}
        <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Calendar size={12} />
              <span>{formatDate(trip.createdAt)}</span>
            </div>
            <div className="w-px h-4 bg-gray-200"></div>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Clock size={12} />
              <span>{formatTime(trip.createdAt)}</span>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-yellow-100 px-3 py-1 rounded-full border border-yellow-300">
            <Clock size={12} className="text-yellow-600" />
            <span className="text-xs text-yellow-700 font-medium">
              ETA: {trip.eta || "--"}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default TripCard;