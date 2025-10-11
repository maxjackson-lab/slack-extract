import { AggregatedAnalysis, GammaPresentationResult, AnalysisConfig } from '../types/analysis';
/**
 * Unified analysis engine that processes all Slack data as one cohesive dataset
 * Provides holistic insights rather than chunked summaries
 */
export declare class UnifiedAnalyzer {
    private openaiClient;
    private gammaClient;
    constructor(openaiApiKey: string, gammaApiKey: string, _config: AnalysisConfig);
    /**
     * Perform unified analysis on all Slack data
     */
    analyzeUnifiedData(csvFilePath: string): Promise<{
        analysis: AggregatedAnalysis;
        presentation: GammaPresentationResult;
        markdownFile: string;
    }>;
    /**
     * Load and parse CSV data
     */
    private loadCsvData;
    /**
     * Calculate detailed channel statistics
     */
    private calculateChannelStats;
    /**
     * Calculate topic distribution by analyzing message content
     */
    private calculateTopicDistribution;
    /**
     * Calculate engagement metrics
     */
    private calculateEngagementMetrics;
    /**
     * Calculate user participation metrics
     */
    private calculateUserMetrics;
    /**
     * Calculate Gamma team response metrics
     */
    private calculateGammaResponseMetrics;
    /**
     * Get date range from messages
     */
    private getDateRange;
    /**
     * Prepare unified dataset with cross-cutting analysis
     */
    private prepareUnifiedDataset;
    /**
     * Perform comprehensive unified analysis with GPT-4o
     */
    private performUnifiedAnalysis;
    /**
     * Extract unified insights from analysis
     */
    private extractUnifiedInsights;
    /**
     * Save markdown report
     */
    private saveMarkdownReport;
}
//# sourceMappingURL=unifiedAnalyzer.d.ts.map