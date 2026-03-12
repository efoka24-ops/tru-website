import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ SUPABASE_URL ou SUPABASE_KEY manquant dans .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Hash pré-généré pour le mot de passe "Admin@TRU2026!"
const passwordHash = '$2b$10$l5G3E4a6iiuTOVapY8mKeOrGMgVABkE5A6I.scXpNmOXSYGw1awB6';

async function createAdmin() {
  try {
    console.log('🔄 Création du compte admin dans Supabase...');
    console.log('   Email: adminfoka@trugroup.com');
    console.log('   Mot de passe: Admin@TRU2026!');
    
    // Vérifier si l'utilisateur existe déjà
    const { data: existing } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'adminfoka@trugroup.com')
      .single();
    
    if (existing) {
      console.log('⚠️  Un compte admin existe déjà');
      console.log('🔄 Mise à jour du mot de passe...');
      
      const { error: updateError } = await supabase
        .from('users')
        .update({
          password_hash: passwordHash,
          role: 'admin',
          active: true,
          updated_at: new Date().toISOString()
        })
        .eq('email', 'adminfoka@trugroup.com');
      
      if (updateError) {
        throw updateError;
      }
      
      console.log('✅ Mot de passe mis à jour !');
    } else {
      // Créer le compte
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          email: 'adminfoka@trugroup.com',
          password_hash: passwordHash,
          name: 'Admin Foka',
          role: 'admin',
          active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      if (insertError) {
        throw insertError;
      }
      
      console.log('✅ Compte admin créé avec succès !');
    }
    
    console.log('\n📋 IDENTIFIANTS :');
    console.log('   Email: adminfoka@trugroup.com');
    console.log('   Mot de passe: Admin@TRU2026!');
    console.log('\n🔗 Connexion: http://localhost:5000/api/auth/login');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

createAdmin();
