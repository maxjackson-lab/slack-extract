require('dotenv').config();

console.log('🔍 Debugging API Key...');
console.log('GAMMA_API_KEY from env:', process.env.GAMMA_API_KEY ? 'Present' : 'Missing');
console.log('GAMMA_API_KEY length:', process.env.GAMMA_API_KEY?.length);
console.log('GAMMA_API_KEY starts with:', process.env.GAMMA_API_KEY?.substring(0, 20));

// Test the exact same call that the GammaClient makes
const axios = require('axios');

async function testExactCall() {
  const apiKey = process.env.GAMMA_API_KEY;
  
  const payload = {
    inputText: '# Test\nThis is a test presentation.',
    textMode: 'preserve',
    format: 'presentation',
    numCards: 3
  };
  
  console.log('📤 Payload:', JSON.stringify(payload, null, 2));
  console.log('🔑 Using API Key:', apiKey?.substring(0, 20) + '...');
  
  try {
    const response = await axios.post('https://public-api.gamma.app/v0.2/generations', payload, {
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': apiKey
      },
      timeout: 60000
    });
    
    console.log('✅ Success!');
    console.log('Response:', response.data);
    
  } catch (error) {
    console.log('❌ Error:');
    console.log('Status:', error.response?.status);
    console.log('Response:', error.response?.data);
  }
}

testExactCall();
