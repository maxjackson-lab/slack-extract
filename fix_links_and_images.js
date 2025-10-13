const fs = require('fs');

// Read the current file
const filePath = 'dist/services/slackAnalyzer.js';
let content = fs.readFileSync(filePath, 'utf8');

// Replace the static analysis with a dynamic approach that preserves GPT's link generation
const oldAnalysis = `        // Create a balanced, data-driven analysis based on actual channel activity
        const combinedAnalysis = \`# Gambassadors Community Insights
Week of October 1, 2025 Snapshot

## Community Overview
The Gambassadors community shows strong engagement across multiple channels, with the majority of activity focused on technical discussions and support. The community demonstrates a healthy mix of feature requests, bug reports, and collaborative problem-solving.

**Activity:** \${totalMessages} messages, \${totalUniqueUsers} unique users across 7 channels.

**Channel Activity Breakdown:**
- API & Integrations: 34 messages (32% of activity)
- Questions & Support: 31 messages (29% of activity)  
- Bug Reports: 22 messages (21% of activity)
- General Discussion: 9 messages (8% of activity)
- Feature Requests: 6 messages (6% of activity)
- Announcements: 2 messages (2% of activity)
- Events: 2 messages (2% of activity)

## What's Resonating 🎯

**API Integration Success**
- **Real Estate CRM Integration:** "I have a Real Estate CRM that contains property information and listing information - I am taking that data and generate Gamma presentation using the API." - Mark Stepp, [link](https://gambassadors.slack.com/archives/C08SC8025PT/p1759351442078979?thread_ts=1759351442.078979&cid=C08SC8025PT)
- **n8n Automation:** "I just released a custom Gamma node for n8n (if your self hosting). Most likely by next week it will be in the cloud version." - Chowderr Miller, [link](https://gambassadors.slack.com/archives/C08SC8025PT/p1759510061268609?thread_ts=1759510061.268609&cid=C08SC8025PT)
- **API Improvements:** "Big changes for our API users today: 50 presentations per hour - that's right, we've moved from daily to hourly limits!" - Max J (Gamma API Support Engineer), [link](https://gambassadors.slack.com/archives/C08SC8025PT/p1759351442078979?thread_ts=1759351442.078979&cid=C08SC8025PT)

**Community Engagement**
- **Survey Participation:** "Your feedback has a direct impact on where this community goes next." - Amanda, [link](https://gambassadors.slack.com/archives/C046CNGAR7E/p1759245660874329)
- **Transparent Communication:** "This new model creates a structure where we can offer much more powerful AI that didn't fit our unlimited AI model." - Jon Noronha, [link](https://gambassadors.slack.com/archives/C046CNGAR7E/p1759355255562579)

## What's Challenging 😓

**Agent Reliability Issues**
- **Smart Diagram Problems:** "agent bug. i had a card with a smart diagram (puzzle). prompt \\\`update the titles / primary headings on all cards to use font size \\"Display\\"\\\` the modifications results in the smart diagram breaking." - Mariena Quintanilla, [link](https://gambassadors.slack.com/archives/C05BT88C8JF/p1759174802036309?thread_ts=1759174802.036309&cid=C05BT88C8JF)
- **Setting Reversions:** "I'm not sure what's triggering it yet but, I keep setting header & footer off on a couple of cards in my deck where I have full card images and it keeps getting reverted." - Mariena Quintanilla, [link](https://gambassadors.slack.com/archives/C05BT88C8JF/p1759213625192859?thread_ts=1759213625.192859&cid=C05BT88C8JF)
- **Image Storage Issues:** "There seems to be a glitch in the behaviour of the AGENT and the images that are saved." - Staci Clarke, [link](https://gambassadors.slack.com/archives/C05BT88C8JF/p1759396606891899?thread_ts=1759396606.891899&cid=C05BT88C8JF)

**Pricing Transparency Concerns**
- **Credit Clarity:** "I notice that, unlike when you are creating cards or changing images at the card level, there is no clarity in using the AGENT about how many credits you are going to be charged BEFORE you go forward." - Staci Clarke, [link](https://gambassadors.slack.com/archives/C05BT88C8JF/p1759396606891899?thread_ts=1759396606.891899&cid=C05BT88C8JF)
- **Gallery Access:** "Is frustrating not to have access to the items in the gallery." - Staci Clarke, [link](https://gambassadors.slack.com/archives/C05BT88C8JF/p1759439674784999?thread_ts=1759396606.891899&cid=C05BT88C8JF)

**Feature Requests (6 messages)**
- **Agent Accountability:** "It would be great to get a checklist of changes agent made so I can uncheck the items I don't want." - Mariena Quintanilla, [link](https://gambassadors.slack.com/archives/C04702QJ39N/p1759263935363469?thread_ts=1759263935.363469&cid=C04702QJ39N)
- **Undo Functionality:** "like an undo function with the exit action taken by buddy but the ability to delete something 10 steps back." - Dr. Deepak Bhootra, [link](https://gambassadors.slack.com/archives/C04702QJ39N/p1759269106214879?thread_ts=1759263935.363469&cid=C04702QJ39N)

## Notable Feedback

> "I love this suggestion and just ran into this type of situation with Agent yesterday!" - Amanda, [link](https://gambassadors.slack.com/archives/C04702QJ39N/p1759267834157589?thread_ts=1759263935.363469&cid=C04702QJ39N)
> "But hoping there's a solution for this as I think it would go a long way with users." - Mariena Quintanilla, [link](https://gambassadors.slack.com/archives/C04702QJ39N/p1759277555479139?thread_ts=1759263935.363469&cid=C04702QJ39N)
> "Yes, this is important. Especially since we are being charged." - Staci Clarke, [link](https://gambassadors.slack.com/archives/C05BT88C8JF/p1759439674784999?thread_ts=1759396606.891899&cid=C05BT88C8JF)
> "Thanks for your feedback, Staci! I've shared it with the appropriate internal teams" - Dae-Ho (Gamma), [link](https://gambassadors.slack.com/archives/C05BT88C8JF/p1759435866669339?thread_ts=1759396606.891899&cid=C05BT88C8JF)

---
*Based on \${totalMessages} messages from September 30 to October 3, 2025*\`;`;

const newAnalysis = `        // Combine all analyses but ensure links are preserved
        const combinedAnalysis = results
            .map(result => result.analysis)
            .join('\\n\\n---\\n\\n');`;

// Apply the replacement
content = content.replace(oldAnalysis, newAnalysis);

// Write the fixed file
fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ Fixed to preserve GPT-generated links and dynamic analysis!');











