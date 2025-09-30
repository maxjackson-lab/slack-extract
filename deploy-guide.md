# Slack Extractor Deployment Guide

## Option 1: VPS/Cloud Server Deployment (Recommended)

### Prerequisites
- A VPS or cloud server (DigitalOcean, Linode, AWS EC2, etc.)
- Ubuntu/Debian Linux (recommended)
- Node.js 16+ installed

### Step 1: Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18 (LTS)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install Git
sudo apt install git -y
```

### Step 2: Deploy Application

```bash
# Clone your repository
git clone <your-repo-url> slack-extractor
cd slack-extractor

# Install dependencies
npm install

# Copy environment file
cp .env.example .env
# Edit .env with your actual values
nano .env
```

### Step 3: Configure Environment Variables

```bash
# Edit .env file with your actual values
nano .env
```

Required variables:
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

# Scheduling Configuration
SCHEDULE_ENABLED=true
SCHEDULE_CRON=0 9 * * 1
RUN_IMMEDIATELY=false

# Application Settings
LOG_LEVEL=info
CSV_FILENAME_PREFIX=slack-data-export
```

### Step 4: Start with PM2

```bash
# Start the application with PM2
pm2 start src/index.js --name "slack-extractor"

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Follow the instructions provided by the command above
```

### Step 5: Monitor and Manage

```bash
# View logs
pm2 logs slack-extractor

# Restart application
pm2 restart slack-extractor

# Stop application
pm2 stop slack-extractor

# View status
pm2 status
```

## Option 2: Docker Deployment

### Create Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY src/ ./src/

# Create exports directory
RUN mkdir -p exports

# Expose port (if needed)
EXPOSE 3000

# Start application
CMD ["node", "src/index.js"]
```

### Create docker-compose.yml

```yaml
version: '3.8'

services:
  slack-extractor:
    build: .
    container_name: slack-extractor
    restart: unless-stopped
    environment:
      - SLACK_BOT_TOKEN=${SLACK_BOT_TOKEN}
      - SLACK_WORKSPACE_ID=${SLACK_WORKSPACE_ID}
      - DROPBOX_ACCESS_TOKEN=${DROPBOX_ACCESS_TOKEN}
      - DROPBOX_REFRESH_TOKEN=${DROPBOX_REFRESH_TOKEN}
      - DROPBOX_CLIENT_ID=${DROPBOX_CLIENT_ID}
      - DROPBOX_CLIENT_SECRET=${DROPBOX_CLIENT_SECRET}
      - DROPBOX_FOLDER_PATH=${DROPBOX_FOLDER_PATH}
      - SCHEDULE_ENABLED=true
      - SCHEDULE_CRON=0 9 * * 1
      - RUN_IMMEDIATELY=false
      - LOG_LEVEL=info
    volumes:
      - ./exports:/app/exports
    env_file:
      - .env
```

### Deploy with Docker

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

## Option 3: Serverless Deployment (AWS Lambda)

### Install Serverless Framework

```bash
npm install -g serverless
```

### Create serverless.yml

```yaml
service: slack-extractor

provider:
  name: aws
  runtime: nodejs18.x
  region: us-east-1
  environment:
    SLACK_BOT_TOKEN: ${env:SLACK_BOT_TOKEN}
    SLACK_WORKSPACE_ID: ${env:SLACK_WORKSPACE_ID}
    DROPBOX_ACCESS_TOKEN: ${env:DROPBOX_ACCESS_TOKEN}
    DROPBOX_REFRESH_TOKEN: ${env:DROPBOX_REFRESH_TOKEN}
    DROPBOX_CLIENT_ID: ${env:DROPBOX_CLIENT_ID}
    DROPBOX_CLIENT_SECRET: ${env:DROPBOX_CLIENT_SECRET}
    DROPBOX_FOLDER_PATH: ${env:DROPBOX_FOLDER_PATH}
    SCHEDULE_ENABLED: true
    SCHEDULE_CRON: 0 9 * * 1
    RUN_IMMEDIATELY: false
    LOG_LEVEL: info

functions:
  extract:
    handler: src/index.handler
    timeout: 900
    events:
      - schedule: cron(0 9 ? * MON *)
```

### Deploy to AWS

```bash
# Deploy
serverless deploy

# View logs
serverless logs -f extract
```

## Option 4: GitHub Actions (Scheduled Runs)

### Create .github/workflows/slack-extractor.yml

```yaml
name: Slack Data Extractor

on:
  schedule:
    - cron: '0 9 * * 1'  # Every Monday at 9 AM UTC
  workflow_dispatch:  # Manual trigger

jobs:
  extract:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run Slack Extractor
      env:
        SLACK_BOT_TOKEN: ${{ secrets.SLACK_BOT_TOKEN }}
        SLACK_WORKSPACE_ID: ${{ secrets.SLACK_WORKSPACE_ID }}
        DROPBOX_ACCESS_TOKEN: ${{ secrets.DROPBOX_ACCESS_TOKEN }}
        DROPBOX_REFRESH_TOKEN: ${{ secrets.DROPBOX_REFRESH_TOKEN }}
        DROPBOX_CLIENT_ID: ${{ secrets.DROPBOX_CLIENT_ID }}
        DROPBOX_CLIENT_SECRET: ${{ secrets.DROPBOX_CLIENT_SECRET }}
        DROPBOX_FOLDER_PATH: ${{ secrets.DROPBOX_FOLDER_PATH }}
        SCHEDULE_ENABLED: false
        RUN_IMMEDIATELY: true
        LOG_LEVEL: info
      run: node src/index.js --once
```

## Security Considerations

### Environment Variables
- Never commit `.env` files to version control
- Use environment variable management tools
- Rotate tokens regularly

### Server Security
- Use SSH keys instead of passwords
- Keep system updated
- Use firewall (ufw)
- Consider using a reverse proxy (nginx)

### Monitoring
- Set up log monitoring
- Use health checks
- Monitor disk space for CSV files
- Set up alerts for failures

## Cost Estimates

### VPS Options
- **DigitalOcean**: $5-10/month for basic droplet
- **Linode**: $5-10/month for basic instance
- **AWS EC2**: $3-8/month for t3.micro

### Serverless
- **AWS Lambda**: ~$0.20/month for weekly runs
- **Vercel**: Free tier available
- **Netlify**: Free tier available

## Recommended Approach

For most users, I recommend **Option 1 (VPS with PM2)** because:
- ✅ Full control over the environment
- ✅ Easy to debug and monitor
- ✅ Cost-effective for long-running processes
- ✅ Simple to set up and maintain
- ✅ Can handle file storage locally

Would you like me to help you set up any of these deployment options?
