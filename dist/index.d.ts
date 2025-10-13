/**
 * Main Application
 * Orchestrates the Slack data extraction, analysis, and presentation generation
 */
declare class SlackExtractorApp {
    private isRunning;
    private cronJob;
    private analyzer;
    constructor();
    /**
     * Find the latest CSV file in exports directory
     */
    private findLatestCsvFile;
    /**
     * Setup the analysis engine
     */
    private setupAnalyzer;
    /**
     * Main execution function
     */
    run(): Promise<void>;
    /**
     * Run analysis on existing CSV data
     */
    runAnalysis(csvFilePath?: string): Promise<void>;
    /**
     * Display analysis results
     */
    private displayAnalysisResults;
    /**
     * Interactive menu for user operations
     */
    showInteractiveMenu(): Promise<void>;
    /**
     * Test all API connections
     */
    testConnections(): Promise<void>;
    /**
     * Log process summary
     */
    private logSummary;
    /**
     * Setup scheduled execution
     */
    setupScheduling(): void;
    /**
     * Start the application
     */
    start(): Promise<void>;
    /**
     * Stop the application
     */
    stop(): void;
    /**
     * Run once and exit
     */
    runOnce(): Promise<void>;
    /**
     * Run analysis once and exit
     */
    runAnalysisOnce(): Promise<void>;
}
export default SlackExtractorApp;
//# sourceMappingURL=index.d.ts.map