"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlackAnalyzer = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const chunkProcessor_1 = require("./chunkProcessor");
const openaiClient_1 = require("./openaiClient");
const gammaClient_1 = require("./gammaClient");
const index_1 = __importDefault(require("../config/index"));
const logger = require('../utils/logger');
/**
 * Main analysis engine that orchestrates the complete pipeline
 */
class SlackAnalyzer {
    constructor(openaiApiKey, gammaApiKey, config) {
        this.chunkProcessor = new chunkProcessor_1.ChunkProcessor();
        this.config = this.getDefaultConfig(config);
        this.openaiClient = new openaiClient_1.OpenAIClient(openaiApiKey, this.config);
        this.gammaClient = new gammaClient_1.GammaClient(gammaApiKey);
    }
    /**
     * Set progress callback for UI updates
     */
    setProgressCallback(callback) {
        this.progressCallback = callback;
    }
    /**
     * Main analysis pipeline: CSV → Chunks → GPT Analysis → Aggregation → Gamma Presentation
     */
    async analyzeSlackData(csvFilePath) {
        const startTime = Date.now();
        try {
            logger.info('Starting Slack data analysis pipeline');
            // Step 1: Find and process CSV file
            const csvFile = csvFilePath || this.chunkProcessor.findLatestCsvFile();
            if (!csvFile) {
                throw new Error('No CSV file found. Please run the Slack extractor first.');
            }
            this.updateProgress({
                currentChunk: 0,
                totalChunks: 0,
                status: 'processing',
                currentOperation: 'Processing CSV file...',
                startTime
            });
            const chunks = await this.chunkProcessor.processCsvFile(csvFile, this.config.chunkSize);
            const stats = this.chunkProcessor.getChunkStats(chunks);
            logger.info('CSV processing completed', stats);
            // Step 2: Analyze chunks with GPT-5
            this.updateProgress({
                currentChunk: 0,
                totalChunks: chunks.length,
                status: 'processing',
                currentOperation: 'Analyzing with GPT-5...',
                startTime
            });
            const analysisResults = await this.analyzeChunksWithProgress(chunks);
            // Step 3: Aggregate results
            this.updateProgress({
                currentChunk: chunks.length,
                totalChunks: chunks.length,
                status: 'processing',
                currentOperation: 'Aggregating analysis results...',
                startTime
            });
            const aggregatedAnalysis = this.aggregateAnalysisResults(analysisResults, chunks);
            // Step 4: Generate presentation
            this.updateProgress({
                currentChunk: chunks.length,
                totalChunks: chunks.length,
                status: 'processing',
                currentOperation: 'Generating presentation...',
                startTime
            });
            const presentation = await this.gammaClient.generatePresentation(this.gammaClient.formatMarkdownForPresentation(aggregatedAnalysis.markdownReport), 'Slack Community Analysis', `Weekly analysis of ${aggregatedAnalysis.totalMessages} messages from ${new Date().toLocaleDateString()}`);
            // Step 5: Save markdown report
            const markdownFile = await this.saveMarkdownReport(aggregatedAnalysis);
            // Complete
            this.updateProgress({
                currentChunk: chunks.length,
                totalChunks: chunks.length,
                status: 'completed',
                currentOperation: 'Analysis complete!',
                startTime
            });
            const totalTime = Date.now() - startTime;
            logger.info('Analysis pipeline completed successfully', {
                totalTime: `${totalTime}ms`,
                totalMessages: aggregatedAnalysis.totalMessages,
                totalChunks: aggregatedAnalysis.totalChunks,
                presentationUrl: presentation.presentationUrl
            });
            return {
                analysis: aggregatedAnalysis,
                presentation,
                markdownFile
            };
        }
        catch (error) {
            this.updateProgress({
                currentChunk: 0,
                totalChunks: 0,
                status: 'error',
                currentOperation: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
                startTime
            });
            logger.logError(error, { operation: 'analyzeSlackData' });
            throw error;
        }
    }
    /**
     * Analyze chunks with progress updates
     */
    async analyzeChunksWithProgress(chunks) {
        const results = [];
        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            this.updateProgress({
                currentChunk: i + 1,
                totalChunks: chunks.length,
                status: 'processing',
                currentOperation: `Analyzing chunk ${i + 1}/${chunks.length}...`,
                startTime: Date.now()
            });
            try {
                const result = await this.openaiClient.analyzeChunk(chunk);
                results.push(result);
            }
            catch (error) {
                logger.logError(error, { operation: 'analyzeChunksWithProgress', chunkIndex: i + 1 });
                throw error;
            }
        }
        return results;
    }
    /**
     * Aggregate individual chunk analyses into a comprehensive report
     */
    aggregateAnalysisResults(results, chunks) {
        const totalMessages = chunks.reduce((sum, chunk) => sum + chunk.messages.length, 0);
        const totalTokens = results.reduce((sum, result) => sum + result.tokenUsage.total, 0);
        const totalProcessingTime = results.reduce((sum, result) => sum + result.processingTime, 0);
        // Combine all analyses
        const combinedAnalysis = results
            .map(result => result.analysis)
            .join('\n\n---\n\n');
        // Extract insights using simple parsing (could be enhanced with more sophisticated NLP)
        const insights = this.extractInsights(combinedAnalysis);
        return {
            totalChunks: results.length,
            totalMessages,
            totalTokens,
            totalProcessingTime,
            markdownReport: combinedAnalysis,
            insights
        };
    }
    /**
     * Extract structured insights from the combined analysis
     */
    extractInsights(combinedAnalysis) {
        // Simple extraction based on common patterns
        // This could be enhanced with more sophisticated parsing
        const sections = combinedAnalysis.split(/##\s+/);
        const findSection = (keywords) => {
            const section = sections.find(s => keywords.some(keyword => s.toLowerCase().includes(keyword)));
            return section ? section.replace(/^[^#]*/, '').trim() : 'No specific insights found.';
        };
        return {
            communityActivity: findSection(['activity', 'engagement', 'community', 'participation']),
            featureFeedback: findSection(['feedback', 'feature', 'request', 'improvement', 'suggestion']),
            successStories: findSection(['success', 'story', 'case study', 'achievement', 'win']),
            supportPatterns: findSection(['support', 'help', 'question', 'issue', 'problem']),
            emergingTrends: findSection(['trend', 'emerging', 'pattern', 'development', 'growth'])
        };
    }
    /**
     * Save markdown report to file
     */
    async saveMarkdownReport(analysis) {
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `slack-analysis-${timestamp}.md`;
        const filepath = path.join('exports', filename);
        // Ensure exports directory exists
        if (!fs.existsSync('exports')) {
            fs.mkdirSync('exports', { recursive: true });
        }
        const reportContent = `# Slack Community Analysis Report

*Generated on ${new Date().toLocaleDateString()}*

## Summary Statistics
- **Total Messages Analyzed**: ${analysis.totalMessages}
- **Analysis Chunks**: ${analysis.totalChunks}
- **Total Tokens Used**: ${analysis.totalTokens.toLocaleString()}
- **Processing Time**: ${(analysis.totalProcessingTime / 1000).toFixed(2)}s

---

## Analysis Results

${analysis.markdownReport}

---

## Structured Insights

### Community Activity
${analysis.insights.communityActivity}

### Feature Feedback
${analysis.insights.featureFeedback}

### Success Stories
${analysis.insights.successStories}

### Support Patterns
${analysis.insights.supportPatterns}

### Emerging Trends
${analysis.insights.emergingTrends}

---

*Report generated by Slack Extractor with GPT-5 analysis*
`;
        fs.writeFileSync(filepath, reportContent, 'utf8');
        logger.info(`Markdown report saved: ${filepath}`);
        return filepath;
    }
    /**
     * Update progress for UI
     */
    updateProgress(progress) {
        if (this.progressCallback) {
            this.progressCallback(progress);
        }
    }
    /**
     * Test all API connections
     */
    async testConnections() {
        logger.info('Testing analysis service connections');
        const [openaiConnected, gammaConnected] = await Promise.all([
            this.openaiClient.testConnection(),
            this.gammaClient.testConnection()
        ]);
        const allConnected = openaiConnected && gammaConnected;
        if (allConnected) {
            logger.info('All analysis service connections successful');
        }
        else {
            logger.logWarning('Some analysis service connections failed', {
                openai: openaiConnected,
                gamma: gammaConnected
            });
        }
        return {
            openai: openaiConnected,
            gamma: gammaConnected
        };
    }
    /**
     * Get default configuration
     */
    getDefaultConfig(overrides) {
        return {
            chunkSize: 25,
            maxTokensPerChunk: 200000,
            gptModel: index_1.default.analysis.gptModel,
            systemPrompt: index_1.default.analysis.systemPrompt,
            userPromptTemplate: index_1.default.analysis.userPromptTemplate,
            retryAttempts: 3,
            retryDelay: 2000,
            ...overrides
        };
    }
}
exports.SlackAnalyzer = SlackAnalyzer;
//# sourceMappingURL=slackAnalyzer.js.map