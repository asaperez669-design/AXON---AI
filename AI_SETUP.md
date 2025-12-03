# AI BANT Extraction - Setup Guide

## 🚨 Fixing "Forbidden" Error

If you're seeing **"AI service error: forbidden"**, it means the OpenAI API key isn't configured. Follow these steps:

---

## ✅ Setup Instructions

### Option 1: Through GenSpark UI (Recommended)

1. **Open GenSpark Settings**
   - Go to your GenSpark project
   - Click on **Settings** or **Configuration**

2. **Navigate to API Keys Tab**
   - Find the **"API Keys"** or **"LLM Configuration"** section
   - Look for OpenAI or LLM API settings

3. **Generate/Configure API Key**
   - Click **"Generate API Key"** or **"Configure LLM"**
   - This will create a GenSpark-managed API key

4. **Inject to Sandbox**
   - Click the **"Inject"** button
   - This configures `~/.genspark_llm.yaml` automatically

5. **Run Setup Script**
   ```bash
   cd /home/user/webapp
   ./setup-openai.sh
   ```

6. **Restart Application**
   ```bash
   npm run build
   pm2 restart workflow
   ```

---

### Option 2: Manual Configuration

If you have a GenSpark API key already:

1. **Edit the `.dev.vars` file**
   ```bash
   cd /home/user/webapp
   nano .dev.vars
   ```

2. **Add your credentials**
   ```bash
   OPENAI_API_KEY=gsk-your-api-key-here
   OPENAI_BASE_URL=https://www.genspark.ai/api/llm_proxy/v1
   ```

3. **Save and rebuild**
   ```bash
   npm run build
   pm2 restart workflow
   ```

---

## 🧪 Testing

After setup, test the feature:

1. Go to **Accounts** tab
2. Click on any account
3. Click **"Add Note"**
4. Scroll to **"AI Assistant"** section
5. Paste a sample transcript:
   ```
   John mentioned they have a $50K budget for Q1. 
   Sarah is the decision maker. They need to solve 
   their inventory issues before March.
   ```
6. Click **"Auto-Fill BANT Fields with AI"**

If configured correctly, the BANT fields will auto-populate! ✨

---

## 🔍 Troubleshooting

### "Forbidden" Error
- **Cause**: API key not set or invalid
- **Fix**: Follow setup instructions above

### "OpenAI API not configured"
- **Cause**: Environment variables not loaded
- **Fix**: 
  1. Check `.dev.vars` file exists
  2. Restart the application
  3. Run `./setup-openai.sh` to verify

### API Key Format
- GenSpark API keys start with `gsk-`
- Example: `gsk-abc123xyz...`

---

## 📝 Supported Models

The application uses **GPT-5** through GenSpark's LLM proxy, which supports:
- `gpt-5`
- `gpt-5.1`
- `gpt-5-mini`
- `gpt-5-nano`

---

## 💡 Need Help?

Check if your config is working:
```bash
cd /home/user/webapp
./setup-openai.sh
```

This script will:
- ✓ Check for GenSpark LLM config
- ✓ Extract credentials if available
- ✓ Update `.dev.vars` automatically
- ✓ Provide next steps

---

## 🔒 Security Notes

- `.dev.vars` is in `.gitignore` (not committed to git)
- API keys are environment variables (not in code)
- For production deployment, use Cloudflare secrets:
  ```bash
  wrangler secret put OPENAI_API_KEY
  wrangler secret put OPENAI_BASE_URL
  ```

---

**Once configured, the AI BANT extraction will work seamlessly!** 🎉
