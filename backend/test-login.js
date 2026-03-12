// Test de connexion avec les identifiants Supabase
import axios from 'axios';

const testLogin = async () => {
  try {
    console.log('🧪 Test de connexion à', 'http://localhost:5000/api/auth/login');
    
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'adminfoka@trugroup.com',
      password: 'Admin@TRU2026!'
    });
    
    console.log('✅ Connexion réussie !');
    console.log('📊 Réponse:', JSON.stringify(response.data, null, 2));
    console.log('🔑 Token:', response.data.token?.substring(0, 50) + '...');
    console.log('👤 User:', response.data.user?.email);
    
  } catch (error) {
    console.error('❌ Erreur de connexion:');
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Message:', error.response.data?.error || error.response.data);
    } else {
      console.error('   ', error.message);
    }
    process.exit(1);
  }
};

testLogin();
