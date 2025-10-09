# Complete GPT-4o Prompt Breakdown for Slack Analysis

## Current Configuration

### Model: `gpt-4o`
### Chunk Size: 25 messages per chunk
### Total Chunks: 5 (for 106 messages)

---

## Step 1: System Prompt (Sent with EVERY chunk)

```
You are a Slack community data analyst. Extract actionable insights from community conversations and create presentation-ready content.

CRITICAL INSTRUCTIONS:
1. Follow the exact template structure provided
2. Include interactive Slack thread links: [descriptive text](slack-url)
3. Extract actual quotes and link to source threads
4. Focus on patterns, trends, and actionable insights
5. Output only the markdown template - no preambles or JSON
6. Be concise but comprehensive
```

---

## Step 2: User Prompt Template (Sent with EVERY chunk)

```markdown
# Gambassadors Community Analysis

Analyze this EXACT Slack community data and create presentation content for Amanda's team review. You MUST use the actual data provided - no approximations or estimates.

**CRITICAL REQUIREMENTS:**
1. Count the EXACT number of messages in the data provided
2. Extract the EXACT number of unique users/members
3. Use ONLY the actual Slack URLs provided in the data
4. Quote EXACT text from the messages
5. Include the EXACT message count and user count in your analysis

**Data:** {{PASTE_SLACK_DATA_HERE}}

**ANALYSIS INSTRUCTIONS:**
- Count every message in the data above
- Count every unique user in the data above  
- Extract actual quotes with exact wording
- Use ONLY the Slack URLs provided in the data
- Identify real patterns from the actual messages
- Link to specific threads using the provided URLs

Output markdown only. No JSON. No preambles. Start with # heading. Use \n---\n to separate major sections into cards.

---

# Gambassadors Community Insights
Week of [Date] Snapshot

## Community Overview
[2-3 sentences based on actual message content and themes]

**Activity:** [EXACT message count] messages, [EXACT unique user count] members, top topics: [actual themes from messages]

## What's Resonating 🎯

**Features People Love**
- [Actual feature mentioned]: [Exact quote from message]
- [Another feature]: [Exact quote from message]
- [Feature with link](EXACT_SLACK_URL): [Exact quote and context]
[Use actual examples from the data]

**Success Stories**
- [Actual use case](EXACT_SLACK_URL): [Exact quote about what they built]
- [Another success](EXACT_SLACK_URL): [Exact quote about achievement]
[Use real examples from the data]


---

## What's Challenging 😓

**Recurring Questions**
- [Actual question topic]: [Exact quote of the question]
- [Another question](EXACT_SLACK_URL): [Exact quote and context]
[Use real questions from the data]

**Feature Wishlist**
- [Actual request](EXACT_SLACK_URL): [Exact quote of the request]
- [Another request]: [Exact quote of the need]
[Use real requests from the data]

**Friction Points**
- [Actual issue](EXACT_SLACK_URL): [Exact quote about the problem]
- [Another issue]: [Exact quote about the challenge]
[Use real issues from the data]


---

## Notable Feedback

> "[EXACT QUOTE FROM MESSAGE]" - [Actual User Name], [link](EXACT_SLACK_URL)
> "[EXACT QUOTE FROM MESSAGE]" - [Actual User Name], [link](EXACT_SLACK_URL)
> "[EXACT QUOTE FROM MESSAGE]" - [Actual User Name], [link](EXACT_SLACK_URL)
> "[EXACT QUOTE FROM MESSAGE]" - [Actual User Name], [link](EXACT_SLACK_URL)

[Use actual quotes from the data with real user names and real Slack URLs]

---
*Based on [EXACT message count] messages from [actual date range in data]*
```

---

## Step 3: Data Format (What {{PASTE_SLACK_DATA_HERE}} becomes)

For each chunk of 25 messages:

