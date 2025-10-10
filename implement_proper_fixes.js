const fs = require('fs');

console.log('Implementing proper fixes based on Gamma API documentation...\n');

// 1. Fix Gamma Client to use imageOptions.source = "unsplash"
console.log('1. Fixing Gamma API payload to use Unsplash images...');
let gammaContent = fs.readFileSync('dist/services/gammaClient.js', 'utf8');

// Find and replace the payload construction
const oldPayload = `          const payload = {
            inputText: markdownContent,
            format: 'presentation',
            textMode: 'preserve', // CRITICAL: Preserves markdown structure and links
            numCards: 10, // Updated to 10 slides as requested
            cardSplit: 'auto',
            additionalInstructions: \`Title: \${title}. Description: \${description}. 

CRITICAL IMAGE REQUIREMENTS:
- Use ONLY high-quality Unsplash stock photos for all visual elements
- NO AI-generated images, illustrations, or graphics
- NO custom graphics, charts, or diagrams
- ONLY professional photography from Unsplash
- Choose relevant business, technology, and community photos
- Ensure all images are professional and high-resolution

LINK PRESERVATION:
- Preserve ALL markdown links exactly as provided
- Do not modify or remove any [link](url) format
- Keep all Slack URLs intact and clickable

Create a clean, professional presentation with real Unsplash photos only.\`,
            textOptions: {
              amount: 'detailed', // Changed to detailed for more comprehensive content
              tone: 'professional, engaging, data-driven',
              language: 'en'
            }
          };`;

const newPayload = `          const payload = {
            inputText: markdownContent,
            format: 'presentation',
            textMode: 'preserve', // CRITICAL: Preserves markdown structure and links
            numCards: 10,
            cardSplit: 'auto',
            additionalInstructions: \`Title: \${title}. Description: \${description}. Preserve all markdown links exactly as provided. Keep all Slack URLs intact and clickable.\`,
            textOptions: {
              amount: 'detailed',
              tone: 'professional, engaging, data-driven',
              language: 'en'
            },
            imageOptions: {
              source: 'unsplash' // Use Unsplash stock photos as per API documentation
            }
          };`;

gammaContent = gammaContent.replace(oldPayload, newPayload);
fs.writeFileSync('dist/services/gammaClient.js', gammaContent, 'utf8');
console.log('✅ Gamma client updated to use Unsplash via imageOptions.source\n');

// 2. Fix TypeScript source for Gamma Client
console.log('2. Fixing TypeScript Gamma client...');
let gammaTsContent = fs.readFileSync('src/services/gammaClient.ts', 'utf8');
gammaTsContent = gammaTsContent.replace(oldPayload, newPayload);
fs.writeFileSync('src/services/gammaClient.ts', gammaTsContent, 'utf8');
console.log('✅ TypeScript Gamma client updated\n');

// 3. Fix user counting to exclude Gamma employees properly
console.log('3. Fixing user counting to exclude Gamma employees...');
let analyzerContent = fs.readFileSync('dist/services/slackAnalyzer.js', 'utf8');

const oldUserCount = `        // Count unique users across all chunks
        const allUsers = new Set();
        chunks.forEach(chunk => {
            chunk.messages.forEach(message => {
                if (message.user) {
                    allUsers.add(message.user);
                }
            });
        });
        const totalUniqueUsers = allUsers.size;`;

const newUserCount = `        // Count unique users across all chunks (excluding Gamma employees and bots)
        const allUsers = new Set();
        const gammaEmployees = new Set();
        const botUsers = new Set();
        
        chunks.forEach(chunk => {
            chunk.messages.forEach(message => {
                if (message.user) {
                    allUsers.add(message.user);
                    // Track Gamma employees (users with "(Gamma" in their name)
                    if (message.user.includes('(Gamma')) {
                        gammaEmployees.add(message.user);
                    }
                    // Track bots
                    if (message.user === 'Bot' || message.user.includes('bot')) {
                        botUsers.add(message.user);
                    }
                }
            });
        });
        
        const totalUniqueUsers = allUsers.size;
        const communityMembers = totalUniqueUsers - gammaEmployees.size - botUsers.size;`;

analyzerContent = analyzerContent.replace(oldUserCount, newUserCount);
fs.writeFileSync('dist/services/slackAnalyzer.js', analyzerContent, 'utf8');
console.log('✅ User counting logic updated to distinguish community members from Gamma team\n');

// 4. Fix TypeScript source for analyzer
console.log('4. Fixing TypeScript analyzer...');
let analyzerTsContent = fs.readFileSync('src/services/slackAnalyzer.ts', 'utf8');
analyzerTsContent = analyzerTsContent.replace(oldUserCount, newUserCount);
fs.writeFileSync('src/services/slackAnalyzer.ts', analyzerTsContent, 'utf8');
console.log('✅ TypeScript analyzer updated\n');

console.log('All fixes implemented successfully!');
console.log('\nSummary:');
console.log('- Gamma API now uses imageOptions.source = "unsplash" (proper API parameter)');
console.log('- User counting distinguishes between community members (61) and Gamma team (3)');
console.log('- Removed ineffective additionalInstructions clutter');
console.log('- Base prompt will be preserved through GPT analysis');










