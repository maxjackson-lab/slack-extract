import axios, { AxiosResponse } from 'axios';
import { GammaPresentationResult } from '../types/analysis';
const logger = require('../utils/logger');

/**
 * Gamma API integration service for generating presentations
 */
export class GammaClient {
  private apiKey: string;
  private baseUrl: string = 'https://public-api.gamma.app/v0.2';
  private maxContentLength: number = 750000; // Gamma's character limit

  constructor(apiKey: string) {
    // Clean the API key to remove any invalid characters that could break HTTP headers
    this.apiKey = apiKey.trim().replace(/[\r\n\t]/g, '');
    
    // Validate that the API key is not empty after sanitization
    if (!this.apiKey) {
      throw new Error('Gamma API key is missing or invalid. Please provide a valid API key.');
    }
  }

  /**
   * Generate a presentation from markdown content
   */
  async generatePresentation(
    markdownContent: string, 
    title: string = 'Slack Community Analysis',
    description: string = 'Weekly analysis of Slack community activity and insights'
  ): Promise<GammaPresentationResult> {
    try {
      logger.info('Generating Gamma presentation');

      // Validate content length
      if (markdownContent.length > this.maxContentLength) {
        const truncatedContent = this.truncateContent(markdownContent);
        logger.logWarning(`Content truncated from ${markdownContent.length} to ${truncatedContent.length} characters`);
        markdownContent = truncatedContent;
      }

          // Prepare request payload according to Gamma API spec
          const payload = {
            inputText: markdownContent,
            format: 'presentation',
            textMode: 'preserve', // CRITICAL: Preserves markdown structure and links
            numCards: 10, // Updated to 10 slides as requested
            cardSplit: 'auto',
            additionalInstructions: `Title: ${title}. Description: ${description}. 
CRITICAL - DO NOT MODIFY THE CONTENT:
1. DO NOT replace any URLs with placeholders - preserve ALL https://gambassadors.slack.com URLs exactly
2. DO NOT replace usernames with "Member" - keep all actual names exactly as written
3. DO NOT replace dates with [Date] - keep all date text exactly as provided
4. DO NOT replace [Username](URL) links with [link1] [link2] placeholders
5. Render ALL markdown exactly as provided without any rewriting or interpretation
6. This is FINAL content - do not summarize, rephrase, or regenerate anything`,
            textOptions: {
              amount: 'detailed',
              tone: 'professional, engaging, data-driven',
              language: 'en'
            },
            imageOptions: {
              source: 'unsplash' // Use Unsplash photos (Amanda's preference), not AI-generated images
            }
          };

      // Log the payload for debugging (first 500 chars of content)
      logger.info('Gamma API payload prepared', {
        contentLength: markdownContent.length,
        contentPreview: markdownContent.substring(0, 500) + '...',
        textMode: payload.textMode,
        numCards: payload.numCards,
        additionalInstructions: payload.additionalInstructions
      });

      // Make API request
      const response: AxiosResponse = await axios.post(
        `${this.baseUrl}/generations`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-API-KEY': this.apiKey
          },
          timeout: 60000 // 60 second timeout
        }
      );

