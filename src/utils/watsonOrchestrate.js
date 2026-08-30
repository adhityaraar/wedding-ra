/**
 * Initialize Watson Orchestrate chatbot
 * Configuration is loaded from environment variables
 */
export function initWatsonOrchestrate() {
  // Load configuration from environment variables
  const orchestrationID = import.meta.env.VITE_WXO_ORCHESTRATION_ID;
  const hostURL = import.meta.env.VITE_WXO_HOST_URL;
  const rootElementID = import.meta.env.VITE_WXO_ROOT_ELEMENT_ID || "root";
  const agentId = import.meta.env.VITE_WXO_AGENT_ID;
  const agentEnvironmentId = import.meta.env.VITE_WXO_AGENT_ENVIRONMENT_ID;
  const crn = import.meta.env.VITE_WXO_CRN;

  // Validate required configuration
  if (!orchestrationID || !hostURL || !agentId) {
    console.warn("Watson Orchestrate configuration incomplete. Please check your .env file.", {
      hasOrchestrationID: !!orchestrationID,
      hasHostURL: !!hostURL,
      hasAgentId: !!agentId,
    });
    return;
  }

  // Set global configuration
  window.wxOConfiguration = {
    orchestrationID,
    hostURL,
    rootElementID,
    deploymentPlatform: "ibmcloud",
    crn,
    chatOptions: {
      agentId,
      agentEnvironmentId,
    },
  };

  console.log("Watson Orchestrate config initialized:", {
    orchestrationID: orchestrationID.substring(0, 20) + "...",
    hostURL,
    rootElementID,
  });

  // Load the Watson Orchestrate chatbot script
  setTimeout(() => {
    if (document.querySelector('script[data-wxo-loader="true"]')) return;

    const script = document.createElement("script");
    script.dataset.wxoLoader = "true";
    script.src = `${hostURL}/wxochat/wxoLoader.js?embed=true`;
    script.addEventListener("load", () => {
      console.log("Watson Orchestrate script loaded");
      if (window.wxoLoader) {
        window.wxoLoader.init();
        console.log("Watson Orchestrate chatbot initialized");
      }
    });
    script.addEventListener("error", () => {
      console.error("Failed to load Watson Orchestrate chatbot script");
    });
    document.head.appendChild(script);
  }, 0);
}
