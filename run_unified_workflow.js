require('dotenv').config();
const { UnifiedAnalyzer } = require('./dist/services/unifiedAnalyzer');
const fs = require('fs');

async function runUnifiedWorkflow() {
  try {
    // Get CSV file from command line argument or use default
    const csvFile = process.argv[2] || 'exports/slack-data-export_2025-10-07_23-35-27.csv';
    
    console.log(`🚀 Starting unified analysis on: ${csvFile}`);
    
    // Check if file exists
    if (!fs.existsSync(csvFile)) {
      throw new Error(`CSV file not found: ${csvFile}`);
    }
    
    const openaiApiKey = process.env.OPENAI_API_KEY;
    const gammaApiKey = process.env.GAMMA_API_KEY;
    
    if (!openaiApiKey || !gammaApiKey) {
      throw new Error('Missing API keys. Please check OPENAI_API_KEY and GAMMA_API_KEY environment variables.');
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
    console.log('🔍 Running unified GPT-4o analysis...');
    const result = await analyzer.analyzeUnifiedData(csvFile);
    
    console.log('✅ Unified analysis complete!');
    console.log(`📈 Analyzed ${result.analysis.totalMessages} messages as ONE unified dataset`);
    console.log(`🧠 Used ${result.analysis.totalTokens} tokens for comprehensive analysis`);
    console.log(`⏱️ Processing time: ${(result.analysis.totalProcessingTime / 1000).toFixed(2)}s`);
    
    console.log('🎉 SUCCESS!');
    console.log(`📄 Presentation created: ${result.presentation.title || 'Gambassadors Community Analysis'}`);
    console.log(`🔗 Presentation URL: ${result.presentation.presentationUrl || 'Generated'}`);
    console.log(`📊 Presentation ID: ${result.presentation.presentationId || 'N/A'}`);
    console.log(`📝 Markdown file: ${result.markdownFile}`);
    
    // Save analysis summary for GitHub workflow
    const summary = {
      timestamp: new Date().toISOString(),
      totalMessages: result.analysis.totalMessages,
      totalTokens: result.analysis.totalTokens,
      processingTime: result.analysis.totalProcessingTime,
      presentationUrl: result.presentation.presentationUrl || 'Generated',
      presentationId: result.presentation.presentationId || 'N/A',
      markdownFile: result.markdownFile,
      analysisType: 'unified'
    };
    
    fs.writeFileSync('exports/analysis-summary.json', JSON.stringify(summary, null, 2));
    console.log('📋 Analysis summary saved to exports/analysis-summary.json');
    
    return result;
    
  } catch (error) {
    console.error('❌ Error running unified analysis:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run the workflow
runUnifiedWorkflow();