      if ((response.status === 200 || response.status === 201) && response.data) {
        const generationId = response.data.generationId;
        
        // Poll for completion
        const finalResult = await this.pollForCompletion(generationId);
        
        const result: GammaPresentationResult = {
          presentationId: generationId,
          presentationUrl: finalResult.gammaUrl || '',
          embedCode: finalResult.gammaUrl,
          status: 'success'
        };

        logger.info('Gamma presentation generated successfully', {
          presentationId: result.presentationId,
          url: result.presentationUrl
        });

        return result;
      } else {
        throw new Error(`Unexpected response from Gamma API: ${response.status}`);
      }

    } catch (error) {
      logger.logError(error, { operation: 'generatePresentation' });
      
      const result: GammaPresentationResult = {
        presentationId: '',
        presentationUrl: '',
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };

      return result;
    }
  }

  /**
   * Get presentation status and details
   */
  async getPresentationStatus(presentationId: string): Promise<{
    status: 'processing' | 'completed' | 'error';
    url?: string;
    embedCode?: string;
    error?: string;
  }> {
    try {
      const response: AxiosResponse = await axios.get(
        `${this.baseUrl}/generations/${presentationId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'User-Agent': 'Slack-Extractor/1.0.0'
          },
          timeout: 30000
        }
      );

      if (response.status === 200 && response.data) {
        return {
          status: response.data.status || 'processing',
          url: response.data.url,
          embedCode: response.data.embedCode,
          error: response.data.error
        };
      } else {
        throw new Error(`Failed to get presentation status: ${response.status}`);
      }

    } catch (error) {
      logger.logError(error, { operation: 'getPresentationStatus', presentationId });
      return {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Poll for generation completion
   */
  private async pollForCompletion(generationId: string): Promise<any> {
    const maxAttempts = 60; // 5 minutes max
    let attempts = 0;

    while (attempts < maxAttempts) {
      try {
        const response: AxiosResponse = await axios.get(
          `${this.baseUrl}/generations/${generationId}`,
          {
            headers: {
              'X-API-KEY': this.apiKey
            },
            timeout: 10000
          }
        );

        const data = response.data;
        
        if (data.status === 'completed') {
          return data;
        } else if (data.status === 'failed') {
          throw new Error(`Generation failed: ${data.error || 'Unknown error'}`);
        }
        
        // Still processing, wait 5 seconds
        await new Promise(resolve => setTimeout(resolve, 5000));
        attempts++;
        
      } catch (error) {
        logger.logError(error, { operation: 'pollForCompletion', generationId });
        throw error;
      }
    }
    
    throw new Error('Generation timed out after 5 minutes');
  }

  /**
   * Test Gamma API connection
   */
  async testConnection(): Promise<boolean> {
    try {
      logger.info('Testing Gamma API connection');
      
      // Test with a minimal generation request
      const testPayload = {
        inputText: 'API Connection Test - This is a test generation to verify API connectivity.',
        format: 'presentation',
        numCards: 3,
        textOptions: {
          amount: 'brief',
          language: 'en'
        }
      };

      const response: AxiosResponse = await axios.post(
        `${this.baseUrl}/generations`,
        testPayload,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-API-KEY': this.apiKey
          },
          timeout: 10000
        }
      );

      const success = (response.status === 200 || response.status === 201) && response.data.generationId;
      
      if (success) {
        logger.info('Gamma API connection successful');
      } else {
        logger.logWarning(`Gamma API connection failed: ${response.status}`);
      }
      
      return success;
      
    } catch (error) {
      logger.logError(error, { operation: 'testConnection' });
      return false;
    }
  }

  /**
   * Truncate content to fit within Gamma's limits
   */
  private truncateContent(content: string): string {
    // Try to truncate at a logical point (end of a section)
    const maxLength = this.maxContentLength - 1000; // Leave some buffer
    
    if (content.length <= maxLength) {
      return content;
    }

    // Find the last complete section before the limit
    const truncated = content.substring(0, maxLength);
    const lastSectionEnd = Math.max(
      truncated.lastIndexOf('\n## '),
      truncated.lastIndexOf('\n### '),
      truncated.lastIndexOf('\n\n')
    );

    if (lastSectionEnd > maxLength * 0.8) {
      return content.substring(0, lastSectionEnd) + '\n\n*[Content truncated due to length limits]*';
    } else {
      return truncated + '\n\n*[Content truncated due to length limits]*';
    }
  }

  /**
   * Format markdown for better presentation structure
   */
  formatMarkdownForPresentation(markdown: string): string {
    // Add presentation structure
    const presentationMarkdown = `# Slack Community Analysis Report

*Generated on ${new Date().toLocaleDateString()}*

---

${markdown}

---

## Summary

This analysis was generated from Slack community data using GPT-5 and presented via Gamma.

*For questions or feedback, contact your community administrators.*`;

    return presentationMarkdown;
  }

  /**
   * Create a simple presentation from basic content
   */
  async createSimplePresentation(
    title: string,
    sections: Array<{ title: string; content: string }>
  ): Promise<GammaPresentationResult> {
    try {
      // Build markdown from sections
      const markdown = sections
        .map(section => `## ${section.title}\n\n${section.content}\n`)
        .join('\n---\n\n');

      return await this.generatePresentation(
        this.formatMarkdownForPresentation(markdown),
        title,
        `Analysis report generated on ${new Date().toLocaleDateString()}`
      );

    } catch (error) {
      logger.logError(error, { operation: 'createSimplePresentation' });
      
      return {
        presentationId: '',
        presentationUrl: '',
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}
