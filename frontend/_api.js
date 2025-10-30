// Shared API helpers for frontend pages
(function(global){
  const API_BASE = '';// relative - will call same origin /api

  async function apiFetch(path, opts) {
    const res = await fetch(API_BASE + path, Object.assign({ headers: { 'Content-Type': 'application/json' } }, opts || {}));
    const json = await res.json().catch(()=>({}));
    if (!res.ok) throw Object.assign(new Error(json.error || 'Request failed'), { details: json });
    return json;
  }

  async function sendOtp(phone) { return apiFetch('/api/auth/send-otp', { method: 'POST', body: JSON.stringify({ phone }) }); }
  async function verifyOtp(phone, otp) { return apiFetch('/api/auth/verify-otp', { method: 'POST', body: JSON.stringify({ phone, otp }) }); }
  async function register(email, password, name) { return apiFetch('/api/auth/register', { method: 'POST', body: JSON.stringify({ email, password, name }) }); }

  async function getProfile(userId) { return apiFetch(`/api/profile/${userId}`); }
  async function getMe(userId) { return apiFetch(`/api/me?userId=${encodeURIComponent(userId)}`); }

  async function getChildren(userId) { const url = new URL('/api/children', window.location.origin); if (userId) url.searchParams.set('userId', userId); return apiFetch(url.pathname + url.search); }
  async function addChild(body) { return apiFetch('/api/children', { method: 'POST', body: JSON.stringify(body) }); }

  // expose
  global.API = { sendOtp, verifyOtp, register, getProfile, getMe, getChildren, addChild };
})(window);
