import * as dotenv from 'dotenv';

dotenv.config();

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


  // Analysis Configuration
  get analysis() {
    return {
      openaiApiKey: process.env.OPENAI_API_KEY,
      gammaApiKey: process.env.GAMMA_API_KEY,
      enabled: !!(process.env.OPENAI_API_KEY && process.env.GAMMA_API_KEY),
      gptModel: process.env.GPT_MODEL || 'gpt-4o',
      systemPrompt: process.env.GPT_SYSTEM_PROMPT || `You are a Slack community data analyst. Extract actionable insights from community conversations and create presentation-ready content.

CRITICAL INSTRUCTIONS:
1. Follow the exact template structure provided
2. Include interactive Slack thread links: [descriptive text](slack-url)
3. Extract actual quotes and link to source threads
4. Focus on patterns, trends, and actionable insights
5. Output only the markdown template - no preambles or JSON
6. Be concise but comprehensive`,
      userPromptTemplate: process.env.GPT_USER_PROMPT || `# Gambassadors Community Analysis

Analyze this Slack community data and create presentation content for Amanda's team review. Focus on what's working, what's challenging, and emerging patterns.

**Data:** {{PASTE_SLACK_DATA_HERE}}

Extract: feature feedback, success stories, recurring questions, feature requests, community support, emerging trends. Use markdown links \`[text](url)\` for key examples only.

Output markdown only. No JSON. No preambles. Start with # heading.

---

# Gambassadors Community Insights
Week of [Date] Snapshot

## Community Overview
[2-3 sentences: vibe, energy, themes]

**Activity:** [X] messages, [Y] members, top topics: [3-4 themes]

## What's Resonating 🎯

**Features People Love**
- Feature: Why it works
- Another: Feedback
- [Example](link): Context
[3-5 items]

**Success Stories**
- [Use case](link): What they built
- Another: Why notable
[2-3 examples]

## What's Challenging 😓

**Recurring Questions**
- Topic: Gap indicated
- [Theme](link): Pattern
[3-5 patterns]

**Feature Wishlist**
- [Request](link): Use case
- Another: Need
[3-5 requests]

**Friction Points**
- Issue: Impact
- [Challenge](link): Where stuck
[2-4 issues]

## Notable Feedback

> "Quote" - Member, [link](url)
> "Quote" - Member, [link](url)
> "Quote" - Member, [link](url)
> "Quote" - Member, [link](url)

[4-6 quotes, mix positive/constructive]

---
*Based on [X] messages from [date range]*`,
      maxTokensPerChunk: parseInt(process.env.MAX_TOKENS_PER_CHUNK || '4000'),
      chunkSize: parseInt(process.env.CHUNK_SIZE || '15')
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
      apiDelayMs: parseInt(process.env.API_DELAY_MS || '1000'),
      maxMessagesPerChannel: parseInt(process.env.MAX_MESSAGES_PER_CHANNEL || '150'),
      maxThreadReplies: parseInt(process.env.MAX_THREAD_REPLIES || '20')
    };
  }

  /**
   * Validates that all required environment variables are present
   */
  validateRequiredEnvVars(): void {
    const requiredVars = [
      'SLACK_BOT_TOKEN',
      'SLACK_WORKSPACE_ID'
    ];
    

    // Check analysis API keys (optional)
    const hasAnalysisKeys = process.env.OPENAI_API_KEY && process.env.GAMMA_API_KEY;
    if (!hasAnalysisKeys) {
      console.log('ℹ️  Info: Analysis features disabled. Set OPENAI_API_KEY and GAMMA_API_KEY to enable GPT-5 analysis and presentation generation.');
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
    if (!process.env.SLACK_BOT_TOKEN?.startsWith('xoxb-')) {
      throw new Error(
        'SLACK_BOT_TOKEN must start with "xoxb-". Please check your Slack bot token.'
      );
    }

  }

  /**
   * Get all configuration as a single object
   */
  getAll() {
    return {
      slack: this.slack,
      analysis: this.analysis,
      scheduling: this.scheduling,
      app: this.app
    };
  }

  /**
   * Log configuration (without sensitive data)
   */
  logConfig(): void {
    console.log('Configuration loaded:');
    console.log(`- Slack Workspace ID: ${this.slack.workspaceId}`);
    console.log(`- Analysis Features: ${this.analysis.enabled ? 'Enabled' : 'Disabled'}`);
    console.log(`- Scheduling Enabled: ${this.scheduling.enabled}`);
    console.log(`- Schedule: ${this.scheduling.cronExpression}`);
    console.log(`- Run Immediately: ${this.scheduling.runImmediately}`);
    console.log(`- Log Level: ${this.app.logLevel}`);
    console.log(`- API Delay: ${this.app.apiDelayMs}ms`);
  }
}

export default new Config();
