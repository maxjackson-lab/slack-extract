const winston = require('winston');
const config = require('../config');

/**
 * Logger utility using Winston
 * Provides structured logging with different levels and formats
 */

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.prettyPrint()
);

// Define console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'HH:mm:ss'
  }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      msg += ` ${JSON.stringify(meta, null, 2)}`;
    }
    return msg;
  })
);

// Create logger instance
const logger = winston.createLogger({
  level: config.app.logLevel,
  format: logFormat,
  defaultMeta: { service: 'slack-extractor' },
  transports: [
    // Console transport
    new winston.transports.Console({
      format: consoleFormat
    }),
    
    // File transport for errors
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    
    // File transport for all logs
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ]
});

// Create logs directory if it doesn't exist
const fs = require('fs');
const path = require('path');

const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

/**
 * Log API call with timing information
 */
logger.logApiCall = (service, endpoint, duration, success = true) => {
  const level = success ? 'info' : 'error';
  logger.log(level, `API Call: ${service} - ${endpoint}`, {
    duration: `${duration}ms`,
    success
  });
};

/**
 * Log data extraction progress
 */
logger.logProgress = (stage, current, total, additionalInfo = {}) => {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
  logger.info(`Progress: ${stage}`, {
    current,
    total,
    percentage: `${percentage}%`,
    ...additionalInfo
  });
};

/**
 * Log Slack-specific operations
 */
logger.logSlackOperation = (operation, channel, messageCount = null) => {
  logger.info(`Slack: ${operation}`, {
    channel: channel || 'N/A',
    messageCount
  });
};

/**
 * Log Google Drive operations
 */
logger.logGoogleDriveOperation = (operation, filename, fileId = null) => {
  logger.info(`Google Drive: ${operation}`, {
    filename,
    fileId
  });
};

/**
 * Log scheduling information
 */
logger.logScheduling = (message, schedule = null) => {
  logger.info(`Scheduling: ${message}`, {
    schedule
  });
};

/**
 * Log application lifecycle events
 */
logger.logLifecycle = (event, details = {}) => {
  logger.info(`Lifecycle: ${event}`, details);
};

/**
 * Log warning messages
 */
logger.logWarning = (message, details = {}) => {
  logger.warn(`Warning: ${message}`, details);
};

/**
 * Log errors with additional context
 */
logger.logError = (error, context = {}) => {
  logger.error('Application Error', {
    message: error.message,
    stack: error.stack,
    ...context
  });
};

module.exports = logger;
