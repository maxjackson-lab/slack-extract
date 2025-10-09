const fs = require('fs');

// Read the GPT-4o analysis
const analysis = fs.readFileSync('exports/slack-analysis-2025-10-08.md', 'utf8');

// Extract the main analysis content (skip the summary stats)
const analysisContent = analysis.split('---\n\n## Analysis Results\n\n')[1];

// Create a beautiful HTML presentation
const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gambassadors Community Insights - Week of October 1-7, 2025</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        .slide {
            background: white;
            border-radius: 12px;
            padding: 40px;
            margin: 20px 0;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            page-break-after: always;
        }
        .slide h1 {
            color: #2c3e50;
            border-bottom: 3px solid #3498db;
            padding-bottom: 10px;
            margin-bottom: 30px;
        }
        .slide h2 {
            color: #34495e;
            margin-top: 30px;
            margin-bottom: 15px;
        }
        .slide h3 {
            color: #7f8c8d;
            margin-top: 25px;
            margin-bottom: 10px;
        }
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin: 20px 0;
        }
        .stat-card {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            border-left: 4px solid #3498db;
        }
        .stat-number {
            font-size: 2em;
            font-weight: bold;
            color: #2c3e50;
        }
        .stat-label {
            color: #7f8c8d;
            margin-top: 5px;
        }
        .feature-list, .challenge-list {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 15px 0;
        }
        .feature-list li {
            margin: 10px 0;
            padding-left: 20px;
            position: relative;
        }
        .feature-list li:before {
            content: "✅";
            position: absolute;
            left: 0;
        }
        .challenge-list li:before {
            content: "⚠️";
            position: absolute;
            left: 0;
        }
        .challenge-list li {
            margin: 10px 0;
            padding-left: 20px;
            position: relative;
        }
        .quote {
            background: #e8f4fd;
            border-left: 4px solid #3498db;
            padding: 15px;
            margin: 15px 0;
            font-style: italic;
        }
        .channel-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 15px;
            margin: 20px 0;
        }
        .channel-card {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #e74c3c;
        }
        .user-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin: 20px 0;
        }
        .user-card {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #27ae60;
        }
        a {
            color: #3498db;
            text-decoration: none;
        }
        a:hover {
            text-decoration: underline;
        }
        .highlight {
            background: #fff3cd;
            padding: 2px 4px;
            border-radius: 3px;
        }
        @media print {
            body { background: white; }
            .slide { box-shadow: none; margin: 0; }
        }
    </style>
