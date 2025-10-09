const fs = require('fs');

// Fix the return statement to include new fields
let content = fs.readFileSync('dist/services/slackAnalyzer.js', 'utf8');

const oldReturn = `        return {
            totalChunks: results.length,
            totalMessages,
            totalUniqueUsers,
            totalTokens,
            totalProcessingTime,
            markdownReport: combinedAnalysis,
            insights
        };`;

const newReturn = `        return {
            totalChunks: results.length,
            totalMessages,
            totalUniqueUsers,
            communityMembers,
            gammaTeamMembers: gammaEmployees.size,
            totalTokens,
            totalProcessingTime,
            markdownReport: combinedAnalysis,
            insights
        };`;

content = content.replace(oldReturn, newReturn);
fs.writeFileSync('dist/services/slackAnalyzer.js', content, 'utf8');

// Also fix TypeScript
let tsContent = fs.readFileSync('src/services/slackAnalyzer.ts', 'utf8');
tsContent = tsContent.replace(oldReturn, newReturn);
fs.writeFileSync('src/services/slackAnalyzer.ts', tsContent, 'utf8');

console.log('✅ Updated return statement to include communityMembers and gammaTeamMembers');










