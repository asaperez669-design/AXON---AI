#!/bin/bash

echo "=========================================="
echo "OpenAI API Configuration Setup"
echo "=========================================="
echo ""

# Check if GenSpark LLM config exists
if [ -f ~/.genspark_llm.yaml ]; then
    echo "✓ Found GenSpark LLM configuration at ~/.genspark_llm.yaml"
    echo ""
    
    # Try to extract the API key and base URL
    API_KEY=$(grep "api_key:" ~/.genspark_llm.yaml | awk '{print $2}')
    BASE_URL=$(grep "base_url:" ~/.genspark_llm.yaml | awk '{print $2}')
    
    if [ -n "$API_KEY" ] && [ -n "$BASE_URL" ]; then
        echo "Found credentials in GenSpark config:"
        echo "  API Key: ${API_KEY:0:15}..."
        echo "  Base URL: $BASE_URL"
        echo ""
        
        # Update .dev.vars file
        cat > .dev.vars << EOF
# OpenAI API Configuration (Auto-configured from GenSpark)
OPENAI_API_KEY=$API_KEY
OPENAI_BASE_URL=$BASE_URL
EOF
        
        echo "✓ Updated .dev.vars with your GenSpark credentials"
        echo ""
        echo "Next steps:"
        echo "  1. Restart your development server: npm run build && pm2 restart workflow"
        echo "  2. Test the AI BANT extraction feature"
        echo ""
    else
        echo "⚠ Could not parse credentials from GenSpark config"
        echo "Please configure manually (see below)"
    fi
else
    echo "⚠ GenSpark LLM configuration not found at ~/.genspark_llm.yaml"
    echo ""
    echo "Please set up your API key:"
    echo ""
    echo "Option 1: Through GenSpark UI (Recommended)"
    echo "  1. Go to your GenSpark project settings"
    echo "  2. Navigate to the 'API Keys' tab"
    echo "  3. Generate/configure your LLM API key"
    echo "  4. Click 'Inject' to configure the sandbox"
    echo "  5. Run this script again"
    echo ""
    echo "Option 2: Manual Configuration"
    echo "  1. Get your API key from GenSpark"
    echo "  2. Edit .dev.vars file:"
    echo "     OPENAI_API_KEY=your-api-key-here"
    echo "     OPENAI_BASE_URL=https://www.genspark.ai/api/llm_proxy/v1"
    echo ""
fi

echo "=========================================="
