/**
 * Experimental Channel Themes Prompt
 * 
 * This file contains an experimental prompt format for channel activity analysis
 * that focuses on thematic patterns rather than single key discussions.
 * 
 * To use this experimental prompt, set USE_EXPERIMENTAL_CHANNEL_PROMPT=true in your .env file.
 * This file can be safely deleted if the experimental format is not desired.
 */

export const EXPERIMENTAL_CHANNEL_ACTIVITY_PROMPT = `## Channel Activity 📍

**Top Channels by Volume:**

**1. [Channel Name]** ([X] msgs, [Y]% of total)
- [Z] active users engaged this week  
- [B] thread replies ([C]% threading rate)

**Key Themes:**
• **[Theme 1]** ([X] msgs, [Y] users)
  - [Brief explanation of the theme]
  - Examples: [User: "Quote"](link), [User: "Another quote"](link)

• **[Theme 2]** ([X] msgs, [Y] users)
  - [Brief explanation of the theme]
  - Examples: [User: "Quote"](link), [User: "Another quote"](link)

**2. [Channel Name]** ([X] msgs, [Y]% of total)
- [Z] active users engaged this week  
- [B] thread replies ([C]% threading rate)

**Key Themes:**
• **[Theme 1]** ([X] msgs, [Y] users)
  - [Brief explanation of the theme]
  - Examples: [User: "Quote"](link), [User: "Another quote"](link)

• **[Theme 2]** ([X] msgs, [Y] users)
  - [Brief explanation of the theme]
  - Examples: [User: "Quote"](link), [User: "Another quote"](link)

**CRITICAL - Statistical Requirements:**
1. **START with PRE-CALCULATED TOPIC DISTRIBUTION (BASELINE)** from the data above
2. **Use EXACT numbers** from baseline for themes that match those categories
3. **Emerging themes allowed** - you MAY identify themes not in baseline IF:
   - You can cite 4+ messages from raw data
   - They come from 2+ different users  
   - You manually count and show your work
   - The theme is coherent and verifiable
4. **Minimum threshold**: 4+ messages to be a theme, otherwise it's a Notable Highlight
5. **Account for all messages**: Your themes (baseline + emerging) should roughly cover most messages

**Hybrid Theme Detection Process:**
Step 1: Check "Topic Distribution (Community) - BASELINE CATEGORIES" - use those with EXACT stats
Step 2: Review raw message data for repeated patterns/concepts not captured in baseline
Step 3: For emerging themes, manually count messages and verify against raw data
Step 4: Count unique usernames discussing this theme (must be 2+ for themes)

**Anti-Hallucination Checklist (Answer for EACH theme):**
- [ ] Did I count actual messages from the raw data? (YES/NO)
- [ ] If in Baseline Topics, do my numbers EXACTLY match? (YES/NO/N/A)
- [ ] If NOT in Baseline Topics, did I manually count 4+ messages? (YES/NO/N/A)
- [ ] Can I cite at least 2 real user quotes with links? (YES/NO)
- [ ] Are there 2+ different users discussing this? (YES/NO)

**Cross-Check Examples:**

*Example 1: Theme from Baseline Topics*
\`\`\`
Baseline Topic Distribution: "API Integration: 15 msgs (23%) across channels: generate-api-discussion"
Your Channel Theme: "API Integration (15 msgs, 8 users)"
✅ CORRECT - matches baseline stat, counted unique users from raw data
\`\`\`

*Example 2: Emerging Theme NOT in Baseline*
\`\`\`
Baseline Topics don't list "Security Concerns" but raw data shows:
- Message 12: Jordan asks about "enterprise security features" 
- Message 23: Alex mentions "data encryption"
- Message 45: Taylor discusses "SOC2 compliance"
- Message 67: Morgan asks about "SSO integration"
Your Channel Theme: "Security Concerns (4 msgs, 4 users)"
✅ CORRECT - emerging theme with manual count verified from raw data
\`\`\`

*Example 3: WRONG - Made up numbers*
\`\`\`
Baseline Topic Distribution: "API Integration: 15 msgs (23%)"
Your Channel Theme: "API Integration (20 msgs, 10 users)"
❌ WRONG - doesn't match baseline stat, you made up numbers
\`\`\`

*Example 4: WRONG - Not enough messages*
\`\`\`
Your Channel Theme: "Video Features (2 msgs, 2 users)"
❌ WRONG - only 2 messages, doesn't meet 4+ threshold, should be a Notable Highlight instead
\`\`\`

**Instructions for Analysis:**
1. **Identify 2-3 main themes** per channel (not just one discussion)
2. **Group related messages** by topic/theme rather than individual threads
3. **Count messages and users** for each theme
4. **Provide 2-3 real examples** with quotes and links for each theme
5. **Focus on patterns** that show what the community is discussing most
6. **Use actual user quotes** from the data, not summaries

**Format Requirements:**
- Each theme should have a clear name in bold
- Include message count and user count in parentheses
- Provide 2-3 real examples with user quotes and message links
- Keep theme descriptions brief but descriptive
- Focus on what the community is actually discussing, not what you think they should discuss
- Label themes as "[Baseline]" or "[Emerging - verified from raw data]"

---
`;
