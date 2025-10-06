/**
 * Token counting utilities for estimating API usage
 */

export class TokenCounter {
  /**
   * Rough estimation of token count for text
   * GPT models typically use ~4 characters per token for English text
   */
  static estimateTokens(text: string): number {
    if (!text) return 0;
    
    // Basic estimation: 1 token ≈ 4 characters for English
    const baseEstimate = Math.ceil(text.length / 4);
    
    // Adjust for special characters and whitespace
    const specialChars = (text.match(/[^\w\s]/g) || []).length;
    const whitespace = (text.match(/\s/g) || []).length;
    
    // Special characters and whitespace typically use fewer tokens
    const adjustedEstimate = baseEstimate - Math.floor((specialChars + whitespace) / 8);
    
    return Math.max(1, adjustedEstimate);
  }

  /**
   * Estimate tokens for a Slack message object
   */
  static estimateMessageTokens(message: {
    channel: string;
    message: string;
    user: string;
    timestamp: string;
    urls?: string;
    slackUrl?: string;
  }): number {
    const text = [
      message.channel,
      message.message,
      message.user,
      message.timestamp,
      message.urls || '',
      message.slackUrl || ''
    ].join(' ');

    return this.estimateTokens(text);
  }

  /**
   * Estimate tokens for an array of messages
   */
  static estimateMessagesTokens(messages: Array<{
    channel: string;
    message: string;
    user: string;
    timestamp: string;
    urls?: string;
    slackUrl?: string;
  }>): number {
    return messages.reduce((total, message) => {
      return total + this.estimateMessageTokens(message);
    }, 0);
  }

  /**
   * Estimate tokens for a formatted chunk (including formatting overhead)
   */
  static estimateChunkTokens(messages: Array<{
    channel: string;
    message: string;
    user: string;
    timestamp: string;
    urls?: string;
    slackUrl?: string;
    isThreadReply?: boolean;
    hasAttachments?: boolean;
    hasFiles?: boolean;
  }>, chunkIndex: number, totalChunks: number): number {
    // Base message tokens
    const messageTokens = this.estimateMessagesTokens(messages);
    
    // Formatting overhead (headers, separators, etc.)
    const headerText = `Chunk ${chunkIndex}/${totalChunks} - ${messages.length} messages\n${'='.repeat(50)}\n`;
    const separatorText = '\n---\n';
    const footerText = `\n${'='.repeat(50)}`;
    
    const formattingTokens = this.estimateTokens(headerText) + 
                           (messages.length * this.estimateTokens(separatorText)) +
                           this.estimateTokens(footerText);
    
    // Additional tokens for thread indicators, attachment indicators, etc.
    const indicatorTokens = messages.reduce((total, message) => {
      let indicators = '';
      if (message.isThreadReply) indicators += '[THREAD REPLY] ';
      if (message.hasAttachments) indicators += '[HAS ATTACHMENTS] ';
      if (message.hasFiles) indicators += '[HAS FILES] ';
      return total + this.estimateTokens(indicators);
    }, 0);

    return messageTokens + formattingTokens + indicatorTokens;
  }

  /**
   * Estimate cost for token usage (rough approximation)
   */
  static estimateCost(tokens: number, model: string = 'gpt-5'): number {
    // These are rough estimates and may vary
    const costPer1kTokens = {
      'gpt-5': 0.01, // $0.01 per 1K tokens (input + output)
      'gpt-4': 0.03,
      'gpt-3.5-turbo': 0.002
    };

    const rate = costPer1kTokens[model as keyof typeof costPer1kTokens] || 0.01;
    return (tokens / 1000) * rate;
  }

  /**
   * Get token usage statistics
   */
  static getTokenStats(results: Array<{
    tokenUsage: {
      prompt: number;
      completion: number;
      total: number;
    };
  }>): {
    totalTokens: number;
    totalPromptTokens: number;
    totalCompletionTokens: number;
    averageTokensPerRequest: number;
    estimatedCost: number;
  } {
    const totalPromptTokens = results.reduce((sum, r) => sum + r.tokenUsage.prompt, 0);
    const totalCompletionTokens = results.reduce((sum, r) => sum + r.tokenUsage.completion, 0);
    const totalTokens = totalPromptTokens + totalCompletionTokens;

    return {
      totalTokens,
      totalPromptTokens,
      totalCompletionTokens,
      averageTokensPerRequest: Math.round(totalTokens / results.length),
      estimatedCost: this.estimateCost(totalTokens)
    };
  }

  /**
   * Check if content fits within token limits
   */
  static fitsWithinLimit(content: string, maxTokens: number): {
    fits: boolean;
    estimatedTokens: number;
    excessTokens?: number | undefined;
  } {
    const estimatedTokens = this.estimateTokens(content);
    const fits = estimatedTokens <= maxTokens;
    
    return {
      fits,
      estimatedTokens,
      excessTokens: fits ? undefined : estimatedTokens - maxTokens
    };
  }

  /**
   * Truncate content to fit within token limits
   */
  static truncateToTokenLimit(content: string, maxTokens: number): {
    truncatedContent: string;
    originalTokens: number;
    truncatedTokens: number;
  } {
    const originalTokens = this.estimateTokens(content);
    
    if (originalTokens <= maxTokens) {
      return {
        truncatedContent: content,
        originalTokens,
        truncatedTokens: originalTokens
      };
    }

    // Simple truncation - could be enhanced with smarter text splitting
    const targetLength = Math.floor((maxTokens / originalTokens) * content.length);
    const truncatedContent = content.substring(0, targetLength) + '... [truncated]';
    const truncatedTokens = this.estimateTokens(truncatedContent);

    return {
      truncatedContent,
      originalTokens,
      truncatedTokens
    };
  }
}
