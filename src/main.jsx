import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { initWatsonOrchestrate } from "./utils/watsonOrchestrate.js";

// Initialize Watson Orchestrate chatbot
initWatsonOrchestrate();

createRoot(document.getElementById("app-root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
