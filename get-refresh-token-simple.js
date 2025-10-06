const axios = require('axios');

async function getRefreshToken() {
  const clientId = '354va9rikzidlfr';
  const clientSecret = '3epzlacg2zuxls0';
  
  console.log('=== Dropbox Refresh Token Setup ===\n');
  
  console.log('Your Dropbox App Credentials:');
  console.log(`Client ID: ${clientId}`);
  console.log(`Client Secret: ${clientSecret}\n`);
  
  console.log('=== Authorization URL ===');
  console.log('Copy and paste this URL into your browser:');
  console.log(`https://www.dropbox.com/oauth2/authorize?client_id=${clientId}&response_type=code&token_access_type=offline`);
  console.log('\nAfter authorizing, you\'ll be redirected to a URL with a "code" parameter.');
  console.log('Copy the entire "code" value from the URL.\n');
  
  // For now, let's just show the URL and instructions
  console.log('=== Next Steps ===');
  console.log('1. Visit the authorization URL above');
  console.log('2. Authorize the app');
  console.log('3. Copy the "code" from the redirect URL');
  console.log('4. Run this command with your code:');
  console.log(`   node -e "require('./get-refresh-token-simple.js').exchangeCode('YOUR_CODE_HERE')"`);
}

async function exchangeCode(authCode) {
  const clientId = '354va9rikzidlfr';
  const clientSecret = '3epzlacg2zuxls0';
  
  console.log('=== Getting Refresh Token ===');
  console.log('Exchanging authorization code for refresh token...');
  
  try {
    const response = await axios.post('https://api.dropboxapi.com/oauth2/token', {
      grant_type: 'authorization_code',
      code: authCode,
      client_id: clientId,
      client_secret: clientSecret
    }, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    const { access_token, refresh_token } = response.data;
    
    console.log('\n✅ Success! Here are your tokens:');
    console.log('\n=== Add these to your .env file ===');
    console.log(`DROPBOX_ACCESS_TOKEN=${access_token}`);
    console.log(`DROPBOX_REFRESH_TOKEN=${refresh_token}`);
    console.log(`DROPBOX_CLIENT_ID=${clientId}`);
    console.log(`DROPBOX_CLIENT_SECRET=${clientSecret}`);
    console.log('\nNote: The access token will expire in ~4 hours, but the refresh token will automatically get new ones.');
    
  } catch (error) {
    console.log('\n❌ Error getting refresh token:');
    console.log('Error:', error.response?.data || error.message);
    console.log('\nMake sure:');
    console.log('1. Your app has the correct permissions');
    console.log('2. The authorization code is correct');
    console.log('3. The client ID and secret are correct');
  }
}

// Export the function for command line use
module.exports = { exchangeCode };

// Run the main function if called directly
if (require.main === module) {
  getRefreshToken();
}
