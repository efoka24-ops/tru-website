/**
 * Script rapide pour hasher un mot de passe
 * Usage: node scripts/hash-password.js
 */

import bcrypt from 'bcrypt';
import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function hashPasswordInteractive() {
  console.log('🔐 Hashage de mot de passe\n');
  
  const password = await question('Entrez le mot de passe à hasher: ');
  
  console.log('\n⏳ Hashage en cours...');
  const hash = await bcrypt.hash(password, 10);
  
  console.log('\n✅ Hash généré:\n');
  console.log(hash);
  console.log('\n📋 SQL à copier dans Supabase:\n');
  console.log(`INSERT INTO users (email, password_hash, name, role, active)`);
  console.log(`VALUES ('votre@email.com', '${hash}', 'Nom Admin', 'admin', true);`);
  console.log('');
  
  rl.close();
}

// Variante directe avec mot de passe en argument
async function hashPasswordDirect(password) {
  const hash = await bcrypt.hash(password, 10);
  console.log('Hash:', hash);
}

// Si mot de passe passé en argument
if (process.argv[2]) {
  hashPasswordDirect(process.argv[2]);
} else {
  hashPasswordInteractive();
}
