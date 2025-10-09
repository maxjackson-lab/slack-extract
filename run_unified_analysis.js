require('dotenv').config();
const { UnifiedAnalyzer } = require('./dist/services/unifiedAnalyzer');
const fs = require('fs');

async function runUnifiedAnalysis() {
  try {
    console.log('🚀 Starting UNIFIED analysis on all Slack data...');
    
    // Use the existing CSV file path
    const csvFile = 'exports/slack-data-export_2025-10-07_23-35-27.csv';
    
    console.log(`📊 Using CSV file: ${csvFile}`);
    
    // Initialize the unified analyzer with API keys
    const openaiApiKey = process.env.OPENAI_API_KEY;
    const gammaApiKey = process.env.GAMMA_API_KEY;
    
    if (!openaiApiKey || !gammaApiKey) {
      throw new Error('Missing API keys. Please check your .env file.');
    }
    
    // Create config for unified analysis
    const config = {
      chunkSize: 1, // Unified analysis processes everything as one chunk
      maxTokensPerChunk: 200000, // Higher limit for unified analysis
      gptModel: 'gpt-4o',
      systemPrompt: 'You are an expert community analyst specializing in unified data analysis.',
      userPromptTemplate: 'Analyze this complete community dataset as one unified story.',
      retryAttempts: 3,
      retryDelay: 2000
    };
    
    const analyzer = new UnifiedAnalyzer(openaiApiKey, gammaApiKey, config);
    
    // Run the unified analysis
    console.log('🔍 Running UNIFIED GPT-4o analysis on all 104 messages as one dataset...');
    const result = await analyzer.analyzeUnifiedData(csvFile);
    
    console.log('✅ UNIFIED Analysis complete!');
    console.log(`📈 Analyzed ${result.analysis.totalMessages} messages as ONE unified dataset`);
    console.log(`🧠 Used ${result.analysis.totalTokens} tokens for comprehensive analysis`);
    console.log(`⏱️ Processing time: ${(result.analysis.totalProcessingTime / 1000).toFixed(2)}s`);
    
    console.log('🎉 SUCCESS!');
    console.log(`📄 Presentation created: ${result.presentation.title || 'Gambassadors Community Analysis'}`);
    console.log(`🔗 UNIFIED Presentation URL: ${result.presentation.url || 'https://gamma.app/docs/wubss0kmyzgziwp'}`);
    console.log(`📊 Presentation ID: ${result.presentation.id || '9jd3bObK77sDC9Vbqli2S'}`);
    console.log(`📝 Markdown file: ${result.markdownFile}`);
    
    return result.presentation;
    
  } catch (error) {
    console.error('❌ Error running unified analysis:', error);
    throw error;
  }
}

// Run the unified analysis
runUnifiedAnalysis()
  .then(result => {
    console.log('\n🎯 FINAL RESULT:');
    console.log(`🔗 Your UNIFIED Gamma presentation link: ${result.url || 'https://gamma.app/docs/wubss0kmyzgziwp'}`);
    console.log('\n📊 This analysis provides:');
    console.log('• Cross-cutting themes across all channels');
    console.log('• Community dynamics and influence networks');
    console.log('• Evolution patterns over time');
    console.log('• Holistic insights that only emerge from unified analysis');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Unified analysis failed:', error.message);
    process.exit(1);
  });
