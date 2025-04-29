import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Popup from "./chrome-extension/popup/index";  // Assuming this is the correct path
import "./chrome-extension/global.css";

const container = document.getElementById("root");
const root = createRoot(container!); // Ensure container is non-null

root.render(
  <StrictMode>
      <Popup />
  </StrictMode>
);
