require('dotenv').config();
const { SlackAnalyzer } = require('./dist/services/slackAnalyzer');
const fs = require('fs');

async function runAnalysisOnly() {
  try {
    console.log('🚀 Starting analysis on existing CSV data...');
    
    // Use the existing CSV file path
    const csvFile = 'exports/slack-data-export_2025-10-07_23-35-27.csv';
    
    console.log(`📊 Using CSV file: ${csvFile}`);
    
    // Initialize the analyzer with API keys
    const openaiApiKey = process.env.OPENAI_API_KEY;
    const gammaApiKey = process.env.GAMMA_API_KEY;
    
    if (!openaiApiKey || !gammaApiKey) {
      throw new Error('Missing API keys. Please check your .env file.');
    }
    
    const analyzer = new SlackAnalyzer(openaiApiKey, gammaApiKey);
    
    // Run the analysis
    console.log('🔍 Running GPT-4o analysis...');
    const result = await analyzer.analyzeSlackData(csvFile);
    
    console.log('✅ Analysis complete!');
    console.log(`📈 Analyzed ${result.analysis.totalMessages} messages`);
    console.log(`👥 Found ${result.analysis.uniqueUsers} unique users`);
    console.log(`📱 Found ${result.analysis.channels.length} channels`);
    
    console.log('🎉 SUCCESS!');
    console.log(`📄 Presentation created: ${result.presentation.title}`);
    console.log(`🔗 Presentation URL: ${result.presentation.url}`);
    console.log(`📊 Presentation ID: ${result.presentation.id}`);
    console.log(`📝 Markdown file: ${result.markdownFile}`);
    
    return result.presentation;
    
  } catch (error) {
    console.error('❌ Error running analysis:', error);
    throw error;
  }
}

// Run the analysis
runAnalysisOnly()
  .then(result => {
    console.log('\n🎯 FINAL RESULT:');
    console.log(`🔗 Your Gamma presentation link: ${result.url}`);
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Analysis failed:', error.message);
    process.exit(1);
  });
