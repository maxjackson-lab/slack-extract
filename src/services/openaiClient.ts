import OpenAI from 'openai';
import { AnalysisChunk, GPTAnalysisResult, AnalysisConfig } from '../types/analysis';
const logger = require('../utils/logger');

/**
 * OpenAI GPT-5 integration service for analyzing Slack data
 */
export class OpenAIClient {
  private client: OpenAI;
  private config: AnalysisConfig;

  constructor(apiKey: string, config: AnalysisConfig) {
    this.client = new OpenAI({ apiKey });
    this.config = config;
  }

  /**
   * Analyze a single chunk of Slack messages
   */
  async analyzeChunk(chunk: AnalysisChunk): Promise<GPTAnalysisResult> {
    const startTime = Date.now();
    
    try {
      logger.info(`Analyzing chunk ${chunk.chunkIndex}/${chunk.totalChunks} (${chunk.messages.length} messages, ~${chunk.tokenCount} tokens)`);

      // Format chunk data for analysis
      const chunkData = this.formatChunkForAnalysis(chunk);
      
      // Create user prompt with chunk data
      let userPrompt;
      if (chunk.content && chunk.content.includes('Gambassadors Community Analysis')) {
        // Use the custom prompt from UnifiedAnalyzer
        userPrompt = chunk.content;
      } else {
        // Use the config template for regular chunked analysis
        if (!this.config.userPromptTemplate) {
          throw new Error('userPromptTemplate is not defined in config');
        }
        userPrompt = this.config.userPromptTemplate.replace('{{PASTE_SLACK_DATA_HERE}}', chunkData);
      }
      
      // Debug: Log the first 1000 characters of the user prompt to see what's being sent
      logger.info(`User prompt preview (first 1000 chars):`, {
        promptPreview: userPrompt.substring(0, 1000) + '...',
        chunkDataPreview: chunkData.substring(0, 500) + '...'
      });

      // Make API call to GPT-5
      const response = await this.client.chat.completions.create({
        model: this.config.gptModel,
        messages: [
          { role: 'system', content: this.config.systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_completion_tokens: 12000, // Optimized for GPT-4o-mini's 16K limit
        temperature: 0.7,
        top_p: 0.9
      });

      const processingTime = Date.now() - startTime;
      const analysis = response.choices[0]?.message?.content || '';

      if (!analysis) {
        throw new Error('Empty response from GPT-5');
      }

      const result: GPTAnalysisResult = {
        chunkIndex: chunk.chunkIndex,
        analysis,
        tokenUsage: {
          prompt: response.usage?.prompt_tokens || 0,
          completion: response.usage?.completion_tokens || 0,
          total: response.usage?.total_tokens || 0
        },
        processingTime
      };

      logger.info(`Chunk ${chunk.chunkIndex} analysis completed`, {
        tokensUsed: result.tokenUsage.total,
        processingTime: `${processingTime}ms`
      });

      return result;

    } catch (error) {
      const processingTime = Date.now() - startTime;
      logger.logError(error, { 
        operation: 'analyzeChunk', 
        chunkIndex: chunk.chunkIndex,
        processingTime: `${processingTime}ms`
      });
      throw error;
    }
  }

  /**
   * Analyze multiple chunks with retry logic
   */
  async analyzeChunks(chunks: AnalysisChunk[]): Promise<GPTAnalysisResult[]> {
    const results: GPTAnalysisResult[] = [];
    
    logger.info(`Starting analysis of ${chunks.length} chunks`);

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      let attempts = 0;
      let success = false;

      while (attempts < this.config.retryAttempts && !success) {
        try {
          const result = await this.analyzeChunk(chunk);
          results.push(result);
          success = true;
          
          // Add delay between requests to respect rate limits
          if (i < chunks.length - 1) {
            await this.delay(1000);
          }
          
        } catch (error) {
          attempts++;
          logger.logWarning(`Chunk ${chunk.chunkIndex} analysis failed (attempt ${attempts}/${this.config.retryAttempts}): ${error}`);
          
          if (attempts < this.config.retryAttempts) {
            await this.delay(this.config.retryDelay * attempts);
          } else {
            throw new Error(`Failed to analyze chunk ${chunk.chunkIndex} after ${this.config.retryAttempts} attempts: ${error}`);
          }
        }
      }
    }

    logger.info(`Successfully analyzed all ${chunks.length} chunks`);
    return results;
  }

  /**
   * Format chunk data for GPT analysis
   */
  private formatChunkForAnalysis(chunk: AnalysisChunk): string {
    const header = `Chunk ${chunk.chunkIndex}/${chunk.totalChunks} - ${chunk.messages.length} messages\n`;
    const separator = '='.repeat(50) + '\n';
    
    const messages = chunk.messages.map((msg, index) => {
      const threadIndicator = msg.isThreadReply ? '[THREAD REPLY] ' : '';
      const attachmentIndicator = msg.hasAttachments ? '[HAS ATTACHMENTS] ' : '';
      const fileIndicator = msg.hasFiles ? '[HAS FILES] ' : '';
      
      return `${index + 1}. ${threadIndicator}${attachmentIndicator}${fileIndicator}
Channel: ${msg.channel}
User: ${msg.user}
Timestamp: ${msg.timestamp}
Message: ${msg.message}
${msg.urls ? `URLs: ${msg.urls}` : ''}
${msg.slackUrl ? `Slack URL: ${msg.slackUrl}` : ''}
${msg.threadParent ? `Thread Parent: ${msg.threadParent}` : ''}
---`;
    }).join('\n\n');

    return header + separator + messages + '\n' + separator;
  }

  /**
   * Test OpenAI API connection
   */
  async testConnection(): Promise<boolean> {
    try {
      logger.info('Testing OpenAI API connection');
      
      const response = await this.client.chat.completions.create({
        model: this.config.gptModel,
        messages: [
          { role: 'user', content: 'Hello, this is a connection test. Please respond with "Connection successful."' }
        ],
        max_completion_tokens: 10
      });

      const result = response.choices[0]?.message?.content?.trim();
      const success = result === 'Connection successful.';
      
      if (success) {
        logger.info('OpenAI API connection successful');
      } else {
        logger.logWarning(`Unexpected OpenAI response: ${result}`);
      }
      
      return success;
      
    } catch (error) {
      logger.logError(error, { operation: 'testConnection' });
      return false;
    }
  }

  /**
   * Get token usage statistics
   */
  getTokenStats(results: GPTAnalysisResult[]): {
    totalTokens: number;
    totalPromptTokens: number;
    totalCompletionTokens: number;
    averageTokensPerChunk: number;
    totalCost: number; // Rough estimate
  } {
    const totalPromptTokens = results.reduce((sum, r) => sum + r.tokenUsage.prompt, 0);
    const totalCompletionTokens = results.reduce((sum, r) => sum + r.tokenUsage.completion, 0);
    const totalTokens = totalPromptTokens + totalCompletionTokens;
    
    // Rough cost estimate: $0.01 per 1K tokens for GPT-5 (this may vary)
    const totalCost = (totalTokens / 1000) * 0.01;

    return {
      totalTokens,
      totalPromptTokens,
      totalCompletionTokens,
      averageTokensPerChunk: Math.round(totalTokens / results.length),
      totalCost
    };
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
