import { GammaPresentationResult } from '../types/analysis';
/**
 * Gamma API integration service for generating presentations
 */
export declare class GammaClient {
    private apiKey;
    private baseUrl;
    private maxContentLength;
    constructor(apiKey: string);
    /**
     * Generate a presentation from markdown content
     */
    generatePresentation(markdownContent: string, title?: string, description?: string): Promise<GammaPresentationResult>;
    /**
     * Get presentation status and details
     */
    getPresentationStatus(presentationId: string): Promise<{
        status: 'processing' | 'completed' | 'error';
        url?: string;
        embedCode?: string;
        error?: string;
    }>;
    /**
     * Poll for generation completion
     */
    private pollForCompletion;
    /**
     * Test Gamma API connection
     */
    testConnection(): Promise<boolean>;
    /**
     * Truncate content to fit within Gamma's limits
     */
    private truncateContent;
    /**
     * Format markdown for better presentation structure
     */
    formatMarkdownForPresentation(markdown: string): string;
    /**
     * Create a simple presentation from basic content
     */
    createSimplePresentation(title: string, sections: Array<{
        title: string;
        content: string;
    }>): Promise<GammaPresentationResult>;
}
//# sourceMappingURL=gammaClient.d.ts.map