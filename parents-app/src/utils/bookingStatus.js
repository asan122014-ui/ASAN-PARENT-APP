export function bookingStatus(booking) {
  const status = booking.status;
  if (["active", "expired", "cancelled"].includes(status)) {
    return status === "active" ? { title: "Service active", detail: "Your monthly ride service is ready. Upcoming journeys appear on Home.", tone: "green" }
      : { title: status === "cancelled" ? "Booking cancelled" : "Service ended", detail: "You can book another ride from Home.", tone: "amber" };
  }
  if (status === "driver_accepted" || status === "awaiting_payment") return { title: "Ready for payment", detail: `Driver ${booking.assignedDriverId || booking.driverRequestId?.assignedDriverId || "assigned"} accepted. Complete payment or apply an eligible coupon to activate your ride.`, tone: "green" };
  if (booking.driverRequestId?.matchingStatus === "Exhausted") return { title: "Driver search needs attention", detail: booking.driverRequestId?.rejectionReason || "Try another driver or ask the institute to assign one.", tone: "amber" };
  if (status === "awaiting_driver") return { title: "Waiting for driver", detail: "Your selected driver has your request. We’ll notify you when they respond.", tone: "amber" };
  if (status === "driver_searching" && booking.driverRequestId?.matchingStatus === "Offered") return { title: "Waiting for driver", detail: "The institute selected a driver. Your request is awaiting their response.", tone: "amber" };
  if (status === "driver_searching") return { title: "Waiting for admin", detail: "The institute will select a driver. No payment is needed yet.", tone: "amber" };
  return { title: "Request received", detail: "Your booking is being processed. No payment is needed yet.", tone: "amber" };
}
