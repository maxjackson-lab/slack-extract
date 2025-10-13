const fs = require('fs');

// Add new fields to AggregatedAnalysis interface
let content = fs.readFileSync('src/types/analysis.ts', 'utf8');

const oldInterface = `export interface AggregatedAnalysis {
  totalChunks: number;
  totalMessages: number;
  totalUniqueUsers: number;
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
}`;

const newInterface = `export interface AggregatedAnalysis {
  totalChunks: number;
  totalMessages: number;
  totalUniqueUsers: number;
  communityMembers: number;
  gammaTeamMembers: number;
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
}`;

content = content.replace(oldInterface, newInterface);
fs.writeFileSync('src/types/analysis.ts', content, 'utf8');

console.log('✅ Updated TypeScript types to include community vs Gamma team counts');