</head>
<body>
    <div class="slide">
        <h1>🎯 Gambassadors Community Insights</h1>
        <h2>Week of October 1-7, 2025 Snapshot</h2>
        
        <div class="stats">
            <div class="stat-card">
                <div class="stat-number">104</div>
                <div class="stat-label">Messages Analyzed</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">5</div>
                <div class="stat-label">Analysis Chunks</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">25,915</div>
                <div class="stat-label">GPT-4o Tokens</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">78.91s</div>
                <div class="stat-label">Processing Time</div>
            </div>
        </div>
    </div>

    <div class="slide">
        <h1>📊 Community Overview</h1>
        <p>The Gambassadors community is actively engaging with both new feature requests and adjustments to recent changes. Members are collaboratively troubleshooting and providing constructive feedback.</p>
        
        <h3>Key Activity Metrics</h3>
        <ul>
            <li><strong>104 messages</strong> analyzed across multiple channels</li>
            <li><strong>Active engagement</strong> with feature requests and API usage</li>
            <li><strong>Top topics:</strong> feature requests, API usage, pricing model changes</li>
            <li><strong>Collaborative troubleshooting</strong> and constructive feedback</li>
        </ul>
    </div>

    <div class="slide">
        <h1>🎯 What's Resonating</h1>
        
        <h3>Features People Love</h3>
        <div class="feature-list">
            <ul>
                <li>Gamma's AI capabilities: Users appreciate the advanced AI features for creating engaging content</li>
                <li>API flexibility: Members are utilizing Gamma's API to customize outputs, enhancing user experience</li>
                <li><a href="https://gambassadors.slack.com/archives/C046CNGAR7E/p1759355255562579">Pricing model explanation</a>: Clear communication from Gamma about pricing changes is valued</li>
            </ul>
        </div>

        <h3>Success Stories</h3>
        <div class="feature-list">
            <ul>
                <li><a href="https://gambassadors.slack.com/archives/C046A6SDT3M/p1759745015275429">Workshop creation</a>: Using Gamma for educational content</li>
                <li><a href="https://gambassadors.slack.com/archives/C046A6SDT3M/p1759702615159059">Social media content</a>: Enhanced audience engagement through Gamma's tools</li>
            </ul>
        </div>
    </div>

    <div class="slide">
        <h1>😓 What's Challenging</h1>
        
        <h3>Recurring Questions</h3>
        <div class="challenge-list">
            <ul>
                <li>API Integration: Users frequently seek guidance on customizing API outputs for specific use cases</li>
                <li><a href="https://gambassadors.slack.com/archives/C05BT88C8JF/p1759439173811049">Image storage issues</a>: Challenges with storing edited images</li>
                <li>Pricing model understanding: Clarification needed on new credit-based system</li>
            </ul>
        </div>

        <h3>Feature Wishlist</h3>
        <div class="challenge-list">
            <ul>
                <li><a href="https://gambassadors.slack.com/archives/C08SC8025PT/p1759744712642309">Custom template import</a>: Users desire more flexibility in template customization</li>
                <li>Video presentation API: Request for video content conversion into structured presentations</li>
                <li><a href="https://gambassadors.slack.com/archives/C05BT88C8JF/p1759499238004209">Improved login functionality</a>: Issues with Google Sign-in process</li>
            </ul>
        </div>

        <h3>Friction Points</h3>
        <div class="challenge-list">
            <ul>
                <li>Credit usage transparency: Users express confusion over credit consumption rates</li>
                <li><a href="https://gambassadors.slack.com/archives/C05BT88C8JF/p1759439674784999">Access to gallery items</a>: Frustration due to limited access impacting workflow</li>
            </ul>
        </div>
    </div>

    <div class="slide">
        <h1>💬 Notable Feedback</h1>
        
        <div class="quote">
            "Hi everyone, Today we're rolling out a significant change to our pricing model: we're introducing credits for advanced AI features (beginning with Agent and API), and we've made it possible to buy more credits."
            <br><strong>- Jon Noronha (Gamma)</strong>
        </div>

        <div class="quote">
            "I notice than on the Image Model Accepted Values page there is no listing for the Gemini 2.5 flash image model (nano-banana). Is this just not available?"
            <br><strong>- Don Bachner</strong>
        </div>

        <div class="quote">
            "API Update: Major Limits Increase & New Features - Big changes for our API users today: 50 presentations per hour - we've moved from daily to hourly limits!"
            <br><strong>- Gamma Team</strong>
        </div>
    </div>

    <div class="slide">
        <h1>📈 Top Active Channels</h1>
        
        <div class="channel-grid">
            <div class="channel-card">
                <h4>generate-api-discussion</h4>
                <div class="stat-number">54</div>
                <div class="stat-label">messages</div>
            </div>
            <div class="channel-card">
                <h4>questions</h4>
                <div class="stat-number">25</div>
                <div class="stat-label">messages</div>
            </div>
            <div class="channel-card">
                <h4>bugs</h4>
                <div class="stat-number">12</div>
                <div class="stat-label">messages</div>
            </div>
            <div class="channel-card">
                <h4>general</h4>
                <div class="stat-number">9</div>
                <div class="stat-label">messages</div>
            </div>
        </div>
    </div>

    <div class="slide">
        <h1>👥 Most Active Members</h1>
        
        <div class="user-grid">
            <div class="user-card">
                <h4>Max J (Gamma API Support Engineer)</h4>
                <div class="stat-number">7</div>
                <div class="stat-label">messages</div>
            </div>
            <div class="user-card">
                <h4>Ibby Syed</h4>
                <div class="stat-number">5</div>
                <div class="stat-label">messages</div>
            </div>
            <div class="user-card">
                <h4>Dr. Deepak Bhootra</h4>
                <div class="stat-number">4</div>
                <div class="stat-label">messages</div>
            </div>
            <div class="user-card">
                <h4>CEO Pro AI</h4>
                <div class="stat-number">4</div>
                <div class="stat-label">messages</div>
            </div>
            <div class="user-card">
                <h4>Chowderr Miller</h4>
                <div class="stat-number">4</div>
                <div class="stat-label">messages</div>
            </div>
        </div>
    </div>

    <div class="slide">
        <h1>📋 Summary & Next Steps</h1>
        
        <h3>Key Takeaways</h3>
        <div class="feature-list">
            <ul>
                <li>Strong community engagement with 104 messages analyzed</li>
                <li>API discussions dominate activity (54 messages in generate-api-discussion)</li>
                <li>Active bug reporting and feature request system working well</li>
                <li>Gamma team actively participating and providing updates</li>
            </ul>
        </div>

        <h3>Recommended Actions</h3>
        <div class="challenge-list">
            <ul>
                <li>Address API authentication issues promptly</li>
                <li>Improve documentation for Gemini 2.5 flash model</li>
                <li>Consider dedicated Slack channel for Agent feature</li>
                <li>Continue transparent communication about pricing changes</li>
            </ul>
        </div>

        <p style="text-align: center; margin-top: 40px; color: #7f8c8d;">
            <em>Generated with GPT-4o analysis • Based on 104 messages from October 1-7, 2025</em>
        </p>
    </div>
</body>
</html>`;

// Save the HTML presentation
fs.writeFileSync('exports/gambassadors-gpt4o-analysis-2025-10-08.html', html);

console.log('✅ GPT-4o Analysis Presentation created successfully!');
console.log('📄 File: exports/gambassadors-gpt4o-analysis-2025-10-08.html');
console.log('🌐 You can open this file in your browser to view the presentation');
console.log('📊 The presentation includes 8 slides with GPT-4o generated insights');
console.log('🔗 All Slack links are preserved and clickable');
