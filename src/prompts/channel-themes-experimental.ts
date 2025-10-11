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

**Instructions for Analysis:**
1. **Identify 2-3 main themes** per channel (not just one discussion)
2. **Group related messages** by topic/theme rather than individual threads
3. **Count messages and users** for each theme
4. **Provide 2-3 real examples** with quotes and links for each theme
5. **Focus on patterns** that show what the community is discussing most
6. **Use actual user quotes** from the data, not summaries

**Example Theme Categories:**
- Feature Requests, Bug Reports, API Integration, Pricing/Credits, General Discussion, Template/Themes, etc.

**Format Requirements:**
- Each theme should have a clear name in bold
- Include message count and user count in parentheses
- Provide 2-3 real examples with user quotes and message links
- Keep theme descriptions brief but descriptive
- Focus on what the community is actually discussing, not what you think they should discuss

---
`;
