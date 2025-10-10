/**
 * Token counting utilities for estimating API usage
 */
export declare class TokenCounter {
    /**
     * Rough estimation of token count for text
     * GPT models typically use ~4 characters per token for English text
     */
    static estimateTokens(text: string): number;
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
    }): number;
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
    }>): number;
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
    }>, chunkIndex: number, totalChunks: number): number;
    /**
     * Estimate cost for token usage (rough approximation)
     */
    static estimateCost(tokens: number, model?: string): number;
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
    };
    /**
     * Check if content fits within token limits
     */
    static fitsWithinLimit(content: string, maxTokens: number): {
        fits: boolean;
        estimatedTokens: number;
        excessTokens?: number | undefined;
    };
    /**
     * Truncate content to fit within token limits
     */
    static truncateToTokenLimit(content: string, maxTokens: number): {
        truncatedContent: string;
        originalTokens: number;
        truncatedTokens: number;
    };
}
//# sourceMappingURL=tokenCounter.d.ts.map