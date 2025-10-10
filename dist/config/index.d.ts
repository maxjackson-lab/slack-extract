/**
 * Configuration module for Slack Extractor
 * Validates and exports all environment variables
 */
declare class Config {
    constructor();
    get slack(): {
        botToken: string | undefined;
        workspaceId: string | undefined;
    };
    get analysis(): {
        openaiApiKey: string | undefined;
        gammaApiKey: string | undefined;
        enabled: boolean;
        gptModel: string;
        systemPrompt: string;
        userPromptTemplate: string;
        maxTokensPerChunk: number;
        chunkSize: number;
    };
    get scheduling(): {
        enabled: boolean;
        cronExpression: string;
        runImmediately: boolean;
    };
    get app(): {
        logLevel: string;
        csvFilenamePrefix: string;
        apiDelayMs: number;
        maxMessagesPerChannel: number;
        maxThreadReplies: number;
    };
    /**
     * Validates that all required environment variables are present
     */
    validateRequiredEnvVars(): void;
    /**
     * Get all configuration as a single object
     */
    getAll(): {
        slack: {
            botToken: string | undefined;
            workspaceId: string | undefined;
        };
        analysis: {
            openaiApiKey: string | undefined;
            gammaApiKey: string | undefined;
            enabled: boolean;
            gptModel: string;
            systemPrompt: string;
            userPromptTemplate: string;
            maxTokensPerChunk: number;
            chunkSize: number;
        };
        scheduling: {
            enabled: boolean;
            cronExpression: string;
            runImmediately: boolean;
        };
        app: {
            logLevel: string;
            csvFilenamePrefix: string;
            apiDelayMs: number;
            maxMessagesPerChannel: number;
            maxThreadReplies: number;
        };
    };
    /**
     * Log configuration (without sensitive data)
     */
    logConfig(): void;
}
declare const _default: Config;
export default _default;
//# sourceMappingURL=index.d.ts.map