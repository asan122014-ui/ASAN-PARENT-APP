import {
  API,
} from "../api/api.js";

/*
  Legacy compatibility export.

  Existing components that import axiosInstance
  will now use the same authenticated Parent API client.

  New code should preferably import:

  import { API } from "../api/api.js";
*/

export default API;