/**
 * Experimental Channel Activity Prompt
 *
 * This prompt asks GPT-4o to provide thematic analysis of channel activity
 * instead of single "key discussion" examples.
 *
 * Toggle with: USE_EXPERIMENTAL_CHANNEL_PROMPT=true
 */
export declare const CHANNEL_ACTIVITY_PROMPT = "\n## Channel Activity \uD83D\uDCCD\n\n**IMPORTANT: For each major channel, show THEMATIC PATTERNS, not just one example thread.**\n\n**For each of the top 3 channels by volume:**\n\n**[Channel Name]** ([X] msgs, [Y]% of total)\n- [Z] active users engaged this week  \n- [B] thread replies ([C]% threading rate)\n\n**Key Themes in this Channel:**\n\n\u2022 **[Theme Name]** ([X] msgs, [Y] users)\n  - One sentence explaining what this theme is about\n  - Examples: [Username: \"short quote excerpt\"](actual-slack-url), [Username2: \"quote\"](url)\n  \n\u2022 **[Theme Name 2]** ([X] msgs, [Y] users)\n  - One sentence explaining what this theme is about\n  - Examples: [Username: \"quote\"](url), [Username2: \"quote\"](url)\n\n[List 2-4 themes per channel based on what's actually discussed]\n\n**REQUIREMENTS:**\n- A \"theme\" requires 2+ messages from 2+ users discussing similar topics\n- Provide actual message counts and user counts per theme\n- Use REAL usernames and ACTUAL Slack URLs from the data\n- Give 2-3 example quotes per theme with links\n- Themes should show patterns, not isolated messages\n- If a channel has <5 messages, just show basic stats without forcing themes\n\n---\n";
//# sourceMappingURL=channel-themes-experimental.d.ts.map