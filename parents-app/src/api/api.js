import axios from "axios";

/* =========================================================
   API BASE URL
========================================================= */

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  "https://asan-driverapp.onrender.com/api"
).replace(/\/+$/, "");

/* =========================================================
   AXIOS INSTANCE
========================================================= */

const API = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,

  headers: {
    Accept: "application/json",
  },
});

/* =========================================================
   REQUEST INTERCEPTOR
========================================================= */

/*
  PARENT AUTHENTICATION

  Email
      ↓
  Resend OTP
      ↓
  ASAN Backend
      ↓
  ASAN Parent JWT
      ↓
  localStorage.accessToken
      ↓
  Authorization:
  Bearer <ASAN_PARENT_JWT>
*/

API.interceptors.request.use(
  (config) => {
    try {
      config.headers =
        config.headers || {};

      const token =
        localStorage.getItem(
          "accessToken"
        );

      /* =====================================================
         NO TOKEN
      ===================================================== */

      if (!token) {
        if (
          config.headers
            .Authorization
        ) {
          delete config
            .headers
            .Authorization;
        }

        return config;
      }

      /* =====================================================
         AUTHORIZATION HEADER
      ===================================================== */

      config.headers.Authorization =
        `Bearer ${token}`;

      /*
        Do NOT force Content-Type.

        Axios automatically handles:

        JSON
        → application/json

        FormData
        → multipart/form-data
      */

      return config;
    } catch (error) {
      console.error(
        "Unable to attach Parent authentication token:",
        error?.message ||
          error
      );

      return Promise.reject(
        error
      );
    }
  },

  (error) =>
    Promise.reject(
      error
    )
);

/* =========================================================
   RESPONSE INTERCEPTOR
========================================================= */

API.interceptors.response.use(
  (response) =>
    response,

  (error) => {
    const status =
      error.response
        ?.status;

    /* =====================================================
       UNAUTHENTICATED
    ===================================================== */

    if (
      status ===
      401
    ) {
      window.dispatchEvent(
        new CustomEvent(
          "asan:unauthorized",
          {
            detail: {
              message:
                error
                  .response
                  ?.data
                  ?.message ||
                "Authentication failed",
            },
          }
        )
      );
    }

    /* =====================================================
       FORBIDDEN
    ===================================================== */

    if (
      status ===
      403
    ) {
      window.dispatchEvent(
        new CustomEvent(
          "asan:forbidden",
          {
            detail: {
              message:
                error
                  .response
                  ?.data
                  ?.message ||
                "Access denied",
            },
          }
        )
      );
    }

    /* =====================================================
       RATE LIMITED
    ===================================================== */

    if (
      status ===
      429
    ) {
      window.dispatchEvent(
        new CustomEvent(
          "asan:rate-limited",
          {
            detail: {
              message:
                error
                  .response
                  ?.data
                  ?.message ||
                "Too many requests. Please try again shortly.",
            },
          }
        )
      );
    }

    return Promise.reject(
      error
    );
  }
);

/* =========================================================
   AUTH HELPERS
========================================================= */

const setAccessToken = (
  token
) => {
  if (!token) {
    localStorage.removeItem(
      "accessToken"
    );

    return;
  }

  localStorage.setItem(
    "accessToken",
    String(
      token
    )
  );
};

const getAccessToken =
  () => {
    return localStorage.getItem(
      "accessToken"
    );
  };

const clearAccessToken =
  () => {
    localStorage.removeItem(
      "accessToken"
    );
  };

/* =========================================================
   EXPORT
========================================================= */

export {
  API,
  API_BASE_URL,
  setAccessToken,
  getAccessToken,
  clearAccessToken,
};