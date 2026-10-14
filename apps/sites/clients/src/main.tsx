import React from "react";
import { createRoot } from "react-dom/client";
import "@cxsun/ui/styles.css";
import ClientSurface from "@sites-client-entry";

createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ClientSurface />
  </React.StrictMode>
);
