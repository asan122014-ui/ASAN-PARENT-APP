import { useRef, useState } from 'react';

export default function DownloadInvoiceButton({ onDownload, children, className }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [failed, setFailed] = useState(false);
  const inFlight = useRef(false);
  async function download() {
    if (inFlight.current) return;
    inFlight.current = true; setBusy(true); setMessage(''); setFailed(false);
    try {
      const result = await onDownload();
      setMessage(result?.cancelled ? 'Save cancelled.' : result?.browserDownload ? 'Invoice download started.' : 'Invoice saved to your selected location.');
    } catch (error) { setFailed(true); setMessage(error.message || 'Unable to save invoice. Please retry.'); }
    finally { inFlight.current = false; setBusy(false); }
  }
  return <div><button type="button" onClick={download} disabled={busy} className={className}>{busy ? 'Saving invoice…' : children}</button>{message && <p role={failed ? 'alert' : 'status'} className={`mt-2 text-xs ${failed ? 'text-red-700' : 'text-zinc-600'}`}>{message}</p>}</div>;
}
