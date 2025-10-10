const fs = require('fs');

// Fix the presentation description to show community members count
let content = fs.readFileSync('dist/services/slackAnalyzer.js', 'utf8');

const oldLine = `            const presentation = await this.gammaClient.generatePresentation(this.gammaClient.formatMarkdownForPresentation(aggregatedAnalysis.markdownReport), 'Slack Community Analysis', \`Weekly analysis of \${aggregatedAnalysis.totalMessages} messages from \${new Date().toLocaleDateString()}\`);`;

const newLine = `            const weekStart = new Date();
            weekStart.setDate(weekStart.getDate() - weekStart.getDay());
            const weekTitle = \`Week of \${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} Community Analysis\`;
            
            const presentation = await this.gammaClient.generatePresentation(this.gammaClient.formatMarkdownForPresentation(aggregatedAnalysis.markdownReport), weekTitle, \`Weekly analysis of \${aggregatedAnalysis.totalMessages} messages from \${aggregatedAnalysis.communityMembers} community members (plus \${aggregatedAnalysis.gammaTeamMembers} Gamma team responses)\`);`;

content = content.replace(oldLine, newLine);
fs.writeFileSync('dist/services/slackAnalyzer.js', content, 'utf8');

// Also update TypeScript
let tsContent = fs.readFileSync('src/services/slackAnalyzer.ts', 'utf8');
tsContent = tsContent.replace(oldLine, newLine);
fs.writeFileSync('src/services/slackAnalyzer.ts', tsContent, 'utf8');

console.log('✅ Updated presentation description to show community members vs Gamma team');










