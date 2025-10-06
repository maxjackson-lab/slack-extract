# GitHub Secrets Setup Guide

This guide will help you set up the required secrets in your GitHub repository for automated Slack data extraction and analysis.

## 🔐 Required Secrets

### 1. Slack Configuration
- **`SLACK_BOT_TOKEN`**: Your Slack bot token (starts with `xoxb-`)
- **`SLACK_WORKSPACE_ID`**: Your Slack workspace ID

### 2. Dropbox Configuration  
- **`DROPBOX_ACCESS_TOKEN`**: Your Dropbox access token
- **`DROPBOX_REFRESH_TOKEN`**: Your Dropbox refresh token
- **`DROPBOX_CLIENT_ID`**: Your Dropbox app client ID
- **`DROPBOX_CLIENT_SECRET`**: Your Dropbox app client secret

### 3. Analysis Configuration (Optional)
- **`OPENAI_API_KEY`**: Your OpenAI API key (starts with `sk-`)
- **`GAMMA_API_KEY`**: Your Gamma API key

## 📝 How to Add Secrets

1. **Go to your GitHub repository**
2. **Click on "Settings" tab**
3. **In the left sidebar, click "Secrets and variables"**
4. **Click "Actions"**
5. **Click "New repository secret"**
6. **Add each secret with the exact name and value**

## 🔍 Finding Your Values

### Slack Bot Token
1. Go to [api.slack.com/apps](https://api.slack.com/apps)
2. Select your app
3. Go to "OAuth & Permissions"
4. Copy the "Bot User OAuth Token"

### Slack Workspace ID
1. Go to your Slack workspace
2. Click on your workspace name
3. Go to "Settings & administration" → "Workspace settings"
4. The Workspace ID is in the URL or under "Workspace details"

### Dropbox Tokens
1. Go to [dropbox.com/developers](https://dropbox.com/developers)
2. Select your app
3. Go to "OAuth 2" section
4. Generate access token and refresh token

### OpenAI API Key
1. Go to [platform.openai.com](https://platform.openai.com)
2. Go to "API Keys"
3. Create a new secret key

### Gamma API Key
1. Go to [gamma.app](https://gamma.app)
2. Go to your account settings
3. Find your API key

## ✅ Verification

After adding all secrets, you can test the setup:

1. **Go to "Actions" tab in your repository**
2. **Click "Slack Data Extractor & Analyzer"**
3. **Click "Run workflow"**
4. **Select "Run workflow"**

The workflow should:
- ✅ Extract Slack data
- ✅ Analyze with GPT-4o (if API keys provided)
- ✅ Generate Gamma presentation (if API keys provided)
- ✅ Upload artifacts

## 🚨 Important Notes

- **Never commit secrets to your repository**
- **Secrets are encrypted and only accessible to GitHub Actions**
- **Each secret name must match exactly (case-sensitive)**
- **Test with a small dataset first to verify everything works**

## 🔧 Troubleshooting

### "Secret not found" errors
- Double-check secret names are exact matches
- Ensure secrets are added to the correct repository
- Verify you're using the right repository in the workflow

### "API connection failed" errors
- Verify API keys are valid and active
- Check API quotas and limits
- Ensure proper permissions are granted

### "No CSV files found" errors
- Verify Slack bot has access to channels
- Check Slack bot permissions
- Ensure workspace ID is correct

---

**Need help?** Check the workflow logs in the Actions tab for detailed error messages.
