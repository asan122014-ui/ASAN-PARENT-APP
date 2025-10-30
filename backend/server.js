const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

require('dotenv').config();
const routes = require('./routes');
const db = require('./db');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// API routes
app.use('/api', routes);

// Serve frontend static files (optional) — serves the workspace `frontend` folder
app.use(express.static(path.join(__dirname, '..', 'frontend')));

const PORT = parseInt(process.env.PORT, 10) || 3000;

(async function start() {
  try {
    // Connect to MongoDB if MONGO_URI provided. db.connect is resilient and will fall back to file store.
    await db.connect(process.env.MONGO_URI);
    const HOST = process.env.HOST || '0.0.0.0';
    app.listen(PORT, HOST, () => {
      console.log(`Asan backend listening on http://${HOST}:${PORT} (env PORT=${process.env.PORT})`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
})();

module.exports = app;
