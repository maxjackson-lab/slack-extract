"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnifiedAnalyzer = void 0;
const openaiClient_1 = require("./openaiClient");
const gammaClient_1 = require("./gammaClient");
const logger = require('../utils/logger');
// Experimental channel themes prompt (optional)
let EXPERIMENTAL_CHANNEL_ACTIVITY_PROMPT = null;
try {
    const experimentalPrompt = require('../prompts/channel-themes-experimental');
    EXPERIMENTAL_CHANNEL_ACTIVITY_PROMPT = experimentalPrompt.EXPERIMENTAL_CHANNEL_ACTIVITY_PROMPT;
}
catch (error) {
    // Experimental prompt file doesn't exist, that's fine
    logger.info('Experimental channel themes prompt not found, using default format');
}
/**
 * Unified analysis engine that processes all Slack data as one cohesive dataset
 * Provides holistic insights rather than chunked summaries
 */
class UnifiedAnalyzer {
    // Config is used by OpenAI client
    constructor(openaiApiKey, gammaApiKey, _config) {
        this.openaiClient = new openaiClient_1.OpenAIClient(openaiApiKey, _config);
        this.gammaClient = new gammaClient_1.GammaClient(gammaApiKey);
        // Config is used by OpenAI client
    }
    /**
     * Test API connections
     */
    async testConnections() {
        try {
            // Test OpenAI connection
            const openaiTest = await this.openaiClient.testConnection();
            // Test Gamma connection  
            const gammaTest = await this.gammaClient.testConnection();
            return {
                openai: openaiTest,
                gamma: gammaTest
            };
        }
        catch (error) {
            logger.logError(error, { operation: 'testConnections' });
            return { openai: false, gamma: false };
        }
    }
    /**
     * Perform unified analysis on all Slack data
     */
    async analyzeUnifiedData(csvFilePath) {
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
            const analysisResult = await this.performUnifiedAnalysis(unifiedDataset, csvData.length);
            // Step 4: Generate presentation
            logger.info('Generating Gamma presentation');
            const presentation = await this.gammaClient.generatePresentation(this.gammaClient.formatMarkdownForPresentation(analysisResult.markdownReport), 'Gambassadors Community Analysis - Unified Insights', `Comprehensive analysis of ${analysisResult.totalMessages} messages from ${new Date().toLocaleDateString()}`);
            // Step 5: Save markdown report
            const markdownFile = await this.saveMarkdownReport(analysisResult);
            const totalTime = Date.now() - startTime;
            logger.info('Unified analysis completed successfully', {
                totalTime: `${totalTime}ms`,
                totalMessages: analysisResult.totalMessages,
                presentationUrl: presentation.presentationUrl || 'Generated'
            });
            return {
                analysis: analysisResult,
                presentation: presentation,
                markdownFile
            };
        }
        catch (error) {
            logger.logError(error, { operation: 'analyzeUnifiedData' });
            throw error;
        }
    }
    /**
     * Load and parse CSV data
     */
    async loadCsvData(csvFilePath) {
        const fs = require('fs');
        const csv = require('csv-parser');
        const messages = [];
        return new Promise((resolve, reject) => {
            fs.createReadStream(csvFilePath)
                .pipe(csv())
                .on('data', (row) => {
                messages.push(row);
            })
                .on('end', () => {
                logger.info('CSV data loaded via csv-parser', {
                    totalMessages: messages.length,
                    sampleFields: Object.keys(messages[0] || {})
                });
                resolve(messages);
            })
                .on('error', (error) => {
                logger.logError(error, { operation: 'loadCsvData' });
                reject(error);
            });
        });
    }
    /**
     * Calculate detailed channel statistics
     */
    calculateChannelStats(messages) {
        const channelMap = new Map();
        messages.forEach(msg => {
            const channel = msg.Channel;
            if (!channelMap.has(channel)) {
                channelMap.set(channel, {
                    name: channel,
                    messageCount: 0,
                    users: new Set(),
                    threadCount: 0,
                    reactionCount: 0,
                    messages: []
                });
            }
            const stats = channelMap.get(channel);
            stats.messageCount++;
            stats.users.add(msg.User);
            stats.reactionCount += parseInt(msg.Total_Reactions || '0', 10);
            if (msg.Is_Thread_Reply === 'Yes') {
                stats.threadCount++;
            }
            stats.messages.push(msg);
        });
        const totalMessages = messages.length;
        const channelBreakdown = Array.from(channelMap.values())
            .map(stats => ({
            name: stats.name,
            messageCount: stats.messageCount,
            percentage: Math.round((stats.messageCount / totalMessages) * 100),
            activeUsers: stats.users.size,
            threadCount: stats.threadCount,
            reactionCount: stats.reactionCount
        }))
            .sort((a, b) => b.messageCount - a.messageCount);
        return {
            channelBreakdown,
            totalChannels: channelMap.size
        };
    }
    /**
     * Calculate topic distribution by analyzing message content
     */
    calculateTopicDistribution(messages) {
        const topicPatterns = {
            'API Integration': ['api', 'integration', 'endpoint', 'webhook', 'authenticate'],
            'Feature Requests': ['feature', 'request', 'wish', 'would like', 'should add', 'need'],
            'Bug Reports': ['bug', 'error', 'issue', 'not working', 'broken', 'problem'],
            'Template/Themes': ['template', 'theme', 'design', 'style', 'customize', 'branding'],
            'Images': ['image', 'photo', 'picture', 'upload', 'unsplash', 'visual'],
            'Pricing/Credits': ['pricing', 'credit', 'plan', 'subscription', 'cost', 'paid'],
            'General Discussion': [] // catch-all
        };
        const topicStats = new Map();
        // Initialize topics
        Object.keys(topicPatterns).forEach(topic => {
            topicStats.set(topic, { count: 0, channels: new Set() });
        });
        // Categorize messages
        messages.forEach(msg => {
            const content = (msg.Message || '').toLowerCase();
            let categorized = false;
            for (const [topic, keywords] of Object.entries(topicPatterns)) {
                if (keywords.length === 0)
                    continue; // Skip general discussion for now
                if (keywords.some(keyword => content.includes(keyword))) {
                    const stats = topicStats.get(topic);
                    stats.count++;
                    stats.channels.add(msg.Channel);
                    categorized = true;
                    break; // Assign to first matching topic only
                }
            }
            // If not categorized, it's general discussion
            if (!categorized) {
                const stats = topicStats.get('General Discussion');
                stats.count++;
                stats.channels.add(msg.Channel);
            }
        });
        const totalMessages = messages.length;
        const topics = Array.from(topicStats.entries())
            .map(([name, stats]) => ({
            name,
            keywords: topicPatterns[name] || [],
            messageCount: stats.count,
            percentage: Math.round((stats.count / totalMessages) * 100),
            channels: Array.from(stats.channels)
        }))
            .filter(t => t.messageCount > 0)
            .sort((a, b) => b.messageCount - a.messageCount);
        return { topics };
    }
    /**
     * Calculate engagement metrics
     */
    calculateEngagementMetrics(messages) {
        let totalReactions = 0;
        let messagesWithReactions = 0;
        let topLevelMessages = 0;
        let threadReplies = 0;
        let mostReactedMessage = null;
        let maxReactions = 0;
        messages.forEach(msg => {
            const reactions = parseInt(msg.Total_Reactions || '0', 10);
            totalReactions += reactions;
            if (reactions > 0) {
                messagesWithReactions++;
            }
            if (reactions > maxReactions) {
                maxReactions = reactions;
                mostReactedMessage = msg;
            }
            if (msg.Is_Thread_Reply === 'Yes') {
                threadReplies++;
            }
            else {
                topLevelMessages++;
            }
        });
        const totalMessages = messages.length;
        return {
            totalReactions,
            messagesWithReactions,
            reactionPercentage: Math.round((messagesWithReactions / totalMessages) * 100),
            topLevelMessages,
            threadReplies,
            threadPercentage: Math.round((threadReplies / totalMessages) * 100),
            averageReactionsPerMessage: totalMessages > 0 ?
                parseFloat((totalReactions / totalMessages).toFixed(2)) : 0,
            mostReactedMessage
        };
    }
    /**
     * Calculate user participation metrics
     */
    calculateUserMetrics(messages) {
        const userMap = new Map();
        messages.forEach(msg => {
            const user = msg.User;
            if (!userMap.has(user)) {
                userMap.set(user, {
                    messageCount: 0,
                    channels: new Set()
                });
            }
            const stats = userMap.get(user);
            stats.messageCount++;
            stats.channels.add(msg.Channel);
        });
        const totalMessages = messages.length;
        const totalUsers = userMap.size;
        const messagesPerUser = totalUsers > 0 ?
            parseFloat((totalMessages / totalUsers).toFixed(1)) : 0;
        const topUsers = Array.from(userMap.entries())
            .map(([name, stats]) => ({
            name,
            messageCount: stats.messageCount,
            percentage: Math.round((stats.messageCount / totalMessages) * 100),
            channels: Array.from(stats.channels)
        }))
            .sort((a, b) => b.messageCount - a.messageCount)
            .slice(0, 5); // Top 5 users
        return {
            totalUsers,
            messagesPerUser,
            topUsers
        };
    }
    /**
     * Calculate Gamma team response metrics
     */
    calculateGammaResponseMetrics(communityMessages, gammaMessages) {
        // Simple heuristic: messages with '?' are questions
        const questions = communityMessages.filter(msg => (msg.Message || '').includes('?'));
        let questionsWithResponse = 0;
        let totalResponseTime = 0;
        let responseCount = 0;
        questions.forEach(question => {
            const questionTime = new Date(question.Timestamp).getTime();
            const channel = question.Channel;
            // Look for Gamma response in same channel after question time
            const response = gammaMessages.find(gamma => gamma.Channel === channel &&
                new Date(gamma.Timestamp).getTime() > questionTime);
            if (response) {
                questionsWithResponse++;
                const responseTime = new Date(response.Timestamp).getTime();
                const hours = (responseTime - questionTime) / (1000 * 60 * 60);
                totalResponseTime += hours;
                responseCount++;
            }
        });
        return {
            totalCommunityQuestions: questions.length,
            questionsWithGammaResponse: questionsWithResponse,
            responseRate: questions.length > 0 ?
                Math.round((questionsWithResponse / questions.length) * 100) : 0,
            averageResponseTimeHours: responseCount > 0 ?
                parseFloat((totalResponseTime / responseCount).toFixed(1)) : null
        };
    }
    /**
     * Get date range from messages
     */
    getDateRange(messages) {
        if (messages.length === 0)
            return 'No data';
        const timestamps = messages.map(m => new Date(m.Timestamp).getTime());
        const earliest = new Date(Math.min(...timestamps));
        const latest = new Date(Math.max(...timestamps));
        // Format dates consistently: "Oct 1, 2025" format in PST
        const formatDate = (date) => {
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                timeZone: 'America/Los_Angeles'
            });
        };
        return `${formatDate(earliest)} to ${formatDate(latest)}`;
    }
    /**
     * Prepare unified dataset with cross-cutting analysis
     */
    prepareUnifiedDataset(messages) {
        // Filter Gamma employees
        const isGammaEmployee = (user) => {
            return user.includes('(Gamma') ||
                user.includes('( Gamma') ||
                user === 'Deeni Fatiha';
        };
        const communityMessages = messages.filter(m => !isGammaEmployee(m.User));
        const gammaEmployeeMessages = messages.filter(m => isGammaEmployee(m.User));
        // Calculate all statistics
        const communityChannelStats = this.calculateChannelStats(communityMessages);
        const topicDistribution = this.calculateTopicDistribution(communityMessages);
        const engagementMetrics = this.calculateEngagementMetrics(communityMessages);
        const userMetrics = this.calculateUserMetrics(communityMessages);
        const gammaChannelStats = this.calculateChannelStats(gammaEmployeeMessages);
        const responseMetrics = this.calculateGammaResponseMetrics(communityMessages, gammaEmployeeMessages);
        return `# Community Dataset (Excluding Gamma Employees)

## PRE-CALCULATED STATISTICS - USE THESE EXACT NUMBERS

### Message Overview
- **Total Community Messages**: ${communityMessages.length}
- **Total Gamma Employee Messages**: ${gammaEmployeeMessages.length}
- **Total Workspace Messages**: ${messages.length}
- **Community %**: ${Math.round((communityMessages.length / messages.length) * 100)}%
- **Time Period**: ${this.getDateRange(messages)}

### Channel Breakdown (Community)
${communityChannelStats.channelBreakdown.map(ch => `- **${ch.name}**: ${ch.messageCount} msgs (${ch.percentage}%), ${ch.activeUsers} users, ${ch.threadCount} thread replies, ${ch.reactionCount} reactions`).join('\n')}

### Topic Distribution (Community) - BASELINE CATEGORIES
**Pre-calculated from keyword matching:**
${topicDistribution.topics.map(topic => `- **${topic.name}**: ${topic.messageCount} msgs (${topic.percentage}%) across channels: ${topic.channels.join(', ')}`).join('\n')}

**NOTE:** These are BASELINE categories from keyword matching. You MAY identify additional emerging themes from raw message analysis if you can verify 4+ messages and 4+ users discussing a coherent topic not captured above.

### How to Use Topic Distribution:
1. **Start with these baseline topics** - use EXACT counts for themes that match these categories
2. **Look for emerging themes** - review raw messages for topics not captured by baseline categories
3. **Verify emerging themes** - must have 4+ messages, 4+ users, and be verifiable from raw data
4. **Cross-validate** - your final theme counts should account for all messages when combined

### Engagement Metrics (Community)
- **Total Reactions**: ${engagementMetrics.totalReactions}
- **Messages with Reactions**: ${engagementMetrics.messagesWithReactions} (${engagementMetrics.reactionPercentage}%)
- **Average Reactions/Message**: ${engagementMetrics.averageReactionsPerMessage}
- **Top-level Messages**: ${engagementMetrics.topLevelMessages} (${Math.round((engagementMetrics.topLevelMessages / communityMessages.length) * 100)}%)
- **Thread Replies**: ${engagementMetrics.threadReplies} (${engagementMetrics.threadPercentage}%)
${engagementMetrics.mostReactedMessage ? `- **Most Reacted**: [${engagementMetrics.mostReactedMessage.User}](${engagementMetrics.mostReactedMessage.Slack_URL}) with ${engagementMetrics.mostReactedMessage.Total_Reactions} reactions` : ''}

### User Participation (Community)
- **Total Users**: ${userMetrics.totalUsers}
- **Messages per User (avg)**: ${userMetrics.messagesPerUser}
- **Top Contributors**:
${userMetrics.topUsers.map(user => `  - ${user.name}: ${user.messageCount} msgs (${user.percentage}%) in ${user.channels.length} channels`).join('\n')}

### Gamma Team Response Metrics
- **Community Questions**: ${responseMetrics.totalCommunityQuestions}
- **Questions Answered by Gamma**: ${responseMetrics.questionsWithGammaResponse} (${responseMetrics.responseRate}% response rate)
${responseMetrics.averageResponseTimeHours !== null ? `- **Average Response Time**: ${responseMetrics.averageResponseTimeHours} hours` : ''}

### Gamma Team Channel Activity
${gammaChannelStats.channelBreakdown.map(ch => `- **${ch.name}**: ${ch.messageCount} msgs (${ch.percentage}% of Gamma activity)`).join('\n')}

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
    async performUnifiedAnalysis(unifiedDataset, totalMessages) {
        // System prompt is handled by the OpenAI client configuration
        const userPrompt = `# Gambassadors Community Analysis

CRITICAL REQUIREMENTS:
1. Use ONLY the ACTUAL Slack_URL values from the data
2. Use REAL usernames from the User field
3. Use GPT-4o (not GPT-5)
4. Use \\n---\\n to separate slides for Gamma
5. Use the EXACT "Time Period" date range from PRE-CALCULATED STATISTICS above - do not calculate or modify dates

**BALANCE STATS WITH STORIES - CRITICAL:**
6. USE THE PRE-CALCULATED STATISTICS to establish context and magnitude
7. Lead with numbers, then dive deep into qualitative examples and user voices
8. Stats show WHAT happened, quotes and examples show WHY it matters
9. Don't let percentages drown out the human stories - use stats as anchors, not the whole analysis
10. Trends require 4+ users AND meaningful theme, not just category grouping

**Data:** ${unifiedDataset}

**EXAMPLES OF USING PRE-CALCULATED STATS:**

✅ CORRECT (Using Baseline Topic): "API Integration dominated discussions with 15 messages (23% of community activity), primarily in generate-api-discussion channel - this matches the Pre-Calculated Topic Distribution"
❌ WRONG: "API was discussed a lot" (no stats)

✅ CORRECT (Emerging Theme): "Security Concerns emerged as a theme with 4 messages from 4 different users (Jordan, Alex, Taylor, Morgan) discussing enterprise features, encryption, SOC2, and SSO - verified from raw message data"
❌ WRONG: "Several users mentioned security" (vague, no verification)

✅ CORRECT: "The community showed strong engagement with 45% of messages receiving reactions and an average of 1.8 reactions per message"  
❌ WRONG: "Good engagement" (no numbers)

✅ CORRECT: "Template Customization emerged as a pattern with 5 users (Yazan, Alex, CEO Pro AI, Matthew, Jordan) across 8 messages in 2 channels"
❌ WRONG: "Many users want template features" (vague, no specific count)

**BASELINE vs EMERGING THEMES:**
- Use baseline topics from "Topic Distribution (Community)" with EXACT message counts
- You MAY identify emerging themes not in baseline if verified from raw data (4+ msgs, 4+ users)
- Label them clearly: "[Baseline]" or "[Emerging - verified from raw data]"

Output structure with statistics integrated throughout...

---

# Gambassadors Community Insights
Week of [Copy exact "Time Period" from PRE-CALCULATED STATISTICS above]

---

## Community Snapshot 📊

**Activity Overview:**
- **[X] community messages** from **[Y] active members** ([Z] messages per user average)
- **[X] total messages** analyzed from Gambassadors workspace this period
- Active across **[C] channels** with **[D]% of messages** in top 3 channels

**Engagement Health:**
- **[E]% of messages** received reactions ([F] total reactions)
- **[G]% were thread replies** showing active discussions
- Gamma team **responded to [H]% of questions** with **[I] hour average response time**

---

${process.env.USE_EXPERIMENTAL_CHANNEL_PROMPT === 'true' && EXPERIMENTAL_CHANNEL_ACTIVITY_PROMPT ?
            EXPERIMENTAL_CHANNEL_ACTIVITY_PROMPT :
            `## Channel Activity 📍

**Top Channels by Volume:**

**1. [Channel Name]** ([X] msgs, [Y]% of total)
- [Z] active users engaged this week  
- [B] thread replies ([C]% threading rate)
- Primary topics: [Use topic distribution for this channel]
- Key discussion: [Real example with link]

**2. [Channel Name]** ([X] msgs, [Y]% of total)
[Same format]

---`}

---

## Topic Deep Dive 🔍

**What the Community Discussed:**

**API Integration** ([X] msgs, [Y]% of activity)
- Mentioned across [Z] channels, primarily [Channel name]
- Trending pattern: [Describe with real examples and links]
- User quotes: [Real examples]

**Feature Requests** ([X] msgs, [Y]% of activity)
- [Same format]

**Bug Reports** ([X] msgs, [Y]% of activity)
- [Same format]

---

## Trending Patterns 🔥

**IMPORTANT:** A trend requires 4+ different users discussing a similar theme. This ensures patterns are genuine community needs, not coincidental overlap. List 3-5 trends minimum.

**For each trend:**
- Lead with the theme and stats: "X users discussed [topic] across Y channels (Z messages)"
- Quote 2-3 specific users with their actual messages and links
- Explain why this matters to the community

**Example format:**
**Template Customization Requests** (5 users, 8 messages, 12% of API discussions)
- Yazan: "I really need the client to upload his sample deck..." [link]
- Alex: "Is there a way to upload exact design template..." [link]  
- CEO Pro AI: "Would love to use existing templates via API" [link]
- Matthew: "Option to specify a template via the generate API" [link]
- Jordan: "Would be great to have template selection" [link]
*Why it matters: 5 different users across 3 channels shows this is a major community need, not coincidence*

---

## Notable Highlights 💡

**IMPORTANT:** List 5-7 interesting one-off items that tell rich stories. These don't need 2+ users.

**Look for:**
- Creative use cases (real estate, medical, unique industries)
- Highly-reacted messages (what resonated?)
- Unexpected feedback or surprising insights
- Technical deep-dives from power users
- Community moments (gratitude, frustration, breakthroughs)

**Format each highlight:**
- Start with compelling hook
- Include actual user quote with link
- Add reaction count if high
- Explain why it's noteworthy

**Example:**
"Ruby Y shared how Gamma saved her from burning midnight oil while on baby feeding duty - received 12 reactions, the week's most-engaged post. Shows Gamma's value for busy professionals managing work-life balance." [link]

---

## Gamma Team Engagement 👥

**Response Coverage:**
- Team sent **[X] messages** ([Y]% of analyzed messages in monitored channels)
- Active in **[Z] channels** with focus on [Top channel] ([A]% of team messages)
- Responded to **[B]% of community questions** averaging **[C] hour response time**

**Channel Presence:**
[Use pre-calculated Gamma channel stats]

**Most Active Team Members:**
[Use user metrics for Gamma employees]

---

*Based on [X] community messages + [Y] Gamma messages = [Z] total workspace messages*  
*Weekly message activity: [Copy exact "Time Period" from PRE-CALCULATED STATISTICS above]*  
*Analysis generated using GPT-4o on ${new Date().toLocaleDateString()}*`;
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
            totalMessages: totalMessages,
            totalTokens: result.tokenUsage.total,
            totalProcessingTime: result.processingTime,
            markdownReport: result.analysis,
            insights: this.extractUnifiedInsights(result.analysis)
        };
    }
    /**
     * Extract unified insights from analysis
     */
    extractUnifiedInsights(_analysis) {
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
    async saveMarkdownReport(analysis) {
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
exports.UnifiedAnalyzer = UnifiedAnalyzer;
//# sourceMappingURL=unifiedAnalyzer.js.map