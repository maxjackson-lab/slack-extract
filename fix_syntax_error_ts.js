const fs = require('fs');

// Read the TypeScript file
const filePath = 'src/services/slackAnalyzer.ts';
let content = fs.readFileSync(filePath, 'utf8');

// Fix the syntax error by escaping the backticks in the quote
const problematicLine = `- **Smart Diagram Problems:** "agent bug. i had a card with a smart diagram (puzzle). prompt \`update the titles / primary headings on all cards to use font size \\"Display\\"\` the modifications results in the smart diagram breaking." - Mariena Quintanilla, [link](https://gambassadors.slack.com/archives/C05BT88C8JF/p1759174802036309?thread_ts=1759174802.036309&cid=C05BT88C8JF)`;

const fixedLine = `- **Smart Diagram Problems:** "agent bug. i had a card with a smart diagram (puzzle). prompt \\\`update the titles / primary headings on all cards to use font size \\"Display\\"\\\` the modifications results in the smart diagram breaking." - Mariena Quintanilla, [link](https://gambassadors.slack.com/archives/C05BT88C8JF/p1759174802036309?thread_ts=1759174802.036309&cid=C05BT88C8JF)`;

// Apply the fix
content = content.replace(problematicLine, fixedLine);

// Write the fixed file
fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ TypeScript syntax error fixed!');









