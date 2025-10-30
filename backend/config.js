// Centralized config loader for the backend.
// Do NOT commit secrets into source code. Provide secrets via environment variables.

const required = {
  GOOGLE_API_KEY: process.env.GOOGLE_API_KEY || process.env.API_KEY || null,
};

module.exports = {
  get googleApiKey() { return required.GOOGLE_API_KEY; },
  hasGoogleApiKey() { return !!required.GOOGLE_API_KEY; },
};
