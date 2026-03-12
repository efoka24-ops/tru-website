import axios from 'axios';

async function getTeamSchema() {
  console.log('🔍 Getting team data to see schema...\n');
  
  try {
    const response = await axios.get('http://localhost:5000/api/team');
    
    if (response.data.length > 0) {
      console.log('✅ Team members found:', response.data.length);
      console.log('\n📋 Columns in first member:');
      console.log(Object.keys(response.data[0]));
      console.log('\n📊 First member:');
      console.log(JSON.stringify(response.data[0], null, 2));
    } else {
      console.log('⚠️  No team  members found');
    }
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

getTeamSchema();
