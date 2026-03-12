import axios from 'axios';

async function testContact() {
  console.log('🧪 Test de soumission de contact...\n');
  
  try {
    const response = await axios.post('http://localhost:5000/api/contacts', {
      fullName: 'Test User',
      email: 'test@example.com',
      phone: '+237 600 00 00 00',
      subject: 'Test Subject',
      message: 'This is a test message from test script'
    });
    
    console.log('✅ Contact créé avec succès !');
    console.log('📊 Réponse:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('❌ Erreur:', error.response?.data || error.message);
  }
}

testContact();
