const { WebClient } = require('@slack/web-api');
const config = require('../config/index.js').default;
const logger = require('../utils/logger');

/**
 * Slack Service
 * Handles all Slack API interactions including channels, messages, and threads
 */
class SlackService {
  constructor() {
    this.client = new WebClient(config.slack.botToken);
    this.apiDelay = config.app.apiDelayMs;
  }

  /**
   * Add delay between API calls to respect rate limits
   */
  async delay(ms = null) {
    const delayMs = ms || this.apiDelay;
    return new Promise(resolve => setTimeout(resolve, delayMs));
  }

  /**
   * Extract URLs from message text using regex
   */
  extractUrls(text) {
    if (!text) return [];
    
    const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;
    const urls = text.match(urlRegex) || [];
    return [...new Set(urls)]; // Remove duplicates
  }

  /**
   * Get all public channels in the workspace
   */
  async getPublicChannels() {
    logger.logSlackOperation('Fetching public channels');
    const startTime = Date.now();
    
    try {
      const channels = [];
      let cursor = undefined;
      let hasMore = true;

      while (hasMore) {
        const response = await this.client.conversations.list({
          types: 'public_channel',
          exclude_archived: true,
          limit: 200,
          cursor: cursor
        });

        if (response.ok) {
          channels.push(...response.channels);
          cursor = response.response_metadata?.next_cursor;
          hasMore = !!cursor;
          
          logger.logProgress('Fetching channels', channels.length, 'unknown');
          await this.delay();
        } else {
          throw new Error(`Failed to fetch channels: ${response.error}`);
        }
      }

      const duration = Date.now() - startTime;
      logger.logApiCall('Slack', 'conversations.list', duration, true);
      logger.logSlackOperation('Fetched public channels', null, channels.length);

      return channels;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.logApiCall('Slack', 'conversations.list', duration, false);
      logger.logError(error, { operation: 'getPublicChannels' });
      throw error;
    }
  }

  /**
   * Get all messages from a channel with pagination
   */
  async getChannelMessages(channelId, channelName) {
    logger.logSlackOperation('Fetching channel messages', channelName);
    const startTime = Date.now();
    
    try {
      const messages = [];
      let cursor = undefined;
      let hasMore = true;
      const MAX_MESSAGES_PER_CHANNEL = config.app.maxMessagesPerChannel;
      
      // Calculate 7 days ago timestamp (7 days * 24 hours * 60 minutes * 60 seconds = 604800 seconds)
      const sevenDaysAgo = Math.floor(Date.now() / 1000) - 604800;

      while (hasMore && messages.length < MAX_MESSAGES_PER_CHANNEL) {
        const remainingLimit = Math.min(200, MAX_MESSAGES_PER_CHANNEL - messages.length);
        const response = await this.client.conversations.history({
          channel: channelId,
          limit: remainingLimit,
          cursor: cursor,
          oldest: sevenDaysAgo.toString() // Only get messages from last 7 days
        });

        if (response.ok) {
          messages.push(...response.messages);
          cursor = response.response_metadata?.next_cursor;
          hasMore = !!cursor;
          
          logger.logProgress('Fetching messages', messages.length, 'unknown', { channel: channelName });
          await this.delay();
        } else {
          throw new Error(`Failed to fetch messages for channel ${channelName}: ${response.error}`);
        }
      }

      const duration = Date.now() - startTime;
      logger.logApiCall('Slack', 'conversations.history', duration, true);
      logger.logSlackOperation('Fetched channel messages', channelName, messages.length);

      return messages;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.logApiCall('Slack', 'conversations.history', duration, false);
      logger.logError(error, { operation: 'getChannelMessages', channelId, channelName });
      throw error;
    }
  }

  /**
   * Get thread replies for a message
   */
  async getThreadReplies(channelId, threadTs, channelName) {
    logger.logSlackOperation('Fetching thread replies', channelName);
    const startTime = Date.now();
    
    try {
      const replies = [];
      let cursor = undefined;
      let hasMore = true;
      const MAX_THREAD_REPLIES = config.app.maxThreadReplies;
      
      // Calculate 7 days ago timestamp (7 days * 24 hours * 60 minutes * 60 seconds = 604800 seconds)
      const sevenDaysAgo = Math.floor(Date.now() / 1000) - 604800;

      while (hasMore && replies.length < MAX_THREAD_REPLIES) {
        const remainingLimit = Math.min(200, MAX_THREAD_REPLIES - replies.length);
        const response = await this.client.conversations.replies({
          channel: channelId,
          ts: threadTs,
          limit: remainingLimit,
          oldest: sevenDaysAgo.toString(), // Only get thread replies from last 7 days
          cursor: cursor
        });

        if (response.ok) {
          // Skip the first message as it's the parent message
          const threadReplies = response.messages.slice(1);
          replies.push(...threadReplies);
          
          cursor = response.response_metadata?.next_cursor;
          hasMore = !!cursor;
          
          logger.logProgress('Fetching thread replies', replies.length, 'unknown', { 
            channel: channelName, 
            threadTs 
          });
          await this.delay();
        } else {
          throw new Error(`Failed to fetch thread replies for ${channelName}: ${response.error}`);
        }
      }

      const duration = Date.now() - startTime;
      logger.logApiCall('Slack', 'conversations.replies', duration, true);
      logger.logSlackOperation('Fetched thread replies', channelName, replies.length);

      return replies;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.logApiCall('Slack', 'conversations.replies', duration, false);
      logger.logError(error, { operation: 'getThreadReplies', channelId, channelName, threadTs });
      throw error;
    }
  }

