require('dotenv').config();

/**
 * Configuration module for Slack Extractor
 * Validates and exports all environment variables
 */

class Config {
  constructor() {
    this.validateRequiredEnvVars();
  }

  // Slack Configuration
  get slack() {
    return {
      botToken: process.env.SLACK_BOT_TOKEN,
      workspaceId: process.env.SLACK_WORKSPACE_ID
    };
  }

  // Dropbox Configuration
  get dropbox() {
    return {
      accessToken: process.env.DROPBOX_ACCESS_TOKEN,
      refreshToken: process.env.DROPBOX_REFRESH_TOKEN,
      clientId: process.env.DROPBOX_CLIENT_ID,
      clientSecret: process.env.DROPBOX_CLIENT_SECRET,
      folderPath: process.env.DROPBOX_FOLDER_PATH || '/slack-exports'
    };
  }

  // Scheduling Configuration
  get scheduling() {
    return {
      enabled: process.env.SCHEDULE_ENABLED === 'true',
      cronExpression: process.env.SCHEDULE_CRON || '0 9 * * 1',
      runImmediately: process.env.RUN_IMMEDIATELY === 'true'
    };
  }

  // Application Settings
  get app() {
    return {
      logLevel: process.env.LOG_LEVEL || 'info',
      csvFilenamePrefix: process.env.CSV_FILENAME_PREFIX || 'slack-data-export',
      apiDelayMs: parseInt(process.env.API_DELAY_MS) || 1000,
      maxMessagesPerChannel: parseInt(process.env.MAX_MESSAGES_PER_CHANNEL) || 150,
      maxThreadReplies: parseInt(process.env.MAX_THREAD_REPLIES) || 20
    };
  }

  /**
   * Validates that all required environment variables are present
   */
  validateRequiredEnvVars() {
    const requiredVars = [
      'SLACK_BOT_TOKEN',
      'SLACK_WORKSPACE_ID',
      'DROPBOX_ACCESS_TOKEN'
    ];
    
    // Check if we have refresh token setup (optional but recommended)
    const hasRefreshToken = process.env.DROPBOX_REFRESH_TOKEN && 
                           process.env.DROPBOX_CLIENT_ID && 
                           process.env.DROPBOX_CLIENT_SECRET;
    
    if (!hasRefreshToken) {
      console.log('⚠️  Warning: No refresh token setup detected. Dropbox access tokens expire after ~4 hours.');
      console.log('   For persistent access, set DROPBOX_REFRESH_TOKEN, DROPBOX_CLIENT_ID, and DROPBOX_CLIENT_SECRET');
    }

    const missingVars = requiredVars.filter(varName => !process.env[varName]);

    if (missingVars.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missingVars.join(', ')}\n` +
        'Please check your .env file and ensure all required variables are set.\n' +
        'See .env.example for reference.'
      );
    }

    // Validate Slack token format
    if (!process.env.SLACK_BOT_TOKEN.startsWith('xoxb-')) {
      throw new Error(
        'SLACK_BOT_TOKEN must start with "xoxb-". Please check your Slack bot token.'
      );
    }

    // Validate Dropbox access token format
    if (!process.env.DROPBOX_ACCESS_TOKEN.startsWith('sl.') && !process.env.DROPBOX_ACCESS_TOKEN.startsWith('slx.')) {
      throw new Error(
        'DROPBOX_ACCESS_TOKEN must be a valid Dropbox access token.\n' +
        'Access tokens typically start with "sl." for short-lived tokens or "slx." for long-lived tokens.'
      );
    }
  }

  /**
   * Get all configuration as a single object
   */
  getAll() {
    return {
      slack: this.slack,
      dropbox: this.dropbox,
      scheduling: this.scheduling,
      app: this.app
    };
  }

  /**
   * Log configuration (without sensitive data)
   */
  logConfig() {
    console.log('Configuration loaded:');
    console.log(`- Slack Workspace ID: ${this.slack.workspaceId}`);
    console.log(`- Dropbox Folder Path: ${this.dropbox.folderPath}`);
    console.log(`- Scheduling Enabled: ${this.scheduling.enabled}`);
    console.log(`- Schedule: ${this.scheduling.cronExpression}`);
    console.log(`- Run Immediately: ${this.scheduling.runImmediately}`);
    console.log(`- Log Level: ${this.app.logLevel}`);
    console.log(`- API Delay: ${this.app.apiDelayMs}ms`);
  }
}

module.exports = new Config();
