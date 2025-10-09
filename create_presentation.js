const fs = require('fs');

// Read the analysis
const analysis = fs.readFileSync('exports/slack-analysis-2025-10-08.md', 'utf8');

// Create a simple HTML presentation
const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gambassadors Community Insights - Week of October 7, 2025</title>
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
        @media print {
            body { background: white; }
            .slide { box-shadow: none; margin: 0; }
        }
    </style>
</head>
<body>
    <div class="slide">
        <h1>🎯 Gambassadors Community Insights</h1>
        <h2>Week of October 7, 2025 Snapshot</h2>
        
        <div class="stats">
            <div class="stat-card">
                <div class="stat-number">104</div>
                <div class="stat-label">Messages Analyzed</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">69</div>
                <div class="stat-label">Active Members</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">7</div>
                <div class="stat-label">Channels</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">4</div>
                <div class="stat-label">Feature Requests</div>
            </div>
        </div>
    </div>

    <div class="slide">
        <h1>📊 Community Overview</h1>
        <p>The Gambassadors community continues to show strong engagement with 104 messages analyzed. The community is actively discussing features, reporting bugs, and sharing announcements. The energy is positive with members actively contributing to product development discussions.</p>
        
        <h3>Key Activity Metrics</h3>
        <ul>
            <li><strong>104 messages</strong> across 7 channels</li>
            <li><strong>69 active members</strong> participating</li>
            <li><strong>Top topics:</strong> feature requests, bug reports, community introductions</li>
            <li><strong>Strong engagement</strong> from Gamma team members</li>
        </ul>
    </div>

    <div class="slide">
        <h1>🎯 What's Resonating</h1>
        
        <h3>Features People Love</h3>
        <div class="feature-list">
            <ul>
                <li>Community engagement: Strong participation in feature discussions</li>
                <li>Product transparency: Members appreciate announcements and updates</li>
                <li>Support system: Active bug reporting and resolution</li>
            </ul>
        </div>

        <h3>Success Stories</h3>
        <div class="feature-list">
            <ul>
                <li>Active feature request system with detailed user feedback</li>
                <li>Strong community support for product development</li>
                <li>Regular engagement from Gamma team members</li>
            </ul>
        </div>
    </div>

    <div class="slide">
        <h1>😓 What's Challenging</h1>
        
        <h3>Recurring Questions</h3>
        <div class="challenge-list">
            <ul>
                <li>Feature prioritization: Users want clarity on roadmap</li>
                <li>Bug resolution: Some issues need faster turnaround</li>
                <li>Documentation: Need for better guides and tutorials</li>
            </ul>
        </div>

        <h3>Friction Points</h3>
        <div class="challenge-list">
            <ul>
                <li>API authentication issues reported</li>
                <li>Gallery access problems for paid users</li>
                <li>Systemic loading problems in some cases</li>
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
                <li>Strong community engagement with 104 messages from 69 members</li>
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
            <em>Based on 104 messages from October 7, 2025</em>
        </p>
    </div>
</body>
</html>`;

// Save the HTML presentation
fs.writeFileSync('exports/gambassadors-presentation-2025-10-08.html', html);

console.log('✅ Presentation created successfully!');
console.log('📄 File: exports/gambassadors-presentation-2025-10-08.html');
console.log('🌐 You can open this file in your browser to view the presentation');
console.log('📊 The presentation includes 8 slides with community insights, metrics, and recommendations');
