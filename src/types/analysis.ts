/**
 * TypeScript interfaces for Slack data analysis
 */

export interface SlackMessage {
  channel: string;
  message: string;
  user: string;
  timestamp: string;
  threadParent?: string | undefined;
  urls?: string | undefined;
  slackUrl?: string | undefined;
  isThreadReply: boolean;
  messageType: string;
  hasAttachments: boolean;
  hasFiles: boolean;
}

export interface AnalysisChunk {
  chunkIndex: number;
  totalChunks: number;
  messages: SlackMessage[];
  tokenCount: number;
  content?: string; // Optional content for custom prompts
}

export interface GPTAnalysisResult {
  chunkIndex: number;
  analysis: string;
  tokenUsage: {
    prompt: number;
    completion: number;
    total: number;
  };
  processingTime: number;
}

export interface AggregatedAnalysis {
  totalChunks: number;
  totalMessages: number;
  totalTokens: number;
  totalProcessingTime: number;
  markdownReport: string;
  insights: {
    communityActivity: string;
    featureFeedback: string;
    successStories: string;
    supportPatterns: string;
    emergingTrends: string;
  };
}

export interface GammaPresentationResult {
  presentationId: string;
  presentationUrl: string;
  embedCode?: string;
  status: 'success' | 'error';
  error?: string;
}

export interface AnalysisConfig {
  chunkSize: number;
  maxTokensPerChunk: number;
  gptModel: string;
  systemPrompt: string;
  userPromptTemplate: string;
  retryAttempts: number;
  retryDelay: number;
}

export interface AnalysisProgress {
  currentChunk: number;
  totalChunks: number;
  status: 'processing' | 'completed' | 'error';
  currentOperation: string;
  startTime: number;
  estimatedTimeRemaining?: number;
}

export interface TokenUsage {
  prompt: number;
  completion: number;
  total: number;
}

export interface AnalysisError {
  chunkIndex?: number;
  error: string;
  retryCount: number;
  timestamp: number;
}
