import axios from 'axios';

async function testSettings() {
  console.log('🧪 Test GET /api/settings...\n');
  
  try {
    const response = await axios.get('http://localhost:5000/api/settings');
    console.log('✅ Settings récupérés !');
    console.log('📊 Réponse:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('❌ Erreur:', error.response?.data || error.message);
  }
}

testSettings();
