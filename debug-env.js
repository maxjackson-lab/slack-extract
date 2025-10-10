#!/usr/bin/env node

console.log('=== Environment Variable Debug ===');
console.log('SLACK_BOT_TOKEN:', process.env.SLACK_BOT_TOKEN ? 'SET (length: ' + process.env.SLACK_BOT_TOKEN.length + ')' : 'NOT SET');
console.log('SLACK_WORKSPACE_ID:', process.env.SLACK_WORKSPACE_ID ? 'SET (' + process.env.SLACK_WORKSPACE_ID + ')' : 'NOT SET');
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? 'SET' : 'NOT SET');
console.log('GAMMA_API_KEY:', process.env.GAMMA_API_KEY ? 'SET' : 'NOT SET');

console.log('\n=== Testing Config Import ===');
try {
  const config = require('./dist/config');
  console.log('✅ Config loaded successfully');
  console.log('Slack config:', {
    botToken: config.default.slack.botToken ? 'SET' : 'NOT SET',
    workspaceId: config.default.slack.workspaceId ? 'SET' : 'NOT SET'
  });
} catch (error) {
  console.log('❌ Config failed to load:', error.message);
  console.log('Stack:', error.stack);
}
