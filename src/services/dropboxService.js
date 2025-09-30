const { Dropbox } = require('dropbox');
const config = require('../config');
const logger = require('../utils/logger');
const axios = require('axios');

/**
 * Dropbox Service
 * Handles Dropbox authentication and file uploads
 */
class DropboxService {
  constructor() {
    this.dropbox = null;
    this.authenticated = false;
    this.currentAccessToken = null;
  }

  /**
   * Refresh the access token using refresh token
   */
  async refreshAccessToken() {
    if (!config.dropbox.refreshToken || !config.dropbox.clientId || !config.dropbox.clientSecret) {
      throw new Error('Refresh token, client ID, or client secret not configured');
    }

    logger.logLifecycle('Refreshing Dropbox access token');
    const startTime = Date.now();

    try {
      const response = await axios.post('https://api.dropboxapi.com/oauth2/token', {
        grant_type: 'refresh_token',
        refresh_token: config.dropbox.refreshToken,
        client_id: config.dropbox.clientId,
        client_secret: config.dropbox.clientSecret
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      const { access_token } = response.data;
      this.currentAccessToken = access_token;
      
      const duration = Date.now() - startTime;
      logger.logLifecycle('Dropbox access token refreshed successfully', {
        duration: `${duration}ms`
      });

      return access_token;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.logError(error, { 
        operation: 'refreshAccessToken',
        duration: `${duration}ms`
      });
      throw error;
    }
  }

  /**
   * Get current access token, refreshing if needed
   */
  async getValidAccessToken() {
    // If we have a refresh token setup, try to refresh first
    if (config.dropbox.refreshToken && config.dropbox.clientId && config.dropbox.clientSecret) {
      try {
        return await this.refreshAccessToken();
      } catch (error) {
        logger.logWarning('Failed to refresh token, falling back to configured token', { error: error.message });
      }
    }
    
    // Fall back to configured access token
    return config.dropbox.accessToken;
  }

  /**
   * Authenticate with Dropbox API using access token
   */
  async authenticate() {
    logger.logLifecycle('Starting Dropbox authentication');
    const startTime = Date.now();

    try {
      // Get a valid access token (refresh if needed)
      const accessToken = await this.getValidAccessToken();
      
      // Initialize Dropbox client with access token
      this.dropbox = new Dropbox({
        accessToken: accessToken
      });

      // Test the connection by getting account info
      const accountInfo = await this.dropbox.usersGetCurrentAccount();
      this.authenticated = true;
      this.currentAccessToken = accessToken;

      const duration = Date.now() - startTime;
      logger.logLifecycle('Dropbox authentication successful', {
        duration: `${duration}ms`,
        accountId: accountInfo.result.account_id,
        email: accountInfo.result.email
      });

      return true;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.logError(error, { 
        operation: 'authenticate',
        duration: `${duration}ms`
      });
      throw error;
    }
  }

  /**
   * Upload CSV file to Dropbox
   */
  async uploadCsvFile(csvBuffer, filename) {
    if (!this.authenticated) {
      await this.authenticate();
    }

    logger.logGoogleDriveOperation('Uploading CSV to Dropbox', filename);
    const startTime = Date.now();

    try {
      // Create the full file path
      const filePath = `${config.dropbox.folderPath}/${filename}`;
      
      // Upload file to Dropbox
      const uploadResponse = await this.dropbox.filesUpload({
        path: filePath,
        contents: csvBuffer,
        mode: 'overwrite',
        autorename: false
      });

      const fileId = uploadResponse.result.id;
      
      // Get a shareable link
      const shareResponse = await this.dropbox.sharingCreateSharedLinkWithSettings({
        path: filePath,
        settings: {
          requested_visibility: 'public'
        }
      });

      const shareLink = shareResponse.result.url;

      const duration = Date.now() - startTime;
      logger.logGoogleDriveOperation('CSV uploaded to Dropbox successfully', filename, fileId);

      return {
        fileId,
        filename: filename,
        filePath: filePath,
        webViewLink: shareLink,
        webContentLink: shareLink,
        uploadDuration: duration
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.logError(error, { 
        operation: 'uploadCsvFile',
        filename,
        duration: `${duration}ms`
      });
      throw error;
    }
  }

  /**
   * Create a shared link for a file
   */
  async createSharedLink(filePath) {
    if (!this.authenticated) {
      await this.authenticate();
    }

    try {
      const shareResponse = await this.dropbox.sharingCreateSharedLinkWithSettings({
        path: filePath,
        settings: {
          requested_visibility: 'public'
        }
      });

      return shareResponse.result.url;
    } catch (error) {
      logger.logError(error, { 
        operation: 'createSharedLink',
        filePath
      });
      throw error;
    }
  }

  /**
   * List files in the configured folder
   */
  async listFiles(limit = 10) {
    if (!this.authenticated) {
      await this.authenticate();
    }

    try {
      const response = await this.dropbox.filesListFolder({
        path: config.dropbox.folderPath,
        limit: limit
      });

      return response.result.entries.map(file => ({
        id: file.id,
        name: file.name,
        size: file.size,
        createdTime: file.client_modified,
        modifiedTime: file.server_modified,
        webViewLink: null // Will need to create shared link separately
      }));
    } catch (error) {
      logger.logError(error, { 
        operation: 'listFiles'
      });
      throw error;
    }
  }

  /**
   * Get file information
   */
  async getFileInfo(filePath) {
    if (!this.authenticated) {
      await this.authenticate();
    }

    try {
      const response = await this.dropbox.filesGetMetadata({
        path: filePath
      });

      return {
        id: response.result.id,
        name: response.result.name,
        size: response.result.size,
        createdTime: response.result.client_modified,
        modifiedTime: response.result.server_modified,
        webViewLink: null // Will need to create shared link separately
      };
    } catch (error) {
      logger.logError(error, { 
        operation: 'getFileInfo',
        filePath
      });
      throw error;
    }
  }

  /**
   * Test Dropbox connection
   */
  async testConnection() {
    try {
      await this.authenticate();
      
      logger.info('Dropbox connection test successful', {
        folderPath: config.dropbox.folderPath
      });
      
      return true;
    } catch (error) {
      logger.logError(error, { operation: 'testConnection' });
      return false;
    }
  }

  /**
   * Delete a file from Dropbox
   */
  async deleteFile(filePath) {
    if (!this.authenticated) {
      await this.authenticate();
    }

    logger.logGoogleDriveOperation('Deleting file', null, filePath);

    try {
      await this.dropbox.filesDeleteV2({
        path: filePath
      });

      logger.logGoogleDriveOperation('File deleted successfully', null, filePath);
      return true;
    } catch (error) {
      logger.logError(error, { 
        operation: 'deleteFile',
        filePath
      });
      throw error;
    }
  }

  /**
   * Get folder information
   */
  async getFolderInfo() {
    if (!this.authenticated) {
      await this.authenticate();
    }

    try {
      const response = await this.dropbox.filesGetMetadata({
        path: config.dropbox.folderPath
      });

      return {
        id: response.result.id,
        name: response.result.name,
        webViewLink: null // Will need to create shared link separately
      };
    } catch (error) {
      logger.logError(error, { 
        operation: 'getFolderInfo',
        folderPath: config.dropbox.folderPath
      });
      throw error;
    }
  }
}

module.exports = new DropboxService();
