import { SlackMessage, AnalysisChunk } from '../types/analysis';
/**
 * Service for processing CSV files and chunking data for analysis
 */
export declare class ChunkProcessor {
    private readonly EXPORTS_DIR;
    /**
     * Find the latest CSV file in the exports directory
     */
    findLatestCsvFile(): string | null;
    /**
     * Process a CSV file and return an array of SlackMessage objects
     */
    processCsvFile(filePath: string, chunkSize: number): Promise<AnalysisChunk[]>;
    /**
     * Chunk messages into smaller pieces for GPT analysis
     */
    chunkMessages(messages: SlackMessage[], chunkSize: number): AnalysisChunk[];
    /**
     * Get statistics about the chunks
     */
    getChunkStats(chunks: AnalysisChunk[]): {
        totalChunks: number;
        totalMessages: number;
        averageTokensPerChunk: number;
        maxTokensInChunk: number;
        minTokensInChunk: number;
    };
}
//# sourceMappingURL=chunkProcessor.d.ts.map