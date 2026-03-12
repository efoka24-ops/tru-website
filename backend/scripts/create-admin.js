/**
 * Script pour créer un utilisateur admin
 * Usage: node scripts/create-admin.js
 */

import { createClient } from '@supabase/supabase-js';
import * as auth from '../lib/auth.js';
import dotenv from 'dotenv';
import * as readline from 'readline';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function createAdmin() {
  console.log('🔐 Création d\'un compte administrateur\n');
  console.log('========================================\n');

  try {
    // Demander les informations
    const name = await question('Nom complet: ');
    const email = await question('Email: ');
    
    console.log('\nOptions de mot de passe:');
    console.log('1. Générer un mot de passe sécurisé automatiquement');
    console.log('2. Choisir mon propre mot de passe');
    const choice = await question('\nVotre choix (1 ou 2): ');

    let password;
    if (choice === '1') {
      password = auth.generateSecurePassword(16);
      console.log(`\n✅ Mot de passe généré: ${password}`);
      console.log('⚠️  Sauvegardez-le dans un endroit sûr!\n');
    } else {
      password = await question('Mot de passe: ');
      
      // Valider le mot de passe
      const validation = auth.validatePassword(password);
      if (!validation.valid) {
        console.log('\n❌ Mot de passe non valide:');
        validation.errors.forEach(err => console.log(`  - ${err}`));
        rl.close();
        process.exit(1);
      }
    }

    // Vérifier si l'admin existe déjà
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      console.log('\n❌ Un utilisateur avec cet email existe déjà');
      rl.close();
      process.exit(1);
    }

    // Hasher le mot de passe
    console.log('\n⏳ Création du compte...');
    const hashedPassword = await auth.hashPassword(password);

    // Créer l'admin
    const { data: newAdmin, error } = await supabase
      .from('users')
      .insert([{
        email,
        password_hash: hashedPassword,
        name,
        role: 'admin',
        active: true
      }])
      .select()
      .single();

    if (error) {
      throw error;
    }

    console.log('\n✅ Compte administrateur créé avec succès!\n');
    console.log('========================================');
    console.log('📧 Email:', email);
    console.log('👤 Nom:', name);
    console.log('🔑 Rôle: Admin');
    console.log('========================================\n');

    if (choice === '1') {
      console.log('⚠️  N\'oubliez pas de sauvegarder votre mot de passe:');
      console.log(`   ${password}\n`);
    }

    console.log('Vous pouvez maintenant vous connecter au backoffice.\n');

  } catch (error) {
    console.error('\n❌ Erreur:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Exécuter
createAdmin();
