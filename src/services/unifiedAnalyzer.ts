import { OpenAIClient } from './openaiClient';
import { GammaClient } from './gammaClient';
import { 
  AggregatedAnalysis, 
  GammaPresentationResult,
  AnalysisConfig
} from '../types/analysis';
const logger = require('../utils/logger');

/**
 * Unified analysis engine that processes all Slack data as one cohesive dataset
 * Provides holistic insights rather than chunked summaries
 */
export class UnifiedAnalyzer {
  private openaiClient: OpenAIClient;
  private gammaClient: GammaClient;
  // Config is used by OpenAI client

  constructor(openaiApiKey: string, gammaApiKey: string, _config: AnalysisConfig) {
    this.openaiClient = new OpenAIClient(openaiApiKey, _config);
    this.gammaClient = new GammaClient(gammaApiKey);
    // Config is used by OpenAI client
  }

  /**
   * Perform unified analysis on all Slack data
   */
  async analyzeUnifiedData(csvFilePath: string): Promise<{
    analysis: AggregatedAnalysis;
    presentation: GammaPresentationResult;
    markdownFile: string;
  }> {
    const startTime = Date.now();
    
    try {
      logger.info('Starting unified Slack data analysis');

      // Step 1: Load and parse all CSV data
      const csvData = await this.loadCsvData(csvFilePath);
      logger.info('CSV data loaded', { 
        totalMessages: csvData.length,
        channels: [...new Set(csvData.map(m => m.Channel))].length,
        users: [...new Set(csvData.map(m => m.User))].length
      });

      // Step 2: Prepare unified dataset for analysis
      const unifiedDataset = this.prepareUnifiedDataset(csvData);
      
      // Step 3: Perform comprehensive unified analysis
      logger.info('Performing unified analysis with GPT-4o');
      const analysisResult = await this.performUnifiedAnalysis(unifiedDataset);
      
      // Step 4: Generate presentation
      logger.info('Generating Gamma presentation');
      const presentation = await this.gammaClient.generatePresentation(
        this.gammaClient.formatMarkdownForPresentation(analysisResult.markdownReport),
        'Gambassadors Community Analysis - Unified Insights',
        `Comprehensive analysis of ${analysisResult.totalMessages} messages from ${new Date().toLocaleDateString()}`
      );

      // Step 5: Save markdown report
      const markdownFile = await this.saveMarkdownReport(analysisResult);

      const totalTime = Date.now() - startTime;
      logger.info('Unified analysis completed successfully', {
        totalTime: `${totalTime}ms`,
        totalMessages: analysisResult.totalMessages,
        presentationUrl: (presentation as any).url || 'Generated'
      });

      return {
        analysis: analysisResult,
        presentation: presentation as any,
        markdownFile
      };

    } catch (error) {
      logger.logError(error, { operation: 'analyzeUnifiedData' });
      throw error;
    }
  }