  /**
   * Get user information by user ID
   */
  async getUserInfo(userId) {
    if (!userId || userId.startsWith('B')) return { name: 'Bot', real_name: 'Bot' };
    
    try {
      const response = await this.client.users.info({ user: userId });
      if (response.ok) {
        return {
          name: response.user.name,
          real_name: response.user.real_name || response.user.name,
          display_name: response.user.profile?.display_name || response.user.real_name || response.user.name
        };
      }
    } catch (error) {
      logger.logError(error, { operation: 'getUserInfo', userId });
    }
    
    return { name: 'Unknown', real_name: 'Unknown User' };
  }

  /**
   * Get permalink for a message
   */
  async getMessagePermalink(channelId, messageTs) {
    try {
      const response = await this.client.chat.getPermalink({
        channel: channelId,
        message_ts: messageTs
      });
      
      if (response.ok) {
        logger.logSlackOperation('Got message permalink', { 
          channelId, 
          messageTs, 
          permalink: response.permalink 
        });
        return response.permalink;
      } else {
        logger.logWarning('Failed to get message permalink - API error', { 
          error: response.error, 
          channelId, 
          messageTs 
        });
      }
    } catch (error) {
      logger.logWarning('Failed to get message permalink - Exception', { 
        error: error.message, 
        channelId, 
        messageTs 
      });
    }
    
    return null;
  }

  /**
   * Process a single message and extract relevant data
   */
  async processMessage(message, channelName, channelId, isThreadReply = false, threadParent = null) {
    const userInfo = await this.getUserInfo(message.user);
    const urls = this.extractUrls(message.text);
    const slackUrl = await this.getMessagePermalink(channelId, message.ts);
    
    // REACTION EXTRACTION - EASY TO REMOVE IF PROBLEMS OCCUR
    const reactions = message.reactions || [];
    const totalReactions = reactions.reduce((sum, r) => sum + r.count, 0);
    const uniqueReactors = new Set(reactions.flatMap(r => r.users)).size;
    // END REACTION EXTRACTION
    
    return {
      channel: channelName,
      message: message.text || '',
      user: userInfo.display_name || userInfo.real_name || userInfo.name,
      timestamp: new Date(parseFloat(message.ts) * 1000).toISOString(),
      threadParent: threadParent,
      urls: urls.join('; '),
      slackUrl: slackUrl || '',
      isThreadReply: isThreadReply,
      messageType: message.type,
      hasAttachments: !!(message.attachments && message.attachments.length > 0),
      hasFiles: !!(message.files && message.files.length > 0),
      // REACTION FIELDS - REMOVE THESE THREE LINES IF PROBLEMS OCCUR
      reactions: JSON.stringify(reactions),
      totalReactions: totalReactions,
      uniqueReactors: uniqueReactors
      // END REACTION FIELDS
    };
  }

  /**
   * Extract all data from Slack workspace
   */
  async extractWorkspaceData() {
    logger.logLifecycle('Starting Slack data extraction (last 7 days only)');
    const startTime = Date.now();
    
    try {
      // Get all public channels
      const channels = await this.getPublicChannels();
      logger.info(`Found ${channels.length} public channels`);

      const allData = [];
      let totalMessages = 0;
      let totalThreads = 0;

      // Process each channel
      for (let i = 0; i < channels.length; i++) {
        const channel = channels[i];
        logger.logProgress('Processing channels', i + 1, channels.length, { 
          channel: channel.name 
        });

        try {
          // Get all messages from the channel
          const messages = await this.getChannelMessages(channel.id, channel.name);
          totalMessages += messages.length;

          // Process each message
          for (const message of messages) {
            // Skip system messages and messages without text
            if (message.type !== 'message' || !message.text) {
              continue;
            }

            // Process the main message
            const processedMessage = await this.processMessage(
              message, 
              channel.name, 
              channel.id,
              false, 
              null
            );
            allData.push(processedMessage);

            // Check if this message has thread replies
            if (message.thread_ts) {
              totalThreads++;
              try {
                const threadReplies = await this.getThreadReplies(
                  channel.id, 
                  message.thread_ts, 
                  channel.name
                );

                // Process each thread reply
                for (const reply of threadReplies) {
                  const processedReply = await this.processMessage(
                    reply, 
                    channel.name, 
                    channel.id,
                    true, 
                    message.thread_ts
                  );
                  allData.push(processedReply);
                }
              } catch (error) {
                logger.logError(error, { 
                  operation: 'processThread', 
                  channel: channel.name, 
                  threadTs: message.thread_ts 
                });
                // Continue processing other messages even if one thread fails
              }
            }
          }
        } catch (error) {
          logger.logError(error, { 
            operation: 'processChannel', 
            channel: channel.name 
          });
          // Continue processing other channels even if one fails
        }
      }

      const duration = Date.now() - startTime;
      logger.logLifecycle('Completed Slack data extraction', {
        duration: `${duration}ms`,
        channels: channels.length,
        totalMessages,
        totalThreads,
        totalDataPoints: allData.length
      });

      return allData;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.logError(error, { 
        operation: 'extractWorkspaceData',
        duration: `${duration}ms`
      });
      throw error;
    }
  }

  /**
   * Test Slack API connection
   */
  async testConnection() {
    try {
      const response = await this.client.auth.test();
      if (response.ok) {
        logger.info('Slack API connection successful', {
          team: response.team,
          user: response.user,
          botId: response.bot_id
        });
        return true;
      } else {
        throw new Error(`Slack API test failed: ${response.error}`);
      }
    } catch (error) {
      logger.logError(error, { operation: 'testConnection' });
      return false;
    }
  }
}

module.exports = new SlackService();
