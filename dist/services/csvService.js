const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const fs = require('fs');
const path = require('path');
const config = require('../config/index.js').default;
const logger = require('../utils/logger');

/**
 * CSV Service
 * Handles CSV file creation and data formatting
 */
class CsvService {
  constructor() {
    this.csvHeaders = [
      { id: 'channel', title: 'Channel' },
      { id: 'message', title: 'Message' },
      { id: 'user', title: 'User' },
      { id: 'timestamp', title: 'Timestamp' },
      { id: 'threadParent', title: 'Thread_Parent' },
      { id: 'urls', title: 'URLs' },
      { id: 'slackUrl', title: 'Slack_URL' },
      { id: 'isThreadReply', title: 'Is_Thread_Reply' },
      { id: 'messageType', title: 'Message_Type' },
      { id: 'hasAttachments', title: 'Has_Attachments' },
      { id: 'hasFiles', title: 'Has_Files' }
    ];
  }

  /**
   * Clean and escape text content for CSV
   */
  cleanText(text) {
    if (!text) return '';
    
    return text
      .replace(/"/g, '""') // Escape double quotes
      .replace(/\n/g, ' ') // Replace newlines with spaces
      .replace(/\r/g, ' ') // Replace carriage returns with spaces
      .replace(/\t/g, ' ') // Replace tabs with spaces
      .trim();
  }

  /**
   * Generate timestamped filename
   */
  generateFilename() {
    const timestamp = new Date().toISOString()
      .replace(/[:.]/g, '-')
      .replace('T', '_')
      .slice(0, 19);
    
    const prefix = config.app.csvFilenamePrefix;
    return `${prefix}_${timestamp}.csv`;
  }

  /**
   * Create CSV file from data array
   */
  async createCsvFile(data, filename = null) {
    const startTime = Date.now();
    const csvFilename = filename || this.generateFilename();
    const filePath = path.join(process.cwd(), 'exports', csvFilename);

    logger.logLifecycle('Starting CSV creation', {
      filename: csvFilename,
      recordCount: data.length
    });

    try {
      // Create exports directory if it doesn't exist
      const exportsDir = path.dirname(filePath);
      if (!fs.existsSync(exportsDir)) {
        fs.mkdirSync(exportsDir, { recursive: true });
        logger.info(`Created exports directory: ${exportsDir}`);
      }

      // Clean and format data for CSV
      const cleanedData = data.map(record => ({
        channel: this.cleanText(record.channel),
        message: this.cleanText(record.message),
        user: this.cleanText(record.user),
        timestamp: record.timestamp,
        threadParent: record.threadParent || '',
        urls: this.cleanText(record.urls),
        slackUrl: this.cleanText(record.slackUrl || ''),
        isThreadReply: record.isThreadReply ? 'Yes' : 'No',
        messageType: record.messageType || 'message',
        hasAttachments: record.hasAttachments ? 'Yes' : 'No',
        hasFiles: record.hasFiles ? 'Yes' : 'No'
      }));

      // Create CSV writer
      const csvWriter = createCsvWriter({
        path: filePath,
        header: this.csvHeaders,
        encoding: 'utf8'
      });

      // Write data to CSV
      await csvWriter.writeRecords(cleanedData);

      const duration = Date.now() - startTime;
      const fileSize = fs.statSync(filePath).size;
      
      logger.logLifecycle('CSV creation completed', {
        filename: csvFilename,
        filePath,
        recordCount: cleanedData.length,
        fileSize: `${(fileSize / 1024).toFixed(2)} KB`,
        duration: `${duration}ms`
      });

      return {
        filename: csvFilename,
        filePath,
        recordCount: cleanedData.length,
        fileSize
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.logError(error, { 
        operation: 'createCsvFile',
        filename: csvFilename,
        duration: `${duration}ms`
      });
      throw error;
    }
  }

  /**
   * Create CSV file and return file buffer for upload
   */
  async createCsvBuffer(data, filename = null) {
    const startTime = Date.now();
    const csvFilename = filename || this.generateFilename();

    logger.logLifecycle('Starting CSV buffer creation', {
      filename: csvFilename,
      recordCount: data.length
    });

    try {
      // Clean and format data for CSV
      const cleanedData = data.map(record => ({
        channel: this.cleanText(record.channel),
        message: this.cleanText(record.message),
        user: this.cleanText(record.user),
        timestamp: record.timestamp,
        threadParent: record.threadParent || '',
        urls: this.cleanText(record.urls),
        slackUrl: this.cleanText(record.slackUrl || ''),
        isThreadReply: record.isThreadReply ? 'Yes' : 'No',
        messageType: record.messageType || 'message',
        hasAttachments: record.hasAttachments ? 'Yes' : 'No',
        hasFiles: record.hasFiles ? 'Yes' : 'No'
      }));

      // Create CSV content manually for buffer
      let csvContent = this.csvHeaders.map(header => `"${header.title}"`).join(',') + '\n';
      
      cleanedData.forEach(record => {
        const row = this.csvHeaders.map(header => {
          const value = record[header.id] || '';
          return `"${value}"`;
        }).join(',');
        csvContent += row + '\n';
      });

      const buffer = Buffer.from(csvContent, 'utf8');
      const duration = Date.now() - startTime;
      
      logger.logLifecycle('CSV buffer creation completed', {
        filename: csvFilename,
        recordCount: cleanedData.length,
        bufferSize: `${(buffer.length / 1024).toFixed(2)} KB`,
        duration: `${duration}ms`
      });

      return {
        filename: csvFilename,
        buffer,
        recordCount: cleanedData.length,
        size: buffer.length
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.logError(error, { 
        operation: 'createCsvBuffer',
        filename: csvFilename,
        duration: `${duration}ms`
      });
      throw error;
    }
  }

  /**
   * Get CSV file statistics
   */
  getCsvStats(data) {
    const stats = {
      totalRecords: data.length,
      channels: new Set(),
      users: new Set(),
      threadReplies: 0,
      messagesWithUrls: 0,
      messagesWithAttachments: 0,
      messagesWithFiles: 0,
      dateRange: { earliest: null, latest: null }
    };

    data.forEach(record => {
      stats.channels.add(record.channel);
      stats.users.add(record.user);
      
      if (record.isThreadReply) stats.threadReplies++;
      if (record.urls) stats.messagesWithUrls++;
      if (record.hasAttachments) stats.messagesWithAttachments++;
      if (record.hasFiles) stats.messagesWithFiles++;
      
      const timestamp = new Date(record.timestamp);
      if (!stats.dateRange.earliest || timestamp < stats.dateRange.earliest) {
        stats.dateRange.earliest = timestamp;
      }
      if (!stats.dateRange.latest || timestamp > stats.dateRange.latest) {
        stats.dateRange.latest = timestamp;
      }
    });

    return {
      ...stats,
      channels: stats.channels.size,
      users: stats.users.size,
      dateRange: {
        earliest: stats.dateRange.earliest?.toISOString(),
        latest: stats.dateRange.latest?.toISOString()
      }
    };
  }

  /**
   * Validate data before CSV creation
   */
  validateData(data) {
    if (!Array.isArray(data)) {
      throw new Error('Data must be an array');
    }

    if (data.length === 0) {
      logger.warn('No data provided for CSV creation');
      return false;
    }

    // Check for required fields
    const requiredFields = ['channel', 'message', 'user', 'timestamp'];
    const firstRecord = data[0];
    
    for (const field of requiredFields) {
      if (!(field in firstRecord)) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    logger.info(`Data validation passed: ${data.length} records`);
    return true;
  }
}

module.exports = new CsvService();
