const fs = require('fs');

// Read the current file
const filePath = 'dist/services/gammaClient.js';
let content = fs.readFileSync(filePath, 'utf8');

// Update the additionalInstructions to be more specific about Unsplash
const oldInstructions = `additionalInstructions: \`Title: \${title}. Description: \${description}. Use professional Unsplash photos or clean vector graphics for visual elements. Avoid AI-generated images. Focus on high-quality, relevant stock photography from Unsplash. Preserve all markdown links exactly as provided. Create a clean, professional presentation with real photos.\`,`;

const newInstructions = `additionalInstructions: \`Title: \${title}. Description: \${description}. 

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

Create a clean, professional presentation with real Unsplash photos only.\`,`;

// Apply the replacement
content = content.replace(oldInstructions, newInstructions);

// Write the fixed file
fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ Updated Gamma instructions to be more specific about Unsplash images!');










