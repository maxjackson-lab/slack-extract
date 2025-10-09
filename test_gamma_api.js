const axios = require('axios');

async function testGammaAPI() {
  const apiKey = 'sk-gamma-FSMPdyYNv0Q0sqL2pdcvWD4vKr4s2A8mafu8vijfdTU';
  
  console.log('🔍 Testing Gamma API...');
  console.log(`API Key: ${apiKey.substring(0, 20)}...`);
  
  try {
    // Test with a simple request
    const response = await axios.post('https://public-api.gamma.app/v0.2/generations', {
      inputText: '# Test\nThis is a test presentation.',
      textMode: 'preserve',
      format: 'presentation',
      numCards: 3
    }, {
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ API Key is working!');
    console.log('Response:', response.data);
    
  } catch (error) {
    console.log('❌ API Error:');
    console.log('Status:', error.response?.status);
    console.log('Status Text:', error.response?.statusText);
    console.log('Response Data:', error.response?.data);
    console.log('Full Error:', error.message);
    
    if (error.response?.status === 401) {
      console.log('\n🔍 401 Error Analysis:');
      console.log('- API key might be invalid');
      console.log('- API key might not have the right permissions');
      console.log('- API key format might be wrong');
      console.log('- API endpoint might have changed');
    }
  }
}

testGammaAPI();
