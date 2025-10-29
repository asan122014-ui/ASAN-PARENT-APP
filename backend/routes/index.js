const express = require('express');
const router = express.Router();
const db = require('../db');

// health
router.get('/ping', (req, res) => res.json({ ok: true, now: Date.now() }));

// Auth (very simple, development only)
router.post('/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });
    const users = await db.get('users');
    const exists = users.find((u) => u.email === email);
    if (exists) return res.status(400).json({ error: 'user already exists' });
    const user = await db.add('users', { email, password, name });
    res.json({ user });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const users = await db.get('users');
    const user = users.find((u) => u.email === email && u.password === password);
    if (!user) return res.status(401).json({ error: 'invalid credentials' });
    res.json({ user });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// OTP send/verify (development-only: returns OTP in response)
router.post('/auth/send-otp', async (req, res) => {
  try {
    const { phone } = req.body || {};
    if (!phone) return res.status(400).json({ error: 'phone required' });
    const otp = ('' + Math.floor(100000 + Math.random() * 900000)).slice(-6);
    const expires = Date.now() + 5 * 60 * 1000; // 5 minutes
    await db.add('otps', { phone, otp, expires });
    // In dev return OTP so frontend can use it for testing
    res.json({ ok: true, otp });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/auth/verify-otp', async (req, res) => {
  try {
    const { phone, otp } = req.body || {};
    if (!phone || !otp) return res.status(400).json({ error: 'phone and otp required' });
    const list = await db.get('otps') || [];
    const record = list.slice().reverse().find((o) => o.phone === phone && o.otp === otp && o.expires > Date.now());
    if (!record) return res.status(401).json({ error: 'invalid or expired otp' });
    // find or create user by phone
    let users = await db.get('users');
    let user = users.find((u) => u.phone === phone);
    if (!user) {
      user = await db.add('users', { phone, createdAt: Date.now(), name: 'Guardian' });
    }
    res.json({ ok: true, user });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// bookings
router.get('/bookings', async (req, res) => { try { res.json(await db.get('bookings')); } catch (e){res.status(500).json({error:e.message});} });
router.post('/bookings', async (req, res) => { try { res.json(await db.add('bookings', req.body || {})); } catch (e){res.status(500).json({error:e.message});} });

// children (per-user)
router.get('/children', async (req, res) => {
  try {
    const userId = req.query.userId;
    const all = await db.get('children') || [];
    if (userId) return res.json(all.filter((c) => c.userId === userId));
    res.json(all);
  } catch (e){ res.status(500).json({error:e.message}); }
});
router.post('/children', async (req, res) => {
  try {
    const body = req.body || {};
    if (!body.userId) return res.status(400).json({ error: 'userId required' });
    const child = await db.add('children', body);
    res.json(child);
  } catch (e){ res.status(500).json({error:e.message}); }
});
router.put('/children/:id', async (req, res) => {
  try {
    const updated = await db.update('children', req.params.id, req.body || {});
    if (!updated) return res.status(404).json({});
    res.json(updated);
  } catch (e){ res.status(500).json({error:e.message}); }
});
router.delete('/children/:id', async (req, res) => { try { await db.remove('children', req.params.id); res.json({ ok: true }); } catch (e){ res.status(500).json({error:e.message}); } });

// rides
router.get('/rides', async (req, res) => { try { res.json(await db.get('rides')); } catch (e){res.status(500).json({error:e.message});} });
router.post('/rides', async (req, res) => { try { res.json(await db.add('rides', req.body || {})); } catch (e){res.status(500).json({error:e.message});} });

// vehicles
router.get('/vehicles', async (req, res) => { try { res.json(await db.get('vehicles')); } catch (e){res.status(500).json({error:e.message});} });
router.post('/vehicles', async (req, res) => { try { res.json(await db.add('vehicles', req.body || {})); } catch (e){res.status(500).json({error:e.message});} });

// contacts / trusted contacts
router.get('/contacts', async (req, res) => { try { const userId = req.query.userId; const list = await db.get('contacts') || []; if (userId) return res.json(list.filter((c) => c.userId === userId)); res.json(list); } catch (e){res.status(500).json({error:e.message});} });
router.post('/contacts', async (req, res) => { try { const body = req.body || {}; if (!body.userId) return res.status(400).json({ error: 'userId required' }); res.json(await db.add('contacts', body)); } catch (e){res.status(500).json({error:e.message});} });
router.delete('/contacts/:id', async (req, res) => { try { await db.remove('contacts', req.params.id); res.json({ ok: true }); } catch (e){res.status(500).json({error:e.message});} });

// profile
router.get('/profile/:userId', async (req, res) => { try { const users = await db.get('users'); const u = users.find((x) => x.id === req.params.userId); if (!u) return res.status(404).json({}); res.json(u); } catch (e){res.status(500).json({error:e.message});} });
router.put('/profile/:userId', async (req, res) => { try { const u = await db.update('users', req.params.userId, req.body || {}); if (!u) return res.status(404).json({}); res.json(u); } catch (e){res.status(500).json({error:e.message});} });

// /me convenience endpoint (use header x-user-id or ?userId=)
router.get('/me', async (req, res) => { try { const userId = req.header('x-user-id') || req.query.userId; if (!userId) return res.status(400).json({ error: 'userId required (x-user-id header or ?userId=)' }); const users = await db.get('users'); const u = users.find((x) => x.id === userId); if (!u) return res.status(404).json({ error: 'not found' }); res.json(u); } catch (e){res.status(500).json({error:e.message});} });

// addresses (simple single per-user address store)
router.get('/addresses', async (req, res) => { try { const userId = req.query.userId; const addr = await db.get('addresses') || []; if (userId) return res.json(addr.filter((a) => a.userId === userId)); res.json(addr); } catch (e){res.status(500).json({error:e.message});} });
router.post('/addresses', async (req, res) => { try { const body = req.body || {}; if (!body.userId) return res.status(400).json({ error: 'userId required' }); res.json(await db.add('addresses', body)); } catch (e){res.status(500).json({error:e.message});} });

// PIN generation (pickup/drop pins)
router.post('/pins/generate', async (req, res) => { try { const { rideId, userId } = req.body || {}; const pickup = Math.floor(1000 + Math.random() * 9000); const drop = Math.floor(1000 + Math.random() * 9000); const rec = await db.add('pins', { rideId, userId, pickup, drop, createdAt: Date.now() }); res.json(rec); } catch (e){res.status(500).json({error:e.message});} });

// presets (save ride presets)
router.get('/presets', async (req, res) => { try { res.json(await db.get('presets') || []); } catch (e){res.status(500).json({error:e.message});} });
router.post('/presets', async (req, res) => { try { res.json(await db.add('presets', req.body || {})); } catch (e){res.status(500).json({error:e.message});} });

// track (simple ride location stub)
router.get('/track/:rideId', async (req, res) => { try { const rides = await db.get('rides'); const r = rides.find((x) => x.id === req.params.rideId); if (!r) return res.status(404).json({}); res.json({ rideId: r.id, location: r.location || { lat: 0, lng: 0 } }); } catch (e){res.status(500).json({error:e.message});} });

// payments
router.get('/payments', async (req, res) => { try { res.json(await db.get('payments')); } catch (e){res.status(500).json({error:e.message});} });
router.post('/payments', async (req, res) => { try { res.json(await db.add('payments', req.body || {})); } catch (e){res.status(500).json({error:e.message});} });

// reviews
router.get('/reviews', async (req, res) => { try { res.json(await db.get('reviews')); } catch (e){res.status(500).json({error:e.message});} });
router.post('/reviews', async (req, res) => { try { res.json(await db.add('reviews', req.body || {})); } catch (e){res.status(500).json({error:e.message});} });

// alerts
router.get('/alerts', async (req, res) => { try { res.json(await db.get('alerts')); } catch (e){res.status(500).json({error:e.message});} });
router.post('/alerts', async (req, res) => { try { res.json(await db.add('alerts', req.body || {})); } catch (e){res.status(500).json({error:e.message});} });

module.exports = router;
