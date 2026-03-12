import axios from 'axios';

async function checkGetTeam() {
  console.log('🔍 GET /api/team to see actual schema...\n');
  
  try {
    const response = await axios.get('http://localhost:5000/api/team');
    
    if (response.data.length > 0) {
      console.log('✅ Team members:', response.data.length);
      console.log('\n📋 Columns:', Object.keys(response.data[0]));
      console.log('\n📊 First member:');
      console.log(JSON.stringify(response.data[0], null, 2));
    } else {
      console.log('⚠️  No members found');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkGetTeam();
