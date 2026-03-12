import axios from 'axios';

async function testTeamUpdate() {
  console.log('🧪 Test PUT /api/team/3...\n');
  
  try {
    // First get the team member
    const getResponse = await axios.get('http://localhost:5000/api/team');
    const member = getResponse.data.find(m => m.id === 3);
    
    if (!member) {
      console.log('⚠️  Membre ID 3 non trouvé, test avec premier membre');
      const firstMember = getResponse.data[0];
      console.log(`Test avec membre: ${firstMember.name} (ID: ${firstMember.id})`);
      
      // Update first member
      const response = await axios.put(`http://localhost:5000/api/team/${firstMember.id}`, {
        ...firstMember,
        bio: firstMember.bio + ' [UPDATED]'
      });
      
      console.log('✅ Membre mis à jour !');
      console.log('📊 Réponse:', JSON.stringify(response.data, null, 2));
    } else {
      console.log(`Mise à jour du membre: ${member.name}`);
      
      // Update member
      const response = await axios.put('http://localhost:5000/api/team/3', {
        ...member,
        bio: member.bio + ' [TEST UPDATE]'
      });
      
      console.log('✅ Membre mis à jour !');
      console.log('📊 Réponse:', JSON.stringify(response.data, null, 2));
    }
  } catch (error) {
    console.error('❌ Erreur:', error.response?.data || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testTeamUpdate();
