import axios from 'axios';

async function testUpdate() {
  console.log('🧪 Testing team member updates...\n');
  
  try {
    // First get a team member to see the structure
    console.log('📥 Fetching team members...');
    const getResp = await axios.get('http://localhost:5000/api/team');
    const members = getResp.data;
    console.log(`Found ${members.length} members`);
    
    if (members.length === 0) {
      console.log('❌ No members found');
      return;
    }

    const member = members[0];
    console.log('\n📋 Member to update:');
    console.log(JSON.stringify(member, null, 2));

    // Test update with all fields
    console.log('\n🔄 Updating member...');
    const updateData = {
      name: member.name + ' UPDATED',
      role: 'Updated Role',
      bio: 'Updated bio',
      email: 'updated@test.com',
      phone: '+237 999 999 999',
      description: 'Updated description'
    };

    console.log('Payload:', JSON.stringify(updateData, null, 2));
    
    const putResp = await axios.put(`http://localhost:5000/api/team/${member.id}`, updateData);
    console.log('\n✅ SUCCESS! Member updated');
    console.log('Response:', JSON.stringify(putResp.data, null, 2));
  } catch (error) {
    console.error('\n❌ FAILED');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testUpdate();
