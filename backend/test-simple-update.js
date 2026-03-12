import axios from 'axios';

async function testUpdate() {
  console.log('🧪 Testing PUT /api/team/3 with only name and bio...\n');
  
  try {
    const response = await axios.put('http://localhost:5000/api/team/3', {
      name: 'Emmanuel Foka - UPDATED',
      bio: 'This is an updated bio'
    });
    
    console.log('✅ SUCCESS! Member updated');
    console.log('Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('❌ FAILED');
    console.error('Error:', error.response?.data || error.message);
  }
}

testUpdate();
