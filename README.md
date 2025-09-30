# Slack Data Extractor

A Node.js application that automatically extracts Slack workspace data (messages, thread replies, URLs, timestamps, user info, channel names) from public channels, formats it into CSV, and uploads it to Dropbox.

## Features

- ✅ **7-day data extraction** - Only extracts messages from the last 7 days
- ✅ **Comprehensive data** - Messages, thread replies, user info, channel names, timestamps
- ✅ **Direct Slack URLs** - Includes permalink URLs to each message
- ✅ **URL extraction** - Extracts URLs shared in messages
- ✅ **CSV export** - Clean, structured CSV format
- ✅ **Dropbox upload** - Automatic upload to Dropbox with shared links
- ✅ **Scheduled runs** - Weekly automated extraction via GitHub Actions
- ✅ **Manual triggers** - Run on-demand when needed
- ✅ **Error handling** - Robust error handling and logging

## Quick Start (GitHub Actions)

### 1. Fork this Repository
Click the "Fork" button to create your own copy.

### 2. Set up Secrets
Go to your repository → Settings → Secrets and variables → Actions

Add these secrets:
```
SLACK_BOT_TOKEN=xoxb-your-slack-bot-token-here
SLACK_WORKSPACE_ID=your-workspace-id-here
DROPBOX_ACCESS_TOKEN=sl.your-dropbox-access-token-here
DROPBOX_REFRESH_TOKEN=your-dropbox-refresh-token-here
DROPBOX_CLIENT_ID=your-dropbox-app-client-id
DROPBOX_CLIENT_SECRET=your-dropbox-app-client-secret
DROPBOX_FOLDER_PATH=/slack-exports
```

### 3. Run the Workflow
- **Automatic**: Runs every Monday at 9 AM UTC
- **Manual**: Go to Actions tab → "Slack Data Extractor" → "Run workflow"

## Setup Instructions

### Slack App Setup

1. **Create a Slack App**: https://api.slack.com/apps
2. **Add Bot Token Scopes**:
   - `channels:read` - Read public channels
   - `channels:history` - Read channel messages
   - `groups:history` - Read thread replies
   - `users:read` - Read user information
   - `chat:write` - Get message permalinks
   - `bot` - Basic bot functionality

3. **Install App to Workspace**
4. **Invite Bot to Channels**: Add the bot to all public channels you want to extract from

### Dropbox App Setup

1. **Create Dropbox App**: https://www.dropbox.com/developers/apps
2. **Set Permissions**:
   - `files.write` - Upload files
   - `files.metadata.read` - Read file metadata (optional)
3. **Generate Access Token**: Use the refresh token flow for persistent access

## CSV Output Format

| Column | Description |
|--------|-------------|
| Channel | Channel name |
| Message | Message text |
| User | User display name |
| Timestamp | ISO timestamp |
| Thread_Parent | Thread timestamp (if reply) |
| URLs | URLs found in message |
| Slack_URL | Direct link to message |
| Is_Thread_Reply | Yes/No |
| Message_Type | Message type |
| Has_Attachments | Yes/No |
| Has_Files | Yes/No |

## Configuration

### Environment Variables

```env
# Slack Configuration
SLACK_BOT_TOKEN=xoxb-your-slack-bot-token-here
SLACK_WORKSPACE_ID=your-workspace-id-here

# Dropbox Configuration
DROPBOX_ACCESS_TOKEN=sl.your-dropbox-access-token-here
DROPBOX_REFRESH_TOKEN=your-dropbox-refresh-token-here
DROPBOX_CLIENT_ID=your-dropbox-app-client-id
DROPBOX_CLIENT_SECRET=your-dropbox-app-client-secret
DROPBOX_FOLDER_PATH=/slack-exports

# Application Settings
LOG_LEVEL=info
MAX_MESSAGES_PER_CHANNEL=150
MAX_THREAD_REPLIES=20
```

### Scheduling

The GitHub Action runs every Monday at 9 AM UTC. To change the schedule, edit `.github/workflows/slack-extractor.yml`:

```yaml
schedule:
  - cron: '0 9 * * 1'  # Monday 9 AM UTC
  - cron: '0 9 * * 5'  # Friday 9 AM UTC
  - cron: '0 9 * * *'  # Daily 9 AM UTC
```

## Local Development

### Prerequisites
- Node.js 16+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd slack-extractor

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your values
nano .env

# Run once
npm run start -- --once

# Run with scheduling
npm start
```

### Scripts

```bash
npm start              # Start with scheduling
npm run start -- --once # Run once and exit
npm run dev            # Development mode with nodemon
npm test               # Run tests (placeholder)
```

## Troubleshooting

### Common Issues

1. **Missing Scope Errors**
   - Ensure all required Slack scopes are added
   - Reinstall the app to your workspace after adding scopes

2. **Bot Not in Channels**
   - Invite the bot to all public channels you want to extract from

3. **Dropbox Token Expired**
   - Use the refresh token flow for persistent access
   - Check that `DROPBOX_REFRESH_TOKEN` is set

4. **Rate Limiting**
   - The app handles rate limiting automatically
   - Consider reducing `MAX_MESSAGES_PER_CHANNEL` if needed

### Logs

- **GitHub Actions**: Check the Actions tab for run logs
- **Local**: Logs are written to console and files in `logs/` directory

## Security

- Never commit `.env` files or sensitive tokens
- Use GitHub Secrets for sensitive data
- Rotate tokens regularly
- Monitor access logs

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review GitHub Actions logs
3. Open an issue with detailed information
