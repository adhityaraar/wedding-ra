#!/bin/bash

# Update .env with new Watson Orchestrate configuration
cat > .env << 'EOF'
VITE_WXO_ORCHESTRATION_ID="e9b23377d4b94d71831af0149f10081a_d238661f-cb9b-4a49-b041-4f9073e96625"
VITE_WXO_HOST_URL="https://ca-tor.watson-orchestrate.cloud.ibm.com"
VITE_WXO_ROOT_ELEMENT_ID="root"
VITE_WXO_AGENT_ID="08b4499c-c0b3-4648-a3fd-1a7126d7a707"
VITE_WXO_CRN="crn:v1:bluemix:public:watsonx-orchestrate:ca-tor:a/e9b23377d4b94d71831af0149f10081a:d238661f-cb9b-4a49-b041-4f9073e96625::"
VITE_WXO_AGENT_ENVIRONMENT_ID="1928ad6f-909a-41eb-8532-ca52e17cc403"
EOF

echo ".env file updated successfully!"
cat .env
