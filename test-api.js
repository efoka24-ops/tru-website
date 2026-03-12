// Test script for API endpoints
import crypto from 'crypto';

// JWT generation (same secret as backend)
function generateJWT(payload, secret = 'tru_jwt_secret_key_2025', expiresIn = '24h') {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };
  
  const now = Date.now();
  const expiresInMs = 24 * 60 * 60 * 1000; // 24 hours
  
  const body = {
    ...payload,
    iat: Math.floor(now / 1000),
    exp: Math.floor((now + expiresInMs) / 1000)
  };
  
  const headerEncoded = Buffer.from(JSON.stringify(header)).toString('base64url');
  const bodyEncoded = Buffer.from(JSON.stringify(body)).toString('base64url');
  
  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${headerEncoded}.${bodyEncoded}`)
    .digest('base64url');
  
  return `${headerEncoded}.${bodyEncoded}.${signature}`;
}

// Generate admin token
const adminToken = generateJWT({
  memberId: 4,
  email: 'emmanuel@trugroup.cm',
  role: 'admin'
});

console.log('Generated Admin Token:', adminToken);
console.log('');

// Test the API endpoint
async function testAPI() {
  try {
    const url = 'http://localhost:5000/api/admin/members';
    console.log('Testing:', url);
    console.log('');
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Response Status:', response.status);
    console.log('Response OK:', response.ok);
    console.log('');
    
    const data = await response.json();
    console.log('Response Data:');
    console.log(JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testAPI();