```
Chunk 1/5 - 25 messages
==================================================
1. 
Channel: gamma-announcements
User: Jon Noronha (Gamma)
Timestamp: 2025-10-01T21:47:35.562Z
Message: Hi everyone,  Today we're rolling out a significant change to our pricing model: we're introducing credits for advanced AI features (beginning with Agent and API), and we've made it possible to buy more credits...
URLs: https://gamma.app/insights/why-were-evolving-our-pricing-model-at-gamma
Slack URL: https://gambassadors.slack.com/archives/C046CNGAR7E/p1759355255562579
---

2. [THREAD REPLY] 
Channel: ideas-and-requests
User: Mariena Quintanilla
Timestamp: 2025-09-30T20:25:35.363Z
Message: Request for Agent.  In addition to the original / modified card it would be great to get a checklist of changes agent made so I can uncheck the items I don't want...
Slack URL: https://gambassadors.slack.com/archives/C04702QJ39N/p1759263935363469?thread_ts=1759263935.363469&cid=C04702QJ39N
Thread Parent: 1759263935.363469
---

[... 23 more messages in the same format ...]

==================================================
```

---

## Step 4: Current Problem

### The Issue:
**The prompt is asking GPT to identify "patterns" and "trends" from only 25 messages at a time.**

This is WHY the analysis feels "random" and "out of context":
1. **Chunk 1** sees 25 messages → finds "pricing changes" as a trend
2. **Chunk 2** sees different 25 messages → finds "Agent bugs" as a trend  
3. **Chunk 3** sees different 25 messages → finds "API integrations" as a trend
4. **Chunk 4** sees different 25 messages → finds random other topics
5. **Chunk 5** sees 6 messages → tries to find patterns

Then we **concatenate all 5 analyses** together with `\n\n---\n\n`, which creates a document that has:
- 5 different "Community Overview" sections
- 5 different "top topics" lists
- 5 different sets of quotes
- NO ACTUAL PATTERN ANALYSIS across the full dataset

### The Aggregation (Current Approach):
```javascript
// We literally just join all the analyses with separators
const combinedAnalysis = results
    .map(result => result.analysis)
    .join('\n\n---\n\n');
```

**This is NOT real analysis** - it's 5 separate mini-analyses that get stitched together.

---

## What GPT-4o Actually Sees Per Chunk:

### Chunk 1 (25 messages):
- Jon Noronha's pricing announcement
- Amanda's survey results  
- Mariena's Agent feature request
- Some bug reports
- Some questions

**GPT thinks:** "Pricing changes seem to be the main topic here"

### Chunk 2 (25 messages):  
- Different bug reports
- More Agent issues
- Different questions
- No pricing discussion

**GPT thinks:** "Agent reliability seems to be the main topic here"

### And so on...

**Result:** Each chunk analysis is contextually isolated and doesn't see the full picture.

---

## Root Causes of "Random" Feeling:

1. **No cross-chunk context**: GPT analyzes 25 messages, not 106
2. **Template forces structure**: Even if chunk only has 5 bug reports, prompt asks for "Features People Love", "Success Stories", etc.
3. **Fake patterns**: With only 25 messages, anything mentioned 2-3 times looks like a "trend"
4. **Quote filling**: Prompt demands quotes, so GPT finds ANY quotes to fill slots, even if not meaningful
5. **No statistical analysis**: Never calculates "X% of messages about Y topic"
6. **Concatenation, not synthesis**: Final output is 5 mini-reports stapled together, not unified analysis

---

## Recommendations for Outside Research:

### Option A: Single-Pass Full Dataset Analysis
Send ALL 106 messages in one prompt to GPT-4o (it has 128K context window, can handle this easily)

### Option B: Two-Stage Analysis
1. **Stage 1**: Analyze each chunk to extract structured data (topics, quotes, links)
2. **Stage 2**: Feed ALL extracted data to a synthesis prompt that does real pattern analysis

### Option C: Statistical Pre-Processing
Before GPT analysis:
1. Count topic frequency across ALL messages
2. Identify most active channels  
3. Find most-discussed threads
4. Then ask GPT to analyze only the TOP patterns with full context

---

## Current Settings:
- **Chunk Size**: 25 messages
- **Model**: gpt-4o  
- **Max Tokens**: 12,000 per response
- **Temperature**: 0.7
- **Context**: Each chunk analyzed independently
- **Aggregation**: Simple concatenation with `\n\n---\n\n`

This explains why Amanda sees analysis that feels "off base" - because it IS. We're analyzing tiny slices and calling it trend analysis.

