// Test rapide des endpoints formations avec authentification
// Exécuter avec: node test-formations-auth.js

const baseUrl = 'http://localhost:5000';

async function testEndpoint() {
  console.log('\n🔍 TEST: /api/inscriptions-formations\n');

  // Test 1: Sans token (devrait retourner 401)
  console.log('1️⃣ Test SANS token (attendu: 401)...');
  try {
    const response1 = await fetch(`${baseUrl}/api/inscriptions-formations`);
    console.log(`   Statut: ${response1.status}`);
    if (response1.status === 401) {
      console.log('   ✅ Correct! 401 Unauthorized comme attendu\n');
    } else {
      console.log('   ⚠️  Inattendu: devrait être 401\n');
    }
  } catch (error) {
    console.log(`   ❌ Erreur: ${error.message}\n`);
  }

  // Test 2: Avec un faux token (devrait retourner 401)
  console.log('2️⃣ Test AVEC un faux token (attendu: 401)...');
  try {
    const response2 = await fetch(`${baseUrl}/api/inscriptions-formations`, {
      headers: {
        'Authorization': 'Bearer fake-token-123'
      }
    });
    console.log(`   Statut: ${response2.status}`);
    if (response2.status === 401) {
      console.log('   ✅ Correct! 401 pour token invalide\n');
    }
  } catch (error) {
    console.log(`   ❌ Erreur: ${error.message}\n`);
  }

  // Test 3: Endpoint public formations
  console.log('3️⃣ Test endpoint PUBLIC /api/formations (attendu: 200)...');
  try {
    const response3 = await fetch(`${baseUrl}/api/formations`);
    console.log(`   Statut: ${response3.status}`);
    if (response3.ok) {
      const formations = await response3.json();
      console.log(`   ✅ ${formations.length} formations récupérées!\n`);
    } else {
      console.log(`   ❌ Erreur: ${response3.status}\n`);
    }
  } catch (error) {
    console.log(`   ❌ Erreur: ${error.message}\n`);
  }

  console.log('════════════════════════════════════════════════════════');
  console.log('💡 DIAGNOSTIC:');
  console.log('   Si les tests 1 et 2 retournent 401: Backend OK ✅');
  console.log('   Si le test 3 retourne des formations: Backend OK ✅');
  console.log('   → Le problème est le token JWT du backoffice');
  console.log('   → SOLUTION: Se reconnecter au backoffice');
  console.log('════════════════════════════════════════════════════════\n');
}

// Test de connexion au backend
async function checkBackend() {
  console.log('🔗 Vérification backend sur', baseUrl);
  try {
    const response = await fetch(`${baseUrl}/api/formations`);
    if (response.ok) {
      console.log('✅ Backend accessible\n');
      await testEndpoint();
    } else {
      console.log('❌ Backend répond mais erreur:', response.status);
    }
  } catch (error) {
    console.log('❌ Backend non accessible:', error.message);
    console.log('\n⚠️  Vérifiez que le backend tourne sur le port 5000');
    console.log('   Commande: cd backend && node server.js\n');
  }
}

checkBackend();
