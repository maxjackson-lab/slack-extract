# Slack Data Extractor & Analyzer

A comprehensive tool for extracting Slack workspace data, analyzing it with GPT-4o, and generating beautiful presentations via Gamma API.

## 🚀 Features

- **Slack Data Extraction**: Extract messages, threads, and metadata from Slack channels
- **AI-Powered Analysis**: Analyze community data using GPT-4o for insights
- **Presentation Generation**: Create beautiful presentations via Gamma API
- **Automated Workflows**: GitHub Actions integration for scheduled runs
- **Interactive Menu**: User-friendly interface for different operations

## 📋 Prerequisites

- Node.js 16+ 
- Slack Bot Token with appropriate permissions
- Dropbox API access
- OpenAI API key (for analysis)
- Gamma API key (for presentations)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd slack-extractor
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build TypeScript**
   ```bash
   npm run build
   ```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Required - Slack Configuration
SLACK_BOT_TOKEN=xoxb-your-bot-token
SLACK_WORKSPACE_ID=your-workspace-id

# Required - Dropbox Configuration  
DROPBOX_ACCESS_TOKEN=your-dropbox-token
DROPBOX_REFRESH_TOKEN=your-refresh-token
DROPBOX_CLIENT_ID=your-client-id
DROPBOX_CLIENT_SECRET=your-client-secret
DROPBOX_FOLDER_PATH=/slack-exports

# Optional - Analysis Configuration
OPENAI_API_KEY=sk-your-openai-key
GAMMA_API_KEY=your-gamma-api-key
GPT_MODEL=gpt-4o
CHUNK_SIZE=15

# Optional - Scheduling
SCHEDULE_ENABLED=false
SCHEDULE_CRON=0 9 * * 1
RUN_IMMEDIATELY=false

# Optional - Application Settings
LOG_LEVEL=info
API_DELAY_MS=1000
MAX_MESSAGES_PER_CHANNEL=150
MAX_THREAD_REPLIES=20
```

### GitHub Secrets Setup

For automated workflows, add these secrets to your GitHub repository:

**Required Secrets:**
- `SLACK_BOT_TOKEN`
- `SLACK_WORKSPACE_ID` 
- `DROPBOX_ACCESS_TOKEN`
- `DROPBOX_REFRESH_TOKEN`
- `DROPBOX_CLIENT_ID`
- `DROPBOX_CLIENT_SECRET`

**Optional Secrets (for analysis):**
- `OPENAI_API_KEY`
- `GAMMA_API_KEY`

## 🎯 Usage

### Interactive Mode

```bash
npm start
```

This will show an interactive menu:

```
🚀 Slack Data Extractor & Analyzer
=====================================

1. Extract Slack data only
2. Run full analysis pipeline (extract + analyze + present)
3. Test API connections
4. Exit

Choose an option (1-4):
```

### Command Line Options

```bash
# Extract data only
node dist/index.js --once

# Run full pipeline
node dist/index.js --analyze

# Interactive mode
node dist/index.js --interactive
```

### Development Mode

```bash
# Run with TypeScript directly
npm run dev

# Watch mode for development
npm run build:watch
```

## 📊 Analysis Features

The analysis pipeline creates focused, actionable reports with:

### ✅ Included Sections (Based on User Feedback)
- **Community Overview**: Activity metrics and themes
- **What's Resonating**: Features people love and success stories  
- **What's Challenging**: Recurring questions and friction points
- **Feature Wishlist**: User requests and needs
- **Notable Feedback**: Direct quotes with source links

### 🎨 Presentation Features
- **Text-only content** (no AI-generated images)
- **Interactive Slack links** preserved in presentations
- **8 focused cards** (reduced from 15 based on feedback)
- **Professional formatting** with markdown preservation

## 🔄 Automated Workflows

### GitHub Actions

The workflow runs every Monday at 9 AM UTC and includes:

1. **Data Extraction**: Pulls latest Slack data
2. **AI Analysis**: Processes data with GPT-4o
3. **Presentation Generation**: Creates Gamma presentation
4. **Artifact Upload**: Saves results for 30 days

### Manual Triggers

You can also trigger the workflow manually:
- Go to **Actions** tab in GitHub
- Select **Slack Data Extractor & Analyzer**
- Click **Run workflow**

## 📁 File Structure

```
slack-extractor/
├── src/
│   ├── config/           # Configuration management
│   ├── services/         # Core services
│   │   ├── slackAnalyzer.ts    # Main analysis orchestrator
│   │   ├── openaiClient.ts     # GPT-4o integration
│   │   ├── gammaClient.ts      # Gamma API integration
│   │   ├── chunkProcessor.ts   # Data chunking logic
│   │   └── slackService.ts     # Slack API integration
│   ├── types/            # TypeScript interfaces
│   ├── utils/            # Utility functions
│   └── index.ts          # Main entry point
├── dist/                 # Compiled JavaScript
├── exports/              # Generated CSV and reports
├── .github/workflows/    # GitHub Actions
└── package.json
```

## 🔧 API Configuration

### OpenAI (GPT-4o)
- **Model**: `gpt-4o` (upgraded from gpt-4o-mini)
- **Max Tokens**: 16,000 completion tokens
- **Chunk Size**: 15 messages per chunk
- **Temperature**: 0.7 for balanced creativity

### Gamma API
- **Format**: Presentation
- **Cards**: 8 (optimized based on feedback)
- **Text Mode**: Preserve (maintains markdown links)
- **Images**: Disabled (text-only content)

## 📈 Monitoring & Logs

The application provides comprehensive logging:

- **Info**: General operation status
- **Warn**: Non-critical issues
- **Error**: Critical failures with context
- **Debug**: Detailed operation traces

Logs include:
- API call status and timing
- Token usage statistics
- File processing progress
- Error details with context

## 🚨 Troubleshooting

### Common Issues

1. **"No CSV files found"**
   - Ensure Slack extraction completed successfully
   - Check `exports/` directory exists
   - Verify Slack bot has channel access

2. **"API connection failed"**
   - Verify API keys are correct
   - Check network connectivity
   - Ensure API quotas aren't exceeded

3. **"Empty presentation"**
   - Check if analysis generated content
   - Verify Gamma API key permissions
   - Review markdown formatting

### Debug Mode

Enable detailed logging:
```bash
LOG_LEVEL=debug node dist/index.js --interactive
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- **Amanda** for detailed feedback and requirements
- **OpenAI** for GPT-4o API
- **Gamma** for presentation generation
- **Slack** for workspace data access

---

**Need help?** Check the logs, review the configuration, or open an issue for support.