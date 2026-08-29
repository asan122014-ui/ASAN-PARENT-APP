import {
  API,
} from "./api.js";

/* =========================================================
   PARENT PROFILE
========================================================= */

export const getParentProfile =
  async () => {
    const response =
      await API.get(
        "/parent/me"
      );

    return response.data;
  };

/* =========================================================
   UPDATE PARENT PROFILE
========================================================= */

export const updateParentProfile =
  async (
    data
  ) => {
    const response =
      await API.put(
        "/parent/me",
        data
      );

    return response.data;
  };

/* =========================================================
   LINK DRIVER
========================================================= */

export const linkDriver =
  async (
    driverId
  ) => {
    const response =
      await API.post(
        "/parent/link-driver",
        {
          driverId,
        }
      );

    return response.data;
  };

/* =========================================================
   SAVE PARENT FCM TOKEN
========================================================= */

export const saveParentFcmToken =
  async (
    fcmToken
  ) => {
    const response =
      await API.post(
        "/auth/save-token",
        {
          fcmToken,
        }
      );

    return response.data;
  };

/* =========================================================
   LOGOUT PARENT / REMOVE FCM TOKEN
========================================================= */

export const logoutParent =
  async (
    fcmToken
  ) => {
    const response =
      await API.put(
        "/parent/logout",
        {
          fcmToken,
        }
      );

    return response.data;
  };