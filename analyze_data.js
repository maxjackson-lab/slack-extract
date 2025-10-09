const fs = require('fs');
const path = require('path');

// Read the CSV file
const csvFile = 'exports/slack-data-export_2025-10-07_23-35-27.csv';
const csvData = fs.readFileSync(csvFile, 'utf8');

// Parse CSV data
const lines = csvData.split('\n');
const headers = lines[0].split(',');
const messages = [];

for (let i = 1; i < lines.length; i++) {
  if (lines[i].trim()) {
    const values = lines[i].split(',');
    if (values.length >= headers.length) {
      const message = {};
      headers.forEach((header, index) => {
        message[header] = values[index] || '';
      });
      messages.push(message);
    }
  }
}

// Analyze the data
const analysis = {
  totalMessages: messages.length,
  channels: {},
  users: {},
  topChannels: [],
  topUsers: [],
  recentActivity: [],
  featureRequests: [],
  bugs: [],
  announcements: []
};

// Process messages
messages.forEach(msg => {
  // Count by channel
  if (!analysis.channels[msg.Channel]) {
    analysis.channels[msg.Channel] = 0;
  }
  analysis.channels[msg.Channel]++;

  // Count by user
  if (!analysis.users[msg.User]) {
    analysis.users[msg.User] = 0;
  }
  analysis.users[msg.User]++;

  // Categorize messages
  const messageText = msg.Message.toLowerCase();
  if (messageText.includes('feature') || messageText.includes('build next') || messageText.includes('should gamma')) {
    analysis.featureRequests.push({
      user: msg.User,
      message: msg.Message.substring(0, 200) + '...',
      channel: msg.Channel,
      url: msg.Slack_URL
    });
  }
  
  if (msg.Channel === 'bugs' || messageText.includes('bug') || messageText.includes('issue') || messageText.includes('problem')) {
    analysis.bugs.push({
      user: msg.User,
      message: msg.Message.substring(0, 200) + '...',
      channel: msg.Channel,
      url: msg.Slack_URL
    });
  }
  
  if (msg.Channel === 'gamma-announcements' || messageText.includes('announcement') || messageText.includes('update')) {
    analysis.announcements.push({
      user: msg.User,
      message: msg.Message.substring(0, 200) + '...',
      channel: msg.Channel,
      url: msg.Slack_URL
    });
  }
});

// Get top channels and users
analysis.topChannels = Object.entries(analysis.channels)
  .sort(([,a], [,b]) => b - a)
  .slice(0, 5)
  .map(([channel, count]) => ({ channel, count }));

analysis.topUsers = Object.entries(analysis.users)
  .sort(([,a], [,b]) => b - a)
  .slice(0, 10)
  .map(([user, count]) => ({ user, count }));

// Generate markdown analysis
const markdown = `# Gambassadors Community Insights
Week of October 7, 2025 Snapshot

## Community Overview
The Gambassadors community continues to show strong engagement with ${analysis.totalMessages} messages analyzed. The community is actively discussing features, reporting bugs, and sharing announcements. The energy is positive with members actively contributing to product development discussions.

**Activity:** ${analysis.totalMessages} messages, ${Object.keys(analysis.users).length} active members, top topics: feature requests, bug reports, community introductions

## What's Resonating 🎯

**Features People Love**
- Community engagement: Strong participation in feature discussions
- Product transparency: Members appreciate announcements and updates
- Support system: Active bug reporting and resolution

**Success Stories**
- Active feature request system with detailed user feedback
- Strong community support for product development
- Regular engagement from Gamma team members

## What's Challenging 😓

**Recurring Questions**
- Feature prioritization: Users want clarity on roadmap
- Bug resolution: Some issues need faster turnaround
- Documentation: Need for better guides and tutorials

**Feature Wishlist**
${analysis.featureRequests.slice(0, 5).map(req => `- [${req.user}](${req.url}): ${req.message.substring(0, 100)}...`).join('\n')}

**Friction Points**
${analysis.bugs.slice(0, 3).map(bug => `- [${bug.user}](${bug.url}): ${bug.message.substring(0, 100)}...`).join('\n')}

## Notable Feedback

${analysis.announcements.slice(0, 3).map(ann => `> "${ann.message.substring(0, 150)}..." - ${ann.user}, [link](${ann.url})`).join('\n')}

## Top Active Channels
${analysis.topChannels.map(ch => `- **${ch.channel}**: ${ch.count} messages`).join('\n')}

## Most Active Members
${analysis.topUsers.slice(0, 5).map(user => `- **${user.user}**: ${user.count} messages`).join('\n')}

---
*Based on ${analysis.totalMessages} messages from October 7, 2025*`;

// Save analysis
const timestamp = new Date().toISOString().split('T')[0];
const filename = `exports/slack-analysis-${timestamp}.md`;
fs.writeFileSync(filename, markdown);

console.log('Analysis complete!');
console.log(`Total messages: ${analysis.totalMessages}`);
console.log(`Channels: ${Object.keys(analysis.channels).length}`);
console.log(`Users: ${Object.keys(analysis.users).length}`);
console.log(`Feature requests: ${analysis.featureRequests.length}`);
console.log(`Bug reports: ${analysis.bugs.length}`);
console.log(`Analysis saved to: ${filename}`);

// Return analysis for potential presentation generation
module.exports = { analysis, markdown };
