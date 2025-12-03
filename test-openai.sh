#!/bin/bash

echo "=========================================="
echo "Testing OpenAI API Configuration"
echo "=========================================="
echo ""

# Check .dev.vars file
if [ -f .dev.vars ]; then
    echo "✓ .dev.vars file exists"
    
    # Check if it has the required keys
    if grep -q "OPENAI_API_KEY" .dev.vars && grep -q "OPENAI_BASE_URL" .dev.vars; then
        echo "✓ Required environment variables are set"
        
        # Extract the API key (first 15 chars only for security)
        API_KEY=$(grep "OPENAI_API_KEY" .dev.vars | cut -d'=' -f2)
        BASE_URL=$(grep "OPENAI_BASE_URL" .dev.vars | cut -d'=' -f2)
        
        if [[ "$API_KEY" == *"your-api-key-here"* ]]; then
            echo "⚠ API key is still set to placeholder value"
            echo "  Please update .dev.vars with your actual API key"
        else
            echo "✓ API key is configured: ${API_KEY:0:15}..."
            echo "✓ Base URL: $BASE_URL"
        fi
    else
        echo "✗ Missing OPENAI_API_KEY or OPENAI_BASE_URL in .dev.vars"
    fi
else
    echo "✗ .dev.vars file not found"
fi

echo ""
echo "Next steps:"
echo "  1. If API key is not configured, run: ./setup-openai.sh"
echo "  2. Make sure to restart the app: pm2 restart workflow"
echo "  3. Test the AI feature in the web interface"
echo ""
echo "=========================================="
