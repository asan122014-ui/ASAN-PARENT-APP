import { useCallback, useEffect, useRef, useState } from 'react';

export default function useInstituteTransport(client, endpoint) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [updatedAt, setUpdatedAt] = useState(null);
  const active = useRef(false), request = useRef(null);
  const refresh = useCallback(async () => {
    if (!active.current || request.current) return;
    const controller = new AbortController();
    request.current = controller;
    setLoading(true);
    try {
      const response = await client.get(endpoint, { signal: controller.signal });
      if (active.current && !controller.signal.aborted) {
        setData(response.data); setError(''); setUpdatedAt(new Date());
      }
    } catch (failure) {
      if (active.current && !controller.signal.aborted) setError(failure.response?.data?.message || 'Transport details could not be refreshed. Please retry.');
    } finally {
      if (request.current === controller) {
        request.current = null;
        if (active.current) setLoading(false);
      }
    }
  }, [client, endpoint]);
  useEffect(() => {
    active.current = true;
    const resume = () => { if (document.visibilityState !== 'hidden') void refresh(); };
    const initial = window.setTimeout(refresh, 0);
    const timer = setInterval(resume, 30000);
    window.addEventListener('focus', resume);
    document.addEventListener('visibilitychange', resume);
    return () => {
      active.current = false; clearInterval(timer); window.clearTimeout(initial);
      window.removeEventListener('focus', resume);
      document.removeEventListener('visibilitychange', resume);
      request.current?.abort(); request.current = null;
    };
  }, [refresh]);
  return { data, error, loading, updatedAt, refresh };
}
