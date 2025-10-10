const axios = require('axios');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function getRefreshToken() {
  console.log('=== Dropbox Refresh Token Setup ===\n');
  
  console.log('To get a refresh token, you need to:');
  console.log('1. Go to your Dropbox App Console: https://www.dropbox.com/developers/apps');
  console.log('2. Select your app');
  console.log('3. Go to the "OAuth 2" tab');
  console.log('4. Note your "App key" (Client ID) and "App secret" (Client Secret)');
  console.log('5. Use the authorization URL below to get a refresh token\n');
  
  const clientId = await question('Enter your Dropbox App Key (Client ID): ');
  const clientSecret = await question('Enter your Dropbox App Secret (Client Secret): ');
  
  console.log('\n=== Authorization URL ===');
  console.log('Copy and paste this URL into your browser:');
  console.log(`https://www.dropbox.com/oauth2/authorize?client_id=${clientId}&response_type=code&token_access_type=offline`);
  console.log('\nAfter authorizing, you\'ll be redirected to a URL with a "code" parameter.');
  console.log('Copy the entire "code" value from the URL.\n');
  
  const authCode = await question('Enter the authorization code from the redirect URL: ');
  
  console.log('\n=== Getting Refresh Token ===');
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
  
  rl.close();
}

getRefreshToken();

