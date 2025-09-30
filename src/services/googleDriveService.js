const { google } = require('googleapis');
const config = require('../config');
const logger = require('../utils/logger');

/**
 * Google Drive Service
 * Handles Google Drive authentication and file uploads
 */
class GoogleDriveService {
  constructor() {
    this.drive = null;
    this.sheets = null;
    this.authenticated = false;
  }

  /**
   * Authenticate with Google APIs using service account
   */
  async authenticate() {
    logger.logLifecycle('Starting Google Drive authentication');
    const startTime = Date.now();

    try {
      // Create JWT client for service account authentication
      const auth = new google.auth.JWT(
        config.googleDrive.serviceAccountEmail,
        null,
        config.googleDrive.privateKey,
        [
          'https://www.googleapis.com/auth/drive.file',
          'https://www.googleapis.com/auth/spreadsheets'
        ]
      );

      // Authenticate
      await auth.authorize();

      // Initialize Google APIs
      this.drive = google.drive({ version: 'v3', auth });
      this.sheets = google.sheets({ version: 'v4', auth });
      this.authenticated = true;

      const duration = Date.now() - startTime;
      logger.logLifecycle('Google Drive authentication successful', {
        duration: `${duration}ms`,
        serviceAccount: config.googleDrive.serviceAccountEmail
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
   * Upload CSV file to Google Drive and convert to Google Sheets
   */
  async uploadCsvAsSheet(csvBuffer, filename) {
    if (!this.authenticated) {
      await this.authenticate();
    }

    logger.logGoogleDriveOperation('Uploading CSV as Google Sheet', filename);
    const startTime = Date.now();

    try {
      // Upload CSV file to Google Drive
      const uploadResponse = await this.drive.files.create({
        requestBody: {
          name: filename.replace('.csv', ''),
          parents: [config.googleDrive.folderId],
          mimeType: 'application/vnd.google-apps.spreadsheet'
        },
        media: {
          mimeType: 'text/csv',
          body: csvBuffer
        },
        fields: 'id,name,webViewLink,webContentLink'
      });

      const fileId = uploadResponse.data.id;
      const fileLink = uploadResponse.data.webViewLink;

      const duration = Date.now() - startTime;
      logger.logGoogleDriveOperation('CSV uploaded successfully', filename, fileId);

      return {
        fileId,
        filename: uploadResponse.data.name,
        webViewLink: fileLink,
        webContentLink: uploadResponse.data.webContentLink,
        uploadDuration: duration
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.logError(error, { 
        operation: 'uploadCsvAsSheet',
        filename,
        duration: `${duration}ms`
      });
      throw error;
    }
  }

  /**
   * Upload CSV file directly to Google Drive (without conversion)
   */
  async uploadCsvFile(csvBuffer, filename) {
    if (!this.authenticated) {
      await this.authenticate();
    }

    logger.logGoogleDriveOperation('Uploading CSV file', filename);
    const startTime = Date.now();

    try {
      // Upload CSV file to Google Drive
      const uploadResponse = await this.drive.files.create({
        requestBody: {
          name: filename,
          parents: [config.googleDrive.folderId]
        },
        media: {
          mimeType: 'text/csv',
          body: csvBuffer
        },
        fields: 'id,name,webViewLink,webContentLink'
      });

      const fileId = uploadResponse.data.id;
      const fileLink = uploadResponse.data.webViewLink;

      const duration = Date.now() - startTime;
      logger.logGoogleDriveOperation('CSV file uploaded successfully', filename, fileId);

      return {
        fileId,
        filename: uploadResponse.data.name,
        webViewLink: fileLink,
        webContentLink: uploadResponse.data.webContentLink,
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
   * Set file permissions to make it accessible
   */
  async setFilePermissions(fileId, makePublic = false) {
    if (!this.authenticated) {
      await this.authenticate();
    }

    logger.logGoogleDriveOperation('Setting file permissions', null, fileId);

    try {
      const permissions = [
        {
          type: 'user',
          role: 'writer',
          emailAddress: config.googleDrive.serviceAccountEmail
        }
      ];

      if (makePublic) {
        permissions.push({
          type: 'anyone',
          role: 'reader'
        });
      }

      for (const permission of permissions) {
        await this.drive.permissions.create({
          fileId: fileId,
          requestBody: permission
        });
      }

      logger.logGoogleDriveOperation('File permissions set successfully', null, fileId);
      return true;
    } catch (error) {
      logger.logError(error, { 
        operation: 'setFilePermissions',
        fileId
      });
      throw error;
    }
  }

  /**
   * Get file information
   */
  async getFileInfo(fileId) {
    if (!this.authenticated) {
      await this.authenticate();
    }

    try {
      const response = await this.drive.files.get({
        fileId: fileId,
        fields: 'id,name,size,createdTime,modifiedTime,webViewLink,webContentLink'
      });

      return {
        id: response.data.id,
        name: response.data.name,
        size: response.data.size,
        createdTime: response.data.createdTime,
        modifiedTime: response.data.modifiedTime,
        webViewLink: response.data.webViewLink,
        webContentLink: response.data.webContentLink
      };
    } catch (error) {
      logger.logError(error, { 
        operation: 'getFileInfo',
        fileId
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
      const response = await this.drive.files.list({
        q: `'${config.googleDrive.folderId}' in parents`,
        fields: 'files(id,name,size,createdTime,modifiedTime,webViewLink)',
        orderBy: 'createdTime desc',
        pageSize: limit
      });

      return response.data.files.map(file => ({
        id: file.id,
        name: file.name,
        size: file.size,
        createdTime: file.createdTime,
        modifiedTime: file.modifiedTime,
        webViewLink: file.webViewLink
      }));
    } catch (error) {
      logger.logError(error, { 
        operation: 'listFiles'
      });
      throw error;
    }
  }

  /**
   * Test Google Drive connection
   */
  async testConnection() {
    try {
      await this.authenticate();
      
      // Try to list files to test permissions
      const files = await this.listFiles(1);
      
      logger.info('Google Drive connection test successful', {
        folderId: config.googleDrive.folderId,
        filesFound: files.length
      });
      
      return true;
    } catch (error) {
      logger.logError(error, { operation: 'testConnection' });
      return false;
    }
  }

  /**
   * Delete a file from Google Drive
   */
  async deleteFile(fileId) {
    if (!this.authenticated) {
      await this.authenticate();
    }

    logger.logGoogleDriveOperation('Deleting file', null, fileId);

    try {
      await this.drive.files.delete({
        fileId: fileId
      });

      logger.logGoogleDriveOperation('File deleted successfully', null, fileId);
      return true;
    } catch (error) {
      logger.logError(error, { 
        operation: 'deleteFile',
        fileId
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
      const response = await this.drive.files.get({
        fileId: config.googleDrive.folderId,
        fields: 'id,name,webViewLink'
      });

      return {
        id: response.data.id,
        name: response.data.name,
        webViewLink: response.data.webViewLink
      };
    } catch (error) {
      logger.logError(error, { 
        operation: 'getFolderInfo',
        folderId: config.googleDrive.folderId
      });
      throw error;
    }
  }
}

module.exports = new GoogleDriveService();
