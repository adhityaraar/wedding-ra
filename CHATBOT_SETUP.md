# Watson Orchestrate Chatbot Setup

## Configuration

The Watson Orchestrate chatbot is configured through environment variables defined in a `.env` file at the project root.

### Setup Steps

1. **Copy the example file:**
   ```bash
   cp .env.example .env
   ```

2. **Add your Watson Orchestrate credentials to `.env`:**
   ```env
   VITE_WATSON_ORCHESTRATE_HOST_URL=https://us-south.watson-orchestrate.cloud.ibm.com
   VITE_WATSON_ORCHESTRATE_ORCHESTRATION_ID=your_orchestration_id
   VITE_WATSON_ORCHESTRATE_DEPLOYMENT_CRN=your_crn
   VITE_WATSON_ORCHESTRATE_AGENT_ID=your_agent_id
   VITE_WATSON_ORCHESTRATE_AGENT_ENVIRONMENT_ID=your_environment_id
   ```

3. **Restart your dev server:**
   ```bash
   npm run dev
   ```

The chatbot will automatically initialize when the app loads.

## Security Notes

- **Never commit `.env` to version control** — it is already in `.gitignore`
- Use `.env.example` as a template for setting up your local environment
- All sensitive credentials should be stored in `.env` only
- On production (GitHub Pages), you may need to use GitHub Secrets for CI/CD deployments

## Chatbot Features

- Embedded chat interface on all pages (visible on desktop and mobile)
- Accessible via the Watson Orchestrate chat interface
- Configuration persists through the session
- Responsive design that adapts to mobile screens
