import { enableMapSet } from "immer";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import "./index.css";
import { router } from "./router";
import { ROUTER_BASENAME } from "@/shared/model/routes";

enableMapSet();

// Redirect root path to the app basename (no-op when served at root, e.g. the
// standalone demo build where ROUTER_BASENAME is "/").
if (ROUTER_BASENAME !== "/" && window.location.pathname === "/") {
  window.location.replace(ROUTER_BASENAME);
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
