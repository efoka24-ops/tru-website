#!/usr/bin/env node
/**
 * Test Contact Management System
 * Vérifie que tous les endpoints de gestion des contacts fonctionnent correctement
 */

const BASE_URL = 'https://tru-backend-o1zc.onrender.com';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = (color, ...args) => console.log(`${color}${args.join(' ')}${colors.reset}`);

async function test(name, fn) {
  try {
    log(colors.cyan, `\n▶ ${name}...`);
    await fn();
    log(colors.green, `✅ ${name} - SUCCÈS`);
    return true;
  } catch (error) {
    log(colors.red, `❌ ${name} - ERREUR`);
    log(colors.red, `   ${error.message}`);
    return false;
  }
}

let testResults = [];

async function runTests() {
  log(colors.blue, '\n====================================');
  log(colors.blue, '📧 TEST CONTACT MANAGEMENT SYSTEM');
  log(colors.blue, '====================================\n');

  // Test 1: GET /api/contacts
  testResults.push(await test('GET /api/contacts', async () => {
    const response = await fetch(`${BASE_URL}/api/contacts`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error('Expected array response');
    log(colors.cyan, `   Found ${data.length} contacts`);
  }));

  // Test 2: POST /api/contacts
  const testContact = {
    fullName: 'Test User',
    email: 'test@example.com',
    phone: '+237123456789',
    subject: 'Test Subject',
    message: 'This is a test message'
  };

  let testContactId = null;
  testResults.push(await test('POST /api/contacts (Create)', async () => {
    const response = await fetch(`${BASE_URL}/api/contacts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testContact)
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    testContactId = data.id;
    if (!data.id) throw new Error('No ID returned');
    log(colors.cyan, `   Created contact with ID: ${data.id}`);
  }));

  // Test 3: PUT /api/contacts/:id
  testResults.push(await test('PUT /api/contacts/:id (Update)', async () => {
    if (!testContactId) throw new Error('No contact ID from previous test');
    const response = await fetch(`${BASE_URL}/api/contacts/${testContactId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'replied' })
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (data.status !== 'replied') throw new Error('Status not updated');
    log(colors.cyan, `   Updated contact status to: ${data.status}`);
  }));

  // Test 4: POST /api/contacts/reply
  testResults.push(await test('POST /api/contacts/reply', async () => {
    if (!testContactId) throw new Error('No contact ID from previous test');
    const response = await fetch(`${BASE_URL}/api/contacts/reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: testContactId,
        method: 'email',
        message: 'Test reply message'
      })
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (!data.success) throw new Error('Reply not successful');
    log(colors.cyan, `   Reply sent via ${data.contact.replyMethod}`);
  }));

  // Test 5: GET /api/contacts after update
  testResults.push(await test('GET /api/contacts (Verify update)', async () => {
    const response = await fetch(`${BASE_URL}/api/contacts`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    const updated = data.find(c => c.id === testContactId);
    if (!updated) throw new Error('Contact not found after update');
    if (updated.status !== 'replied') throw new Error('Status not updated in DB');
    if (!updated.replyMessage) throw new Error('Reply message not saved');
    log(colors.cyan, `   Verified contact updated with reply`);
  }));

  // Test 6: DELETE /api/contacts/:id
  testResults.push(await test('DELETE /api/contacts/:id', async () => {
    if (!testContactId) throw new Error('No contact ID from previous test');
    const response = await fetch(`${BASE_URL}/api/contacts/${testContactId}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (!data.id) throw new Error('Delete response invalid');
    log(colors.cyan, `   Deleted contact with ID: ${data.id}`);
  }));

  // Test 7: Verify deletion
  testResults.push(await test('GET /api/contacts (Verify deletion)', async () => {
    const response = await fetch(`${BASE_URL}/api/contacts`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    const deleted = data.find(c => c.id === testContactId);
    if (deleted) throw new Error('Contact still exists after deletion');
    log(colors.cyan, `   Verified contact deleted from DB`);
  }));

  // Summary
  log(colors.blue, '\n====================================');
  const passed = testResults.filter(r => r).length;
  const total = testResults.length;
  
  if (passed === total) {
    log(colors.green, `✅ ALL TESTS PASSED (${passed}/${total})`);
  } else {
    log(colors.red, `❌ SOME TESTS FAILED (${passed}/${total} passed)`);
  }
  
  log(colors.blue, '====================================\n');
  
  process.exit(passed === total ? 0 : 1);
}

runTests().catch(error => {
  log(colors.red, '\n🔥 FATAL ERROR:', error.message);
  process.exit(1);
});
