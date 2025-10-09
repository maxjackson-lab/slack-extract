require('dotenv').config();
const { SlackService } = require('./dist/services/slackService');
const fs = require('fs');

async function extractSlackData() {
  try {
    console.log('📊 Starting Slack data extraction...');
    
    const slackBotToken = process.env.SLACK_BOT_TOKEN;
    const slackWorkspaceId = process.env.SLACK_WORKSPACE_ID;
    
    if (!slackBotToken || !slackWorkspaceId) {
      throw new Error('Missing Slack credentials. Please check SLACK_BOT_TOKEN and SLACK_WORKSPACE_ID environment variables.');
    }
    
    // Create exports directory if it doesn't exist
    if (!fs.existsSync('exports')) {
      fs.mkdirSync('exports');
    }
    
    const slackService = new SlackService(slackBotToken, slackWorkspaceId);
    
    console.log('🔍 Extracting Slack data...');
    const csvData = await slackService.extractSlackData();
    
    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0] + '_' + 
                     new Date().toISOString().replace(/[:.]/g, '-').split('T')[1].split('.')[0];
    const filename = `exports/slack-data-export_${timestamp}.csv`;
    
    // Write CSV data to file
    fs.writeFileSync(filename, csvData);
    
    console.log('✅ Slack data extraction complete!');
    console.log(`📁 CSV file saved: ${filename}`);
    
    // Get file stats
    const stats = fs.statSync(filename);
    console.log(`📊 File size: ${(stats.size / 1024).toFixed(1)} KB`);
    
    // Count lines (messages)
    const lines = csvData.split('\n').length - 1; // Subtract header
    console.log(`📈 Messages extracted: ${lines}`);
    
    return filename;
    
  } catch (error) {
    console.error('❌ Error extracting Slack data:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run the extraction
extractSlackData();

