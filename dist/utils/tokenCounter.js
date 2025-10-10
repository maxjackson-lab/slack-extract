"use strict";
/**
 * Token counting utilities for estimating API usage
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenCounter = void 0;
class TokenCounter {
    /**
     * Rough estimation of token count for text
     * GPT models typically use ~4 characters per token for English text
     */
    static estimateTokens(text) {
        if (!text)
            return 0;
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
    static estimateMessageTokens(message) {
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
    static estimateMessagesTokens(messages) {
        return messages.reduce((total, message) => {
            return total + this.estimateMessageTokens(message);
        }, 0);
    }
    /**
     * Estimate tokens for a formatted chunk (including formatting overhead)
     */
    static estimateChunkTokens(messages, chunkIndex, totalChunks) {
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
            if (message.isThreadReply)
                indicators += '[THREAD REPLY] ';
            if (message.hasAttachments)
                indicators += '[HAS ATTACHMENTS] ';
            if (message.hasFiles)
                indicators += '[HAS FILES] ';
            return total + this.estimateTokens(indicators);
        }, 0);
        return messageTokens + formattingTokens + indicatorTokens;
    }
    /**
     * Estimate cost for token usage (rough approximation)
     */
    static estimateCost(tokens, model = 'gpt-5') {
        // These are rough estimates and may vary
        const costPer1kTokens = {
            'gpt-5': 0.01, // $0.01 per 1K tokens (input + output)
            'gpt-4': 0.03,
            'gpt-3.5-turbo': 0.002
        };
        const rate = costPer1kTokens[model] || 0.01;
        return (tokens / 1000) * rate;
    }
    /**
     * Get token usage statistics
     */
    static getTokenStats(results) {
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
    static fitsWithinLimit(content, maxTokens) {
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
    static truncateToTokenLimit(content, maxTokens) {
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
exports.TokenCounter = TokenCounter;
//# sourceMappingURL=tokenCounter.js.map