import { AnalysisChunk, GPTAnalysisResult, AnalysisConfig } from '../types/analysis';
/**
 * OpenAI GPT-5 integration service for analyzing Slack data
 */
export declare class OpenAIClient {
    private client;
    private config;
    constructor(apiKey: string, config: AnalysisConfig);
    /**
     * Analyze a single chunk of Slack messages
     */
    analyzeChunk(chunk: AnalysisChunk): Promise<GPTAnalysisResult>;
    /**
     * Analyze multiple chunks with retry logic
     */
    analyzeChunks(chunks: AnalysisChunk[]): Promise<GPTAnalysisResult[]>;
    /**
     * Format chunk data for GPT analysis
     */
    private formatChunkForAnalysis;
    /**
     * Test OpenAI API connection
     */
    testConnection(): Promise<boolean>;
    /**
     * Get token usage statistics
     */
    getTokenStats(results: GPTAnalysisResult[]): {
        totalTokens: number;
        totalPromptTokens: number;
        totalCompletionTokens: number;
        averageTokensPerChunk: number;
        totalCost: number;
    };
    /**
     * Utility delay function
     */
    private delay;
}
//# sourceMappingURL=openaiClient.d.ts.map