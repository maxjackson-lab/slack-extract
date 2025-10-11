"use strict";
/**
 * Experimental Channel Activity Prompt
 *
 * This prompt asks GPT-4o to provide thematic analysis of channel activity
 * instead of single "key discussion" examples.
 *
 * Toggle with: USE_EXPERIMENTAL_CHANNEL_PROMPT=true
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CHANNEL_ACTIVITY_PROMPT = void 0;
exports.CHANNEL_ACTIVITY_PROMPT = `
## Channel Activity 📍

**IMPORTANT: For each major channel, show THEMATIC PATTERNS, not just one example thread.**

**For each of the top 3 channels by volume:**

**[Channel Name]** ([X] msgs, [Y]% of total)
- [Z] active users engaged this week  
- [B] thread replies ([C]% threading rate)

**Key Themes in this Channel:**

• **[Theme Name]** ([X] msgs, [Y] users)
  - One sentence explaining what this theme is about
  - Examples: [Username: "short quote excerpt"](actual-slack-url), [Username2: "quote"](url)
  
• **[Theme Name 2]** ([X] msgs, [Y] users)
  - One sentence explaining what this theme is about
  - Examples: [Username: "quote"](url), [Username2: "quote"](url)

[List 2-4 themes per channel based on what's actually discussed]

**REQUIREMENTS:**
- A "theme" requires 2+ messages from 2+ users discussing similar topics
- Provide actual message counts and user counts per theme
- Use REAL usernames and ACTUAL Slack URLs from the data
- Give 2-3 example quotes per theme with links
- Themes should show patterns, not isolated messages
- If a channel has <5 messages, just show basic stats without forcing themes

---
`;
//# sourceMappingURL=channel-themes-experimental.js.map