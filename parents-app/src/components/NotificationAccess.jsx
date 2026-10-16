import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { notificationDestination } from "../utils/notificationDestination";

let pending = null;
const listeners = new Set();
export function requestExplainedPushPermission(plugin) {
  if (pending) return pending.promise;
  let resolve;
  const promise = new Promise((done) => { resolve = done; });
  pending = { plugin, resolve, promise };
  listeners.forEach((listener) => listener(pending));
  return promise;
}

export async function requestExplainedWebPermission() {
  if (!("Notification" in window)) return "denied";
  if (Notification.permission !== "default") return Notification.permission;
  const result = await requestExplainedPushPermission({ requestPermissions: async () => ({ receive: await Notification.requestPermission() }) });
  return result.receive;
}

export default function NotificationAccess({ role = "parent", readNotification }) {
  const [request, setRequest] = useState(pending);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    listeners.add(setRequest);
    const open = async (event) => {
      const notice = event.detail?.notification || event.detail || {};
      const notificationId = notice.data?.notificationId || notice._id;
      if (/^[a-f\d]{24}$/i.test(String(notificationId || ""))) {
        try { await readNotification?.(notificationId); } catch { /* Opening details still works while offline. */ }
      }
      navigate(notificationDestination(event.detail, role));
    };
    window.addEventListener("asan:notification-click", open);
    return () => { listeners.delete(setRequest); window.removeEventListener("asan:notification-click", open); };
  }, [navigate, role, readNotification]);
  const complete = (result) => { request?.resolve(result); pending = null; setRequest(null); };
  const enable = async () => {
    setBusy(true); setError("");
    try { complete(await request.plugin.requestPermissions()); }
    catch { setError("Couldn’t enable notifications. Please retry."); }
    finally { setBusy(false); }
  };
  if (!request || ["/", "/DriverLogin", "/login"].includes(location.pathname)) return null;
  return <aside role="region" aria-label="Notification permission" className="fixed bottom-4 left-4 right-4 z-[250] mx-auto max-w-md rounded-2xl border border-[#EBDCA9] bg-[#FFF9EE] p-4 text-black shadow-xl">
    <h2 className="text-base font-bold">Stay updated on your rides</h2>
    <p className="mt-1 text-sm leading-6">Enable notifications for booking responses, ride progress and important safety updates. You can keep using the app without them.</p>
    {error && <p role="alert" className="mt-2 text-sm text-red-700">{error}</p>}
    <div className="mt-3 flex flex-wrap gap-3">
      <button type="button" disabled={busy} onClick={enable} className="min-h-11 rounded-xl bg-[#FFB400] px-4 text-sm font-bold disabled:opacity-50">{busy ? "Enabling…" : "Enable notifications"}</button>
      <button type="button" disabled={busy} onClick={() => complete({ receive: "denied" })} className="min-h-11 rounded-xl border border-[#EBDCA9] px-4 text-sm font-semibold">Not now</button>
    </div>
  </aside>;
}
