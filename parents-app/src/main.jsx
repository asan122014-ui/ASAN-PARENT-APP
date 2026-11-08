import { initializeSession } from './session/session';
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import "leaflet/dist/leaflet.css"; // ✅ Leaflet CSS

import App from "./App";
import "./index.css";

document.getElementById('root').textContent = 'Restoring your session…';
initializeSession().finally(() => ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
));