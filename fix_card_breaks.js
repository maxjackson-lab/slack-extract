const fs = require('fs');

console.log('Adding proper \\n---\\n card breaks to GPT prompt template...\n');

const files = ['dist/config/index.js', 'src/config/index.ts'];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // The template should have breaks between major sections for better card division
  // Update to add more explicit section breaks
  
  const oldTemplate = `Output markdown only. No JSON. No preambles. Start with # heading.

---

# Gambassadors Community Insights
Week of [Date] Snapshot

## Community Overview`;

  const newTemplate = `Output markdown only. No JSON. No preambles. Start with # heading.

Use \\n---\\n to separate major sections into cards (Gamma will split content at these markers).

---

# Gambassadors Community Insights
Week of [Date] Snapshot

## Community Overview`;

  // Also add breaks between the main sections
  content = content.replace(oldTemplate, newTemplate);
  
  // Add break before "What's Challenging"
  content = content.replace(
    /## What's Challenging 😓/g,
    '---\\n\\n## What\\'s Challenging 😓'
  );
  
  // Add break before "Notable Feedback"  
  content = content.replace(
    /## Notable Feedback/g,
    '---\\n\\n## Notable Feedback'
  );
  
  fs.writeFileSync(file, content, 'utf8');
  console.log(`✅ Updated ${file} with proper card breaks`);
});

console.log('\\n✅ GPT will now generate markdown with \\n---\\n breaks between sections');
console.log('   This works with cardSplit: "inputTextBreaks" in Gamma API');












