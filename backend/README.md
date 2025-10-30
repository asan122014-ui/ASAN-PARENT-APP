# Asan Backend (development)

This is a small development backend for the Asan frontend. It's intentionally minimal and file-backed (JSON) so you can run it locally without installing a database.

Quick start:

1. Open a terminal and change to the backend folder:

   cd "c:\\Users\\NEEHARIKA\\Desktop\\asan app\\backend"

2. Install dependencies:

   npm install

3. Start the server:

   npm start

The server listens on port 3000 by default and exposes the API under `/api`.

Example endpoints:

- GET /api/ping
- POST /api/auth/register { email, password, name }
- POST /api/auth/login { email, password }
- GET/POST /api/bookings
- GET/POST /api/rides
- GET/POST /api/vehicles
- GET/PUT /api/profile/:userId
- GET /api/track/:rideId

Notes:
- This backend stores data in `backend/data/data.json`. It's not secure and not suitable for production.
- For production you should use a proper database and hashed passwords.

Environment variables and API keys
---------------------------------

This project expects secrets (like API keys) to be provided via environment variables instead of hard-coding them into source files.

- For local development copy `.env.example` to `.env` and add your real values (do NOT commit `.env`).
   - Example: set `GOOGLE_API_KEY=your_key_here` in `.env`.

- In production (Render, Heroku, etc.) configure the environment variable `GOOGLE_API_KEY` in the service settings (not in source code).

I added a tiny config helper `backend/config.js` which exposes `hasGoogleApiKey()` and `googleApiKey` for server-side code to use. The backend does not print the API key into logs; it only checks presence. If you want I can wire a specific route to call an external API using the key (e.g., Google Maps) — tell me which API and endpoint and I'll add an example.
