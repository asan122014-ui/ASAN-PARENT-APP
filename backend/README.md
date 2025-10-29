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
