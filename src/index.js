const cron = require('node-cron');
const config = require('./config');
const logger = require('./utils/logger');
const slackService = require('./services/slackService');
const csvService = require('./services/csvService');
const dropboxService = require('./services/dropboxService');

/**
 * Main Application
 * Orchestrates the Slack data extraction and Google Drive upload process
 */
class SlackExtractorApp {
  constructor() {
    this.isRunning = false;
    this.cronJob = null;
  }

  /**
   * Main execution function
   */
  async run() {
    if (this.isRunning) {
      logger.warn('Extraction already in progress, skipping this run');
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

      // Step 4: Upload to Dropbox
      logger.logLifecycle('Step 3: Uploading to Dropbox');
      const uploadResult = await dropboxService.uploadCsvFile(
        csvResult.buffer, 
        csvResult.filename
      );

      // Step 6: Log results
      const duration = Date.now() - startTime;
      const stats = csvService.getCsvStats(slackData);
      
      logger.logLifecycle('Process completed successfully', {
        duration: `${duration}ms`,
        recordsProcessed: slackData.length,
        csvFilename: csvResult.filename,
        dropboxFileId: uploadResult.fileId,
        dropboxLink: uploadResult.webViewLink,
        statistics: stats
      });

      // Log summary
      this.logSummary(stats, uploadResult);

    } catch (error) {
      const duration = Date.now() - startTime;
      logger.logError(error, { 
        operation: 'mainProcess',
        duration: `${duration}ms`
      });
      throw error;
    } finally {
      this.isRunning = false;
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

    // Test Dropbox connection
    const dropboxConnected = await dropboxService.testConnection();
    if (!dropboxConnected) {
      throw new Error('Failed to connect to Dropbox API');
    }

    logger.logLifecycle('All API connections successful');
  }

  /**
   * Log process summary
   */
  logSummary(stats, uploadResult) {
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
    console.log('📁 Dropbox File:');
    console.log(`   File ID: ${uploadResult.fileId}`);
    console.log(`   Link: ${uploadResult.webViewLink}`);
    console.log('='.repeat(60) + '\n');
  }

  /**
   * Setup scheduled execution
   */
  setupScheduling() {
    if (!config.scheduling.enabled) {
      logger.logScheduling('Scheduling disabled');
      return;
    }

    const cronExpression = config.scheduling.cronExpression;
    
    // Validate cron expression
    if (!cron.validate(cronExpression)) {
      throw new Error(`Invalid cron expression: ${cronExpression}`);
    }

    logger.logScheduling('Setting up scheduled execution', cronExpression);

    this.cronJob = cron.schedule(cronExpression, async () => {
      logger.logScheduling('Scheduled execution triggered');
      try {
        await this.run();
      } catch (error) {
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
      config.logConfig();
      
      // Setup scheduling
      this.setupScheduling();

      // Run immediately if configured
      if (config.scheduling.runImmediately) {
        logger.logScheduling('Running immediately as configured');
        await this.run();
      }

      // Start scheduled execution if enabled
      if (config.scheduling.enabled && this.cronJob) {
        this.cronJob.start();
        logger.logScheduling('Scheduled execution started');
        
        // Keep the process running
        logger.logLifecycle('Application started in scheduled mode');
        console.log('\n🚀 Slack Extractor is running in scheduled mode...');
        console.log(`📅 Schedule: ${config.scheduling.cronExpression}`);
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
      } else {
        logger.logLifecycle('Application completed (no scheduling enabled)');
      }

    } catch (error) {
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
      config.logConfig();
      await this.run();
      logger.logLifecycle('Single run completed successfully');
    } catch (error) {
      logger.logError(error, { operation: 'runOnce' });
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
  } else {
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

module.exports = SlackExtractorApp;
