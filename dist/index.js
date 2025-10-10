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
const cron = __importStar(require("node-cron"));
const readline = __importStar(require("readline"));
const config_1 = __importDefault(require("./config"));
const logger = require('./utils/logger');
const slackService = require('./services/slackService');
const csvService = require('./services/csvService');
const slackAnalyzer_1 = require("./services/slackAnalyzer");
/**
 * Main Application
 * Orchestrates the Slack data extraction, analysis, and presentation generation
 */
class SlackExtractorApp {
    constructor() {
        this.isRunning = false;
        this.cronJob = null;
        this.analyzer = null;
        this.setupAnalyzer();
    }
    /**
     * Setup the analysis engine
     */
    setupAnalyzer() {
        const openaiApiKey = process.env.OPENAI_API_KEY;
        const gammaApiKey = process.env.GAMMA_API_KEY;
        if (openaiApiKey && gammaApiKey) {
            this.analyzer = new slackAnalyzer_1.SlackAnalyzer(openaiApiKey, gammaApiKey);
            logger.info('Analysis engine initialized with OpenAI and Gamma APIs');
        }
        else {
            logger.logWarning('Analysis features disabled - missing API keys', {
                openai: !!openaiApiKey,
                gamma: !!gammaApiKey
            });
        }
    }
    /**
     * Main execution function
     */
    async run() {
        if (this.isRunning) {
            logger.logWarning('Extraction already in progress, skipping this run');
            return;
        }
        this.isRunning = true;
        const startTime = Date.now();
        logger.logLifecycle('Starting Slack data extraction and upload process');
        try {
            // Step 1: Test connections
            await this.testConnections();
            // Step 2: Extract data from Slack
            logger.logLifecycle('Step 1: Extracting data from Slack');
            const slackData = await slackService.extractWorkspaceData();
            if (!slackData || slackData.length === 0) {
                logger.warn('No data extracted from Slack');
                return;
            }
            // Step 3: Generate CSV
            logger.logLifecycle('Step 2: Generating CSV file');
            const csvResult = await csvService.createCsvBuffer(slackData);
            // Step 2.5: Save CSV locally as backup
            logger.logLifecycle('Step 2.5: Saving CSV locally as backup');
            const localCsvResult = await csvService.createCsvFile(slackData, csvResult.filename);
            logger.info('CSV saved locally', { path: localCsvResult.filePath });
            // Step 4: Log results
            const duration = Date.now() - startTime;
            const stats = csvService.getCsvStats(slackData);
            logger.logLifecycle('Process completed successfully', {
                duration: `${duration}ms`,
                recordsProcessed: slackData.length,
                csvFilename: csvResult.filename,
                statistics: stats
            });
            // Log summary
            this.logSummary(stats);
        }
        catch (error) {
            const duration = Date.now() - startTime;
            logger.logError(error, {
                operation: 'mainProcess',
                duration: `${duration}ms`
            });
            throw error;
        }
        finally {
            this.isRunning = false;
        }
    }
    /**
     * Run analysis on existing CSV data
     */
    async runAnalysis(csvFilePath) {
        if (!this.analyzer) {
            throw new Error('Analysis engine not available. Please check your API keys.');
        }
        logger.logLifecycle('Starting Slack data analysis');
        try {
            // Test analysis connections
            const connections = await this.analyzer.testConnections();
            if (!connections.openai || !connections.gamma) {
                throw new Error('Analysis API connections failed');
            }
            // Set up progress tracking
            this.analyzer.setProgressCallback((progress) => {
                this.displayProgress(progress);
            });
            // Run analysis
            const result = await this.analyzer.analyzeSlackData(csvFilePath);
            // Display results
            this.displayAnalysisResults(result);
        }
        catch (error) {
            logger.logError(error, { operation: 'runAnalysis' });
            throw error;
        }
    }
    /**
     * Display analysis progress
     */
    displayProgress(progress) {
        if (progress.totalChunks > 0) {
            const percentage = Math.round((progress.currentChunk / progress.totalChunks) * 100);
            console.log(`\r📊 Analysis Progress: ${progress.currentChunk}/${progress.totalChunks} (${percentage}%) - ${progress.currentOperation}`);
        }
        else {
            console.log(`\r📊 ${progress.currentOperation}`);
        }
    }
    /**
     * Display analysis results
     */
    displayAnalysisResults(result) {
        console.log('\n' + '='.repeat(80));
        console.log('🎉 SLACK DATA ANALYSIS COMPLETED SUCCESSFULLY');
        console.log('='.repeat(80));
        console.log(`📊 Messages Analyzed: ${result.analysis.totalMessages.toLocaleString()}`);
        console.log(`🧩 Analysis Chunks: ${result.analysis.totalChunks}`);
        console.log(`🔤 Total Tokens Used: ${result.analysis.totalTokens.toLocaleString()}`);
        console.log(`⏱️  Processing Time: ${(result.analysis.totalProcessingTime / 1000).toFixed(2)}s`);
        console.log('');
        console.log('📄 Generated Files:');
        console.log(`   Markdown Report: ${result.markdownFile}`);
        console.log('');
        console.log('🎨 Presentation:');
        if (result.presentation.status === 'success') {
            console.log(`   Presentation ID: ${result.presentation.presentationId}`);
            console.log(`   Presentation URL: ${result.presentation.presentationUrl}`);
        }
        else {
            console.log(`   ❌ Presentation failed: ${result.presentation.error}`);
        }
        console.log('='.repeat(80) + '\n');
    }
    /**
     * Interactive menu for user operations
     */
    async showInteractiveMenu() {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        const question = (prompt) => {
            return new Promise((resolve) => {
                rl.question(prompt, resolve);
            });
        };
        try {
            while (true) {
                console.log('\n' + '='.repeat(50));
                console.log('🚀 SLACK EXTRACTOR & ANALYZER');
                console.log('='.repeat(50));
                console.log('1. Extract Slack data and upload to Dropbox');
                console.log('2. Analyze existing CSV data with GPT-5');
                console.log('3. Extract + Analyze (full pipeline)');
                console.log('4. Test API connections');
                console.log('5. Exit');
                console.log('='.repeat(50));
                const choice = await question('Select an option (1-5): ');
                switch (choice.trim()) {
                    case '1':
                        console.log('\n🔄 Starting data extraction...');
                        await this.run();
                        break;
                    case '2':
                        if (!this.analyzer) {
                            console.log('\n❌ Analysis not available. Please check your API keys.');
                            break;
                        }
                        console.log('\n🧠 Starting data analysis...');
                        await this.runAnalysis();
                        break;
                    case '3':
                        console.log('\n🔄 Starting full pipeline (extract + analyze)...');
                        await this.run();
                        if (this.analyzer) {
                            console.log('\n🧠 Starting analysis of extracted data...');
                            await this.runAnalysis();
                        }
                        break;
                    case '4':
                        console.log('\n🔍 Testing API connections...');
                        await this.testConnections();
                        if (this.analyzer) {
                            const analysisConnections = await this.analyzer.testConnections();
                            console.log(`   OpenAI: ${analysisConnections.openai ? '✅' : '❌'}`);
                            console.log(`   Gamma: ${analysisConnections.gamma ? '✅' : '❌'}`);
                        }
                        break;
                    case '5':
                        console.log('\n👋 Goodbye!');
                        rl.close();
                        return;
                    default:
                        console.log('\n❌ Invalid option. Please select 1-5.');
                }
                if (choice.trim() !== '5') {
                    await question('\nPress Enter to continue...');
                }
            }
        }
        finally {
            rl.close();
        }
    }
    /**
     * Test all API connections
     */
    async testConnections() {
        logger.logLifecycle('Testing API connections');
        // Test Slack connection
        const slackConnected = await slackService.testConnection();
        if (!slackConnected) {
            throw new Error('Failed to connect to Slack API');
        }
        logger.logLifecycle('Slack API connection successful');
    }
    /**
     * Log process summary
     */
    logSummary(stats) {
        console.log('\n' + '='.repeat(60));
        console.log('SLACK DATA EXTRACTION COMPLETED SUCCESSFULLY');
        console.log('='.repeat(60));
        console.log(`📊 Records Processed: ${stats.totalRecords}`);
        console.log(`📁 Channels: ${stats.channels}`);
        console.log(`👥 Users: ${stats.users}`);
        console.log(`💬 Thread Replies: ${stats.threadReplies}`);
        console.log(`🔗 Messages with URLs: ${stats.messagesWithUrls}`);
        console.log(`📎 Messages with Attachments: ${stats.messagesWithAttachments}`);
        console.log(`📄 Messages with Files: ${stats.messagesWithFiles}`);
        console.log(`📅 Date Range: ${stats.dateRange.earliest} to ${stats.dateRange.latest}`);
        console.log('');
        console.log('📁 CSV File saved locally in exports/ folder');
        console.log('='.repeat(60) + '\n');
    }
    /**
     * Setup scheduled execution
     */
    setupScheduling() {
        if (!config_1.default.scheduling.enabled) {
            logger.logScheduling('Scheduling disabled');
            return;
        }
        const cronExpression = config_1.default.scheduling.cronExpression;
        // Validate cron expression
        if (!cron.validate(cronExpression)) {
            throw new Error(`Invalid cron expression: ${cronExpression}`);
        }
        logger.logScheduling('Setting up scheduled execution', cronExpression);
        this.cronJob = cron.schedule(cronExpression, async () => {
            logger.logScheduling('Scheduled execution triggered');
            try {
                await this.run();
            }
            catch (error) {
                logger.logError(error, { operation: 'scheduledRun' });
            }
        }, {
            scheduled: false // Don't start immediately
        });
        logger.logScheduling('Scheduled execution configured successfully');
    }
    /**
     * Start the application
     */
    async start() {
        try {
            // Log configuration
            config_1.default.logConfig();
            // Setup scheduling
            this.setupScheduling();
            // Run immediately if configured
            if (config_1.default.scheduling.runImmediately) {
                logger.logScheduling('Running immediately as configured');
                await this.run();
            }
            // Start scheduled execution if enabled
            if (config_1.default.scheduling.enabled && this.cronJob) {
                this.cronJob.start();
                logger.logScheduling('Scheduled execution started');
                // Keep the process running
                logger.logLifecycle('Application started in scheduled mode');
                console.log('\n🚀 Slack Extractor is running in scheduled mode...');
                console.log(`📅 Schedule: ${config_1.default.scheduling.cronExpression}`);
                console.log('Press Ctrl+C to stop\n');
                // Handle graceful shutdown
                process.on('SIGINT', () => {
                    logger.logLifecycle('Received SIGINT, shutting down gracefully');
                    this.stop();
                });
                process.on('SIGTERM', () => {
                    logger.logLifecycle('Received SIGTERM, shutting down gracefully');
                    this.stop();
                });
            }
            else {
                logger.logLifecycle('Application completed (no scheduling enabled)');
            }
        }
        catch (error) {
            logger.logError(error, { operation: 'start' });
            process.exit(1);
        }
    }
    /**
     * Stop the application
     */
    stop() {
        if (this.cronJob) {
            this.cronJob.stop();
            logger.logScheduling('Scheduled execution stopped');
        }
        logger.logLifecycle('Application stopped');
        process.exit(0);
    }
    /**
     * Run once and exit
     */
    async runOnce() {
        try {
            config_1.default.logConfig();
            await this.run();
            logger.logLifecycle('Single run completed successfully');
        }
        catch (error) {
            logger.logError(error, { operation: 'runOnce' });
            process.exit(1);
        }
    }
    /**
     * Run analysis once and exit
     */
    async runAnalysisOnce() {
        try {
            config_1.default.logConfig();
            await this.runAnalysis();
            logger.logLifecycle('Analysis completed successfully');
        }
        catch (error) {
            logger.logError(error, { operation: 'runAnalysisOnce' });
            process.exit(1);
        }
    }
}
// Main execution
async function main() {
    const app = new SlackExtractorApp();
    // Check command line arguments
    const args = process.argv.slice(2);
    if (args.includes('--once') || args.includes('-o')) {
        // Run once and exit
        await app.runOnce();
    }
    else if (args.includes('--analyze') || args.includes('-a')) {
        // Run analysis once and exit
        await app.runAnalysisOnce();
    }
    else if (args.includes('--interactive') || args.includes('-i')) {
        // Show interactive menu
        await app.showInteractiveMenu();
    }
    else {
        // Start with scheduling
        await app.start();
    }
}
// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    logger.logError(error, { type: 'uncaughtException' });
    process.exit(1);
});
process.on('unhandledRejection', (reason, promise) => {
    logger.logError(new Error(reason), {
        type: 'unhandledRejection',
        promise: promise.toString()
    });
    process.exit(1);
});
// Start the application
if (require.main === module) {
    main().catch((error) => {
        logger.logError(error, { operation: 'main' });
        process.exit(1);
    });
}
exports.default = SlackExtractorApp;
//# sourceMappingURL=index.js.map