import { AggregatedAnalysis, GammaPresentationResult, AnalysisConfig, AnalysisProgress } from '../types/analysis';
/**
 * Main analysis engine that orchestrates the complete pipeline
 */
export declare class SlackAnalyzer {
    private chunkProcessor;
    private openaiClient;
    private gammaClient;
    private config;
    private progressCallback?;
    constructor(openaiApiKey: string, gammaApiKey: string, config?: Partial<AnalysisConfig>);
    /**
     * Set progress callback for UI updates
     */
    setProgressCallback(callback: (progress: AnalysisProgress) => void): void;
    /**
     * Main analysis pipeline: CSV → Chunks → GPT Analysis → Aggregation → Gamma Presentation
     */
    analyzeSlackData(csvFilePath?: string): Promise<{
        analysis: AggregatedAnalysis;
        presentation: GammaPresentationResult;
        markdownFile: string;
    }>;
    /**
     * Analyze chunks with progress updates
     */
    private analyzeChunksWithProgress;
    /**
     * Aggregate individual chunk analyses into a comprehensive report
     */
    private aggregateAnalysisResults;
    /**
     * Extract structured insights from the combined analysis
     */
    private extractInsights;
    /**
     * Save markdown report to file
     */
    private saveMarkdownReport;
    /**
     * Update progress for UI
     */
    private updateProgress;
    /**
     * Test all API connections
     */
    testConnections(): Promise<{
        openai: boolean;
        gamma: boolean;
    }>;
    /**
     * Get default configuration
     */
    private getDefaultConfig;
}
//# sourceMappingURL=slackAnalyzer.d.ts.map