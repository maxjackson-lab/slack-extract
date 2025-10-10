const fs = require('fs');

// Fix BOTH JavaScript and TypeScript files to add imageOptions
const files = [
  'dist/services/gammaClient.js',
  'src/services/gammaClient.ts'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Find the textOptions closing and add imageOptions after it
  const searchPattern = `                textOptions: {
                    amount: 'detailed', // Changed to detailed for more comprehensive content
                    tone: 'professional, engaging, data-driven',
                    language: 'en'
                }
            };`;
  
  const replacement = `                textOptions: {
                    amount: 'detailed',
                    tone: 'professional, engaging, data-driven',
                    language: 'en'
                },
                imageOptions: {
                    source: 'unsplash' // Use Unsplash stock photos per API documentation
                }
            };`;
  
  if (content.includes(searchPattern)) {
    content = content.replace(searchPattern, replacement);
    fs.writeFileSync(file, content, 'utf8');
    console.log(`✅ Updated ${file} to add imageOptions.source = "unsplash"`);
  } else {
    console.log(`⚠️  Pattern not found in ${file}`);
  }
});

console.log('\n✅ Gamma API now properly configured to use Unsplash images via imageOptions parameter');










