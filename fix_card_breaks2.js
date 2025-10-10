const fs = require('fs');

console.log('Adding proper \\n---\\n card breaks to GPT prompt template...\n');

const files = ['dist/config/index.js', 'src/config/index.ts'];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Update the instruction text
  const oldInstruction = 'Output markdown only. No JSON. No preambles. Start with # heading.';
  const newInstruction = 'Output markdown only. No JSON. No preambles. Start with # heading. Use \\n---\\n to separate major sections into cards.';
  
  content = content.replace(oldInstruction, newInstruction);
  
  // Add break before "What's Challenging" section
  content = content.replace(
    /\n## What's Challenging 😓\n/g,
    '\n\n---\n\n## What\'s Challenging 😓\n'
  );
  
  // Add break before "Notable Feedback" section
  content = content.replace(
    /\n## Notable Feedback\n/g,
    '\n\n---\n\n## Notable Feedback\n'
  );
  
  fs.writeFileSync(file, content, 'utf8');
  console.log(`✅ Updated ${file} with proper card breaks`);
});

console.log('\n✅ GPT will now generate markdown with \\n---\\n breaks between sections');
console.log('   This works with cardSplit: "inputTextBreaks" in Gamma API');











