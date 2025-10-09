const axios = require('axios');

async function createWorkingGamma() {
  // Use the exact same format that worked in our test
  const apiKey = 'sk-gamma-FSMPdyYNv0Q0sqL2pdcvWD4vKr4s2A8mafu8vijfdTU';
  
  const payload = {
    inputText: `# Gambassadors Community Insights
Week of October 1-7, 2025

## Community Overview
The Gambassadors community is actively engaging with 104 messages analyzed. Members are discussing features, reporting bugs, and sharing announcements.

**Activity:** 104 messages, 69 active members, top topics: feature requests, bug reports, community introductions

## What's Resonating 🎯

**Features People Love**
- Gamma's AI capabilities for creating engaging content
- API flexibility for customizing outputs  
- Clear communication about pricing changes

**Success Stories**
- Workshop creation using Gamma for educational content
- Social media content with enhanced audience engagement

## What's Challenging 😓

**Recurring Questions**
- API Integration guidance needed
- Image storage issues with edited images
- Pricing model understanding

**Feature Wishlist**
- Custom template import functionality
- Video presentation API
- Improved login functionality

## Notable Feedback

> "Hi everyone, Today we're rolling out a significant change to our pricing model: we're introducing credits for advanced AI features"
> - Jon Noronha (Gamma)

> "I notice than on the Image Model Accepted Values page there is no listing for the Gemini 2.5 flash image model"
> - Don Bachner

## Top Active Channels
- **generate-api-discussion**: 54 messages
- **questions**: 25 messages  
- **bugs**: 12 messages
- **general**: 9 messages

## Most Active Members
- **Max J (Gamma API Support Engineer)**: 7 messages
- **Ibby Syed**: 5 messages
- **Dr. Deepak Bhootra**: 4 messages

---
*Based on 104 messages from October 1-7, 2025*`,
    textMode: 'preserve',
    format: 'presentation',
    numCards: 8
  };
  
  console.log('🚀 Creating Gamma presentation with working format...');
  console.log(`📊 Content length: ${payload.inputText.length} characters`);
  
  try {
    const response = await axios.post('https://public-api.gamma.app/v0.2/generations', payload, {
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': apiKey
      },
      timeout: 60000
    });
    
    console.log('✅ Gamma presentation created successfully!');
    console.log(`🆔 Generation ID: ${response.data.generationId}`);
    
    // Poll for completion
    console.log('⏳ Waiting for presentation to be generated...');
    
    let attempts = 0;
    const maxAttempts = 30; // 5 minutes max
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
      attempts++;
      
      try {
        const statusResponse = await axios.get(`https://public-api.gamma.app/v0.2/generations/${response.data.generationId}`, {
          headers: {
            'X-API-KEY': apiKey,
            'accept': 'application/json'
          }
        });
        
        console.log(`📊 Status check ${attempts}: ${statusResponse.data.status}`);
        
        if (statusResponse.data.status === 'completed') {
          console.log('🎉 SUCCESS!');
          console.log(`🔗 Your Gamma presentation link: ${statusResponse.data.gammaUrl}`);
          console.log(`💳 Credits used: ${statusResponse.data.credits?.deducted || 'Unknown'}`);
          console.log(`💳 Credits remaining: ${statusResponse.data.credits?.remaining || 'Unknown'}`);
          return statusResponse.data.gammaUrl;
        }
        
        if (statusResponse.data.status === 'failed') {
          console.log('❌ Presentation generation failed');
          return null;
        }
        
      } catch (error) {
        console.log(`⚠️ Status check failed: ${error.message}`);
      }
    }
    
    console.log('⏰ Timeout waiting for presentation generation');
    return null;
    
  } catch (error) {
    console.log('❌ Error creating Gamma presentation:');
    console.log('Status:', error.response?.status);
    console.log('Response:', error.response?.data);
    console.log('Error:', error.message);
    return null;
  }
}

createWorkingGamma();
