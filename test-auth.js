const fetch = require('node-fetch');

async function testAuth() {
  try {
    console.log('Testing authentication...');
    
    // Test the credentials endpoint directly
    const response = await fetch('http://localhost:3000/api/auth/callback/credentials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@legalplatform.com',
        password: 'Admin@123'
      })
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers));
    
    if (response.redirected) {
      console.log('Redirected to:', response.url);
    }

    const text = await response.text();
    console.log('Response body:', text);

    // Try to get the session
    const sessionResponse = await fetch('http://localhost:3000/api/auth/session');
    const sessionData = await sessionResponse.json();
    console.log('Session data:', sessionData);

  } catch (error) {
    console.error('Test failed:', error);
  }
}

testAuth();