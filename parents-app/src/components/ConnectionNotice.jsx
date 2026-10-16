import { useEffect, useState } from "react";
export default function ConnectionNotice() {
  const [online, setOnline] = useState(() => navigator.onLine);
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    window.addEventListener("online", update); window.addEventListener("offline", update);
    return () => { window.removeEventListener("online", update); window.removeEventListener("offline", update); };
  }, []);
  if (online) return null;
  return <div role="status" className="sticky top-0 z-[240] border-b border-[#EBDCA9] bg-[#FFF1C8] px-4 py-3 text-center text-sm font-semibold text-[#725B2A]">You’re offline. Keep this screen open to preserve your details, then retry when connected.</div>;
}