  /**
   * Load and parse CSV data
   */
  private async loadCsvData(csvFilePath: string): Promise<any[]> {
    const fs = require('fs');
    const csvData = fs.readFileSync(csvFilePath, 'utf8');
    
    const lines = csvData.split('\n');
    const headers = lines[0].split(',');
    const messages = [];

    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const values = lines[i].split(',');
        if (values.length >= headers.length) {
        const message: any = {};
        headers.forEach((header: string, index: number) => {
          message[header] = values[index] || '';
        });
          messages.push(message);
        }
      }
    }

    return messages;
  }

  /**
   * Prepare unified dataset with cross-cutting analysis
   */
  private prepareUnifiedDataset(messages: any[]): string {
    // NEW: Filter messages by Gamma employees vs community
    const isGammaEmployee = (user: string) => {
      return user.includes('(Gamma') || user.includes('( Gamma');
    };
    
    const communityMessages = messages.filter(m => !isGammaEmployee(m.User));
    const gammaEmployeeMessages = messages.filter(m => isGammaEmployee(m.User));
    
    // Continue with analysis using communityMessages only
    const channelActivity = this.analyzeChannelActivity(communityMessages);
    const userEngagement = this.analyzeUserEngagement(communityMessages);
    const temporalPatterns = this.analyzeTemporalPatterns(communityMessages);
    const contentThemes = this.analyzeContentThemes(communityMessages);
    const interactionPatterns = this.analyzeInteractionPatterns(communityMessages);

    return `# Community Dataset (Excluding Gamma Employees)

## Dataset Overview
- **Total Community Messages**: ${communityMessages.length}
- **Total Gamma Employee Messages**: ${gammaEmployeeMessages.length}
- **Time Period**: ${this.getDateRange(messages)}
- **Active Channels**: ${channelActivity.channels.length}
- **Active Community Users**: ${userEngagement.users.length}

## Channel Activity Patterns
${channelActivity.summary}

## User Engagement Analysis
${userEngagement.summary}

## Temporal Patterns
${temporalPatterns.summary}

## Content Theme Analysis
${contentThemes.summary}

## Interaction Patterns
${interactionPatterns.summary}

## Raw Community Message Data for Deep Analysis
${communityMessages.map((msg, index) => `
**Message ${index + 1}**
- **Channel:** ${msg.Channel}
- **User:** ${msg.User}
- **Time:** ${msg.Timestamp}
- **Content:** ${msg.Message}
- **Link:** ${msg.Slack_URL}
- **Reactions:** ${msg.Total_Reactions || 0}
- **Type:** ${msg.Is_Thread_Reply === 'Yes' ? 'Thread Reply' : 'Top-level Message'}
`).join('\n')}

## Gamma Employee Activity Data
${gammaEmployeeMessages.map((msg, index) => `
**Gamma Message ${index + 1}**
- **Channel:** ${msg.Channel}
- **User:** ${msg.User}
- **Time:** ${msg.Timestamp}
- **Content:** ${msg.Message}
- **Link:** ${msg.Slack_URL}
- **Reactions:** ${msg.Total_Reactions || 0}
- **Type:** ${msg.Is_Thread_Reply === 'Yes' ? 'Thread Reply' : 'Top-level Message'}
`).join('\n')}`;
  }

  /**
   * Perform comprehensive unified analysis with GPT-4o
   */
  private async performUnifiedAnalysis(unifiedDataset: string): Promise<AggregatedAnalysis> {
    // System prompt is handled by the OpenAI client configuration

    const userPrompt = `# Gambassadors Community Analysis

Analyze this Slack community data. CRITICAL: Community messages EXCLUDE Gamma employees - they are analyzed separately.

**Data:** ${unifiedDataset}

**TREND DETECTION RULES:**
- A TREND requires 2+ different users mentioning the same/similar idea
- ONE user mentioning something = HIGHLIGHT, not a trend
- Count unique users for each pattern before calling it a trend
- Label trends with user count: "Mentioned by X users"

Extract: trends (2+ users), highlights (1 user), feature requests, success stories, recurring questions.

Output markdown only. No JSON. Start with # heading.

---

# Gambassadors Community Insights
Week of [Date] Snapshot

## Community Overview (Excluding Gamma Employees)
[2-3 sentences: vibe, energy, themes from community members ONLY]

**Activity:** [X] community messages, [Y] community members, top topics: [3-4 themes]

## What's Trending 🔥 (Multi-user Patterns)

**Popular Features** (2+ users each)
- Feature: Why it works - Mentioned by X users [link1] [link2]
- Another: Feedback - Mentioned by X users [link]
[Only include if 2+ different users mentioned it]

**Recurring Requests** (2+ users each)
- [Request](link): Use case - Mentioned by X users [link1] [link2]
[Only include if 2+ different users requested it]

## Notable Highlights 💡 (One-off Feedback)

**Interesting Use Cases**
- [Use case](link): What they built (single mention)
- Another unique idea: Description (single mention)
[One-off interesting feedback, clearly labeled as single mentions]

**Feature Wishlist** (Single requests)
- [Request](link): Why they need it (single mention)

## What's Challenging 😓

**Recurring Questions** (2+ users)
- Topic: Pattern - Asked by X users [link1] [link2]
[Only patterns with 2+ users]

**Friction Points**
- Issue: Impact
- [Challenge](link): Where stuck

## Notable Feedback

> "Quote" - Member, [link](url)
> "Quote" - Member, [link](url)
[4-6 quotes, mix positive/constructive]

## Gamma Team Engagement 👥

**Team Activity Summary**
- Total Gamma messages: [X]
- Most active: [names]
- Key interactions: [what they focused on]

**Gamma Team Contributions**
- Support provided: [examples with links]
- Feature discussions: [what they engaged with]
- Community building: [how they participated]

---
*Based on [X] community messages + [Y] Gamma employee messages from [date range]*`;

    // Create a mock chunk for the unified analysis with the custom prompt
    const mockChunk = {
      messages: [],
      chunkIndex: 0,
      totalChunks: 1,
      content: userPrompt, // This contains the full prompt with data
      tokenCount: (userPrompt + unifiedDataset).length / 4 // Rough token estimate including data
    };
    const result = await this.openaiClient.analyzeChunk(mockChunk);
    
    return {
      totalChunks: 1, // Unified analysis is one comprehensive chunk
      totalMessages: this.extractMessageCount(unifiedDataset),
      totalTokens: result.tokenUsage.total,
      totalProcessingTime: result.processingTime,
      markdownReport: result.analysis,
      insights: this.extractUnifiedInsights(result.analysis)
    };
  }

  /**
   * Analyze channel activity patterns
   */
  private analyzeChannelActivity(messages: any[]): any {
    const channelStats: any = {};
    messages.forEach(msg => {
      if (!channelStats[msg.Channel]) {
        channelStats[msg.Channel] = { count: 0, users: new Set(), reactions: 0 };
      }
      channelStats[msg.Channel].count++;
      channelStats[msg.Channel].users.add(msg.User);
      channelStats[msg.Channel].reactions += parseInt(msg.Total_Reactions || 0);
    });

    const channels = Object.entries(channelStats)
      .map(([name, stats]: [string, any]) => ({
        name,
        messageCount: stats.count,
        uniqueUsers: stats.users.size,
        totalReactions: stats.reactions,
        engagement: stats.reactions / stats.count
      }))
      .sort((a, b) => b.messageCount - a.messageCount);

    return {
      channels,
      summary: `Top channels by activity: ${channels.slice(0, 3).map(c => `${c.name} (${c.messageCount} msgs)`).join(', ')}`
    };
  }

  /**
   * Analyze user engagement patterns
   */
  private analyzeUserEngagement(messages: any[]): any {
    const userStats: any = {};
    messages.forEach(msg => {
      if (!userStats[msg.User]) {
        userStats[msg.User] = { messages: 0, channels: new Set(), reactions: 0 };
      }
      userStats[msg.User].messages++;
      userStats[msg.User].channels.add(msg.Channel);
      userStats[msg.User].reactions += parseInt(msg.Total_Reactions || 0);
    });

    const users = Object.entries(userStats)
      .map(([name, stats]: [string, any]) => ({
        name,
        messageCount: stats.messages,
        channelDiversity: stats.channels.size,
        totalReactions: stats.reactions,
        influence: stats.reactions / stats.messages
      }))
      .sort((a, b) => b.messageCount - a.messageCount);

    return {
      users,
      summary: `Most active users: ${users.slice(0, 3).map(u => `${u.name} (${u.messageCount} msgs)`).join(', ')}`
    };
  }

  /**
   * Analyze temporal patterns
   */
  private analyzeTemporalPatterns(messages: any[]): any {
    const hourlyActivity: any = {};
    const dailyActivity: any = {};
    
    messages.forEach(msg => {
      const date = new Date(msg.Timestamp);
      const hour = date.getHours();
      const day = date.toDateString();
      
      hourlyActivity[hour] = (hourlyActivity[hour] || 0) + 1;
      dailyActivity[day] = (dailyActivity[day] || 0) + 1;
    });

    const peakHour = Object.entries(hourlyActivity).sort(([,a], [,b]) => (b as number) - (a as number))[0];
    const peakDay = Object.entries(dailyActivity).sort(([,a], [,b]) => (b as number) - (a as number))[0];

    return {
      summary: `Peak activity: ${peakHour[0]}:00 (${peakHour[1]} msgs), Peak day: ${peakDay[0]} (${peakDay[1]} msgs)`
    };
  }

  /**
   * Analyze content themes
   */
  private analyzeContentThemes(messages: any[]): any {
    const themes = {
      featureRequests: 0,
      bugReports: 0,
      questions: 0,
      announcements: 0,
      discussions: 0
    };

    messages.forEach(msg => {
      const content = msg.Message.toLowerCase();
      if (content.includes('feature') || content.includes('build next') || content.includes('should gamma')) {
        themes.featureRequests++;
      } else if (content.includes('bug') || content.includes('issue') || content.includes('problem') || msg.Channel === 'bugs') {
        themes.bugReports++;
      } else if (content.includes('?') || msg.Channel === 'questions') {
        themes.questions++;
      } else if (content.includes('announcement') || msg.Channel === 'gamma-announcements') {
        themes.announcements++;
      } else {
        themes.discussions++;
      }
    });

    const topTheme = Object.entries(themes).sort(([,a], [,b]) => b - a)[0];

    return {
      themes,
      summary: `Top content theme: ${topTheme[0]} (${topTheme[1]} messages)`
    };
  }

  /**
   * Analyze interaction patterns
   */
  private analyzeInteractionPatterns(messages: any[]): any {
    const threadReplies = messages.filter(m => m.Is_Thread_Reply === 'Yes').length;
    const topLevelMessages = messages.length - threadReplies;
    const totalReactions = messages.reduce((sum, m) => sum + parseInt(m.Total_Reactions || 0), 0);

    return {
      summary: `Interaction patterns: ${threadReplies} thread replies, ${topLevelMessages} top-level messages, ${totalReactions} total reactions`
    };
  }

  /**
   * Get date range from messages
   */
  private getDateRange(messages: any[]): string {
    const dates = messages.map(m => new Date(m.Timestamp)).sort();
    const start = dates[0].toDateString();
    const end = dates[dates.length - 1].toDateString();
    return `${start} to ${end}`;
  }

  /**
   * Extract message count from dataset
   */
  private extractMessageCount(dataset: string): number {
    const match = dataset.match(/Total Messages\*\*: (\d+)/);
    return match ? parseInt(match[1]) : 0;
  }

  /**
   * Extract unified insights from analysis
   */
  private extractUnifiedInsights(_analysis: string): any {
    return {
      communityActivity: 'Unified analysis provides holistic community insights',
      featureFeedback: 'Cross-cutting feature patterns identified',
      successStories: 'Community success patterns synthesized',
      supportPatterns: 'Unified support network analysis',
      emergingTrends: 'Community evolution patterns identified'
    };
  }

  /**
   * Save markdown report
   */
  private async saveMarkdownReport(analysis: AggregatedAnalysis): Promise<string> {
    const fs = require('fs');
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `exports/slack-analysis-unified-${timestamp}.md`;
    
    const report = `# Unified Slack Community Analysis Report

*Generated on ${new Date().toLocaleDateString()}*

## Summary Statistics
- **Total Messages Analyzed**: ${analysis.totalMessages}
- **Analysis Type**: Unified (Single Comprehensive Analysis)
- **Total Tokens Used**: ${analysis.totalTokens}
- **Processing Time**: ${(analysis.totalProcessingTime / 1000).toFixed(2)}s

---

## Unified Analysis Results

${analysis.markdownReport}

---
*Based on unified analysis of ${analysis.totalMessages} messages*`;

    fs.writeFileSync(filename, report);
    logger.info('Unified markdown report saved', { filename });
    
    return filename;
  }
}
