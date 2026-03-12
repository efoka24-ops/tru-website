import axios from 'axios';

async function testMinimalUpdate() {
  console.log('🧪 Test minimal PUT /api/team/3...\n');
  
  try {
    // Update with only name and title
    const response = await axios.put('http://localhost:5000/api/team/3', {
      name: 'Emmanuel Foka TEST',
      title: 'Test Title',
      bio: 'Test bio update'
    });
    
    console.log('✅ Update successful!');
    console.log('📊 Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    if (error.response) {
      console.error('\nFull error:');
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testMinimalUpdate();
